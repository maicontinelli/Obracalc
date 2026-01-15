-- 1. Add wallet balance (points) to user profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
-- 2. Create a ledger for all point transactions (security & history)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    -- Negative for spending, Positive for earning
    type TEXT NOT NULL,
    -- 'unlock', 'subscription_bonus', 'lead_sold'
    description TEXT,
    reference_id TEXT,
    -- ID of the lead unlocked or budget sold
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. Index for faster history queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
-- 4. Initial Bonus for existing users (Optional - Gift 500 pts to everyone to start testing)
-- UPDATE public.profiles SET points = 500 WHERE points = 0;