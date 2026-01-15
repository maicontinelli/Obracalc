-- Add visibility column to budgets table
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';
-- Update existing records to have 'private' status by default
UPDATE public.budgets
SET visibility = 'private'
WHERE visibility IS NULL;
-- (Optional) Create an index if we plan to filter by this often
CREATE INDEX IF NOT EXISTS idx_budgets_visibility ON public.budgets(visibility);