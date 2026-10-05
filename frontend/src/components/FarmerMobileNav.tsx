import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { FarmerNavTab } from '../pages/farmer/FarmerSidebar';

interface FarmerMobileNavProps {
  activeTab: FarmerNavTab;
  onSelectTab: (tab: FarmerNavTab) => void;
  /** Pending incoming orders badge count */
  newOrdersCount?: number;
}

const MOBILE_NAV_ITEMS: {
  id: FarmerNavTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'add_product', label: 'Add', icon: PlusCircle },
  { id: 'incoming_orders', label: 'Orders', icon: ShoppingBag },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

export const FarmerMobileNav: React.FC<FarmerMobileNavProps> = ({
  activeTab,
  onSelectTab,
  newOrdersCount = 0,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/96 backdrop-blur-md border-t border-[#E5E9E1] px-1 py-1.5 shadow-lg shadow-black/5"
      aria-label="Farmer Portal Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'incoming_orders' && newOrdersCount > 0;

          return (
            <button
              key={item.id}
              id={`farmer-mobile-nav-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer w-full ${
                isActive
                  ? 'text-[#245C3A] font-extrabold'
                  : 'text-[#778177] hover:text-[#202820]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {/* Active indicator strip at top */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#245C3A]" />
              )}

              <span className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`}
                />
                {/* Badge for incoming orders */}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center bg-[#245C3A] text-white text-[9px] font-extrabold rounded-full border border-white">
                    {newOrdersCount > 9 ? '9+' : newOrdersCount}
                  </span>
                )}
              </span>

              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
