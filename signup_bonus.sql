-- Trigger to award 500 points to new users upon profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_bonus() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Award 500 points for signing up
    -- Assuming 'tier' defaults to 'free' or is set during insert.
    -- Bonus applies to everyone or just free? "Usuários do plano gratis ganham 500 pontos".
    -- But initial signup is usually free.
    -- We can set points = 500 directly or add to it.
    -- Since it's a new row, we can modify NEW.points directly if it's BEFORE INSERT,
    -- or use update_points if AFTER INSERT.
    -- Better to do it BEFORE INSERT to set default, but if points has default 0 in schema, we override.
    -- However, profiles are often created by triggers on auth.users.
    -- If we use AFTER INSERT, we can reuse update_points.
    PERFORM public.update_points(NEW.id, 500);
RETURN NEW;
END;
$$;
-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS on_signup_bonus ON public.profiles;
CREATE TRIGGER on_signup_bonus
AFTER
INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_bonus();
-- Optional: Backfill existing users with 0 points to have 500 if desired?
-- Or just ensure new users get it. User said "ganham 500 pontos por se cadastrar".
-- This implies new users.
-- Run this SQL in your Supabase SQL Editor.