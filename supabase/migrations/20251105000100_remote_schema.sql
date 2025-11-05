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


