import React from 'react';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { ProductCard } from '../../components/ProductCard';

interface ConsumerWishlistProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  lang: Language;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  cartItemQuantities?: Record<string, number>;
  onExploreProduce: () => void;
}

export const ConsumerWishlist: React.FC<ConsumerWishlistProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  lang,
  onSelectProduct,
  onAddToCart,
  onUpdateCartQuantity,
  cartItemQuantities = {},
  onExploreProduce,
}) => {
  const t = translations[lang];

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t.wishlist_title}
            </h1>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {wishlistedProducts.length} items
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Your saved farm crops for quick morning ordering
          </p>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      {wishlistedProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#E2E8E3] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">{t.wishlist_empty}</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Save your favourite seasonal fruits, vegetables, and tender coconuts to easily re-order them.
            </p>
          </div>
          <button
            type="button"
            onClick={onExploreProduce}
            className="px-6 py-3 rounded-2xl bg-[#1F6B45] text-white text-xs font-bold hover:bg-[#185336] transition-all shadow-md shadow-emerald-950/15 flex items-center gap-2 mx-auto"
          >
            <span>{t.wishlist_explore}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onUpdateCartQuantity={onUpdateCartQuantity}
              cartQuantity={cartItemQuantities[product.id] || 0}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
