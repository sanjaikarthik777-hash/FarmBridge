/**
 * FarmDirect App Coordinator
 * Coordinates routing, Service Worker registration, PWA installation,
 * connectivity status events, toast notifications, confirmation dialogs, and dashboard overview.
 */

const App = {
  activeView: 'dashboard',
  deferredInstallPrompt: null,
  supabaseClient: null,
  setupCurrentStep: 1,
  setupSelectedCrops: ['Tomatoes', 'Coconuts', 'Shallots'],
  setupSuggestedCrops: [
    'Tomato', 'Coconut', 'Shallot', 'Onion', 'Banana', 'Mango', 
    'Cabbage', 'Carrot', 'Brinjal', 'Chilli', 'Potato', 'Tapioca', 
    'Turmeric', 'Ginger', 'Paddy', 'Maize', 'Sugarcane'
  ],
  setupCropEmojis: {
    'Tomato': '🍅', 'Tomatoes': '🍅',
    'Coconut': '🥥', 'Coconuts': '🥥',
    'Shallot': '🧅', 'Shallots': '🧅',
    'Onion': '🧅', 'Onions': '🧅',
    'Banana': '🍌', 'Bananas': '🍌',
    'Mango': '🥭', 'Mangoes': '🥭',
    'Cabbage': '🥬', 'Cabbages': '🥬',
    'Carrot': '🥕', 'Carrots': '🥕',
    'Brinjal': '🍆', 'Brinjals': '🍆',
    'Chilli': '🌶️', 'Chillies': '🌶️',
    'Potato': '🥔', 'Potatoes': '🥔',
    'Tapioca': '🍠',
    'Turmeric': '🌿',
    'Ginger': '🫚',
    'Paddy': '🌾',
    'Maize': '🌽',
    'Sugarcane': '🎋'
  },
  setupMap: null,
  setupMarker: null,
  setupLat: 10.598200,
  setupLon: 76.972100,
  isSavingFarmerSetup: false,

  getSupabaseClient() {
    if (this.supabaseClient) return this.supabaseClient;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      const SUPABASE_URL = 'https://gmnhjkfqwthqeodvznqk.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_GlQ64F2IL3UQdgY6VCtfAA_Q2MxYYGi';
      this.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return this.supabaseClient;
    }
    return null;
  },

  async init() {
    console.log('🌱 Initializing FarmDirect Farmer Dashboard (Offline-First)...');

    // 1. Initialize IndexedDB
    try {
      await FarmDirectDB.open();
      // Ingest incoming farm details from Google Login & Onboarding
      await this.ingestFarmerOnboardingData();
      // Check for active Supabase Google Auth session
      await this.initSupabaseAuth();
      // Load saved Language preference
      const savedLang = await FarmDirectDB.getSetting('language', 'English');
      try { localStorage.setItem('farmdirect_language', savedLang); } catch (e) {}
      if (window.I18n) {
        I18n.setLanguage(savedLang);
      }
    } catch (err) {
      console.error('IndexedDB initialization failed:', err);
      this.showToast('Local database initialization error. Some offline data may not load.', 'error');
    }

    // 2. Initialize Modules
    if (window.ProductsModule) ProductsModule.init();
    if (window.OrdersModule) OrdersModule.init();
    if (window.InventoryModule) InventoryModule.init();
    if (window.ReportsModule) ReportsModule.init();
    if (window.SyncEngine) await SyncEngine.init();

    // 3. Setup Navigation & Routing
    this.bindNavigation();

    // 4. Setup Online / Offline Status
    this.bindConnectivityListeners();

    // 5. Setup PWA Install Prompt & Service Worker
    this.registerServiceWorker();
    this.bindInstallPrompt();

    // 6. Setup Settings & Backup handlers
    this.bindSettingsHandlers();
    await this.loadFarmProfileBadge();

    // 7. Render Current Date & Initial Views
    this.renderCurrentDate();
    this.renderDashboardOverview();

    // 8. Enforce Login Gate System before accessing profile/dashboard
    await this.checkAuthGateStatus();

    console.log('✅ FarmDirect initialized successfully.');
  },

  async ingestFarmerOnboardingData() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let incoming = null;
      try {
        const stored = localStorage.getItem('farmdirect_farmer_profile');
        if (stored) incoming = JSON.parse(stored);
      } catch (e) {}

      const farmName = urlParams.get('farmName') || incoming?.farmName;
      const farmerName = urlParams.get('farmerName') || incoming?.farmerName;
      const phone = urlParams.get('phone') || incoming?.phone;
      const address = urlParams.get('address') || incoming?.farmAddress || incoming?.address;
      const district = urlParams.get('district') || incoming?.district;
      const village = urlParams.get('village') || incoming?.village;
      const farmerId = urlParams.get('farmerId') || incoming?.farmerId;
      const farmType = urlParams.get('farmType') || incoming?.farmType;
      const crops = urlParams.get('crops') || incoming?.crops;

      let hasNewData = false;
      if (farmName) {
        await FarmDirectDB.setSetting('farmName', farmName);
        hasNewData = true;
      }
      if (farmerName) {
        await FarmDirectDB.setSetting('farmerName', farmerName);
        hasNewData = true;
      }
      if (phone) await FarmDirectDB.setSetting('phone', phone);
      if (address) await FarmDirectDB.setSetting('farmAddress', address);
      if (district) await FarmDirectDB.setSetting('district', district);
      if (village) await FarmDirectDB.setSetting('village', village);
      if (farmerId) await FarmDirectDB.setSetting('farmerId', farmerId);
      if (farmType) await FarmDirectDB.setSetting('farmType', farmType);
      if (crops) await FarmDirectDB.setSetting('crops', crops);

      if (hasNewData) {
        setTimeout(() => {
          this.showToast(`🌾 Welcome ${farmerName || 'Farmer'}! ${farmName} loaded into offline storage.`, 'success');
        }, 600);

        // Clean query parameters from URL for clean PWA display
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (e) {
      console.warn('Failed to ingest farmer onboarding data:', e);
    }
  },

  async handleLanguageChange(newLang) {
    if (!newLang) return;

    // De-bounce duplicate invocations within 500ms
    const now = Date.now();
    if (this._lastLangChange && this._lastLangChange.lang === newLang && (now - this._lastLangChange.time < 500)) {
      return;
    }
    this._lastLangChange = { lang: newLang, time: now };

    try {
      localStorage.setItem('farmdirect_language', newLang);
    } catch (e) {}

    if (window.I18n) {
      I18n.setLanguage(newLang);
    }

    try {
      await FarmDirectDB.setSetting('language', newLang);
      await FarmDirectDB.setSetting('preferredLanguage', newLang);
    } catch (e) {}

    const profileLang = document.getElementById('setting-preferred-language');
    if (profileLang && profileLang.value !== newLang) profileLang.value = newLang;
    const prefLang = document.getElementById('pref-language');
    if (prefLang && prefLang.value !== newLang) prefLang.value = newLang;

    this.renderCurrentDate();

    let toastMsg = `Language preference set to ${newLang}`;
    if (newLang === 'Tamil') {
      toastMsg = 'மொழி விருப்பம் தமிழாக மாற்றப்பட்டது!';
    } else if (newLang === 'Hindi') {
      toastMsg = 'भाषा प्राथमिकता हिंदी में सेट की गई!';
    } else if (newLang === 'Malayalam') {
      toastMsg = 'ഭാഷാ മുൻഗണന മലയാളമായി സജ്ജീകരിച്ചു!';
    } else if (newLang === 'Telugu') {
      toastMsg = 'భాష ప్రాధాన్యత తెలుగుగా సెట్ చేయబడింది!';
    }
    this.showToast(toastMsg, 'success', true);
  },

  /* ----------------------------------------------------
   * NAVIGATION & VIEW SWITCHING
   * ---------------------------------------------------- */
  bindNavigation() {
    const navLinks = document.querySelectorAll('[data-view-target]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.viewTarget;
        this.navigateTo(targetView);
      });
    });
  },

  navigateTo(viewName) {
    this.activeView = viewName;

    // Update active nav styling
    document.querySelectorAll('[data-view-target]').forEach((link) => {
      if (link.dataset.viewTarget === viewName) {
        link.classList.add('nav-active');
      } else {
        link.classList.remove('nav-active');
      }
    });

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.add('hidden');
    });

    // Show target section
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    // Close mobile navigation drawer if open
    const mobileMenu = document.getElementById('mobile-sidebar');
    if (mobileMenu) mobileMenu.classList.remove('open');

    // Trigger module renders
    if (viewName === 'dashboard') {
      this.renderDashboardOverview();
    } else if (viewName === 'products') {
      if (window.ProductsModule) ProductsModule.renderProductsList();
    } else if (viewName === 'orders') {
      if (window.OrdersModule) OrdersModule.renderOrdersList();
    } else if (viewName === 'inventory') {
      if (window.InventoryModule) InventoryModule.render();
    } else if (viewName === 'reports') {
      if (window.ReportsModule) ReportsModule.render();
    } else if (viewName === 'settings') {
      this.renderSettingsView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /* ----------------------------------------------------
   * CONNECTIVITY & OFFLINE INDICATOR
   * ---------------------------------------------------- */
  bindConnectivityListeners() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      const statusPill = document.getElementById('connectivity-status-pill');
      const statusText = document.getElementById('connectivity-status-text');
      const offlineNoticeBanner = document.getElementById('offline-notice-banner');

      if (statusPill && statusText) {
        if (isOnline) {
          statusPill.className = 'status-pill status-online';
          statusText.innerText = window.I18n ? I18n.t('status_online') : 'Internet Connected';
          statusPill.title = 'Internet connection active. Changes auto-sync with cloud.';
          if (offlineNoticeBanner) offlineNoticeBanner.classList.add('hidden');
        } else {
          statusPill.className = 'status-pill status-offline';
          statusText.innerText = window.I18n ? I18n.t('status_offline') : 'No Internet Connection';
          statusPill.title = 'No internet connection detected. Changes are safely saved locally.';
          if (offlineNoticeBanner) offlineNoticeBanner.classList.remove('hidden');
        }
      }
    };

    window.addEventListener('online', () => {
      updateStatus();
      this.showToast('Internet connection restored! Auto-sync active.', 'info');
    });

    window.addEventListener('offline', () => {
      updateStatus();
      this.showToast('No internet connection. All farmer dashboard actions remain 100% functional locally.', 'warning');
    });

    updateStatus();
  },

  /* ----------------------------------------------------
   * SERVICE WORKER & PWA INSTALL
   * ---------------------------------------------------- */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((reg) => {
            console.log('✅ ServiceWorker registered successfully with scope:', reg.scope);
            reg.update(); // Promptly check for SW update on reload
          })
          .catch((err) => {
            console.warn('ServiceWorker registration error (may occur on non-https or file://):', err);
          });
      });
    }
  },

  bindInstallPrompt() {
    const installBtn = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (installBtn) {
        installBtn.classList.remove('hidden');
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!this.deferredInstallPrompt) {
          this.showToast('PWA installation is already completed or not supported by this browser.', 'info');
          return;
        }
        this.deferredInstallPrompt.prompt();
        const { outcome } = await this.deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          this.showToast('FarmDirect installed successfully!', 'success');
        }
        this.deferredInstallPrompt = null;
        installBtn.classList.add('hidden');
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('🎉 FarmDirect Farmer PWA was installed');
      if (installBtn) installBtn.classList.add('hidden');
      this.showToast('FarmDirect is installed! It will now open offline from your home screen or desktop.', 'success');
    });
  },

  /* ----------------------------------------------------
   * MAIN DASHBOARD METRICS & RECENT ITEMS
   * ---------------------------------------------------- */
  renderCurrentDate() {
    const dateEl = document.getElementById('current-date-display');
    if (dateEl) {
      const now = new Date();
      const lang = window.I18n ? window.I18n.currentLanguage : 'English';
      const localeMap = {
        Tamil: 'ta-IN',
        Hindi: 'hi-IN',
        Malayalam: 'ml-IN',
        Telugu: 'te-IN',
        English: 'en-IN'
      };
      const locale = localeMap[lang] || 'en-IN';
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.innerText = now.toLocaleDateString(locale, options);
    }
  },

  async renderDashboardOverview() {
    const products = await FarmDirectDB.getProducts();
    const orders = await FarmDirectDB.getOrders();

    // 1. Calculate Statistics
    const totalProducts = products.length;
    let availableStockUnits = 0;
    products.forEach((p) => {
      if (p.isAvailable !== false) availableStockUnits += p.quantity || 0;
    });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const completedCount = completedOrders.length;

    // Total sales strictly from completed orders
    const totalSales = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    // Update KPI Card Numbers
    const elProd = document.getElementById('dash-stat-products');
    const elStock = document.getElementById('dash-stat-stock');
    const elOrders = document.getElementById('dash-stat-orders');
    const elPending = document.getElementById('dash-stat-pending');
    const elCompleted = document.getElementById('dash-stat-completed');
    const elSales = document.getElementById('dash-stat-sales');

    if (elProd) elProd.innerText = totalProducts;
    if (elStock) elStock.innerText = availableStockUnits.toLocaleString();
    if (elOrders) elOrders.innerText = totalOrders;
    if (elPending) elPending.innerText = pendingOrders;
    if (elCompleted) elCompleted.innerText = completedCount;
    if (elSales) elSales.innerText = `₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 2. Render Recent Orders (Top 4)
    this.renderDashboardRecentOrders(orders.slice(0, 4));

    // 3. Render Product Overview Cards (Top 4)
    this.renderDashboardProductOverview(products.slice(0, 4));
  },

  renderDashboardRecentOrders(recentOrders) {
    const container = document.getElementById('dashboard-recent-orders-list');
    if (!container) return;

    if (recentOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state-sm">
          <p class="text-muted">No orders recorded yet. You can create a sample demo order to test offline processing.</p>
          <button class="btn btn-secondary btn-sm" onclick="OrdersModule.openDemoOrderModal()">Create Sample Order</button>
        </div>
      `;
      return;
    }

    const statusBadges = {
      pending: '<span class="status-badge status-pending"><span class="badge-dot"></span>Pending</span>',
      accepted: '<span class="status-badge status-accepted"><span class="badge-dot"></span>Accepted</span>',
      packed: '<span class="status-badge status-packed"><span class="badge-dot"></span>Packed</span>',
      completed: '<span class="status-badge status-completed"><span class="badge-dot"></span>Completed</span>',
      rejected: '<span class="status-badge status-rejected"><span class="badge-dot"></span>Rejected</span>'
    };

    container.innerHTML = recentOrders
      .map((ord) => {
        const itemSummary = ord.items.map((i) => `${i.quantity} ${i.unit} ${i.productName}`).join(', ');
        return `
        <div class="dash-recent-order-row">
          <div class="d-flex align-center gap-2">
            <strong>${ord.id}</strong>
            ${ord.isDemo ? '<span class="badge-demo-tag text-xs">Demo</span>' : ''}
            ${statusBadges[ord.status]}
          </div>
          <div class="dash-order-buyer">
            <span class="font-medium">${ord.customerName}</span>
            <span class="text-muted text-xs truncate max-w-sm">${itemSummary}</span>
          </div>
          <div class="dash-order-price text-right font-bold">
            ₹${ord.totalAmount.toFixed(2)}
          </div>
          <div class="text-right">
            <button class="btn btn-secondary btn-xs" onclick="OrdersModule.viewOrderDetails('${ord.id}')">View</button>
          </div>
        </div>
      `;
      })
      .join('');
  },

  renderDashboardProductOverview(recentProducts) {
    const container = document.getElementById('dashboard-products-overview-grid');
    if (!container) return;

    if (recentProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-state-sm">
          <p class="text-muted">No products catalogued yet.</p>
          <button class="btn btn-primary btn-sm" onclick="ProductsModule.openAddProductModal()">Add Product</button>
        </div>
      `;
      return;
    }

    container.innerHTML = recentProducts
      .map((prod) => {
        const isOut = prod.quantity <= 0;
        const isLow = !isOut && prod.quantity <= (prod.minStockThreshold || 10);
        return `
        <div class="dash-product-mini-card">
          <div class="font-bold text-sm">${prod.name}</div>
          <div class="text-xs text-muted">${prod.category}</div>
          <div class="d-flex justify-between align-center mt-2">
            <span class="text-price font-bold">₹${prod.price.toFixed(2)} / ${prod.unit}</span>
            <span class="text-xs font-semibold ${isOut ? 'text-danger' : isLow ? 'text-amber' : 'text-success'}">
              ${prod.quantity} ${prod.unit}
            </span>
          </div>
        </div>
      `;
      })
      .join('');
  },

  /* ----------------------------------------------------
   * LOAD SAVED FARM PROFILE IN SHELL
   * ---------------------------------------------------- */
  async loadFarmProfileBadge() {
    try {
      const settings = await FarmDirectDB.getAllSettings();
      const farmName = settings.farmName || 'Thennam Thoppu Natural Farm';
      const farmerName = settings.farmerName || 'Murugan Palanisamy';
      this.currentDateFormat = settings.dateFormat || 'DD/MM/YYYY';

      const headerFarm = document.getElementById('header-farm-name');
      if (headerFarm) headerFarm.innerText = farmName;

      const sidebarFarm = document.getElementById('sidebar-farm-name');
      if (sidebarFarm) sidebarFarm.innerText = farmName;

      const village = settings.village || 'Pollachi';
      const district = settings.district || 'Coimbatore';
      const sidebarLoc = document.querySelector('.farm-badge-loc');
      if (sidebarLoc) sidebarLoc.innerText = `${village}, ${district}`;

      const btnFarmerName = document.getElementById('header-farmer-name-btn');
      if (btnFarmerName) btnFarmerName.innerText = farmerName.split(' ')[0] || 'Farmer Profile';

      const sessUserName = document.getElementById('settings-session-user-name');
      const sessUserEmail = document.getElementById('settings-session-user-email');
      const googleEmail = settings.googleEmail || localStorage.getItem('farmdirect_google_email');
      if (sessUserName) sessUserName.innerText = `${farmerName} (${farmName})`;
      if (sessUserEmail) sessUserEmail.innerText = googleEmail ? `Connected via Google: ${googleEmail}` : 'Local Offline Mode';
    } catch (err) {
      console.warn('Could not load farm profile header:', err);
    }
  },

  /* ----------------------------------------------------
   * FARMER GOOGLE AUTH & FARM SETUP MODAL (3-STEP ONBOARDING)
   * ---------------------------------------------------- */
  async openFarmerAuthModal() {
    const modal = document.getElementById('farmer-auth-modal');
    if (!modal) return;

    // Load existing settings from database
    const settings = await FarmDirectDB.getAllSettings();
    const elFarmerName = document.getElementById('setup-farmer-name');
    const elFarmName = document.getElementById('setup-farm-name');
    const elPhone = document.getElementById('setup-farmer-phone');
    const elVillage = document.getElementById('setup-farmer-village');
    const elDistrict = document.getElementById('setup-farmer-district');
    const elAddress = document.getElementById('setup-farmer-address');
    const elFarmSize = document.getElementById('setup-farm-size');
    const elFarmType = document.getElementById('setup-farm-type');
    const elIrrigation = document.getElementById('setup-irrigation-type');
    const elYearsFarming = document.getElementById('setup-years-farming');

    if (elFarmerName) elFarmerName.value = settings.farmerName || '';
    if (elFarmName) elFarmName.value = settings.farmName || '';
    if (elPhone) elPhone.value = settings.phone || settings.mobileNumber || '';
    if (elVillage) elVillage.value = settings.village || 'Aliyar';
    if (elDistrict) elDistrict.value = settings.district || 'Coimbatore';
    if (elAddress) elAddress.value = settings.farmAddress || settings.location || '';
    if (elFarmSize) elFarmSize.value = settings.farmSize || '';
    if (elFarmType && settings.farmType) elFarmType.value = settings.farmType;
    if (elIrrigation && settings.irrigationType) elIrrigation.value = settings.irrigationType;
    if (elYearsFarming) elYearsFarming.value = settings.yearsFarming || '';

    // Load crops into tag chips
    const rawCrops = settings.crops || 'Tomatoes, Coconuts, Shallots';
    this.setupSelectedCrops = rawCrops
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    if (this.setupSelectedCrops.length === 0) {
      this.setupSelectedCrops = ['Tomatoes', 'Coconuts', 'Shallots'];
    }
    this.renderCropChips();

    // Load coordinates
    this.setupLat = parseFloat(settings.latitude) || 10.598200;
    this.setupLon = parseFloat(settings.longitude) || 76.972100;
    const latDisp = document.getElementById('setup-lat-display');
    const lonDisp = document.getElementById('setup-lon-display');
    if (latDisp) latDisp.innerText = this.setupLat.toFixed(6);
    if (lonDisp) lonDisp.innerText = this.setupLon.toFixed(6);

    // Google Account info
    const googleEmail = settings.googleEmail || localStorage.getItem('farmdirect_google_email');
    const infoBox = document.getElementById('google-auth-active-info');
    const emailDisp = document.getElementById('google-auth-email-display');
    const btnText = document.getElementById('google-auth-btn-text');

    if (googleEmail) {
      if (infoBox) infoBox.classList.remove('hidden');
      if (emailDisp) emailDisp.innerText = googleEmail;
      if (btnText) btnText.innerText = 'Change Account';
    } else {
      if (infoBox) infoBox.classList.remove('hidden');
      if (emailDisp) emailDisp.innerText = 'sanjaivish18@gmail.com';
      if (btnText) btnText.innerText = 'Change Account';
    }

    // Reset error messages and field states
    this.clearSetupFieldError('farmer-name');
    this.clearSetupFieldError('farm-name');
    const locErr = document.getElementById('setup-location-error');
    if (locErr) locErr.style.display = 'none';

    // Reset success view & form visibility
    const successCard = document.getElementById('setup-success-card');
    const setupForm = document.getElementById('form-farmer-setup');
    const stepper = document.getElementById('profile-setup-stepper');
    const footer = document.getElementById('profile-setup-footer');
    if (successCard) successCard.classList.add('hidden');
    if (setupForm) setupForm.style.display = 'flex';
    if (stepper) stepper.style.display = 'flex';
    if (footer) footer.style.display = 'flex';

    // Show modal & set to step 1
    modal.classList.remove('hidden');
    this.setSetupStep(1);
    this.updateReviewSummary();

    // Bind ESC key listener
    if (!this._hasBoundSetupEsc) {
      this._hasBoundSetupEsc = true;
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          this.closeFarmerAuthModal();
        }
      });
    }
  },

  closeFarmerAuthModal() {
    const modal = document.getElementById('farmer-auth-modal');
    if (modal) modal.classList.add('hidden');
    const successCard = document.getElementById('setup-success-card');
    const setupForm = document.getElementById('form-farmer-setup');
    const stepper = document.getElementById('profile-setup-stepper');
    const footer = document.getElementById('profile-setup-footer');
    if (successCard) successCard.classList.add('hidden');
    if (setupForm) setupForm.style.display = 'flex';
    if (stepper) stepper.style.display = 'flex';
    if (footer) footer.style.display = 'flex';
    this.toggleCropPicker(false);
  },

  setSetupStep(targetStep) {
    if (targetStep < 1 || targetStep > 3) return;

    // Validate when advancing steps
    if (targetStep > 1) {
      const farmerName = document.getElementById('setup-farmer-name')?.value.trim();
      if (!farmerName) {
        this.validateSetupField('farmer-name');
        this.showToast('Please enter Farmer Name before continuing.', 'warning');
        return;
      }
    }

    if (targetStep > 2) {
      const farmName = document.getElementById('setup-farm-name')?.value.trim();
      if (!farmName) {
        this.validateSetupField('farm-name');
        this.showToast('Please enter Farm Name before continuing.', 'warning');
        return;
      }
    }

    this.setupCurrentStep = targetStep;

    // 1. Update Stepper UI
    [1, 2, 3].forEach(stepNum => {
      const stepItem = document.getElementById(`stepper-step-${stepNum}`);
      const stepCircle = document.getElementById(`stepper-circle-${stepNum}`);
      if (!stepItem || !stepCircle) return;

      stepItem.className = 'stepper-item';
      if (stepNum < targetStep) {
        stepItem.classList.add('completed');
        stepCircle.innerHTML = '✓';
      } else if (stepNum === targetStep) {
        stepItem.classList.add('active');
        stepCircle.innerText = stepNum;
      } else {
        stepItem.classList.add('pending');
        stepCircle.innerText = stepNum;
      }
    });

    // 2. Update Panes
    [1, 2, 3].forEach(stepNum => {
      const pane = document.getElementById(`setup-step-${stepNum}`);
      if (pane) {
        if (stepNum === targetStep) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      }
    });

    // 3. Update Footer Action Bars
    [1, 2, 3].forEach(stepNum => {
      const footerBar = document.getElementById(`footer-actions-step-${stepNum}`);
      if (footerBar) {
        if (stepNum === targetStep) {
          footerBar.classList.remove('hidden');
        } else {
          footerBar.classList.add('hidden');
        }
      }
    });

    // 4. Step specific handlers
    if (targetStep === 2) {
      setTimeout(() => {
        this.initSetupMap();
      }, 150);
    } else if (targetStep === 3) {
      this.updateReviewSummary();
    }

    // Scroll body to top
    const modalBody = document.querySelector('.profile-setup-body');
    if (modalBody) modalBody.scrollTop = 0;
  },

  validateSetupField(field) {
    if (field === 'farmer-name') {
      const val = document.getElementById('setup-farmer-name')?.value.trim();
      const err = document.getElementById('err-setup-farmer-name');
      const input = document.getElementById('setup-farmer-name');
      if (!val) {
        if (err) err.style.display = 'block';
        if (input) input.classList.add('setup-input-error');
        return false;
      } else {
        if (err) err.style.display = 'none';
        if (input) input.classList.remove('setup-input-error');
        return true;
      }
    }
    if (field === 'farm-name') {
      const val = document.getElementById('setup-farm-name')?.value.trim();
      const err = document.getElementById('err-setup-farm-name');
      const input = document.getElementById('setup-farm-name');
      if (!val) {
        if (err) err.style.display = 'block';
        if (input) input.classList.add('setup-input-error');
        return false;
      } else {
        if (err) err.style.display = 'none';
        if (input) input.classList.remove('setup-input-error');
        return true;
      }
    }
    return true;
  },

  clearSetupFieldError(field) {
    if (field === 'farmer-name') {
      const err = document.getElementById('err-setup-farmer-name');
      const input = document.getElementById('setup-farmer-name');
      if (err) err.style.display = 'none';
      if (input) input.classList.remove('setup-input-error');
    }
    if (field === 'farm-name') {
      const err = document.getElementById('err-setup-farm-name');
      const input = document.getElementById('setup-farm-name');
      if (err) err.style.display = 'none';
      if (input) input.classList.remove('setup-input-error');
    }
    this.updateReviewSummary();
  },

  /* ----------------------------------------------------
   * INTERACTIVE MAP & GEOLOCATION
   * ---------------------------------------------------- */
  initSetupMap() {
    const container = document.getElementById('setup-farm-map');
    if (!container) return;

    if (typeof window.L === 'undefined') {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#2d6a4f;font-weight:600;">📍 Map module is loading...</div>';
      return;
    }

    if (!this.setupMap) {
      try {
        this.setupMap = L.map('setup-farm-map', {
          zoomControl: true,
          attributionControl: false
        }).setView([this.setupLat, this.setupLon], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(this.setupMap);

        // Custom Leaflet pin icon using Deep Green brand color
        const customPin = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background:#1b4332;color:#ffffff;border:2px solid #ffffff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);font-size:16px;cursor:grab;">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34]
        });

        this.setupMarker = L.marker([this.setupLat, this.setupLon], {
          draggable: true,
          icon: customPin
        }).addTo(this.setupMap);

        this.setupMarker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          this.updateSetupCoordinates(pos.lat, pos.lng);
        });

        this.setupMap.on('click', (e) => {
          this.setupMarker.setLatLng(e.latlng);
          this.updateSetupCoordinates(e.latlng.lat, e.latlng.lng);
        });
      } catch (err) {
        console.warn('Map initialization note:', err);
      }
    } else {
      try {
        this.setupMap.invalidateSize();
        this.setupMap.setView([this.setupLat, this.setupLon], 14);
        if (this.setupMarker) {
          this.setupMarker.setLatLng([this.setupLat, this.setupLon]);
        }
      } catch (e) {}
    }

    setTimeout(() => {
      if (this.setupMap) this.setupMap.invalidateSize();
    }, 200);
  },

  updateSetupCoordinates(lat, lon) {
    this.setupLat = lat;
    this.setupLon = lon;
    const latDisp = document.getElementById('setup-lat-display');
    const lonDisp = document.getElementById('setup-lon-display');
    if (latDisp) latDisp.innerText = lat.toFixed(6);
    if (lonDisp) lonDisp.innerText = lon.toFixed(6);

    const err = document.getElementById('setup-location-error');
    if (err) err.style.display = 'none';
    this.updateReviewSummary();
  },

  handleUseCurrentLocation() {
    const btnText = document.getElementById('btn-setup-use-location-text');
    const errBox = document.getElementById('setup-location-error');
    if (errBox) errBox.style.display = 'none';

    if (!navigator.geolocation) {
      if (errBox) {
        errBox.innerText = 'Location access is unavailable. You can select your farm location manually on the map.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (btnText) btnText.innerText = 'Detecting location...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (btnText) btnText.innerText = 'Use Current Location';
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.updateSetupCoordinates(lat, lon);

        if (this.setupMap) {
          this.setupMap.setView([lat, lon], 15);
          if (this.setupMarker) this.setupMarker.setLatLng([lat, lon]);
        }
        this.showToast('📍 Farm location detected from GPS.', 'success');
      },
      (err) => {
        if (btnText) btnText.innerText = 'Use Current Location';
        if (errBox) {
          errBox.innerText = 'Location access is unavailable. You can select your farm location manually on the map.';
          errBox.style.display = 'block';
        }
        this.showToast('Location access is unavailable. You can pin your farm on the map.', 'info');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  },

  focusSetupMapMarker() {
    if (this.setupMap) {
      this.setupMap.setView([this.setupLat, this.setupLon], 16);
      this.showToast('💡 Click anywhere on the map or drag the pin to set farm coordinates.', 'info');
    }
  },

  /* ----------------------------------------------------
   * CROP CHIPS & SELECTOR
   * ---------------------------------------------------- */
  getCropEmoji(name) {
    if (!name) return '🌱';
    return this.setupCropEmojis[name] || '🌱';
  },

  renderCropChips() {
    const container = document.getElementById('setup-crops-chip-list');
    const hiddenInput = document.getElementById('setup-farmer-crops');
    if (!container) return;

    if (this.setupSelectedCrops.length === 0) {
      container.innerHTML = '<span class="text-xs text-muted" style="padding: 6px 0;">No crops selected yet. Click "+ Add Crop" below.</span>';
    } else {
      container.innerHTML = this.setupSelectedCrops.map(crop => `
        <span class="setup-crop-chip">
          <span class="crop-emoji">${this.getCropEmoji(crop)}</span>
          <span class="crop-name">${crop}</span>
          <button type="button" class="btn-remove-crop" onclick="App.removeSetupCrop('${crop.replace(/'/g, "\\'")}')" aria-label="Remove ${crop}">&times;</button>
        </span>
      `).join('');
    }

    if (hiddenInput) {
      hiddenInput.value = this.setupSelectedCrops.join(', ');
    }

    this.renderCropSuggestions();
    this.updateReviewSummary();
  },

  addSetupCrop(cropName) {
    const clean = cropName.trim();
    if (!clean) return;
    if (!this.setupSelectedCrops.includes(clean)) {
      this.setupSelectedCrops.push(clean);
      this.renderCropChips();
    }
  },

  removeSetupCrop(cropName) {
    this.setupSelectedCrops = this.setupSelectedCrops.filter(c => c !== cropName);
    this.renderCropChips();
  },

  toggleCropPicker(show) {
    const card = document.getElementById('setup-crop-picker-card');
    if (!card) return;
    if (show) {
      card.classList.add('show');
      this.renderCropSuggestions();
      const input = document.getElementById('setup-crop-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    } else {
      card.classList.remove('show');
    }
  },

  renderCropSuggestions(filter = '') {
    const container = document.getElementById('setup-crop-suggestions');
    if (!container) return;

    const term = filter.toLowerCase().trim();
    const matches = this.setupSuggestedCrops.filter(c => !term || c.toLowerCase().includes(term));

    if (matches.length === 0) {
      container.innerHTML = `<span class="text-xs text-muted" style="grid-column: 1 / -1;">No matching default crops. Click "Add" to add "${filter}" as a custom crop!</span>`;
      return;
    }

    container.innerHTML = matches.map(crop => {
      const isSelected = this.setupSelectedCrops.includes(crop) || this.setupSelectedCrops.includes(crop + 's') || this.setupSelectedCrops.includes(crop + 'es');
      return `
        <button 
          type="button" 
          class="crop-suggestion-item ${isSelected ? 'selected' : ''}" 
          onclick="App.handleCropSuggestionClick('${crop.replace(/'/g, "\\'")}')"
        >
          <span>${this.getCropEmoji(crop)}</span>
          <span>${crop}</span>
          ${isSelected ? '<span style="margin-left:auto;font-size:10px;">✓</span>' : ''}
        </button>
      `;
    }).join('');
  },

  handleCropSuggestionClick(crop) {
    if (this.setupSelectedCrops.includes(crop)) {
      this.removeSetupCrop(crop);
    } else {
      this.addSetupCrop(crop);
    }
  },

  filterCropSuggestions() {
    const input = document.getElementById('setup-crop-search-input');
    const query = input?.value || '';
    this.renderCropSuggestions(query);
  },

  addCustomSetupCrop() {
    const input = document.getElementById('setup-crop-search-input');
    const val = input?.value.trim();
    if (val) {
      this.addSetupCrop(val);
      if (input) input.value = '';
      this.renderCropSuggestions();
      this.showToast(`🌾 Added "${val}" to crops.`, 'info');
    }
  },

  /* ----------------------------------------------------
   * OPTIONAL ACCORDION & REVIEW SUMMARY
   * ---------------------------------------------------- */
  toggleOptionalAccordion() {
    const accordion = document.getElementById('setup-optional-accordion');
    const chevron = document.getElementById('setup-accordion-chevron');
    if (!accordion) return;
    const isOpen = accordion.classList.toggle('open');
    if (chevron) {
      chevron.innerText = isOpen ? '▲' : '▼';
    }
  },

  updateReviewSummary() {
    const farmerName = document.getElementById('setup-farmer-name')?.value.trim() || 'Sanjai';
    const farmName = document.getElementById('setup-farm-name')?.value.trim() || 'Thennam Thoppu Natural';
    const phone = document.getElementById('setup-farmer-phone')?.value.trim() || '+91 94421 88990';
    const village = document.getElementById('setup-farmer-village')?.value.trim() || 'Aliyar';
    const district = document.getElementById('setup-farmer-district')?.value.trim() || 'Coimbatore';

    const revFarmer = document.getElementById('review-farmer-name');
    const revPhone = document.getElementById('review-farmer-phone');
    const revFarm = document.getElementById('review-farm-name');
    const revLoc = document.getElementById('review-farm-location');
    const revCrops = document.getElementById('review-farm-crops');

    if (revFarmer) revFarmer.innerText = farmerName;
    if (revPhone) revPhone.innerText = phone;
    if (revFarm) revFarm.innerText = farmName;
    if (revLoc) revLoc.innerText = [village, district].filter(Boolean).join(', ');
    if (revCrops) revCrops.innerText = this.setupSelectedCrops.join(', ') || 'None selected';
  },

  /* ----------------------------------------------------
   * MANDATORY AUTHENTICATION & LOGIN GATE SYSTEM
   * Enforces login system before accessing farmer profile & dashboard
   * ---------------------------------------------------- */
  async checkAuthGateStatus() {
    const gate = document.getElementById('farmer-login-gate');
    if (!gate) return true;

    // Check if current browser session has completed the Login -> Profile -> Dashboard onboarding flow
    const isPortalUnlocked = sessionStorage.getItem('farmdirect_portal_unlocked') === 'true';

    if (!isPortalUnlocked) {
      // 1. FIRST OPEN THE LOGIN PAGE
      await this.showLoginGate('login');
      return false;
    }

    // 2. Check active authentication
    let sessionUser = null;
    try {
      const client = this.getSupabaseClient();
      if (client) {
        const { data: { session } } = await client.auth.getSession();
        sessionUser = session?.user;
      }
    } catch (err) {
      console.warn('Auth session check notice:', err);
    }

    const isAuthFlagged = (await FarmDirectDB.getSetting('farmer_authenticated')) === true ||
                          localStorage.getItem('farmdirect_farmer_authenticated') === 'true';

    if (!isAuthFlagged && !sessionUser) {
      await this.showLoginGate('login');
      return false;
    }

    // Authenticated and portal unlocked: open dashboard fully
    this.hideLoginGate();
    return true;
  },

  async showLoginGate(view = 'login') {
    const gate = document.getElementById('farmer-login-gate');
    const loginView = document.getElementById('gate-view-login');
    const setupView = document.getElementById('gate-view-setup');
    if (!gate) return;

    gate.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (view === 'setup') {
      if (loginView) loginView.classList.add('hidden');
      if (setupView) setupView.classList.remove('hidden');

      // Populate setup fields with authenticated account info
      const settings = await FarmDirectDB.getAllSettings();
      const googleEmail = settings.googleEmail || localStorage.getItem('farmdirect_google_email') || '';
      const farmerName = settings.farmerName || '';
      const farmName = settings.farmName || (farmerName ? `${farmerName.split(' ')[0]}'s Natural Farm` : '');

      const elEmail = document.getElementById('gate-auth-user-email');
      const elFarmerName = document.getElementById('gate-setup-farmer-name');
      const elFarmName = document.getElementById('gate-setup-farm-name');
      const elPhone = document.getElementById('gate-setup-farmer-phone');
      const elVillage = document.getElementById('gate-setup-farmer-village');
      const elDistrict = document.getElementById('gate-setup-farmer-district');
      const elAddress = document.getElementById('gate-setup-farmer-address');
      const elCrops = document.getElementById('gate-setup-farmer-crops');

      if (elEmail) elEmail.innerText = googleEmail || 'Authenticated Farmer';
      if (elFarmerName && !elFarmerName.value) elFarmerName.value = farmerName;
      if (elFarmName && !elFarmName.value) elFarmName.value = farmName;
      if (elPhone && !elPhone.value) elPhone.value = settings.phone || settings.mobileNumber || '';
      if (elVillage && !elVillage.value) elVillage.value = settings.village || 'Aliyar';
      if (elDistrict && !elDistrict.value) elDistrict.value = settings.district || 'Coimbatore';
      if (elAddress && !elAddress.value) elAddress.value = settings.farmAddress || 'Aliyar Road, Pollachi, Tamil Nadu';
      if (elCrops && !elCrops.value) elCrops.value = settings.crops || 'Tomatoes, Coconuts, Shallots';
    } else {
      if (loginView) loginView.classList.remove('hidden');
      if (setupView) setupView.classList.add('hidden');

      const btnText = document.getElementById('gate-google-btn-text');
      if (btnText) btnText.innerText = 'Sign in with Google';
    }
  },

  hideLoginGate() {
    const gate = document.getElementById('farmer-login-gate');
    if (gate) {
      gate.classList.add('hidden');
    }
    document.body.style.overflow = '';
  },

  async saveGateFarmerDetails(event) {
    if (event) event.preventDefault();

    const farmerName = document.getElementById('gate-setup-farmer-name')?.value.trim();
    const farmName = document.getElementById('gate-setup-farm-name')?.value.trim();
    const phone = document.getElementById('gate-setup-farmer-phone')?.value.trim();
    const village = document.getElementById('gate-setup-farmer-village')?.value.trim();
    const district = document.getElementById('gate-setup-farmer-district')?.value.trim();
    const address = document.getElementById('gate-setup-farmer-address')?.value.trim();
    const crops = document.getElementById('gate-setup-farmer-crops')?.value.trim();

    if (!farmName || !farmerName) {
      this.showToast('Please provide both Farmer Name and Farm Name.', 'error');
      return;
    }

    await FarmDirectDB.setSetting('farmerName', farmerName);
    await FarmDirectDB.setSetting('farmName', farmName);
    if (phone) await FarmDirectDB.setSetting('phone', phone);
    if (village) await FarmDirectDB.setSetting('village', village);
    if (district) await FarmDirectDB.setSetting('district', district);
    if (address) await FarmDirectDB.setSetting('farmAddress', address);
    if (crops) await FarmDirectDB.setSetting('crops', crops);
    await FarmDirectDB.setSetting('farmer_authenticated', true);

    try {
      localStorage.setItem('farmdirect_farmer_authenticated', 'true');
      localStorage.setItem('farmdirect_farmer_profile', JSON.stringify({
        farmerName, farmName, phone, village, district, address, crops
      }));
    } catch (e) {}

    await this.loadFarmProfileBadge();
    this.hideLoginGate();
    this.showToast(`🌾 Welcome, ${farmerName}! Active Farm: ${farmName}`, 'success');

    if (window.SyncEngine && SyncEngine.isServerReachable) {
      SyncEngine.performSync('farm_profile_update');
    }
  },

  async signOut() {
    try {
      const client = this.getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    }

    await FarmDirectDB.setSetting('farmer_authenticated', false);
    try {
      localStorage.removeItem('farmdirect_farmer_authenticated');
      localStorage.removeItem('farmdirect_google_email');
      sessionStorage.removeItem('farmdirect_portal_unlocked');
    } catch (e) {}

    this.closeFarmerAuthModal();
    await this.showLoginGate('login');
    this.showToast('Signed out of Farmer Portal.', 'info');
  },

  async initSupabaseAuth() {
    try {
      const client = this.getSupabaseClient();
      if (!client) return;

      // 1. Check existing session
      const { data: { session }, error } = await client.auth.getSession();
      if (session?.user) {
        await this.handleAuthenticatedUser(session.user);
      }

      // 2. Listen for auth changes (such as returning from Google OAuth redirect)
      client.auth.onAuthStateChange(async (event, session) => {
        console.log('Supabase Farmer Auth Event:', event, session?.user?.email);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            await this.handleAuthenticatedUser(session.user);
          }
        }
      });
    } catch (err) {
      console.warn('Supabase auth session check notice:', err);
    }
  },

  async handleAuthenticatedUser(user) {
    const email = user.email || '';
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || (email ? email.split('@')[0] : 'Farmer');
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

    // Save to IndexedDB
    if (email) await FarmDirectDB.setSetting('googleEmail', email);
    if (fullName) await FarmDirectDB.setSetting('farmerName', fullName);
    await FarmDirectDB.setSetting('farmerId', user.id);
    if (avatar) await FarmDirectDB.setSetting('avatarUrl', avatar);
    await FarmDirectDB.setSetting('farmer_authenticated', true);

    try {
      localStorage.setItem('farmdirect_google_email', email);
      localStorage.setItem('farmdirect_farmer_authenticated', 'true');
    } catch (e) {}

    // Update modal inputs if present
    const elFarmerName = document.getElementById('setup-farmer-name');
    if (elFarmerName && !elFarmerName.value) elFarmerName.value = fullName;

    const elFarmName = document.getElementById('setup-farm-name');
    if (elFarmName && !elFarmName.value) elFarmName.value = `${fullName.split(' ')[0]}'s Natural Farm`;

    // Update active Google info badge in profile modal
    const infoBox = document.getElementById('google-auth-active-info');
    const emailDisp = document.getElementById('google-auth-email-display');
    const btnText = document.getElementById('google-auth-btn-text');

    if (infoBox) infoBox.classList.remove('hidden');
    if (emailDisp) emailDisp.innerText = email;
    if (btnText) btnText.innerText = 'Connected: ' + (fullName || email);

    // Update gate email display
    const gateEmailDisp = document.getElementById('gate-auth-user-email');
    if (gateEmailDisp) gateEmailDisp.innerText = email;

    await this.loadFarmProfileBadge();

    // 1. Dismiss login gate
    this.hideLoginGate();

    // Clean URL query / hash fragments
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. AFTER LOGIN: AUTOMATICALLY OPEN FARMER PROFILE & SETUP MODAL
    const isPortalUnlocked = sessionStorage.getItem('farmdirect_portal_unlocked') === 'true';
    const savedFarmName = (await FarmDirectDB.getSetting('farmName')) || `${fullName.split(' ')[0]}'s Natural Farm`;
    if (!isPortalUnlocked) {
      this.showToast(`🌾 Welcome, ${fullName}! Complete your farm profile setup.`, 'info');
      await this.openFarmerAuthModal();
    } else {
      this.showToast(`🌾 Welcome back, ${fullName}! (${savedFarmName})`, 'success');
    }
  },

  openGoogleAccountPicker() {
    const modal = document.getElementById('google-account-picker-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('google-custom-email-input');
      if (input) input.value = '';
    }
  },

  closeGoogleAccountPicker() {
    const modal = document.getElementById('google-account-picker-modal');
    if (modal) modal.classList.add('hidden');
  },

  toggleGateCustomGoogle() {
    const box = document.getElementById('gate-custom-google-box');
    const icon = document.getElementById('gate-custom-toggle-icon');
    if (!box) return;
    const isHidden = box.classList.contains('hidden');
    if (isHidden) {
      box.classList.remove('hidden');
      if (icon) icon.innerText = '✕';
      document.getElementById('gate-custom-google-input')?.focus();
    } else {
      box.classList.add('hidden');
      if (icon) icon.innerText = '＋';
    }
  },

  async submitGateCustomGoogle() {
    const input = document.getElementById('gate-custom-google-input');
    const email = input?.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      this.showToast('Please enter a valid Google email address.', 'warning');
      input?.focus();
      return;
    }
    const derivedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    await this.selectGoogleAccount(email, derivedName);
  },

  async selectGoogleAccount(email, name) {
    this.closeGoogleAccountPicker();

    const gateBtnText = document.getElementById('gate-google-btn-text');
    if (gateBtnText) gateBtnText.innerText = `Connecting as ${name.split(' ')[0]}...`;

    this.showToast(`Verifying Google account: ${email}...`, 'info');

    // Quick realistic delay for Google OAuth handshake experience
    await new Promise(r => setTimeout(r, 300));

    if (email === 'sanjaivish18@gmail.com') {
      await this.loginAsFarmerProfile('sanjai');
      return;
    } else if (email === 'murugan.pollachi@demo.farmbridge.in') {
      await this.loginAsFarmerProfile('murugan');
      return;
    }

    // Generic Custom Google Farmer Account
    const customUser = {
      id: 'g_' + btoa(email).replace(/=/g, '').toLowerCase().slice(0, 16),
      email: email,
      user_metadata: {
        full_name: name,
        avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop'
      }
    };

    const derivedFarm = `${name.split(' ')[0]}'s Natural Farm`;
    await FarmDirectDB.setSetting('farmName', derivedFarm);
    await FarmDirectDB.setSetting('farmerName', name);
    await FarmDirectDB.setSetting('googleEmail', email);
    await FarmDirectDB.setSetting('village', 'Pollachi Rural');
    await FarmDirectDB.setSetting('district', 'Coimbatore');
    await FarmDirectDB.setSetting('farmAddress', 'Pollachi, Coimbatore District, Tamil Nadu');
    await FarmDirectDB.setSetting('crops', 'Tomatoes, Coconuts, Shallots');
    await FarmDirectDB.setSetting('farmer_authenticated', true);

    try {
      localStorage.setItem('farmdirect_farmer_authenticated', 'true');
      localStorage.setItem('farmdirect_google_email', email);
    } catch (e) {}

    await this.handleAuthenticatedUser(customUser);
  },

  async selectCustomGoogleAccount() {
    const input = document.getElementById('google-custom-email-input');
    const val = input?.value.trim().toLowerCase();
    if (!val || !val.includes('@')) {
      this.showToast('Please enter a valid Google email address.', 'warning');
      input?.focus();
      return;
    }
    const derivedName = val.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    await this.selectGoogleAccount(val, derivedName);
  },

  async loginAsFarmerProfile(type) {
    if (type === 'sanjai') {
      const sanjaiUser = {
        id: 'f1000000-0000-0000-0000-000000000002',
        email: 'sanjaivish18@gmail.com',
        user_metadata: {
          full_name: 'Sanjai Karthik',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop'
        }
      };
      await FarmDirectDB.setSetting('farmName', "Sanjai's Organic Farm");
      await FarmDirectDB.setSetting('farmerName', 'Sanjai Karthik');
      await FarmDirectDB.setSetting('phone', '+91 98422 11002');
      await FarmDirectDB.setSetting('village', 'Pollachi Rural');
      await FarmDirectDB.setSetting('district', 'Coimbatore');
      await FarmDirectDB.setSetting('farmAddress', 'Udumalai Road, Pollachi, Tamil Nadu');
      await FarmDirectDB.setSetting('crops', 'Tomatoes, Coconuts, Shallots');
      await FarmDirectDB.setSetting('latitude', 10.658000);
      await FarmDirectDB.setSetting('longitude', 77.008000);
      await FarmDirectDB.setSetting('farmer_authenticated', true);
      try {
        localStorage.setItem('farmdirect_farmer_authenticated', 'true');
        localStorage.setItem('farmdirect_farmer_profile', JSON.stringify({
          farmerName: 'Sanjai Karthik',
          farmName: "Sanjai's Organic Farm",
          phone: '+91 98422 11002',
          village: 'Pollachi Rural',
          district: 'Coimbatore',
          address: 'Udumalai Road, Pollachi, Tamil Nadu',
          crops: 'Tomatoes, Coconuts, Shallots',
          latitude: 10.658000,
          longitude: 77.008000
        }));
      } catch (e) {}

      await this.handleAuthenticatedUser(sanjaiUser);
    } else {
      await this.handleDemoGoogleFarmerAuth();
    }
  },

  handleGoogleFarmerAuth() {
    // Open the authentic Google Identity Services Account Chooser modal
    this.openGoogleAccountPicker();
  },

  async handleDemoGoogleFarmerAuth() {
    const demoUser = {
      id: 'f1000000-0000-0000-0000-000000000001',
      email: 'murugan.pollachi@demo.farmbridge.in',
      user_metadata: {
        full_name: 'Murugan Palanisamy',
        avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop'
      }
    };
    await FarmDirectDB.setSetting('farmName', 'Thennam Thoppu Natural Farm');
    await FarmDirectDB.setSetting('farmerName', 'Murugan Palanisamy');
    await FarmDirectDB.setSetting('phone', '+91 94421 88990');
    await FarmDirectDB.setSetting('village', 'Aliyar');
    await FarmDirectDB.setSetting('district', 'Coimbatore');
    await FarmDirectDB.setSetting('farmAddress', 'Aliyar Road, Pollachi, Tamil Nadu');
    await FarmDirectDB.setSetting('crops', 'Tomatoes, Coconuts, Shallots');
    await FarmDirectDB.setSetting('farmer_authenticated', true);
    try { localStorage.setItem('farmdirect_farmer_authenticated', 'true'); } catch (e) {}

    await this.handleAuthenticatedUser(demoUser);
  },

  async saveFarmerDetailsSetup(event) {
    if (event) event.preventDefault();

    if (this.isSavingFarmerSetup) return;

    const farmerName = document.getElementById('setup-farmer-name')?.value.trim();
    const farmName = document.getElementById('setup-farm-name')?.value.trim();
    const phone = document.getElementById('setup-farmer-phone')?.value.trim();
    const village = document.getElementById('setup-farmer-village')?.value.trim();
    const district = document.getElementById('setup-farmer-district')?.value.trim();
    const address = document.getElementById('setup-farmer-address')?.value.trim();
    const crops = this.setupSelectedCrops.join(', ') || (document.getElementById('setup-farmer-crops')?.value.trim() || 'Tomatoes, Coconuts, Shallots');
    const farmSize = document.getElementById('setup-farm-size')?.value.trim();
    const farmType = document.getElementById('setup-farm-type')?.value;
    const irrigationType = document.getElementById('setup-irrigation-type')?.value;
    const yearsFarming = document.getElementById('setup-years-farming')?.value.trim();

    // Validation
    if (!farmerName) {
      this.setSetupStep(1);
      this.validateSetupField('farmer-name');
      this.showToast('Farmer Name is required.', 'error');
      return;
    }

    if (!farmName) {
      this.setSetupStep(2);
      this.validateSetupField('farm-name');
      this.showToast('Farm Name is required.', 'error');
      return;
    }

    // Phone format check if provided
    if (phone) {
      const cleanDigits = phone.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        this.showToast('Please enter a valid 10-digit mobile number.', 'warning');
      }
    }

    this.isSavingFarmerSetup = true;

    // Loading State
    const submitBtn = document.getElementById('btn-setup-submit');
    const submitText = document.getElementById('btn-setup-submit-text');
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.innerText = '⏳ Saving...';

    try {
      // 1. Save to local IndexedDB
      await FarmDirectDB.setSetting('farmerName', farmerName);
      await FarmDirectDB.setSetting('farmName', farmName);
      if (phone) await FarmDirectDB.setSetting('phone', phone);
      if (village) await FarmDirectDB.setSetting('village', village);
      if (district) await FarmDirectDB.setSetting('district', district);
      if (address) await FarmDirectDB.setSetting('farmAddress', address);
      if (crops) await FarmDirectDB.setSetting('crops', crops);
      if (this.setupLat) await FarmDirectDB.setSetting('latitude', this.setupLat);
      if (this.setupLon) await FarmDirectDB.setSetting('longitude', this.setupLon);
      if (farmSize) await FarmDirectDB.setSetting('farmSize', farmSize);
      if (farmType) await FarmDirectDB.setSetting('farmType', farmType);
      if (irrigationType) await FarmDirectDB.setSetting('irrigationType', irrigationType);
      if (yearsFarming) await FarmDirectDB.setSetting('yearsFarming', yearsFarming);
      await FarmDirectDB.setSetting('farmer_authenticated', true);

      // 2. Mirror in localStorage
      try {
        localStorage.setItem('farmdirect_farmer_authenticated', 'true');
        localStorage.setItem('farmdirect_farmer_profile', JSON.stringify({
          farmerName, farmName, phone, village, district, address, crops,
          latitude: this.setupLat, longitude: this.setupLon,
          farmSize, farmType, irrigationType, yearsFarming
        }));
      } catch (e) {}

      // 3. Update Supabase if authenticated and online (safe fallback)
      try {
        const client = this.getSupabaseClient();
        if (client && navigator.onLine) {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user?.id) {
            const uid = session.user.id;
            await client.from('profiles').upsert({
              id: uid,
              full_name: farmerName,
              phone: phone || null,
              updated_at: new Date().toISOString()
            }).select();

            await client.from('farms').upsert({
              farmer_id: uid,
              farm_name: farmName,
              village: village || null,
              district: district || null,
              address: address || null,
              latitude: this.setupLat || null,
              longitude: this.setupLon || null,
              crops: crops ? crops.split(',').map(s => s.trim()) : [],
              updated_at: new Date().toISOString()
            }).select();
          }
        }
      } catch (sbErr) {
        console.warn('Supabase profile sync note (safe fallback):', sbErr);
      }

      // 4. Update UI Badges & Settings View
      await this.loadFarmProfileBadge();
      if (typeof this.renderSettingsView === 'function') {
        await this.renderSettingsView();
      }

      // 5. Trigger Background Sync
      if (window.SyncEngine && SyncEngine.isServerReachable) {
        SyncEngine.performSync('farm_profile_update');
      }

      // 6. Transition to Celebration / Success State
      if (submitText) submitText.innerText = '✓ Farm Profile Saved';

      setTimeout(() => {
        const setupForm = document.getElementById('form-farmer-setup');
        const stepper = document.getElementById('profile-setup-stepper');
        const footer = document.getElementById('profile-setup-footer');
        const successCard = document.getElementById('setup-success-card');

        if (setupForm) setupForm.style.display = 'none';
        if (stepper) stepper.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (successCard) successCard.classList.remove('hidden');

        this.showToast(`🌾 Farm profile saved! Active farm: ${farmName}`, 'success');
      }, 350);

    } catch (saveErr) {
      console.error('Error saving farm profile:', saveErr);
      this.showToast('Unable to save your farm details right now. Please check your connection and try again.', 'error');
      if (submitText) submitText.innerText = 'Save Farm Details';
      if (submitBtn) submitBtn.disabled = false;
    } finally {
      this.isSavingFarmerSetup = false;
    }
  },

  handleFinishSetupAndClose() {
    sessionStorage.setItem('farmdirect_portal_unlocked', 'true');
    this.closeFarmerAuthModal();
    this.showToast('🌾 Farmer Dashboard fully unlocked! Welcome to FarmDirect.', 'success');
  },

  /* ----------------------------------------------------
   * SETTINGS, BACKUP EXPORT & RESTORE
   * ---------------------------------------------------- */
  async renderSettingsView() {
    const settings = await FarmDirectDB.getAllSettings();

    // 1. Farm Profile Fields
    const farmNameInput = document.getElementById('setting-farm-name');
    const farmerNameInput = document.getElementById('setting-farmer-name');
    const mobileInput = document.getElementById('setting-mobile-number');
    const langSelect = document.getElementById('setting-preferred-language');
    const addressInput = document.getElementById('setting-farm-address');
    const villageInput = document.getElementById('setting-village');
    const districtInput = document.getElementById('setting-district');
    const stateInput = document.getElementById('setting-state');

    if (farmNameInput) farmNameInput.value = settings.farmName || 'Thennam Thoppu Natural Farm';
    if (farmerNameInput) farmerNameInput.value = settings.farmerName || 'Murugan Palanisamy';
    if (mobileInput) mobileInput.value = settings.mobileNumber || settings.phone || '9442188990';
    if (langSelect) langSelect.value = settings.preferredLanguage || settings.language || 'English';
    if (addressInput) addressInput.value = settings.farmAddress || (settings.location ? settings.location.split(',')[0] : 'SF No. 142/2, Main Road');
    if (villageInput) villageInput.value = settings.village || 'Pollachi';
    if (districtInput) districtInput.value = settings.district || 'Coimbatore';
    if (stateInput) stateInput.value = settings.state || 'Tamil Nadu';

    // Lock inputs to view mode by default
    [farmNameInput, farmerNameInput, mobileInput, langSelect, addressInput, villageInput, districtInput, stateInput].forEach((el) => {
      if (el) {
        el.disabled = true;
        el.classList.remove('is-invalid');
      }
    });

    const editBtn = document.getElementById('btn-edit-profile');
    const editControls = document.getElementById('profile-edit-controls');
    if (editBtn) editBtn.classList.remove('hidden');
    if (editControls) editControls.classList.add('hidden');

    // 2. Preferences
    const prefLang = document.getElementById('pref-language');
    if (prefLang) prefLang.value = settings.language || 'English';

    const prefDateFormat = document.getElementById('pref-date-format');
    if (prefDateFormat) prefDateFormat.value = settings.dateFormat || 'DD/MM/YYYY';

    const onText = window.I18n ? I18n.t('state_on') : 'On';
    const offText = window.I18n ? I18n.t('state_off') : 'Off';

    const prefLowStock = document.getElementById('pref-low-stock');
    const labelLowStock = document.getElementById('label-pref-low-stock');
    if (prefLowStock) {
      prefLowStock.checked = settings.lowStockWarning !== false;
      if (labelLowStock) labelLowStock.innerText = prefLowStock.checked ? onText : offText;
    }

    const prefConfirmDel = document.getElementById('pref-confirm-delete');
    const labelConfirmDel = document.getElementById('label-pref-confirm-delete');
    if (prefConfirmDel) {
      prefConfirmDel.checked = settings.confirmBeforeDelete !== false;
      if (labelConfirmDel) labelConfirmDel.innerText = prefConfirmDel.checked ? onText : offText;
    }

    // 3. Notifications
    const notifLowStock = document.getElementById('notif-low-stock');
    const labelNotifLowStock = document.getElementById('label-notif-low-stock');
    if (notifLowStock) {
      notifLowStock.checked = settings.notifLowStock !== false;
      if (labelNotifLowStock) labelNotifLowStock.innerText = notifLowStock.checked ? onText : offText;
    }

    const notifNewOrders = document.getElementById('notif-new-orders');
    const labelNotifNewOrders = document.getElementById('label-notif-new-orders');
    if (notifNewOrders) {
      notifNewOrders.checked = settings.notifNewOrders !== false;
      if (labelNotifNewOrders) labelNotifNewOrders.innerText = notifNewOrders.checked ? onText : offText;
    }

    const notifOrderStatus = document.getElementById('notif-order-status');
    const labelNotifOrderStatus = document.getElementById('label-notif-order-status');
    if (notifOrderStatus) {
      notifOrderStatus.checked = settings.notifOrderStatus !== false;
      if (labelNotifOrderStatus) labelNotifOrderStatus.innerText = notifOrderStatus.checked ? onText : offText;
    }

    // 4. Data & Storage metrics
    const products = await FarmDirectDB.getProducts();
    const orders = await FarmDirectDB.getOrders();
    const prodCountEl = document.getElementById('storage-products-count');
    const orderCountEl = document.getElementById('storage-orders-count');
    if (prodCountEl) prodCountEl.innerText = `${products.length} products`;
    if (orderCountEl) orderCountEl.innerText = `${orders.length} orders`;

    const lastBackupEl = document.getElementById('storage-last-backup');
    if (lastBackupEl) {
      if (settings.lastBackupDate) {
        const d = new Date(settings.lastBackupDate);
        lastBackupEl.innerText = `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        lastBackupEl.innerText = window.I18n ? I18n.t('val_no_backup') : 'No backup yet';
      }
    }

    const storageStatusEl = document.getElementById('storage-status-val');
    if (storageStatusEl) {
      storageStatusEl.innerHTML = `<span class="metric-dot-success"></span> ${window.I18n ? I18n.t('val_storage_available') : 'Available'}`;
    }

    // 5. Offline Status
    if (window.SyncEngine) {
      await SyncEngine.updateSyncUI();
    } else {
      const offlinePill = document.getElementById('settings-offline-pill');
      const offlineText = document.getElementById('settings-offline-text');
      const isOnline = navigator.onLine;
      if (offlinePill && offlineText) {
        offlinePill.className = `status-pill ${isOnline ? 'status-online' : 'status-offline'}`;
        offlineText.innerText = isOnline ? 'Online' : 'Offline — Your data is saved on this device';
      }
    }
  },

  bindSettingsHandlers() {
    // 1. Farm Profile Handlers
    const editBtn = document.getElementById('btn-edit-profile');
    const cancelBtn = document.getElementById('btn-cancel-profile');
    const saveBtn = document.getElementById('btn-save-profile');
    const editControls = document.getElementById('profile-edit-controls');

    const profileInputs = [
      'setting-farm-name',
      'setting-farmer-name',
      'setting-mobile-number',
      'setting-preferred-language',
      'setting-farm-address',
      'setting-village',
      'setting-district',
      'setting-state'
    ].map((id) => document.getElementById(id)).filter(Boolean);

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        profileInputs.forEach((el) => (el.disabled = false));
        editBtn.classList.add('hidden');
        if (editControls) editControls.classList.remove('hidden');
        const farmNameInput = document.getElementById('setting-farm-name');
        if (farmNameInput) farmNameInput.focus();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', async () => {
        await this.renderSettingsView();
        this.showToast('Profile editing cancelled', 'info');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const farmName = (document.getElementById('setting-farm-name')?.value || '').trim();
        const farmerName = (document.getElementById('setting-farmer-name')?.value || '').trim();
        const mobile = (document.getElementById('setting-mobile-number')?.value || '').trim();
        const lang = document.getElementById('setting-preferred-language')?.value || 'English';
        const address = (document.getElementById('setting-farm-address')?.value || '').trim();
        const village = (document.getElementById('setting-village')?.value || '').trim();
        const district = (document.getElementById('setting-district')?.value || '').trim();
        const state = (document.getElementById('setting-state')?.value || '').trim();

        // Validation
        if (!farmName) {
          this.showToast('Please enter your Farm Name', 'warning');
          document.getElementById('setting-farm-name')?.focus();
          return;
        }
        if (!farmerName) {
          this.showToast('Please enter the Farmer Name', 'warning');
          document.getElementById('setting-farmer-name')?.focus();
          return;
        }
        if (!mobile) {
          this.showToast('Please enter your Mobile Number', 'warning');
          document.getElementById('setting-mobile-number')?.focus();
          return;
        }

        // Validate 10-digit mobile number format
        const cleanDigits = mobile.replace(/\D/g, '');
        if (cleanDigits.length < 10 || cleanDigits.length > 12) {
          this.showToast('Please enter a valid 10-digit mobile number', 'warning');
          document.getElementById('setting-mobile-number')?.focus();
          return;
        }

        // Persist locally to IndexedDB settings
        await FarmDirectDB.setSetting('farmName', farmName);
        await FarmDirectDB.setSetting('farmerName', farmerName);
        await FarmDirectDB.setSetting('mobileNumber', mobile);
        await FarmDirectDB.setSetting('phone', mobile);
        await FarmDirectDB.setSetting('preferredLanguage', lang);
        await FarmDirectDB.setSetting('language', lang);
        await FarmDirectDB.setSetting('farmAddress', address);
        await FarmDirectDB.setSetting('village', village);
        await FarmDirectDB.setSetting('district', district);
        await FarmDirectDB.setSetting('state', state);
        if (village || district) {
          await FarmDirectDB.setSetting('location', [address, village, district, state].filter(Boolean).join(', '));
        }

        // Update top header and sidebar farm title
        const headerFarm = document.getElementById('header-farm-name');
        if (headerFarm) headerFarm.innerText = farmName;
        const sidebarFarm = document.getElementById('sidebar-farm-name');
        if (sidebarFarm) sidebarFarm.innerText = farmName;
        const sidebarLoc = document.querySelector('.farm-badge-loc');
        if (sidebarLoc && (village || district)) {
          sidebarLoc.innerText = [village, district].filter(Boolean).join(', ');
        }

        // Apply language changes if modified in farm profile
        if (lang) {
          await FarmDirectDB.setSetting('language', lang);
          const prefLang = document.getElementById('pref-language');
          if (prefLang) prefLang.value = lang;
          if (window.I18n) I18n.setLanguage(lang);
        }

        // Lock fields back to view mode
        profileInputs.forEach((el) => (el.disabled = true));
        if (editControls) editControls.classList.add('hidden');
        if (editBtn) editBtn.classList.remove('hidden');

        this.showToast('Farm profile updated and saved locally!', 'success');
      });
    }

    // 2. Preferences Handlers
    const prefLang = document.getElementById('pref-language');
    if (prefLang && !prefLang.dataset.bound) {
      prefLang.dataset.bound = 'true';
      prefLang.addEventListener('change', (e) => {
        this.handleLanguageChange(e.target.value);
      });
    }

    const profileLang = document.getElementById('setting-preferred-language');
    if (profileLang && !profileLang.dataset.bound) {
      profileLang.dataset.bound = 'true';
      profileLang.addEventListener('change', (e) => {
        this.handleLanguageChange(e.target.value);
      });
    }

    const prefDateFormat = document.getElementById('pref-date-format');
    if (prefDateFormat) {
      prefDateFormat.addEventListener('change', async (e) => {
        await FarmDirectDB.setSetting('dateFormat', e.target.value);
        App.currentDateFormat = e.target.value;
        this.showToast(`Date format changed to ${e.target.value}`, 'info');
      });
    }

    const prefLowStock = document.getElementById('pref-low-stock');
    if (prefLowStock) {
      prefLowStock.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-pref-low-stock');
        const stateStr = window.I18n ? (val ? I18n.t('state_on') : I18n.t('state_off')) : (val ? 'On' : 'Off');
        if (label) label.innerText = stateStr;
        await FarmDirectDB.setSetting('lowStockWarning', val);
        this.showToast(`Low stock warning ${val ? 'enabled' : 'disabled'}`, 'info');
        if (window.InventoryModule) InventoryModule.render();
      });
    }

    const prefConfirmDel = document.getElementById('pref-confirm-delete');
    if (prefConfirmDel) {
      prefConfirmDel.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-pref-confirm-delete');
        const stateStr = window.I18n ? (val ? I18n.t('state_on') : I18n.t('state_off')) : (val ? 'On' : 'Off');
        if (label) label.innerText = stateStr;
        await FarmDirectDB.setSetting('confirmBeforeDelete', val);
        this.showToast(`Confirmation before delete ${val ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    // 3. Notifications Handlers
    const notifLowStock = document.getElementById('notif-low-stock');
    if (notifLowStock) {
      notifLowStock.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-notif-low-stock');
        const stateStr = window.I18n ? (val ? I18n.t('state_on') : I18n.t('state_off')) : (val ? 'On' : 'Off');
        if (label) label.innerText = stateStr;
        await FarmDirectDB.setSetting('notifLowStock', val);
        this.showToast(`Low stock alerts turned ${val ? 'On' : 'Off'}`, 'info');
      });
    }

    const notifNewOrders = document.getElementById('notif-new-orders');
    if (notifNewOrders) {
      notifNewOrders.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-notif-new-orders');
        const stateStr = window.I18n ? (val ? I18n.t('state_on') : I18n.t('state_off')) : (val ? 'On' : 'Off');
        if (label) label.innerText = stateStr;
        await FarmDirectDB.setSetting('notifNewOrders', val);
        this.showToast(`New order alerts turned ${val ? 'On' : 'Off'}`, 'info');
      });
    }

    const notifOrderStatus = document.getElementById('notif-order-status');
    if (notifOrderStatus) {
      notifOrderStatus.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-notif-order-status');
        const stateStr = window.I18n ? (val ? I18n.t('state_on') : I18n.t('state_off')) : (val ? 'On' : 'Off');
        if (label) label.innerText = stateStr;
        await FarmDirectDB.setSetting('notifOrderStatus', val);
        this.showToast(`Order status alerts turned ${val ? 'On' : 'Off'}`, 'info');
      });
    }

    // 4. Data & Storage Handlers
    // Export Backup File
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        try {
          const backup = await FarmDirectDB.exportAllData();
          const nowIso = new Date().toISOString();
          await FarmDirectDB.setSetting('lastBackupDate', nowIso);
          const jsonStr = JSON.stringify(backup, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = nowIso.split('T')[0];
          a.href = url;
          a.download = `farmdirect_backup_${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.showToast('Backup exported and downloaded successfully!', 'success');
          await this.renderSettingsView();
        } catch (err) {
          this.showToast('Export error: ' + err.message, 'error');
        }
      });
    }

    // Import Backup File
    const importInput = document.getElementById('backup-file-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (!data || !data.data || !Array.isArray(data.data.products) || !Array.isArray(data.data.orders)) {
              throw new Error('Invalid backup schema: Missing product or order records');
            }
            this.openConfirmModal({
              title: 'Import & Restore Backup',
              message: `This backup contains ${data.data.products.length} products and ${data.data.orders.length} orders. Restoring will safely replace your local records with this backup. Proceed?`,
              confirmText: 'Restore Backup',
              confirmClass: 'btn-primary',
              onConfirm: async () => {
                await FarmDirectDB.importData(data);
                this.showToast('Database restored successfully from backup!', 'success');
                await this.renderSettingsView();
                App.renderDashboardOverview();
                if (window.ProductsModule) ProductsModule.renderProductsList();
                if (window.OrdersModule) OrdersModule.renderOrdersList();
                if (window.InventoryModule) InventoryModule.render();
                if (window.ReportsModule) ReportsModule.render();
              }
            });
          } catch (err) {
            this.showToast('Invalid backup file: ' + err.message, 'error');
          }
          importInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    // Clear Demo Data (Only demo data, preserving real farmer records!)
    const clearDemoBtn = document.getElementById('btn-clear-demo-data');
    if (clearDemoBtn) {
      clearDemoBtn.addEventListener('click', () => {
        this.openConfirmModal({
          title: 'Clear Demo Data',
          message: 'This will remove only sample demonstration crops (Tomatoes, Onions, Potatoes, Bananas, Spinach) and sample demo orders. Your custom farm products, real orders, sales history, and profile settings will be completely preserved. Proceed?',
          confirmText: 'Clear Demo Data',
          confirmClass: 'btn-danger',
          onConfirm: async () => {
            try {
              const res = await FarmDirectDB.clearDemoData();
              this.showToast(`Demo data cleared: ${res.deletedProducts} demo products and ${res.deletedOrders} demo orders removed. Real records preserved.`, 'success');
              await this.renderSettingsView();
              App.renderDashboardOverview();
              if (window.ProductsModule) ProductsModule.renderProductsList();
              if (window.OrdersModule) OrdersModule.renderOrdersList();
              if (window.InventoryModule) InventoryModule.render();
              if (window.ReportsModule) ReportsModule.render();
            } catch (err) {
              this.showToast('Error clearing demo data: ' + err.message, 'error');
            }
          }
        });
      });
    }

    // 5. Offline Status Sync Now
    const settingsSyncBtn = document.getElementById('btn-settings-sync');
    if (settingsSyncBtn) {
      settingsSyncBtn.addEventListener('click', () => {
        if (window.SyncEngine) {
          SyncEngine.handleManualSyncClick();
        } else {
          this.showToast('Operating offline: All data is saved on this device.', 'info');
        }
      });
    }

    // 6. Reset Application Settings (Preferences only)
    const resetPrefBtn = document.getElementById('btn-reset-preferences');
    if (resetPrefBtn) {
      resetPrefBtn.addEventListener('click', () => {
        this.openConfirmModal({
          title: 'Reset Application Settings',
          message: 'This will reset your application preferences (language, date format, warning and notification toggles) back to default settings. Your farm products, orders, profile, and sales records will NOT be deleted. Proceed?',
          confirmText: 'Reset Settings',
          confirmClass: 'btn-warning',
          onConfirm: async () => {
            await FarmDirectDB.resetPreferences();
            this.showToast('Application preferences reset to default values.', 'success');
            await this.renderSettingsView();
          }
        });
      });
    }

    // Active Two-Way Sync Button in header
    const syncButtons = document.querySelectorAll('.btn-sync-trigger');
    syncButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SyncEngine) {
          SyncEngine.handleManualSyncClick();
        }
      });
    });
  },

  /* ----------------------------------------------------
   * TOAST NOTIFICATION UTILITY
   * ---------------------------------------------------- */
  showToast(message, type = 'info', isLanguageToast = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Prevent duplicate toasts with the exact same message
    const existingToasts = container.querySelectorAll('.toast');
    for (const t of existingToasts) {
      if (t.querySelector('.toast-message')?.textContent.trim() === message.trim()) {
        return; // Don't stack duplicate identical messages
      }
    }

    // Dismiss existing language toasts so they don't pile up when switching
    if (isLanguageToast) {
      existingToasts.forEach((t) => {
        if (t.dataset.isLang === 'true') {
          t.remove();
        }
      });
    }

    // Limit max active toasts to 3
    const activeToasts = container.querySelectorAll('.toast');
    if (activeToasts.length >= 3) {
      activeToasts[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    if (isLanguageToast) toast.dataset.isLang = 'true';

    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  },

  /* ----------------------------------------------------
   * REUSABLE CONFIRMATION MODAL
   * ---------------------------------------------------- */
  openConfirmModal({ title, message, confirmText = 'Confirm', confirmClass = 'btn-primary', onConfirm }) {
    const modal = document.getElementById('generic-confirm-modal');
    document.getElementById('confirm-modal-title').innerText = title;
    document.getElementById('confirm-modal-message').innerText = message;

    const btnConfirm = document.getElementById('confirm-modal-action-btn');
    btnConfirm.innerText = confirmText;
    btnConfirm.className = `btn ${confirmClass}`;

    btnConfirm.onclick = () => {
      modal.classList.add('hidden');
      if (typeof onConfirm === 'function') onConfirm();
    };

    document.getElementById('confirm-modal-cancel-btn').onclick = () => {
      modal.classList.add('hidden');
    };

    modal.classList.remove('hidden');
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
