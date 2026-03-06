-- Phase 1: Commercial Launch — Terms & Payment tracking fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
    ADD COLUMN IF NOT EXISTS guarantee_expires_at timestamptz,
    ADD COLUMN IF NOT EXISTS payment_failures int DEFAULT 0;
-- Index for fast lookups on guarantee window
CREATE INDEX IF NOT EXISTS idx_profiles_guarantee_expires_at ON public.profiles(guarantee_expires_at);