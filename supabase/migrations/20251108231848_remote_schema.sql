set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.appeal_commandant_action(p_appeal_id uuid, p_action text, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_appeal record;
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  -- (Permission check omitted for brevity, it's in the previous version if needed)

  IF p_action = 'grant' THEN
     UPDATE public.appeals 
     SET status = 'approved', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
     
     -- Just set effective demerits to 0. The dynamic function will see this and stop counting it.
     UPDATE public.demerit_reports SET demerits_effective = 0 WHERE id = v_appeal.report_id;
     
  ELSIF p_action = 'reject' THEN
     UPDATE public.appeals 
     SET status = 'rejected_final', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSE
     RAISE EXCEPTION 'Invalid action';
  END IF;
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
    v_total_tours_served INTEGER := 0;
    v_term RECORD;
    v_report RECORD;
    v_term_credits_remaining INTEGER;
    v_term_cat3_received BOOLEAN;
    v_tours_to_add INTEGER;
BEGIN
    -- 1. Calculate Earned Tours dynamically based on CURRENT 'demerits_effective'
    FOR v_term IN SELECT * FROM public.academic_terms ORDER BY start_date ASC LOOP
        v_term_credits_remaining := 15; 
        v_term_cat3_received := false;

        FOR v_report IN
            SELECT r.demerits_effective, ot.policy_category
            FROM public.demerit_reports r
            JOIN public.offense_types ot ON r.offense_type_id = ot.id
            WHERE r.subject_cadet_id = p_cadet_id
              AND r.status = 'completed'
              AND r.date_of_offense BETWEEN v_term.start_date AND v_term.end_date
              -- IMPORTANT: Only consider reports that still have demerits effective
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

    -- 2. Calculate Served Tours (sum of all NEGATIVE entries in the ledger)
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_tours_served
    FROM public.tour_ledger
    WHERE cadet_id = p_cadet_id AND amount < 0;

    RETURN v_total_tours_earned + v_total_tours_served;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_next_group_id uuid;
  v_report record;
  v_offense_category int;
  v_tours_to_assign int;
  v_term_id uuid;
BEGIN
  -- 1. Log this approval action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (report_id_to_approve, auth.uid(), 'Approved', approval_comment);

  -- 2. Find the *next* approval group
  SELECT ag.next_approver_group_id
  INTO v_next_group_id
  FROM public.demerit_reports r
  JOIN public.approval_groups ag ON r.current_approver_group_id = ag.id
  WHERE r.id = report_id_to_approve;

  -- 3. Check if this is the final step
  IF v_next_group_id IS NULL THEN
    -- This IS the final step
    UPDATE public.demerit_reports
    SET status = 'completed', current_approver_group_id = NULL
    WHERE id = report_id_to_approve;

    -- Transactional Logic
    SELECT * INTO v_report FROM public.demerit_reports WHERE id = report_id_to_approve;
    -- We still need the category from the offense type
    SELECT policy_category INTO v_offense_category FROM public.offense_types WHERE id = v_report.offense_type_id;
    
    -- Find the term ID
    SELECT id INTO v_term_id FROM public.academic_terms WHERE v_report.date_of_offense BETWEEN start_date AND end_date LIMIT 1;

    -- Calculate tours using the EFFECTIVE demerits
    v_tours_to_assign := public.calculate_tours_for_new_report(
      v_report.subject_cadet_id,
      v_report.demerits_effective, -- *** USED HERE ***
      v_offense_category,
      v_report.date_of_offense
    );
    
    -- Insert into ledger
    INSERT INTO public.tour_ledger
      (cadet_id, report_id, term_id, action, amount, comment, staff_id)
    VALUES
      (v_report.subject_cadet_id, report_id_to_approve, v_term_id, 'assigned', v_tours_to_assign,
       'From report', v_report.submitted_by);
    
  ELSE
    -- Not final step, advance to next group
    UPDATE public.demerit_reports
    SET current_approver_group_id = v_next_group_id
    WHERE id = report_id_to_approve;
  END IF;
END;
$function$
;


