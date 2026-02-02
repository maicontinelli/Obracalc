-- Add points column to profiles table for gamification system
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
-- Create index for better performance on points queries
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points);
-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;