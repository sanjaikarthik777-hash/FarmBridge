/**
 * FarmDirect Orders Module
 * Handles order lifecycle transitions, atomic stock deductions/restorations,
 * demo order generation, order filtering, and details modal.
 */

const OrdersModule = {
  currentFilterStatus: 'all',
  currentSearchTerm: '',

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Search orders
    const searchInput = document.getElementById('order-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchTerm = e.target.value.trim().toLowerCase();
        this.renderOrdersList();
      });
    }

    // Status Filter Tabs
    const filterTabs = document.querySelectorAll('.order-filter-tab');
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilterStatus = tab.dataset.status || 'all';
        this.renderOrdersList();
      });
    });

    // Demo Order Modal Form
    const demoOrderForm = document.getElementById('demo-order-form');
    if (demoOrderForm) {
      demoOrderForm.addEventListener('submit', (e) => this.handleCreateDemoOrder(e));
    }
  },

  async renderOrdersList() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    const orders = await FarmDirectDB.getOrders();

    const filtered = orders.filter((ord) => {
      // Status filter
      if (this.currentFilterStatus === 'demo') {
        if (!ord.isDemo) return false;
      } else if (this.currentFilterStatus !== 'all') {
        if (ord.status !== this.currentFilterStatus) return false;
      }

      // Search filter
      if (this.currentSearchTerm) {
        const idMatch = ord.id.toLowerCase().includes(this.currentSearchTerm);
        const nameMatch = ord.customerName.toLowerCase().includes(this.currentSearchTerm);
        const phoneMatch = (ord.customerPhone || '').toLowerCase().includes(this.currentSearchTerm);
        const itemMatch = ord.items.some((i) => i.productName.toLowerCase().includes(this.currentSearchTerm));
        if (!idMatch && !nameMatch && !phoneMatch && !itemMatch) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3>No orders found</h3>
          <p>No customer orders match the selected status or search query.</p>
          <button class="btn btn-primary" onclick="OrdersModule.openDemoOrderModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            Create Sample Demo Order
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((ord) => this.renderOrderRow(ord)).join('');
  },

  renderOrderRow(ord) {
    const statusBadges = {
      pending: '<span class="status-badge status-pending"><span class="badge-dot"></span>Pending</span>',
      accepted: '<span class="status-badge status-accepted"><span class="badge-dot"></span>Accepted</span>',
      packed: '<span class="status-badge status-packed"><span class="badge-dot"></span>Packed</span>',
      completed: '<span class="status-badge status-completed"><span class="badge-dot"></span>Completed</span>',
      rejected: '<span class="status-badge status-rejected"><span class="badge-dot"></span>Rejected</span>'
    };

    const formattedDate = new Date(ord.createdAt).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsSummary = ord.items
      .map((i) => `<span class="order-item-chip">${i.quantity} ${i.unit} ${i.productName}</span>`)
      .join('');

    return `
      <div class="order-card" id="order-card-${ord.id}">
        <div class="order-card-header">
          <div class="order-id-group">
            <span class="order-id">${ord.id}</span>
            ${ord.isDemo ? '<span class="badge-demo-tag" title="Local Test Order">DEMO ORDER</span>' : '<span class="badge-customer-tag">DIRECT BUYER</span>'}
            ${statusBadges[ord.status] || ord.status}
          </div>
          <span class="order-date-text">${formattedDate}</span>
        </div>

        <div class="order-body">
          <div class="order-customer-info">
            <div class="customer-name-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <strong>${ord.customerName}</strong>
            </div>
            ${ord.customerPhone ? `<div class="customer-contact-text text-muted">${ord.customerPhone}</div>` : ''}
            ${ord.customerAddress ? `<div class="customer-contact-text text-muted" title="${ord.customerAddress}">${ord.customerAddress}</div>` : ''}
          </div>

          <div class="order-items-summary">
            <div class="order-items-label">Produce Ordered:</div>
            <div class="order-chips-wrap">${itemsSummary}</div>
          </div>

          <div class="order-amount-col">
            <div class="amount-label">Order Total</div>
            <div class="amount-val">₹${ord.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div class="order-card-footer">
          <button class="btn btn-secondary btn-sm" onclick="OrdersModule.viewOrderDetails('${ord.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            View Details
          </button>

          <div class="order-action-buttons">
            ${this.renderActionButtonsForStatus(ord)}
          </div>
        </div>
      </div>
    `;
  },

  renderActionButtonsForStatus(ord) {
    if (ord.status === 'pending') {
      return `
        <button class="btn btn-danger btn-sm" onclick="OrdersModule.confirmRejectOrder('${ord.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          Reject
        </button>
        <button class="btn btn-success btn-sm" onclick="OrdersModule.acceptOrder('${ord.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Accept Order
        </button>
      `;
    }

    if (ord.status === 'accepted') {
      return `
        <button class="btn btn-outline-danger btn-sm" onclick="OrdersModule.confirmRejectOrder('${ord.id}')">
          Cancel & Restore Stock
        </button>
        <button class="btn btn-primary btn-sm" onclick="OrdersModule.markAsPacked('${ord.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          Mark as Packed
        </button>
      `;
    }

    if (ord.status === 'packed') {
      return `
        <button class="btn btn-outline-danger btn-sm" onclick="OrdersModule.confirmRejectOrder('${ord.id}')">
          Cancel & Restore Stock
        </button>
        <button class="btn btn-success btn-sm" onclick="OrdersModule.confirmCompleteOrder('${ord.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Mark as Completed
        </button>
      `;
    }

    if (ord.status === 'completed') {
      return `
        <span class="text-success font-semibold flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Payment & Sale Finalized
        </span>
      `;
    }

    if (ord.status === 'rejected') {
      return `
        <span class="text-danger font-semibold">Order Rejected</span>
      `;
    }

    return '';
  },

  async acceptOrder(id) {
    try {
      await FarmDirectDB.updateOrderStatus(id, 'accepted', 'Farmer accepted order; inventory reserved.');
      App.showToast(`Order ${id} accepted! Stock reserved.`, 'success');
      this.refreshAll();
    } catch (err) {
      console.error('Error accepting order:', err);
      App.showToast(err.message, 'error');
    }
  },

  async markAsPacked(id) {
    try {
      await FarmDirectDB.updateOrderStatus(id, 'packed', 'Produce harvested and packed into delivery crates.');
      App.showToast(`Order ${id} marked as Packed!`, 'success');
      this.refreshAll();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  confirmCompleteOrder(id) {
    App.openConfirmModal({
      title: 'Complete Order & Record Sale',
      message: `Confirm completion of Order ${id}? This will record ₹${this.getOrderTotalCached(id)} as final completed sales in your local revenue report.`,
      confirmText: 'Mark Completed',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        try {
          await FarmDirectDB.updateOrderStatus(id, 'completed', 'Customer received produce; payment confirmed.');
          App.showToast(`Order ${id} completed! Added to sales report.`, 'success');
          this.refreshAll();
        } catch (err) {
          App.showToast(err.message, 'error');
        }
      }
    });
  },

  confirmRejectOrder(id) {
    App.openConfirmModal({
      title: 'Reject / Cancel Order',
      message: `Are you sure you want to reject Order ${id}? If stock was previously reserved, it will be automatically restored to your available inventory.`,
      confirmText: 'Reject Order',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          await FarmDirectDB.updateOrderStatus(id, 'rejected', 'Farmer rejected/cancelled order.');
          App.showToast(`Order ${id} rejected. Reserved stock restored.`, 'info');
          this.refreshAll();
        } catch (err) {
          App.showToast(err.message, 'error');
        }
      }
    });
  },

  async getOrderTotalCached(id) {
    const o = await FarmDirectDB.getOrder(id);
    return o ? o.totalAmount.toFixed(2) : '0.00';
  },

  async viewOrderDetails(id) {
    const ord = await FarmDirectDB.getOrder(id);
    if (!ord) {
      App.showToast('Order not found', 'error');
      return;
    }

    const modal = document.getElementById('order-details-modal');
    document.getElementById('modal-order-id').innerText = ord.id;
    document.getElementById('modal-order-date').innerText = new Date(ord.createdAt).toLocaleString('en-IN');
    document.getElementById('modal-order-status').innerText = ord.status.toUpperCase();
    document.getElementById('modal-order-demo-tag').style.display = ord.isDemo ? 'inline-block' : 'none';

    document.getElementById('modal-customer-name').innerText = ord.customerName;
    document.getElementById('modal-customer-phone').innerText = ord.customerPhone || 'Not provided';
    document.getElementById('modal-customer-address').innerText = ord.customerAddress || 'Farm-gate pickup';

    const itemsTbody = document.getElementById('modal-order-items-tbody');
    itemsTbody.innerHTML = ord.items
      .map(
        (i) => `
        <tr>
          <td><strong>${i.productName}</strong></td>
          <td class="text-right">${i.quantity} ${i.unit}</td>
          <td class="text-right">₹${i.unitPrice.toFixed(2)}</td>
          <td class="text-right font-bold">₹${i.subtotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    document.getElementById('modal-order-total-amount').innerText = `₹${ord.totalAmount.toFixed(2)}`;
    document.getElementById('modal-order-notes').innerText = ord.notes || 'No customer special instructions.';

    modal.classList.remove('hidden');
  },

  closeDetailsModal() {
    document.getElementById('order-details-modal').classList.add('hidden');
  },

  // DEMO ORDER GENERATOR
  async openDemoOrderModal() {
    const products = await FarmDirectDB.getProducts();
    const available = products.filter((p) => p.isAvailable && p.quantity > 0);

    const select = document.getElementById('demo-order-product-select');
    if (available.length === 0) {
      select.innerHTML = '<option value="">No in-stock products available</option>';
      document.getElementById('demo-order-btn-submit').disabled = true;
    } else {
      select.innerHTML = available
        .map((p) => `<option value="${p.id}" data-price="${p.price}" data-unit="${p.unit}" data-max="${p.quantity}">
          ${p.name} (Stock: ${p.quantity} ${p.unit} @ ₹${p.price}/${p.unit})
        </option>`)
        .join('');
      document.getElementById('demo-order-btn-submit').disabled = false;
      this.updateDemoOrderSubtotal();
    }

    // Attach change listener for demo product
    select.onchange = () => this.updateDemoOrderSubtotal();
    document.getElementById('demo-order-qty-input').oninput = () => this.updateDemoOrderSubtotal();

    document.getElementById('demo-order-modal').classList.remove('hidden');
  },

  closeDemoOrderModal() {
    document.getElementById('demo-order-modal').classList.add('hidden');
  },

  updateDemoOrderSubtotal() {
    const select = document.getElementById('demo-order-product-select');
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption || !selectedOption.dataset.price) return;

    const price = parseFloat(selectedOption.dataset.price);
    const unit = selectedOption.dataset.unit;
    const qty = parseFloat(document.getElementById('demo-order-qty-input').value) || 1;
    const subtotal = price * qty;

    document.getElementById('demo-order-subtotal-display').innerText = `₹${subtotal.toFixed(2)} (${qty} ${unit} × ₹${price})`;
  },

  async handleCreateDemoOrder(e) {
    e.preventDefault();

    const select = document.getElementById('demo-order-product-select');
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption || !selectedOption.value) {
      App.showToast('Please select an in-stock product', 'warning');
      return;
    }

    const prodId = selectedOption.value;
    const prod = await FarmDirectDB.getProduct(prodId);
    if (!prod) {
      App.showToast('Selected product no longer exists', 'error');
      return;
    }

    const qty = parseFloat(document.getElementById('demo-order-qty-input').value);
    if (isNaN(qty) || qty <= 0) {
      App.showToast('Please specify a positive quantity', 'warning');
      return;
    }

    if (qty > prod.quantity) {
      App.showToast(`Quantity exceeds current stock (${prod.quantity} ${prod.unit} available)`, 'warning');
      return;
    }

    const customerName = document.getElementById('demo-order-customer-name').value.trim() || 'Demo Buyer (Household)';
    const customerPhone = document.getElementById('demo-order-customer-phone').value.trim() || '+91 98400 12345';
    const customerAddress = document.getElementById('demo-order-customer-address').value.trim() || 'Market Road, Pollachi';
    const notes = document.getElementById('demo-order-notes').value.trim() || 'Demo simulation order placed on this device';

    const subtotal = prod.price * qty;

    const newOrder = {
      id: 'ORD-' + Math.floor(6000 + Math.random() * 3999),
      customerName,
      customerPhone,
      customerAddress,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unit: prod.unit,
          unitPrice: prod.price,
          subtotal: subtotal
        }
      ],
      totalAmount: subtotal,
      status: 'pending',
      isDemo: true,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local'
    };

    await FarmDirectDB.saveOrder(newOrder);

    this.closeDemoOrderModal();
    App.showToast(`Demo Order ${newOrder.id} created! You can now accept it to test stock deduction.`, 'success');
    this.refreshAll();
  },

  async quickGenerateRandomDemoOrder() {
    const products = await FarmDirectDB.getProducts();
    const available = products.filter((p) => p.isAvailable && p.quantity > 2);
    if (available.length === 0) {
      App.showToast('No products with available stock to generate order.', 'warning');
      return;
    }

    const sampleCustomers = [
      { name: 'Kavitha Sundaram', phone: '+91 98421 54321', addr: 'Mahalingapuram, Pollachi' },
      { name: 'Dr. Subramaniam', phone: '+91 94433 22110', addr: 'Aliyar Nagar, Pollachi' },
      { name: 'Meenakshi Ammal', phone: '+91 97890 66554', addr: 'Gandhi Road, Anaimalai' },
      { name: 'Green Garden Mess', phone: '+91 99520 88771', addr: 'Bus Stand Circle, Pollachi' }
    ];

    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    // Pick 1 to 2 random products
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const pickedProds = shuffled.slice(0, Math.min(2, shuffled.length));

    const items = [];
    let total = 0;

    for (const p of pickedProds) {
      const orderQty = Math.max(1, Math.min(5, Math.floor(p.quantity / 3) || 1));
      const subtotal = p.price * orderQty;
      total += subtotal;
      items.push({
        productId: p.id,
        productName: p.name,
        quantity: orderQty,
        unit: p.unit,
        unitPrice: p.price,
        subtotal
      });
    }

    const newOrder = {
      id: 'ORD-' + Math.floor(7000 + Math.random() * 2999),
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.addr,
      items,
      totalAmount: total,
      status: 'pending',
      isDemo: true,
      notes: 'Quick-generated local demo order for test workflow verification.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local'
    };

    await FarmDirectDB.saveOrder(newOrder);
    App.showToast(`Generated Demo Order ${newOrder.id} (₹${total.toFixed(2)})!`, 'success');
    this.refreshAll();
  },

  refreshAll() {
    this.renderOrdersList();
    App.renderDashboardOverview();
    if (window.ProductsModule) ProductsModule.renderProductsList();
    if (window.InventoryModule) InventoryModule.render();
    if (window.ReportsModule) ReportsModule.render();
  }
};

window.OrdersModule = OrdersModule;
