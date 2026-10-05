/**
 * FarmerPortalGate — wraps the Farmer Portal with the FarmerAuthProvider and
 * handles all authentication state transitions:
 *
 *   loading             → Full-screen spinner
 *   unauthenticated     → FarmerAuthPage (login / register / forgot)
 *   pending             → Spinner while backend verifies role
 *   pending_verification → "Your account is awaiting approval" screen
 *   rejected            → "Account rejected" screen
 *   wrong_role          → "This account is not a farmer account" screen
 *   authenticated       → FarmerPortalLayout (the full farmer dashboard)
 *
 * The Consumer App auth flow is completely untouched.
 */
import React from 'react';
import {
  Sprout,
  Loader2,
  Clock,
  ShieldX,
  UserX,
  LogOut,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { FarmerAuthProvider, useFarmerAuth } from '../../context/FarmerAuthContext';
import { FarmerAuthPage } from '../auth/FarmerAuthPage';
import { FarmerPortalLayout } from './FarmerPortalLayout';

// ─── Inner gate (consumes context, must live inside Provider) ─────────────────
const InnerGate: React.FC<{ onNavigateToConsumer: () => void }> = ({
  onNavigateToConsumer,
}) => {
  const { status, farmerProfile, refresh, signOut } = useFarmerAuth();

  // ── Loading / Pending (backend verify) ──────────────────────────────────────
  if (status === 'loading' || status === 'pending') {
    return (
      <div className="min-h-screen bg-[#F8F8F2] flex flex-col items-center justify-center gap-4 text-[#245C3A]">
        <div className="w-14 h-14 rounded-2xl bg-[#245C3A] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20">
          <Sprout className="w-8 h-8" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-[#367B4B]" />
        <p className="text-sm font-bold text-[#778177]">
          {status === 'loading' ? 'Loading Farmer Portal…' : 'Verifying your farmer account…'}
        </p>
      </div>
    );
  }

  // ── Unauthenticated → Show login/register page ───────────────────────────────
  if (status === 'unauthenticated') {
    return <FarmerAuthPage onNavigateToConsumer={onNavigateToConsumer} />;
  }

  // ── Pending Verification ─────────────────────────────────────────────────────
  if (status === 'pending_verification') {
    return (
      <div className="min-h-screen bg-[#F8F8F2] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E9E1] shadow-xl p-8 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Clock className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#202820]">Account Awaiting Verification</h1>
            <p className="text-sm text-[#778177] mt-2 leading-relaxed">
              Your farmer account is pending approval.{' '}
              {farmerProfile?.display_name && (
                <span>
                  Hi <strong>{farmerProfile.display_name}</strong>,
                </span>
              )}{' '}
              you will be able to access your dashboard once our team has reviewed and approved your application.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-left space-y-1">
            <p className="font-bold">What happens next:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-[#92400E]">
              <li>Confirm your email address (check your inbox)</li>
              <li>Our team reviews your farm registration details</li>
              <li>You receive an approval email (typically 1–2 business days)</li>
              <li>Sign in to access the full Farmer Dashboard</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              id="farmer-pending-refresh"
              onClick={refresh}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#245C3A] text-sm font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Check Approval Status
            </button>
            <button
              id="farmer-pending-signout"
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-sm font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              type="button"
              id="farmer-pending-consumer"
              onClick={onNavigateToConsumer}
              className="text-xs font-bold text-[#778177] hover:text-[#245C3A] flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go to Consumer Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Rejected ─────────────────────────────────────────────────────────────────
  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-[#F8F8F2] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E9E1] shadow-xl p-8 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldX className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#202820]">Application Not Approved</h1>
            <p className="text-sm text-[#778177] mt-2 leading-relaxed">
              Unfortunately, your farmer account application was not approved at this time. Please contact
              FarmBridge support for more information and to appeal the decision.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              id="farmer-rejected-signout"
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              type="button"
              id="farmer-rejected-consumer"
              onClick={onNavigateToConsumer}
              className="text-xs font-bold text-[#778177] hover:text-[#245C3A] flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go to Consumer Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Wrong Role (Google account exists as consumer, not farmer) ───────────────
  if (status === 'wrong_role') {
    return (
      <div className="min-h-screen bg-[#F8F8F2] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E9E1] shadow-xl p-8 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 border border-blue-200 flex items-center justify-center mx-auto">
            <UserX className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#202820]">Not a Farmer Account</h1>
            <p className="text-sm text-[#778177] mt-2 leading-relaxed">
              The signed-in Google account is registered as a Consumer, not a Farmer. Please sign in with
              a different Google account registered as a farmer, or register a new farmer account.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              id="farmer-wrongrole-signout"
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-sm font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out &amp; Use Different Account
            </button>
            <button
              type="button"
              id="farmer-wrongrole-consumer"
              onClick={onNavigateToConsumer}
              className="text-xs font-bold text-[#778177] hover:text-[#245C3A] flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Continue to Consumer Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated Farmer → Full Dashboard ────────────────────────────────────
  return (
    <FarmerPortalLayout
      onNavigateToConsumer={onNavigateToConsumer}
      farmerProfile={farmerProfile}
    />
  );
};

// ─── Exported gate (adds the Provider) ───────────────────────────────────────
export const FarmerPortalGate: React.FC<{ onNavigateToConsumer: () => void }> = ({
  onNavigateToConsumer,
}) => (
  <FarmerAuthProvider>
    <InnerGate onNavigateToConsumer={onNavigateToConsumer} />
  </FarmerAuthProvider>
);
