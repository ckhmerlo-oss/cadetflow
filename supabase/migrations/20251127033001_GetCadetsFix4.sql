set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_subordinates()
 RETURNS TABLE(id uuid, first_name text, last_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_viewer_id uuid := auth.uid();
  v_is_admin boolean;
  v_viewer_role_level int;
BEGIN
  -- 1. Get viewer details
  SELECT 
    p.is_site_admin,
    COALESCE(r.default_role_level, 0)
  INTO 
    v_is_admin,
    v_viewer_role_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = v_viewer_id;

  v_is_admin := COALESCE(v_is_admin, false);
  v_viewer_role_level := COALESCE(v_viewer_role_level, 0);

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name
  FROM
    public.profiles p
  -- *** FIX 1: Use LEFT JOIN so we don't lose unassigned profiles ***
  LEFT JOIN
    public.roles r ON p.role_id = r.id
  WHERE
    -- *** FIX 2: Allow if Role is Cadet (<50) OR Role is NULL (Unassigned) ***
    (r.default_role_level IS NULL OR r.default_role_level < 50)
    
    AND (
      -- A. Viewer is Site Admin -> See Everyone
      v_is_admin = true
      
      OR
      
      -- B. Viewer is Staff (Level >= 50) -> See Everyone (who is < 50 or null)
      v_viewer_role_level >= 50
      
      OR
      
      -- C. Viewer is Cadet Leader -> See subordinates (treat unassigned target as level 0)
      COALESCE(r.default_role_level, 0) < v_viewer_role_level
    )
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


