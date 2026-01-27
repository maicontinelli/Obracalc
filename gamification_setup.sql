-- 1. Helper Function to Update Points safely
CREATE OR REPLACE FUNCTION public.update_points(target_user_id UUID, amount INT) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.profiles
SET points = COALESCE(points, 0) + amount,
    updated_at = NOW()
WHERE id = target_user_id;
END;
$$;
-- 2. Trigger Function: Reward for Creating a Budget (35 pts)
CREATE OR REPLACE FUNCTION public.handle_new_budget_points() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Award 35 points whenever a new budget is inserted
    PERFORM public.update_points(NEW.user_id, 35);
RETURN NEW;
END;
$$;
-- 3. Trigger: budget_creation_reward
DROP TRIGGER IF EXISTS budget_creation_reward ON public.budgets;
CREATE TRIGGER budget_creation_reward
AFTER
INSERT ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.handle_new_budget_points();
-- 4. Trigger Function: Reward for Indicating work to Marketplace (50 pts)
CREATE OR REPLACE FUNCTION public.handle_marketplace_points() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Award 50 points if visibility changes to 'marketplace'
    IF (
        OLD.visibility IS DISTINCT
        FROM 'marketplace'
            AND NEW.visibility = 'marketplace'
    ) THEN PERFORM public.update_points(NEW.user_id, 50);
END IF;
RETURN NEW;
END;
$$;
-- 5. Trigger: marketplace_indication_reward
DROP TRIGGER IF EXISTS marketplace_indication_reward ON public.budgets;
CREATE TRIGGER marketplace_indication_reward
AFTER
UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.handle_marketplace_points();