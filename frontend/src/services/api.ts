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
import { supabase } from '../utils/supabase/client';

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
    let { data: profile } = await supabase.from('profiles').select('*').eq('supabase_auth_id', payload.supabase_id).single();
    if (!profile) {
      const { data: newProfile, error } = await supabase.from('profiles').insert({
        supabase_auth_id: payload.supabase_id,
        email: payload.email,
        display_name: payload.display_name || 'Consumer',
        avatar_path: payload.avatar_url,
        role: 'consumer',
        verification_status: 'verified'
      }).select().single();
      if (error) throw new Error('Failed to create consumer profile: ' + error.message);
      profile = newProfile;
    }
    
    setAuthToken('supabase-auth-token');
    return { token: 'supabase-auth-token', profile: profile as any };
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

  async syncSupabaseFarmer(payload: {
    supabase_id: string;
    email?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  }): Promise<AuthSession> {
    let { data: profile } = await supabase.from('profiles').select('*').eq('supabase_auth_id', payload.supabase_id).maybeSingle();
    if (!profile) {
      const { data: newProfile, error } = await supabase.from('profiles').insert({
        supabase_auth_id: payload.supabase_id,
        email: payload.email,
        display_name: payload.display_name || 'Farmer',
        avatar_path: payload.avatar_url,
        role: 'farmer',
        verification_status: 'verified',
        onboarding_completed: false
      }).select().maybeSingle();
      if (error) throw new Error('Failed to create farmer profile: ' + error.message);
      profile = newProfile;
    }
    
    // Set dummy token for backend compatibility if needed
    setAuthToken('supabase-auth-token');
    
    let { data: farm } = await supabase.from('farms').select('*').eq('owner_id', profile.id).maybeSingle();
    
    return { token: 'supabase-auth-token', profile: profile as any, farm: farm as any };
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Unauthenticated');
    const { data: profile } = await supabase.from('profiles').select('id').eq('supabase_auth_id', session.user.id).single();
    if (!profile) throw new Error('Profile not found');
    const { data: farm, error } = await supabase.from('farms').select('*').eq('owner_id', profile.id).single();
    if (error) throw new Error('Failed to retrieve farm details');
    return farm as any;
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
    let query = supabase.from('products').select('*');
    if (params?.farmer_id === 'me') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('supabase_auth_id', session.user.id).single();
        if (profile) {
          query = query.eq('farmer_id', profile.id);
        } else {
          return [];
        }
      } else {
        return [];
      }
    } else if (params?.farmer_id) {
      query = query.eq('farmer_id', params.farmer_id);
    }
    if (params?.category_id) query = query.eq('category_id', params.category_id);
    if (params?.farm_id) query = query.eq('farm_id', params.farm_id);
    if (params?.status) query = query.eq('status', params.status);
    if (params?.q) query = query.ilike('name', `%${params.q}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    let farmerId = data.farmer_id;
    let farmId = data.farm_id;
    if (!farmerId || !farmId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('supabase_auth_id', session.user.id).single();
        if (profile) {
          farmerId = farmerId || profile.id;
          const { data: farm } = await supabase.from('farms').select('id').eq('owner_id', profile.id).single();
          if (farm) farmId = farmId || farm.id;
        }
      }
    }
    const productPayload = {
      ...data,
      farmer_id: farmerId,
      farm_id: farmId,
      status: data.status || 'active',
    };
    const { data: newProduct, error } = await supabase.from('products').insert(productPayload).select().single();
    if (error) throw new Error(error.message);
    return newProduct as any;
  },

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    const { data: updated, error } = await supabase.from('products').update(data).eq('id', productId).select().single();
    if (error) throw new Error(error.message);
    return updated as any;
  },

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
  },

  async pauseProduct(productId: string): Promise<Product> {
    const { data, error } = await supabase.from('products').update({ status: 'paused' }).eq('id', productId).select().single();
    if (error) throw error;
    return data as any;
  },

  async markSoldOut(productId: string): Promise<Product> {
    const { data, error } = await supabase.from('products').update({ status: 'sold_out', available_quantity: 0 }).eq('id', productId).select().single();
    if (error) throw error;
    return data as any;
  },

  async resumeProduct(productId: string, quantity?: number): Promise<Product> {
    const updateData: any = { status: 'active' };
    if (quantity !== undefined) updateData.available_quantity = quantity;
    const { data, error } = await supabase.from('products').update(updateData).eq('id', productId).select().single();
    if (error) throw error;
    return data as any;
  },

  // --- CART ---
  async getCart(): Promise<Cart> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { items: [], subtotal: 0, delivery_fee: 0, platform_fee: 0, total: 0 };
    const { data: profile } = await supabase.from('profiles').select('id').eq('supabase_auth_id', session.user.id).single();
    if (!profile) return { items: [], subtotal: 0, delivery_fee: 0, platform_fee: 0, total: 0 };
    
    let { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', profile.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from('carts').insert({ buyer_id: profile.id }).select().single();
      cart = newCart;
    }
    
    if (!cart) return { items: [], subtotal: 0, delivery_fee: 0, platform_fee: 0, total: 0 };

    const { data: items } = await supabase.from('cart_items').select('*, product:products(*)').eq('cart_id', cart.id);
    
    let subtotal = 0;
    const formattedItems = (items || []).map(item => {
      const p = item.product || {};
      const line_total = item.quantity * (p.price || 0);
      subtotal += line_total;
      return {
        id: item.id,
        product_id: item.product_id,
        product_name: p.name || 'Unknown',
        unit: p.unit || 'kg',
        unit_price: p.price || 0,
        quantity: item.quantity,
        line_total,
        available_stock: p.available_quantity || 0,
        farmer_id: p.farmer_id || '',
        farm_name: p.farm_name || '',
        image_url: p.image_paths?.[0] || null
      };
    });
    
    return {
      items: formattedItems,
      subtotal,
      delivery_fee: formattedItems.length ? 40 : 0,
      platform_fee: formattedItems.length ? 15 : 0,
      total: subtotal + (formattedItems.length ? 55 : 0)
    };
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = await supabase.from('profiles').select('id').eq('supabase_auth_id', session?.user?.id).single();
    if (!profile) throw new Error('Profile not found');
    let { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', profile.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from('carts').insert({ buyer_id: profile.id }).select().single();
      cart = newCart;
    }
    
    if (!cart) throw new Error('Could not create cart');

    const { data: existing } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id).eq('product_id', productId).single();
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: productId, quantity });
    }
    return this.getCart();
  },

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    return this.getCart();
  },

  async removeCartItem(itemId: string): Promise<Cart> {
    await supabase.from('cart_items').delete().eq('id', itemId);
    return this.getCart();
  },

  async clearCart(): Promise<Cart> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = await supabase.from('profiles').select('id').eq('supabase_auth_id', session?.user?.id).single();
    if (profile) {
      const { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', profile.id).single();
      if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      }
    }
    return this.getCart();
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('supabase_auth_id', session.user.id).single();
    if (!profile) return [];
    
    let query = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
    if (profile.role === 'farmer') {
      query = query.eq('farmer_id', profile.id);
    } else {
      query = query.eq('buyer_id', profile.id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as any;
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
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = await supabase.from('profiles').select('id, display_name').eq('supabase_auth_id', session?.user?.id).single();
    
    const cart = await this.getCart();
    if (!cart.items.length) throw new Error("Cart is empty");
    
    const farmerId = cart.items[0].farmer_id;
    const { data: farm } = await supabase.from('farms').select('id, farm_name').eq('owner_id', farmerId).single();
    
    const { data: order, error } = await supabase.from('orders').insert({
      order_number: 'FB-' + Math.floor(1000 + Math.random() * 9000),
      buyer_id: profile?.id,
      farmer_id: farmerId,
      farm_id: farm?.id,
      status: 'pending_farmer_confirmation',
      fulfilment_type: data.fulfilment_type,
      delivery_area: data.delivery_area,
      delivery_address: data.delivery_address,
      delivery_contact_phone: data.delivery_contact_phone,
      delivery_slot: data.delivery_slot,
      subtotal: cart.subtotal,
      delivery_fee: cart.delivery_fee,
      platform_fee: cart.platform_fee,
      total_amount: cart.total,
      payment_status: 'simulated_pending'
    }).select().single();
    
    if (error) throw new Error(error.message);
    
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name_snapshot: item.product_name,
      unit_snapshot: item.unit,
      unit_price_snapshot: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total
    }));
    await supabase.from('order_items').insert(orderItems);
    
    await this.clearCart();
    return order as any;
  },

  async acceptOrder(orderId: string): Promise<Order> {
    const { data, error } = await supabase.from('orders').update({ status: 'accepted' }).eq('id', orderId).select().single();
    if (error) throw new Error(error.message);
    return data as any;
  },

  async rejectOrder(orderId: string, reason?: string): Promise<Order> {
    const { data, error } = await supabase.from('orders').update({ status: 'rejected', rejection_reason: reason }).eq('id', orderId).select().single();
    if (error) throw new Error(error.message);
    return data as any;
  },

  async updateOrderStatus(orderId: string, status: string, reason?: string): Promise<Order> {
    const { data, error } = await supabase.from('orders').update({ status, rejection_reason: reason }).eq('id', orderId).select().single();
    if (error) throw new Error(error.message);
    return data as any;
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

