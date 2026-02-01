-- Ensure all Profile columns exist for the Dashboard Save operation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text,
    ADD COLUMN IF NOT EXISTS company_name text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS city text,
    ADD COLUMN IF NOT EXISTS state text,
    ADD COLUMN IF NOT EXISTS profession text,
    ADD COLUMN IF NOT EXISTS registration_number text,
    ADD COLUMN IF NOT EXISTS team_size text,
    ADD COLUMN IF NOT EXISTS avatar_url text,
    -- Banking / Documents
ADD COLUMN IF NOT EXISTS document_id text,
    ADD COLUMN IF NOT EXISTS pix_key text,
    ADD COLUMN IF NOT EXISTS bank_name text,
    ADD COLUMN IF NOT EXISTS bank_agency text,
    ADD COLUMN IF NOT EXISTS bank_account text,
    -- New Address Fields
ADD COLUMN IF NOT EXISTS cep text,
    ADD COLUMN IF NOT EXISTS address text;
-- Grant permissions just in case
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;