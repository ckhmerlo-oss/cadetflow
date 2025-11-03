set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_dashboard_stats()
 RETURNS TABLE(term_demerits integer, year_demerits integer, total_tours integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_current_term RECORD;
    v_year_dates RECORD;
    v_term_total int := 0;
    v_year_total int := 0;
BEGIN
    -- 1. Find the current academic term
    SELECT * INTO v_current_term
    FROM public.academic_terms
    WHERE now()::date BETWEEN start_date AND end_date
    LIMIT 1;

    -- If no current term (e.g., summer break), return 0s
    IF v_current_term IS NULL THEN
        RETURN QUERY SELECT 0, 0, 0;
        RETURN;
    END IF;
    
    -- 2. Find the start/end dates for the entire current academic year
    SELECT 
        MIN(start_date) AS year_start, 
        MAX(end_date) AS year_end 
    INTO v_year_dates
    FROM public.academic_terms
    WHERE academic_year_start = v_current_term.academic_year_start;

    -- 3. Calculate demerits for the current term
    SELECT COALESCE(SUM((content->>'demerit_count')::int), 0)
    INTO v_term_total
    FROM public.demerit_reports
    WHERE subject_cadet_id = v_user_id
      AND status = 'completed'
      AND date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;

    -- 4. Calculate demerits for the current academic year
    SELECT COALESCE(SUM((content->>'demerit_count')::int), 0)
    INTO v_year_total
    FROM public.demerit_reports
    WHERE subject_cadet_id = v_user_id
      AND status = 'completed'
      AND date_of_offense BETWEEN v_year_dates.year_start AND v_year_dates.year_end;

    -- 5. Return all stats (tours is a placeholder as requested)
    RETURN QUERY SELECT v_term_total, v_year_total, 0;
END;
$function$
;


