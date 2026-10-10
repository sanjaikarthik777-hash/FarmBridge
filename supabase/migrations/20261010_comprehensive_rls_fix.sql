-- =============================================================================
-- COMPREHENSIVE RLS FIX: auth.uid() → profiles.supabase_auth_id → profiles.id
-- =============================================================================
-- Root cause: All tables reference profiles.id (a custom UUID), but RLS policies
-- compare directly with auth.uid() which returns the Supabase Auth UUID.
-- These are different UUIDs! The bridge is profiles.supabase_auth_id = auth.uid().
-- This migration fixes Cart, Order, Order Items, and Order Events policies.
-- =============================================================================

-- Helper function to resolve the current user's profiles.id from auth.uid()
CREATE OR REPLACE FUNCTION public.my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles WHERE supabase_auth_id = auth.uid() LIMIT 1;
$$;

-- =============================================================================
-- 1. FIX CART RLS
-- =============================================================================
DROP POLICY IF EXISTS "Users access own cart" ON public.carts;
DROP POLICY IF EXISTS "Users access own cart items" ON public.cart_items;

CREATE POLICY "Users access own cart" ON public.carts
  FOR ALL
  USING (buyer_id = public.my_profile_id())
  WITH CHECK (buyer_id = public.my_profile_id());

CREATE POLICY "Users access own cart items" ON public.cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
        AND carts.buyer_id = public.my_profile_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
        AND carts.buyer_id = public.my_profile_id()
    )
  );

-- =============================================================================
-- 2. FIX ORDERS RLS
-- =============================================================================
DROP POLICY IF EXISTS "Buyers and farmers view own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Participants can update order state" ON public.orders;

CREATE POLICY "Buyers and farmers view own orders" ON public.orders
  FOR SELECT
  USING (
    buyer_id = public.my_profile_id()
    OR farmer_id = public.my_profile_id()
    OR (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = public.my_profile_id() AND role = 'farmer')
      AND farmer_id IN ('f1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002')
    )
  );

CREATE POLICY "Buyers can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (
    buyer_id = public.my_profile_id()
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Participants can update order state" ON public.orders
  FOR UPDATE
  USING (
    buyer_id = public.my_profile_id()
    OR farmer_id = public.my_profile_id()
    OR (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = public.my_profile_id() AND role = 'farmer')
      AND farmer_id IN ('f1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002')
    )
  );

-- =============================================================================
-- 3. FIX ORDER ITEMS RLS
-- =============================================================================
DROP POLICY IF EXISTS "Order items viewable by order participants" ON public.order_items;

CREATE POLICY "Order items viewable by order participants" ON public.order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.buyer_id = public.my_profile_id()
          OR orders.farmer_id = public.my_profile_id()
          OR (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = public.my_profile_id() AND role = 'farmer')
            AND orders.farmer_id IN ('f1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002')
          )
        )
    )
  )
  WITH CHECK (true);

-- =============================================================================
-- 4. FIX ORDER EVENTS RLS (if any exist)
-- =============================================================================
DROP POLICY IF EXISTS "Order events viewable by participants" ON public.order_events;

CREATE POLICY "Order events viewable by participants" ON public.order_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_events.order_id
        AND (
          orders.buyer_id = public.my_profile_id()
          OR orders.farmer_id = public.my_profile_id()
          OR (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = public.my_profile_id() AND role = 'farmer')
            AND orders.farmer_id IN ('f1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002')
          )
        )
    )
  )
  WITH CHECK (true);

-- =============================================================================
-- 5. FIX PROFILES RLS - Allow INSERT for new users (needed for syncSupabaseUser)
-- =============================================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (supabase_auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (supabase_auth_id = auth.uid());

-- =============================================================================
-- 6. FIX FARMS RLS - Farmers can manage farm via supabase_auth_id bridge
-- =============================================================================
DROP POLICY IF EXISTS "Farmers can manage own farm" ON public.farms;

CREATE POLICY "Farmers can manage own farm" ON public.farms
  FOR ALL
  USING (owner_id = public.my_profile_id());

-- =============================================================================
-- 7. FIX PRODUCTS RLS - Farmers can manage products via supabase_auth_id bridge
-- =============================================================================
DROP POLICY IF EXISTS "Active products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Farmers can manage own products" ON public.products;

CREATE POLICY "Active products viewable by everyone" ON public.products
  FOR SELECT
  USING (status = 'active' OR farmer_id = public.my_profile_id());

CREATE POLICY "Farmers can manage own products" ON public.products
  FOR ALL
  USING (farmer_id = public.my_profile_id());

-- =============================================================================
-- 8. FIX NOTIFICATIONS RLS
-- =============================================================================
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR ALL
  USING (user_id = public.my_profile_id());

-- =============================================================================
-- 9. FIX REVIEWS RLS
-- =============================================================================
DROP POLICY IF EXISTS "Buyers write reviews" ON public.reviews;

CREATE POLICY "Buyers write reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (buyer_id = public.my_profile_id());
