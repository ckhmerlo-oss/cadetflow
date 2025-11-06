drop function if exists "public"."get_tour_sheet"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check... (No change)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    split_part(c.company_name, ' ', 1) AS company_name,
    public.get_cadet_tour_balance(p.id) AS total_tours
  FROM
    public.profiles p
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  WHERE
    public.get_cadet_tour_balance(p.id) > 0
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


-- 1. Gets all non-staff companies for the dropdown
CREATE OR REPLACE FUNCTION public.get_cadet_companies()
RETURNS TABLE (id uuid, company_name text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- We only return companies that are NOT 'Battalion Staff'
  RETURN QUERY
  SELECT c.id, c.company_name
  FROM public.companies c
  WHERE c.company_name != 'Battalion Staff'
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

  IF v_company_name = 'Battalion Staff' THEN
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

-- 1. Create the new "Faculty" company
INSERT INTO public.companies (company_name)
VALUES ('Faculty');

-- 2. Find the "Teacher" role in "Battalion Staff" and move it to "Faculty"
UPDATE public.roles
SET company_id = (SELECT id FROM public.companies WHERE company_name = 'Faculty')
WHERE role_name = 'Teacher'
  AND company_id = (SELECT id FROM public.companies WHERE company_name = 'Battalion Staff');  