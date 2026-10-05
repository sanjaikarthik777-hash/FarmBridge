import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, ArrowRight, Heart, ShoppingBag, Leaf, 
  ChevronRight, Star, ShieldCheck, Sprout, TrendingUp,
  Package, Users, Store, Play, Menu
} from 'lucide-react';
import { Product, Category, Farm } from '../../types';
import { Language } from '../../i18n/translations';
import { LocationState } from '../../components/LocationSelectorModal';

// --- Types ---
interface ConsumerHomeProps {
  products: Product[];
  categories: Category[];
  farms: Farm[];
  activeLocation: LocationState;
  onOpenLocationModal: () => void;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartItemQuantities?: Record<string, number>;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  onNavigateToCatalogue: (categoryId?: string) => void;
  onNavigateToNearbyFarms: () => void;
  onSelectFarm?: (farmId: string) => void;
  currentProfile?: any;
  onOpenAuthModal?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export const ConsumerHome: React.FC<ConsumerHomeProps> = ({
  products,
  categories,
  farms,
  activeLocation,
  onOpenLocationModal,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartItemQuantities = {},
  wishlistIds = [],
  onToggleWishlist,
  onNavigateToCatalogue,
  onNavigateToNearbyFarms,
  onSelectFarm,
  currentProfile,
  onOpenAuthModal,
  onOpenCart,
  cartCount = 0,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredProducts = products.filter(p => p.status === 'active').slice(0, 5);
  const featuredFarms = farms.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F8F2] font-sans selection:bg-[#75A85A]/30 selection:text-[#1F6B45] overflow-x-hidden">
      
      {/* --- FLOATING NAVIGATION --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'py-3' 
            : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`flex items-center justify-between mx-auto transition-all duration-500 ease-out bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(36,92,58,0.08)] ${
              scrolled ? 'rounded-2xl px-6 py-3 max-w-5xl' : 'rounded-3xl px-8 py-5 max-w-7xl'
            }`}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#245C3A] to-[#1F6B45] flex items-center justify-center shadow-lg shadow-[#245C3A]/20 group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#202820]">
                FarmBridge
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => onNavigateToCatalogue()} className="text-[13px] font-bold text-[#202820] hover:text-[#367B4B] transition-colors">Marketplace</button>
              <button onClick={() => onNavigateToNearbyFarms()} className="text-[13px] font-bold text-[#202820] hover:text-[#367B4B] transition-colors">Farmers</button>
              <button className="text-[13px] font-bold text-[#202820] hover:text-[#367B4B] transition-colors">Orders</button>
              <button className="text-[13px] font-bold text-[#202820] hover:text-[#367B4B] transition-colors">About</button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={onOpenLocationModal}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#F8F8F2] transition-colors text-xs font-semibold text-[#367B4B]"
              >
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[120px]">{activeLocation.label}</span>
              </button>
              
              <button onClick={() => onNavigateToCatalogue()} className="w-10 h-10 rounded-xl hover:bg-[#F8F8F2] flex items-center justify-center transition-colors text-[#202820]">
                <Search className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onOpenCart}
                className="w-10 h-10 rounded-xl bg-[#F8F8F2] hover:bg-[#EAF3E7] flex items-center justify-center transition-colors text-[#202820] relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#245C3A] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={onOpenAuthModal}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202820] text-white text-xs font-bold hover:bg-[#245C3A] hover:shadow-lg hover:shadow-[#245C3A]/20 transition-all duration-300"
              >
                {currentProfile ? currentProfile.display_name : 'Profile'}
                <div className="w-1.5 h-1.5 rounded-full bg-[#75A85A]"></div>
              </button>
              
              <button className="md:hidden w-10 h-10 rounded-xl hover:bg-[#F8F8F2] flex items-center justify-center text-[#202820]">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative w-screen min-h-[90vh] flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#245C3A]">
        {/* Cinematic Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02] transform transition-transform duration-[20s] ease-linear hover:scale-110"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1595856453084-25916053f3e1?q=80&w=2670&auto=format&fit=crop')", // Lush Indian farming imagery
          }}
        />
        
        {/* Soft Green Overlays for text readability while preserving the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/90 via-[#245C3A]/60 to-[#245C3A]/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F6B45]/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#245C3A]/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Typography side */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05]">
              FROM FARM
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#75A85A] to-[#F8F8F2]">DIRECTLY</span>
              <br />
              TO YOU.
            </h1>
            
            <p className="text-lg sm:text-xl text-[#F8F8F2]/90 font-medium max-w-xl leading-relaxed">
              Fresh produce. Trusted farmers. One connected marketplace bringing the finest harvest of Pollachi straight to your table.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigateToCatalogue()}
                className="group relative px-8 py-4 bg-white text-[#202820] rounded-full font-bold text-sm overflow-hidden flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 bg-[#F8F8F2] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Explore Marketplace</span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-[#EAF3E7] flex items-center justify-center group-hover:bg-[#245C3A] group-hover:text-white transition-colors duration-300">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
              
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1595435012529-65b16e45f942?w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#202820] object-cover" alt="Farmer avatar" />
                  <img src="https://images.unsplash.com/photo-1560416313-414b33c856a9?w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#202820] object-cover" alt="Farmer avatar" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#202820] bg-[#367B4B] flex items-center justify-center text-white text-[10px] font-bold">
                    +2.4k
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white text-xs font-bold leading-none">2,400+ Farmers</p>
                  <p className="text-emerald-300/80 text-[10px] uppercase tracking-wider leading-none">18,000+ Products</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating UI Elements Side */}
          <div className="hidden lg:block lg:col-span-5 relative h-[600px] pointer-events-none">
            {/* Glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#75A85A]/30 rounded-full blur-[100px]" />

            {/* Central Hero Image */}
            <div className="absolute top-4 bottom-12 right-0 left-8 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(32,40,32,0.4)] border border-white/10 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 z-10 group">
              <img 
                src="/hero-farmer.png" 
                alt="Young Farmer with Basket" 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Aesthetic Typography: THOPPUKARAN */}
            <div className="absolute bottom-2 right-4 z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 pointer-events-none">
              <h2 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#F8F8F2] to-[#C4DFC0]/50 tracking-tighter drop-shadow-2xl">
                THOPPUKARAN<span className="text-[#75A85A]">.</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Organic curved mask at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1440 100" className="absolute bottom-0 w-full h-full preserve-3d" preserveAspectRatio="none">
            <path 
              d="M0,100 C240,100 480,20 720,20 C960,20 1200,100 1440,100 L1440,100 L0,100 Z" 
              fill="#F8F8F2" 
            />
          </svg>
        </div>
      </section>

      {/* --- LIVE MARKET ACTIVITY --- */}
      <section className="bg-[#F8F8F2] pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-[#245C3A]/10 pb-12">
            
            <div className="flex-1 w-full grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#778177] uppercase tracking-widest">Today</p>
                <p className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">2,482</p>
                <p className="text-xs font-semibold text-[#367B4B]">FARMERS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#778177] uppercase tracking-widest">Active</p>
                <p className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">18k+</p>
                <p className="text-xs font-semibold text-[#367B4B]">PRODUCTS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#778177] uppercase tracking-widest">Delivered</p>
                <p className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">94k</p>
                <p className="text-xs font-semibold text-[#367B4B]">ORDERS</p>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-white p-5 rounded-3xl border border-[#245C3A]/10 shadow-[0_4px_20px_rgb(36,92,58,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAF3E7] rounded-full blur-2xl opacity-50" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-2 h-2 rounded-full bg-[#367B4B] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#245C3A]">Live Market</span>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-xs font-medium text-[#202820]">
                  <div className="w-6 h-6 rounded-full bg-[#EAF3E7] flex items-center justify-center">🍅</div>
                  <p>12kg Fresh tomatoes added</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-[#202820]">
                  <div className="w-6 h-6 rounded-full bg-[#EAF3E7] flex items-center justify-center">👨‍🌾</div>
                  <p>New organic farm verified</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-[#202820]">
                  <div className="w-6 h-6 rounded-full bg-[#EAF3E7] flex items-center justify-center">📦</div>
                  <p>24 orders dispatched in Anaimalai</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- MARKETPLACE EDITORIAL SECTION --- */}
      <section className="bg-[#F8F8F2] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-none">
                FRESH
                <br />
                <span className="text-[#367B4B]">FROM NEARBY FARMS</span>
              </h2>
            </div>
            
            {/* Elegant Pill Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-5 py-2.5 rounded-full bg-[#202820] text-white text-xs font-bold shadow-lg shadow-[#202820]/10 transition-transform active:scale-95">
                All Fresh
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-[#245C3A]/10 text-[#202820] text-xs font-bold hover:bg-[#EAF3E7] hover:border-[#75A85A]/30 transition-all">
                Organic Only
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-[#245C3A]/10 text-[#202820] text-xs font-bold hover:bg-[#EAF3E7] hover:border-[#75A85A]/30 transition-all">
                Vegetables
              </button>
              <button className="px-5 py-2.5 rounded-full bg-white border border-[#245C3A]/10 text-[#202820] text-xs font-bold hover:bg-[#EAF3E7] hover:border-[#75A85A]/30 transition-all flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#367B4B]" /> {activeLocation.label.split(',')[0]}
              </button>
            </div>
          </div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {featuredProducts.map((prod, idx) => {
              // Creating a varied grid layout
              let colSpan = "md:col-span-4";
              let rowSpan = "row-span-1";
              
              if (idx === 0) {
                colSpan = "md:col-span-8";
                rowSpan = "md:row-span-2";
              } else if (idx === 1) {
                colSpan = "md:col-span-4";
                rowSpan = "md:row-span-2";
              } else if (idx === 2 || idx === 3 || idx === 4) {
                colSpan = "md:col-span-4";
              }

              const imgUrl = prod.image_paths?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop';

              return (
                <div 
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className={`group relative rounded-[2rem] overflow-hidden bg-white cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(36,92,58,0.12)] ${colSpan} ${rowSpan}`}
                >
                  <img 
                    src={imgUrl} 
                    alt={prod.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/90 via-[#202820]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  {/* Subtle green glow on hover */}
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

                  <div className="absolute top-5 left-5">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                      ● Organic
                    </span>
                  </div>

                  <div className="absolute top-5 right-5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(prod.id); }}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-white hover:bg-white hover:text-[#245C3A]"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-emerald-300 text-xs font-bold mb-1">{prod.farm_name} · {(prod.distance_km || 2.4).toFixed(1)} km</p>
                    <h3 className="text-white text-2xl sm:text-3xl font-black tracking-tight mb-4">{prod.name}</h3>
                    
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <div className="text-white font-bold text-xl">
                        ₹{prod.price} <span className="text-sm font-medium text-emerald-100/70">/ {prod.unit}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(prod.id, 1); }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#245C3A] hover:bg-[#EAF3E7] transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FARMER DISCOVERY --- */}
      <section className="bg-[#202820] text-white py-24 rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 mb-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#245C3A]/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#75A85A]/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
              MEET THE PEOPLE
              <br />
              <span className="text-[#75A85A]">BEHIND YOUR FOOD.</span>
            </h2>
            <button className="flex items-center gap-2 text-sm font-bold text-emerald-300 hover:text-white transition-colors pb-2">
              View all verified farmers <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontally scrolling farmer cards */}
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory relative z-10">
            {featuredFarms.map((farm, idx) => (
              <div 
                key={farm.id} 
                className="min-w-[300px] sm:min-w-[380px] snap-center group cursor-pointer"
                onClick={() => onSelectFarm?.(farm.id)}
              >
                <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden relative mb-6">
                  {/* Circular/Organic image mask approach via border-radius */}
                  <img 
                    src={`https://images.unsplash.com/photo-1595435012529-65b16e45f942?w=600&auto=format&fit=crop&sig=${idx}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    alt={farm.farm_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white mb-1">{(farm as any).farmer_name || (farm as any).contact_name || 'Farmer'}</h3>
                    <p className="text-[#75A85A] text-sm font-bold">{farm.farm_name}</p>
                  </div>
                </div>

                <div className="px-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pollachi, Tamil Nadu</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold">
                      <Star className="w-4 h-4 text-[#E7A83E] fill-[#E7A83E]" />
                      4.9 <span className="text-gray-500 font-normal">({farm.products_count || 12} Products)</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#202820] transition-colors">
                    <ArrowRight className="w-5 h-5 -rotate-45" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FARM-TO-CUSTOMER STORY --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-[10px] font-black text-[#75A85A] uppercase tracking-widest">The Process</span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter">
              Morning Harvest to Your Table.
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#EAF3E7] via-[#245C3A] to-[#EAF3E7] -translate-y-1/2 opacity-30" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              
              <div className="space-y-6 text-center group">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Farm"/>
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">1. Farm</h3>
                  <p className="text-sm text-[#778177] px-4">Local growers nurture crops using traditional methods.</p>
                </div>
              </div>

              <div className="space-y-6 text-center group md:mt-12">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1595856453084-25916053f3e1?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Harvest" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">2. Harvest</h3>
                  <p className="text-sm text-[#778177] px-4">Plucked at dawn when flavor and nutrients peak.</p>
                </div>
              </div>

              <div className="space-y-6 text-center group">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Order" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">3. Ordered</h3>
                  <p className="text-sm text-[#778177] px-4">You purchase directly via our marketplace.</p>
                </div>
              </div>

              <div className="space-y-6 text-center group md:mt-12">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#F8F8F2] overflow-hidden border-4 border-white shadow-xl relative transition-transform duration-500 group-hover:-translate-y-4">
                  <img src="https://images.unsplash.com/photo-1628102491629-778571d893a3?w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Delivery" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#202820] mb-2">4. Delivered</h3>
                  <p className="text-sm text-[#778177] px-4">Fresh to your door the very same morning.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- FARM MAP EXPERIENCE --- */}
      <section className="bg-[#F8F8F2] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-[#245C3A]/5 border border-[#245C3A]/10 grid lg:grid-cols-2 min-h-[600px]">
            
            <div className="p-12 lg:p-20 flex flex-col justify-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAF3E7] rounded-full blur-[60px] opacity-60 pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-none">
                  FARMS
                  <br />
                  <span className="text-[#367B4B]">AROUND YOU.</span>
                </h2>
                <p className="text-base text-[#778177] max-w-sm">
                  Discover exactly where your food comes from. We map every verified farm so you can buy hyper-local.
                </p>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 bg-[#F8F8F2] p-4 rounded-2xl border border-[#E5E9E1]">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl">🍅</div>
                  <div>
                    <p className="text-xs text-[#778177] font-semibold">Closest Farm</p>
                    <p className="text-sm font-bold text-[#202820]">Murugan Grove · 2.4 km</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#F8F8F2] p-4 rounded-2xl border border-[#E5E9E1]">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl">🥥</div>
                  <div>
                    <p className="text-xs text-[#778177] font-semibold">Tender Coconuts</p>
                    <p className="text-sm font-bold text-[#202820]">Anaimalai Farms · 5.1 km</p>
                  </div>
                </div>
              </div>

              <button className="self-start px-8 py-4 bg-[#202820] text-white rounded-full font-bold text-sm hover:bg-[#245C3A] transition-colors flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Open Full Map
              </button>
            </div>

            {/* Stylized Map Area */}
            <div className="bg-[#EAF3E7] relative overflow-hidden min-h-[400px]">
              {/* Minimalist abstract map background */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83v58.34h-58.34l-.83-.83v-58.34h58.34zm-52.96 5.66v48.68h48.68v-48.68h-48.68z\' fill=\'%23245C3A\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />
              
              {/* Animated YOU marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-[#1F6B45] opacity-20 animate-ping" />
                  <div className="w-4 h-4 bg-[#1F6B45] rounded-full shadow-lg ring-4 ring-white" />
                </div>
                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-[#202820] shadow-md mt-1">YOU</span>
              </div>

              {/* Floating Farm Markers */}
              <div className="absolute top-[20%] left-[30%] flex flex-col items-center animate-[float_5s_ease-in-out_infinite]">
                <div className="w-10 h-10 bg-white rounded-full p-1 shadow-xl relative z-10 border-2 border-[#75A85A]">
                  <img src="https://images.unsplash.com/photo-1560416313-414b33c856a9?w=100&auto=format&fit=crop" className="w-full h-full rounded-full object-cover" alt="Farm" />
                </div>
                <div className="w-1 h-4 bg-[#75A85A] -mt-1" />
                <span className="bg-[#202820] text-white px-2 py-0.5 rounded text-[8px] font-bold mt-1">Arun's Farm</span>
              </div>

              <div className="absolute bottom-[30%] right-[25%] flex flex-col items-center animate-[float_6s_ease-in-out_infinite_1s]">
                <div className="w-10 h-10 bg-white rounded-full p-1 shadow-xl relative z-10 border-2 border-[#75A85A]">
                  <img src="https://images.unsplash.com/photo-1595435012529-65b16e45f942?w=100&auto=format&fit=crop" className="w-full h-full rounded-full object-cover" alt="Farm" />
                </div>
                <div className="w-1 h-4 bg-[#75A85A] -mt-1" />
                <span className="bg-[#202820] text-white px-2 py-0.5 rounded text-[8px] font-bold mt-1">Fresh Farm</span>
              </div>

              <div className="absolute top-[40%] right-[15%] flex flex-col items-center animate-[float_4s_ease-in-out_infinite_2s]">
                <div className="w-8 h-8 bg-white rounded-full p-1 shadow-xl relative z-10 border-2 border-[#75A85A]">
                  <Leaf className="w-full h-full text-[#367B4B] p-1" />
                </div>
                <div className="w-1 h-4 bg-[#75A85A] -mt-1" />
                <span className="bg-[#202820] text-white px-2 py-0.5 rounded text-[8px] font-bold mt-1">Organic Farm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE SECTION --- */}
      <section className="bg-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF3E7] flex items-center justify-center">
                <Store className="w-8 h-8 text-[#245C3A]" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-tight">
                Direct From Farm. <br/><span className="text-[#367B4B]">No Middlemen.</span>
              </h2>
              <p className="text-lg text-[#778177] leading-relaxed">
                By purchasing directly from verified growers, you ensure farmers keep 100% of the produce value while you get fresher food at better prices.
              </p>
              <button className="px-6 py-3 rounded-full border-2 border-[#202820] font-bold text-sm hover:bg-[#202820] hover:text-white transition-colors">
                Learn our model
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#EAF3E7] rounded-[3rem] translate-x-4 translate-y-4 -z-10" />
              <img src="https://images.unsplash.com/photo-1595856453084-25916053f3e1?w=800&auto=format&fit=crop" className="rounded-[3rem] w-full object-cover aspect-square shadow-2xl" alt="Direct from farm" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-[#F8F8F2] rounded-[3rem] -translate-x-4 translate-y-4 -z-10" />
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop" className="rounded-[3rem] w-full object-cover aspect-square shadow-2xl" alt="Harvested today" />
            </div>
            <div className="order-1 lg:order-2 space-y-6 max-w-lg lg:ml-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F8F2] flex items-center justify-center">
                <Leaf className="w-8 h-8 text-[#245C3A]" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#202820] tracking-tighter leading-tight">
                Harvested Today. <br/><span className="text-[#367B4B]">Eaten Today.</span>
              </h2>
              <p className="text-lg text-[#778177] leading-relaxed">
                Our platform syncs with morning harvests. Order by 8 PM, and farmers will pluck your produce at dawn for delivery within hours.
              </p>
              <button className="px-6 py-3 rounded-full border-2 border-[#202820] font-bold text-sm hover:bg-[#202820] hover:text-white transition-colors">
                View delivery times
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* --- TRUST SECTION --- */}
      <section className="bg-[#245C3A] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#367B4B]/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center divide-x divide-white/10">
            <div className="space-y-3 px-4">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Verified Farmers</h3>
              <p className="text-xs text-emerald-100/70">100% physically vetted</p>
            </div>
            <div className="space-y-3 px-4">
              <Store className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Transparent Pricing</h3>
              <p className="text-xs text-emerald-100/70">Uzhavar Sandhai rates</p>
            </div>
            <div className="space-y-3 px-4">
              <Leaf className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Fresh Guarantee</h3>
              <p className="text-xs text-emerald-100/70">Plucked same morning</p>
            </div>
            <div className="space-y-3 px-4">
              <MapPin className="w-8 h-8 mx-auto text-[#75A85A]" />
              <h3 className="font-bold text-lg">Hyper Local</h3>
              <p className="text-xs text-emerald-100/70">Sourced within 20km</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BIG FOOTER --- */}
      <footer className="bg-[#202820] pt-32 pb-12 border-t border-white/10 rounded-t-[3rem] mt-2 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 mb-24">
            <div>
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                Growing a<br/>
                <span className="text-[#75A85A]">better way</span><br/>
                to connect.
              </h2>
              <p className="text-emerald-100/60 max-w-sm font-medium">
                FarmBridge is the next-generation digital marketplace connecting you directly to local agricultural heritage.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 lg:ml-auto text-sm">
              <div className="space-y-6">
                <h4 className="font-bold text-white uppercase tracking-widest text-xs">Platform</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Marketplace</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Farmers</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">AI Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold text-white uppercase tracking-widest text-xs">Company</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-emerald-100/70 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Leaf className="w-5 h-5 text-[#75A85A]" /> FarmBridge
            </div>
            <p className="text-xs text-emerald-100/50">
              © {new Date().getFullYear()} FarmBridge Technology. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
    </div>
  );
};
