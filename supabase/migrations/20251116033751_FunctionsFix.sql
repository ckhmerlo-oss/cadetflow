drop function if exists "public"."get_cadet_ledger_stats"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_ledger_stats(p_cadet_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_term_demerits int;
  v_year_demerits int;
  v_total_tours int;
  v_current_balance int;
  v_term_start date;
  v_term_end date;
BEGIN
  -- 1. Get Current Term Dates
  SELECT start_date, end_date INTO v_term_start, v_term_end
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND end_date
  LIMIT 1;

  -- 2. Calculate Term Demerits
  SELECT COALESCE(SUM(demerits_effective), 0) INTO v_term_demerits
  FROM public.demerit_reports
  WHERE subject_cadet_id = p_cadet_id
    AND status = 'completed'
    AND date_of_offense BETWEEN v_term_start AND v_term_end;

  -- 3. Calculate Year Demerits (assuming year starts in Aug, purely cumulative)
  SELECT COALESCE(SUM(demerits_effective), 0) INTO v_year_demerits
  FROM public.demerit_reports
  WHERE subject_cadet_id = p_cadet_id
    AND status = 'completed';

  -- 4. Calculate Total Tours Marched (sum of negative 'served' entries)
  SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_total_tours
  FROM public.tour_ledger
  WHERE cadet_id = p_cadet_id AND amount < 0;

  -- 5. Get Current Balance (USING YOUR NEW FIXED FUNCTION)
  v_current_balance := public.get_cadet_tour_balance(p_cadet_id);

  -- 6. Return JSON
  RETURN json_build_object(
    'term_demerits', v_term_demerits,
    'year_demerits', v_year_demerits,
    'total_tours_marched', v_total_tours,
    'current_tour_balance', v_current_balance
  );
END;
$function$
;


