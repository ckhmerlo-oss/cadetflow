set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_manageable_companies()
 RETURNS TABLE(company_id uuid, company_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role_id uuid;
  v_can_manage_own boolean;
  v_can_manage_all boolean;
  v_user_company_id uuid;
BEGIN
  -- *** FIX: No longer reads p.role_level ***
  SELECT
    p.role_id,
    COALESCE(r.can_manage_own_company_roster, false),
    COALESCE(r.can_manage_all_rosters, false),
    p.company_id
  INTO
    v_role_id,
    v_can_manage_own,
    v_can_manage_all,
    v_user_company_id
  FROM
    public.profiles p
  LEFT JOIN
    public.roles r ON p.role_id = r.id
  WHERE
    p.id = auth.uid();

  IF v_can_manage_all = true THEN
    RETURN QUERY
    SELECT id, c.company_name FROM public.companies c;
  
  ELSIF v_can_manage_own = true THEN
    RETURN QUERY
    SELECT id, c.company_name FROM public.companies c
    WHERE c.id = v_user_company_id;
    
  ELSE
    RETURN;
  END IF;
END;
$function$
;


