import React, { useState } from 'react';
import { Sprout, ShoppingCart, User, Globe, LogOut, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  currentProfile: UserProfile | null;
  onLogout: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onGoToFarmerAuth: () => void;
  onGoToConsumerAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onLogout,
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  onGoToFarmerAuth,
  onGoToConsumerAuth,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const t = translations[lang];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'farmer':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">👨‍🌾 Farmer</span>;
      case 'consumer':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">🛒 Consumer</span>;
      case 'business':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">🏢 Business</span>;
      case 'delivery':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">🛵 Delivery</span>;
      case 'admin':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">🛡️ Admin</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8E3] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Regional Pilot Badge */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              if (currentProfile?.role === 'farmer') onSelectTab('farmer');
              else if (currentProfile?.role === 'consumer') onSelectTab('consumer');
              else onSelectTab('marketplace');
            }}
          >
            <div className="w-11 h-11 rounded-xl bg-[#1F6B45] flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#1F6B45]">
                  Farm<span className="text-[#3C9B62]">Bridge</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EAF5ED] text-[#1F6B45] px-2 py-0.5 rounded-full border border-[#C2E2CC]">
                  <ShieldCheck className="w-3 h-3" />
                  {t.pilot_area}
                </span>
              </div>
              <p className="text-xs text-[#68736B] hidden sm:block">
                Direct Farmer-to-Consumer • True GPS Discovery
              </p>
            </div>
          </div>

          {/* Navigation Links (Role-Aware) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {(!currentProfile || currentProfile.role === 'consumer') && (
              <button
                onClick={() => onSelectTab('consumer')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'consumer' || activeTab === 'marketplace'
                    ? 'bg-[#EAF5ED] text-[#1F6B45]'
                    : 'text-[#68736B] hover:text-[#202820] hover:bg-gray-50'
                }`}
              >
                Nearby Farms & Market
              </button>
            )}

            {currentProfile?.role === 'farmer' && (
              <button
                onClick={() => onSelectTab('farmer')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'farmer'
                    ? 'bg-[#EAF5ED] text-[#1F6B45]'
                    : 'text-[#68736B] hover:text-[#202820] hover:bg-gray-50'
                }`}
              >
                {t.my_dashboard}
              </button>
            )}

            {currentProfile && (
              <button
                onClick={() => onSelectTab('orders')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#EAF5ED] text-[#1F6B45]'
                    : 'text-[#68736B] hover:text-[#202820] hover:bg-gray-50'
                }`}
              >
                {t.my_orders}
              </button>
            )}

            <button
              onClick={() => onSelectTab('insights')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'insights'
                  ? 'bg-[#EAF5ED] text-[#1F6B45]'
                  : 'text-[#68736B] hover:text-[#202820] hover:bg-gray-50'
              }`}
            >
              AI Price Insights
            </button>

            {currentProfile?.role === 'delivery' && (
              <button
                onClick={() => onSelectTab('delivery')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'delivery'
                    ? 'bg-[#EAF5ED] text-[#1F6B45]'
                    : 'text-[#68736B] hover:text-[#202820] hover:bg-gray-50'
                }`}
              >
                Delivery Portal
              </button>
            )}

            {currentProfile?.role === 'admin' && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-[#EAF5ED] text-[#1F6B45]'
                    : 'text-[#68736B] hover:text-[#202820] hover:bg-gray-50'
                }`}
              >
                Admin Console
              </button>
            )}
          </nav>

          {/* Right Controls: Language, Cart & Authentication */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => onToggleLang(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8E3] text-xs font-bold text-[#202820] hover:bg-gray-50 transition-colors"
              title="Switch Language / மொழி மாற்றம்"
            >
              <Globe className="w-3.5 h-3.5 text-[#1F6B45]" />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl border border-[#E2E8E3] text-[#202820] hover:bg-gray-50 transition-colors"
              title="Open Basket"
            >
              <ShoppingCart className="w-5 h-5 text-[#1F6B45]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E7A83E] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authenticated User Menu or Separate Portal Login Buttons */}
            {currentProfile ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-[#E2E8E3] hover:border-[#B5D4BF] bg-white transition-all shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-[#1F6B45]">
                    {currentProfile.avatar_path ? (
                      <img src={currentProfile.avatar_path} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-[#202820] leading-tight truncate max-w-[120px]">
                      {currentProfile.display_name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#68736B] leading-tight capitalize">
                      {currentProfile.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#68736B]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8E3] py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-gray-100 space-y-1">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {currentProfile.display_name}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {currentProfile.phone || 'Verified User'}
                      </div>
                      <div className="pt-1">{getRoleBadge(currentProfile.role)}</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (currentProfile.role === 'farmer') onSelectTab('farmer');
                          else onSelectTab('consumer');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab('orders');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        My Orders
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onGoToFarmerAuth}
                  className="px-3 py-2 rounded-xl bg-[#EAF5ED] hover:bg-[#D6ECD9] text-[#1F6B45] text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  Farmer Portal
                </button>
                <button
                  onClick={onGoToConsumerAuth}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  Consumer Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#E2E8E3] bg-[#FAFBF7] px-2 py-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => onSelectTab(currentProfile?.role === 'farmer' ? 'farmer' : 'consumer')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'consumer' || activeTab === 'marketplace' || activeTab === 'farmer'
              ? 'bg-[#1F6B45] text-white'
              : 'text-[#68736B]'
          }`}
        >
          {currentProfile?.role === 'farmer' ? 'Farmer Portal' : 'Nearby Farms'}
        </button>

        {currentProfile && (
          <button
            onClick={() => onSelectTab('orders')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-[#1F6B45] text-white' : 'text-[#68736B]'
            }`}
          >
            {t.my_orders}
          </button>
        )}

        <button
          onClick={() => onSelectTab('insights')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'insights' ? 'bg-[#1F6B45] text-white' : 'text-[#68736B]'
          }`}
        >
          AI Prices
        </button>

        {!currentProfile && (
          <button
            onClick={onGoToFarmerAuth}
            className="px-2.5 py-1.5 rounded-lg bg-[#EAF5ED] text-[#1F6B45] font-bold"
          >
            Farmer Sign In
          </button>
        )}
      </div>
    </header>
  );
};
