import React, { useState } from 'react';
import {
  ShoppingBag,
  Crosshair,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { AuthSession } from '../../types';
import { MapLocationPicker } from '../../components/MapLocationPicker';

interface ConsumerRegisterProps {
  onSuccess: (session: AuthSession) => void;
  onGoToLogin: () => void;
}

export const ConsumerRegister: React.FC<ConsumerRegisterProps> = ({ onSuccess, onGoToLogin }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState('Door 14, 2nd Cross, Mahalingapuram, Pollachi');
  const [preferredLang, setPreferredLang] = useState<'en' | 'ta'>('en');

  // Geospatial Delivery Coordinates
  const [latitude, setLatitude] = useState<number>(10.6580); // Default Mahalingapuram Pollachi
  const [longitude, setLongitude] = useState<number>(77.0080);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    try {
      const res = await api.sendOtp(mobile, 'consumer', 'register');
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
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lon);
        setGpsAccuracy(acc);
        setLocationDetected(true);
        setIsDetectingLocation(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('GPS permission was denied. You can manually drag the pin on the map or type your address.');
        } else {
          setLocationError('GPS signal unavailable. Please adjust the location pin on the map.');
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
    if (!name.trim() || !deliveryAddress.trim()) {
      setError('Please provide your name and delivery address.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the OTP verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await api.registerConsumer({
        display_name: name,
        mobile: mobile,
        otp: otp,
        delivery_address: deliveryAddress,
        latitude: latitude,
        longitude: longitude,
        gps_accuracy: gpsAccuracy,
        preferred_language: preferredLang,
      });

      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Consumer registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8E3] shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Consumer Registration
            </div>
            <h1 className="text-2xl font-black text-gray-900">Create Consumer Account</h1>
            <p className="text-xs text-gray-500">
              Discover fresh produce from genuinely nearby farms in Pollachi.
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kavitha Sundaram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Preferred Language *
                </label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value as 'en' | 'ta')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
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
                      placeholder="97890 41235"
                      className="w-full pl-14 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
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

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Default Delivery Address in Pollachi *
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House No., Street, Landmark, Pollachi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>

          {/* Location & Map Section */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                  Delivery Location (For Nearby Farm Discovery)
                </label>
                <p className="text-xs text-gray-500">
                  Used to calculate true geographic distance to local farms.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                {isDetectingLocation ? 'Detecting...' : 'Use My Current Location'}
              </button>
            </div>

            {locationError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                {locationError}
              </div>
            )}

            {locationDetected && (
              <div className="flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                <CheckCircle2 className="w-4 h-4" />
                GPS Location Captured {gpsAccuracy ? `(Accuracy: ~${gpsAccuracy}m)` : ''}
              </div>
            )}

            <MapLocationPicker
              latitude={latitude}
              longitude={longitude}
              accuracy={gpsAccuracy}
              isDraggable={true}
              onLocationChange={(newLat, newLon) => {
                setLatitude(newLat);
                setLongitude(newLon);
              }}
              height="280px"
              title="Your Delivery Destination"
            />
            <div className="text-[11px] text-gray-500 text-right">
              Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)} • Drag pin to refine
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
            >
              Already have an account? Sign In
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration & Open Marketplace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
