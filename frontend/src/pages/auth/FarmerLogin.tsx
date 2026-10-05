import React, { useState, useEffect } from 'react';
import { Sprout, Phone, KeyRound, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AuthSession } from '../../types';

interface FarmerLoginProps {
  onSuccess: (session: AuthSession) => void;
  onGoToRegister: () => void;
  onGoToConsumerLogin: () => void;
}

export const FarmerLogin: React.FC<FarmerLoginProps> = ({
  onSuccess,
  onGoToRegister,
  onGoToConsumerLogin,
}) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.sendOtp(mobile, 'farmer', 'login');
      setOtpSent(true);
      setDevOtp(res.dev_otp || null);
      setCooldown(res.cooldown_seconds || 30);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP. Ensure mobile is registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await api.verifyOtp(mobile, otp, 'farmer');
      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E8E3] shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1F6B45] text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/20">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EAF5ED] text-[#1F6B45] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Farmer Access Portal
          </div>
          <h1 className="text-2xl font-black text-[#202820]">Farmer Sign In</h1>
          <p className="text-xs text-[#68736B]">
            Authenticate using your verified mobile number and secure OTP to access your farm dashboard and orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dev OTP Helper Banner */}
        {devOtp && (
          <div className="p-3.5 rounded-2xl bg-[#FEF6E9] border border-[#FCE6BE] text-xs text-[#92400E] flex items-center justify-between">
            <span>
              🔑 <strong>Test OTP Code:</strong> <span className="font-mono text-sm font-black">{devOtp}</span>
            </span>
            <button
              type="button"
              onClick={() => setOtp(devOtp)}
              className="text-[11px] font-bold underline hover:text-amber-900"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Farmer Mobile Number
              </label>
              <div className="relative">
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
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-hidden focus:border-[#1F6B45] focus:ring-2 focus:ring-[#1F6B45]/15"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Demo Farmer Murugan: <button type="button" onClick={() => setMobile('9443210842')} className="text-[#1F6B45] font-bold underline">9443210842</button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm shadow-md"
            >
              {loading ? (
                'Dispatching OTP...'
              ) : (
                <>
                  Send Verification OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[11px] text-[#1F6B45] font-semibold underline"
                >
                  Change Mobile
                </button>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="6-Digit OTP (e.g. 123456)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-mono tracking-widest font-bold focus:outline-hidden focus:border-[#1F6B45]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm shadow-md"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Enter Farmer Dashboard'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={handleSendOtp}
                className="text-xs font-semibold text-gray-600 hover:text-[#1F6B45] disabled:opacity-50 inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 text-center text-xs">
          <p className="text-gray-600">
            New farmer in Pollachi?{' '}
            <button
              onClick={onGoToRegister}
              className="font-bold text-[#1F6B45] hover:underline"
            >
              Register your Farm Grove
            </button>
          </p>

          <p className="text-gray-500 pt-1">
            Looking to purchase fresh produce?{' '}
            <button
              onClick={onGoToConsumerLogin}
              className="text-blue-700 font-bold hover:underline"
            >
              Switch to Consumer Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
