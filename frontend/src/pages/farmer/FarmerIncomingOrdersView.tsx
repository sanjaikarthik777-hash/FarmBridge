import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Check, X, Truck, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { FarmerNavTab } from './FarmerSidebar';

interface FarmerIncomingOrdersViewProps {
  onNavigateTab: (tab: FarmerNavTab) => void;
}

export const FarmerIncomingOrdersView: React.FC<FarmerIncomingOrdersViewProps> = ({ onNavigateTab }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Crop unavailable due to sudden rain');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      // Filter out completed/rejected maybe? Or show all
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.acceptOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      await api.rejectOrder(orderId, reason);
      setRejectingOrderId(null);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to reject order');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin text-[#245C3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="bg-white p-6 rounded-3xl border border-[#E5E9E1] shadow-2xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#202820] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#245C3A]" />
            Incoming Orders Queue
          </h2>
          <p className="text-xs text-[#778177] mt-0.5">
            Review and fulfill orders placed by Pollachi consumers in real time.
          </p>
        </div>
        <button
          onClick={loadOrders}
          title="Refresh"
          className="p-2.5 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#367B4B] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E9E1] text-[#778177]">
            No orders received yet. Once buyers order from your listings, they will appear here.
          </div>
        ) : (
          orders.map((ord) => {
            const isPending = ord.status === 'pending_farmer_confirmation';
            const isAccepted = ord.status === 'accepted';
            const isPreparing = ord.status === 'preparing';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E9E1] shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E9E1] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#202820] text-base">
                        Order #{ord.order_number}
                      </span>
                      <span className="text-xs bg-[#EAF3E7] text-[#245C3A] px-2 py-0.5 rounded-md font-bold">
                        {ord.fulfilment_type === 'delivery' ? '🛵 Delivery' : '🚜 Farm Pickup'}
                      </span>
                    </div>
                    <div className="text-xs text-[#778177] mt-0.5">
                      Buyer: {ord.buyer_name || 'Customer'} • Delivery Slot: {ord.delivery_slot || 'Morning'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold ${
                        isPending
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-base font-black text-[#245C3A]">
                      ₹{ord.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {ord.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#202820] font-medium">
                        {it.quantity} {it.unit_snapshot} × {it.product_name_snapshot}
                      </span>
                      <span className="font-bold text-[#202820]">₹{it.line_total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#E5E9E1] text-xs text-[#778177] flex items-start gap-2">
                  <Truck className="w-4 h-4 text-[#245C3A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#202820]">Destination:</strong> {ord.delivery_address || 'Pollachi Central'} • Phone: {ord.delivery_contact_phone || '+91 97890 XXXXX'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#E5E9E1]">
                  {isPending && (
                    <>
                      <button
                        onClick={() => setRejectingOrderId(ord.id)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(ord.id)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#245C3A] hover:bg-[#185336] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Accept & Reserve Stock
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'preparing')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#245C3A] bg-[#EAF3E7] hover:bg-[#D5EAD0] shadow-sm transition-all cursor-pointer"
                    >
                      Start Harvest & Packing
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'ready_for_pickup')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#245C3A] hover:bg-[#185336] shadow-md transition-all cursor-pointer"
                    >
                      Mark Ready for Dispatch
                    </button>
                  )}

                  {ord.status === 'ready_for_pickup' && (
                    <span className="text-xs text-[#245C3A] font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Ready for pickup
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-extrabold text-[#202820] flex items-center gap-2">
              <X className="w-5 h-5 text-rose-600" /> Reject Order
            </h3>
            <p className="text-xs text-[#778177]">
              State a reason for rejecting. Stock reservation will be released back.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E9E1] bg-[#FAFBF7] rounded-xl text-sm focus:ring-2 focus:ring-[#EAF3E7] focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2.5 text-xs font-bold text-[#778177] hover:text-[#202820] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectOrder(rejectingOrderId, rejectReason)}
                className="bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
