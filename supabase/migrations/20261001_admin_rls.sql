-- =============================================================================
-- Migration: FarmBridge Admin RLS Policies
-- Adds admin role checks and bypasses for all core tables.
-- =============================================================================

-- 1. Helper function: check if authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE supabase_auth_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Profiles: Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- 3. Farms: Admins can view and update all farms
CREATE POLICY "Admins can view all farms" ON public.farms
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all farms" ON public.farms
  FOR UPDATE USING (public.is_admin());

-- 4. Products: Admins can view and update all products
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all products" ON public.products
  FOR UPDATE USING (public.is_admin());

-- 5. Orders: Admins can view and update all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- 6. Audit Logs: Admins can insert their actions and view all logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin());
