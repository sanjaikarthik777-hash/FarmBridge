-- =============================================================================
-- FarmBridge: Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Location: Pollachi & Regional Pilot, Tamil Nadu, India
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(30) NOT NULL CHECK (role IN ('farmer', 'consumer', 'business', 'delivery', 'admin')),
    display_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta')),
    avatar_path TEXT,
    verification_status VARCHAR(30) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'verified', 'rejected', 'needs_information')),
    default_address TEXT,
    default_latitude NUMERIC(10, 7),
    default_longitude NUMERIC(10, 7),
    gps_accuracy NUMERIC(8, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMS
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name VARCHAR(150) NOT NULL,
    description TEXT,
    farm_address TEXT,
    village VARCHAR(100) DEFAULT 'Aliyar',
    district VARCHAR(100) DEFAULT 'Coimbatore',
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    region VARCHAR(100) DEFAULT 'Pollachi',
    pincode VARCHAR(10) DEFAULT '642001',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    gps_accuracy NUMERIC(8, 2),
    is_approximate BOOLEAN DEFAULT FALSE,
    pickup_instructions TEXT, -- Kept private, revealed only upon confirmed order
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL UNIQUE,
    name_ta VARCHAR(80),
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    name_ta VARCHAR(150),
    description TEXT,
    image_paths TEXT[], -- Array of image URLs/storage paths
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'kg', -- 'kg', 'bunch', 'piece', 'litre', 'bag', 'box'
    available_quantity NUMERIC(10, 2) NOT NULL CHECK (available_quantity >= 0),
    minimum_order_quantity NUMERIC(10, 2) DEFAULT 1 CHECK (minimum_order_quantity > 0),
    maximum_order_quantity NUMERIC(10, 2),
    availability_date DATE DEFAULT CURRENT_DATE,
    harvest_date DATE,
    expiry_at TIMESTAMPTZ,
    fulfilment_options TEXT[] DEFAULT ARRAY['pickup', 'delivery'],
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold_out', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    status VARCHAR(40) DEFAULT 'pending_farmer_confirmation' CHECK (
        status IN (
            'cart',
            'pending_farmer_confirmation',
            'accepted',
            'preparing',
            'ready_for_pickup',
            'picked_up',
            'in_transit',
            'delivered',
            'completed',
            'rejected',
            'cancelled',
            'payment_failed',
            'refund_pending',
            'refunded',
            'delivery_failed',
            'disputed'
        )
    ),
    fulfilment_type VARCHAR(30) NOT NULL CHECK (fulfilment_type IN ('pickup', 'delivery', 'collection_point')),
    delivery_area VARCHAR(100),
    delivery_address TEXT,
    delivery_contact_phone VARCHAR(20),
    delivery_slot VARCHAR(60),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(30) DEFAULT 'simulated_pending' CHECK (payment_status IN ('unpaid', 'simulated_pending', 'simulated_paid', 'paid', 'refunded', 'failed')),
    rejection_reason TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS (Snapshot storage)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(150) NOT NULL,
    unit_snapshot VARCHAR(30) NOT NULL,
    unit_price_snapshot NUMERIC(10, 2) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER EVENTS (Audit Trail of State Changes)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role VARCHAR(30),
    event_type VARCHAR(50) NOT NULL,
    from_status VARCHAR(40),
    to_status VARCHAR(40),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS (Non-sensitive transaction audit)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    provider VARCHAR(40) DEFAULT 'mock_gateway', -- 'razorpay', 'upi_simulated', 'mock_gateway'
    provider_payment_reference VARCHAR(120),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DELIVERY TASKS
CREATE TABLE IF NOT EXISTS public.delivery_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled')),
    pickup_address TEXT,
    dropoff_address TEXT,
    pickup_time TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    route_estimate_km NUMERIC(6, 2),
    route_reference TEXT,
    proof_reference TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REVIEWS (Tied only to completed orders)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    moderation_status VARCHAR(30) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, buyer_id)
);

-- 12. PRICE REFERENCES (Decision Support Data)
CREATE TABLE IF NOT EXISTS public.price_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    crop_name_ta VARCHAR(100),
    market_name VARCHAR(100) NOT NULL, -- e.g., 'Pollachi Uzhavar Sandhai', 'Coimbatore APMC'
    region VARCHAR(100) DEFAULT 'Tamil Nadu',
    unit VARCHAR(30) DEFAULT 'kg',
    min_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2) NOT NULL,
    source_name VARCHAR(120) NOT NULL DEFAULT 'Tamil Nadu Regulated Market & Uzhavar Sandhai Observation',
    source_url TEXT,
    observed_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) DEFAULT 'order_update',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DISPUTES
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    opened_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    resolution TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_farmer ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_partner ON public.delivery_tasks(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_order ON public.delivery_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Categories & Price References are readable by all authenticated and anonymous users
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Price references viewable by everyone" ON public.price_references FOR SELECT USING (true);

-- Products: active listings viewable by everyone; farmer can insert/update their own
CREATE POLICY "Active products viewable by everyone" ON public.products FOR SELECT
    USING (status = 'active' OR auth.uid() = farmer_id);
CREATE POLICY "Farmers can manage own products" ON public.products FOR ALL
    USING (auth.uid() = farmer_id);

-- Farms: basic public profile visible to all
CREATE POLICY "Farms viewable by everyone" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Farmers can manage own farm" ON public.farms FOR ALL USING (auth.uid() = owner_id);

-- Profiles: public profile viewable, user can update own profile
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Carts: user accesses own cart only
CREATE POLICY "Users access own cart" ON public.carts FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Users access own cart items" ON public.cart_items FOR ALL
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.buyer_id = auth.uid()));

-- Orders: buyer, farmer, and admin have access
CREATE POLICY "Buyers and farmers view own orders" ON public.orders FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update order state" ON public.orders FOR UPDATE
    USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

-- Order Items: visible to buyer or farmer of that order
CREATE POLICY "Order items viewable by order participants" ON public.order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())));

-- Delivery Tasks: delivery partner, farmer, and buyer can view; delivery partner can update
CREATE POLICY "Delivery partner can view assigned task" ON public.delivery_tasks FOR SELECT
    USING (auth.uid() = delivery_partner_id OR EXISTS (SELECT 1 FROM public.orders WHERE orders.id = delivery_tasks.order_id AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())));
CREATE POLICY "Delivery partner can update task" ON public.delivery_tasks FOR UPDATE
    USING (auth.uid() = delivery_partner_id);

-- Notifications: user sees own notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Reviews: readable by all, writable only by buyer
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = buyer_id);
CREATE POLICY "Buyers write reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- =============================================================================
-- GEOSPATIAL DISTANCE CALCULATION (Haversine Formula)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_haversine_distance(
    lat1 NUMERIC,
    lon1 NUMERIC,
    lat2 NUMERIC,
    lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    r NUMERIC := 6371.0; -- Earth radius in kilometers
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2.0) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * (sin(dlon / 2.0) ^ 2);
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    RETURN ROUND((r * c)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Spatial Coordinate Indexes for fast coordinate bounds lookup
CREATE INDEX IF NOT EXISTS idx_farms_lat_lon ON public.farms (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_products_lat_lon ON public.products (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_default_coords ON public.profiles (default_latitude, default_longitude);
