/**
 * FarmDirect DB - IndexedDB Data Storage Layer
 * Manages persistent offline storage for Products, Orders, Inventory Logs, and Settings.
 */

const DB_NAME = 'FarmDirectDB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Open and initialize the IndexedDB instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Products Store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('category', 'category', { unique: false });
        productStore.createIndex('name', 'name', { unique: false });
        productStore.createIndex('isAvailable', 'isAvailable', { unique: false });
        productStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        productStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 2. Orders Store
      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
        orderStore.createIndex('status', 'status', { unique: false });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
        orderStore.createIndex('isDemo', 'isDemo', { unique: false });
        orderStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 3. Inventory Logs Store
      if (!db.objectStoreNames.contains('inventory_logs')) {
        const invStore = db.createObjectStore('inventory_logs', { keyPath: 'id' });
        invStore.createIndex('productId', 'productId', { unique: false });
        invStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 4. Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = async (event) => {
      dbInstance = event.target.result;

      // Handle connection close or errors
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
      };

      // Check if initial seeding is needed
      try {
        await checkAndSeedData(dbInstance);
      } catch (err) {
        console.warn('Initial seeding error:', err);
      }

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(new Error(`Failed to open IndexedDB: ${event.target.error?.message || 'Unknown error'}`));
    };

    request.onblocked = () => {
      console.warn('IndexedDB database open blocked by another tab');
    };
  });
}

/**
 * Check if the database is newly created and populate default sample data
 */
async function checkAndSeedData(db) {
  const products = await getAllRecords('products', db);
  if (products.length === 0) {
    console.log('Seeding initial FarmDirect sample data...');
    await loadInitialSampleData(db);
  }
}

/**
 * Initial Sample Data - Pollachi & Coimbatore agricultural context
 */
