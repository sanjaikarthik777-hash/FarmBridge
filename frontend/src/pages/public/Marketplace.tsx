import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Info,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Product, Category } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface MarketplaceProps {
  products: Product[];
  categories: Category[];
  lang: Language;
  onAddToCart: (productId: string, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
  onGoToFarmer: () => void;
  onGoToAI: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  products,
  categories,
  lang,
  onAddToCart,
  onSelectProduct,
  onGoToFarmer,
  onGoToAI,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const t = translations[lang];

  // Areas filter
  const areas = ['all', 'Aliyar Road', 'Anaimalai Hills', 'Pollachi Central'];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory && prod.category_id !== selectedCategory) return false;

      // Area filter
      if (selectedArea !== 'all') {
        const farmRegion = prod.farm_name?.toLowerCase() || '';
        if (selectedArea === 'Aliyar Road' && !farmRegion.includes('thennam') && !farmRegion.includes('aliyar')) {
          return false;
        }
        if (selectedArea === 'Anaimalai Hills' && !farmRegion.includes('anaimalai')) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesTa = prod.name_ta?.toLowerCase().includes(q) || false;
        const matchesDesc = prod.description?.toLowerCase().includes(q) || false;
        const matchesFarm = prod.farm_name?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesTa && !matchesDesc && !matchesFarm) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedArea, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero AgriTech Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#175436] via-[#1F6B45] to-[#2B7A50] text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#FAFBF7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#E7A83E]" />
            Direct Pollachi Harvest • Zero Unnecessary Middlemen
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Direct from Western Ghats Groves to Your Kitchen.
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
            Freshly plucked tomatoes, authentic Pollachi tender coconuts, and cold-pressed virgin oils. Farmers keep control of pricing, buyers enjoy 100% price transparency.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('produce-catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-[#1F6B45] hover:bg-[#FAFBF7] font-bold text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {t.explore_produce}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoToFarmer}
              className="bg-emerald-900/40 hover:bg-emerald-900/60 text-white border border-emerald-400/40 font-bold text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              {t.join_as_farmer}
            </button>
            <button
              onClick={onGoToAI}
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border border-amber-300/40 font-bold text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-[#E7A83E]" />
              AI Market Reference
            </button>
          </div>
        </div>

        {/* Value Metrics Pill */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div>
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-xs text-emerald-200">Disclosed Fees</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">₹5.00</div>
            <div className="text-xs text-emerald-200">Nominal Service Fee</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">Dawn</div>
            <div className="text-xs text-emerald-200">Daily Fresh Harvest</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">Pollachi</div>
            <div className="text-xs text-emerald-200">Coimbatore Pilot</div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section id="produce-catalog" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8E3] bg-white focus:outline-hidden focus:border-[#1F6B45] focus:ring-2 focus:ring-[#1F6B45]/15 text-sm"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1F6B45] shrink-0" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-3 rounded-xl border border-[#E2E8E3] bg-white text-sm font-semibold text-gray-700 focus:outline-hidden focus:border-[#1F6B45]"
            >
              <option value="all">📍 {t.all_areas}</option>
              <option value="Aliyar Road">🌿 Aliyar Road Foothills</option>
              <option value="Anaimalai Hills">⛰️ Anaimalai Organic Valley</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-[#1F6B45] text-white shadow-xs'
                : 'bg-white text-[#68736B] border border-[#E2E8E3] hover:bg-gray-50'
            }`}
          >
            {t.all_categories}
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1F6B45] text-white shadow-xs'
                    : 'bg-white text-[#68736B] border border-[#E2E8E3] hover:bg-gray-50'
                }`}
              >
                {c.icon === 'Carrot' && '🥕'}
                {c.icon === 'Apple' && '🍌'}
                {c.icon === 'Palmtree' && '🥥'}
                {c.icon === 'Leaf' && '🌿'}
                {c.icon === 'Droplets' && '🫒'}
                <span>{lang === 'ta' && c.name_ta ? c.name_ta : c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Listings Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#202820]">
            Fresh Produce Listings ({filteredProducts.length})
          </h2>
          <span className="text-xs text-[#68736B]">
            Showing directly verified farm harvests
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8E3] space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1F6B45] mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No produce matches your search</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Try changing the search query, selecting another category, or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedArea('all');
              }}
              className="btn-secondary text-xs"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const isAvailable = prod.status === 'active' && prod.available_quantity > 0;
              const imgUrl =
                prod.image_paths && prod.image_paths.length > 0
                  ? prod.image_paths[0]
                  : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop';

              return (
                <div
                  key={prod.id}
                  className="card-farm flex flex-col justify-between overflow-hidden group border border-[#E2E8E3] bg-white rounded-2xl hover:shadow-lg transition-all"
                >
                  <div>
                    {/* Produce Photo */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100">
                      <img
                        src={imgUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Freshness Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Plucked Today
                        </span>
                      </div>

                      {/* Stock Pill */}
                      <div className="absolute top-3 right-3">
                        {isAvailable ? (
                          <span className="bg-white/95 text-[#1F6B45] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-emerald-100">
                            {prod.available_quantity} {prod.unit} available
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                            {t.out_of_stock}
                          </span>
                        )}
                      </div>

                      {/* Fulfilment Modes */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {prod.fulfilment_options.map((opt) => (
                          <span key={opt} className="bg-black/60 text-white text-[9px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs capitalize">
                            {opt === 'pickup' ? '🚜 Farm Pickup' : '🛵 Delivery'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3C9B62]">
                            {prod.farm_name || 'Pollachi Grove'}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Min: {prod.minimum_order_quantity} {prod.unit}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#202820] group-hover:text-[#1F6B45] transition-colors leading-snug">
                          {lang === 'ta' && prod.name_ta ? prod.name_ta : prod.name}
                        </h3>
                      </div>

                      <p className="text-xs text-[#68736B] line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            Direct Farmer Price
                          </div>
                          <div className="text-xl font-extrabold text-[#1F6B45]">
                            ₹{prod.price.toFixed(2)}{' '}
                            <span className="text-xs font-normal text-gray-600">
                              / {prod.unit}
                            </span>
                          </div>
                        </div>

                        {/* Farmer avatar */}
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500 font-medium">Farmer</div>
                          <div className="text-xs font-bold text-gray-800">
                            {prod.farmer_name || 'Murugan P.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="btn-outline text-xs py-2 px-3"
                    >
                      {t.view_details}
                    </button>
                    <button
                      disabled={!isAvailable}
                      onClick={() => onAddToCart(prod.id, prod.minimum_order_quantity)}
                      className={`text-xs py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isAvailable
                          ? 'bg-[#1F6B45] hover:bg-[#175436] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {t.add_to_cart}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
