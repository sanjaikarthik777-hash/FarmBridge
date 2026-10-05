import React, { useState, useEffect } from 'react';
import { Package, User } from 'lucide-react';
import { ConsumerHeader } from './components/ConsumerHeader';
import { ConsumerMobileNav } from './components/ConsumerMobileNav';
import { LocationSelectorModal, LocationState } from './components/LocationSelectorModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ConsumerHome } from './pages/consumer/ConsumerHome';
import { ProductsCatalogue } from './pages/consumer/ProductsCatalogue';
import { NearbyFarmsPage } from './pages/consumer/NearbyFarmsPage';
import { ConsumerWishlist } from './pages/consumer/ConsumerWishlist';
import { ConsumerOrders } from './pages/consumer/ConsumerOrders';
import { ConsumerProfile } from './pages/consumer/ConsumerProfile';
import { ConsumerCart } from './pages/consumer/ConsumerCart';
import { CheckoutModal } from './pages/consumer/CheckoutModal';
import { ProductDetailModal } from './pages/consumer/ProductDetailModal';
import { ConsumerAuthModal } from './pages/consumer/ConsumerAuthModal';
import { FarmerPortalGate } from './pages/farmer/FarmerPortalGate';
import {
  UserProfile,
  Product,
  Category,
  Cart,
  Order,
  Farm,
  SavedAddress,
  NotificationItem,
  AuthSession
} from './types';
import { Language, translations } from './i18n/translations';
import { api, setAuthToken } from './services/api';
import { supabase } from './utils/supabase/client';

