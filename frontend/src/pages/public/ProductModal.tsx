import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, Calendar, ShoppingBag, Truck, Info } from 'lucide-react';
import { Product } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface ProductModalProps {
  product: Product;
  lang: Language;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  lang,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(product.minimum_order_quantity);
  const t = translations[lang];

  const subtotal = Math.round(product.price * quantity * 100) / 100;
  const isAvailable = product.status === 'active' && product.available_quantity > 0;

  const handleIncrement = () => {
    if (quantity + 1 <= product.available_quantity) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity - 1 >= product.minimum_order_quantity) {
      setQuantity((q) => q - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image Column */}
          <div className="relative h-64 sm:h-full bg-gray-100 min-h-[280px]">
            <img
              src={
                product.image_paths && product.image_paths.length > 0
                  ? product.image_paths[0]
                  : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Direct Farm Source
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-[#3C9B62] uppercase tracking-wider">
                  {product.farm_name || 'Pollachi Organic Farm'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#202820] mt-0.5">
                  {lang === 'ta' && product.name_ta ? product.name_ta : product.name}
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1F6B45]" />
                  Harvested: Today
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1F6B45]" />
                  Pollachi Region
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#68736B] leading-relaxed">
                {product.description}
              </p>

              {/* Fulfilment Modes Info */}
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#E2E8E3] text-xs space-y-1">
                <div className="font-bold text-[#202820] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#1F6B45]" />
                  Fulfilment Options:
                </div>
                <div className="text-gray-600">
                  {product.fulfilment_options.join(' & ')} available. Precise farm gate pickup instructions disclosed privately upon order acceptance.
                </div>
              </div>

              {/* Transparent Pricing Notice */}
              <div className="bg-[#EAF5ED] p-3 rounded-xl border border-[#C2E2CC] text-xs text-[#1F6B45] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Farmer Sets Price:</strong> 100% of ₹{product.price.toFixed(2)}/{product.unit} goes directly to {product.farmer_name || 'the farmer'}. Disclosed platform service fee is flat ₹5.00 only.
                </span>
              </div>
            </div>

            {/* Price & Quantity Controls */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-gray-500 font-semibold uppercase">Rate</div>
                  <div className="text-2xl font-black text-[#1F6B45]">
                    ₹{product.price.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-gray-600">/ {product.unit}</span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={handleDecrement}
                    className="px-3 py-2 text-base font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-gray-900 bg-white min-w-[50px] text-center">
                    {quantity} {product.unit}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="px-3 py-2 text-base font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order Subtotal line */}
              <div className="flex justify-between items-center text-xs text-gray-600 pt-1">
                <span>Selected produce value:</span>
                <span className="font-bold text-gray-900 text-sm">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Add to Basket Action */}
              <button
                disabled={!isAvailable}
                onClick={() => {
                  onAddToCart(product.id, quantity);
                  onClose();
                }}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  isAvailable
                    ? 'bg-[#1F6B45] hover:bg-[#175436] text-white shadow-emerald-900/20'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {t.add_to_cart} • ₹{subtotal.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
