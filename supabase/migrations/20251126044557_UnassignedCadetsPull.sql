drop function if exists "public"."get_unassigned_users"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_unassigned_users()
 RETURNS TABLE(user_id uuid, first_name text, last_name text, created_at timestamp with time zone, company_id uuid, company_name text, role_id uuid, role_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Security Check: Only allow staff (Level 15+)
  IF public.get_my_role_level() < 15 THEN
    RAISE EXCEPTION 'You do not have permission to view unassigned users.';
  END IF;

  RETURN QUERY
  SELECT
    p.id as user_id,
    p.first_name,
    p.last_name,
    p.created_at,
    c.id as company_id,
    c.company_name,
    r.id as role_id,
    r.role_name
  FROM
    public.profiles p
  LEFT JOIN public.companies c ON p.company_id = c.id
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE
    -- Logic Update: Fetch if Missing Role OR Missing Company
    (p.role_id IS NULL OR p.company_id IS NULL)
    AND p.is_site_admin = false
  ORDER BY
    p.created_at DESC; -- Default sort by newest
END;
$function$
;


