-- Helper Function to Update Points safely
-- This function is REQUIRED for the 'Unlock Lead' API to work correctly
-- ensuring that sellers receive their points when a lead is purchased.
CREATE OR REPLACE FUNCTION public.update_points(target_user_id UUID, amount INT) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.profiles
SET points = COALESCE(points, 0) + amount,
    updated_at = NOW()
WHERE id = target_user_id;
END;
$$;
-- Note: No triggers are needed for budget creation or indication anymore,
-- preventing spam and focusing purely on verified sales and subscription loyalty.