const INITIAL_PRODUCTS = [
  {
    id: 'prod_tomato_01',
    name: 'Country Tomatoes (நாட்டு தக்காளி)',
    category: 'Vegetables',
    price: 30,
    quantity: 50,
    unit: 'kg',
    minStockThreshold: 15,
    harvestDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Sun-ripened, naturally acidic, hand-picked morning harvest from block A.',
    image: '',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_onion_02',
    name: 'Shallots / Small Onions (சின்ன வெங்காயம்)',
    category: 'Vegetables',
    price: 40,
    quantity: 80,
    unit: 'kg',
    minStockThreshold: 20,
    harvestDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Cured red shallots, dried in thatched shed, high pungency.',
    image: '',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_potato_03',
    name: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)',
    category: 'Tubers',
    price: 25,
    quantity: 60,
    unit: 'kg',
    minStockThreshold: 15,
    harvestDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Firm hill potatoes, zero chemical residue, high starch content.',
    image: '',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_banana_04',
    name: 'Poovan Bananas (பூவன் வாழைப்பழம்)',
    category: 'Fruits',
    price: 50,
    quantity: 25,
    unit: 'dozen',
    minStockThreshold: 5,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Naturally tree-ripened, organic compost fed, sweet and tangy flavor.',
    image: '',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_spinach_05',
    name: 'Palak Greens (பசலைக் கீரை)',
    category: 'Greens',
    price: 20,
    quantity: 30,
    unit: 'bunch',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Crisp green leaves, fresh morning cut with moist root base.',
    image: '',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-5101',
    customerName: 'Kavitha Sundaram',
    customerPhone: '+91 98421 54321',
    customerAddress: '14, Mahalingapuram Main Road, Pollachi',
    items: [
      { productId: 'prod_tomato_01', productName: 'Country Tomatoes (நாட்டு தக்காளி)', quantity: 5, unit: 'kg', unitPrice: 30, subtotal: 150 },
      { productId: 'prod_spinach_05', productName: 'Palak Greens (பசலைக் கீரை)', quantity: 2, unit: 'bunch', unitPrice: 20, subtotal: 40 }
    ],
    totalAmount: 190,
    status: 'pending',
    isDemo: true,
    notes: 'Please pack in eco-friendly newspaper wraps.',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5102',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 94432 98765',
    customerAddress: '8/2B, Aliyar Nagar Colony, Pollachi',
    items: [
      { productId: 'prod_onion_02', productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)', quantity: 10, unit: 'kg', unitPrice: 40, subtotal: 400 },
      { productId: 'prod_potato_03', productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)', quantity: 5, unit: 'kg', unitPrice: 25, subtotal: 125 }
    ],
    totalAmount: 525,
    status: 'accepted',
    isDemo: true,
    notes: 'Call before dispatch.',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5103',
    customerName: 'Green Valley Kitchen',
    customerPhone: '+91 97500 11223',
    customerAddress: 'Commercial Kitchen #4, Bypass Road, Udumalpet',
    items: [
      { productId: 'prod_banana_04', productName: 'Poovan Bananas (பூவன் வாழைப்பழம்)', quantity: 6, unit: 'dozen', unitPrice: 50, subtotal: 300 },
      { productId: 'prod_tomato_01', productName: 'Country Tomatoes (நாட்டு தக்காளி)', quantity: 10, unit: 'kg', unitPrice: 30, subtotal: 300 }
    ],
    totalAmount: 600,
    status: 'packed',
    isDemo: true,
    notes: 'Crate packed and ready for afternoon pickup.',
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5104',
    customerName: 'Anand Bhavan Mess',
    customerPhone: '+91 98940 33445',
    customerAddress: 'Market Road Junction, Pollachi Town',
    items: [
      { productId: 'prod_potato_03', productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)', quantity: 20, unit: 'kg', unitPrice: 25, subtotal: 500 },
      { productId: 'prod_onion_02', productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)', quantity: 20, unit: 'kg', unitPrice: 40, subtotal: 800 }
    ],
    totalAmount: 1300,
    status: 'completed',
    isDemo: true,
    notes: 'Payment settled in cash upon farm-gate delivery.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5105',
    customerName: 'Hotel Vasantham Catering',
    customerPhone: '+91 94860 77889',
    customerAddress: 'Coimbatore Road, Kinathukadavu',
    items: [
      { productId: 'prod_tomato_01', productName: 'Country Tomatoes (நாட்டு தக்காளி)', quantity: 100, unit: 'kg', unitPrice: 30, subtotal: 3000 }
    ],
    totalAmount: 3000,
    status: 'rejected',
    isDemo: true,
    notes: 'Order rejected: Requested quantity exceeds current field harvest availability.',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
    syncStatus: 'local'
  }
];

const INITIAL_INVENTORY_LOGS = [
  {
    id: 'log_seed_1',
    productId: 'prod_tomato_01',
    productName: 'Country Tomatoes (நாட்டு தக்காளி)',
    previousStock: 0,
    newStock: 50,
    delta: +50,
    unit: 'kg',
    reason: 'Initial harvest recording from Block A',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'log_seed_2',
    productId: 'prod_onion_02',
    productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)',
    previousStock: 0,
    newStock: 80,
    delta: +80,
    unit: 'kg',
    reason: 'Shed cured batch intake',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'log_seed_3',
    productId: 'prod_potato_03',
    productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)',
    previousStock: 0,
    newStock: 60,
    delta: +60,
    unit: 'kg',
    reason: 'Harvest crate registration',
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'log_seed_4',
    productId: 'prod_banana_04',
    productName: 'Poovan Bananas (பூவன் வாழைப்பழம்)',
    previousStock: 0,
    newStock: 25,
    delta: +25,
    unit: 'dozen',
    reason: 'Tree-ripened bunches harvest',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'log_seed_5',
    productId: 'prod_spinach_05',
    productName: 'Palak Greens (பசலைக் கீரை)',
    previousStock: 0,
    newStock: 30,
    delta: +30,
    unit: 'bunch',
    reason: 'Fresh morning bed clipping',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'log_seed_6',
    productId: 'prod_onion_02',
    productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)',
    previousStock: 90,
    newStock: 80,
    delta: -10,
    unit: 'kg',
    reason: 'Stock reserved for Order ORD-5102',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  },
  {
    id: 'log_seed_7',
    productId: 'prod_potato_03',
    productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)',
    previousStock: 65,
    newStock: 60,
    delta: -5,
    unit: 'kg',
    reason: 'Stock reserved for Order ORD-5102',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

