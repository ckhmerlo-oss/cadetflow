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
    v_has_star_tours BOOLEAN; -- ADDED
BEGIN
    -- Get the cadet's Star Tour status
    SELECT COALESCE(has_star_tours, false)
    INTO v_has_star_tours
    FROM public.profiles
    WHERE id = p_cadet_id;

    -- 1. Calculate Earned Tours (Same as before)
    FOR v_term IN SELECT * FROM public.academic_terms ORDER BY start_date ASC LOOP
        v_term_credits_remaining := 15; 
        v_term_cat3_received := false;

        FOR v_report IN
            SELECT 
                r.demerits_effective, 
                COALESCE(ot.policy_category, 1) as policy_category 
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

    -- 2. Calculate Served Tours (*** UPDATED LOGIC ***)
    IF v_has_star_tours THEN
        -- If on Star Tours, *NEVER* count served tours. Balance can only go up.
        v_total_tours_served := 0;
    ELSE
        -- If not on Star Tours, calculate served tours normally
        SELECT COALESCE(SUM(amount), 0)
        INTO v_total_tours_served
        FROM public.tour_ledger
        WHERE cadet_id = p_cadet_id AND amount < 0;
    END IF;

    -- Return total (Earned + Served). If on Star Tours, Served will be 0.
    RETURN v_total_tours_earned + v_total_tours_served;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_served_tours(p_cadet_id uuid, p_tours_served integer, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_has_star_tours boolean;
BEGIN
  -- Check the cadet's Star Tour status
  SELECT has_star_tours
  INTO v_has_star_tours
  FROM public.profiles
  WHERE id = p_cadet_id;

  -- BLOCK if the cadet is on Star Tours
  IF v_has_star_tours THEN
    RAISE EXCEPTION 'Cannot log served time. This cadet is on * (Star) Tours.';
  END IF;

  -- Proceed if not on Star Tours
  INSERT INTO public.tour_ledger
    (cadet_id, report_id, term_id, action, amount, comment, staff_id)
  VALUES
    (p_cadet_id, NULL, NULL, 'served', -ABS(p_tours_served), p_comment, auth.uid());
END;
$function$
;


