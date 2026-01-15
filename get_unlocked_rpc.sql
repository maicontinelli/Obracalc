-- Function to fetch budgets bypassing standard RLS
-- Allows retrieving details of purchased leads even if they aren't public
CREATE OR REPLACE FUNCTION get_unlocked_budgets(budget_ids UUID []) RETURNS SETOF budgets LANGUAGE sql SECURITY DEFINER AS $$
SELECT *
FROM budgets
WHERE id = ANY(budget_ids);
$$;