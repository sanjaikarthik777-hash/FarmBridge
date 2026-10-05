import {
  UserProfile,
  Farm,
  Category,
  Product,
  Cart,
  Order,
  DeliveryTask,
  PriceReference,
  DemandInsight,
  AdminOverview,
  Review,
  SendOtpResponse,
  AuthSession,
  SavedAddress,
  NotificationItem,
  WishlistResponse
} from '../types';

const API_BASE = '/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('farmbridge_token');
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('farmbridge_token', token);
  } else {
    localStorage.removeItem('farmbridge_token');
  }
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- AUTH & MOBILE OTP ---
  async sendOtp(mobile: string, role: string, purpose: string = 'login'): Promise<SendOtpResponse> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, role, purpose }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to dispatch OTP');
    }
    return res.json();
  },

  async verifyOtp(mobile: string, otp: string, role: string): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Verification failed');
    }
    const data: AuthSession = await res.json();
    setAuthToken(data.token);
    return data;
  },

  async registerFarmer(data: {
    display_name: string;
    mobile: string;
    otp: string;
    farm_name: string;
    description?: string;
    farm_address: string;
    village?: string;
    district: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    gps_accuracy?: number;
    is_approximate: boolean;
    preferred_language: string;
    pickup_instructions?: string;
  }): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/farmer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Farmer registration failed');
    }
    const session: AuthSession = await res.json();
    setAuthToken(session.token);
    return session;
  },

  async registerConsumer(data: {
    display_name: string;
    mobile: string;
    otp: string;
    delivery_address: string;
    latitude?: number;
    longitude?: number;
    gps_accuracy?: number;
    preferred_language: string;
  }): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/consumer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Consumer registration failed');
    }
    const session: AuthSession = await res.json();
    setAuthToken(session.token);
    return session;
  },

  async syncSupabaseUser(payload: {
    supabase_id: string;
    email?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  }): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/supabase-sync`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to sync consumer profile');
    }
    const session: AuthSession = await res.json();
    setAuthToken(session.token);
    return session;
  },

  async sendEmailOtp(email: string): Promise<any> {
    const res = await fetch(`${API_BASE}/email-otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to send OTP');
    }
    return res.json();
  },

  async verifyEmailOtp(email: string, otp: string, session_token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/email-otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, session_token }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to verify OTP');
    }
    return res.json();
  },

  async checkEmailOtpVerified(session_token: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/email-otp/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.verified;
  },

  /**
   * syncSupabaseFarmer — farmer-specific Supabase session sync.
   * Finds or creates a farmer profile and validates role/verification_status.
   * Kept separate from syncSupabaseUser to enforce consumer/farmer role isolation.
   */
  async syncSupabaseFarmer(payload: {
    supabase_id: string;
    email?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  }): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/auth/supabase-farmer-sync`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to sync farmer profile');
    }
    const session: AuthSession = await res.json();
    setAuthToken(session.token);
    return session;
  },

  async getMe(): Promise<UserProfile> {
    const token = getAuthToken();
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthenticated');
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      setAuthToken(null);
    }
  },

  // --- GEOSPATIAL & FARMS ---
  async getNearbyFarms(
    paramsOrLat: { lat: number; lng: number; radiusKm?: number } | number,
    lng?: number,
    radiusKm?: number
  ): Promise<Farm[]> {
    let lat: number;
    let lon: number;
    let r: number | undefined;

    if (typeof paramsOrLat === 'object') {
      lat = paramsOrLat.lat;
      lon = paramsOrLat.lng;
      r = paramsOrLat.radiusKm;
    } else {
      lat = paramsOrLat;
      lon = lng!;
      r = radiusKm;
    }

    let url = `${API_BASE}/farms/nearby?lat=${lat}&lng=${lon}`;
    if (r !== undefined && r !== null) {
      url += `&radius_km=${r}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to discover nearby farms');
    return res.json();
  },

  async getFarms(lat?: number, lng?: number): Promise<Farm[]> {
    let url = `${API_BASE}/farms`;
    if (lat !== undefined && lng !== undefined) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getMyFarm(): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms/my-farm`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to retrieve farm details');
    return res.json();
  },

  async updateFarmLocation(farmId: string, data: {
    latitude: number;
    longitude: number;
    gps_accuracy?: number;
    is_approximate: boolean;
    farm_address?: string;
    village?: string;
    district?: string;
    pincode?: string;
  }): Promise<Farm> {
    const res = await fetch(`${API_BASE}/farms/${farmId}/location`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update farm location');
    }
    return res.json();
  },

  // --- CATEGORIES & PRODUCTS ---
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
    return res.json();
  },

  async getNearbyProducts(params: {
    lat: number;
    lng: number;
    radius_km?: number;
    category_id?: string;
    q?: string;
    max_price?: number;
    fulfilment?: string;
  }): Promise<Product[]> {
    const q = new URLSearchParams();
    q.append('lat', params.lat.toString());
    q.append('lng', params.lng.toString());
    if (params.radius_km !== undefined) q.append('radius_km', params.radius_km.toString());
    if (params.category_id) q.append('category_id', params.category_id);
    if (params.q) q.append('q', params.q);
    if (params.max_price !== undefined) q.append('max_price', params.max_price.toString());
    if (params.fulfilment) q.append('fulfilment', params.fulfilment);

    const res = await fetch(`${API_BASE}/products/nearby?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load nearby produce');
    return res.json();
  },

  async getProducts(params?: { category_id?: string; q?: string; farmer_id?: string; farm_id?: string; status?: string; lat?: number; lng?: number }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', params.category_id);
    if (params?.q) query.append('q', params.q);
    if (params?.farmer_id) query.append('farmer_id', params.farmer_id);
    if (params?.farm_id) query.append('farm_id', params.farm_id);
    if (params?.status) query.append('status', params.status);
    if (params?.lat !== undefined) query.append('lat', params.lat.toString());
    if (params?.lng !== undefined) query.append('lng', params.lng.toString());

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to list product');
    }
    return res.json();
  },

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update produce');
    }
    return res.json();
  },

  async deleteProduct(productId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete produce listing');
  },

  async pauseProduct(productId: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${productId}/pause`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async markSoldOut(productId: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${productId}/mark-sold-out`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- CART ---
  async getCart(): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart`, { headers: getHeaders() });
    return res.json();
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to add to basket');
    }
    return res.json();
  },

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/items/${itemId}?quantity=${quantity}`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update item');
    }
    return res.json();
  },

  async removeCartItem(itemId: string): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async clearCart(): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (!getAuthToken()) return [];
    const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createOrder(data: {
    fulfilment_type: 'pickup' | 'delivery';
    delivery_area: string;
    delivery_address: string;
    delivery_contact_phone: string;
    delivery_slot: string;
    payment_method: string;
    consumer_latitude?: number;
    consumer_longitude?: number;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to place order');
    }
    return res.json();
  },

  async acceptOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/accept`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async rejectOrder(orderId: string, reason?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/reject?reason=${encodeURIComponent(reason || '')}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string, reason?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    return res.json();
  },

  // --- REVIEWS ---
  async getReviews(): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews`, { headers: getHeaders() });
    return res.json();
  },

  async submitReview(data: { order_id: string; rating: number; review_text: string }): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to submit review');
    }
    return res.json();
  },

  // --- DELIVERY LOGISTICS ---
  async getDeliveryTasks(): Promise<DeliveryTask[]> {
    const res = await fetch(`${API_BASE}/delivery/tasks`, { headers: getHeaders() });
    return res.json();
  },

  async updateDeliveryStatus(taskId: string, status: string): Promise<DeliveryTask> {
    const res = await fetch(`${API_BASE}/delivery/tasks/${taskId}/status?status=${status}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- AI & INSIGHTS ---
  async getPriceReferences(): Promise<PriceReference[]> {
    const res = await fetch(`${API_BASE}/insights/price-reference`, { headers: getHeaders() });
    return res.json();
  },

  async getPriceEstimate(data: { crop_name: string; quantity: number; unit: string; farmer_price: number }) {
    const res = await fetch(`${API_BASE}/insights/price-estimate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getDemandInsights(): Promise<DemandInsight[]> {
    const res = await fetch(`${API_BASE}/insights/demand`, { headers: getHeaders() });
    return res.json();
  },

  async getRouteGrouping(): Promise<any> {
    const res = await fetch(`${API_BASE}/insights/route-grouping`, { headers: getHeaders() });
    return res.json();
  },

  // --- ADMIN ---
  async getAdminOverview(): Promise<AdminOverview> {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getHeaders() });
    return res.json();
  },

  async getVerificationQueue(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/admin/verifications`, { headers: getHeaders() });
    return res.json();
  },

  async updateVerificationDecision(profileId: string, status: string, note?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/admin/verifications/${profileId}/decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() });
    return res.json();
  },

  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- CONSUMER SPECIFIC ---
  async getSavedAddresses(): Promise<SavedAddress[]> {
    if (!getAuthToken()) return [];
    const res = await fetch(`${API_BASE}/consumer/addresses`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async addSavedAddress(data: Partial<SavedAddress>): Promise<SavedAddress> {
    const res = await fetch(`${API_BASE}/consumer/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save address');
    return res.json();
  },

  async setDefaultAddress(addressId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/consumer/addresses/${addressId}/default`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return res.json();
  },

  async deleteSavedAddress(addressId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/consumer/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getWishlist(): Promise<WishlistResponse> {
    const res = await fetch(`${API_BASE}/consumer/wishlist`, { headers: getHeaders() });
    if (!res.ok) return { product_ids: [], products: [] };
    return res.json();
  },

  async addToWishlist(productId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/consumer/wishlist/${productId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async removeFromWishlist(productId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/consumer/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/consumer/notifications`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationsRead(): Promise<any> {
    const res = await fetch(`${API_BASE}/consumer/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },
};

