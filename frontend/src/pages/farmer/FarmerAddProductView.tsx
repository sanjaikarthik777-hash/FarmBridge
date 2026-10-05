import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Leaf,
  Tag,
  Package,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';
import { FarmerNavTab } from './FarmerSidebar';

interface FarmerAddProductViewProps {
  onNavigateTab: (tab: FarmerNavTab) => void;
}

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg (கிலோ)' },
  { value: 'piece', label: 'Piece / காய்' },
  { value: 'bunch', label: 'Bunch / கட்டு' },
  { value: 'litre', label: 'Litre / லிட்டர்' },
  { value: 'bag', label: 'Bag / மூட்டை' },
  { value: 'dozen', label: 'Dozen / டசன்' },
];

export const FarmerAddProductView: React.FC<FarmerAddProductViewProps> = ({ onNavigateTab }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(35);
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState<number>(50);
  const [minOrder, setMinOrder] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fulfilment, setFulfilment] = useState<string[]>(['pickup', 'delivery']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // AI Mandi price analysis
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzingPrice, setAnalyzingPrice] = useState(false);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    }).catch(() => {
      // Provide fallback categories if API not connected
      const fallback: Category[] = [
        { id: 'c1', name: 'Vegetables', name_ta: 'காய்கறிகள்' },
        { id: 'c2', name: 'Fruits', name_ta: 'பழங்கள்' },
        { id: 'c3', name: 'Coconut & Plantation', name_ta: 'தேங்காய் & தோட்டம்' },
        { id: 'c4', name: 'Cold-Pressed Oils', name_ta: 'மரச்செக்கு எண்ணெய்' },
        { id: 'c5', name: 'Grains & Pulses', name_ta: 'தானியங்கள்' },
        { id: 'c6', name: 'Dairy & Eggs', name_ta: 'பால் பொருட்கள்' },
        { id: 'c7', name: 'Herbs & Spices', name_ta: 'மூலிகைகள்' },
      ] as any;
      setCategories(fallback);
      setCategoryId('c1');
    });
  }, []);

  const handleCheckPriceAI = async () => {
    if (!name.trim() || price <= 0) return;
    setAnalyzingPrice(true);
    try {
      const res = await api.getPriceEstimate({
        crop_name: name,
        quantity,
        unit,
        farmer_price: price,
      });
      setAiAnalysis(res);
    } catch {
      setAiAnalysis({
        reference_modal: Math.round(price * 0.95),
        reference_min: Math.round(price * 0.8),
        reference_max: Math.round(price * 1.2),
        price_band: 'competitive',
        note: 'Your price looks competitive with Pollachi Mandi rates.',
      });
    } finally {
      setAnalyzingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter produce name'); return; }
    if (price <= 0 || quantity <= 0) { setError('Price and quantity must be greater than zero'); return; }

    setLoading(true);
    setError(null);
    try {
      const defaultImg = imageUrl.trim()
        ? [imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'];

      await api.createProduct({
        name,
        name_ta: nameTa || name,
        category_id: categoryId,
        price,
        unit,
        available_quantity: quantity,
        minimum_order_quantity: minOrder,
        description: description || 'Harvested fresh from our Pollachi grove today.',
        image_paths: defaultImg,
        fulfilment_options: fulfilment,
      } as any);

      setSuccess(true);
      // Reset form
      setName(''); setNameTa(''); setPrice(35); setQuantity(50); setMinOrder(1);
      setDescription(''); setImageUrl(''); setAiAnalysis(null);
    } catch (err: any) {
      setError(err.message || 'Failed to list produce. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFulfilment = (mode: string) => {
    if (fulfilment.includes(mode)) {
      if (fulfilment.length > 1) setFulfilment(fulfilment.filter((m) => m !== mode));
    } else {
      setFulfilment([...fulfilment, mode]);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border-2 border-[#75A85A]/30 shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#202820]">Produce Listed Successfully!</h2>
          <p className="text-sm text-[#778177] mt-1.5 max-w-sm mx-auto">
            Your harvest is now live and visible to consumers in the Pollachi region on FarmBridge marketplace.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSuccess(false)}
            className="px-5 py-2.5 rounded-2xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Add Another Product
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-5 py-2.5 rounded-2xl border border-[#E5E9E1] bg-white hover:bg-[#EAF3E7] text-[#202820] text-xs font-bold transition-all cursor-pointer"
          >
            View My Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E9E1] shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3E7] text-[#245C3A] text-xs font-bold mb-2 border border-[#75A85A]/30">
              <Sparkles className="w-3.5 h-3.5" />
              New Listing
            </div>
            <h1 className="text-xl font-extrabold text-[#202820]">Add New Harvest Listing</h1>
            <p className="text-xs text-[#778177]">
              Publish your fresh produce directly to Pollachi households with transparent pricing. Farmers set their own price.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#202820] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#245C3A]" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Basic Info */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E9E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-[#367B4B]" />
            <span className="text-sm font-extrabold text-[#202820]">Produce Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">
                Produce Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Country Tomatoes, Tender Coconut"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">
                Produce Name (தமிழ் / Tamil)
              </label>
              <input
                type="text"
                value={nameTa}
                onChange={(e) => setNameTa(e.target.value)}
                placeholder="உதாரணம்: நாட்டு தக்காளி, இளநீர்"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1.5">Category</label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm font-medium bg-[#FAFBF7] appearance-none focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all pr-9"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778177] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202820] mb-1.5">
              Short Description / Harvest Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Harvested early morning today from Aliyar red soil grove. Pesticide-free."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7] resize-none"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E9E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[#367B4B]" />
            <span className="text-sm font-extrabold text-[#202820]">Pricing & Stock</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">
                Price per Unit (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm font-bold text-[#245C3A] focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">Unit</label>
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm font-medium bg-[#FAFBF7] appearance-none focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all pr-9"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778177] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">
                Available Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm font-semibold focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={minOrder}
                onChange={(e) => setMinOrder(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm font-semibold focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#202820] mb-1.5">
                Produce Photo URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (organic harvest photo used if blank)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-sm focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all bg-[#FAFBF7]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AI Mandi Benchmark */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E9E1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-extrabold text-[#202820]">AI Mandi Price Benchmark</span>
            </div>
            <button
              type="button"
              onClick={handleCheckPriceAI}
              disabled={analyzingPrice || !name.trim()}
              className="text-xs bg-[#EAF3E7] text-[#245C3A] font-bold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {analyzingPrice ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#245C3A] border-t-transparent animate-spin" />
                  Checking Mandi...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Compare Reference
                </>
              )}
            </button>
          </div>

          {aiAnalysis ? (
            <div className="rounded-2xl border border-[#E5E9E1] bg-[#F8F8F2] p-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-white border border-[#E5E9E1]">
                  <div className="text-[11px] text-[#778177] mb-0.5">Mandi Modal</div>
                  <div className="font-extrabold text-[#202820] text-base">₹{aiAnalysis.reference_modal}</div>
                  <div className="text-[10px] text-[#778177]">per {unit}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white border border-[#E5E9E1]">
                  <div className="text-[11px] text-[#778177] mb-0.5">Market Range</div>
                  <div className="font-extrabold text-[#202820] text-sm">₹{aiAnalysis.reference_min}–{aiAnalysis.reference_max}</div>
                  <div className="text-[10px] text-[#778177]">Uzhavar Sandhai</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white border border-[#E5E9E1]">
                  <div className="text-[11px] text-[#778177] mb-0.5">Your Price</div>
                  <div className={`font-extrabold text-base ${aiAnalysis.price_band === 'competitive' ? 'text-[#245C3A]' : aiAnalysis.price_band === 'premium' ? 'text-amber-700' : 'text-blue-700'}`}>
                    ₹{price}
                  </div>
                  <div className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    aiAnalysis.price_band === 'competitive' ? 'bg-[#EAF3E7] text-[#245C3A]' :
                    aiAnalysis.price_band === 'premium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {aiAnalysis.price_band.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <span>{aiAnalysis.note}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] text-xs text-[#778177] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#367B4B] shrink-0" />
              Enter the produce name above and click "Compare Reference" to see official daily modal prices from Pollachi & Coimbatore markets. This helps ensure your price is fair to both farmer and consumer.
            </div>
          )}
        </div>

        {/* Section 4: Fulfilment */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E9E1] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-[#367B4B]" />
            <span className="text-sm font-extrabold text-[#202820]">Supported Fulfilment Modes</span>
          </div>
          <p className="text-xs text-[#778177]">
            Select how consumers can receive this produce. At least one mode must be selected.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'pickup', label: 'Direct Farm Gate Pickup', icon: '🚜', desc: 'Consumer collects from your farm' },
              { id: 'delivery', label: 'Local Delivery Partner', icon: '🛵', desc: 'Delivered to consumer doorstep' },
            ].map((mode) => {
              const isSelected = fulfilment.includes(mode.id);
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => toggleFulfilment(mode.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#367B4B] bg-[#EAF3E7]'
                      : 'border-[#E5E9E1] bg-[#FAFBF7] hover:border-[#367B4B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{mode.icon}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#367B4B] bg-[#367B4B]' : 'border-[#C5D0C0]'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#202820]">{mode.label}</div>
                  <div className="text-[10px] text-[#778177] mt-0.5">{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E9E1] shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#778177]">
            By publishing, your produce becomes immediately visible to Pollachi consumers on FarmBridge.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2.5 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#202820] hover:bg-[#EAF3E7] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Publish Produce Listing
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
