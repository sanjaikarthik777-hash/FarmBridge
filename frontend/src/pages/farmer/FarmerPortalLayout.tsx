import React, { useState } from 'react';
import {
  Menu,
  ArrowLeft,
  Plus,
  ShoppingBag,
  Truck,
  History,
  Settings,
  Store,
  LogOut,
} from 'lucide-react';
import { FarmerSidebar, FarmerNavTab } from './FarmerSidebar';
import { FarmerMobileNav } from '../../components/FarmerMobileNav';
import { FarmerDashboardView } from './FarmerDashboardView';
import { FarmerAddProductView } from './FarmerAddProductView';
import { FarmerMyProductsView } from './FarmerMyProductsView';
import { FarmerIncomingOrdersView } from './FarmerIncomingOrdersView';
import { FarmerProfileView } from './FarmerProfileView';
import { useFarmerAuth } from '../../context/FarmerAuthContext';
import { UserProfile } from '../../types';

interface FarmerPortalLayoutProps {
  onNavigateToConsumer: () => void;
  initialTab?: FarmerNavTab;
  /** Authenticated farmer profile passed down from FarmerPortalGate */
  farmerProfile?: UserProfile | null;
}

export const FarmerPortalLayout: React.FC<FarmerPortalLayoutProps> = ({
  onNavigateToConsumer,
  initialTab = 'dashboard',
  farmerProfile,
}) => {
  const [activeTab, setActiveTab] = useState<FarmerNavTab>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Consume signOut from the context (available because FarmerPortalGate wraps us in FarmerAuthProvider)
  const { signOut } = useFarmerAuth();

  return (
    <div className="min-h-screen bg-[#F8F8F2] text-[#202820] flex flex-col md:flex-row">
      {/* 1. Farmer Desktop & Mobile Sidebar */}
      <FarmerSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.location.hash = `farmer/${tab}`;
        }}
        onNavigateToConsumer={onNavigateToConsumer}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Portal Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Farmer Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E5E9E1] px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7] transition-colors cursor-pointer"
              aria-label="Open portal navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Farm Profile Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#202820] tracking-tight">
                  Farmer Portal
                </span>
                {farmerProfile && (
                  <span className="hidden sm:inline-block bg-[#EAF3E7] text-[#245C3A] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                    {farmerProfile.display_name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#778177] hidden sm:block">
                {farmerProfile
                  ? `${farmerProfile.email || farmerProfile.phone || 'Farmer Account'}`
                  : 'Thennam Thoppu Natural Farm • Aliyar Road, Pollachi'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {activeTab !== 'add_product' && (
              <button
                onClick={() => setActiveTab('add_product')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            <a
              href="/offline/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold transition-all shadow-xs cursor-pointer no-underline"
              title="Open Standalone Offline App Dashboard"
            >
              <span>📱 Offline App</span>
            </a>

            <button
              onClick={onNavigateToConsumer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#202820] text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Return to Consumer Marketplace"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#245C3A]" />
              <span className="hidden sm:inline">Consumer App</span>
            </button>

            {/* Logout button — only shown when authenticated via Supabase */}
            <button
              id="farmer-portal-logout"
              onClick={async () => {
                if (confirm('Sign out of Farmer Portal?')) {
                  await signOut();
                  onNavigateToConsumer();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Sign out of Farmer Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Tab Content Display */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <FarmerDashboardView onNavigateTab={(tab) => setActiveTab(tab)} farmerProfile={farmerProfile} />
          )}

          {activeTab === 'products' && (
            <FarmerMyProductsView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'add_product' && (
            <FarmerAddProductView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'incoming_orders' && (
            <FarmerIncomingOrdersView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-[#E5E9E1] shadow-2xs">
                <h2 className="text-xl font-extrabold text-[#202820]">Delivery Management</h2>
                <p className="text-xs text-[#778177] mt-0.5">
                  Coordinate farm-gate customer pickups and Pollachi doorstep fulfillment routes.
                </p>
              </div>

              <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E9E1] space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#202820]">Fulfillment Routes & Logistics</h3>
                <p className="text-xs text-[#778177] max-w-md mx-auto">
                  View scheduled morning delivery slots and farm gate collection receipts.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#245C3A] hover:bg-[#EAF3E7] cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {activeTab === 'order_history' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-[#E5E9E1] shadow-2xs">
                <h2 className="text-xl font-extrabold text-[#202820]">Completed Order History</h2>
                <p className="text-xs text-[#778177] mt-0.5">
                  View past fulfilled batches, sales summaries, and direct payout records.
                </p>
              </div>

              <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E9E1] space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30">
                  <History className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#202820]">Archived Order Records</h3>
                <p className="text-xs text-[#778177] max-w-md mx-auto">
                  Detailed ledger of all completed consumer orders with timestamps and earnings breakdown.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#245C3A] hover:bg-[#EAF3E7] cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <FarmerProfileView />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-[#E5E9E1] shadow-2xs">
                <h2 className="text-xl font-extrabold text-[#202820]">Portal Settings</h2>
                <p className="text-xs text-[#778177] mt-0.5">
                  Notification preferences, preferred language (English / தமிழ்), and account options.
                </p>
              </div>

              <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E9E1] space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30">
                  <Settings className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#202820]">Farmer Portal Preferences</h3>
                <p className="text-xs text-[#778177] max-w-md mx-auto">
                  Configure language preferences and regional dispatch alerts.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-xl border border-[#E5E9E1] text-xs font-bold text-[#245C3A] hover:bg-[#EAF3E7] cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on md+, shown on mobile) */}
      <FarmerMobileNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
          window.location.hash = `farmer/${tab}`;
        }}
        newOrdersCount={3}
      />
    </div>
  );
};
