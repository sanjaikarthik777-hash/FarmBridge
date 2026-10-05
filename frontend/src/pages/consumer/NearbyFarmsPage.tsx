import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  ArrowRight,
  Sprout,
  Truck,
  ChevronRight,
  Layers,
  ArrowLeft,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Farm, Product } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { LocationState } from '../../components/LocationSelectorModal';
import { ProductCard } from '../../components/ProductCard';

interface NearbyFarmsPageProps {
  farms: Farm[];
  products: Product[];
  activeLocation: LocationState;
  onOpenLocationModal: () => void;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartItemQuantities?: Record<string, number>;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  selectedFarmId?: string | null;
  onSelectFarmId?: (farmId: string | null) => void;
}

export const NearbyFarmsPage: React.FC<NearbyFarmsPageProps> = ({
  farms,
  products,
  activeLocation,
  onOpenLocationModal,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartItemQuantities = {},
  wishlistIds = [],
  onToggleWishlist,
  selectedFarmId: initialSelectedFarmId,
  onSelectFarmId,
}) => {
  const t = translations[lang];
  const [selectedRadius, setSelectedRadius] = useState<number | 'all'>('all');
  const [activeFarmId, setActiveFarmId] = useState<string | null>(initialSelectedFarmId || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize internal active farm with parent if updated
  const handleSelectFarm = (id: string | null) => {
    setActiveFarmId(id);
    onSelectFarmId?.(id);
  };

  // Filter farms by radius and search query
  const nearbyFarms = useMemo(() => {
    return [...farms]
      .filter((f) => {
        if (selectedRadius !== 'all' && (f.distance_km ?? 999) > selectedRadius) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            f.farm_name.toLowerCase().includes(q) ||
            (f.village && f.village.toLowerCase().includes(q)) ||
            (f.region && f.region.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
  }, [farms, selectedRadius, searchQuery]);

  // Currently focused farm
  const currentFarm = useMemo(() => {
    if (!activeFarmId) return null;
    return farms.find((f) => f.id === activeFarmId) || null;
  }, [farms, activeFarmId]);

  // Products belonging to the focused farm
  const farmProducts = useMemo(() => {
    if (!activeFarmId) return [];
    return products.filter((p) => p.farm_id === activeFarmId && p.status === 'active');
  }, [products, activeFarmId]);

  // Demo Farm Photos mapping
  const getFarmCoverImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop',
    ];
    return images[index % images.length];
  };

  return (
    <div className="space-y-6 pb-16">
      {/* If a farm is selected, render the dedicated FARM DETAIL VIEW */}
      {currentFarm ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSelectFarm(null)}
              className="flex items-center gap-2 text-xs font-bold text-[#245C3A] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Nearby Farms</span>
            </button>
            <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
              Demo Farm Profile
            </span>
          </div>

          {/* Farm Header Showcase */}
          <div className="bg-white rounded-3xl border border-[#E5E9E1] overflow-hidden shadow-xs">
            <div className="relative h-48 sm:h-64 bg-[#245C3A] overflow-hidden">
              <img
                src={getFarmCoverImage(0)}
                alt={currentFarm.farm_name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20">
                  <Sprout className="w-3.5 h-3.5 text-[#75A85A]" />
                  <span>Generational Grower</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentFarm.farm_name}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentFarm.farm_address || `${currentFarm.village || 'Pollachi'}, Tamil Nadu`}</span>
                  {currentFarm.distance_km !== undefined && (
                    <span>• {currentFarm.distance_km.toFixed(1)} km away</span>
                  )}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#778177]">
                  About This Grove
                </h3>
                <p className="text-xs sm:text-sm text-[#202820] leading-relaxed max-w-3xl">
                  {currentFarm.description ||
                    'Family-managed natural agriculture grove in Pollachi. Dedicated to pesticide-free crop cultivation, fresh morning harvesting, and direct community supply.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1]">
                  <div className="text-[10px] font-bold text-[#778177] uppercase">Active Crops</div>
                  <div className="text-sm font-extrabold text-[#245C3A]">{farmProducts.length} Listed</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1]">
                  <div className="text-[10px] font-bold text-[#778177] uppercase">Region</div>
                  <div className="text-sm font-extrabold text-[#202820]">{currentFarm.region || 'Pollachi'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1]">
                  <div className="text-[10px] font-bold text-[#778177] uppercase">Payout Method</div>
                  <div className="text-sm font-extrabold text-emerald-700">100% Direct</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1]">
                  <div className="text-[10px] font-bold text-[#778177] uppercase">Harvest Type</div>
                  <div className="text-sm font-extrabold text-[#202820]">Plucked on Order</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Produce from this Farm */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#202820]">
                Fresh Harvest from {currentFarm.farm_name}
              </h2>
              <span className="text-xs text-[#778177]">{farmProducts.length} items available</span>
            </div>

            {farmProducts.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white border border-[#E5E9E1] text-center text-xs text-[#778177]">
                No active produce currently listed for this demo farm.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {farmProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    lang={lang}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                    onUpdateCartQuantity={onUpdateCartQuantity}
                    cartQuantity={cartItemQuantities[prod.id] || 0}
                    isWishlisted={wishlistIds.includes(prod.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL FARMS DISCOVERY VIEW */
        <div className="space-y-6">
          {/* Page Title & Location Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E9E1] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820] tracking-tight">
                  {t.nav_nearby_farms}
                </h1>
                <span className="bg-[#EAF3E7] text-[#245C3A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C4DFC0]">
                  {nearbyFarms.length} Farms
                </span>
              </div>
              <p className="text-xs text-[#778177] mt-1">
                Discover family groves around{' '}
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="font-bold text-[#245C3A] underline cursor-pointer"
                >
                  {activeLocation.label}
                </button>
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778177]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farm name or village..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-[#E5E9E1] text-xs font-medium text-[#202820] focus:border-[#367B4B] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Distance Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#778177] mr-1">Radius:</span>
            {[
              { label: 'All Distances', val: 'all' },
              { label: '< 5 km', val: 5 },
              { label: '< 15 km', val: 15 },
              { label: '< 25 km', val: 25 },
              { label: '< 50 km', val: 50 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelectedRadius(item.val as any)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRadius === item.val
                    ? 'bg-[#245C3A] text-white shadow-xs'
                    : 'bg-white text-[#778177] hover:text-[#202820] border border-[#E5E9E1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyFarms.map((farm, idx) => (
              <div 
                key={farm.id} 
                onClick={() => handleSelectFarm(farm.id)}
                className="group cursor-pointer"
              >
                <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden relative mb-4">
                  <img 
                    src={getFarmCoverImage(idx)} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    alt={farm.farm_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/90 via-[#202820]/20 to-transparent opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                  
                  {/* Distance Badge */}
                  {farm.distance_km !== undefined && (
                    <div className="absolute top-5 left-5">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-xs flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {farm.distance_km < 1 ? '< 1 km' : `${farm.distance_km.toFixed(1)} km`}
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-[#75A85A] text-[11px] font-bold mb-1 uppercase tracking-wider">{farm.village || 'Pollachi'}</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight leading-tight">{farm.farm_name}</h3>
                    <p className="text-emerald-100/80 text-xs line-clamp-2 pr-4">{farm.description || 'Dedicated family grove practicing natural agriculture and direct local harvest.'}</p>
                  </div>
                </div>

                <div className="px-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#202820]">
                      <Sprout className="w-4 h-4 text-[#367B4B]" />
                      {farm.products_count || 12} Fresh Crops
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-[#E5E9E1] flex items-center justify-center group-hover:bg-[#202820] group-hover:text-white group-hover:border-[#202820] transition-colors shadow-xs">
                    <ArrowRight className="w-4 h-4 -rotate-45" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
