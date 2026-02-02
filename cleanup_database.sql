-- CLEANUP: Remove obsolete Points and Marketplace system from database
-- Execute this in Supabase SQL Editor after removing the code
-- IMPORTANT: Order matters! Policies must be dropped before columns.
-- 1. Remove políticas RLS relacionadas ao marketplace (FIRST - they depend on columns)
DROP POLICY IF EXISTS "Marketplace items are public" ON public.budgets;
DROP POLICY IF EXISTS "Enable read access for marketplace budgets" ON public.budgets;
-- 2. Remove triggers de gamificação
DROP TRIGGER IF EXISTS budget_creation_reward ON public.budgets;
DROP TRIGGER IF EXISTS marketplace_indication_reward ON public.budgets;
-- 3. Remove funções obsoletas
DROP FUNCTION IF EXISTS public.handle_new_budget_points();
DROP FUNCTION IF EXISTS public.handle_marketplace_points();
DROP FUNCTION IF EXISTS public.update_points(UUID, INT);
DROP FUNCTION IF EXISTS get_unlocked_budgets(UUID []);
DROP FUNCTION IF EXISTS increment_unlock_count(UUID);
-- 4. Remove índices obsoletos (before dropping columns)
DROP INDEX IF EXISTS idx_profiles_points;
DROP INDEX IF EXISTS idx_budgets_visibility;
-- 5. Remove colunas obsoletas da tabela profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS points CASCADE;
-- 6. Remove colunas obsoletas da tabela budgets
ALTER TABLE public.budgets DROP COLUMN IF EXISTS visibility CASCADE;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS unlock_count CASCADE;
-- Verificação: Listar colunas restantes nas tabelas principais
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'budgets'
ORDER BY ordinal_position;