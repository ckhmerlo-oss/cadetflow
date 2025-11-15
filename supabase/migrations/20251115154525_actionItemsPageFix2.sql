set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_stats(p_cadet_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_term_demerits int := 0;
    v_year_demerits int := 0;
    v_total_tours_marched int := 0;
    v_current_tour_balance int := 0;
    v_current_term_start date;
BEGIN
    -- 1. Determine the start of the current term
    -- We try to fetch from academic_terms, defaulting to 90 days ago if missing
    BEGIN
        SELECT start_date INTO v_current_term_start 
        FROM public.academic_terms 
        WHERE is_current = true 
        LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore errors if table doesn't exist
    END;
    
    -- Fallback if no term found
    IF v_current_term_start IS NULL THEN
         v_current_term_start := (CURRENT_DATE - INTERVAL '90 days');
    END IF;

    -- 2. Calculate Term Demerits (Completed reports since term start)
    SELECT COALESCE(SUM(ot.demerits), 0)
    INTO v_term_demerits
    FROM public.demerit_reports dr
    JOIN public.offense_types ot ON dr.offense_type_id = ot.id
    WHERE dr.subject_cadet_id = p_cadet_id
      AND dr.status = 'completed'
      AND dr.date_of_offense >= v_current_term_start;

    -- 3. Calculate Year Demerits (For now, same logic as term or usually since Aug 1)
    -- You can adjust the date logic here as needed
    SELECT COALESCE(SUM(ot.demerits), 0)
    INTO v_year_demerits
    FROM public.demerit_reports dr
    JOIN public.offense_types ot ON dr.offense_type_id = ot.id
    WHERE dr.subject_cadet_id = p_cadet_id
      AND dr.status = 'completed'
      AND dr.date_of_offense >= (v_current_term_start - INTERVAL '6 months'); 

    -- 4. Current Tour Balance (Sum of all ledger entries)
    SELECT COALESCE(SUM(amount), 0)
    INTO v_current_tour_balance
    FROM public.tour_ledger
    WHERE cadet_id = p_cadet_id;

    -- 5. Total Tours Marched (Sum of negative entries "served")
    SELECT COALESCE(ABS(SUM(amount)), 0)
    INTO v_total_tours_marched
    FROM public.tour_ledger
    WHERE cadet_id = p_cadet_id
      AND amount < 0;

    -- 6. Return the JSON object expected by your frontend
    RETURN json_build_object(
        'term_demerits', v_term_demerits,
        'year_demerits', v_year_demerits,
        'total_tours_marched', v_total_tours_marched,
        'current_tour_balance', v_current_tour_balance
    );
END;
$function$
;


