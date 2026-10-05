import React from 'react';
import {
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Product } from '../types';
import { Language, translations } from '../i18n/translations';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartQuantity?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartQuantity = 0,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const t = translations[lang];
  const isOutOfStock = product.available_quantity <= 0 || product.status === 'sold_out';
  const isLowStock = product.available_quantity > 0 && product.available_quantity <= 5;
  const isPaused = product.status === 'paused';

  const defaultImg =
    product.image_paths && product.image_paths.length > 0
      ? product.image_paths[0]
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop';

  return (
    <div className="group bg-white rounded-3xl border border-[#E5E9E1] hover:border-[#75A85A] hover:shadow-xl hover:shadow-[#245C3A]/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image & Badges Container */}
      <div
        className="relative aspect-4/3 bg-[#F8F8F2] overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={defaultImg}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top Badges: Distance & Wishlist */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {product.distance_km !== undefined ? (
            <span className="bg-white/95 backdrop-blur-md text-[#245C3A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#367B4B]" />
              {product.distance_km < 1 ? '< 1 km' : `${product.distance_km.toFixed(1)} km`}
            </span>
          ) : (
            <span className="bg-white/90 backdrop-blur-md text-[#778177] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              📍 Pollachi
            </span>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(product.id);
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-gray-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-500 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {/* Bottom Harvest Freshness Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-[#245C3A]/90 backdrop-blur-md text-[#EAF3E7] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#75A85A]" />
            <span>{lang === 'en' ? 'Fresh Morning Harvest' : 'காலை அறுவடை'}</span>
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Farm & Produce Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#778177]">
            <span className="font-semibold text-[#367B4B] hover:text-[#245C3A] cursor-pointer truncate max-w-[170px]">
              {product.farm_name || 'Pollachi Family Farm'}
            </span>
            {isLowStock && !isOutOfStock && (
              <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Only {product.available_quantity} {product.unit} left
              </span>
            )}
          </div>

          <h4
            onClick={() => onSelectProduct(product)}
            className="font-bold text-sm text-[#202820] group-hover:text-[#245C3A] transition-colors cursor-pointer line-clamp-1"
          >
            {lang === 'ta' && product.name_ta ? product.name_ta : product.name}
          </h4>

          {lang === 'ta' && product.name_ta && (
            <p className="text-[11px] text-[#778177] truncate">{product.name}</p>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-[#E5E9E1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-[#245C3A]">
                ₹{product.price.toFixed(0)}
              </span>
              <span className="text-xs text-[#778177] font-medium">/{product.unit}</span>
            </div>
            <p className="text-[10px] text-[#367B4B] font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 inline text-[#75A85A]" />
              100% direct payout
            </p>
          </div>

          {/* Cart Stepper or Add Button */}
          <div>
            {isOutOfStock || isPaused ? (
              <span className="px-3 py-1.5 bg-[#F8F8F2] text-[#778177] rounded-xl text-xs font-bold border border-[#E5E9E1]">
                {isPaused ? 'Paused' : t.out_of_stock}
              </span>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center bg-[#EAF3E7] rounded-xl p-1 border border-[#C4DFC0]">
                <button
                  type="button"
                  onClick={() => {
                    if (cartQuantity === 1) {
                      onUpdateCartQuantity?.(product.id, 0);
                    } else {
                      onUpdateCartQuantity?.(product.id, cartQuantity - 1);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-white text-[#245C3A] flex items-center justify-center hover:bg-[#dbeed7] transition-colors shadow-2xs font-bold cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-extrabold text-xs text-[#245C3A]">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateCartQuantity?.(product.id, cartQuantity + 1)}
                  className="w-7 h-7 rounded-lg bg-[#245C3A] text-white flex items-center justify-center hover:bg-[#1b452b] transition-colors shadow-2xs font-bold cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(product.id, product.minimum_order_quantity || 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#245C3A] hover:bg-[#1b452b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t.add_to_cart}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
