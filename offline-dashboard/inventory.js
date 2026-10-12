/**
 * FarmDirect Inventory Module
 * Handles stock overview, low-stock/out-of-stock alerts, manual stock adjustments,
 * and chronological audit logs.
 */

const InventoryModule = {
  currentCategoryFilter: 'all',
  currentSearchTerm: '',
  adjustingProductId: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('inventory-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchTerm = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    const catSelect = document.getElementById('inventory-cat-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.currentCategoryFilter = e.target.value;
        this.render();
      });
    }

    const adjustForm = document.getElementById('stock-adjust-form');
    if (adjustForm) {
      adjustForm.addEventListener('submit', (e) => this.handleStockAdjustmentSubmit(e));
    }
  },

  async render() {
    await this.renderInventorySummary();
    await this.renderStockTable();
    await this.renderInventoryLogs();
  },

  async renderInventorySummary() {
    const products = await FarmDirectDB.getProducts();

    let healthyCount = 0;
    let lowCount = 0;
    let outCount = 0;
    let totalStockUnits = 0;

    const lowStockItems = [];
    const outStockItems = [];

    products.forEach((p) => {
      totalStockUnits += p.quantity;
      if (p.quantity <= 0) {
        outCount++;
        outStockItems.push(p);
      } else if (p.quantity <= (p.minStockThreshold || 10)) {
        lowCount++;
        lowStockItems.push(p);
      } else {
        healthyCount++;
      }
    });

    // Update stat numbers
    const elHealthy = document.getElementById('inv-stat-healthy');
    const elLow = document.getElementById('inv-stat-low');
    const elOut = document.getElementById('inv-stat-out');
    const elTotal = document.getElementById('inv-stat-total');

    if (elHealthy) elHealthy.innerText = healthyCount;
    if (elLow) elLow.innerText = lowCount;
    if (elOut) elOut.innerText = outCount;
    if (elTotal) elTotal.innerText = totalStockUnits.toLocaleString();

    // Render alert banners if low or out of stock items exist
    const alertsContainer = document.getElementById('inventory-alerts-container');
    if (alertsContainer) {
      const showLowStock = await FarmDirectDB.getSetting('lowStockWarning', true);
      const hasOutStock = outStockItems.length > 0;
      const hasLowStock = showLowStock && lowStockItems.length > 0;

      if (!hasOutStock && !hasLowStock) {
        alertsContainer.innerHTML = '';
        alertsContainer.classList.add('hidden');
      } else {
        alertsContainer.classList.remove('hidden');
        let html = '';

        if (hasOutStock) {
          const names = outStockItems.map((p) => `<strong>${p.name}</strong>`).join(', ');
          html += `
            <div class="alert-banner alert-banner-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <strong>Out of Stock Alert:</strong> ${names} have reached 0 available units. Customer orders requesting these items will be blocked.
              </div>
            </div>
          `;
        }

        if (hasLowStock) {
          const itemsList = lowStockItems.map((p) => `<strong>${p.name}</strong> (${p.quantity} ${p.unit} remaining)`).join(', ');
          html += `
            <div class="alert-banner alert-banner-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <strong>Low Stock Notice:</strong> ${itemsList} are below their minimum threshold. Plan harvest or replenishment soon.
              </div>
            </div>
          `;
        }

        alertsContainer.innerHTML = html;
      }
    }
  },

  async renderStockTable() {
    const tbody = document.getElementById('inventory-table-tbody');
    if (!tbody) return;

    const products = await FarmDirectDB.getProducts();

    const filtered = products.filter((p) => {
      if (this.currentCategoryFilter !== 'all' && p.category !== this.currentCategoryFilter) {
        return false;
      }
      if (this.currentSearchTerm) {
        const nameMatch = p.name.toLowerCase().includes(this.currentSearchTerm);
        const catMatch = p.category.toLowerCase().includes(this.currentSearchTerm);
        if (!nameMatch && !catMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-muted">No inventory records matching your query.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map((p) => {
        const isOut = p.quantity <= 0;
        const isLow = !isOut && p.quantity <= (p.minStockThreshold || 10);

        let badgeClass = 'badge-in-stock';
        let badgeLabel = 'Adequate';
        if (isOut) {
          badgeClass = 'badge-out-stock';
          badgeLabel = 'Out of Stock';
        } else if (isLow) {
          badgeClass = 'badge-low-stock';
          badgeLabel = 'Low Stock';
        }

        return `
        <tr>
          <td>
            <strong>${p.name}</strong>
            ${p.isAvailable === false ? '<span class="badge-tag-tiny text-muted">Hidden</span>' : ''}
          </td>
          <td><span class="product-category-tag">${p.category}</span></td>
          <td class="text-right">
            <span class="font-bold ${isOut ? 'text-danger' : isLow ? 'text-amber' : 'text-success'}">
              ${p.quantity} ${p.unit}
            </span>
          </td>
          <td class="text-right text-muted">${p.minStockThreshold || 10} ${p.unit}</td>
          <td>
            <span class="status-badge ${badgeClass}"><span class="badge-dot"></span>${badgeLabel}</span>
          </td>
          <td class="text-right font-medium">₹${p.price.toFixed(2)} / ${p.unit}</td>
          <td class="text-right">
            <button class="btn btn-secondary btn-sm" onclick="InventoryModule.openAdjustStockModal('${p.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Adjust Stock
            </button>
          </td>
        </tr>
      `;
      })
      .join('');
  },

  async renderInventoryLogs() {
    const tbody = document.getElementById('inventory-logs-tbody');
    if (!tbody) return;

    const logs = await FarmDirectDB.getInventoryLogs();

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">No stock movement logs recorded yet.</td>
        </tr>
      `;
      return;
    }

    // Show top 25 recent logs
    tbody.innerHTML = logs
      .slice(0, 25)
      .map((log) => {
        const isPositive = log.delta > 0;
        const deltaFormatted = isPositive ? `+${log.delta}` : `${log.delta}`;
        const dateFormatted = new Date(log.timestamp).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return `
        <tr>
          <td class="text-muted text-xs">${dateFormatted}</td>
          <td><strong>${log.productName}</strong></td>
          <td class="text-right text-muted">${log.previousStock} ${log.unit || ''}</td>
          <td class="text-right font-bold ${isPositive ? 'text-success' : 'text-danger'}">
            ${deltaFormatted} ${log.unit || ''}
          </td>
          <td class="text-right font-bold">${log.newStock} ${log.unit || ''}</td>
          <td class="text-muted text-xs">${log.reason}</td>
        </tr>
      `;
      })
      .join('');
  },

  async openAdjustStockModal(id) {
    const prod = await FarmDirectDB.getProduct(id);
    if (!prod) {
      App.showToast('Product not found', 'error');
      return;
    }

    this.adjustingProductId = id;
    document.getElementById('adjust-product-id').value = prod.id;
    document.getElementById('adjust-product-name').innerText = prod.name;
    document.getElementById('adjust-current-stock').innerText = `${prod.quantity} ${prod.unit}`;
    document.getElementById('adjust-product-unit').innerText = prod.unit;
    document.getElementById('adjust-min-threshold').value = prod.minStockThreshold || 10;
    document.getElementById('adjust-amount-input').value = '';
    document.getElementById('adjust-reason-input').value = 'Fresh morning harvest intake';
    document.getElementById('adjust-type-add').checked = true;

    document.getElementById('stock-adjust-modal').classList.remove('hidden');
  },

  closeAdjustModal() {
    document.getElementById('stock-adjust-modal').classList.add('hidden');
    this.adjustingProductId = null;
  },

  async handleStockAdjustmentSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('adjust-product-id').value;
    const prod = await FarmDirectDB.getProduct(id);
    if (!prod) {
      App.showToast('Product not found', 'error');
      return;
    }

    const type = document.querySelector('input[name="adjust-type"]:checked').value;
    const amount = parseFloat(document.getElementById('adjust-amount-input').value);
    const newThreshold = parseFloat(document.getElementById('adjust-min-threshold').value);
    const reasonText = document.getElementById('adjust-reason-input').value.trim() || 'Manual stock update';

    if (isNaN(amount) || amount <= 0) {
      App.showToast('Please enter an adjustment quantity greater than 0', 'warning');
      return;
    }

    let delta = 0;
    let updatedQty = prod.quantity;

    if (type === 'add') {
      delta = amount;
      updatedQty = prod.quantity + amount;
    } else if (type === 'deduct') {
      if (amount > prod.quantity) {
        App.showToast(`Cannot deduct ${amount} ${prod.unit}. Only ${prod.quantity} ${prod.unit} available. Inventory cannot be negative.`, 'warning');
        return;
      }
      delta = -amount;
      updatedQty = prod.quantity - amount;
    } else if (type === 'set') {
      delta = amount - prod.quantity;
      updatedQty = amount;
    }

    const prevStock = prod.quantity;
    prod.quantity = Math.max(0, updatedQty);
    if (!isNaN(newThreshold) && newThreshold >= 0) {
      prod.minStockThreshold = newThreshold;
    }
    prod.updatedAt = new Date().toISOString();

    await FarmDirectDB.saveProduct(prod);

    await FarmDirectDB.logInventory({
      productId: prod.id,
      productName: prod.name,
      previousStock: prevStock,
      newStock: prod.quantity,
      delta: delta,
      unit: prod.unit,
      reason: reasonText
    });

    this.closeAdjustModal();
    App.showToast(`Updated stock for ${prod.name}: ${prod.quantity} ${prod.unit}`, 'success');

    this.render();
    App.renderDashboardOverview();
    if (window.ProductsModule) ProductsModule.renderProductsList();
  }
};

window.InventoryModule = InventoryModule;
