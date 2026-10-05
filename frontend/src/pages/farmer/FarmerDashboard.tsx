import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Plus,
  Play,
  Pause,
  AlertOctagon,
  Trash2,
  Edit,
  Check,
  X,
  MapPin,
  Crosshair,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Product, Order, UserProfile, Category, Farm } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { AddProduceModal } from './AddProduceModal';
import { MapLocationPicker } from '../../components/MapLocationPicker';
import { api } from '../../services/api';

interface FarmerDashboardProps {
  currentProfile: UserProfile | null;
  products: Product[];
  orders: Order[];
  categories: Category[];
  lang: Language;
  onRefresh: () => void;
  onAcceptOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string, reason?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onTogglePause: (productId: string) => void;
  onMarkSoldOut: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentProfile,
  products,
  orders,
  categories,
  lang,
  onRefresh,
  onAcceptOrder,
  onRejectOrder,
  onUpdateOrderStatus,
  onTogglePause,
  onMarkSoldOut,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'location'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Crop unavailable due to sudden rain');
  
  // Farm Location State
  const [farm, setFarm] = useState<Farm | null>(null);
  const [farmLat, setFarmLat] = useState<number>(10.5982);
  const [farmLon, setFarmLon] = useState<number>(76.9721);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    async function loadFarm() {
      try {
        const farmData = await api.getMyFarm();
        setFarm(farmData);
        setFarmLat(farmData.latitude);
        setFarmLon(farmData.longitude);
        setGpsAccuracy(farmData.gps_accuracy);
      } catch (err) {
        console.error('Failed to load farm details', err);
      }
    }
    loadFarm();
  }, [currentProfile]);

  const handleSaveFarmLocation = async () => {
    if (!farm) return;
    setIsUpdatingLocation(true);
    try {
      const updated = await api.updateFarmLocation(farm.id, {
        latitude: farmLat,
        longitude: farmLon,
        gps_accuracy: gpsAccuracy,
        is_approximate: farm.is_approximate,
        village: farm.village,
        district: farm.district,
        pincode: farm.pincode,
        farm_address: farm.farm_address,
      });
      setFarm(updated);
      setLocationSuccessMsg('Farm GPS coordinates updated successfully! Products are now discovered at this location.');
      setTimeout(() => setLocationSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDetectNewGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFarmLat(pos.coords.latitude);
        setFarmLon(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
      },
      (err) => alert('Could not retrieve GPS coordinates. Drag pin to adjust manually.')
    );
  };

  // Farmer specific data
  const myProducts = products.filter((p) => p.farmer_id === currentProfile?.id);
  const myOrders = orders.filter((o) => o.farmer_id === currentProfile?.id);

  const pendingOrders = myOrders.filter((o) => o.status === 'pending_farmer_confirmation');
  const completedOrders = myOrders.filter((o) => o.status === 'completed');

  const totalEarnings = myOrders
    .filter((o) => o.status === 'completed' || o.status === 'accepted' || o.status === 'ready_for_pickup')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8E3] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentProfile?.avatar_path || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1F6B45]/20 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#202820]">
                {currentProfile?.display_name || 'Farmer Portal'}
              </h1>
              <span className="badge-verified">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Farmer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#68736B] mt-0.5">
              {farm?.farm_name || 'Thennam Thoppu Natural Farm'} • {farm?.village || 'Pollachi'}, {farm?.district || 'Coimbatore'} • GPS: {farmLat.toFixed(4)}, {farmLon.toFixed(4)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs sm:text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          {t.add_produce_btn}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
          <div className="flex items-center justify-between text-[#68736B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-[#1F6B45]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1F6B45]">
            ₹{totalEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">100% direct farmer payout</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
          <div className="flex items-center justify-between text-[#68736B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
            <Package className="w-4 h-4 text-[#3C9B62]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {myProducts.filter((p) => p.status === 'active').length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Discoverable by nearby consumers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
          <div className="flex items-center justify-between text-[#68736B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-[#E7A83E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E7A83E]">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Requires confirmation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
          <div className="flex items-center justify-between text-[#68736B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {completedOrders.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Delivered successfully</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8E3] space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition-colors ${
            activeTab === 'inventory'
              ? 'border-b-2 border-[#1F6B45] text-[#1F6B45]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Harvest Inventory ({myProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#1F6B45] text-[#1F6B45]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Incoming Orders ({myOrders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="bg-[#E7A83E] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'location'
              ? 'border-b-2 border-[#1F6B45] text-[#1F6B45]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Farm Location & GPS
        </button>
      </div>

      {/* Tab 1: Inventory Table with Delete action */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Active Field Produce</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-secondary text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Produce
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAFBF7] text-[#68736B] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-4">Produce</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Available Stock</th>
                  <th className="p-4">Fulfilment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No produce listed yet. Click "Add New Harvest" to publish your first produce.
                    </td>
                  </tr>
                ) : (
                  myProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image_paths[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{p.name}</div>
                            {p.name_ta && <div className="text-[11px] text-gray-500">{p.name_ta}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-black text-[#1F6B45]">
                        ₹{p.price.toFixed(2)} <span className="text-xs text-gray-500 font-normal">/ {p.unit}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-800">
                          {p.available_quantity} {p.unit}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {p.fulfilment_options.map((m) => (
                            <span key={m} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'paused'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => onTogglePause(p.id)}
                          title={p.status === 'active' ? 'Pause Listing' : 'Resume Listing'}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
                        >
                          {p.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onMarkSoldOut(p.id)}
                          title="Mark Sold Out"
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-amber-600"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete listing for ${p.name}?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          title="Delete Listing"
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Incoming Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8E3] text-gray-500">
              No orders received yet. Once buyers order from your listings, they will appear here.
            </div>
          ) : (
            myOrders.map((ord) => {
              const isPending = ord.status === 'pending_farmer_confirmation';
              const isAccepted = ord.status === 'accepted';
              const isPreparing = ord.status === 'preparing';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8E3] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-base">
                          Order #{ord.order_number}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                          {ord.fulfilment_type === 'delivery' ? '🛵 Delivery' : '🚜 Farm Pickup'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Buyer: {ord.buyer_name || 'Customer'} • Delivery Slot: {ord.delivery_slot || 'Morning'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          isPending
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-base font-black text-[#1F6B45]">
                        ₹{ord.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-800 font-medium">
                          {it.quantity} {it.unit_snapshot} × {it.product_name_snapshot}
                        </span>
                        <span className="font-bold text-gray-900">₹{it.line_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#E2E8E3] text-xs text-gray-600 flex items-start gap-2">
                    <Truck className="w-4 h-4 text-[#1F6B45] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Destination:</strong> {ord.delivery_address || 'Pollachi Central'} • Phone: {ord.delivery_contact_phone || '+91 97890 XXXXX'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectingOrderId(ord.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onAcceptOrder(ord.id)}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1F6B45] hover:bg-[#175436] shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Accept & Reserve Stock
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                        className="btn-secondary text-xs py-2 px-4"
                      >
                        Start Harvest & Packing
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'ready_for_pickup')}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        Mark Ready for Dispatch
                      </button>
                    )}

                    {ord.status === 'ready_for_pickup' && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready for pickup by delivery partner / buyer
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Farm Location & GPS Management */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8E3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1F6B45]" />
                Farm Location & Geographic Map Setting
              </h3>
              <p className="text-xs text-gray-500">
                Your farm GPS coordinates are automatically attached to all listed products for consumer distance calculations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDetectNewGps}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Detect GPS Position
              </button>
              <button
                type="button"
                disabled={isUpdatingLocation}
                onClick={handleSaveFarmLocation}
                className="btn-primary text-xs py-2 px-4"
              >
                {isUpdatingLocation ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </div>

          {locationSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              {locationSuccessMsg}
            </div>
          )}

          <div className="space-y-3">
            <MapLocationPicker
              latitude={farmLat}
              longitude={farmLon}
              accuracy={gpsAccuracy}
              isDraggable={true}
              onLocationChange={(newLat, newLon) => {
                setFarmLat(newLat);
                setFarmLon(newLon);
              }}
              height="380px"
              title={farm?.farm_name || 'Farm Grove Location'}
            />

            <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 px-1">
              <span>
                Coordinates: <strong>{farmLat.toFixed(6)} N, {farmLon.toFixed(6)} E</strong>
                {gpsAccuracy && ` (Accuracy: ~${gpsAccuracy}m)`}
              </span>
              <span className="text-gray-500">Drag marker pin to set the exact packing/farm gate location</span>
            </div>
          </div>

          <div className="bg-[#FAFBF7] p-4 rounded-2xl border border-[#E2E8E3] text-xs space-y-1">
            <span className="font-bold text-gray-800">Saved Farm Address:</span>
            <p className="text-gray-600">
              {farm?.farm_address || 'Farm gate location'}, {farm?.village || 'Pollachi'}, {farm?.district || 'Coimbatore'} - {farm?.pincode || '642001'}
            </p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Reject Order Request</h3>
            <p className="text-xs text-gray-600">
              State a reason for rejecting. Stock reservation will be automatically released back to the marketplace.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="btn-outline text-xs px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRejectOrder(rejectingOrderId, rejectReason);
                  setRejectingOrderId(null);
                }}
                className="bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Produce Modal */}
      {showAddModal && (
        <AddProduceModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onProduceAdded={onRefresh}
        />
      )}
    </div>
  );
};
