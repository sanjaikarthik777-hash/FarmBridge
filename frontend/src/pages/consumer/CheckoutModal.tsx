import React, { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  Store,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Cart, SavedAddress, UserProfile } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { LocationState } from '../../components/LocationSelectorModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  currentProfile: UserProfile | null;
  savedAddresses?: SavedAddress[];
  activeLocation: LocationState;
  onPlaceOrder: (orderData: {
    fulfilment_type: 'pickup' | 'delivery';
    delivery_area: string;
    delivery_address: string;
    delivery_contact_phone: string;
    delivery_slot: string;
    payment_method: string;
  }) => Promise<void>;
  lang: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentProfile,
  savedAddresses = [],
  activeLocation,
  onPlaceOrder,
  lang,
}) => {
  const t = translations[lang];

  const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];

  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [recipientName, setRecipientName] = useState(
    currentProfile?.display_name || defaultAddr?.recipient_name || ''
  );
  const [phone, setPhone] = useState(
    currentProfile?.phone || defaultAddr?.phone || '+91 97890 41235'
  );
  const [addressLine, setAddressLine] = useState(
    defaultAddr?.address_line || activeLocation.label || ''
  );
  const [deliveryArea, setDeliveryArea] = useState(
    defaultAddr?.area || 'Pollachi Central'
  );
  const [deliverySlot, setDeliverySlot] = useState('Morning (6:30 AM - 9:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online_demo'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const deliveryFee = fulfilmentType === 'delivery' ? cart.delivery_fee : 0;
  const grandTotal = cart.subtotal + deliveryFee + cart.platform_fee;

  // Extract unique farm names involved
  const uniqueFarms = Array.from(
    new Set(cart.items.map((i) => i.farm_name || 'Pollachi Local Farm'))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fulfilmentType === 'delivery' && !addressLine.trim()) {
      setError(lang === 'ta' ? 'விநியோக முகவரியை உள்ளிடவும்.' : 'Please provide a delivery address.');
      return;
    }
    if (!phone.trim()) {
      setError(lang === 'ta' ? 'தொடர்பு தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please provide a contact phone number.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onPlaceOrder({
        fulfilment_type: fulfilmentType,
        delivery_area: deliveryArea,
        delivery_address: fulfilmentType === 'delivery' ? addressLine : 'Self Pickup at Farm Gate',
        delivery_contact_phone: phone,
        delivery_slot: deliverySlot,
        payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Instant UPI (Sandbox Demo)',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F8F2] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E5E9E1] overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E9E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border border-[#75A85A]/30 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#202820]">{t.checkout_title}</h3>
              <p className="text-[11px] text-[#778177] font-medium">
                {lang === 'ta'
                  ? 'விவசாயிக்கு நேரடி கொடுப்பனவு • 100% வெளிப்படையான கட்டணம்'
                  : 'Direct Farmer Settlement • 100% Disclosed Pricing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7] transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Selected Produce & Farm Summary Card */}
          <div className="bg-white rounded-2xl border border-[#E5E9E1] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E9E1] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#245C3A]">
                <Store className="w-4 h-4 text-[#367B4B]" />
                <span>
                  {lang === 'ta' ? 'அறுவடை செய்யும் பண்ணைகள்:' : 'Harvesting Demo Farms:'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#778177]">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {uniqueFarms.map((farm) => (
                <span
                  key={farm}
                  className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-1 rounded-xl border border-[#75A85A]/30"
                >
                  🌾 {farm}
                </span>
              ))}
            </div>

            {/* Compact items preview */}
            <div className="divide-y divide-gray-100 text-xs text-[#202820] max-h-32 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="py-1.5 flex items-center justify-between">
                  <span className="truncate max-w-[260px] text-[#202820]">
                    {item.product_name} <span className="text-[#778177]">× {item.quantity} {item.unit}</span>
                  </span>
                  <span className="font-bold text-[#245C3A]">₹{item.line_total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfilment Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-[#202820] uppercase tracking-wider">
              1. {lang === 'ta' ? 'பெறும் முறை' : 'Choose Fulfilment Method'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfilmentType('delivery')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  fulfilmentType === 'delivery'
                    ? 'border-[#245C3A] bg-[#EAF3E7] shadow-xs'
                    : 'border-[#E5E9E1] bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#245C3A] border border-[#75A85A]/30 flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202820]">
                    {lang === 'ta' ? 'வீட்டு டெலிவரி' : 'Doorstep Delivery'}
                  </div>
                  <div className="text-[11px] text-[#367B4B] font-semibold mt-0.5">₹25 Standard Fee</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfilmentType('pickup')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  fulfilmentType === 'pickup'
                    ? 'border-[#245C3A] bg-[#EAF3E7] shadow-xs'
                    : 'border-[#E5E9E1] bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#245C3A] border border-[#75A85A]/30 flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202820]">
                    {lang === 'ta' ? 'தோட்டம் எடுப்பு' : 'Farm Gate Pickup'}
                  </div>
                  <div className="text-[11px] text-[#367B4B] font-semibold mt-0.5">FREE (No Delivery Fee)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address Form if Delivery Selected */}
          {fulfilmentType === 'delivery' && (
            <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-[#E5E9E1]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-[#202820] uppercase tracking-wider">
                  2. {t.checkout_delivery_addr}
                </label>
                <span className="text-[11px] text-[#778177]">Pollachi Region</span>
              </div>

              {/* Saved Address Selection */}
              {savedAddresses.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setAddressLine(a.address_line);
                        setDeliveryArea(a.area);
                        setRecipientName(a.recipient_name);
                        setPhone(a.phone);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] hover:border-[#245C3A] text-[11px] font-bold text-[#202820] shrink-0 transition-colors"
                    >
                      Use: {a.label} ({a.area})
                    </button>
                  ))}
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Door/Flat No, Apartment, Street name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-hidden bg-[#FAFBF7]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  placeholder="Area / Locality in Pollachi"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-hidden bg-[#FAFBF7]"
                  required
                />
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#202820] bg-[#FAFBF7]"
                >
                  <option value="Morning (6:30 AM - 9:00 AM)">Morning (6:30 AM - 9:00 AM)</option>
                  <option value="Afternoon (12:00 PM - 2:00 PM)">Afternoon (12:00 PM - 2:00 PM)</option>
                  <option value="Evening (5:00 PM - 7:30 PM)">Evening (5:00 PM - 7:30 PM)</option>
                </select>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-[#E5E9E1]">
            <label className="block text-xs font-extrabold text-[#202820] uppercase tracking-wider">
              {fulfilmentType === 'delivery' ? '3.' : '2.'} {lang === 'ta' ? 'பெறுநர் விவரங்கள்' : 'Recipient Details'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-hidden bg-[#FAFBF7]"
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit Mobile Number"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:ring-2 focus:ring-[#245C3A] focus:outline-hidden bg-[#FAFBF7]"
                required
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-[#202820] uppercase tracking-wider">
              {fulfilmentType === 'delivery' ? '4.' : '3.'} {t.checkout_payment_mode}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-[#245C3A] bg-[#EAF3E7] shadow-xs'
                    : 'border-[#E5E9E1] bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white text-[#245C3A] border border-[#75A85A]/30 flex items-center justify-center shrink-0 shadow-2xs">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202820]">
                    {lang === 'ta' ? 'நேரில் பணம் செலுத்துதல்' : 'Pay on Delivery / Pickup'}
                  </div>
                  <div className="text-[10px] text-[#778177] mt-0.5">Cash / UPI on doorstep</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online_demo')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  paymentMethod === 'online_demo'
                    ? 'border-[#245C3A] bg-[#EAF3E7] shadow-xs'
                    : 'border-[#E5E9E1] bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202820]">
                    {lang === 'ta' ? 'மாதிரி இணையவழி செலுத்துதல்' : 'Online Sandbox Mode'}
                  </div>
                  <div className="text-[10px] text-blue-700 font-semibold mt-0.5">Simulated Demo UPI</div>
                </div>
              </button>
            </div>
          </div>

          {/* Transparent Price Summary */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5E9E1] space-y-2 text-xs">
            <div className="flex justify-between text-[#778177]">
              <span>Produce Subtotal ({cart.items.length} items):</span>
              <span className="font-bold text-[#202820]">₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#778177]">
              <span>{t.cart_delivery}:</span>
              <span className="font-bold text-[#202820]">
                {fulfilmentType === 'delivery' ? `₹${cart.delivery_fee.toFixed(2)}` : 'FREE (Pickup)'}
              </span>
            </div>
            <div className="flex justify-between text-[#778177]">
              <span>Disclosed Platform Fee:</span>
              <span className="font-bold text-[#202820]">₹{cart.platform_fee.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#E5E9E1] flex justify-between text-sm font-extrabold text-[#202820]">
              <span>{t.cart_total}:</span>
              <span className="text-[#245C3A] text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>
              {submitting
                ? (lang === 'ta' ? 'ஆர்டர் உறுதி செய்யப்படுகிறது...' : 'Confirming Order with Farmer...')
                : `${t.checkout_place_order} • ₹${grandTotal.toFixed(2)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
