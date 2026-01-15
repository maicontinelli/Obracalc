-- Add total_value column to budgets table to store estimated price
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS total_value NUMERIC DEFAULT 0;