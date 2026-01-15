-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- Allow users to view their OWN transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR
SELECT USING (auth.uid() = user_id);
-- Allow users (via API with service role or correctly auth'd client) to insert
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR
INSERT WITH CHECK (auth.uid() = user_id);