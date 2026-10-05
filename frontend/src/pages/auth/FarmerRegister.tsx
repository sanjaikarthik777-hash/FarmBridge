import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  Crosshair,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { AuthSession } from '../../types';
import { MapLocationPicker } from '../../components/MapLocationPicker';

interface FarmerRegisterProps {
  onSuccess: (session: AuthSession) => void;
  onGoToLogin: () => void;
}

export const FarmerRegister: React.FC<FarmerRegisterProps> = ({ onSuccess, onGoToLogin }) => {
  // Step 1: Personal & Mobile OTP
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Step 2: Farm Details
  const [farmName, setFarmName] = useState('');
  const [description, setDescription] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [village, setVillage] = useState('Aliyar');
  const [district, setDistrict] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('642101');
  const [preferredLang, setPreferredLang] = useState<'ta' | 'en'>('ta');

  // Step 3: Geospatial GPS Location
  const [latitude, setLatitude] = useState<number>(10.5982); // Default Pollachi Aliyar
  const [longitude, setLongitude] = useState<number>(76.9721);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isApproximate, setIsApproximate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    try {
      const res = await api.sendOtp(mobile, 'farmer', 'register');
      setOtpSent(true);
      setDevOtp(res.dev_otp || null);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy);

        setLatitude(lat);
        setLongitude(lon);
        setGpsAccuracy(acc);
        setLocationDetected(true);
        setIsDetectingLocation(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location access was denied. You can manually adjust the pin on the map below.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('GPS signal is unavailable. Please adjust the location pin on the map.');
        } else {
          setLocationError('Location request timed out. Please drag the pin on the map to set your farm location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !farmName.trim() || !farmAddress.trim()) {
      setError('Please fill in all required farmer and farm fields.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the OTP verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await api.registerFarmer({
        display_name: name,
        mobile: mobile,
        otp: otp,
        farm_name: farmName,
        description: description || `Organic produce farm in ${village}, Pollachi`,
        farm_address: farmAddress,
        village: village,
        district: district,
        state: state,
        pincode: pincode,
        latitude: latitude,
        longitude: longitude,
        gps_accuracy: gpsAccuracy,
        is_approximate: isApproximate,
        preferred_language: preferredLang,
      });

      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8E3] shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#1F6B45] text-white flex items-center justify-center shrink-0 shadow-md">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#1F6B45] text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Farmer Onboarding
            </div>
            <h1 className="text-2xl font-black text-gray-900">Register Your Farm Grove</h1>
            <p className="text-xs text-gray-500">
              Connect directly with households & businesses in Pollachi. Receive orders at your own prices.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Farmer Identity & Mobile OTP */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#1F6B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EAF5ED] text-[#1F6B45] flex items-center justify-center text-xs">1</span>
              Farmer Information & Mobile Verification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Farmer Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Murugan Palanisamy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-[#1F6B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Preferred Language *
                </label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value as 'ta' | 'en')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium"
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (+91) *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="94432 10842"
                      className="w-full pl-14 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3.5 py-2 rounded-xl bg-[#EAF5ED] text-[#1F6B45] text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  6-Digit OTP *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="Enter received code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono tracking-widest font-bold"
                />
              </div>
            </div>

            {devOtp && (
              <div className="p-2.5 rounded-xl bg-[#FEF6E9] border border-[#FCE6BE] text-xs text-[#92400E] flex items-center justify-between">
                <span>🔑 Test OTP Code: <strong>{devOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="underline font-bold"
                >
                  Use OTP
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: Farm Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#1F6B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EAF5ED] text-[#1F6B45] flex items-center justify-center text-xs">2</span>
              Farm Profile & Postal Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Farm Name *
                </label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Thennam Thoppu Natural Farm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-[#1F6B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Village / Area *
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Aliyar / Vettaikaranpudur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Farm Address / Gate Location *
              </label>
              <input
                type="text"
                required
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                placeholder="Door/Survey No., Highway landmark, Pollachi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  readOnly
                  value={district}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  readOnly
                  value={state}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Farm GPS Location & Interactive Map */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#1F6B45] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EAF5ED] text-[#1F6B45] flex items-center justify-center text-xs">3</span>
                  Accurate Farm GPS Location
                </h2>
                <p className="text-xs text-gray-500">
                  Used by consumers to find your produce within 1 km, 5 km, 10 km, or 25 km radius.
                </p>
              </div>

              {/* Prominent Detect Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="btn-primary text-xs py-2 px-4 shadow-sm self-start sm:self-auto"
              >
                <Crosshair className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                {isDetectingLocation ? 'Detecting GPS...' : 'Detect My Farm Location'}
              </button>
            </div>

            {/* Error or Warnings */}
            {locationError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#E7A83E]" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Accuracy Badge */}
            {locationDetected && gpsAccuracy !== undefined && (
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#EAF5ED] border border-[#C2E2CC] text-[#1F6B45]">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  GPS Detected • Accuracy: ~{gpsAccuracy} metres
                </span>
                {gpsAccuracy > 100 && (
                  <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
                    Low GPS accuracy: Drag pin to exact gate
                  </span>
                )}
              </div>
            )}

            {/* Interactive Leaflet Map with Draggable Marker */}
            <div className="space-y-2">
              <MapLocationPicker
                latitude={latitude}
                longitude={longitude}
                accuracy={gpsAccuracy}
                isDraggable={true}
                onLocationChange={(newLat, newLon) => {
                  setLatitude(newLat);
                  setLongitude(newLon);
                }}
                height="320px"
                title={farmName || 'Your Farm Location'}
              />

              <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 px-1">
                <span>
                  Latitude: <strong>{latitude.toFixed(6)}</strong> • Longitude: <strong>{longitude.toFixed(6)}</strong>
                </span>
                <span>Drag map pin to adjust exact farm gate</span>
              </div>
            </div>

            {/* Approximate Public Location Checkbox */}
            <div className="bg-[#FAFBF7] p-3.5 rounded-xl border border-[#E2E8E3]">
              <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isApproximate}
                  onChange={(e) => setIsApproximate(e.target.checked)}
                  className="rounded text-[#1F6B45] mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-900">Show approximate village area to buyers</span>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Hides exact private home address from public discovery. Precise gate directions are shared only upon confirmed buyer orders.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
            >
              Already registered? Sign In with Mobile
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm shadow-md"
            >
              {loading ? 'Creating Farm Profile...' : 'Complete Registration & Open Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
