-- Enable RLS (if not enabled)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
-- Policy: Users can see their own budgets (already exists probably, but reinforcing)
CREATE POLICY "Users can view own budgets" ON public.budgets FOR
SELECT USING (auth.uid() = user_id);
-- Policy: EVERONE can view budgets that are marked as 'marketplace'
CREATE POLICY "Marketplace items are public" ON public.budgets FOR
SELECT USING (visibility = 'marketplace');