-- Add unlock_count to track how many times a lead has been bought
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS unlock_count INTEGER DEFAULT 0;