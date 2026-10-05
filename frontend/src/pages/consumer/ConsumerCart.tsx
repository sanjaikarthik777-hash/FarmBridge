import React from 'react';
import {
  X,
  Trash2,
  ShieldCheck,
  Truck,
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  AlertTriangle,
  Info,
  Store
} from 'lucide-react';
import { Cart } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface ConsumerCartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenCheckout: () => void;
  lang: Language;
  onExploreProduce: () => void;
}

export const ConsumerCart: React.FC<ConsumerCartProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  lang,
  onExploreProduce,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  // Group items by farm name
  const itemsByFarm = cart.items.reduce((acc, item) => {
    const farm = item.farm_name || 'Pollachi Local Farm';
    if (!acc[farm]) acc[farm] = [];
    acc[farm].push(item);
    return acc;
  }, {} as Record<string, typeof cart.items>);

  const uniqueFarmsCount = Object.keys(itemsByFarm).length;
  const isMultiFarm = uniqueFarmsCount > 1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#F8F8F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5E9E1]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E9E1] flex items-center justify-between bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border border-[#75A85A]/30 shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#202820]">{t.cart_title}</h2>
                <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                  {cart.items.reduce((s, i) => s + i.quantity, 0)} {lang === 'ta' ? 'பொருட்கள்' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-[#778177] font-medium">
                {lang === 'ta'
                  ? 'பொள்ளாச்சி விவசாயிகளிடமிருந்து நேரடியாக'
                  : 'Direct harvest from Pollachi farms'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Farm Explanatory Notice */}
        {isMultiFarm && (
          <div className="mx-6 mt-4 p-3 bg-amber-50/90 rounded-2xl border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">
                {lang === 'ta' ? 'பல பண்ணை தொகுப்பு:' : 'Multi-Farm Order Notice:'}
              </span>{' '}
              {lang === 'ta'
                ? `உங்கள் வண்டியில் ${uniqueFarmsCount} வெவ்வேறு பொள்ளாச்சி பண்ணைகளின் விளைபொருட்கள் உள்ளன. அனைத்து பொருட்களும் ஒன்றாக சேகரிக்கப்பட்டு டெலிவரி செய்யப்படும்.`
                : `Your basket contains produce from ${uniqueFarmsCount} different demo farms in Pollachi. Items will be consolidated for fresh fulfillment.`}
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.items.length === 0 ? (
            <div className="py-20 text-center space-y-5 bg-white rounded-3xl border border-[#E5E9E1] p-8 shadow-xs">
              <div className="w-20 h-20 rounded-3xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30 shadow-xs">
                <ShoppingBag className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#202820]">{t.cart_empty}</h3>
                <p className="text-xs text-[#778177] max-w-xs mx-auto leading-relaxed">
                  {lang === 'ta'
                    ? 'உங்கள் கூடையில் பொருட்கள் எதுவும் இல்லை. அருகில் உள்ள தோட்டங்களின் புதிய அறுவடைகளை ஆராயுங்கள்!'
                    : 'Your harvest basket is currently empty. Explore fresh picks and authentic produce directly from nearby farms.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreProduce();
                }}
                className="px-6 py-3 bg-[#245C3A] text-white text-xs font-bold rounded-2xl hover:bg-[#185336] transition-all shadow-md shadow-emerald-950/15 active:scale-98"
              >
                {t.explore_produce}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itemsByFarm).map(([farmName, farmItems]) => (
                <div
                  key={farmName}
                  className="bg-white rounded-3xl border border-[#E5E9E1] p-4.5 space-y-3.5 shadow-2xs"
                >
                  {/* Farm Header */}
                  <div className="flex items-center justify-between border-b border-[#E5E9E1] pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#245C3A]">
                      <Store className="w-4 h-4 text-[#367B4B]" />
                      <span>{farmName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#778177] bg-[#EAF3E7] px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                      {farmItems.length} {farmItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Produce Items */}
                  <div className="space-y-3">
                    {farmItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-[#E5E9E1] hover:border-[#367B4B]/40 bg-[#FAFBF7] flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-14 h-14 rounded-2xl object-cover bg-white border border-[#E5E9E1] shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center font-bold text-lg shrink-0 border border-[#75A85A]/30">
                              🌱
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#202820] truncate">
                              {item.product_name}
                            </h4>
                            <p className="text-[11px] text-[#778177] mt-0.5">
                              ₹{item.unit_price} / {item.unit}
                            </p>
                            <span className="text-xs font-extrabold text-[#245C3A] block mt-0.5">
                              ₹{item.line_total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-white rounded-xl p-1 border border-[#E5E9E1] shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity <= 1) onRemoveItem(item.id);
                                else onUpdateQuantity(item.id, item.quantity - 1);
                              }}
                              className="w-6 h-6 rounded-lg text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7] flex items-center justify-center font-bold transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-extrabold text-xs text-[#202820]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-[#245C3A] text-white flex items-center justify-center hover:bg-[#185336] font-bold transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-[#778177] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Order Summary & Actions */}
        {cart.items.length > 0 && (
          <div className="p-6 border-t border-[#E5E9E1] bg-white space-y-4 shadow-lg">
            {/* Bill Details */}
            <div className="p-4 bg-[#F8F8F2] rounded-2xl border border-[#E5E9E1] space-y-2 text-xs">
              <div className="flex justify-between text-[#778177]">
                <span>{t.cart_subtotal}:</span>
                <span className="font-bold text-[#202820]">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#778177]">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#367B4B]" />
                  <span>{t.cart_delivery}:</span>
                </span>
                <span className="font-bold text-[#202820]">₹{cart.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#778177]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#367B4B]" />
                  <span>{t.cart_platform_fee}:</span>
                </span>
                <span className="font-bold text-[#202820]">₹{cart.platform_fee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#E5E9E1] flex justify-between text-sm font-extrabold text-[#202820]">
                <span>{t.cart_total}:</span>
                <span className="text-base text-[#245C3A]">₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreProduce();
                }}
                className="w-1/2 py-3.5 bg-[#EAF3E7] hover:bg-[#dce8d8] text-[#245C3A] text-xs font-bold rounded-2xl border border-[#75A85A]/30 transition-all text-center"
              >
                {lang === 'ta' ? 'மேலும் வாங்க' : 'Continue Shopping'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-1/2 py-3.5 bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>{t.cart_checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
