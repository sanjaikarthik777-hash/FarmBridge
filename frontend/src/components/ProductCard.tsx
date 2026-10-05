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
  const isPaused = product.status === 'paused';

  const defaultImg =
    product.image_paths && product.image_paths.length > 0
      ? product.image_paths[0]
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop';

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative rounded-[2rem] overflow-hidden bg-white cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(36,92,58,0.12)] min-h-[340px] w-full flex flex-col"
    >
      <img 
        src={defaultImg} 
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
      />
      
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/90 via-[#202820]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
      
      {/* Subtle green glow on hover */}
      <div className="absolute inset-0 bg-[#245C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

      {/* Top badges */}
      <div className="absolute top-5 left-5 flex flex-col gap-2 pointer-events-none">
        {product.distance_km !== undefined ? (
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-xs">
            <MapPin className="w-2.5 h-2.5 inline mr-1" />
            {product.distance_km < 1 ? '< 1 km' : `${product.distance_km.toFixed(1)} km`}
          </span>
        ) : (
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-xs">
            📍 Pollachi
          </span>
        )}
        
        {isOutOfStock || isPaused ? (
           <span className="px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-xs self-start">
             {isPaused ? 'Paused' : 'Sold Out'}
           </span>
        ) : null}
      </div>

      <div className="absolute top-5 right-5 z-10 pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.id); }}
          className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-500 shadow-xs ${isWishlisted ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white hover:text-rose-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
        <p className="text-emerald-300 text-[11px] font-bold mb-1 tracking-wide uppercase line-clamp-1">{product.farm_name || 'Family Farm'}</p>
        <h3 className="text-white text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 line-clamp-2">
          {lang === 'ta' && product.name_ta ? product.name_ta : product.name}
        </h3>
        
        <div className="flex items-center justify-between pointer-events-none group-hover:pointer-events-auto">
          <div className="text-white font-bold text-xl drop-shadow-md">
            ₹{product.price} <span className="text-xs font-medium text-emerald-100/70">/ {product.unit}</span>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-auto">
            {isOutOfStock || isPaused ? null : cartQuantity > 0 ? (
              <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cartQuantity === 1) onUpdateCartQuantity?.(product.id, 0);
                    else onUpdateCartQuantity?.(product.id, cartQuantity - 1);
                  }}
                  className="w-8 h-8 rounded-full bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-black text-sm text-[#202820]">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCartQuantity?.(product.id, cartQuantity + 1);
                  }}
                  className="w-8 h-8 rounded-full bg-[#245C3A] text-white flex items-center justify-center hover:bg-[#1F6B45] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(product.id, product.minimum_order_quantity || 1); }}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#245C3A] hover:bg-[#EAF3E7] transition-transform hover:scale-110 shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
