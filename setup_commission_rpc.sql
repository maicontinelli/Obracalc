-- Function to safely update points bypassing RLS
-- SECURITY DEFINER means it runs with the privileges of the creator (admin), 
-- allowing Buyer to update Seller's points securely.
CREATE OR REPLACE FUNCTION update_points(target_user_id UUID, amount INTEGER) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.profiles
SET points = COALESCE(points, 0) + amount
WHERE id = target_user_id;
END;
$$;