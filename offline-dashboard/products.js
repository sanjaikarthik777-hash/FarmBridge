/**
 * FarmDirect Products Module
 * Handles Product catalog rendering, search, category filtering, add/edit modal,
 * and image file reader conversion.
 */

const ProductsModule = {
  currentFilterCategory: 'all',
  currentFilterStock: 'all',
  currentSearchTerm: '',
  editingProductId: null,

  // Fallback crop icons (inline SVG data URLs or SVGs)
  categoryIcons: {
    'Vegetables': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>`,
    'Fruits': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v3"/><path d="M15 4c-1 1-3 1-3 1"/></svg>`,
    'Tubers': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c0 4 4 7 8 7s8-3 8-7c0-5-4-10-8-10S4 9 4 14z"/></svg>`,
    'Greens': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    'Grains': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 12 2l10 20H2z"/></svg>`,
    'Dairy': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8v3H8z"/><path d="M6 5h12v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/><path d="M6 10h12"/></svg>`,
    'Other': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchTerm = e.target.value.trim().toLowerCase();
        this.renderProductsList();
      });
    }

    // Category filter buttons or dropdown
    const catSelect = document.getElementById('product-category-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.currentFilterCategory = e.target.value;
        this.renderProductsList();
      });
    }

    // Stock status filter
    const stockSelect = document.getElementById('product-stock-filter');
    if (stockSelect) {
      stockSelect.addEventListener('change', (e) => {
        this.currentFilterStock = e.target.value;
        this.renderProductsList();
      });
    }

    // Product Modal Form Submit
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleProductFormSubmit(e));
    }

    // Image file upload preview
    const imageInput = document.getElementById('product-image-file');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    // Remove uploaded image button
    const removeImgBtn = document.getElementById('btn-remove-image');
    if (removeImgBtn) {
      removeImgBtn.addEventListener('click', () => {
        document.getElementById('product-image-preview').src = '';
        document.getElementById('product-image-preview-wrap').classList.add('hidden');
        document.getElementById('product-image-data').value = '';
        imageInput.value = '';
      });
    }
  },

  async handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      App.showToast('Please select an image file (PNG, JPG, WebP)', 'warning');
      return;
    }

    // Limit image size to 2MB to keep IndexedDB snappy
    if (file.size > 2 * 1024 * 1024) {
      App.showToast('Image file too large. Please select an image under 2MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      document.getElementById('product-image-preview').src = dataUrl;
      document.getElementById('product-image-preview-wrap').classList.remove('hidden');
      document.getElementById('product-image-data').value = dataUrl;
    };
    reader.onerror = () => {
      App.showToast('Failed to load image preview', 'error');
    };
    reader.readAsDataURL(file);
  },

  async renderProductsList() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const products = await FarmDirectDB.getProducts();

    const filtered = products.filter((p) => {
      // Category filter
      if (this.currentFilterCategory !== 'all' && p.category !== this.currentFilterCategory) {
        return false;
      }

      // Stock status filter
      if (this.currentFilterStock === 'in_stock' && p.quantity <= (p.minStockThreshold || 0)) return false;
      if (this.currentFilterStock === 'low_stock') {
        const isLow = p.quantity > 0 && p.quantity <= (p.minStockThreshold || 10);
        if (!isLow) return false;
      }
      if (this.currentFilterStock === 'out_of_stock' && p.quantity > 0) return false;
      if (this.currentFilterStock === 'unavailable' && p.isAvailable) return false;

      // Search term
      if (this.currentSearchTerm) {
        const matchName = p.name.toLowerCase().includes(this.currentSearchTerm);
        const matchCat = p.category.toLowerCase().includes(this.currentSearchTerm);
        const matchNotes = (p.notes || '').toLowerCase().includes(this.currentSearchTerm);
        if (!matchName && !matchCat && !matchNotes) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m11 8-3 3 3 3"/></svg>
          </div>
          <h3>No products found</h3>
          <p>No agricultural products match your active search or filters.</p>
          <button class="btn btn-primary" onclick="ProductsModule.openAddProductModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            Add New Product
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((prod) => this.renderProductCard(prod)).join('');
  },

  renderProductCard(prod) {
    const isOut = prod.quantity <= 0;
    const isLow = !isOut && prod.quantity <= (prod.minStockThreshold || 10);
    const isUnavail = !prod.isAvailable;

    let stockBadgeClass = 'badge-in-stock';
    let stockBadgeText = 'In Stock';

    if (isUnavail) {
      stockBadgeClass = 'badge-unavailable';
      stockBadgeText = 'Unavailable';
    } else if (isOut) {
      stockBadgeClass = 'badge-out-stock';
      stockBadgeText = 'Out of Stock';
    } else if (isLow) {
      stockBadgeClass = 'badge-low-stock';
      stockBadgeText = `Low Stock (${prod.quantity} ${prod.unit} left)`;
    }

    const hasImage = prod.image && prod.image.length > 20;
    const imageHtml = hasImage
      ? `<img src="${prod.image}" alt="${prod.name}" class="product-thumb-img" onerror="this.style.display='none'" />`
      : `<div class="product-thumb-placeholder">${this.categoryIcons[prod.category] || this.categoryIcons['Other']}</div>`;

    return `
      <div class="product-card ${isUnavail ? 'card-dimmed' : ''}">
        <div class="product-card-top">
          <div class="product-thumb">
            ${imageHtml}
          </div>
          <div class="product-card-header">
            <div class="product-category-tag">${prod.category}</div>
            <h3 class="product-title" title="${prod.name}">${prod.name}</h3>
            <div class="product-stock-badge ${stockBadgeClass}">
              <span class="badge-dot"></span>
              ${stockBadgeText}
            </div>
          </div>
        </div>

        <div class="product-card-details">
          <div class="detail-row">
            <span class="detail-label">Price per ${prod.unit}:</span>
            <span class="detail-value text-price">₹${prod.price.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Available Field Stock:</span>
            <span class="detail-value font-bold ${isOut ? 'text-danger' : isLow ? 'text-amber' : 'text-success'}">
              ${prod.quantity} ${prod.unit}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Min Alert Threshold:</span>
            <span class="detail-value text-muted">${prod.minStockThreshold || 10} ${prod.unit}</span>
          </div>
          ${prod.harvestDate ? `
            <div class="detail-row">
              <span class="detail-label">Harvest Date:</span>
              <span class="detail-value text-muted">${prod.harvestDate}</span>
            </div>
          ` : ''}
          ${prod.notes ? `
            <p class="product-card-notes">${prod.notes}</p>
          ` : ''}
        </div>

        <div class="product-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="ProductsModule.openEditProductModal('${prod.id}')" title="Edit Product">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            Edit
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="ProductsModule.confirmDeleteProduct('${prod.id}', '${encodeURIComponent(prod.name)}')" title="Delete Product">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Delete
          </button>
        </div>
      </div>
    `;
  },

  openAddProductModal() {
    this.editingProductId = null;
    document.getElementById('product-modal-title').innerText = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id-hidden').value = '';
    document.getElementById('product-image-preview').src = '';
    document.getElementById('product-image-preview-wrap').classList.add('hidden');
    document.getElementById('product-image-data').value = '';
    document.getElementById('product-available-toggle').checked = true;
    document.getElementById('product-modal').classList.remove('hidden');
  },

  async openEditProductModal(id) {
    const prod = await FarmDirectDB.getProduct(id);
    if (!prod) {
      App.showToast('Product not found', 'error');
      return;
    }

    this.editingProductId = id;
    document.getElementById('product-modal-title').innerText = 'Edit Product Details';
    document.getElementById('product-id-hidden').value = prod.id;
    document.getElementById('product-name-input').value = prod.name;
    document.getElementById('product-category-input').value = prod.category;
    document.getElementById('product-price-input').value = prod.price;
    document.getElementById('product-qty-input').value = prod.quantity;
    document.getElementById('product-unit-input').value = prod.unit;
    document.getElementById('product-min-threshold-input').value = prod.minStockThreshold || 10;
    document.getElementById('product-harvest-date-input').value = prod.harvestDate || '';
    document.getElementById('product-notes-input').value = prod.notes || '';
    document.getElementById('product-available-toggle').checked = prod.isAvailable !== false;

    if (prod.image) {
      document.getElementById('product-image-preview').src = prod.image;
      document.getElementById('product-image-preview-wrap').classList.remove('hidden');
      document.getElementById('product-image-data').value = prod.image;
    } else {
      document.getElementById('product-image-preview').src = '';
      document.getElementById('product-image-preview-wrap').classList.add('hidden');
      document.getElementById('product-image-data').value = '';
    }

    document.getElementById('product-modal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    this.editingProductId = null;
  },

  async handleProductFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('product-id-hidden').value;
    const name = document.getElementById('product-name-input').value.trim();
    const category = document.getElementById('product-category-input').value;
    const price = parseFloat(document.getElementById('product-price-input').value);
    const quantity = parseFloat(document.getElementById('product-qty-input').value);
    const unit = document.getElementById('product-unit-input').value;
    const minThreshold = parseFloat(document.getElementById('product-min-threshold-input').value) || 10;
    const harvestDate = document.getElementById('product-harvest-date-input').value;
    const notes = document.getElementById('product-notes-input').value.trim();
    const isAvailable = document.getElementById('product-available-toggle').checked;
    const image = document.getElementById('product-image-data').value;

    // Strict Validations
    if (!name) {
      App.showToast('Product name cannot be empty', 'warning');
      return;
    }
    if (isNaN(price) || price < 0) {
      App.showToast('Please enter a valid price (₹0 or greater)', 'warning');
      return;
    }
    if (isNaN(quantity) || quantity < 0) {
      App.showToast('Please enter a valid quantity (0 or greater)', 'warning');
      return;
    }
    if (minThreshold < 0) {
      App.showToast('Min alert threshold must be 0 or greater', 'warning');
      return;
    }

    try {
      const isNew = !id;
      let existing = null;
      if (!isNew) {
        existing = await FarmDirectDB.getProduct(id);
      }

      const productPayload = {
        id: id || undefined,
        name,
        category,
        price,
        quantity,
        unit,
        minStockThreshold: minThreshold,
        harvestDate: harvestDate || null,
        notes,
        image: image || (existing ? existing.image : ''),
        isAvailable,
        syncStatus: 'local',
        createdAt: existing ? existing.createdAt : undefined
      };

      const saved = await FarmDirectDB.saveProduct(productPayload);

      // Log stock adjustment if stock quantity was manually modified during edit
      if (existing && existing.quantity !== quantity) {
        const delta = quantity - existing.quantity;
        await FarmDirectDB.logInventory({
          productId: saved.id,
          productName: saved.name,
          previousStock: existing.quantity,
          newStock: quantity,
          delta: delta,
          unit: unit,
          reason: `Manual inventory update via edit form (${delta > 0 ? '+' : ''}${delta} ${unit})`
        });
      } else if (isNew) {
        await FarmDirectDB.logInventory({
          productId: saved.id,
          productName: saved.name,
          previousStock: 0,
          newStock: quantity,
          delta: quantity,
          unit: unit,
          reason: `Initial stock registration for new product`
        });
      }

      this.closeModal();
      App.showToast(isNew ? `Product "${saved.name}" added successfully` : `Product "${saved.name}" updated`, 'success');

      // Refresh views
      this.renderProductsList();
      App.renderDashboardOverview();
      if (window.InventoryModule) InventoryModule.render();
      if (window.ReportsModule) ReportsModule.render();
    } catch (err) {
      console.error('Error saving product:', err);
      App.showToast('Failed to save product: ' + err.message, 'error');
    }
  },

  async confirmDeleteProduct(id, encodedName) {
    const name = decodeURIComponent(encodedName);
    const requireConfirm = await FarmDirectDB.getSetting('confirmBeforeDelete', true);

    if (!requireConfirm) {
      try {
        await FarmDirectDB.deleteProduct(id);
        App.showToast(`Product "${name}" deleted`, 'success');
        this.renderProductsList();
        App.renderDashboardOverview();
        if (window.InventoryModule) InventoryModule.render();
        if (window.ReportsModule) ReportsModule.render();
      } catch (err) {
        App.showToast('Failed to delete product: ' + err.message, 'error');
      }
      return;
    }

    App.openConfirmModal({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${name}" from your catalogue? This action cannot be undone.`,
      confirmText: 'Delete Product',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        try {
          await FarmDirectDB.deleteProduct(id);
          App.showToast(`Product "${name}" deleted`, 'success');
          this.renderProductsList();
          App.renderDashboardOverview();
          if (window.InventoryModule) InventoryModule.render();
          if (window.ReportsModule) ReportsModule.render();
        } catch (err) {
          App.showToast('Failed to delete product: ' + err.message, 'error');
        }
      }
    });
  }
};

window.ProductsModule = ProductsModule;
