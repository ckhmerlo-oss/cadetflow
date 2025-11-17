set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_ledger_stats(p_cadet_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_term_demerits bigint;
  v_year_demerits bigint;
  v_total_tours int;
  v_current_balance int;
  v_term_start date;
  v_term_end date;
  v_current_term record;
BEGIN
  -- 1. Get Current Term Dates
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND (end_date + interval '1 day')
  LIMIT 1;

  -- 2. Calculate Term/Year Demerits (using the same LATERAL join as the roster)
  SELECT
    COALESCE(stats.term_demerits, 0),
    COALESCE(stats.year_demerits, 0)
  INTO v_term_demerits, v_year_demerits
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT
      SUM(CASE 
            WHEN dr.date_of_offense BETWEEN v_current_term.start_date AND (v_current_term.end_date + interval '1 day') 
            THEN dr.demerits_effective ELSE 0 
          END) as term_demerits,
      SUM(dr.demerits_effective) as year_demerits
    FROM public.demerit_reports dr
    WHERE dr.subject_cadet_id = p.id AND dr.status = 'completed'
  ) stats ON true
  WHERE p.id = p_cadet_id;

  -- 3. Calculate Total Tours Marched
  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_total_tours
  FROM public.tour_ledger
  WHERE cadet_id = p_cadet_id AND amount < 0;

  -- 4. Get Current Balance (USING THE FIXED FUNCTION)
  -- This is the critical fix:
  v_current_balance := public.get_cadet_tour_balance(p_cadet_id);

  -- 5. Return JSON
  RETURN json_build_object(
    'term_demerits', v_term_demerits,
    'year_demerits', v_year_demerits,
    'total_tours_marched', v_total_tours,
    'current_tour_balance', v_current_balance
  );
END;
$function$
;


