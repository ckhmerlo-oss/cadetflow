set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, running_balance bigint, report_id uuid, appeal_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this audit log.';
  END IF;

  RETURN QUERY
  WITH all_events AS (
    -- Demerit Reports
    SELECT
      r.created_at AS event_date_inner,
      'demerit'::text AS event_type_inner,
      ot.offense_name AS title_inner,
      r.notes AS details_inner,
      r.demerits_effective AS demerits_issued_inner,
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        -- *** THE FIX IS HERE: Use r.demerits_effective as fallback ***
        WHEN r.status = 'completed' THEN COALESCE(tl.amount, r.demerits_effective)
        ELSE 0 
      END AS tour_change_inner,
      (sub.first_name || ' ' || sub.last_name) AS actor_name_inner,
      r.status AS status_inner,
      r.id AS report_id_inner,
      -- Get the appeal status, even if it's finished (approved/rejected_final)
      (SELECT a.status FROM public.appeals a WHERE a.report_id = r.id ORDER BY a.updated_at DESC LIMIT 1) AS appeal_status_inner
    FROM
      public.demerit_reports r
    LEFT JOIN
      public.offense_types ot ON r.offense_type_id = ot.id
    LEFT JOIN
      public.profiles sub ON r.submitted_by = sub.id
    LEFT JOIN
      public.tour_ledger tl ON r.id = tl.report_id AND tl.action = 'assigned'
    WHERE
      r.subject_cadet_id = p_cadet_id

    UNION ALL

    -- Tours Served
    SELECT
      tl.created_at AS event_date_inner,
      'served'::text AS event_type_inner,
      'Tours Served'::text AS title_inner,
      tl.comment AS details_inner,
      0 AS demerits_issued_inner,
      tl.amount AS tour_change_inner,
      (staff.first_name || ' ' || staff.last_name) AS actor_name_inner,
      'completed'::text AS status_inner,
      NULL::uuid AS report_id_inner,
      NULL::text AS appeal_status_inner
    FROM
      public.tour_ledger tl
    LEFT JOIN
      public.profiles staff ON tl.staff_id = staff.id
    WHERE
      tl.cadet_id = p_cadet_id
      AND tl.action = 'served'
  )
  SELECT
    ae.event_date_inner, ae.event_type_inner, ae.title_inner, ae.details_inner, ae.demerits_issued_inner, ae.tour_change_inner, ae.actor_name_inner, ae.status_inner,
    SUM(ae.tour_change_inner) OVER (ORDER BY ae.event_date_inner ASC) AS running_balance,
    ae.report_id_inner,
    ae.appeal_status_inner
  FROM all_events ae
  ORDER BY ae.event_date_inner DESC;
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


