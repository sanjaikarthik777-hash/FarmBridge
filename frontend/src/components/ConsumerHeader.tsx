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
  Sparkles,
  Compass,
  Grid,
  Check
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
  onNavigateToFarmer,
}) => {
  const t = translations[lang];
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(e.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for instant suggestions
  const searchSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.name_ta && p.name_ta.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.farm_name && p.farm_name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
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
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled ? 'py-3' : 'py-6'
      }`}
    >
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`flex items-center justify-between mx-auto transition-all duration-500 ease-out bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(36,92,58,0.08)] ${
            scrolled ? 'rounded-2xl px-4 sm:px-6 py-2.5 max-w-5xl border border-white/60' : 'rounded-3xl px-4 sm:px-8 py-3.5 max-w-7xl border border-white/40'
          }`}
        >
          {/* Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => onSelectTab('home')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#245C3A] to-[#1F6B45] flex items-center justify-center text-white shadow-md shadow-[#245C3A]/20 transition-transform hover:scale-105">
              <Sprout className="w-6 h-6 text-[#75A85A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#202820]">
                  Farm<span className="text-[#367B4B]">Bridge</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold bg-[#EAF3E7]/80 text-[#245C3A] px-2 py-0.5 rounded-full border border-[#C4DFC0]">
                  Consumer
                </span>
              </div>
            </div>
          </div>

          {/* Location Selector Pill */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] hover:border-[#367B4B] hover:bg-[#EAF3E7]/40 transition-all text-left shrink-0 max-w-[130px] sm:max-w-[210px] cursor-pointer"
            title="Change Delivery Location"
          >
            <div className="w-6 h-6 rounded-lg bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#367B4B]" />
            </div>
            <div className="truncate">
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-[#245C3A] leading-tight">
                {t.location_deliver_to}
              </div>
              <div className="text-xs font-bold text-[#202820] leading-tight truncate">
                {activeLocation.label}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#778177] shrink-0 ml-0.5" />
          </button>

          {/* Search Bar with Autocomplete Suggestions (Desktop & Tablet) */}
          <div ref={searchContainerRef} className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778177]" />
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
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] text-xs font-medium text-[#202820] placeholder-[#778177] focus:bg-white focus:border-[#367B4B] focus:ring-2 focus:ring-[#367B4B]/10 focus:outline-hidden transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {searchDropdownOpen && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E5E9E1] overflow-hidden z-50 py-2 animate-in fade-in duration-150">
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#778177]">
                  Matching Harvest Produce
                </div>
                {searchSuggestions.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      setSearchDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="px-3.5 py-2 hover:bg-[#EAF3E7]/60 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={prod.image_paths?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#202820]">
                          {lang === 'ta' && prod.name_ta ? prod.name_ta : prod.name}
                        </div>
                        <div className="text-[11px] text-[#778177]">
                          {prod.farm_name} • ₹{prod.price}/{prod.unit}
                        </div>
                      </div>
                    </div>
                    {prod.distance_km !== undefined && (
                      <span className="text-[10px] font-bold text-[#245C3A] bg-[#EAF3E7] px-2 py-0.5 rounded-full">
                        {prod.distance_km.toFixed(1)} km
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {/* Home */}
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#EAF3E7] text-[#245C3A]'
                  : 'text-[#778177] hover:text-[#202820] hover:bg-gray-50'
              }`}
            >
              {t.nav_home}
            </button>

            {/* Explore Products */}
            <button
              onClick={() => onSelectTab('catalogue')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalogue'
                  ? 'bg-[#EAF3E7] text-[#245C3A]'
                  : 'text-[#778177] hover:text-[#202820] hover:bg-gray-50'
              }`}
            >
              {t.nav_products}
            </button>

            {/* Categories Dropdown */}
            <div ref={categoriesDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#778177] hover:text-[#202820] hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{t.all_categories}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E9E1] py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#778177] tracking-wider">
                    Browse Categories
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoriesDropdownOpen(false);
                        onSelectTab('catalogue');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#202820] hover:bg-[#EAF3E7]/60 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>🌾</span>
                      <span>{lang === 'ta' && cat.name_ta ? cat.name_ta : cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby Farms */}
            <button
              onClick={() => onSelectTab('nearby_farms')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'nearby_farms'
                  ? 'bg-[#EAF3E7] text-[#245C3A]'
                  : 'text-[#778177] hover:text-[#202820] hover:bg-gray-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#367B4B]" />
              <span>{t.nav_nearby_farms}</span>
            </button>
          </nav>

          {/* Right Action Controls: Language, Wishlist, Notifications, Cart, Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Language Switcher */}
            <button
              onClick={() => onToggleLang(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#202820] hover:border-[#367B4B] hover:bg-gray-50 transition-colors cursor-pointer"
              title="Switch Language / மொழி மாற்றம்"
            >
              <Globe className="w-3.5 h-3.5 text-[#367B4B]" />
              <span className="hidden sm:inline font-semibold">{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-xl border border-[#E5E9E1] text-[#778177] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl border border-[#E5E9E1] text-[#778177] hover:text-[#245C3A] hover:bg-gray-50 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#245C3A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#245C3A] text-white font-bold text-xs shadow-md shadow-[#245C3A]/20 hover:bg-[#1b452b] transition-all cursor-pointer active:scale-95"
              title="Open Shopping Basket"
            >
              <ShoppingCart className="w-4 h-4 text-[#75A85A]" />
              <span className="hidden sm:inline">{t.cart}</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-[#202820] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile or Sign In Button */}
            {currentProfile ? (
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl border border-[#E5E9E1] hover:border-[#367B4B] bg-white transition-all shadow-xs cursor-pointer"
                  title="Account Menu"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#EAF3E7] flex items-center justify-center text-[#245C3A]">
                    {currentProfile.avatar_path ? (
                      <img src={currentProfile.avatar_path} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#367B4B]" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#778177] mr-1" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E9E1] py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-[#E5E9E1] space-y-0.5">
                      <div className="text-xs font-bold text-[#202820] truncate">
                        {currentProfile.display_name}
                      </div>
                      <div className="text-[11px] text-[#778177] truncate">
                        {currentProfile.email || 'Verified Consumer'}
                      </div>
                    </div>

                    <div className="py-1 text-xs font-semibold text-[#202820]">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab('profile');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#EAF3E7]/60 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#367B4B]" />
                        <span>{t.nav_profile}</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab('orders');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#EAF3E7]/60 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#367B4B]" />
                        <span>{t.nav_orders}</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenWishlist();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#EAF3E7]/60 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{t.nav_wishlist}</span>
                      </button>

                      <div className="border-t border-[#E5E9E1] my-1" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
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
                className="px-3.5 py-2 rounded-xl bg-[#EAF3E7] hover:bg-[#dbeed7] text-[#245C3A] text-xs font-bold border border-[#C4DFC0] transition-all shrink-0 cursor-pointer"
              >
                {t.nav_sign_in}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row (Visible on small screens) */}
        <div className={`py-2 pb-3 md:hidden transition-all duration-300 ${scrolled ? 'opacity-0 h-0 overflow-hidden py-0 pb-0' : 'opacity-100'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778177]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder={t.search_placeholder}
              className="w-full pl-10 pr-9 py-2 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 text-xs font-medium text-[#202820] placeholder-[#778177] focus:bg-white focus:border-[#367B4B] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
