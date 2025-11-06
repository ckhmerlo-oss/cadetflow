-- 2. Securely updates the new user's profile
CREATE OR REPLACE FUNCTION public.update_my_onboarding_profile(
  p_first_name text,
  p_last_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update their profile
  UPDATE public.profiles
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    company_id = NULL, -- User remains unassigned
    role_id = NULL,
    role_level = 10  -- Default 'Cadet' level
  WHERE id = auth.uid();
END;
$$;