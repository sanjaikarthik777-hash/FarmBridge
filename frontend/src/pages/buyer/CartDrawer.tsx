import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, Truck, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Cart } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface CartDrawerProps {
  cart: Cart;
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: (orderData: {
    fulfilment_type: 'pickup' | 'delivery';
    delivery_area: string;
    delivery_address: string;
    delivery_contact_phone: string;
    delivery_slot: string;
    payment_method: string;
  }) => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  isOpen,
  lang,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}) => {
  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryArea, setDeliveryArea] = useState('Mahalingapuram, Pollachi');
  const [address, setAddress] = useState('Door 14, 2nd Cross, Mahalingapuram, Pollachi');
  const [phone, setPhone] = useState('+91 97890 41235');
  const [slot, setSlot] = useState('Morning (7:00 AM - 10:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState('simulated_upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const t = translations[lang];

  if (!isOpen) return null;

  // Recalculate delivery fee based on fulfilment type
  const effectiveDeliveryFee = fulfilmentType === 'delivery' ? cart.delivery_fee : 0;
  const effectiveTotal = Math.round((cart.subtotal + effectiveDeliveryFee + cart.platform_fee) * 100) / 100;

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onPlaceOrder({
        fulfilment_type: fulfilmentType,
        delivery_area: deliveryArea,
        delivery_address: fulfilmentType === 'pickup' ? 'Direct Farm Gate Pickup' : address,
        delivery_contact_phone: phone,
        delivery_slot: slot,
        payment_method: paymentMethod,
      });
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#1F6B45]" />
            <h2 className="text-lg font-black text-gray-900">Your Fresh Harvest Basket</h2>
            <span className="text-xs bg-[#EAF5ED] text-[#1F6B45] font-bold px-2 py-0.5 rounded-full">
              {cart.items.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {orderSuccess ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1F6B45] mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Order Placed Successfully!</h3>
              <p className="text-xs text-gray-600 max-w-xs mx-auto">
                Farmer Murugan has been notified. You can track status live in "My Orders".
              </p>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="py-20 text-center space-y-3 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
              <p className="font-bold text-gray-700">Your basket is empty</p>
              <p className="text-xs">Browse the Pollachi marketplace to add fresh harvest produce.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Single Farmer Badge */}
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#E2E8E3] text-xs">
                <span className="text-gray-500 font-medium">Sourcing from single farm:</span>
                <div className="font-bold text-[#1F6B45] text-sm">
                  {cart.farmer_name || 'Thennam Thoppu Natural Farm, Pollachi'}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 bg-white hover:border-[#1F6B45]/40 transition-colors"
                  >
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {item.product_name}
                      </h4>
                      <div className="text-xs text-gray-500">
                        ₹{item.unit_price.toFixed(2)} / {item.unit}
                      </div>
                      <div className="text-xs font-black text-[#1F6B45] mt-0.5">
                        Total: ₹{item.line_total.toFixed(2)}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-bold bg-white min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfilment Toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-600">
                  Fulfilment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfilmentType('delivery')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      fulfilmentType === 'delivery'
                        ? 'border-[#1F6B45] bg-[#EAF5ED] text-[#1F6B45] shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Doorstep Delivery (+₹25)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfilmentType('pickup')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      fulfilmentType === 'pickup'
                        ? 'border-[#1F6B45] bg-[#EAF5ED] text-[#1F6B45] shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🚜 Farm Pickup (Free)
                  </button>
                </div>
              </div>

              {/* Address details */}
              {fulfilmentType === 'delivery' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Delivery Address in Pollachi
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                      placeholder="Street, Landmark, Apartment"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Delivery Slot
                      </label>
                      <select
                        value={slot}
                        onChange={(e) => setSlot(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white"
                      >
                        <option value="Morning (7:00 AM - 10:00 AM)">Morning (7 - 10 AM)</option>
                        <option value="Evening (4:00 PM - 7:00 PM)">Evening (4 - 7 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Transparent Price Breakdown */}
              <div className="bg-[#FAFBF7] rounded-2xl p-4 border border-[#E2E8E3] space-y-2 text-xs">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center justify-between">
                  <span>Transparent Price Breakdown</span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Zero Hidden Margins
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Fresh Produce Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{cart.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Disclosed Platform Fee:</span>
                  <span className="font-semibold text-gray-900">₹{cart.platform_fee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Local Delivery Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {effectiveDeliveryFee === 0 ? '₹0.00 (Self Pickup)' : `₹${effectiveDeliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black text-[#1F6B45] pt-2 border-t border-gray-200">
                  <span>Total Payable:</span>
                  <span>₹{effectiveTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#FEF6E9] p-3 rounded-xl border border-[#FCE6BE] text-xs space-y-1">
                <div className="font-bold text-[#92400E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#E7A83E]" />
                  Simulated Payment Mode (Demo)
                </div>
                <div className="text-[#92400E]/80 text-[11px]">
                  Using simulated UPI payment for test demonstration. Real Razorpay/UPI gateway activates with merchant API credentials.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {cart.items.length > 0 && !orderSuccess && (
          <div className="p-5 border-t border-gray-100 bg-white">
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-sm shadow-md"
            >
              {isSubmitting ? (
                'Processing Order...'
              ) : (
                <>
                  Confirm Order • ₹{effectiveTotal.toFixed(2)}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
