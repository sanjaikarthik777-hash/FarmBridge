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

// Stores Supabase UID so FastAPI can identify Google OAuth users via x-user-id
export const setSupabaseUserId = (uid: string | null) => {
  if (uid) localStorage.setItem('farmbridge_supabase_uid', uid);
  else localStorage.removeItem('farmbridge_supabase_uid');
};

export const getSupabaseUserId = (): string | null => {
  return localStorage.getItem('farmbridge_supabase_uid');
};

const getHeaders = () => {
  const token = getAuthToken();
  const supabaseUid = getSupabaseUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Send Supabase UID as x-user-id so FastAPI demo store can identify the user
  if (supabaseUid) {
    headers['X-User-Id'] = supabaseUid;
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
    // Store Supabase UID for x-user-id header on FastAPI requests
    setSupabaseUserId(payload.supabase_id);

    // Upsert profile in Supabase DB
    let { data: profile } = await supabase.from('profiles').select('*').eq('supabase_auth_id', payload.supabase_id).maybeSingle();
    if (!profile) {
      const { data: newProfile, error } = await supabase.from('profiles').insert({
        supabase_auth_id: payload.supabase_id,
        email: payload.email,
        display_name: payload.display_name || 'Consumer',
        avatar_path: payload.avatar_url,
        role: 'consumer',
        verification_status: 'verified'
      }).select().maybeSingle();
      if (error) console.warn('Supabase consumer profile notice:', error.message);
      profile = newProfile;
    }

    // Sync to FastAPI backend so it knows about this consumer
    let token = payload.supabase_id;
    try {
      const res = await fetch(`${API_BASE}/auth/supabase-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, profile_id: profile?.id }),
      });
      if (res.ok) {
        const synced = await res.json();
        if (synced.token) token = synced.token;
      }
    } catch {}

    setAuthToken(token);
    return { token, profile: profile as any };
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
    setSupabaseUserId(payload.supabase_id);

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
      if (error) console.warn('Supabase farmer profile notice:', error.message);
      profile = newProfile;
    }

    if (profile && profile.role !== 'farmer') {
      try {
        await supabase.from('profiles').update({ role: 'farmer', onboarding_completed: false }).eq('id', profile.id);
      } catch {}
      profile.role = 'farmer';
      profile.onboarding_completed = false;
    }

    if (!profile) {
      profile = {
        id: payload.supabase_id,
        supabase_auth_id: payload.supabase_id,
        email: payload.email,
        display_name: payload.display_name || 'Farmer',
        avatar_path: payload.avatar_url,
        role: 'farmer',
        verification_status: 'verified',
        onboarding_completed: false
      } as any;
    }

    if (profile.onboarding_completed === undefined || profile.onboarding_completed === null) {
      profile.onboarding_completed = false;
    }

    let { data: farm } = await supabase.from('farms').select('*').eq('owner_id', profile?.id).maybeSingle();

    // Sync to FastAPI backend so it knows about this farmer
    let token = payload.supabase_id;
    try {
      const res = await fetch(`${API_BASE}/auth/supabase-farmer-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, profile_id: profile?.id }),
      });
      if (res.ok) {
        const synced = await res.json();
        if (synced.token) token = synced.token;
      }
    } catch {}

    setAuthToken(token);
    return { token, profile: profile as any, farm: farm as any };
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

  // --- CART (LocalStorage instant responsive with Supabase and backend sync) ---
  async getCart(): Promise<Cart> {
    try {
      const raw = localStorage.getItem('farmbridge_cart');
      if (!raw) return { items: [], subtotal: 0, delivery_fee: 0, platform_fee: 0, total: 0 };
      const cart: Cart = JSON.parse(raw);
      return cart;
    } catch {
      return { items: [], subtotal: 0, delivery_fee: 0, platform_fee: 0, total: 0 };
    }
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const PRODUCT_ID_MAP: Record<string, string> = {
      p1: '11111111-1111-1111-1111-111111111111',
      p2: '22222222-2222-2222-2222-222222222222',
      p3: '33333333-3333-3333-3333-333333333333',
      p4: '44444444-4444-4444-4444-444444444444',
      p5: '55555555-5555-5555-5555-555555555555',
    };
    const realId = PRODUCT_ID_MAP[productId] || productId;

    // Look up product details from Supabase or fallback
    let prod: any = null;
    try {
      const { data: supaProd } = await supabase
        .from('products')
        .select('*, farm:farms(farm_name), farmer:profiles(display_name)')
        .eq('id', realId)
        .maybeSingle();

      if (supaProd) {
        prod = {
          id: supaProd.id,
          name: supaProd.name,
          price: Number(supaProd.price),
          unit: supaProd.unit,
          available_quantity: Number(supaProd.available_quantity),
          image_url: supaProd.image_paths?.[0] || null,
          farmer_id: supaProd.farmer_id,
          farm_id: supaProd.farm_id,
          farm_name: supaProd.farm?.farm_name || 'Thennam Thoppu Natural Farm',
          farmer_name: supaProd.farmer?.display_name || 'Murugan Palanisamy'
        };
      }
    } catch {}

    if (!prod) {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const list = await res.json();
          const match = list.find((p: any) => p.id === productId || p.id === realId);
          if (match) {
            prod = {
              id: realId,
              name: match.name,
              price: Number(match.price),
              unit: match.unit,
              available_quantity: Number(match.available_quantity),
              image_url: match.image_paths?.[0] || null,
              farmer_id: match.farmer_id || 'f1000000-0000-0000-0000-000000000001',
              farm_id: match.farm_id || 'fa111111-1111-1111-1111-111111111111',
              farm_name: match.farm_name || 'Thennam Thoppu Natural Farm',
              farmer_name: match.farmer_name || 'Murugan Palanisamy'
            };
          }
        }
      } catch {}
    }

    if (!prod) {
      prod = {
        id: realId,
        name: 'Country Tomatoes (நாட்டு தக்காளி)',
        price: 32.0,
        unit: 'kg',
        available_quantity: 75.0,
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
        farmer_id: 'f1000000-0000-0000-0000-000000000001',
        farm_id: 'fa111111-1111-1111-1111-111111111111',
        farm_name: 'Thennam Thoppu Natural Farm',
        farmer_name: 'Murugan Palanisamy'
      };
    }

    const currentCart = await this.getCart();
    const existingIndex = currentCart.items.findIndex((it) => it.product_id === realId);

    const round2 = (val: number) => Math.round(val * 100) / 100;

    if (existingIndex >= 0) {
      currentCart.items[existingIndex].quantity += quantity;
      currentCart.items[existingIndex].line_total = round2(
        currentCart.items[existingIndex].unit_price * currentCart.items[existingIndex].quantity
      );
    } else {
      currentCart.items.push({
        id: 'ci-' + Math.random().toString(36).substring(2, 9),
        product_id: realId,
        product_name: prod.name,
        unit: prod.unit,
        unit_price: prod.price,
        quantity: quantity,
        line_total: round2(prod.price * quantity),
        available_stock: prod.available_quantity,
        farmer_id: prod.farmer_id,
        farm_id: prod.farm_id,
        farm_name: prod.farm_name,
        image_url: prod.image_url,
      } as any);
    }

    const subtotal = round2(currentCart.items.reduce((sum, it) => sum + it.line_total, 0));
    const delivery_fee = currentCart.items.length > 0 ? 25.0 : 0.0;
    const platform_fee = currentCart.items.length > 0 ? 5.0 : 0.0;
    const total = round2(subtotal + delivery_fee + platform_fee);

    const updatedCart: Cart = {
      items: currentCart.items,
      subtotal,
      delivery_fee,
      platform_fee,
      total,
      farmer_id: currentCart.items[0]?.farmer_id,
      farmer_name: (currentCart.items[0] as any)?.farmer_name,
    };

    localStorage.setItem('farmbridge_cart', JSON.stringify(updatedCart));

    // Also sync to FastAPI cart in background
    fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: realId, quantity }),
    }).catch(() => {});

    return updatedCart;
  },

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const currentCart = await this.getCart();
    const index = currentCart.items.findIndex((it) => it.id === itemId);
    const round2 = (val: number) => Math.round(val * 100) / 100;

    if (index >= 0) {
      if (quantity <= 0) {
        currentCart.items.splice(index, 1);
      } else {
        currentCart.items[index].quantity = quantity;
        currentCart.items[index].line_total = round2(currentCart.items[index].unit_price * quantity);
      }
    }

    const subtotal = round2(currentCart.items.reduce((sum, it) => sum + it.line_total, 0));
    const delivery_fee = currentCart.items.length > 0 ? 25.0 : 0.0;
    const platform_fee = currentCart.items.length > 0 ? 5.0 : 0.0;
    const total = round2(subtotal + delivery_fee + platform_fee);

    const updatedCart: Cart = {
      items: currentCart.items,
      subtotal,
      delivery_fee,
      platform_fee,
      total,
      farmer_id: currentCart.items[0]?.farmer_id,
      farmer_name: (currentCart.items[0] as any)?.farmer_name,
    };

    localStorage.setItem('farmbridge_cart', JSON.stringify(updatedCart));

    fetch(`${API_BASE}/cart/items/${itemId}?quantity=${quantity}`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).catch(() => {});

    return updatedCart;
  },

  async removeCartItem(itemId: string): Promise<Cart> {
    return this.updateCartItem(itemId, 0);
  },

  async clearCart(): Promise<Cart> {
    const emptyCart: Cart = { items: [], subtotal: 0, delivery_fee: 0, platform_fee: 0, total: 0 };
    localStorage.removeItem('farmbridge_cart');
    fetch(`${API_BASE}/cart`, { method: 'DELETE', headers: getHeaders() }).catch(() => {});
    return emptyCart;
  },

  // --- ORDERS (Persistent in Supabase PostgreSQL & Synced with Backend) ---
  async getOrders(): Promise<Order[]> {
    const { data: { session } } = await supabase.auth.getSession();
    const orderMap = new Map<string, Order>();

    // 1. Fetch from Supabase if authenticated
    if (session?.user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role, display_name')
          .eq('supabase_auth_id', session.user.id)
          .maybeSingle();

        if (profile) {
          let query = supabase
            .from('orders')
            .select('*, items:order_items(*), events:order_events(*)')
            .order('created_at', { ascending: false });

          if (profile.role === 'farmer') {
            // Farmer portal: show orders for this farmer OR demo farmers Murugan / Lakshmi
            query = query.or(`farmer_id.eq.${profile.id},farmer_id.eq.f1000000-0000-0000-0000-000000000001,farmer_id.eq.f2000000-0000-0000-0000-000000000002`);
          } else {
            // Consumer portal: show orders placed by this buyer
            query = query.eq('buyer_id', profile.id);
          }

          const { data: supaOrders, error: supaErr } = await query;
          if (!supaErr && supaOrders && supaOrders.length > 0) {
            const farmIds = Array.from(new Set(supaOrders.map((o: any) => o.farm_id).filter(Boolean)));
            const farmerIds = Array.from(new Set(supaOrders.map((o: any) => o.farmer_id).filter(Boolean)));

            let farmsMap: Record<string, string> = {};
            let farmersMap: Record<string, string> = {};

            if (farmIds.length > 0) {
              const { data: farms } = await supabase.from('farms').select('id, farm_name').in('id', farmIds);
              (farms || []).forEach((f: any) => { farmsMap[f.id] = f.farm_name; });
            }
            if (farmerIds.length > 0) {
              const { data: farmers } = await supabase.from('profiles').select('id, display_name').in('id', farmerIds);
              (farmers || []).forEach((f: any) => { farmersMap[f.id] = f.display_name; });
            }

            for (const o of supaOrders) {
              const formatted: Order = {
                ...o,
                subtotal: Number(o.subtotal || 0),
                delivery_fee: Number(o.delivery_fee || 0),
                platform_fee: Number(o.platform_fee || 0),
                total_amount: Number(o.total_amount || 0),
                farm_name: farmsMap[o.farm_id] || o.farm_name || 'Thennam Thoppu Natural Farm',
                farmer_name: farmersMap[o.farmer_id] || o.farmer_name || 'Murugan Palanisamy',
                items: (o.items || []).map((it: any) => ({
                  id: it.id,
                  product_id: it.product_id,
                  product_name_snapshot: it.product_name_snapshot || it.product_name || 'Fresh Produce',
                  unit_snapshot: it.unit_snapshot || it.unit || 'kg',
                  unit_price_snapshot: Number(it.unit_price_snapshot || it.unit_price || 0),
                  quantity: Number(it.quantity || 1),
                  line_total: Number(it.line_total || 0),
                })),
                events: (o.events || []).sort(
                  (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ),
              };
              orderMap.set(formatted.order_number || formatted.id, formatted);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase getOrders warning:', err);
      }
    }

    // 2. Fetch from FastAPI backend (survives restarts and syncs dual-engine state)
    try {
      const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
      if (res.ok) {
        const backendOrders: Order[] = await res.json();
        for (const bo of backendOrders) {
          const key = bo.order_number || bo.id;
          if (!orderMap.has(key)) {
            orderMap.set(key, {
              ...bo,
              subtotal: Number(bo.subtotal || 0),
              delivery_fee: Number(bo.delivery_fee || 0),
              platform_fee: Number(bo.platform_fee || 0),
              total_amount: Number(bo.total_amount || 0),
              farmer_name: bo.farmer_name || 'Murugan Palanisamy',
              farm_name: bo.farm_name || 'Thennam Thoppu Natural Farm',
              items: (bo.items || []).map((it: any) => ({
                id: it.id,
                product_id: it.product_id,
                product_name_snapshot: it.product_name_snapshot || it.product_name || 'Fresh Produce',
                unit_snapshot: it.unit_snapshot || it.unit || 'kg',
                unit_price_snapshot: Number(it.unit_price_snapshot || it.unit_price || 0),
                quantity: Number(it.quantity || 1),
                line_total: Number(it.line_total || 0),
              })),
            });
          }
        }
      }
    } catch {}

    const allOrders = Array.from(orderMap.values());
    allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return allOrders;
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
    const cart = await this.getCart();
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty. Please add items to your basket.');
    }

    const PRODUCT_ID_MAP: Record<string, string> = {
      p1: '11111111-1111-1111-1111-111111111111',
      p2: '22222222-2222-2222-2222-222222222222',
      p3: '33333333-3333-3333-3333-333333333333',
      p4: '44444444-4444-4444-4444-444444444444',
      p5: '55555555-5555-5555-5555-555555555555',
    };
    const normalizeId = (id: string) => PRODUCT_ID_MAP[id] || id;

    // Get consumer profile ID
    let profileId: string | null = null;
    let buyerName = 'Consumer';
    let buyerPhone = data.delivery_contact_phone;

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, phone')
        .eq('supabase_auth_id', session.user.id)
        .maybeSingle();

      if (profile) {
        profileId = profile.id;
        buyerName = profile.display_name || buyerName;
        buyerPhone = profile.phone || buyerPhone;
      }
    }

    if (!profileId) {
      const { data: p } = await supabase.from('profiles').select('id, display_name').eq('role', 'consumer').limit(1).single();
      profileId = p?.id || 'b1000000-0000-0000-0000-000000000001';
      buyerName = p?.display_name || buyerName;
    }

    const firstItem = cart.items[0];
    let farmerId = firstItem.farmer_id || 'f1000000-0000-0000-0000-000000000001';
    let farmId = (firstItem as any).farm_id;
    let farmName = (firstItem as any).farm_name || 'Thennam Thoppu Natural Farm';
    let farmerName = (firstItem as any).farmer_name || 'Murugan Palanisamy';

    if (!farmId && farmerId) {
      const { data: farm } = await supabase.from('farms').select('id, farm_name').eq('owner_id', farmerId).maybeSingle();
      if (farm) {
        farmId = farm.id;
        farmName = farm.farm_name;
      }
    }
    if (!farmId) farmId = 'fa111111-1111-1111-1111-111111111111';

    const orderNumber = 'FB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const orderPayload = {
      order_number: orderNumber,
      buyer_id: profileId,
      farmer_id: farmerId,
      farm_id: farmId,
      status: 'pending_farmer_confirmation',
      fulfilment_type: data.fulfilment_type,
      delivery_area: data.delivery_area || 'Pollachi Central',
      delivery_address: data.delivery_address || 'Pollachi Central',
      delivery_contact_phone: buyerPhone || '+91 97890 41235',
      delivery_slot: data.delivery_slot || 'Morning (6:30 AM - 9:00 AM)',
      subtotal: cart.subtotal,
      delivery_fee: cart.delivery_fee,
      platform_fee: cart.platform_fee,
      total_amount: cart.total,
      payment_status: 'simulated_paid',
    };

    let createdOrder: any = null;

    // 1. Insert order into Supabase
    try {
      const { data: supaOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (!orderErr && supaOrder) {
        createdOrder = supaOrder;

        // 2. Insert order items
        const orderItems = cart.items.map((item) => ({
          order_id: supaOrder.id,
          product_id: normalizeId(item.product_id),
          product_name_snapshot: item.product_name,
          unit_snapshot: item.unit,
          unit_price_snapshot: item.unit_price,
          quantity: item.quantity,
          line_total: item.line_total,
        }));

        await supabase.from('order_items').insert(orderItems);

        // 3. Insert order event
        await supabase
          .from('order_events')
          .insert({
            order_id: supaOrder.id,
            actor_id: profileId,
            actor_role: 'consumer',
            event_type: 'order_placed',
            to_status: 'pending_farmer_confirmation',
            note: `Order confirmed via ${data.payment_method}. 100% direct farmer payout.`,
          })
          .catch(() => {});
      } else if (orderErr) {
        console.warn('Supabase direct order creation notice:', orderErr.message);
      }
    } catch (e) {
      console.warn('Supabase order creation exception:', e);
    }

    // 4. Also call FastAPI /api/v1/orders so backend store & delivery logistics have it
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          buyer_id: profileId,
          farmer_id: farmerId,
          farm_id: farmId,
          farm_name: farmName,
          farmer_name: farmerName,
          items: cart.items.map((it) => ({
            id: it.id,
            product_id: normalizeId(it.product_id),
            product_name: it.product_name,
            unit: it.unit,
            unit_price: it.unit_price,
            quantity: it.quantity,
            line_total: it.line_total,
            farmer_id: it.farmer_id || farmerId,
            farm_id: (it as any).farm_id || farmId,
            farm_name: (it as any).farm_name || farmName,
            farmer_name: (it as any).farmer_name || farmerName,
          })),
          subtotal: cart.subtotal,
          delivery_fee: cart.delivery_fee,
          platform_fee: cart.platform_fee,
          total_amount: cart.total,
        }),
      });
      if (res.ok) {
        const backendOrder = await res.json();
        if (!createdOrder) createdOrder = backendOrder;
      }
    } catch {}

    // Clear cart after order creation
    await this.clearCart();

    if (!createdOrder) {
      throw new Error('Order placement could not be completed. Please try again.');
    }

    return {
      ...createdOrder,
      subtotal: Number(createdOrder.subtotal || cart.subtotal),
      delivery_fee: Number(createdOrder.delivery_fee || cart.delivery_fee),
      platform_fee: Number(createdOrder.platform_fee || cart.platform_fee),
      total_amount: Number(createdOrder.total_amount || cart.total),
      farmer_name: farmerName,
      farm_name: farmName,
      buyer_name: buyerName,
      items: cart.items.map((it) => ({
        id: it.id,
        product_id: normalizeId(it.product_id),
        product_name_snapshot: it.product_name,
        unit_snapshot: it.unit,
        unit_price_snapshot: it.unit_price,
        quantity: it.quantity,
        line_total: it.line_total,
      })),
    } as any;
  },

  async acceptOrder(orderId: string): Promise<Order> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = session?.user
      ? await supabase.from('profiles').select('id, role').eq('supabase_auth_id', session.user.id).maybeSingle()
      : { data: null };

    // Update in Supabase
    let supaUpdated: any = null;
    try {
      const { data: updated, error } = await supabase
        .from('orders')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (!error && updated) {
        supaUpdated = updated;
        await supabase
          .from('order_events')
          .insert({
            order_id: orderId,
            actor_id: profile?.id || null,
            actor_role: 'farmer',
            event_type: 'farmer_accepted',
            from_status: 'pending_farmer_confirmation',
            to_status: 'accepted',
            note: 'Farmer confirmed harvest availability & accepted the order.',
          })
          .catch(() => {});
      }
    } catch {}

    // Update in FastAPI backend
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        const backendOrder = await res.json();
        return supaUpdated ? (supaUpdated as any) : backendOrder;
      }
    } catch {}

    if (supaUpdated) return supaUpdated as any;
    throw new Error('Failed to accept order');
  },

  async rejectOrder(orderId: string, reason?: string): Promise<Order> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = session?.user
      ? await supabase.from('profiles').select('id, role').eq('supabase_auth_id', session.user.id).maybeSingle()
      : { data: null };

    let supaUpdated: any = null;
    try {
      const { data: updated, error } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          rejection_reason: reason || 'Crop unavailable due to weather',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (!error && updated) {
        supaUpdated = updated;
        await supabase
          .from('order_events')
          .insert({
            order_id: orderId,
            actor_id: profile?.id || null,
            actor_role: 'farmer',
            event_type: 'farmer_rejected',
            from_status: 'pending_farmer_confirmation',
            to_status: 'rejected',
            note: reason || 'Farmer rejected order due to harvest shortage.',
          })
          .catch(() => {});
      }
    } catch {}

    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/reject${params}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        const backendOrder = await res.json();
        return supaUpdated ? (supaUpdated as any) : backendOrder;
      }
    } catch {}

    if (supaUpdated) return supaUpdated as any;
    throw new Error('Failed to reject order');
  },

  async updateOrderStatus(orderId: string, status: string, reason?: string): Promise<Order> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = session?.user
      ? await supabase.from('profiles').select('id, role').eq('supabase_auth_id', session.user.id).maybeSingle()
      : { data: null };

    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (reason) updatePayload.rejection_reason = reason;

    let supaUpdated: any = null;
    try {
      const { data: updated, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (!error && updated) {
        supaUpdated = updated;
        await supabase
          .from('order_events')
          .insert({
            order_id: orderId,
            actor_id: profile?.id || null,
            actor_role: profile?.role || 'farmer',
            event_type: `status_changed_to_${status}`,
            to_status: status,
            note: reason || `Order advanced to ${status.replace(/_/g, ' ')}`,
          })
          .catch(() => {});
      }
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      if (res.ok) {
        const backendOrder = await res.json();
        return supaUpdated ? (supaUpdated as any) : backendOrder;
      }
    } catch {}

    if (supaUpdated) return supaUpdated as any;
    throw new Error('Failed to update order status');
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

