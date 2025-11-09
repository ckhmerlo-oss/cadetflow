set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_ledger_stats(p_cadet_id uuid)
 RETURNS TABLE(term_demerits integer, year_demerits integer, total_tours_marched integer, current_tour_balance integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term RECORD;
  v_year_start DATE;
BEGIN
  -- Security Check
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view these stats.';
  END IF;

  -- 1. Get Current Term
  SELECT * INTO v_current_term 
  FROM public.academic_terms 
  WHERE now()::date BETWEEN start_date AND end_date
  LIMIT 1;
  
  -- 2. Get Academic Year Start
  IF EXTRACT(MONTH FROM now()) >= 8 THEN
      v_year_start := make_date(EXTRACT(YEAR FROM now())::int, 8, 1);
  ELSE
      v_year_start := make_date(EXTRACT(YEAR FROM now())::int - 1, 8, 1);
  END IF;

  RETURN QUERY SELECT
    -- Metric 1: Term Demerits
    -- FIX: NOW SUMMING 'demerits_effective' INSTEAD OF 'ot.demerits'
    (SELECT COALESCE(SUM(r.demerits_effective), 0)::int
     FROM public.demerit_reports r
     WHERE r.subject_cadet_id = p_cadet_id
       AND r.status = 'completed'
       AND r.date_of_offense BETWEEN COALESCE(v_current_term.start_date, '1900-01-01'::date) 
                                 AND COALESCE(v_current_term.end_date, '1900-01-01'::date)
    ) AS term_demerits,

    -- Metric 2: Year Demerits
    -- FIX: NOW SUMMING 'demerits_effective' INSTEAD OF 'ot.demerits'
    (SELECT COALESCE(SUM(r.demerits_effective), 0)::int
     FROM public.demerit_reports r
     WHERE r.subject_cadet_id = p_cadet_id
       AND r.status = 'completed'
       AND r.date_of_offense >= v_year_start
    ) AS year_demerits,

    -- Metric 3: Total Tours Marched (Unchanged)
    (SELECT ABS(COALESCE(SUM(amount), 0))::int
     FROM public.tour_ledger
     WHERE cadet_id = p_cadet_id AND action = 'served'
    ) AS total_tours_marched,

    -- Metric 4: Current Balance (Unchanged, already uses ledger)
    public.get_cadet_tour_balance(p_cadet_id) AS current_tour_balance;
END;
$function$
;


