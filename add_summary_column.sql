-- Add services_summary column to budgets table
-- This stores a lightweight list of main service categories (e.g. ['Pintura', 'Elétrica'])
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS services_summary TEXT [] DEFAULT '{}';