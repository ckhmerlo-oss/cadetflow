set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, report_id uuid, appeal_status text, appeal_note text, date_of_offense timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  
  -- Part 1: Demerit Reports
  SELECT
    dr.created_at as event_date,
    'demerit' as event_type,
    ot.offense_name as title,
    dr.notes as details,
    dr.demerits_effective as demerits_issued,
    tl.amount as tour_change,
    (submitter.last_name || ', ' || submitter.first_name) as actor_name,
    dr.status,
    dr.id as report_id,
    a.status as appeal_status,
    a.final_comment as appeal_note,
    dr.date_of_offense
  FROM public.demerit_reports dr
  LEFT JOIN public.offense_types ot ON dr.offense_type_id = ot.id
  LEFT JOIN public.profiles submitter ON dr.submitted_by = submitter.id
  LEFT JOIN public.tour_ledger tl ON dr.id = tl.report_id
  LEFT JOIN public.appeals a ON dr.id = a.report_id
  WHERE dr.subject_cadet_id = p_cadet_id
  
  UNION ALL
  
  -- Part 2: Ledger Entries (Served & Adjustments)
  SELECT
    tl.created_at as event_date,
    CASE WHEN tl.amount > 0 THEN 'adjustment' ELSE 'served' END as event_type,
    CASE WHEN tl.amount > 0 THEN 'Tour Adjustment' ELSE 'Tours Served' END as title,
    tl.comment as details,
    0 as demerits_issued,
    tl.amount as tour_change,
    (staff.last_name || ', ' || staff.first_name) as actor_name,
    'completed' as status,
    NULL as report_id,
    NULL as appeal_status,
    NULL as appeal_note,
    NULL as date_of_offense
  FROM public.tour_ledger tl
  LEFT JOIN public.profiles staff ON tl.staff_id = staff.id
  WHERE tl.cadet_id = p_cadet_id
    AND (tl.action = 'served' OR tl.action = 'adjustment') -- Catch both types
    
  ORDER BY event_date DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cadet_tour_balance(p_cadet_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_total_tours_earned INTEGER := 0;
    v_ledger_impact INTEGER := 0;
    v_term RECORD;
    v_report RECORD;
    v_term_credits_remaining INTEGER;
    v_term_cat3_received BOOLEAN;
    v_tours_to_add INTEGER;
    v_has_star_tours BOOLEAN;
BEGIN
    -- Check for Star Tours
    SELECT COALESCE(has_star_tours, false) INTO v_has_star_tours
    FROM public.profiles WHERE id = p_cadet_id;

    -- 1. Calculate Earned Tours (Standard Credit Logic)
    FOR v_term IN SELECT * FROM public.academic_terms ORDER BY start_date ASC LOOP
        v_term_credits_remaining := 15; 
        v_term_cat3_received := false;

        FOR v_report IN
            SELECT r.demerits_effective, COALESCE(ot.policy_category, 1) as policy_category 
            FROM public.demerit_reports r
            LEFT JOIN public.offense_types ot ON r.offense_type_id = ot.id
            WHERE r.subject_cadet_id = p_cadet_id
              AND r.status = 'completed'
              AND r.date_of_offense BETWEEN v_term.start_date AND v_term.end_date
              AND r.demerits_effective > 0
            ORDER BY r.date_of_offense ASC, r.created_at ASC
        LOOP
            IF v_report.policy_category = 3 THEN
                v_term_cat3_received := true;
                v_term_credits_remaining := 0;
            END IF;

            IF v_term_cat3_received THEN
                 v_total_tours_earned := v_total_tours_earned + v_report.demerits_effective;
            ELSE
                IF v_report.demerits_effective <= v_term_credits_remaining THEN
                    v_term_credits_remaining := v_term_credits_remaining - v_report.demerits_effective;
                ELSE
                    v_tours_to_add := v_report.demerits_effective - v_term_credits_remaining;
                    v_total_tours_earned := v_total_tours_earned + v_tours_to_add;
                    v_term_credits_remaining := 0;
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    -- 2. Calculate Ledger Impact (Served vs Adjustments)
    -- LOGIC CHANGE: 
    -- Adjustments (amount > 0) are ALWAYS applied (penalty).
    -- Served (amount < 0) are ONLY applied if NOT on Star Tours.
    SELECT COALESCE(SUM(
        CASE 
            WHEN amount > 0 THEN amount 
            WHEN amount < 0 AND v_has_star_tours = false THEN amount 
            ELSE 0 
        END
    ), 0)
    INTO v_ledger_impact
    FROM public.tour_ledger
    WHERE cadet_id = p_cadet_id;

    RETURN v_total_tours_earned + v_ledger_impact;
END;
$function$
;


