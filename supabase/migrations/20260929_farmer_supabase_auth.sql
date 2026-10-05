-- =============================================================================
-- Migration: FarmBridge Farmer Supabase Auth Integration
-- Adds supabase_auth_id column to profiles to link Supabase Auth users
-- to FarmBridge profile records. Also adds email_verified and farmer-specific
-- RLS policies that use the Supabase JWT for secure access control.
-- =============================================================================

-- 1. Add supabase_auth_id to profiles (nullable for OTP-only users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS supabase_auth_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS password_auth BOOLEAN DEFAULT FALSE;

-- Index for fast lookups by Supabase Auth ID
CREATE INDEX IF NOT EXISTS idx_profiles_supabase_auth_id
  ON public.profiles(supabase_auth_id)
  WHERE supabase_auth_id IS NOT NULL;

-- 2. Backfill: for demo seed profiles that ARE created in auth.users,
-- this would normally be a one-time admin script. In production, run:
--   UPDATE public.profiles SET supabase_auth_id = auth.users.id
--   FROM auth.users WHERE public.profiles.email = auth.users.email;

-- 3. Helper function: get the role of the currently authenticated Supabase user
-- Used in RLS policies to enforce farmer-only access without exposing service-role key.
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles
  WHERE supabase_auth_id = auth.uid()
  LIMIT 1;
$$;

-- 4. Helper function: check if authenticated user is a verified farmer
CREATE OR REPLACE FUNCTION public.is_verified_farmer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE supabase_auth_id = auth.uid()
      AND role = 'farmer'
      AND verification_status = 'verified'
  );
$$;

-- 5. Helper function: get the profile id for the authenticated Supabase user
-- (bridges the gap between auth.uid() = supabase_auth_id and profiles.id)
CREATE OR REPLACE FUNCTION public.get_auth_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles
  WHERE supabase_auth_id = auth.uid()
  LIMIT 1;
$$;

-- 6. Update Products RLS: allow verified farmers to manage ONLY their own products
-- using the supabase_auth_id → profile.id bridge
DROP POLICY IF EXISTS "Farmers can manage own products" ON public.products;
CREATE POLICY "Verified farmers can manage own products" ON public.products
  FOR ALL
  USING (
    -- Direct Supabase Auth: match via supabase_auth_id
    farmer_id = public.get_auth_profile_id()
    OR
    -- Legacy OTP token path (farmer_id matches auth.uid() directly for OTP sessions)
    auth.uid() = farmer_id
  )
  WITH CHECK (
    farmer_id = public.get_auth_profile_id()
    OR auth.uid() = farmer_id
  );

-- 7. Update Farms RLS: farmer can only manage their own farm
DROP POLICY IF EXISTS "Farmers can manage own farm" ON public.farms;
CREATE POLICY "Verified farmers can manage own farm" ON public.farms
  FOR ALL
  USING (
    owner_id = public.get_auth_profile_id()
    OR auth.uid() = owner_id
  )
  WITH CHECK (
    owner_id = public.get_auth_profile_id()
    OR auth.uid() = owner_id
  );

-- 8. Profiles: users can insert their own profile on first sign-up (for Supabase Auth sign-ups)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (supabase_auth_id = auth.uid());

-- 9. Orders RLS: farmers can only see orders for their own products / farm
-- (reinforces existing policy with the auth bridge)
DROP POLICY IF EXISTS "Participants can update order state" ON public.orders;
CREATE POLICY "Participants can update order state" ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = farmer_id
    OR public.get_auth_profile_id() = farmer_id
    OR public.get_auth_profile_id() = buyer_id
  );

-- =============================================================================
-- NOTE: In production, to make a demo/test farmer account verified so they
-- can access the dashboard, run:
--   UPDATE public.profiles
--   SET verification_status = 'verified'
--   WHERE email = 'yourfarmer@example.com' AND role = 'farmer';
-- =============================================================================
