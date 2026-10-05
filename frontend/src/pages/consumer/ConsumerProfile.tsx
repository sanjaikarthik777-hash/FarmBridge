import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Home,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
  Package,
  Heart,
  ShieldCheck,
  Sparkles,
  Store,
  Compass
} from 'lucide-react';
import { UserProfile, SavedAddress } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface ConsumerProfileProps {
  currentProfile: UserProfile | null;
  savedAddresses: SavedAddress[];
  onAddAddress: (address: Partial<SavedAddress>) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefaultAddress: (addressId: string) => Promise<void>;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onLogout: () => void;
  onNavigateToOrders: () => void;
  onNavigateToWishlist: () => void;
}

export const ConsumerProfile: React.FC<ConsumerProfileProps> = ({
  currentProfile,
  savedAddresses,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  lang,
  onToggleLang,
  onLogout,
  onNavigateToOrders,
  onNavigateToWishlist,
}) => {
  const t = translations[lang];

  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newRecipient, setNewRecipient] = useState(currentProfile?.display_name || '');
  const [newPhone, setNewPhone] = useState(currentProfile?.phone || '');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newArea, setNewArea] = useState('Pollachi Central');
  const [newPincode, setNewPincode] = useState('642001');
  const [submittingAddr, setSubmittingAddr] = useState(false);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;

    setSubmittingAddr(true);
    try {
      await onAddAddress({
        label: newLabel,
        recipient_name: newRecipient,
        phone: newPhone,
        address_line: newAddressLine,
        area: newArea,
        pincode: newPincode,
        latitude: 10.6609,
        longitude: 77.0048,
        is_default: savedAddresses.length === 0,
      });
      setIsAddingAddr(false);
      setNewAddressLine('');
    } catch (err: any) {
      alert(err.message || 'Could not save address');
    } finally {
      setSubmittingAddr(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#E5E9E1] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-3xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center font-extrabold text-2xl shadow-sm border border-[#75A85A]/30 overflow-hidden shrink-0">
            {currentProfile?.avatar_path ? (
              <img
                src={currentProfile.avatar_path}
                alt={currentProfile.display_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-[#202820]">
                {currentProfile?.display_name || 'Guest Consumer'}
              </h1>
              <span className="bg-[#EAF3E7] text-[#245C3A] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#75A85A]/30">
                <ShieldCheck className="w-3 h-3 text-[#367B4B]" />
                <span>Verified Buyer</span>
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-[#778177] flex-wrap">
              {currentProfile?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#778177]" />
                  <span>{currentProfile.email}</span>
                </span>
              )}
              {currentProfile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#778177]" />
                  <span>{currentProfile.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FAFBF7] hover:bg-[#EAF3E7] hover:border-[#245C3A] border border-[#E5E9E1] text-xs font-bold text-[#202820] transition-all shadow-2xs cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#245C3A]" />
            <span>{t.nav_orders}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToWishlist}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FAFBF7] hover:bg-rose-50 hover:border-rose-300 border border-[#E5E9E1] text-xs font-bold text-[#202820] transition-all shadow-2xs cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{t.nav_wishlist}</span>
          </button>
        </div>
      </div>

      {/* Language Preference Section */}
      <div className="bg-white rounded-3xl border border-[#E5E9E1] p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border border-[#75A85A]/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202820]">
                {lang === 'ta' ? 'மொழி விருப்பம்' : 'Language Preference'}
              </h3>
              <p className="text-xs text-[#778177]">Choose your preferred display language</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#245C3A] text-white shadow-xs'
                  : 'bg-[#FAFBF7] text-[#778177] hover:bg-[#EAF3E7] border border-[#E5E9E1]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('ta')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                lang === 'ta'
                  ? 'bg-[#245C3A] text-white shadow-xs'
                  : 'bg-[#FAFBF7] text-[#778177] hover:bg-[#EAF3E7] border border-[#E5E9E1]'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>
      </div>

      {/* Saved Delivery Addresses Section */}
      <div className="bg-white rounded-3xl border border-[#E5E9E1] p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border border-[#75A85A]/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202820]">{t.location_saved_addresses}</h3>
              <p className="text-xs text-[#778177]">Manage delivery locations for quick checkout</p>
            </div>
          </div>

          {!isAddingAddr && (
            <button
              type="button"
              onClick={() => setIsAddingAddr(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#245C3A] text-white rounded-xl text-xs font-bold hover:bg-[#185336] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Address</span>
            </button>
          )}
        </div>

        {/* Add Address Form */}
        {isAddingAddr && (
          <form onSubmit={handleSaveAddress} className="p-5 bg-[#FAFBF7] rounded-2xl border border-[#E5E9E1] space-y-3.5">
            <div className="text-xs font-bold text-[#202820]">New Delivery Address (Pollachi)</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-xs font-bold bg-white text-[#202820]"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Parents">Parents House</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="Recipient Name"
                className="px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-xs bg-white text-[#202820]"
                required
              />
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Mobile Number"
                className="px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-xs bg-white text-[#202820]"
                required
              />
            </div>
            <input
              type="text"
              value={newAddressLine}
              onChange={(e) => setNewAddressLine(e.target.value)}
              placeholder="Door No, Street name, Apartment / Landmark"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-xs bg-white text-[#202820]"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Area in Pollachi"
                className="px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-xs bg-white text-[#202820]"
                required
              />
              <input
                type="text"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                placeholder="PIN code (e.g. 642001)"
                className="px-3.5 py-2.5 rounded-xl border border-[#E5E9E1] text-xs bg-white text-[#202820]"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingAddr(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#778177] hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAddr}
                className="px-5 py-2 rounded-xl bg-[#245C3A] text-white text-xs font-bold hover:bg-[#185336] transition-all cursor-pointer"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Address Cards List */}
        {savedAddresses.length === 0 ? (
          <div className="py-8 text-center bg-[#FAFBF7] rounded-2xl border border-[#E5E9E1] p-4 text-xs text-[#778177]">
            {lang === 'ta'
              ? 'சேமிக்கப்பட்ட முகவரிகள் எதுவும் இல்லை. விரைவான டெலிவரிக்கு முகவரியைச் சேர்க்கவும்.'
              : 'No saved delivery addresses yet. Add your home or office address for faster checkout.'}
          </div>
        ) : (
          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4.5 rounded-2xl border border-[#E5E9E1] hover:border-[#367B4B]/40 bg-[#FAFBF7] flex items-center justify-between transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#202820]">{addr.label}</span>
                    {addr.is_default && (
                      <span className="bg-[#EAF3E7] text-[#245C3A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#202820]">{addr.address_line}</p>
                  <p className="text-[11px] text-[#778177]">
                    {addr.area} • PIN: {addr.pincode} • Phone: {addr.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addr.id)}
                      className="text-xs font-bold text-[#245C3A] hover:underline px-2 py-1 cursor-pointer"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.id)}
                    className="p-1.5 text-[#778177] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onLogout}
          className="px-6 py-3 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from FarmBridge</span>
        </button>
      </div>
    </div>
  );
};
