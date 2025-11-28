set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_subordinates()
 RETURNS TABLE(id uuid, first_name text, last_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_viewer_role_level int := public.get_my_role_level();
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name
  FROM
    public.profiles p
  JOIN
    public.roles r ON p.role_id = r.id
  WHERE
    -- 1. Target must be a cadet (Level < 50)
    r.default_role_level < 50
    
    -- 2. Viewer must strictly outrank the target
    AND r.default_role_level < v_viewer_role_level
    
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


