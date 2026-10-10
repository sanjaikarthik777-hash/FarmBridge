import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  ShoppingCart,
  Heart,
  Bell,
  Globe,
  MapPin,
  Search,
  User,
  LogOut,
  ChevronDown,
  X,
  Package,
  Compass,
  ShoppingBag,
} from 'lucide-react';
import { UserProfile, Product, Category } from '../types';
import { Language, translations } from '../i18n/translations';
import { LocationState } from './LocationSelectorModal';

interface ConsumerHeaderProps {
  currentProfile: UserProfile | null;
  activeLocation: LocationState;
  onOpenLocationModal: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  categories: Category[];
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onSearchSubmit: (query: string) => void;
  onNavigateToFarmer?: () => void;
}

export const ConsumerHeader: React.FC<ConsumerHeaderProps> = ({
  currentProfile,
  activeLocation,
  onOpenLocationModal,
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  unreadNotificationsCount,
  onOpenNotifications,
  onLogout,
  onOpenAuthModal,
  categories,
  products,
  onSelectProduct,
  onSearchSubmit,
}) => {
  const t = translations[lang];
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.name_ta && p.name_ta.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.farm_name && p.farm_name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchDropdownOpen(false);
      onSearchSubmit(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4 sm:py-5'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-3 sm:px-5 lg:px-8">
        {/* ── Floating Nav Card ── */}
        <div
          className={`flex items-center gap-3 lg:gap-4 bg-white/96 backdrop-blur-2xl border border-[#DDE8DA] shadow-[0_8px_32px_rgba(36,92,58,0.10)] transition-all duration-300 ${
            scrolled
              ? 'rounded-2xl px-3 sm:px-5 py-2'
              : 'rounded-3xl px-4 sm:px-6 py-3'
          }`}
        >
          {/* ═══ ZONE 1 · BRAND + LOCATION ═══ */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Logo */}
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
              aria-label="FarmBridge Home"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#245C3A] to-[#1a4229] flex items-center justify-center shadow-md shadow-[#245C3A]/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Sprout className="w-[18px] h-[18px] text-[#85C85A]" />
              </div>
              <div className="hidden sm:block leading-none">
                <span className="text-[17px] font-black tracking-tight text-[#1B221C]">
                  Farm<span className="text-[#2C7248]">Bridge</span>
                </span>
                <div className="text-[9px] font-semibold text-[#6A7A69] tracking-widest uppercase mt-0.5">
                  Pollachi Direct
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="h-7 w-px bg-[#DDE8DA] hidden md:block shrink-0" />

            {/* Location Pill */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F4F8F2] hover:bg-[#E8F2E5] border border-[#DDE8DA] hover:border-[#2C7248]/40 transition-all cursor-pointer group max-w-[190px]"
              title="Change Delivery Location"
            >
              <div className="w-6 h-6 rounded-lg bg-white border border-[#DDE8DA] flex items-center justify-center shrink-0 group-hover:border-[#2C7248]/40 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-[#2C7248]" />
              </div>
              <div className="truncate">
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#4C6850] leading-none">
                  {t.location_deliver_to}
                </div>
                <div className="text-[11.5px] font-bold text-[#1B221C] truncate mt-0.5 leading-tight">
                  {activeLocation.label.split('(')[0].trim()}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#7A8879] shrink-0 group-hover:text-[#2C7248] transition-colors" />
            </button>
          </div>

          {/* ═══ ZONE 2 · SEARCH BAR ═══ */}
          <div ref={searchContainerRef} className="flex-1 min-w-0 hidden md:block relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8879] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onFocus={() => setSearchDropdownOpen(true)}
                onKeyDown={handleSearchKeyPress}
                placeholder={t.search_placeholder}
                className="w-full pl-10 pr-9 py-[9px] rounded-full bg-[#F4F8F2] hover:bg-[#EDF5EA] border border-[#DDE8DA] text-[12.5px] font-medium text-[#1B221C] placeholder-[#7A8879] focus:bg-white focus:border-[#2C7248] focus:ring-4 focus:ring-[#2C7248]/10 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#7A8879] hover:text-[#1B221C] rounded-full hover:bg-[#DDE8DA] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {searchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#DDE8DA] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#F0F5EE] flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6A7A69]">
                    Farm Produce
                  </span>
                  <span className="text-[10px] font-bold text-[#2C7248]">
                    {searchSuggestions.length} found
                  </span>
                </div>

                {searchSuggestions.length === 0 ? (
                  <div className="px-4 py-5 text-center text-xs text-[#7A8879]">
                    No produce found for{' '}
                    <span className="font-bold text-[#1B221C]">"{searchQuery}"</span>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F4F8F2]">
                    {searchSuggestions.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          setSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="px-3.5 py-2.5 hover:bg-[#EDF5EA] flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <img
                            src={prod.image_paths?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#DDE8DA] group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#1B221C] truncate group-hover:text-[#245C3A]">
                              {lang === 'ta' && prod.name_ta ? prod.name_ta : prod.name}
                            </div>
                            <div className="text-[11px] text-[#6A7A69] truncate">
                              {prod.farm_name || 'Pollachi Farm'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-[#245C3A]">
                            ₹{prod.price}
                            <span className="text-[10px] text-[#7A8879] font-normal">/{prod.unit}</span>
                          </div>
                          {prod.distance_km !== undefined && (
                            <span className="text-[9px] font-bold text-[#2C7248] bg-[#E8F2E5] px-1.5 py-0.5 rounded-md">
                              {prod.distance_km.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-3 py-2 border-t border-[#F0F5EE]">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchDropdownOpen(false);
                      onSearchSubmit(searchQuery);
                    }}
                    className="w-full py-1.5 text-xs font-bold text-[#245C3A] hover:bg-[#EDF5EA] rounded-xl transition-colors cursor-pointer"
                  >
                    See all results ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ═══ ZONE 3 · NAV LINKS + ACTIONS ═══ */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Products Nav */}
            <button
              type="button"
              onClick={() => onSelectTab('catalogue')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalogue'
                  ? 'bg-[#E8F2E5] text-[#245C3A]'
                  : 'text-[#3D4E3B] hover:text-[#245C3A] hover:bg-[#F4F8F2]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.nav_products}</span>
            </button>

            {/* Nearby Farms Nav */}
            <button
              type="button"
              onClick={() => onSelectTab('nearby_farms')}
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'nearby_farms'
                  ? 'bg-[#E8F2E5] text-[#245C3A]'
                  : 'text-[#3D4E3B] hover:text-[#245C3A] hover:bg-[#F4F8F2]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.nav_nearby_farms}</span>
            </button>

            {/* Separator */}
            <div className="h-5 w-px bg-[#DDE8DA] hidden lg:block mx-0.5" />

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => onToggleLang(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#DDE8DA] bg-white hover:bg-[#F4F8F2] hover:border-[#2C7248] text-[11.5px] font-bold text-[#1B221C] transition-all cursor-pointer"
              title="Switch Language / மொழி மாற்றம்"
            >
              <Globe className="w-3.5 h-3.5 text-[#2C7248]" />
              <span>{lang === 'en' ? 'தமிழ்' : 'EN'}</span>
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-[7px] rounded-xl border border-[#DDE8DA] bg-white hover:bg-rose-50 hover:border-rose-200 text-[#7A8879] hover:text-rose-500 transition-all cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-[7px] rounded-xl border border-[#DDE8DA] bg-white hover:bg-[#F4F8F2] hover:border-[#2C7248] text-[#7A8879] hover:text-[#245C3A] transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#245C3A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Basket / Cart CTA */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-br from-[#245C3A] to-[#1a4229] text-white text-xs font-bold shadow-md shadow-[#245C3A]/25 hover:shadow-lg hover:shadow-[#245C3A]/30 hover:from-[#1E5233] hover:to-[#143422] active:scale-95 transition-all cursor-pointer"
              title="Shopping Basket"
            >
              <ShoppingCart className="w-4 h-4 text-[#85C85A]" />
              <span className="hidden sm:inline">{t.cart}</span>
              {cartCount > 0 && (
                <span className="bg-[#FFD249] text-[#1B221C] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Sign In */}
            {currentProfile ? (
              <div ref={profileDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 p-1 rounded-xl border border-[#DDE8DA] hover:border-[#2C7248] bg-white transition-all cursor-pointer"
                  title="Account"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#E8F2E5] flex items-center justify-center">
                    {currentProfile.avatar_path ? (
                      <img src={currentProfile.avatar_path} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#2C7248]" />
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#7A8879] mr-0.5" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DDE8DA] py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-[#F0F5EE]">
                      <div className="text-xs font-bold text-[#1B221C] truncate">
                        {currentProfile.display_name}
                      </div>
                      <div className="text-[11px] text-[#6A7A69] truncate mt-0.5">
                        {currentProfile.email || 'Verified Consumer'}
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setProfileDropdownOpen(false); onSelectTab('profile'); }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#1B221C] hover:bg-[#EDF5EA] flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#2C7248]" />
                        <span>{t.nav_profile}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProfileDropdownOpen(false); onSelectTab('orders'); }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#1B221C] hover:bg-[#EDF5EA] flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#2C7248]" />
                        <span>{t.nav_orders}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProfileDropdownOpen(false); onOpenWishlist(); }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#1B221C] hover:bg-[#EDF5EA] flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{t.nav_wishlist}</span>
                      </button>
                      <div className="border-t border-[#F0F5EE] my-1" />
                      <button
                        type="button"
                        onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl bg-[#E8F2E5] hover:bg-[#D8EDD5] text-[#245C3A] text-xs font-bold border border-[#C8DEC4] transition-all cursor-pointer shrink-0"
              >
                {t.nav_sign_in}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Row */}
        <div
          className={`pt-2 md:hidden transition-all duration-300 ${
            scrolled ? 'opacity-0 h-0 overflow-hidden pt-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8879]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder={t.search_placeholder}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/95 border border-[#DDE8DA] text-xs font-medium text-[#1B221C] placeholder-[#7A8879] focus:border-[#2C7248] focus:outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8879] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
