set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_tour_balance(p_cadet_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_total_tours_earned INTEGER := 0;
    v_total_tours_served INTEGER := 0;
    v_term RECORD;
    v_report RECORD;
    v_term_credits_remaining INTEGER;
    v_term_cat3_received BOOLEAN;
    v_tours_to_add INTEGER;
BEGIN
    -- 1. Calculate Earned Tours dynamically
    FOR v_term IN SELECT * FROM public.academic_terms ORDER BY start_date ASC LOOP
        v_term_credits_remaining := 15; 
        v_term_cat3_received := false;

        FOR v_report IN
            SELECT 
                r.demerits_effective, 
                -- FIX: Use LEFT JOIN logic with COALESCE to handle missing offense types
                COALESCE(ot.policy_category, 1) as policy_category 
            FROM public.demerit_reports r
            -- FIX: Changed to LEFT JOIN so we never lose a report just because the offense type is missing
            LEFT JOIN public.offense_types ot ON r.offense_type_id = ot.id
            WHERE r.subject_cadet_id = p_cadet_id
              AND r.status = 'completed'
              AND r.date_of_offense BETWEEN v_term.start_date AND v_term.end_date
              AND r.demerits_effective > 0
            ORDER BY r.date_of_offense ASC, r.created_at ASC
        LOOP
            -- Check for Cat 3 Nuke
            IF v_report.policy_category = 3 THEN
                v_term_cat3_received := true;
                v_term_credits_remaining := 0;
            END IF;

            -- Apply Credits
            IF v_term_cat3_received THEN
                 v_total_tours_earned := v_total_tours_earned + v_report.demerits_effective;
            ELSE
                IF v_report.demerits_effective <= v_term_credits_remaining THEN
                    -- Covered completely by credits
                    v_term_credits_remaining := v_term_credits_remaining - v_report.demerits_effective;
                ELSE
                    -- Partially or not covered
                    v_tours_to_add := v_report.demerits_effective - v_term_credits_remaining;
                    v_total_tours_earned := v_total_tours_earned + v_tours_to_add;
                    v_term_credits_remaining := 0;
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    -- 2. Calculate Served Tours
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_tours_served
    FROM public.tour_ledger
    WHERE cadet_id = p_cadet_id AND amount < 0;

    RETURN v_total_tours_earned + v_total_tours_served;
END;
$function$
;


