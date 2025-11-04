set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_tours_for_cadet(p_cadet_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_total_tours_earned INTEGER := 0;
    v_total_tours_marched INTEGER := 0;
    v_term RECORD;
    v_report_data RECORD; 
    v_term_credits_remaining INTEGER;
    v_term_cat3_received BOOLEAN;
    v_demerits INTEGER;
    v_policy_category INTEGER;
    v_tours_to_add INTEGER;
BEGIN
    FOR v_term IN
        SELECT * FROM public.academic_terms ORDER BY start_date ASC
    LOOP
        v_term_credits_remaining := 15; 
        v_term_cat3_received := false;

        FOR v_report_data IN
            SELECT 
                ot.demerits, 
                ot.policy_category
            FROM public.demerit_reports dr
            JOIN public.offense_types ot ON dr.offense_type_id = ot.id
            WHERE dr.subject_cadet_id = p_cadet_id
              AND dr.status = 'completed'
              AND dr.date_of_offense BETWEEN v_term.start_date AND v_term.end_date
            ORDER BY dr.date_of_offense ASC, dr.created_at ASC
        LOOP
            v_demerits := v_report_data.demerits;
            v_policy_category := v_report_data.policy_category;

            IF v_policy_category = 3 THEN
                v_total_tours_earned := v_total_tours_earned + v_demerits;
                v_term_cat3_received := true;
                v_term_credits_remaining := 0;
            ELSIF v_term_cat3_received = true THEN
                v_total_tours_earned := v_total_tours_earned + v_demerits;
            ELSE
                IF v_demerits <= v_term_credits_remaining THEN
                    v_term_credits_remaining := v_term_credits_remaining - v_demerits;
                ELSE
                    v_tours_to_add := v_demerits - v_term_credits_remaining;
                    v_total_tours_earned := v_total_tours_earned + v_tours_to_add;
                    v_term_credits_remaining := 0;
                END IF;
            END IF;
        END LOOP; 
    END LOOP; 

    SELECT COALESCE(SUM(tours_marched_count), 0)
    INTO v_total_tours_marched
    FROM public.tours_marched
    WHERE cadet_id = p_cadet_id;

    RETURN v_total_tours_earned - v_total_tours_marched;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_new_report(p_subject_cadet_id uuid, p_offense_type_id uuid, p_notes text, p_date_of_offense date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  submitter_level INTEGER;
  subject_level INTEGER;
  submitter_group_id uuid;
  first_approver_group_id uuid;
  new_report_id uuid;
  demerit_count_to_add INTEGER;
BEGIN
  -- 0. Get levels
  SELECT role_level INTO submitter_level FROM public.profiles WHERE id = auth.uid();
  SELECT role_level INTO subject_level FROM public.profiles WHERE id = p_subject_cadet_id;

  IF submitter_level <= subject_level THEN
      RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.';
  END IF;

  -- 1. Find the submitter's "home" group
  SELECT group_id INTO submitter_group_id FROM public.profiles WHERE id = auth.uid();
  IF submitter_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: You are not assigned to a group.';
  END IF;

  -- 2. Find the *next* group in the chain
  SELECT next_approver_group_id INTO first_approver_group_id FROM public.approval_groups WHERE id = submitter_group_id;

  -- *** NEW LOGIC: Check if submitter is their own final approver ***
  IF first_approver_group_id IS NULL THEN
    -- Submitter IS the final approver. Auto-complete the report.
    
    -- 1. Get demerit count
    SELECT demerits INTO demerit_count_to_add
    FROM public.offense_types
    WHERE id = p_offense_type_id;

    -- 2. Insert the report as 'completed'
    INSERT INTO public.demerit_reports 
      (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES 
      (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'completed', NULL)
    RETURNING id INTO new_report_id;

    -- 3. Apply demerits to profile
    UPDATE public.profiles
    SET total_demerits = total_demerits + demerit_count_to_add
    WHERE id = p_subject_cadet_id;

    -- 4. Log 'submitted'
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created (auto-approved)');

    -- 5. Log 'approved'
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'approved', 'Auto-approved by final authority.');

  ELSE
    -- Standard approval chain
    INSERT INTO public.demerit_reports 
      (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES 
      (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'pending_approval', first_approver_group_id)
    RETURNING id INTO new_report_id;
    
    -- Log 'submitted'
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');
  END IF;

  RETURN new_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_pending_reports_for_faculty()
 RETURNS TABLE(id uuid, title text, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, subject json, submitter json, "group" json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    my_level INTEGER;
BEGIN
    -- Get the role_level
    SELECT p.role_level 
    INTO my_level 
    FROM public.profiles p 
    WHERE p.id = auth.uid();

    IF my_level >= 50 THEN
        RETURN QUERY
        SELECT 
            dr.id,
            ot.offense_name AS title, 
            dr.status,
            dr.created_at,
            dr.current_approver_group_id,
            dr.subject_cadet_id,
            dr.submitted_by,
            json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
            json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
            json_build_object('group_name', ag.group_name) AS "group"
        FROM public.demerit_reports AS dr
        LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id 
        LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
        LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
        LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
        WHERE
            dr.status = 'pending_approval' OR dr.status = 'needs_revision'
        ORDER BY
            dr.created_at DESC;
    END IF;

    RETURN;
END;
$function$
;

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
    v_tour_balance int := 0;
BEGIN
    -- 1. Find the current academic term
    SELECT * INTO v_current_term
    FROM public.academic_terms
    WHERE now()::date BETWEEN start_date AND end_date
    LIMIT 1;

    IF v_current_term IS NULL THEN
        SELECT now()::date AS start_date, now()::date AS end_date, EXTRACT(YEAR FROM now())::int as academic_year_start
        INTO v_current_term;
    END IF;
    
    -- 2. Find the start/end dates for the entire current academic year
    SELECT MIN(start_date) AS year_start, MAX(end_date) AS year_end 
    INTO v_year_dates
    FROM public.academic_terms
    WHERE academic_year_start = v_current_term.academic_year_start;
    
    IF v_year_dates.year_start IS NULL THEN
        v_year_dates.year_start := now()::date;
        v_year_dates.year_end := now()::date;
    END IF;

    -- 3. Calculate demerits for the current term
    SELECT COALESCE(SUM(ot.demerits), 0)
    INTO v_term_total
    FROM public.demerit_reports dr
    JOIN public.offense_types ot ON dr.offense_type_id = ot.id
    WHERE dr.subject_cadet_id = v_user_id
      AND dr.status = 'completed'
      AND dr.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;

    -- 4. Calculate demerits for the current academic year
    SELECT COALESCE(SUM(ot.demerits), 0)
    INTO v_year_total
    FROM public.demerit_reports dr
    JOIN public.offense_types ot ON dr.offense_type_id = ot.id
    WHERE dr.subject_cadet_id = v_user_id
      AND dr.status = 'completed'
      AND dr.date_of_offense BETWEEN v_year_dates.year_start AND v_year_dates.year_end;

    -- 5. Calculate tour balance
    v_tour_balance := public.calculate_tours_for_cadet(v_user_id);
    
    -- 6. Return all stats
    RETURN QUERY SELECT v_term_total, v_year_total, v_tour_balance;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  current_report record;
  current_group_chain record;
  demerit_count_to_add INTEGER;
BEGIN
  -- Security Check
  SELECT * INTO current_report FROM public.demerit_reports WHERE id = report_id_to_approve;
  
  IF current_report.status = 'completed' THEN
    RAISE EXCEPTION 'This report is already completed and cannot be modified.';
  END IF;

  IF NOT public.is_member_of_approver_group(current_report.current_approver_group_id) THEN
    RAISE EXCEPTION 'You do not have permission to approve this report.';
  END IF;

  -- Logic: Find the *next* group from the current one
  SELECT next_approver_group_id INTO current_group_chain
  FROM public.approval_groups
  WHERE id = current_report.current_approver_group_id;

  IF current_group_chain.next_approver_group_id IS NULL THEN
    -- *** This is the FINAL approver. ***
    
    SELECT ot.demerits
    INTO demerit_count_to_add
    FROM public.offense_types ot
    WHERE ot.id = current_report.offense_type_id;

    UPDATE public.profiles
    SET total_demerits = total_demerits + demerit_count_to_add
    WHERE id = current_report.subject_cadet_id;
    
    UPDATE public.demerit_reports
    SET status = 'completed', current_approver_group_id = NULL
    WHERE id = report_id_to_approve;
    
  ELSE
    -- This is NOT the final approver. Pass it up the chain.
    UPDATE public.demerit_reports
    SET status = 'pending_approval', current_approver_group_id = current_group_chain.next_approver_group_id
    WHERE id = report_id_to_approve;
  END IF;

  -- Log this action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (report_id_to_approve, auth.uid(), 'approved', approval_comment);
END;
$function$
;


  create policy "Cadets can see profiles of people involved in their reports"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (((EXISTS ( SELECT 1
   FROM public.demerit_reports dr
  WHERE ((dr.subject_cadet_id = auth.uid()) AND (dr.submitted_by = profiles.id)))) OR (EXISTS ( SELECT 1
   FROM (public.approval_log al
     JOIN public.demerit_reports dr ON ((al.report_id = dr.id)))
  WHERE ((dr.subject_cadet_id = auth.uid()) AND (al.actor_id = profiles.id))))));



