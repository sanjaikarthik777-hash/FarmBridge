import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Truck,
  Eye,
  Store,
  ChevronRight,
  RefreshCw,
  IndianRupee,
  Leaf
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Order, Farm, UserProfile } from '../../types';
import { FarmerNavTab } from './FarmerSidebar';

interface FarmerDashboardViewProps {
  onNavigateTab: (tab: FarmerNavTab) => void;
  farmerProfile?: UserProfile | null;
}

export const FarmerDashboardView: React.FC<FarmerDashboardViewProps> = ({
  onNavigateTab,
  farmerProfile,
}) => {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [farmData, productsData, ordersData] = await Promise.all([
        api.getMyFarm().catch(() => null),
        api.getProducts({ farmer_id: 'me' }).catch(() => []),
        api.getOrders().catch(() => []),
      ]);
      setFarm(farmData);
      setProducts(productsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Failed to load farmer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute live real metrics
  const totalProducts = products.length;
  const activeProducts = products.filter(
    (p) => p.status === 'active' || (p as any).status === 'available'
  ).length;

  const newOrders = orders.filter(
    (o) => o.status === 'pending_farmer_confirmation' || (o.status as any) === 'pending'
  );
  const pendingOrders = orders.filter((o) =>
    ['accepted', 'preparing', 'ready_for_pickup', 'in_transit'].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ['completed', 'delivered'].includes(o.status)
  );

  const totalEarnings = completedOrders.reduce(
    (sum, o) => sum + (o.subtotal || o.total_amount || 0),
    0
  );

  const metrics = [
    {
      id: 'total_products',
      label: 'Total Products',
      value: totalProducts.toString(),
      unit: `${activeProducts} Active in Stock`,
      change: totalProducts > 0 ? 'Live listings' : 'No crops added',
      isPositive: totalProducts > 0,
      icon: Package,
      color: '#245C3A',
      bgColor: '#EAF3E7',
      tabTarget: 'products' as FarmerNavTab,
    },
    {
      id: 'new_orders',
      label: 'New Orders',
      value: newOrders.length.toString(),
      unit: 'Action Needed',
      change: newOrders.length > 0 ? 'Needs confirmation' : 'Queue clear',
      isPositive: newOrders.length > 0,
      icon: ShoppingBag,
      color: '#367B4B',
      bgColor: '#EAF3E7',
      tabTarget: 'incoming_orders' as FarmerNavTab,
    },
    {
      id: 'pending_orders',
      label: 'Pending Harvest',
      value: pendingOrders.length.toString(),
      unit: 'In Fulfillment',
      change: pendingOrders.length > 0 ? 'Preparing / Transit' : 'None pending',
      isPositive: false,
      icon: Clock,
      color: '#92400E',
      bgColor: '#FEF3C7',
      tabTarget: 'incoming_orders' as FarmerNavTab,
    },
    {
      id: 'total_revenue',
      label: 'Total Revenue',
      value: `₹${totalEarnings.toFixed(0)}`,
      unit: `${completedOrders.length} Fulfilled`,
      change: '100% Direct Settlement',
      isPositive: true,
      icon: IndianRupee,
      color: '#245C3A',
      bgColor: '#EAF3E7',
      tabTarget: 'incoming_orders' as FarmerNavTab,
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const activeCrops = products.slice(0, 4);

  const farmName =
    farm?.farm_name ||
    farmerProfile?.display_name ||
    'Farmer Partner';

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Welcome & Actions Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-extrabold text-[#202820] tracking-tight">
              Vanakkam, {farmName}! 🌾
            </span>
            <span className="bg-[#EAF3E7] text-[#245C3A] text-xs font-bold px-3 py-1 rounded-full border border-[#75A85A]/30">
              Verified Farmer Partner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#778177]">
            Monitor your daily harvest orders, active produce stock, and direct consumer settlements around Pollachi.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadDashboardData}
            title="Refresh dashboard data"
            className="p-3 rounded-2xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#367B4B] transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigateTab('add_product')}
            className="px-5 py-3 rounded-2xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/15 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 1. Metrics Grid (Real Data: Total Products, New Orders, Pending Orders, Completed Orders & Revenue) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={() => onNavigateTab(m.tabTarget)}
              className="bg-white rounded-3xl p-5 border border-[#E5E9E1] hover:border-[#367B4B]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-black/5"
                  style={{ backgroundColor: m.bgColor, color: m.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-[#778177] flex items-center gap-1 group-hover:text-[#245C3A] transition-colors">
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#202820] tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-[#778177] mt-0.5">{m.label}</div>
                <div className="text-[11px] font-medium text-[#245C3A] mt-2 flex items-center gap-1">
                  <span>{m.unit}</span>
                  <span>•</span>
                  <span className="text-[#778177]">{m.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-[#E5E9E1] p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E9E1] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#202820] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#367B4B]" />
              <span>Recent Harvest Orders</span>
            </h3>
            <p className="text-xs text-[#778177]">
              Customer orders placed from nearby Pollachi locations awaiting farmer fulfillment
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('incoming_orders')}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Incoming Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Order Cards List */}
        {recentOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FAFBF7] border border-dashed border-[#E5E9E1] text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-[#778177] mx-auto opacity-60" />
            <p className="text-xs font-bold text-[#202820]">No Customer Orders Yet</p>
            <p className="text-[11px] text-[#778177] max-w-sm mx-auto">
              Once local buyers order produce from your listed crops, incoming orders will appear here for you to confirm and prepare.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => {
              const isPending = ord.status === 'pending_farmer_confirmation' || (ord.status as any) === 'pending';
              const isCompleted = ord.status === 'completed' || ord.status === 'delivered';
              const isRejected = ord.status === 'rejected';

              return (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] hover:border-[#367B4B]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-extrabold text-[#202820]">#{ord.order_number || ord.id.slice(0, 8)}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : isCompleted
                            ? 'bg-[#EAF3E7] text-[#245C3A] border-[#75A85A]/30'
                            : isRejected
                            ? 'bg-rose-100 text-rose-900 border-rose-200'
                            : 'bg-blue-100 text-blue-900 border-blue-200'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[#778177]">
                        {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#202820]">
                      {ord.items && ord.items.length > 0
                        ? ord.items.map((it) => `${it.product_name_snapshot} (${it.quantity} ${it.unit_snapshot})`).join(', ')
                        : 'Fresh produce harvest'}
                    </div>

                    <div className="text-[11px] text-[#778177] flex items-center gap-3 flex-wrap">
                      <span>Customer: <strong className="text-[#202820]">{ord.buyer_name || 'Verified Buyer'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#367B4B]" />
                        <span>{ord.delivery_area || ord.delivery_address || 'Pollachi'}</span>
                      </span>
                      <span>•</span>
                      <span className="text-[#245C3A] font-semibold">
                        {ord.fulfilment_type === 'delivery' ? '🛵 Doorstep Delivery' : '🚜 Farm Gate Pickup'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E9E1]">
                    <div className="text-left md:text-right">
                      <div className="text-base font-extrabold text-[#245C3A]">₹{(ord.subtotal || ord.total_amount || 0).toFixed(2)}</div>
                      <div className="text-[10px] text-[#778177]">Direct Payout</div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('incoming_orders')}
                      className="px-3.5 py-2 bg-white hover:bg-[#EAF3E7] text-[#245C3A] border border-[#E5E9E1] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Manage Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Active Produce Inventory Snapshot */}
      <div className="bg-white rounded-3xl border border-[#E5E9E1] p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E9E1] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#202820] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#367B4B]" />
              <span>Current Listed Produce</span>
            </h3>
            <p className="text-xs text-[#778177]">
              Crops currently visible to Pollachi consumers on the marketplace
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Crops</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activeCrops.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FAFBF7] border border-dashed border-[#E5E9E1] text-center space-y-3">
            <Leaf className="w-8 h-8 text-[#367B4B] mx-auto opacity-70" />
            <div>
              <p className="text-xs font-bold text-[#202820]">No Produce Listed Yet</p>
              <p className="text-[11px] text-[#778177] max-w-sm mx-auto mt-0.5">
                List your first harvest to start selling direct to consumers in Pollachi without middlemen!
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('add_product')}
              className="px-4 py-2 bg-[#245C3A] text-white rounded-xl text-xs font-bold hover:bg-[#185336] cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Crop</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCrops.map((crop) => (
              <div
                key={crop.id}
                className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#778177]">
                      {(crop as any).category_name || 'Fresh Produce'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        crop.status === 'active' || (crop as any).status === 'available'
                          ? 'bg-[#EAF3E7] text-[#245C3A] border-[#75A85A]/30'
                          : crop.status === 'sold_out'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {crop.status === 'active' ? 'In Stock' : crop.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#202820] mt-1.5 line-clamp-2">
                    {crop.name} {crop.name_ta ? `(${crop.name_ta})` : ''}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[#E5E9E1] flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#245C3A]">₹{crop.price}/{crop.unit}</span>
                  <span className="text-[11px] text-[#778177]">Stock: {crop.available_quantity} {crop.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
