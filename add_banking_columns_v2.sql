-- Add banking information columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pix_key TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_agency TEXT,
    ADD COLUMN IF NOT EXISTS bank_account TEXT;
-- Refresh schema cache workaround (optional, but good practice if using PostgREST)
NOTIFY pgrst,
'reload config';