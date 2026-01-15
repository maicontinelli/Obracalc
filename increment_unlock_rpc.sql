-- Function to increment unlock count securely
CREATE OR REPLACE FUNCTION increment_unlock_count(target_lead_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.budgets
SET unlock_count = COALESCE(unlock_count, 0) + 1
WHERE id = target_lead_id;
END;
$$;