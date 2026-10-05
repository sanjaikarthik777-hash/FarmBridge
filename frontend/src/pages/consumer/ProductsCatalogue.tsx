import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Package
} from 'lucide-react';
import { Product, Category, Farm } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { ProductCard } from '../../components/ProductCard';
import { LocationState } from '../../components/LocationSelectorModal';

interface ProductsCatalogueProps {
  products: Product[];
  categories: Category[];
  farms: Farm[];
  activeLocation: LocationState;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartItemQuantities?: Record<string, number>;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  initialCategoryId?: string;
  initialSearchQuery?: string;
}

export const ProductsCatalogue: React.FC<ProductsCatalogueProps> = ({
  products,
  categories,
  activeLocation,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartItemQuantities = {},
  wishlistIds = [],
  onToggleWishlist,
  initialCategoryId,
  initialSearchQuery = '',
}) => {
  const t = translations[lang];

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [selectedRadius, setSelectedRadius] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [sortBy, setSortBy] = useState<'nearest' | 'price_asc' | 'price_desc' | 'name'>('nearest');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // In-stock filter
      if (inStockOnly && (p.available_quantity <= 0 || p.status === 'sold_out')) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }

      // Radius filter
      if (selectedRadius !== 'all') {
        if (p.distance_km === undefined || p.distance_km > selectedRadius) {
          return false;
        }
      }

      // Max price filter
      if (p.price > maxPrice) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.name_ta && p.name_ta.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.farm_name && p.farm_name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [products, inStockOnly, selectedCategory, selectedRadius, maxPrice, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a.distance_km ?? 999) - (b.distance_km ?? 999);
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedRadius('all');
    setSearchQuery('');
    setMaxPrice(500);
    setInStockOnly(false);
    setSortBy('nearest');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E9E1] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820] tracking-tight">
              {t.nav_products}
            </h1>
            <span className="bg-[#EAF3E7] text-[#245C3A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#C4DFC0]">
              {sortedProducts.length} Available
            </span>
          </div>
          <p className="text-xs text-[#778177] mt-1">
            Fresh morning harvests listed by verified family growers around {activeLocation.label}
          </p>
        </div>

        {/* Search Input on Desktop & Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778177]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search produce or farm..."
              className="w-full pl-10 pr-8 py-2 rounded-2xl bg-white border border-[#E5E9E1] text-xs font-medium text-[#202820] focus:border-[#367B4B] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#EAF3E7] text-[#245C3A] text-xs font-bold border border-[#C4DFC0] shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Category Tabs Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#245C3A] text-white shadow-xs'
              : 'bg-white text-[#778177] hover:text-[#202820] border border-[#E5E9E1]'
          }`}
        >
          {t.all_categories}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#245C3A] text-white shadow-xs'
                : 'bg-white text-[#778177] hover:text-[#202820] border border-[#E5E9E1]'
            }`}
          >
            {lang === 'ta' && cat.name_ta ? cat.name_ta : cat.name}
          </button>
        ))}
      </div>

      {/* 3. Main Catalogue Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block bg-white rounded-3xl border border-[#E5E9E1] p-5 space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#E5E9E1] pb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#202820]">
              <SlidersHorizontal className="w-4 h-4 text-[#367B4B]" />
              <span>Filter Produce</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[#367B4B] hover:text-[#245C3A] hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-[#778177] uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8F8F2] border border-[#E5E9E1] text-xs font-semibold text-[#202820] focus:border-[#367B4B] focus:outline-hidden"
            >
              <option value="nearest">Distance: Nearest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Produce Name</option>
            </select>
          </div>

          {/* Distance Radius */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-[#778177] uppercase tracking-wider">
              Distance Radius
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Any Distance', val: 'all' },
                { label: '< 5 km', val: 5 },
                { label: '< 15 km', val: 15 },
                { label: '< 30 km', val: 30 },
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setSelectedRadius(r.val as any)}
                  className={`py-1.5 px-2.5 rounded-xl font-semibold border text-center transition-all cursor-pointer ${
                    selectedRadius === r.val
                      ? 'bg-[#EAF3E7] text-[#245C3A] border-[#367B4B]'
                      : 'bg-[#F8F8F2] text-[#778177] border-[#E5E9E1]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="text-[11px] font-extrabold text-[#778177] uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-extrabold text-[#245C3A]">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#245C3A] cursor-pointer"
            />
          </div>

          {/* Stock Availability */}
          <div className="pt-2 border-t border-[#E5E9E1]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#202820]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#245C3A] focus:ring-[#367B4B] accent-[#245C3A]"
              />
              <span>In-Stock Produce Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-4">
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E9E1] p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#202820]">No Matching Produce Found</h3>
                <p className="text-xs text-[#778177] max-w-sm mx-auto">
                  Try adjusting your distance radius, price filter, or searching for a different harvest crop.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#245C3A] hover:bg-[#1b452b] text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProducts.map((product) => (
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
          )}
        </div>
      </div>

      {/* 4. Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E9E1] pb-4">
                <h3 className="text-sm font-bold text-[#202820]">Filter & Sort</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#778177]">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E9E1] text-xs font-semibold"
                >
                  <option value="nearest">Distance: Nearest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Distance Radius */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#778177]">Max Distance</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    { label: 'Any', val: 'all' },
                    { label: '< 5 km', val: 5 },
                    { label: '< 15 km', val: 15 },
                    { label: '< 30 km', val: 30 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setSelectedRadius(r.val as any)}
                      className={`p-2 rounded-xl border ${
                        selectedRadius === r.val ? 'bg-[#EAF3E7] text-[#245C3A] border-[#367B4B]' : 'bg-[#F8F8F2] text-[#778177]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Max Price</span>
                  <span className="text-[#245C3A]">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#245C3A]"
                />
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-[#245C3A] accent-[#245C3A]"
                />
                <span>In-Stock Only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#E5E9E1] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#778177]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#245C3A] text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
