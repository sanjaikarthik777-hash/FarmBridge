import React, { useMemo } from 'react';
import {
  Sprout,
  MapPin,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  TrendingDown,
  Compass,
  ChevronRight,
  CheckCircle2,
  Leaf,
  HeartHandshake,
  Clock,
  Award,
  Users
} from 'lucide-react';
import { Product, Category, Farm } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { ProductCard } from '../../components/ProductCard';
import { LocationState } from '../../components/LocationSelectorModal';

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
}) => {
  const t = translations[lang];

  // 1. Fresh produce near you (sorted by distance ascending)
  const nearbyProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.status === 'active')
      .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
      .slice(0, 8);
  }, [products]);

  // 2. Best Value Products (Uzhavar Sandhai benchmark best buys)
  const bestValueProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.status === 'active')
      .sort((a, b) => a.price - b.price)
      .slice(0, 4);
  }, [products]);

  // Standard category definitions with high-res photography
  const categoryShowcase = [
    {
      id: 'cat-veg',
      name: 'Vegetables',
      name_ta: 'காய்கறிகள்',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop',
      count: 'Country heirloom picks',
    },
    {
      id: 'cat-fruit',
      name: 'Fruits',
      name_ta: 'பழங்கள்',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop',
      count: 'Naturally ripened',
    },
    {
      id: 'cat-grain',
      name: 'Grains',
      name_ta: 'தானியங்கள்',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop',
      count: 'Traditional rice & millets',
    },
    {
      id: 'cat-pulse',
      name: 'Pulses',
      name_ta: 'பருப்பு வகைகள்',
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&auto=format&fit=crop',
      count: 'Farm direct unpolished',
    },
    {
      id: 'cat-dairy',
      name: 'Dairy',
      name_ta: 'பால் பொருட்கள்',
      image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&auto=format&fit=crop',
      count: 'A2 fresh farm milk & ghee',
    },
    {
      id: 'cat-other',
      name: 'Other Products',
      name_ta: 'பிற பொருட்கள்',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop',
      count: 'Cold-pressed oils & honey',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-[#245C3A] text-white shadow-xl shadow-[#245C3A]/10 border border-[#E5E9E1]">
        {/* Background photo overlay */}
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#75A85A]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-16 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#EAF3E7] text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#75A85A]" />
            <span>Pollachi Regional Direct Harvest Pilot</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fresh From Nearby Farms, Straight to You
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
            Discover fresh produce from local farmers around you. Shop locally, support farmers and enjoy freshness closer to home.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigateToCatalogue()}
              className="px-6 py-3.5 rounded-2xl bg-white text-[#245C3A] hover:bg-[#EAF3E7] font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-[#245C3A]" />
            </button>

            <button
              type="button"
              onClick={onNavigateToNearbyFarms}
              className="px-6 py-3.5 rounded-2xl bg-[#367B4B]/80 hover:bg-[#367B4B] text-white border border-white/20 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#75A85A]" />
              <span>Find Nearby Farms</span>
            </button>
          </div>
        </div>

        {/* Hero Pillars Bar */}
        <div className="relative z-10 bg-black/20 backdrop-blur-xs px-6 py-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-emerald-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#75A85A] shrink-0" />
            <span>100% Direct to Farmer</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#75A85A] shrink-0" />
            <span>Uzhavar Sandhai Daily Price</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#75A85A] shrink-0" />
            <span>True GPS Radius Discovery</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#75A85A] shrink-0" />
            <span>Morning Farm Gate Delivery</span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#202820] tracking-tight">
              {t.shop_category}
            </h2>
            <p className="text-xs text-[#778177]">
              Explore freshly harvested produce categorized by farm type
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToCatalogue()}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Produce</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoryShowcase.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToCatalogue(cat.id)}
              className="group bg-white rounded-3xl border border-[#E5E9E1] hover:border-[#75A85A] hover:shadow-lg transition-all duration-300 p-3 flex flex-col items-center text-center space-y-2.5 cursor-pointer"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#F8F8F2] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-[#202820] group-hover:text-[#245C3A] transition-colors">
                  {lang === 'ta' ? cat.name_ta : cat.name}
                </h3>
                <p className="text-[10px] text-[#778177] font-medium leading-tight">
                  {cat.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FRESH PICKS NEAR YOU */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#202820] tracking-tight">
                {t.fresh_near_you}
              </h2>
              <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C4DFC0]">
                Nearest First
              </span>
            </div>
            <p className="text-xs text-[#778177]">
              Calculated from <span className="font-semibold text-[#202820]">{activeLocation.label}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToNearbyFarms}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{t.hero_cta_farms}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nearbyProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onUpdateCartQuantity={onUpdateCartQuantity}
              cartQuantity={cartItemQuantities[product.id] || 0}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E9E1] space-y-8 shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#367B4B] bg-[#EAF3E7] px-3 py-1 rounded-full border border-[#C4DFC0]">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202820] tracking-tight">
            How FarmBridge Works
          </h2>
          <p className="text-xs sm:text-sm text-[#778177]">
            Direct connection between local family groves in Pollachi and your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] space-y-3 relative group hover:border-[#75A85A] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3E7] text-[#245C3A] font-extrabold flex items-center justify-center text-lg shadow-2xs">
              01
            </div>
            <h3 className="text-sm font-bold text-[#202820]">Discover Nearby Groves</h3>
            <p className="text-xs text-[#778177] leading-relaxed">
              Find genuine local farms within your accurate GPS radius across Pollachi, Anaimalai, and Kinathukadavu.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] space-y-3 relative group hover:border-[#75A85A] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3E7] text-[#245C3A] font-extrabold flex items-center justify-center text-lg shadow-2xs">
              02
            </div>
            <h3 className="text-sm font-bold text-[#202820]">Harvested to Your Order</h3>
            <p className="text-xs text-[#778177] leading-relaxed">
              Farmers pluck fresh vegetables and tender coconuts in the morning. Zero multi-day cold storage holding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] space-y-3 relative group hover:border-[#75A85A] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3E7] text-[#245C3A] font-extrabold flex items-center justify-center text-lg shadow-2xs">
              03
            </div>
            <h3 className="text-sm font-bold text-[#202820]">100% Payout to Farmers</h3>
            <p className="text-xs text-[#778177] leading-relaxed">
              Transparent platform fees with 100% of the produce value going directly into the farmer's pocket at Uzhavar Sandhai rates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. NEARBY DEMO FARMS */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#F8F8F2] border border-[#E5E9E1] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#202820]">
                {t.featured_farms}
              </h2>
              <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                Demo Farm Showcase
              </span>
            </div>
            <p className="text-xs text-[#778177]">
              Fictional illustrative farms for demonstration in Pollachi & Anaimalai
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToNearbyFarms}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All Farms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.slice(0, 3).map((farm) => (
            <div
              key={farm.id}
              onClick={() => onSelectFarm?.(farm.id)}
              className="p-5 rounded-3xl bg-white border border-[#E5E9E1] hover:border-[#75A85A] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍🌾</span>
                    <span className="text-[10px] font-bold bg-[#EAF3E7] text-[#245C3A] px-2 py-0.5 rounded-full border border-[#C4DFC0]">
                      Demo Listing
                    </span>
                  </div>
                  {farm.distance_km !== undefined && (
                    <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#367B4B]" />
                      {farm.distance_km.toFixed(1)} km
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#202820] group-hover:text-[#245C3A] transition-colors">
                  {farm.farm_name}
                </h3>

                <p className="text-xs text-[#778177] line-clamp-2">
                  {farm.description || 'Natural harvest grove managed by generational family growers.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E9E1] flex items-center justify-between text-xs">
                <span className="text-[#367B4B] font-bold flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>{farm.products_count || 'Fresh'} crops</span>
                </span>
                <span className="text-[#778177] group-hover:text-[#245C3A] font-bold flex items-center gap-1">
                  <span>View Farm</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SEASONAL HARVEST PROMOTIONAL BANNER */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#245C3A] to-[#367B4B] text-white p-6 sm:p-10 shadow-lg border border-[#E5E9E1] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#EAF3E7] text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#75A85A]" />
            <span>Seasonal Harvest Spotlight</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pollachi Tender Coconuts & Heirloom Vegetables
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            Hand-harvested at dawn from pesticide-free palm groves around the Aliyar basin. Support local agriculture with guaranteed zero-middlemen pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToCatalogue()}
          className="px-6 py-3 rounded-2xl bg-white text-[#245C3A] hover:bg-[#EAF3E7] text-xs font-extrabold shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
        >
          Shop Seasonal Harvest
        </button>
      </section>

      {/* 7. WHY FARMBRIDGE & LOCAL FARMING BENEFITS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-white border border-[#E5E9E1] space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#367B4B]" />
          </div>
          <h2 className="text-lg font-extrabold text-[#202820]">
            Local Farming Benefits
          </h2>
          <p className="text-xs text-[#778177] leading-relaxed">
            By purchasing directly from Pollachi growers, you cut out unnecessary transport emissions, eliminate chemical holding treatments, and help preserve indigenous South Indian seed varieties.
          </p>
          <div className="space-y-2 pt-2 text-xs text-[#202820] font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#75A85A]" />
              <span>Reduced food miles from farm gate to kitchen</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#75A85A]" />
              <span>Maximum nutrient retention from same-day plucking</span>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#E5E9E1] space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-[#367B4B]" />
          </div>
          <h2 className="text-lg font-extrabold text-[#202820]">
            Empowering Farmer Communities
          </h2>
          <p className="text-xs text-[#778177] leading-relaxed">
            Traditional retail markups consume up to 60% of produce value. FarmBridge bypasses commission syndicates so smallholder families retain full value for their labor and soil stewardship.
          </p>
          <div className="space-y-2 pt-2 text-xs text-[#202820] font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#75A85A]" />
              <span>Fair, transparent Uzhavar Sandhai daily benchmarking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#75A85A]" />
              <span>Zero delayed settlement or distributor deductions</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BEST VALUE PICKS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#202820] tracking-tight">
                {t.best_value}
              </h2>
              <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#C4DFC0]">
                <TrendingDown className="w-3 h-3 text-[#367B4B]" />
                Daily Price Match
              </span>
            </div>
            <p className="text-xs text-[#778177]">
              Fair daily pricing with zero commission deduction from farmer payout
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {bestValueProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onUpdateCartQuantity={onUpdateCartQuantity}
              cartQuantity={cartItemQuantities[product.id] || 0}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
