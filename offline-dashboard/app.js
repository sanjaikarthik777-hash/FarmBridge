/**
 * FarmDirect App Coordinator
 * Coordinates routing, Service Worker registration, PWA installation,
 * connectivity status events, toast notifications, confirmation dialogs, and dashboard overview.
 */

const App = {
  activeView: 'dashboard',
  deferredInstallPrompt: null,

  async init() {
    console.log('🌱 Initializing FarmDirect Farmer Dashboard (Offline-First)...');

    // 1. Initialize IndexedDB
    try {
      await FarmDirectDB.open();
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

    console.log('✅ FarmDirect initialized successfully.');
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
          statusText.innerText = 'Internet Connected';
          statusPill.title = 'Internet connection active. Changes auto-sync with cloud.';
          if (offlineNoticeBanner) offlineNoticeBanner.classList.add('hidden');
        } else {
          statusPill.className = 'status-pill status-offline';
          statusText.innerText = 'No Internet Connection';
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
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.innerText = now.toLocaleDateString('en-IN', options);
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
      this.currentDateFormat = settings.dateFormat || 'DD/MM/YYYY';

      const headerFarm = document.getElementById('header-farm-name');
      if (headerFarm) headerFarm.innerText = farmName;

      const sidebarFarm = document.getElementById('sidebar-farm-name');
      if (sidebarFarm) sidebarFarm.innerText = farmName;

      const village = settings.village || 'Pollachi';
      const district = settings.district || 'Coimbatore';
      const sidebarLoc = document.querySelector('.farm-badge-loc');
      if (sidebarLoc) sidebarLoc.innerText = `${village}, ${district}`;
    } catch (err) {
      console.warn('Could not load farm profile header:', err);
    }
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

    const prefLowStock = document.getElementById('pref-low-stock');
    const labelLowStock = document.getElementById('label-pref-low-stock');
    if (prefLowStock) {
      prefLowStock.checked = settings.lowStockWarning !== false;
      if (labelLowStock) labelLowStock.innerText = prefLowStock.checked ? 'On' : 'Off';
    }

    const prefConfirmDel = document.getElementById('pref-confirm-delete');
    const labelConfirmDel = document.getElementById('label-pref-confirm-delete');
    if (prefConfirmDel) {
      prefConfirmDel.checked = settings.confirmBeforeDelete !== false;
      if (labelConfirmDel) labelConfirmDel.innerText = prefConfirmDel.checked ? 'On' : 'Off';
    }

    // 3. Notifications
    const notifLowStock = document.getElementById('notif-low-stock');
    const labelNotifLowStock = document.getElementById('label-notif-low-stock');
    if (notifLowStock) {
      notifLowStock.checked = settings.notifLowStock !== false;
      if (labelNotifLowStock) labelNotifLowStock.innerText = notifLowStock.checked ? 'On' : 'Off';
    }

    const notifNewOrders = document.getElementById('notif-new-orders');
    const labelNotifNewOrders = document.getElementById('label-notif-new-orders');
    if (notifNewOrders) {
      notifNewOrders.checked = settings.notifNewOrders !== false;
      if (labelNotifNewOrders) labelNotifNewOrders.innerText = notifNewOrders.checked ? 'On' : 'Off';
    }

    const notifOrderStatus = document.getElementById('notif-order-status');
    const labelNotifOrderStatus = document.getElementById('label-notif-order-status');
    if (notifOrderStatus) {
      notifOrderStatus.checked = settings.notifOrderStatus !== false;
      if (labelNotifOrderStatus) labelNotifOrderStatus.innerText = notifOrderStatus.checked ? 'On' : 'Off';
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
        lastBackupEl.innerText = 'No backup yet';
      }
    }

    const storageStatusEl = document.getElementById('storage-status-val');
    if (storageStatusEl) {
      storageStatusEl.innerHTML = '<span class="metric-dot-success"></span> Available';
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

        // Lock fields back to view mode
        profileInputs.forEach((el) => (el.disabled = true));
        if (editControls) editControls.classList.add('hidden');
        if (editBtn) editBtn.classList.remove('hidden');

        this.showToast('Farm profile updated and saved locally!', 'success');
      });
    }

    // 2. Preferences Handlers
    const prefLang = document.getElementById('pref-language');
    if (prefLang) {
      prefLang.addEventListener('change', async (e) => {
        await FarmDirectDB.setSetting('language', e.target.value);
        await FarmDirectDB.setSetting('preferredLanguage', e.target.value);
        const profileLang = document.getElementById('setting-preferred-language');
        if (profileLang) profileLang.value = e.target.value;
        this.showToast(`Language preference set to ${e.target.value}`, 'info');
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
        if (label) label.innerText = val ? 'On' : 'Off';
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
        if (label) label.innerText = val ? 'On' : 'Off';
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
        if (label) label.innerText = val ? 'On' : 'Off';
        await FarmDirectDB.setSetting('notifLowStock', val);
        this.showToast(`Low stock alerts turned ${val ? 'On' : 'Off'}`, 'info');
      });
    }

    const notifNewOrders = document.getElementById('notif-new-orders');
    if (notifNewOrders) {
      notifNewOrders.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-notif-new-orders');
        if (label) label.innerText = val ? 'On' : 'Off';
        await FarmDirectDB.setSetting('notifNewOrders', val);
        this.showToast(`New order alerts turned ${val ? 'On' : 'Off'}`, 'info');
      });
    }

    const notifOrderStatus = document.getElementById('notif-order-status');
    if (notifOrderStatus) {
      notifOrderStatus.addEventListener('change', async (e) => {
        const val = e.target.checked;
        const label = document.getElementById('label-notif-order-status');
        if (label) label.innerText = val ? 'On' : 'Off';
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
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

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
    }, 4000);
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