const INITIAL_SETTINGS = [
  { key: 'farmName', value: 'Thennam Thoppu Natural Farm' },
  { key: 'farmerName', value: 'Murugan Palanisamy' },
  { key: 'location', value: 'Aliyar Road, Pollachi, Tamil Nadu' },
  { key: 'phone', value: '+91 94421 88990' },
  { key: 'currency', value: '₹' },
  { key: 'lowStockAlerts', value: true },
  { key: 'autoReserveStock', value: true },
  { key: 'installedDate', value: new Date().toISOString() }
];

/**
 * Load initial sample dataset into stores
 */
async function loadInitialSampleData(db) {
  const targetDb = db || (await openDB());

  // Products
  for (const prod of INITIAL_PRODUCTS) {
    await putRecord('products', prod, targetDb);
  }

  // Orders
  for (const ord of INITIAL_ORDERS) {
    await putRecord('orders', ord, targetDb);
  }

  // Logs
  for (const log of INITIAL_INVENTORY_LOGS) {
    await putRecord('inventory_logs', log, targetDb);
  }

  // Settings
  for (const set of INITIAL_SETTINGS) {
    await putRecord('settings', set, targetDb);
  }
}

/**
 * Generic IndexedDB Helpers
 */
function getAllRecords(storeName, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function getRecordById(storeName, id, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function putRecord(storeName, record, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(record);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function deleteRecord(storeName, id, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function clearStore(storeName, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Public Data Access API
 */
const DB = {
  open: openDB,

  // Products
  async getProducts() {
    return await getAllRecords('products');
  },

  async getProduct(id) {
    return await getRecordById('products', id);
  },

  async saveProduct(product) {
    if (!product.id) {
      product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      product.createdAt = new Date().toISOString();
    }
    product.updatedAt = new Date().toISOString();
    product.syncStatus = product.syncStatus || 'local';
    await putRecord('products', product);
    return product;
  },

  async deleteProduct(id) {
    return await deleteRecord('products', id);
  },

  // Orders
  async getOrders() {
    const orders = await getAllRecords('orders');
    // Sort descending by creation date
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getOrder(id) {
    return await getRecordById('orders', id);
  },

  async saveOrder(order) {
    if (!order.id) {
      order.id = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      order.createdAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();
    order.syncStatus = order.syncStatus || 'local';
    await putRecord('orders', order);
    return order;
  },

  // Atomic Status Transition with Inventory Adjustments
  async updateOrderStatus(orderId, newStatus, reason = '') {
    const db = await openDB();
    const order = await getRecordById('orders', orderId, db);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const oldStatus = order.status;
    if (oldStatus === newStatus) return order;

    // BUSINESS RULES & STOCK RESERVATION
    // 1. Pending -> Accepted: Check and reserve/deduct stock
    if (oldStatus === 'pending' && newStatus === 'accepted') {
      // Verify all items have enough stock first
      for (const item of order.items) {
        const prod = await getRecordById('products', item.productId, db);
        if (!prod) throw new Error(`Product "${item.productName}" no longer exists in catalogue.`);
        if (prod.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.productName}". Available: ${prod.quantity} ${prod.unit}, Requested: ${item.quantity} ${prod.unit}.`
          );
        }
      }

      // Deduct stock and write inventory logs
      for (const item of order.items) {
        const prod = await getRecordById('products', item.productId, db);
        const prev = prod.quantity;
        prod.quantity = Math.max(0, prod.quantity - item.quantity);
        prod.updatedAt = new Date().toISOString();
        await putRecord('products', prod, db);

        await DB.logInventory({
          productId: prod.id,
          productName: prod.name,
          previousStock: prev,
          newStock: prod.quantity,
          delta: -item.quantity,
          unit: prod.unit,
          reason: `Stock reserved for Order ${order.id}`
        });
      }
    }

    // 2. Accepted / Packed -> Rejected / Cancelled: Restore previously reserved stock
    if ((oldStatus === 'accepted' || oldStatus === 'packed') && newStatus === 'rejected') {
      for (const item of order.items) {
        const prod = await getRecordById('products', item.productId, db);
        if (prod) {
          const prev = prod.quantity;
          prod.quantity = prod.quantity + item.quantity;
          prod.updatedAt = new Date().toISOString();
          await putRecord('products', prod, db);

          await DB.logInventory({
            productId: prod.id,
            productName: prod.name,
            previousStock: prev,
            newStock: prod.quantity,
            delta: +item.quantity,
            unit: prod.unit,
            reason: `Restored stock from rejected Order ${order.id}`
          });
        }
      }
    }

    // Update order status
    order.status = newStatus;
    order.syncStatus = 'pending';
    order.updatedAt = new Date().toISOString();
    if (reason) {
      order.notes = (order.notes ? order.notes + '\n' : '') + `[${new Date().toLocaleTimeString()}] ${reason}`;
    }
    await putRecord('orders', order, db);
    if (window.SyncEngine) SyncEngine.updateSyncUI();
    return order;
  },

  // Inventory Logs
  async getInventoryLogs() {
    const logs = await getAllRecords('inventory_logs');
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async logInventory(log) {
    log.id = log.id || 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    log.timestamp = log.timestamp || new Date().toISOString();
    await putRecord('inventory_logs', log);
    return log;
  },

  // Settings
  async getSetting(key, defaultValue = null) {
    const rec = await getRecordById('settings', key);
    return rec ? rec.value : defaultValue;
  },

  async setSetting(key, value) {
    await putRecord('settings', { key, value });
    return value;
  },

  async getAllSettings() {
    const list = await getAllRecords('settings');
    const settingsObj = {};
    for (const item of list) {
      settingsObj[item.key] = item.value;
    }
    return settingsObj;
  },

  // Complete JSON Export
  async exportAllData() {
    const products = await DB.getProducts();
    const orders = await DB.getOrders();
    const inventoryLogs = await DB.getInventoryLogs();
    const settings = await DB.getAllSettings();

    return {
      version: 1,
      app: 'FarmDirect Farmer',
      exportedAt: new Date().toISOString(),
      data: {
        products,
        orders,
        inventoryLogs,
        settings
      }
    };
  },

  // Complete JSON Import
  async importData(importedPayload) {
    if (!importedPayload || !importedPayload.data) {
      throw new Error('Invalid backup file: Missing root data envelope.');
    }

    const { products, orders, inventoryLogs, settings } = importedPayload.data;
    if (!Array.isArray(products) || !Array.isArray(orders)) {
      throw new Error('Invalid backup schema: products and orders must be arrays.');
    }

    const db = await openDB();

    // Clear existing stores
    await clearStore('products', db);
    await clearStore('orders', db);
    await clearStore('inventory_logs', db);
    await clearStore('settings', db);

    // Import products
    for (const p of products) {
      if (p && p.id && p.name) {
        await putRecord('products', p, db);
      }
    }

    // Import orders
    for (const o of orders) {
      if (o && o.id) {
        await putRecord('orders', o, db);
      }
    }

    // Import logs
    if (Array.isArray(inventoryLogs)) {
      for (const l of inventoryLogs) {
        if (l && l.id) await putRecord('inventory_logs', l, db);
      }
    }

    // Import settings
    if (settings && typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        await putRecord('settings', { key, value }, db);
      }
    }

    return true;
  },

  // Reset to Sample Data
  async resetToSampleData() {
    const db = await openDB();
    await clearStore('products', db);
    await clearStore('orders', db);
    await clearStore('inventory_logs', db);
    await clearStore('settings', db);
    await loadInitialSampleData(db);
    return true;
  },

  // Clear Database Completely
  async clearAllData() {
    const db = await openDB();
    await clearStore('products', db);
    await clearStore('orders', db);
    await clearStore('inventory_logs', db);
    await clearStore('settings', db);
    return true;
  },

  // AUTO-SYNC SUPPORT HELPERS
  async getPendingSyncItems() {
    const products = await DB.getProducts();
    const orders = await DB.getOrders();
    const logs = await DB.getInventoryLogs();

    const pendingProducts = products.filter((p) => p.syncStatus !== 'synced');
    const pendingOrders = orders.filter((o) => o.syncStatus !== 'synced');
    const pendingLogs = logs.filter((l) => l.syncStatus !== 'synced');

    return {
      products: pendingProducts,
      orders: pendingOrders,
      logs: pendingLogs,
      totalPending: pendingProducts.length + pendingOrders.length + pendingLogs.length
    };
  },

  async markItemsSynced(productIds = [], orderIds = [], logIds = [], syncedAt = new Date().toISOString()) {
    const db = await openDB();

    for (const pid of productIds) {
      const p = await getRecordById('products', pid, db);
      if (p) {
        p.syncStatus = 'synced';
        p.lastSyncedAt = syncedAt;
        await putRecord('products', p, db);
      }
    }

    for (const oid of orderIds) {
      const o = await getRecordById('orders', oid, db);
      if (o) {
        o.syncStatus = 'synced';
        o.lastSyncedAt = syncedAt;
        await putRecord('orders', o, db);
      }
    }

    for (const lid of logIds) {
      const l = await getRecordById('inventory_logs', lid, db);
      if (l) {
        l.syncStatus = 'synced';
        await putRecord('inventory_logs', l, db);
      }
    }

    await DB.setSetting('lastSyncedAt', syncedAt);
    return true;
  },

  async insertRemoteOrders(newOrders = []) {
    const db = await openDB();
    let inserted = 0;

    for (const ord of newOrders) {
      const existing = await getRecordById('orders', ord.id, db);
      if (!existing) {
        ord.syncStatus = 'synced';
        await putRecord('orders', ord, db);
        inserted++;
      }
    }
    return inserted;
  },

  // Remove ONLY demo data, preserving real farmer products and orders
  async clearDemoData() {
    const db = await openDB();
    const demoProductIds = new Set(['prod_tomato_01', 'prod_onion_02', 'prod_potato_03', 'prod_banana_04', 'prod_spinach_05']);
    const products = await DB.getProducts();
    let deletedProducts = 0;
    for (const p of products) {
      if (p.isDemo === true || demoProductIds.has(p.id)) {
        await deleteRecord('products', p.id, db);
        deletedProducts++;
      }
    }

    const orders = await DB.getOrders();
    const demoOrderIds = new Set(['ORD-5101', 'ORD-5102', 'ORD-5103', 'ORD-5104']);
    let deletedOrders = 0;
    for (const o of orders) {
      if (o.isDemo === true || demoOrderIds.has(o.id)) {
        await deleteRecord('orders', o.id, db);
        deletedOrders++;
      }
    }

    const logs = await DB.getInventoryLogs();
    for (const l of logs) {
      if (l.id && l.id.startsWith('log_seed_')) {
        await deleteRecord('inventory_logs', l.id, db);
      }
    }

    return { deletedProducts, deletedOrders };
  },

  // Reset application preferences only, without affecting products, orders, or profile
  async resetPreferences() {
    await DB.setSetting('language', 'English');
    await DB.setSetting('dateFormat', 'DD/MM/YYYY');
    await DB.setSetting('currency', '₹');
    await DB.setSetting('lowStockWarning', true);
    await DB.setSetting('confirmBeforeDelete', true);
    await DB.setSetting('notifLowStock', true);
    await DB.setSetting('notifNewOrders', true);
    await DB.setSetting('notifOrderStatus', true);
    return true;
  }
};

window.FarmDirectDB = DB;
