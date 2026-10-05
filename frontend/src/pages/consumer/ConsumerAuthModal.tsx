import React, { useState } from 'react';
import {
  X,
  Sprout,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  MapPin,
  HeartHandshake,
  Mail,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { api } from '../../services/api';
import { AuthSession } from '../../types';
import { Language } from '../../i18n/translations';

interface ConsumerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (session: AuthSession) => void;
  lang: Language;
}

export const ConsumerAuthModal: React.FC<ConsumerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang,
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);


  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setShowGoogleFallback(false);
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (signInError) {
        setError(signInError.message || 'Google sign-in could not be initiated.');
        setShowGoogleFallback(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during Google authentication.');
      setShowGoogleFallback(true);
      setLoading(false);
    }
  };

  const handleDemoGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await api.syncSupabaseUser({
        supabase_id: 'b1000000-0000-0000-0000-000000000001',
        email: 'kavitha.consumer@demo.farmbridge.in',
        display_name: 'Kavitha Sundaram (Google Demo)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
      });
      if (onSuccess) onSuccess(session);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingSession, setPendingSession] = useState<AuthSession | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle countdown for resend
  React.useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset modal state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setOtpStep(false);
      setOtpCode('');
      setPassword('');
      setError(null);
      setLoading(false);
      setPendingSession(null);
    }
  }, [isOpen]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (emailMode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    setLoading(true);
    setError(null);

    // Trigger OTP Flow BEFORE Supabase authentication
    try {
      await api.sendEmailOtp(cleanEmail);
      setOtpStep(true);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }
    
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Verify OTP with our backend first
      // Pass a dummy session_token if pendingSession is not set yet
      await api.verifyEmailOtp(cleanEmail, otpCode, pendingSession?.token || 'temp-token');
      
      // 2. ONLY if OTP is correct, authenticate with Supabase
      if (emailMode === 'signin') {
        const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (supaErr) throw new Error('Invalid credentials. Please check your password.');
      } else {
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim(), role: 'consumer' },
          },
        });
        if (supaErr) throw new Error('Registration failed.');
      }
      
      // 3. The global Supabase auth listener in App.tsx will automatically close the modal and update state.
      // However, we explicitly call onClose here as a fallback to ensure the UI updates instantly.
      if (onSuccess && pendingSession) {
        onSuccess(pendingSession);
      }
      onClose();

    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check your OTP or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      await api.sendEmailOtp(email.trim().toLowerCase());
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP.');
    }
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E5E9E1] overflow-hidden relative grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-gray-100 text-[#778177] hover:text-[#202820] shadow-xs transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Split-Screen Farm-to-Table Showcase */}
        <div className="relative bg-[#245C3A] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
          {/* Decorative background visual overlay */}
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#75A85A]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#EAF3E7] text-[11px] font-bold">
              <Sprout className="w-3.5 h-3.5 text-[#75A85A]" />
              <span>Pollachi Farm Network</span>
            </div>

            <h2 id="consumer-auth-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Freshness Starts Here
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Discover fresh produce directly from local farms and bring nature closer to your table.
            </p>
          </div>

          {/* Key Trust Highlights */}
          <div className="relative z-10 pt-6 border-t border-white/15 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#75A85A] shrink-0" />
              <span>100% of payment directly to local growers</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-100">
              <MapPin className="w-4 h-4 text-[#75A85A] shrink-0" />
              <span>Accurate GPS distance to harvest groves</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-100">
              <HeartHandshake className="w-4 h-4 text-[#75A85A] shrink-0" />
              <span>Daily price match with Uzhavar Sandhai</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Actions (Google + Email) */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-5 bg-white overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#EAF3E7] flex items-center justify-center text-[#245C3A]">
                <Sprout className="w-5 h-5 text-[#367B4B]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#202820]">
                  {lang === 'en' ? 'Consumer Sign In' : 'வாடிக்கையாளர் உள்நுழைவு'}
                </h3>
                <p className="text-[11px] text-[#778177]">
                  Google OAuth & Email Access
                </p>
              </div>
            </div>

            {/* Auth Method Selector Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F8F8F2] rounded-2xl border border-[#E5E9E1] text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMethod('google'); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  authMethod === 'google'
                    ? 'bg-white text-[#245C3A] shadow-xs font-extrabold'
                    : 'text-[#778177] hover:text-[#202820]'
                }`}
              >
                Google Auth
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-[#245C3A] shadow-xs font-extrabold'
                    : 'text-[#778177] hover:text-[#202820]'
                }`}
              >
                Email Login
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">Authentication Notice</div>
                  <div className="text-[11px] text-rose-700 mt-0.5">{error}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-500 hover:text-rose-800 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* TAB 1: GOOGLE AUTH */}
            {authMethod === 'google' && (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-[#778177] leading-relaxed">
                  Sign in or create your account with Google to track farm orders, save delivery addresses, and enjoy freshly harvested produce.
                </p>

                <button
                  id="google-signin-button"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-[#EAF3E7]/40 text-[#202820] text-xs font-bold rounded-2xl border-2 border-[#245C3A] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-70 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#245C3A]" />
                      <span className="text-[#245C3A] font-bold">
                        {lang === 'en' ? 'Connecting to Google...' : 'கூகிள் உடன் இணைக்கிறது...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="text-sm font-bold text-[#202820]">
                        {lang === 'en' ? 'Continue with Google' : 'Google மூலம் தொடரவும்'}
                      </span>
                    </>
                  )}
                </button>

                {(showGoogleFallback || error) && (
                  <button
                    type="button"
                    onClick={handleDemoGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#EAF3E7] hover:bg-[#d8e9d3] text-[#245C3A] text-xs font-bold rounded-2xl border border-[#75A85A]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Instant Demo Google Sign-In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#778177]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#367B4B]" />
                  <span>Protected by Supabase Auth (OAuth 2.0 PKCE)</span>
                </div>
              </div>
            )}

            {/* TAB 2: EMAIL AUTH */}
            {authMethod === 'email' && (
              otpStep ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                  <div className="text-center space-y-2 mb-4">
                    <div className="mx-auto w-12 h-12 bg-[#EAF3E7] rounded-full flex items-center justify-center mb-3">
                      <Mail className="w-6 h-6 text-[#245C3A]" />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#202820]">Enter Verification Code</h3>
                    <p className="text-xs text-[#778177]">
                      We've sent a 6-digit code to <span className="font-bold text-[#202820]">{email}</span>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-lg font-bold py-3 rounded-xl border border-[#E5E9E1] focus:outline-none focus:border-[#245C3A] bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-[#245C3A] font-bold text-[11px] hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              ) : (
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#202820]">
                    {emailMode === 'signin' ? 'Sign In with Email' : 'Create New Account'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                      setError(null);
                    }}
                    className="text-[#245C3A] font-bold hover:underline text-[11px]"
                  >
                    {emailMode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                  </button>
                </div>

                {emailMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#778177] uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778177]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Kavitha Sundaram"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:outline-none focus:border-[#245C3A] bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#778177] uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778177]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kavitha.consumer@demo.farmbridge.in"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:outline-none focus:border-[#245C3A] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#778177] uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778177]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E9E1] text-xs focus:outline-none focus:border-[#245C3A] bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{emailMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              )
            )}
          </div>

          {/* Privacy Note */}
          <div className="pt-3 border-t border-[#E5E9E1] text-center text-[10px] text-[#778177]">
            By continuing, you agree to FarmBridge's{' '}
            <span className="text-[#202820] font-semibold underline">Terms of Service</span> and{' '}
            <span className="text-[#202820] font-semibold underline">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
};

