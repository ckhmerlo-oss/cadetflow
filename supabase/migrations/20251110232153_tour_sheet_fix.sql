drop function if exists "public"."get_tour_sheet"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check (Level >= 50)
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    split_part(c.company_name, ' ', 1) AS company_name,
    -- *** FIX: Use the master dynamic calculation function ***
    public.get_cadet_tour_balance(p.id) AS total_tours
  FROM
    public.profiles p
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  WHERE
    -- *** FIX: Filter based on the dynamic balance ***
    public.get_cadet_tour_balance(p.id) > 0
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


