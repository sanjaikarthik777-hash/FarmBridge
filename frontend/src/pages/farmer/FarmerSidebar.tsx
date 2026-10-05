import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Truck,
  History,
  Store,
  Settings,
  ArrowLeft,
  X,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export type FarmerNavTab =
  | 'dashboard'
  | 'products'
  | 'add_product'
  | 'incoming_orders'
  | 'delivery'
  | 'order_history'
  | 'profile'
  | 'settings';

interface FarmerSidebarProps {
  activeTab: FarmerNavTab;
  onSelectTab: (tab: FarmerNavTab) => void;
  onNavigateToConsumer: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: { id: FarmerNavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'My Products', icon: Package, badge: '8' },
  { id: 'add_product', label: 'Add Product', icon: PlusCircle },
  { id: 'incoming_orders', label: 'Incoming Orders', icon: ShoppingBag, badge: '3' },
  { id: 'delivery', label: 'Delivery Management', icon: Truck },
  { id: 'order_history', label: 'Order History', icon: History },
  { id: 'profile', label: 'Farm Profile', icon: Store },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const FarmerSidebar: React.FC<FarmerSidebarProps> = ({
  activeTab,
  onSelectTab,
  onNavigateToConsumer,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white border-r border-[#E5E9E1] text-[#202820] select-none">
      {/* Brand & Portal Header */}
      <div className="p-5 border-b border-[#E5E9E1]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#245C3A] text-white flex items-center justify-center font-black text-lg shadow-sm">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#202820]">
                  FarmBridge
                </span>
                <span className="bg-[#EAF3E7] text-[#245C3A] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                  Farmer
                </span>
              </div>
              <p className="text-[11px] text-[#778177] font-medium">Producer Management Portal</p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active Farm Profile Chip */}
        <div className="mt-4 p-3 bg-[#F8F8F2] rounded-2xl border border-[#E5E9E1] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center shrink-0 border border-[#75A85A]/30 font-bold text-xs">
            🚜
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#202820] truncate">Thennam Thoppu Farm</div>
            <div className="text-[10px] text-[#778177] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#367B4B]" />
              <span className="truncate">Aliyar Road, Pollachi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#245C3A] text-white shadow-sm'
                  : 'text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#367B4B]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EAF3E7] text-[#245C3A] border border-[#75A85A]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Switch to Consumer App Footer */}
      <div className="p-4 border-t border-[#E5E9E1] space-y-3 bg-[#FAFBF7]">
        <div className="p-3 bg-[#EAF3E7] rounded-2xl border border-[#75A85A]/30 text-[11px] text-[#245C3A] flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#367B4B] shrink-0 mt-0.5" />
          <span className="leading-tight">
            <strong>Demo Portal:</strong> Illustrative farmer console connected to Pollachi regional pilot network.
          </span>
        </div>

        <button
          onClick={onNavigateToConsumer}
          className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-[#E5E9E1] text-[#202820] text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#245C3A]" />
          <span>Switch to Consumer App</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 shadow-xs z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