export function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    delivery_fee: 25,
    platform_fee: 5,
    total: 30,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'catalogue' | 'nearby_farms' | 'wishlist' | 'orders' | 'profile'
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  // Check if current URL path or hash indicates the Farmer Portal (/farmer or #farmer)
  const checkIsFarmerRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path.startsWith('/farmer') ||
      hash.startsWith('#farmer') ||
      hash.startsWith('#/farmer')
    );
  };
  const [isFarmerPortal, setIsFarmerPortal] = useState<boolean>(checkIsFarmerRoute);

  // Active Location State (Default: Pollachi Town Center)
  const [activeLocation, setActiveLocation] = useState<LocationState>({
    label: 'Pollachi Central (உழவர் சந்தை)',
    latitude: 10.6609,
    longitude: 77.0048,
    accuracy: 15,
    isApproximate: false,
  });

  // Modal Visibility States
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Data Loading
  const loadInitialData = async (loc = activeLocation) => {
    try {
      setLoading(true);

      // Check authenticated session with backend
      try {
        const me = await api.getMe();
        setCurrentProfile(me);
      } catch (e) {
        setCurrentProfile(null);
      }

      // Concurrently fetch catalogue, nearby farms, cart, categories, addresses, wishlist
      const [catData, prodData, farmsData, cartData, ordersData, addrsData, wishData, notifData] =
        await Promise.all([
          api.getCategories().catch(() => []),
          api.getNearbyProducts({ lat: loc.latitude, lng: loc.longitude }).catch(() => []),
          api.getNearbyFarms({ lat: loc.latitude, lng: loc.longitude }).catch(() => []),
          api.getCart().catch(() => ({
            items: [],
            subtotal: 0,
            delivery_fee: 25,
            platform_fee: 5,
            total: 30,
          })),
          api.getOrders().catch(() => []),
          api.getSavedAddresses().catch(() => []),
          api.getWishlist().catch(() => ({ product_ids: [], products: [] })),
          api.getNotifications().catch(() => []),
        ]);

      setCategories(catData);
      setProducts(prodData);
      setFarms(farmsData);
      setCart(cartData);
      setOrders(ordersData);
      setSavedAddresses(addrsData);
      setWishlistIds(wishData.product_ids || []);
      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to load platform data', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Supabase Auth Lifecycle and OAuth Redirect Handling
  useEffect(() => {
    // A. Detect OAuth errors from Google or Supabase in URL search/hash
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const authError =
      urlParams.get('error_description') ||
      urlParams.get('error') ||
      hashParams.get('error_description') ||
      hashParams.get('error');

    if (authError) {
      const decodedError = decodeURIComponent(authError.replace(/\+/g, ' '));
      showToast(`Google Sign-In: ${decodedError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // B. Supabase Auth State Change Listener — Consumer App only
    // Skip if we are on the Farmer Portal route (the FarmerAuthContext handles its own session)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Do not interfere with farmer portal auth which has its own FarmerAuthProvider
      if (checkIsFarmerRoute()) return;

      console.log('Consumer Supabase Auth Event:', event, session?.user?.email);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          const authUser = session.user;
          const displayName =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            (authUser.email ? authUser.email.split('@')[0] : 'Consumer');
          const avatarUrl =
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture ||
            null;

          try {
            const synced = await api.syncSupabaseUser({
              supabase_id: authUser.id,
              email: authUser.email || null,
              display_name: displayName,
              avatar_url: avatarUrl,
            });

            setCurrentProfile(synced.profile);
            setIsAuthModalOpen(false);

            // Clean OAuth query/hash fragments from URL
            if (
              window.location.hash.includes('access_token') ||
              window.location.search.includes('code=')
            ) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Redirect authenticated consumer to consumer dashboard
            setActiveTab('home');
            showToast(`Welcome ${synced.profile.display_name}! Signed in via Google.`);
            loadInitialData();
          } catch (syncErr: any) {
            console.error('Failed to sync authenticated user profile:', syncErr);
            showToast(syncErr?.message || 'Could not synchronize consumer profile');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthToken(null);
        setCurrentProfile(null);
        setActiveTab('home');
        window.history.replaceState({}, document.title, window.location.pathname);
        loadInitialData();
      }
    });

    // C. Check initial session directly once on startup
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionErr }) => {
      if (sessionErr) {
        console.error('Session retrieval error:', sessionErr);
      }
      if (session?.user) {
        const authUser = session.user;
        const displayName =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          (authUser.email ? authUser.email.split('@')[0] : 'Consumer');
        const avatarUrl =
          authUser.user_metadata?.avatar_url ||
          authUser.user_metadata?.picture ||
          null;

        try {
          const synced = await api.syncSupabaseUser({
            supabase_id: authUser.id,
            email: authUser.email || null,
            display_name: displayName,
            avatar_url: avatarUrl,
          });
          setCurrentProfile(synced.profile);
        } catch (e) {
          console.error('Initial getSession sync error:', e);
        }
      } else {
        loadInitialData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Centralized Tab Navigation with Route Protection
  const handleNavigateTab = (tab: string) => {
    if ((tab === 'orders' || tab === 'profile') && !currentProfile) {
      setIsAuthModalOpen(true);
      showToast(
        lang === 'en'
          ? `Please sign in with Google to view ${tab === 'orders' ? 'orders' : 'profile'}`
          : 'தயவுசெய்து Google மூலம் உள்நுழையவும்'
      );
      return;
    }
    setActiveTab(tab);
    window.history.pushState({ tab }, '', '#' + tab);
  };

  const handleNavigateToFarmer = () => {
    setIsFarmerPortal(true);
    window.history.pushState({ portal: 'farmer' }, '', '/farmer');
  };

  const handleNavigateToConsumer = () => {
    setIsFarmerPortal(false);
    window.history.pushState({ portal: 'consumer' }, '', '/');
  };

  // 4. Protect Authenticated Routes and Handle Portal Switching on Back/Forward Navigation
  useEffect(() => {
    const handlePopState = () => {
      const isFarmer = checkIsFarmerRoute();
      setIsFarmerPortal(isFarmer);
      if (isFarmer) return;

      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'orders' || hash === 'profile') {
        if (!currentProfile) {
          setActiveTab('home');
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsAuthModalOpen(true);
          showToast(
            lang === 'en'
              ? 'Please sign in with Google to access this page.'
              : 'அணுகலுக்கு Google உள்நுழைவு தேவை.'
          );
          return;
        }
      }
      if (['home', 'catalogue', 'nearby_farms', 'wishlist', 'orders', 'profile'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Initial check on load if URL targeted farmer portal, #orders or #profile
    if (checkIsFarmerRoute()) {
      setIsFarmerPortal(true);
    } else {
      const initialHash = window.location.hash.replace(/^#/, '');
      if ((initialHash === 'orders' || initialHash === 'profile') && !currentProfile) {
        setActiveTab('home');
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsAuthModalOpen(true);
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [currentProfile, lang]);

  // Handle Location Change
  const handleSelectLocation = async (newLoc: LocationState) => {
    setActiveLocation(newLoc);
    showToast(`Delivery location set to: ${newLoc.label}`);
    try {
      const [nearbyProds, nearbyFarms] = await Promise.all([
        api.getNearbyProducts({ lat: newLoc.latitude, lng: newLoc.longitude }),
        api.getNearbyFarms({ lat: newLoc.latitude, lng: newLoc.longitude }),
      ]);
      setProducts(nearbyProds);
      setFarms(nearbyFarms);
    } catch (e) {
      console.error(e);
    }
  };

  // Sign-Out Handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error', e);
    }
    try {
      await api.logout();
    } catch (e) {
      console.error('Backend logout error', e);
    }
    setAuthToken(null);
    setCurrentProfile(null);
    setActiveTab('home');
    window.history.replaceState({}, document.title, window.location.pathname);
    setIsAuthModalOpen(true); // Redirect to login modal
    showToast(
      lang === 'en'
        ? 'You have been signed out. Please sign in with Google to continue.'
        : 'வெற்றிகரமாக வெளியேற்றப்பட்டீர்கள்.'
    );
    loadInitialData();
  };

  const handleAuthSuccess = (session: AuthSession) => {
    setAuthToken(session.token);
    setCurrentProfile(session.profile);
    setIsAuthModalOpen(false);
    setActiveTab('home');
    showToast(`Welcome ${session.profile.display_name}! Signed in to FarmBridge.`);
    loadInitialData();
  };

  // Cart Operations
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await api.addToCart(productId, quantity);
      setCart(updatedCart);
      showToast('Produce added to your basket!');
    } catch (err: any) {
      alert(err.message || 'Could not add produce to basket');
    }
  };

  const handleUpdateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      const updated = await api.updateCartItem(itemId, quantity);
      setCart(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveCartItem = async (itemId: string) => {
    try {
      const updated = await api.removeCartItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Buy Now Shortcut
  const handleBuyNow = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await api.addToCart(productId, quantity);
      setCart(updatedCart);
      setIsCheckoutOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Order Placement
  const handlePlaceOrder = async (orderData: {
    fulfilment_type: 'pickup' | 'delivery';
    delivery_area: string;
    delivery_address: string;
    delivery_contact_phone: string;
    delivery_slot: string;
    payment_method: string;
  }) => {
    if (!currentProfile) {
      setIsCheckoutOpen(false);
      setIsAuthModalOpen(true);
      showToast('Please sign in with Google to confirm your order.');
      return;
    }

    const newOrder = await api.createOrder(orderData);
    const [freshCart, freshOrders, freshProds, freshNotifs] = await Promise.all([
      api.getCart(),
      api.getOrders(),
      api.getNearbyProducts({ lat: activeLocation.latitude, lng: activeLocation.longitude }),
      api.getNotifications(),
    ]);
    setCart(freshCart);
    setOrders(freshOrders);
    setProducts(freshProds);
    setNotifications(freshNotifs);
    showToast(`Order #${newOrder.order_number} confirmed! Sent to farmer.`);
    handleNavigateTab('orders');
  };

  // Wishlist Toggle
  const handleToggleWishlist = async (productId: string) => {
    if (wishlistIds.includes(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      try {
        await api.removeFromWishlist(productId);
        showToast('Removed from wishlist');
      } catch (e) {}
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      try {
        await api.addToWishlist(productId);
        showToast('Saved to wishlist!');
      } catch (e) {}
    }
  };

  // Address Operations
  const handleAddAddress = async (data: Partial<SavedAddress>) => {
    const saved = await api.addSavedAddress(data);
    setSavedAddresses((prev) => [...prev, saved]);
    showToast('Delivery address saved!');
  };

  const handleDeleteAddress = async (id: string) => {
    await api.deleteSavedAddress(id);
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address removed.');
  };

  const handleSetDefaultAddress = async (id: string) => {
    await api.setDefaultAddress(id);
    setSavedAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
    showToast('Default address updated.');
  };

  // Notifications Operations
  const handleMarkAllNotificationsRead = async () => {
    await api.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const cartItemQuantities = cart.items.reduce((acc, item) => {
    acc[item.product_id] = item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  // Render the dedicated Farmer Portal when on /farmer route
  if (isFarmerPortal) {
    return <FarmerPortalGate onNavigateToConsumer={handleNavigateToConsumer} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F2] text-[#202820]">
      {/* Consumer Header - Hidden on home for custom hero header */}
      {activeTab !== 'home' && (
        <ConsumerHeader
          currentProfile={currentProfile}
          activeLocation={activeLocation}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          lang={lang}
          onToggleLang={setLang}
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          cartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          wishlistCount={wishlistIds.length}
          onOpenWishlist={() => handleNavigateTab('wishlist')}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={handleLogout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          categories={categories}
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onSearchSubmit={() => {
            handleNavigateTab('catalogue');
          }}
          onNavigateToFarmer={handleNavigateToFarmer}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-[#245C3A] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          🌱 {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${activeTab === 'home' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 md:pb-12'}`}>
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#1F6B45] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-600">
              Connecting to Pollachi Regional Farm Network...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Home Page */}
            {activeTab === 'home' && (
              <ConsumerHome
                products={products}
                categories={categories}
                farms={farms}
                activeLocation={activeLocation}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                lang={lang}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                cartItemQuantities={cartItemQuantities}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onNavigateToCatalogue={(catId) => {
                  setSelectedCategoryId(catId);
                  handleNavigateTab('catalogue');
                }}
                onNavigateToNearbyFarms={() => handleNavigateTab('nearby_farms')}
                onSelectFarm={(farmId) => {
                  setSelectedFarmId(farmId);
                  handleNavigateTab('nearby_farms');
                }}
                currentProfile={currentProfile}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenCart={() => setIsCartOpen(true)}
                cartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                onNavigateToProfile={() => handleNavigateTab('profile')}
              />
            )}
            
            {/* 2. Products Catalogue */}
            {activeTab === 'catalogue' && (
              <ProductsCatalogue
                products={products}
                categories={categories}
                farms={farms}
                activeLocation={activeLocation}
                lang={lang}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                cartItemQuantities={cartItemQuantities}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                initialCategoryId={selectedCategoryId}
              />
            )}

            {/* 3. Nearby Farms Page */}
            {activeTab === 'nearby_farms' && (
              <NearbyFarmsPage
                farms={farms}
                products={products}
                activeLocation={activeLocation}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                lang={lang}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                cartItemQuantities={cartItemQuantities}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                selectedFarmId={selectedFarmId}
                onSelectFarmId={setSelectedFarmId}
              />
            )}

            {/* 4. Wishlist Page */}
            {activeTab === 'wishlist' && (
              <ConsumerWishlist
                products={products}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                lang={lang}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                cartItemQuantities={cartItemQuantities}
                onExploreProduce={() => handleNavigateTab('catalogue')}
              />
            )}

            {/* 5. Orders Page (Protected Route) */}
            {activeTab === 'orders' && (
              currentProfile ? (
                <ConsumerOrders
                  orders={orders}
                  onRefresh={async () => {
                    const o = await api.getOrders();
                    setOrders(o);
                  }}
                  lang={lang}
                  onExploreProduce={() => handleNavigateTab('catalogue')}
                />
              ) : (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs max-w-lg mx-auto mt-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1F6B45] flex items-center justify-center mx-auto shadow-xs">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {lang === 'en' ? 'Sign In to View Orders' : 'உங்கள் ஆர்டர்களைக் காண உள்நுழையவும்'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {lang === 'en'
                      ? 'Access live dispatch status, harvest batches, and past deliveries from Pollachi farms.'
                      : 'உங்கள் ஆணை நிலவரம் மற்றும் முந்தைய ஆர்டர்களைப் பார்க்க உள்நுழையவும்.'}
                  </p>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-6 py-2.5 bg-[#1F6B45] hover:bg-[#185336] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    {lang === 'en' ? 'Continue with Google' : 'Google மூலம் உள்நுழைக'}
                  </button>
                </div>
              )
            )}

            {/* 6. Profile Page (Protected Route) */}
            {activeTab === 'profile' && (
              currentProfile ? (
                <ConsumerProfile
                  currentProfile={currentProfile}
                  savedAddresses={savedAddresses}
                  onAddAddress={handleAddAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onSetDefaultAddress={handleSetDefaultAddress}
                  lang={lang}
                  onToggleLang={setLang}
                  onLogout={handleLogout}
                  onNavigateToOrders={() => handleNavigateTab('orders')}
                  onNavigateToWishlist={() => handleNavigateTab('wishlist')}
                />
              ) : (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs max-w-lg mx-auto mt-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1F6B45] flex items-center justify-center mx-auto shadow-xs">
                    <User className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {lang === 'en' ? 'Consumer Account Required' : 'வாடிக்கையாளர் கணக்கு தேவை'}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {lang === 'en'
                      ? 'Sign in to manage your delivery locations, preferences, and verified consumer profile.'
                      : 'உங்கள் விநியோக முகவரிகள் மற்றும் சுயவிவரத்தை நிர்வகிக்க உள்நுழையவும்.'}
                  </p>
                  <div className="flex flex-col items-center gap-3 mt-2">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-6 py-2.5 bg-[#1F6B45] hover:bg-[#185336] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer w-full max-w-xs"
                    >
                      {lang === 'en' ? 'Sign In / Register' : 'உள்நுழைக'}
                    </button>
                    
                    {/* Fallback Sign Out for zombie sessions */}
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 text-rose-600 hover:bg-rose-50 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {lang === 'en' ? 'Clear Stuck Session (Sign Out)' : 'வெளியேறு'}
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {activeTab !== 'home' && (
        <ConsumerMobileNav
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          cartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          lang={lang}
        />
      )}

      {/* Modals & Drawers */}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={activeLocation}
        onSelectLocation={handleSelectLocation}
        savedAddresses={savedAddresses}
        onAddAddress={handleAddAddress}
        lang={lang}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          farm={farms.find((f) => f.id === selectedProduct.farm_id)}
          onClose={() => setSelectedProduct(null)}
          lang={lang}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isWishlisted={wishlistIds.includes(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          otherFarmProducts={products.filter(
            (p) => p.farm_id === selectedProduct.farm_id && p.id !== selectedProduct.id
          )}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onViewFarm={(farmId) => {
            setSelectedFarmId(farmId);
            handleNavigateTab('nearby_farms');
          }}
        />
      )}

      {/* Consumer Cart Drawer */}
      <ConsumerCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        lang={lang}
        onExploreProduce={() => handleNavigateTab('catalogue')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentProfile={currentProfile}
        savedAddresses={savedAddresses}
        activeLocation={activeLocation}
        onPlaceOrder={handlePlaceOrder}
        lang={lang}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        lang={lang}
        onSelectOrder={() => handleNavigateTab('orders')}
      />

      {/* Consumer Google OAuth Auth Modal */}
      <ConsumerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* Consumer App Footer */}
      {activeTab !== 'home' && (
      <footer className="bg-white border-t border-[#E5E9E1] pt-12 pb-24 md:pb-12 text-xs text-[#778177]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#245C3A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🌱
                </div>
                <span className="font-extrabold text-base text-[#202820] tracking-tight">FarmBridge</span>
                <span className="bg-[#EAF3E7] text-[#245C3A] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#75A85A]/30">
                  Consumer
                </span>
              </div>
              <p className="text-xs text-[#778177] max-w-md leading-relaxed">
                {lang === 'ta'
                  ? 'பொள்ளாச்சி மற்றும் ஆனைமலைப் பகுதி விவசாயிகளிடமிருந்து நேரடியாக நுகர்வோரை இணைக்கும் நவீன வேளாண் தளம்.'
                  : 'Direct farmer-to-consumer agricultural marketplace connecting Pollachi households directly with authentic growers and fresh harvests.'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#245C3A] font-semibold">
                <span>📍 Pollachi, Tamil Nadu, India</span>
                <span>•</span>
                <span>Tamil & English Ready</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#202820] uppercase tracking-wider">
                {lang === 'ta' ? 'வழிசெலுத்தல்' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleNavigateTab('home')}
                    className="hover:text-[#245C3A] transition-colors"
                  >
                    {t.nav_home}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigateTab('catalogue')}
                    className="hover:text-[#245C3A] transition-colors"
                  >
                    {t.nav_products}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigateTab('nearby_farms')}
                    className="hover:text-[#245C3A] transition-colors"
                  >
                    {t.nav_nearby_farms}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigateTab('wishlist')}
                    className="hover:text-[#245C3A] transition-colors"
                  >
                    {t.nav_wishlist}
                  </button>
                </li>
              </ul>
            </div>

            {/* Account & Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#202820] uppercase tracking-wider">
                {lang === 'ta' ? 'கணக்கு & மாதிரி' : 'Account & Demo Notice'}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleNavigateTab('orders')}
                    className="hover:text-[#245C3A] transition-colors"
                  >
                    {t.nav_orders}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigateTab('profile')}
                    className="hover:text-[#245C3A] transition-colors"
                  >
                    {t.nav_profile}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleNavigateToFarmer}
                    className="font-bold text-[#245C3A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>🚜 Farmer Portal Console →</span>
                  </button>
                </li>
                <li className="pt-1">
                  <span className="inline-block text-[11px] leading-tight text-[#778177] bg-[#FAFBF7] p-2.5 rounded-xl border border-[#E5E9E1]">
                    🌾 All farms and products shown are static demo entries. Farmer Portal integration will follow via Supabase.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5E9E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#778177]">
            <div>© {new Date().getFullYear()} FarmBridge Consumer. Direct Farmer Marketplace.</div>
            <div className="flex items-center gap-4">
              <span>Uzhavar Sandhai Pricing</span>
              <span>•</span>
              <span>Zero Middlemen</span>
              <span>•</span>
              <span>Secure Google Sign-In</span>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default App;
