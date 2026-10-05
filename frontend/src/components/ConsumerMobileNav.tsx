import React from 'react';
import { Home, Compass, Grid, Heart, User } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ConsumerMobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  lang: Language;
}

export const ConsumerMobileNav: React.FC<ConsumerMobileNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
}) => {
  const t = translations[lang];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E9E1] px-2 py-1.5 shadow-lg shadow-black/5"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#245C3A] font-extrabold'
              : 'text-[#778177] hover:text-[#202820]'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">{t.nav_home}</span>
        </button>

        {/* 2. Explore / Catalogue */}
        <button
          type="button"
          onClick={() => onSelectTab('catalogue')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'catalogue'
              ? 'text-[#245C3A] font-extrabold'
              : 'text-[#778177] hover:text-[#202820]'
          }`}
        >
          <Grid className={`w-5 h-5 ${activeTab === 'catalogue' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">
            {lang === 'en' ? 'Explore' : 'பொருட்கள்'}
          </span>
        </button>

        {/* 3. Nearby Farms */}
        <button
          type="button"
          onClick={() => onSelectTab('nearby_farms')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'nearby_farms'
              ? 'text-[#245C3A] font-extrabold'
              : 'text-[#778177] hover:text-[#202820]'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'nearby_farms' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">
            {lang === 'en' ? 'Nearby' : 'பண்ணைகள்'}
          </span>
        </button>

        {/* 4. Wishlist */}
        <button
          type="button"
          onClick={() => onSelectTab('wishlist')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'wishlist'
              ? 'text-[#245C3A] font-extrabold'
              : 'text-[#778177] hover:text-[#202820]'
          }`}
        >
          <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'fill-[#245C3A] stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">{t.nav_wishlist}</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile' || activeTab === 'orders'
              ? 'text-[#245C3A] font-extrabold'
              : 'text-[#778177] hover:text-[#202820]'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' || activeTab === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">{t.nav_profile}</span>
        </button>
      </div>
    </nav>
  );
};
