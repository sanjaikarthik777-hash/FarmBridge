import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Product, Farm } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface ProductDetailModalProps {
  product: Product;
  farm?: Farm | null;
  onClose: () => void;
  lang: Language;
  onAddToCart: (productId: string, quantity: number) => void;
  onBuyNow: (productId: string, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  otherFarmProducts?: Product[];
  onSelectProduct?: (p: Product) => void;
  onViewFarm?: (farmId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  farm,
  onClose,
  lang,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
  otherFarmProducts = [],
  onSelectProduct,
  onViewFarm,
}) => {
  const t = translations[lang];
  const [quantity, setQuantity] = useState(product.minimum_order_quantity || 1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.image_paths && product.image_paths.length > 0
    ? product.image_paths
    : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop'];

  const isSoldOut = product.available_quantity <= 0 || product.status === 'sold_out';
  const minQty = product.minimum_order_quantity || 1;
  const maxQty = product.maximum_order_quantity || product.available_quantity || 50;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#E5E9E1] overflow-hidden relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-gray-100 text-[#778177] hover:text-[#202820] shadow-xs transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8">
          {/* Main Top Grid: Gallery & Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-3xl overflow-hidden bg-[#F8F8F2] border border-[#E5E9E1] relative shadow-inner">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.distance_km !== undefined && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#245C3A] text-xs font-bold px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#367B4B]" />
                    <span>{product.distance_km < 1 ? '< 1 km away' : `${product.distance_km.toFixed(1)} km away`}</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-[#245C3A]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#75A85A]" />
                  <span>{lang === 'en' ? 'Harvested Today' : 'இன்று காலை பறிக்கப்பட்டது'}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#245C3A] scale-105' : 'border-[#E5E9E1] opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Purchase Actions */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#367B4B] bg-[#EAF3E7] px-2.5 py-0.5 rounded-full border border-[#C4DFC0]">
                    {product.category_id ? product.category_id.replace('cat-', '').toUpperCase() : 'FRESH'}
                  </span>
                  {product.available_quantity > 0 ? (
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{product.available_quantity} {product.unit} available</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 text-xs font-bold">Out of Stock</span>
                  )}
                </div>

                <h1 className="text-2xl font-extrabold text-[#202820] tracking-tight">
                  {lang === 'ta' && product.name_ta ? product.name_ta : product.name}
                </h1>

                {lang === 'ta' && product.name_ta && (
                  <p className="text-sm text-[#778177] font-medium">{product.name}</p>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-extrabold text-[#245C3A]">
                    ₹{product.price.toFixed(0)}
                  </span>
                  <span className="text-sm font-semibold text-[#778177]">
                    per {product.unit}
                  </span>
                </div>
              </div>

              {/* Fictional Demo Farm Card */}
              <div className="p-4 rounded-2xl bg-[#F8F8F2] border border-[#E5E9E1] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#778177]">
                    Listed by Family Farm (Demo)
                  </div>
                  <div className="text-xs font-bold text-[#202820]">
                    {product.farm_name || farm?.farm_name || 'Pollachi Organic Farm'}
                  </div>
                  <div className="text-[11px] text-[#778177]">
                    📍 {farm?.village || 'Pollachi Rural'}, Tamil Nadu
                  </div>
                </div>

                {onViewFarm && product.farm_id && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewFarm(product.farm_id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAF3E7] text-[#245C3A] text-xs font-bold border border-[#E5E9E1] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View Farm</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#778177]">
                  About This Harvest
                </h3>
                <p className="text-xs text-[#202820] leading-relaxed">
                  {product.description ||
                    'Harvested directly on order from natural soils in Pollachi. Cleaned, graded, and prepared without commercial ripening agents or artificial holding sprays.'}
                </p>
              </div>

              {/* Quantity Stepper & CTAs */}
              <div className="space-y-4 pt-4 border-t border-[#E5E9E1]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202820]">Quantity ({product.unit})</span>
                  <div className="flex items-center bg-[#F8F8F2] rounded-xl p-1 border border-[#E5E9E1]">
                    <button
                      type="button"
                      disabled={quantity <= minQty}
                      onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white text-[#245C3A] flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-2xs font-bold cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-sm text-[#202820]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= maxQty}
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="w-8 h-8 rounded-lg bg-[#245C3A] text-white flex items-center justify-center hover:bg-[#1b452b] disabled:opacity-40 transition-colors shadow-2xs font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => {
                      onAddToCart(product.id, quantity);
                    }}
                    className="flex-1 py-3 px-4 bg-[#245C3A] hover:bg-[#1b452b] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t.add_to_cart} (₹{(product.price * quantity).toFixed(0)})</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => {
                      onBuyNow(product.id, quantity);
                      onClose();
                    }}
                    className="py-3 px-5 bg-[#EAF3E7] hover:bg-[#dbeed7] text-[#245C3A] font-extrabold text-xs rounded-2xl border border-[#C4DFC0] transition-all cursor-pointer active:scale-98"
                  >
                    Buy Now
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWishlist?.(product.id)}
                    className="p-3 rounded-2xl border border-[#E5E9E1] hover:border-rose-300 hover:bg-rose-50 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Demo Products from Same Farm or Category */}
          {otherFarmProducts.length > 0 && (
            <div className="pt-6 border-t border-[#E5E9E1] space-y-4">
              <h3 className="text-base font-extrabold text-[#202820]">
                More from {product.farm_name || 'This Farm'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {otherFarmProducts.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectProduct?.(item)}
                    className="p-3 rounded-2xl border border-[#E5E9E1] hover:border-[#75A85A] hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={item.image_paths?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#202820] group-hover:text-[#245C3A] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-bold text-[#245C3A]">
                        ₹{item.price}/{item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
