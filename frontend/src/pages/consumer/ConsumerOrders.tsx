import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Store,
  ShoppingBag,
  Info
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface ConsumerOrdersProps {
  orders: Order[];
  onRefresh: () => void;
  lang: Language;
  onExploreProduce: () => void;
}

const ORDER_STEPS = [
  { key: 'pending_farmer_confirmation', labelEn: 'Order Placed', labelTa: 'ஆர்டர் வைக்கப்பட்டது' },
  { key: 'accepted', labelEn: 'Farmer Confirmed', labelTa: 'விவசாயி ஒப்புதல்' },
  { key: 'preparing', labelEn: 'Harvesting & Packing', labelTa: 'அறுவடை & பேக்கிங்' },
  { key: 'ready_for_pickup', labelEn: 'Out for Delivery / Ready', labelTa: 'பயணத்தில் / தயார்' },
  { key: 'delivered', labelEn: 'Delivered', labelTa: 'நிறைவடைந்தது' },
];

export const ConsumerOrders: React.FC<ConsumerOrdersProps> = ({
  orders,
  onRefresh,
  lang,
  onExploreProduce,
}) => {
  const t = translations[lang];
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_farmer_confirmation':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
      case 'picked_up':
      case 'in_transit':
        return 3;
      case 'delivered':
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_farmer_confirmation':
        return (
          <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Awaiting Farmer</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-blue-100 text-blue-900 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>Farmer Confirmed</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-purple-100 text-purple-900 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-purple-200">
            <RefreshCw className="w-3 h-3 animate-spin text-purple-700" />
            <span>Harvesting & Packing</span>
          </span>
        );
      case 'ready_for_pickup':
      case 'in_transit':
        return (
          <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#75A85A]/30">
            <Truck className="w-3 h-3 text-[#367B4B]" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#75A85A]/40">
            <CheckCircle2 className="w-3 h-3 text-[#245C3A]" />
            <span>Delivered & Verified</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-900 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E9E1] shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border border-[#75A85A]/30">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-[#202820] tracking-tight">
              {t.order_history}
            </h1>
          </div>
          <p className="text-xs text-[#778177] mt-1.5 ml-11">
            {lang === 'ta'
              ? 'பொள்ளாச்சி விவசாயிகளின் அறுவடை மற்றும் விநியோக நிலை'
              : 'Direct harvest updates and delivery fulfillment tracking'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-xs font-bold text-[#202820] transition-all shadow-2xs cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#245C3A] ${refreshing ? 'animate-spin' : ''}`} />
          <span>{lang === 'ta' ? 'புதுப்பிக்க' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#E5E9E1] space-y-5 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30 shadow-xs">
            <Package className="w-9 h-9" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-[#202820]">{t.order_empty}</h3>
            <p className="text-xs text-[#778177] max-w-sm mx-auto leading-relaxed">
              {lang === 'ta'
                ? 'நீங்கள் இன்னும் எந்த ஆர்டரையும் பதிவு செய்யவில்லை. அருகிலுள்ள தோட்டங்களிலிருந்து நேரடியாக புதிய தேங்காய், காய்கறிகளை ஆர்டர் செய்யுங்கள்.'
                : 'You have not placed any orders yet. Discover fresh coconuts, vegetables, and farm harvests straight from local growers.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onExploreProduce}
            className="px-6 py-3 rounded-2xl bg-[#245C3A] text-white text-xs font-bold hover:bg-[#185336] transition-all shadow-md shadow-emerald-950/15 cursor-pointer"
          >
            {t.explore_produce}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStep = getStepIndex(order.status);
            const isCancelled = order.status === 'cancelled' || order.status === 'rejected';
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#E5E9E1] p-5 sm:p-6 space-y-5 shadow-xs hover:border-[#367B4B]/40 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E9E1] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-extrabold text-[#202820]">
                        #{order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                      <span className="text-[10px] font-bold text-[#778177] bg-[#FAFBF7] px-2 py-0.5 rounded-full border border-[#E5E9E1]">
                        Demo Reference
                      </span>
                    </div>
                    <p className="text-xs text-[#778177] flex items-center gap-2 font-medium">
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#245C3A] flex items-center gap-1">
                        <Store className="w-3 h-3 text-[#367B4B]" />
                        {order.farmer_name || order.farm_name || 'Pollachi Farmer'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-extrabold text-[#245C3A]">
                        ₹{order.total_amount.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-[#778177]">
                        {order.fulfilment_type === 'pickup' ? 'Farm Gate Pickup' : 'Doorstep Delivery'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="px-3 py-1.5 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-xs font-bold text-[#202820] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? (lang === 'ta' ? 'மறை' : 'Hide') : (lang === 'ta' ? 'விவரம்' : 'View Details')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Progress Tracker Stepper (Only if not cancelled) */}
                {!isCancelled && (
                  <div className="py-2 px-1">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center space-y-1.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-[#245C3A] text-white ring-4 ring-[#EAF3E7]'
                                  : isCompleted
                                  ? 'bg-[#EAF3E7] text-[#245C3A] border border-[#75A85A]/40'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] leading-tight font-bold hidden sm:block ${
                                isCompleted ? 'text-[#202820]' : 'text-gray-400'
                              }`}
                            >
                              {lang === 'ta' ? step.labelTa : step.labelEn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ordered Items Preview */}
                <div className="bg-[#FAFBF7] rounded-2xl p-4 space-y-2.5 border border-[#E5E9E1]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#202820]">
                    <span>Harvested Produce ({order.items.length} items):</span>
                    <span className="text-[11px] text-[#778177]">
                      {order.fulfilment_type === 'pickup' ? 'Self Pickup' : 'Delivery Slot: Morning'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-[#202820]"
                      >
                        <span className="font-semibold truncate max-w-[260px] sm:max-w-md">
                          {item.product_name || item.product_name_snapshot} × {item.quantity}{' '}
                          {item.unit || item.unit_snapshot}
                        </span>
                        <span className="font-bold text-[#245C3A]">₹{item.line_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.delivery_address && (
                    <div className="pt-2.5 border-t border-[#E5E9E1] flex items-center gap-1.5 text-[11px] text-[#778177]">
                      <MapPin className="w-3.5 h-3.5 text-[#367B4B] shrink-0" />
                      <span>{order.delivery_address}</span>
                    </div>
                  )}
                </div>

                {/* Expandable Order Details Section */}
                {isExpanded && (
                  <div className="p-4 bg-white rounded-2xl border border-[#E5E9E1] space-y-3 animate-in fade-in duration-200">
                    <div className="text-xs font-extrabold text-[#202820] uppercase tracking-wider">
                      {lang === 'ta' ? 'ஆணை விவரக்குறிப்பு' : 'Detailed Order Information'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-[#FAFBF7] rounded-xl border border-[#E5E9E1]">
                        <span className="text-[#778177] block text-[11px]">Farm Partner:</span>
                        <span className="font-bold text-[#202820]">
                          {order.farmer_name || order.farm_name || 'Pollachi Local Farm'}
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAFBF7] rounded-xl border border-[#E5E9E1]">
                        <span className="text-[#778177] block text-[11px]">Payment Mode:</span>
                        <span className="font-bold text-[#202820]">
                          Cash on Delivery / UPI
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-[#EAF3E7] rounded-xl border border-[#75A85A]/30 text-[11px] text-[#245C3A] flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-[#367B4B]" />
                      <span>
                        {lang === 'ta'
                          ? 'மாதிரி ஆர்டர்: உண்மையான உற்பத்தியில், இந்த நிலை விவசாயி போர்ட்டல் மூலம் மாற்றப்படும்.'
                          : 'Demo Order: In production, the Farmer Portal will update this status timeline directly in real-time.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
