/**
 * FarmDirect Auto-Sync Engine
 * Provides opportunistic, batched, two-way cloud synchronization that automatically triggers
 * the moment network connectivity is detected (even for a brief 2-minute coverage window).
 */

const getSyncApiBase = () => {
  if (window.location.port === '5000') {
    return 'http://127.0.0.1:8001';
  }
  return '';
};

const SyncEngine = {
  isServerReachable: false,
  isSyncing: false,
  autoSyncEnabled: true,
  checkIntervalMs: 15000, // Probe every 15 seconds for network bursts
  intervalTimer: null,
  lastSyncTimestamp: null,

  async init() {
    console.log('🔄 Initializing FarmDirect Auto-Sync Engine...');

    // Load last sync time
    this.lastSyncTimestamp = await FarmDirectDB.getSetting('lastSyncedAt', null);

    // Initial connection check
    await this.checkConnectivity(false);

    // Bind Online/Offline browser events
    window.addEventListener('online', () => {
      console.log('📶 Browser online event fired. Checking cloud server reachability...');
      this.checkConnectivity(true);
    });

    window.addEventListener('offline', () => {
      console.log('📴 Browser offline event fired.');
      this.isServerReachable = false;
      this.updateSyncUI();
    });

    // Start background heartbeat probe (every 15s to catch brief network bursts)
    this.startHeartbeat();

    // Initial UI refresh
    await this.updateSyncUI();

    // Check if there are pending items and we have connectivity right now
    if (this.isServerReachable) {
      this.performSync('init');
    }
  },

  startHeartbeat() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    this.intervalTimer = setInterval(async () => {
      if (!this.autoSyncEnabled) return;
      await this.checkConnectivity(false);
    }, this.checkIntervalMs);
  },

  /**
   * Active Liveness Probe: Tests if backend cloud API is genuinely reachable
   */
  async checkConnectivity(triggeredByEvent = false) {
    const wasReachable = this.isServerReachable;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Probe lightweight health endpoint
      const res = await fetch(getSyncApiBase() + '/api/v1/sync/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isServerReachable = true;

        // If newly reconnected or network detected
        if (!wasReachable || triggeredByEvent) {
          console.log('✨ Network signal confirmed available! Triggering opportunistic auto-sync...');
          App.showToast('Network signal detected! Auto-syncing in background...', 'info');
          await this.performSync('network_detected');
        } else {
          // If already reachable, check if there are pending items to push
          const pending = await FarmDirectDB.getPendingSyncItems();
          if (pending.totalPending > 0) {
            console.log(`⚡ ${pending.totalPending} pending items queued. Auto-syncing now...`);
            await this.performSync('pending_flush');
          }
        }
      } else {
        this.isServerReachable = false;
      }
    } catch (err) {
      // Network unreachable or request timed out
      this.isServerReachable = false;
    }

    this.updateSyncUI();
  },

  /**
   * Main Two-Way Batched Synchronization (Device <-> Cloud)
   * Designed to finish in < 350ms during brief network windows.
   */
  async performSync(triggerSource = 'manual') {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping duplicate call.');
      return;
    }

    this.isSyncing = true;
    this.updateSyncUI();

    try {
      // 1. Gather all local pending items from IndexedDB
      const pending = await FarmDirectDB.getPendingSyncItems();
      const settings = await FarmDirectDB.getAllSettings();

      const orderUpdatesPayload = pending.orders.map((o) => ({
        id: o.id,
        status: o.status,
        notes: o.notes || '',
        updated_at: o.updatedAt || new Date().toISOString()
      }));

      const batchPayload = {
        farmer_id: settings.farmerId || 'f1000000-0000-0000-0000-000000000001',
        farm_name: settings.farmName || 'Thennam Thoppu Natural Farm',
        last_synced_at: this.lastSyncTimestamp,
        products: pending.products,
        order_updates: orderUpdatesPayload,
        inventory_logs: pending.logs
      };

      // 2. Transmit single atomic batch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s burst timeout

      const response = await fetch(getSyncApiBase() + '/api/v1/sync/farmer-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Sync server responded with HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const syncedAt = result.server_time || new Date().toISOString();
        this.lastSyncTimestamp = syncedAt;
        this.isServerReachable = true;

        // 3. Mark uploaded items as 'synced' in IndexedDB
        const syncedProductIds = pending.products.map((p) => p.id);
        const syncedOrderIds = pending.orders.map((o) => o.id);
        const syncedLogIds = pending.logs.map((l) => l.id);

        await FarmDirectDB.markItemsSynced(syncedProductIds, syncedOrderIds, syncedLogIds, syncedAt);

        // 4. Ingest any newly fetched remote customer orders
        let newOrdersCount = 0;
        if (result.new_remote_orders && Array.isArray(result.new_remote_orders)) {
          newOrdersCount = await FarmDirectDB.insertRemoteOrders(result.new_remote_orders);
        }

        // 5. Success Notifications & Feedback
        const summaryMsg =
          newOrdersCount > 0
            ? `Auto-Sync Complete: ${result.products_synced} crops synced, ${result.orders_synced} orders updated, and ${newOrdersCount} new customer orders downloaded!`
            : `Auto-Sync Complete: ${result.products_synced} crops synced, ${result.orders_synced} orders updated.`;

        console.log('✅ ' + summaryMsg);
        App.showToast(summaryMsg, 'success');

        // Refresh views to show fresh data
        this.refreshActiveViews();
      } else {
        throw new Error(result.message || 'Sync failed on server');
      }
    } catch (err) {
      console.warn('Sync attempt failed or timed out:', err.message);
      // If manually triggered, alert user
      if (triggerSource === 'manual') {
        App.showToast('Sync unable to connect: ' + err.message + '. Changes remain safely queued locally.', 'warning');
      }
      this.isServerReachable = false;
    } finally {
      this.isSyncing = false;
      this.updateSyncUI();
    }
  },

  /**
   * Refreshes active screens after a sync cycle
   */
  refreshActiveViews() {
    App.renderDashboardOverview();
    if (window.ProductsModule) ProductsModule.renderProductsList();
    if (window.OrdersModule) OrdersModule.renderOrdersList();
    if (window.InventoryModule) InventoryModule.render();
    if (window.ReportsModule) ReportsModule.render();
    if (App.activeView === 'settings') App.renderSettingsView();
  },

  /**
   * Updates Header & Settings UI badges
   */
  async updateSyncUI() {
    const pending = await FarmDirectDB.getPendingSyncItems();
    const pendingCount = pending.totalPending;

    // Header Status Pill & Notice Banner
    const statusPill = document.getElementById('connectivity-status-pill');
    const statusText = document.getElementById('connectivity-status-text');
    const offlineNoticeBanner = document.getElementById('offline-notice-banner');

    if (statusPill && statusText) {
      if (this.isSyncing) {
        statusPill.className = 'status-pill status-syncing';
        statusText.innerHTML = '<span class="spin-icon">🔄</span> Auto-Syncing...';
        if (offlineNoticeBanner) offlineNoticeBanner.classList.add('hidden');
      } else if (this.isServerReachable && !this.simulatedNoInternet) {
        statusPill.className = 'status-pill status-online';
        statusText.innerText = pendingCount > 0 ? `Internet Connected (Syncing ${pendingCount})` : 'Internet Connected';
        if (offlineNoticeBanner) offlineNoticeBanner.classList.add('hidden');
      } else {
        statusPill.className = 'status-pill status-offline';
        statusText.innerText = pendingCount > 0 ? `No Internet Connection (${pendingCount} queued)` : 'No Internet Connection';
        if (offlineNoticeBanner) offlineNoticeBanner.classList.remove('hidden');
      }
    }

    // Header Sync Button
    const syncBtn = document.getElementById('header-sync-btn');
    if (syncBtn) {
      if (this.isSyncing) {
        syncBtn.innerHTML = `
          <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Syncing...</span>
        `;
        syncBtn.disabled = true;
      } else {
        syncBtn.disabled = false;
        const badgeHtml = pendingCount > 0 ? `<span class="sync-pending-badge">${pendingCount}</span>` : '';
        syncBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span class="hide-mobile">Sync</span>
          ${badgeHtml}
        `;
      }
    }

    // Settings screen indicators (backward compatibility and new redesign)
    const syncStatusEl = document.getElementById('settings-sync-status');
    if (syncStatusEl) {
      syncStatusEl.innerHTML = (this.isServerReachable && !this.simulatedNoInternet)
        ? '<span class="text-success font-bold">✓ Internet Connected (Auto-Sync Active)</span>'
        : '<span class="text-amber font-bold">⚠ No Internet Connection (Auto-sync armed on reconnect)</span>';
    }

    const lastSyncEl = document.getElementById('settings-last-sync');
    if (lastSyncEl) {
      lastSyncEl.innerText = this.lastSyncTimestamp
        ? new Date(this.lastSyncTimestamp).toLocaleString('en-IN')
        : 'Never synced';
    }

    const queueEl = document.getElementById('settings-pending-queue-count');
    if (queueEl) {
      queueEl.innerText = `${pendingCount} changes queued`;
    }

    // Redesigned Settings screen offline indicator
    const settingsOfflinePill = document.getElementById('settings-offline-pill');
    const settingsOfflineText = document.getElementById('settings-offline-text');
    const settingsSyncStatusText = document.getElementById('settings-sync-status-text');

    if (settingsOfflinePill && settingsOfflineText) {
      if (this.isSyncing) {
        settingsOfflinePill.className = 'status-pill status-syncing';
        settingsOfflineText.innerText = window.I18n ? I18n.t('btn_syncing') : 'Syncing...';
        if (settingsSyncStatusText) settingsSyncStatusText.innerText = 'Syncing changes with server...';
      } else if (this.isServerReachable && !this.simulatedNoInternet) {
        settingsOfflinePill.className = 'status-pill status-online';
        settingsOfflineText.innerText = window.I18n ? I18n.t('offline_pill_online') : 'Online';
        if (settingsSyncStatusText) {
          settingsSyncStatusText.innerText = pendingCount > 0
            ? `${pendingCount} local changes ready to sync.`
            : (window.I18n ? I18n.t('offline_sync_status_online') : 'All data is synchronized and backed up locally.');
        }
      } else {
        settingsOfflinePill.className = 'status-pill status-offline';
        settingsOfflineText.innerText = window.I18n ? I18n.t('offline_pill_offline') : 'Offline — Your data is saved on this device';
        if (settingsSyncStatusText) {
          settingsSyncStatusText.innerText = window.I18n ? I18n.t('offline_sync_status_offline') : 'All products, orders, and settings remain fully accessible offline.';
        }
      }
    }
  },

  /**
   * Manual user click on Sync button
   */
  async handleManualSyncClick() {
    if (this.isSyncing) return;

    const pending = await FarmDirectDB.getPendingSyncItems();

    if (this.isServerReachable && !this.simulatedNoInternet) {
      App.showToast('Checking for cloud updates...', 'info');
      await this.performSync('manual');
    } else {
      // Show informative modal explaining the 2-minute auto-sync guarantee
      App.openConfirmModal({
        title: 'No Internet Connection Detected',
        message: `No internet connection is currently detected. You have ${pending.totalPending} local changes queued safely on this device.\n\n⚡ Automatic Sync Guarantee: The instant an internet connection is detected (even for a brief 2-minute window), FarmDirect will automatically upload your produce changes and download any new customer orders.`,
        confirmText: 'Check Connection Now',
        confirmClass: 'btn-primary',
        onConfirm: async () => {
          App.showToast('Testing internet connection...', 'info');
          await this.checkConnectivity(true);
        }
      });
    }
  }
};

window.SyncEngine = SyncEngine;
