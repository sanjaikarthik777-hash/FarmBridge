-- Add onboarding_completed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- We also need farm type, methods, irrigation, and crops in farms table.
ALTER TABLE public.farms 
  ADD COLUMN IF NOT EXISTS farm_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS farming_methods VARCHAR(100),
  ADD COLUMN IF NOT EXISTS irrigation_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS farm_images TEXT[],
  ADD COLUMN IF NOT EXISTS selected_crops TEXT[];
