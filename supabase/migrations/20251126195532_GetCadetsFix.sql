set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_subordinates()
 RETURNS TABLE(id uuid, first_name text, last_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_viewer_id uuid := auth.uid();
  v_viewer_role_level int := public.get_my_role_level();
  v_viewer_company_id uuid;
BEGIN
  -- Get viewer's company
  SELECT company_id INTO v_viewer_company_id FROM public.profiles WHERE id = v_viewer_id;

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
    -- 1. MANDATORY: Target must be a cadet (Level < 50)
    r.default_role_level < 50
    
    AND (
      -- 2. Visibility Logic:
      
      -- A. Viewer is Staff/Admin (Level >= 50) -> Can see ALL Cadets
      v_viewer_role_level >= 50
      
      OR
      
      -- B. Viewer is a Cadet Leader -> See Cadets in THEIR Company with LOWER rank
      (
        p.company_id = v_viewer_company_id
        AND
        r.default_role_level < v_viewer_role_level
      )
    )
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


