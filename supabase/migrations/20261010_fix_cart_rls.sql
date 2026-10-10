-- =============================================================================
-- Fix Cart & Cart Items RLS Policies
-- Problem: auth.uid() returns the Supabase Auth UUID, but carts.buyer_id 
--          references profiles.id (a different UUID). The old policy blocked 
--          all cart INSERT/SELECT for regular consumers.
-- Fix: Join through profiles.supabase_auth_id to resolve the bridge.
-- =============================================================================

-- Drop old incorrect policies
DROP POLICY IF EXISTS "Users access own cart" ON public.carts;
DROP POLICY IF EXISTS "Users access own cart items" ON public.cart_items;

-- Carts: match via profiles.supabase_auth_id → profiles.id = carts.buyer_id
CREATE POLICY "Users access own cart" ON public.carts
  FOR ALL
  USING (
    buyer_id IN (
      SELECT id FROM public.profiles WHERE supabase_auth_id = auth.uid()
    )
  )
  WITH CHECK (
    buyer_id IN (
      SELECT id FROM public.profiles WHERE supabase_auth_id = auth.uid()
    )
  );

-- Cart Items: match via cart's buyer through the same bridge
CREATE POLICY "Users access own cart items" ON public.cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      JOIN public.profiles ON profiles.id = carts.buyer_id
      WHERE carts.id = cart_items.cart_id
        AND profiles.supabase_auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      JOIN public.profiles ON profiles.id = carts.buyer_id
      WHERE carts.id = cart_items.cart_id
        AND profiles.supabase_auth_id = auth.uid()
    )
  );
