import React, { useState, useEffect } from 'react';
import { 
  Sprout, ShoppingCart, User, Globe, LogOut, ShieldCheck, 
  ChevronDown, Search, Menu, Leaf 
} from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'farmer':
        return <span className="bg-[#EAF3E7] text-[#245C3A] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#C4DFC0]">👨‍🌾 Farmer</span>;
      case 'consumer':
        return <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200">🛒 Consumer</span>;
      default:
        return null;
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled ? 'py-3' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`flex items-center justify-between mx-auto transition-all duration-500 ease-out bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(36,92,58,0.08)] ${
            scrolled ? 'rounded-2xl px-6 py-3 max-w-5xl' : 'rounded-3xl px-8 py-5 max-w-7xl'
          }`}
        >
          {/* Logo */}
          <div 
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => {
              if (currentProfile?.role === 'farmer') onSelectTab('farmer');
              else if (currentProfile?.role === 'consumer') onSelectTab('consumer');
              else onSelectTab('marketplace');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#245C3A] to-[#1F6B45] flex items-center justify-center shadow-lg shadow-[#245C3A]/20 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#202820] hidden sm:block">
              FarmBridge
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button 
              onClick={() => onSelectTab('marketplace')} 
              className={`text-[13px] font-bold transition-colors ${activeTab === 'marketplace' ? 'text-[#367B4B]' : 'text-[#202820] hover:text-[#367B4B]'}`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => onSelectTab('consumer')} 
              className={`text-[13px] font-bold transition-colors ${activeTab === 'consumer' ? 'text-[#367B4B]' : 'text-[#202820] hover:text-[#367B4B]'}`}
            >
              Farmers
            </button>
            {currentProfile && (
              <button 
                onClick={() => onSelectTab('orders')} 
                className={`text-[13px] font-bold transition-colors ${activeTab === 'orders' ? 'text-[#367B4B]' : 'text-[#202820] hover:text-[#367B4B]'}`}
              >
                Orders
              </button>
            )}
            <button 
              onClick={() => onSelectTab('insights')} 
              className={`text-[13px] font-bold transition-colors ${activeTab === 'insights' ? 'text-[#367B4B]' : 'text-[#202820] hover:text-[#367B4B]'}`}
            >
              AI Pricing
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onToggleLang(lang === 'en' ? 'ta' : 'en')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/40 hover:bg-[#F8F8F2] transition-colors text-xs font-bold text-[#202820]"
            >
              <Globe className="w-4 h-4 text-[#367B4B]" />
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            <button 
              onClick={onOpenCart}
              className="w-10 h-10 rounded-xl bg-[#F8F8F2] hover:bg-[#EAF3E7] flex items-center justify-center transition-colors text-[#202820] relative border border-white/40"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#245C3A] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {currentProfile ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#202820] text-white text-xs font-bold hover:bg-[#245C3A] hover:shadow-lg hover:shadow-[#245C3A]/20 transition-all duration-300"
                >
                  <span className="hidden sm:block">{currentProfile.display_name.split(' ')[0]}</span>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white sm:hidden">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#75A85A] hidden sm:block"></div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#E5E9E1] py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-3 border-b border-[#E5E9E1] space-y-1">
                      <div className="text-sm font-black text-[#202820] truncate">
                        {currentProfile.display_name}
                      </div>
                      <div className="text-xs font-semibold text-[#778177]">
                        {currentProfile.phone || 'Verified User'}
                      </div>
                      <div className="pt-2">{getRoleBadge(currentProfile.role)}</div>
                    </div>
                    <div className="py-2 px-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (currentProfile.role === 'farmer') onSelectTab('farmer');
                          else onSelectTab('consumer');
                        }}
                        className="w-full px-4 py-2 rounded-xl text-left text-xs font-bold text-[#202820] hover:bg-[#F8F8F2] transition-colors"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab('orders');
                        }}
                        className="w-full px-4 py-2 rounded-xl text-left text-xs font-bold text-[#202820] hover:bg-[#F8F8F2] transition-colors"
                      >
                        My Orders
                      </button>
                      <div className="h-px bg-[#E5E9E1] my-2 mx-4" />
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 hidden sm:flex">
                <button
                  onClick={onGoToFarmerAuth}
                  className="px-4 py-2.5 rounded-xl bg-[#EAF3E7] hover:bg-[#dbeed7] text-[#245C3A] text-xs font-bold transition-colors border border-[#C4DFC0]"
                >
                  Farmer Portal
                </button>
                <button
                  onClick={onGoToConsumerAuth}
                  className="px-5 py-2.5 rounded-xl bg-[#202820] text-white text-xs font-bold hover:bg-[#245C3A] hover:shadow-lg hover:shadow-[#245C3A]/20 transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            )}
            
            <button className="md:hidden w-10 h-10 rounded-xl hover:bg-[#F8F8F2] flex items-center justify-center text-[#202820] border border-white/40">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
