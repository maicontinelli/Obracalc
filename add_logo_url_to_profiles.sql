-- Add logo_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS logo_url text;
-- Ensure RLS allows the new column
-- (Usually select * and upsert handles this, but permissions are good to refresh)
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;