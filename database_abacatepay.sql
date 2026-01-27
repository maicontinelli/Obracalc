-- Add AbacatePay fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS abacatepay_customer_id text;
-- Optional: Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_abacatepay_customer_id ON public.profiles(abacatepay_customer_id);