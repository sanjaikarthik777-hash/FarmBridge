export type UserRole = 'farmer' | 'consumer' | 'business' | 'delivery' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string;
  phone?: string;
  email?: string;
  preferred_language: 'en' | 'ta';
  avatar_path?: string;
  verification_status: 'not_submitted' | 'pending' | 'verified' | 'rejected' | 'needs_information';
  default_latitude?: number;
  default_longitude?: number;
  default_address?: string;
  supabase_auth_id?: string;
  onboarding_completed?: boolean;
  created_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  owner_name?: string;
  farm_name: string;
  description?: string;
  region: string;
  village?: string;
  district: string;
  state: string;
  pincode: string;
  farm_address?: string;
  latitude: number;
  longitude: number;
  gps_accuracy?: number;
  is_approximate: boolean;
  pickup_instructions?: string;
  is_active: boolean;
  distance_km?: number;
  products_count?: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  name_ta?: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  farmer_id: string;
  farm_id: string;
  farm_name?: string;
  farmer_name?: string;
  category_id?: string;
  name: string;
  name_ta?: string;
  description?: string;
  image_paths: string[];
  price: number;
  unit: string;
  available_quantity: number;
  minimum_order_quantity: number;
  maximum_order_quantity?: number;
  availability_date?: string;
  harvest_date?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  fulfilment_options: string[];
  status: 'active' | 'paused' | 'sold_out' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  available_stock: number;
  farmer_id: string;
  farm_name: string;
  farm_distance_km?: number;
  image_url?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  total: number;
  farmer_id?: string;
  farmer_name?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  product_name?: string;
  unit?: string;
}

export interface OrderEvent {
  id: string;
  event_type: string;
  from_status?: string;
  to_status?: string;
  note?: string;
  created_at: string;
  actor_role?: string;
}

export type OrderStatus =
  | 'cart'
  | 'pending_farmer_confirmation'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'payment_failed'
  | 'refund_pending'
  | 'refunded'
  | 'delivery_failed'
  | 'disputed';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer_name?: string;
  farmer_id: string;
  farmer_name?: string;
  farm_id: string;
  farm_name?: string;
  status: OrderStatus;
  fulfilment_type: 'pickup' | 'delivery' | 'collection_point';
  delivery_area?: string;
  delivery_address?: string;
  delivery_contact_phone?: string;
  delivery_slot?: string;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  total_amount: number;
  currency: string;
  payment_status: string;
  items: OrderItem[];
  events: OrderEvent[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryTask {
  id: string;
  order_id: string;
  order_number: string;
  delivery_partner_id?: string;
  delivery_partner_name?: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  route_estimate_km: number;
  estimated_duration_mins: number;
  created_at: string;
  delivered_time?: string;
}

export interface PriceReference {
  id: string;
  crop_name: string;
  crop_name_ta?: string;
  market_name: string;
  region: string;
  unit: string;
  min_price: number;
  modal_price: number;
  max_price: number;
  source_name: string;
  observed_date: string;
  notice: string;
}

export interface DemandInsight {
  crop_name: string;
  crop_name_ta?: string;
  category: string;
  demand_level: string;
  weekly_searches: number;
  order_volume: number;
  trend: string;
  buyer_interest_note: string;
}

export interface AdminOverview {
  total_users: number;
  farmers_count: number;
  buyers_count: number;
  active_listings: number;
  total_orders: number;
  completed_orders: number;
  gross_merchandise_val: number;
  platform_fee_collected: number;
  pending_verifications: number;
  open_disputes: number;
}

export interface Review {
  id: string;
  order_id: string;
  buyer_id: string;
  buyer_name: string;
  farmer_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  mobile: string;
  cooldown_seconds: number;
  dev_otp?: string;
}

export interface AuthSession {
  token: string;
  profile: UserProfile;
  farm?: Farm;
}

export interface SavedAddress {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  area: string;
  landmark?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  buildingName?: string;
  houseNumber?: string;
  street?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  placeId?: string;
  plusCode?: string;
  formattedAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  title_ta?: string;
  message: string;
  message_ta?: string;
  type: 'order' | 'harvest' | 'promotion' | 'system';
  order_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface WishlistResponse {
  product_ids: string[];
  products: Product[];
}

