-- Allow users to view and update their own profile data (points, etc)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id);