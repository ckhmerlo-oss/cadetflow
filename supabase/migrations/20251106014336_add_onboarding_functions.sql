-- 1. Gets all non-staff companies for the dropdown
CREATE FUNCTION public.get_cadet_companies()
RETURNS TABLE (id uuid, company_name text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- We only return companies that are NOT 'Battalion Staff' or 'Faculty'
  RETURN QUERY
  SELECT c.id, c.company_name
  FROM public.companies c
  WHERE c.company_name NOT IN ('Battalion Staff', 'Faculty')
  ORDER BY c.company_name;
END;
$$;


-- 2. Securely updates the new user's profile
CREATE OR REPLACE FUNCTION public.update_my_onboarding_profile(
  p_first_name text,
  p_last_name text,
  p_company_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_company_name text;
BEGIN
  -- Security check: a user cannot self-assign to staff
  SELECT company_name INTO v_company_name
  FROM public.companies
  WHERE id = p_company_id;

  IF v_company_name IN ('Battalion Staff', 'Faculty') THEN
    RAISE EXCEPTION 'Permission denied. Cannot self-assign to this company.';
  END IF;

  -- Update their profile
  UPDATE public.profiles
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    company_id = p_company_id,
    role_id = NULL, -- They are now in the company, but unassigned
    role_level = 10  -- Default 'Cadet' level
  WHERE id = auth.uid();
END;
$$;