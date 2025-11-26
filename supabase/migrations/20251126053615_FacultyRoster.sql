set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_faculty_roster()
 RETURNS TABLE(id uuid, first_name text, last_name text, cadet_rank text, company_name text, role_name text, email text, role_level integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check: Only Admin/Commandant (Level 90+)
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied: You must be an administrator to view faculty records.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.cadet_rank, -- Faculty often store title/rank here
    c.company_name,
    r.role_name,
    u.email::text,
    r.default_role_level
  FROM
    public.profiles p
  JOIN
    public.roles r ON p.role_id = r.id
  JOIN 
    auth.users u ON p.id = u.id
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  WHERE
    r.default_role_level >= 50 -- Only Staff/Faculty
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


