import React from 'react';
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
  AlertCircle,
  Truck,
  Eye,
  Store,
  ChevronRight
} from 'lucide-react';
import { FarmerNavTab } from './FarmerSidebar';

interface FarmerDashboardViewProps {
  onNavigateTab: (tab: FarmerNavTab) => void;
}

export const FarmerDashboardView: React.FC<FarmerDashboardViewProps> = ({ onNavigateTab }) => {
  // Fictional illustrative demo data for initial portal UI
  const metrics = [
    {
      id: 'total_products',
      label: 'Total Products',
      value: '8',
      unit: 'Active Crops',
      change: '+2 this week',
      isPositive: true,
      icon: Package,
      color: '#245C3A',
      bgColor: '#EAF3E7',
      tabTarget: 'products' as FarmerNavTab,
    },
    {
      id: 'new_orders',
      label: 'New Orders',
      value: '3',
      unit: 'Received Today',
      change: 'Needs confirmation',
      isPositive: true,
      icon: ShoppingBag,
      color: '#367B4B',
      bgColor: '#EAF3E7',
      tabTarget: 'incoming_orders' as FarmerNavTab,
    },
    {
      id: 'pending_orders',
      label: 'Pending Orders',
      value: '2',
      unit: 'In Harvest / Packing',
      change: 'Delivery by 2:00 PM',
      isPositive: false,
      icon: Clock,
      color: '#92400E',
      bgColor: '#FEF3C7',
      tabTarget: 'incoming_orders' as FarmerNavTab,
    },
    {
      id: 'completed_orders',
      label: 'Completed Orders',
      value: '24',
      unit: 'Past 30 Days',
      change: '100% Direct Settlement',
      isPositive: true,
      icon: CheckCircle2,
      color: '#245C3A',
      bgColor: '#EAF3E7',
      tabTarget: 'order_history' as FarmerNavTab,
    },
  ];

  // Fictional illustrative recent orders
  const recentOrders = [
    {
      id: 'FB-1049',
      customer: 'Priya Ramasamy',
      area: 'Mahalingapuram, Pollachi',
      items: 'Country Tomatoes (நாட்டு தக்காளி) × 3 kg',
      amount: '₹96.00',
      time: '18 mins ago',
      status: 'pending_confirmation',
      statusLabel: 'New • Needs Confirmation',
      statusClass: 'bg-amber-100 text-amber-900 border-amber-200',
      fulfilment: 'Doorstep Delivery',
    },
    {
      id: 'FB-1048',
      customer: 'Deepa Sundaram',
      area: 'Venkatesa Colony, Pollachi',
      items: 'Sweet Tender Coconuts (இளநீர்) × 5 pcs',
      amount: '₹225.00',
      time: '1 hour ago',
      status: 'preparing',
      statusLabel: 'Harvesting & Packing',
      statusClass: 'bg-blue-100 text-blue-900 border-blue-200',
      fulfilment: 'Farm Gate Pickup',
    },
    {
      id: 'FB-1045',
      customer: 'Suresh Kumar',
      area: 'Aliyar Foothills, Pollachi',
      items: 'Virgin Coconut Oil × 1 L, Shallots × 2 kg',
      amount: '₹470.00',
      time: 'Yesterday',
      status: 'completed',
      statusLabel: 'Completed & Delivered',
      statusClass: 'bg-[#EAF3E7] text-[#245C3A] border-[#75A85A]/30',
      fulfilment: 'Doorstep Delivery',
    },
  ];

  // Active crop listings snapshot
  const activeCrops = [
    { name: 'Country Tomatoes (நாட்டு தக்காளி)', category: 'Vegetables', stock: '45 kg', price: '₹32/kg', status: 'In Stock' },
    { name: 'Sweet Tender Coconuts (இளநீர்)', category: 'Coconut & Plantation', stock: '120 pcs', price: '₹45/pc', status: 'In Stock' },
    { name: 'Wood-Pressed Coconut Oil (மரச்செக்கு எண்ணெய்)', category: 'Cold-Pressed Oils', stock: '18 litres', price: '₹310/L', status: 'In Stock' },
    { name: 'Moringa Drumsticks (முருங்கைக்காய்)', category: 'Vegetables', stock: '25 kg', price: '₹55/kg', status: 'In Stock' },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Welcome & Actions Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-extrabold text-[#202820] tracking-tight">
              Vanakkam, Thennam Thoppu Farm! 🌾
            </span>
            <span className="bg-[#EAF3E7] text-[#245C3A] text-xs font-bold px-3 py-1 rounded-full border border-[#75A85A]/30">
              Verified Farmer Partner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#778177]">
            Monitor your daily harvest orders, active produce stock, and direct consumer settlements around Pollachi.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('add_product')}
            className="px-5 py-3 rounded-2xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/15 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Demo Disclaimer Alert */}
      <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed text-[11px]">
          <span className="font-extrabold">Illustrative Fictional Demo Portal:</span> The metrics, orders, and customer names displayed below are sample demo records for UI preview and development. In future steps, this will sync directly with your live Supabase database and real consumer orders.
        </div>
      </div>

      {/* 1. Metrics Grid (Task 5: Total Products, New Orders, Pending Orders, Completed Orders) */}
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
        <div className="space-y-3">
          {recentOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] hover:border-[#367B4B]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-extrabold text-[#202820]">#{ord.id}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${ord.statusClass}`}>
                    {ord.statusLabel}
                  </span>
                  <span className="text-[10px] text-[#778177]">({ord.time})</span>
                </div>

                <div className="text-xs font-bold text-[#202820]">
                  {ord.items}
                </div>

                <div className="text-[11px] text-[#778177] flex items-center gap-3 flex-wrap">
                  <span>Customer: <strong className="text-[#202820]">{ord.customer}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#367B4B]" />
                    <span>{ord.area}</span>
                  </span>
                  <span>•</span>
                  <span className="text-[#245C3A] font-semibold">{ord.fulfilment}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E9E1]">
                <div className="text-left md:text-right">
                  <div className="text-base font-extrabold text-[#245C3A]">{ord.amount}</div>
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
          ))}
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeCrops.map((crop) => (
            <div
              key={crop.name}
              className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#778177]">{crop.category}</span>
                  <span className="bg-[#EAF3E7] text-[#245C3A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                    {crop.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#202820] mt-1.5 line-clamp-2">
                  {crop.name}
                </h4>
              </div>

              <div className="pt-2 border-t border-[#E5E9E1] flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#245C3A]">{crop.price}</span>
                <span className="text-[11px] text-[#778177]">Stock: {crop.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
