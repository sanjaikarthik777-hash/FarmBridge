import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { Category, Product } from '../../types';
import { api } from '../../services/api';

interface AddProduceModalProps {
  categories: Category[];
  onClose: () => void;
  onProduceAdded: () => void;
}

export const AddProduceModal: React.FC<AddProduceModalProps> = ({
  categories,
  onClose,
  onProduceAdded,
}) => {
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'c1');
  const [price, setPrice] = useState<number>(35);
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState<number>(50);
  const [minOrder, setMinOrder] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fulfilment, setFulfilment] = useState<string[]>(['pickup', 'delivery']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live AI Price estimate state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzingPrice, setAnalyzingPrice] = useState(false);

  const handleCheckPriceAI = async () => {
    if (!name.trim() || price <= 0) return;
    setAnalyzingPrice(true);
    try {
      const res = await api.getPriceEstimate({
        crop_name: name,
        quantity: quantity,
        unit: unit,
        farmer_price: price,
      });
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter produce name');
      return;
    }
    if (price <= 0 || quantity <= 0) {
      setError('Price and quantity must be greater than zero');
      return;
    }

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
      });

      onProduceAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list produce');
    } finally {
      setLoading(false);
    }
  };

  const toggleFulfilment = (mode: string) => {
    if (fulfilment.includes(mode)) {
      if (fulfilment.length > 1) {
        setFulfilment(fulfilment.filter((m) => m !== mode));
      }
    } else {
      setFulfilment([...fulfilment, mode]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] text-[#1F6B45] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Farmer Produce Listing
          </div>
          <h2 className="text-2xl font-black text-[#202820]">Add New Harvest to FarmBridge</h2>
          <p className="text-xs text-[#68736B]">
            Farmers decide their own prices. Direct buyers in Pollachi and nearby towns will see your listing immediately.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Produce Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Country Tomatoes, Tender Coconut"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-[#1F6B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Produce Name (தமிழ் / Tamil)
              </label>
              <input
                type="text"
                value={nameTa}
                onChange={(e) => setNameTa(e.target.value)}
                placeholder="உதாரணம்: நாட்டு தக்காளி, இளநீர்"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-[#1F6B45]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Price per Unit (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-[#1F6B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium bg-white"
              >
                <option value="kg">kg (கிலோ)</option>
                <option value="piece">piece / இளநீர் காய்</option>
                <option value="bunch">bunch / கட்டு</option>
                <option value="litre">litre / லிட்டர்</option>
                <option value="bag">bag / மூட்டை</option>
              </select>
            </div>
          </div>

          {/* AI Decision Support Box right inside the form! */}
          <div className="bg-[#FAFBF7] border border-[#E2E8E3] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F6B45] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#E7A83E]" />
                AI Mandi & Uzhavar Sandhai Benchmark Check
              </span>
              <button
                type="button"
                onClick={handleCheckPriceAI}
                disabled={analyzingPrice}
                className="text-xs bg-[#EAF5ED] text-[#1F6B45] font-bold px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                {analyzingPrice ? 'Checking Mandi...' : 'Compare Reference'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="text-xs space-y-1.5 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Reference Modal:</span>
                  <span className="font-bold text-gray-900">₹{aiAnalysis.reference_modal} / {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uzhavar Sandhai Range:</span>
                  <span className="font-medium text-gray-800">₹{aiAnalysis.reference_min} - ₹{aiAnalysis.reference_max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classification:</span>
                  <span className={`font-bold capitalize ${
                    aiAnalysis.price_band === 'competitive'
                      ? 'text-emerald-700'
                      : aiAnalysis.price_band === 'premium'
                      ? 'text-amber-700'
                      : 'text-blue-700'
                  }`}>
                    {aiAnalysis.price_band.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] leading-relaxed">
                  💡 {aiAnalysis.note}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#68736B]">
                Click "Compare Reference" to see official daily modal prices from Pollachi & Coimbatore markets.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Available Harvest Quantity *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={minOrder}
                onChange={(e) => setMinOrder(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Produce Photo URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (Leave blank to use verified organic harvest photo)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Short Description / Harvest Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Harvested early morning today from Aliyar red soil grove. Pesticide-free."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Supported Fulfilment Modes
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={fulfilment.includes('pickup')}
                  onChange={() => toggleFulfilment('pickup')}
                  className="rounded text-[#1F6B45]"
                />
                🚜 Direct Farm Pickup
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={fulfilment.includes('delivery')}
                  onChange={() => toggleFulfilment('delivery')}
                  className="rounded text-[#1F6B45]"
                />
                🛵 Local Delivery Partner
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-xs px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs px-5 py-2.5"
            >
              {loading ? 'Publishing...' : 'Publish Produce Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
