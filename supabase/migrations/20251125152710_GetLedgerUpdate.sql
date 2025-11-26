drop function if exists "public"."get_cadet_ledger_stats"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_ledger_stats(p_cadet_id uuid)
 RETURNS TABLE(term_demerits bigint, year_demerits bigint, total_tours_marched bigint, current_tour_balance integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term record;
BEGIN
  -- 1. Get current term dates
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND (end_date + interval '1 day')
  LIMIT 1;

  RETURN QUERY
  SELECT
    -- Term Demerits (Calculated on fly - usually fast enough)
    COALESCE(SUM(CASE 
        WHEN dr.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date 
        THEN dr.demerits_effective ELSE 0 
    END), 0) as term_demerits,
    
    -- Year Demerits (Calculated on fly)
    COALESCE(SUM(dr.demerits_effective), 0) as year_demerits,
    
    -- Total Tours Served (Calculated on fly)
    (
      SELECT COALESCE(ABS(SUM(amount)), 0)
      FROM public.tour_ledger
      WHERE cadet_id = p_cadet_id AND action = 'served'
    ) as total_tours_marched,

    -- *** UPDATE: Read from Cache ***
    -- Old: public.get_cadet_tour_balance(p_cadet_id)
    COALESCE(p.cached_tour_balance, 0) as current_tour_balance

  FROM public.profiles p
  LEFT JOIN public.demerit_reports dr ON p.id = dr.subject_cadet_id AND dr.status = 'completed'
  WHERE p.id = p_cadet_id
  GROUP BY p.id;
END;
$function$
;


