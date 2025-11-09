drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);

drop function if exists "public"."get_my_dashboard_reports"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_report(p_subject_cadet_id uuid, p_offense_type_id uuid, p_notes text, p_date_of_offense date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  submitter_level INTEGER;
  subject_level INTEGER;
  submitter_role_id uuid;
  submitter_approval_group_id uuid;
  first_approver_group_id uuid;
  new_report_id uuid;
  v_demerits integer; -- NEW variable
BEGIN
  -- 0. Get levels and demerit count
  SELECT public.get_my_role_level() INTO submitter_level;
  SELECT COALESCE(r.default_role_level, 0) INTO subject_level FROM public.profiles p LEFT JOIN public.roles r ON p.role_id = r.id WHERE p.id = p_subject_cadet_id;
  
  -- *** FIX: Fetch the default demerits for this offense ***
  SELECT demerits INTO v_demerits FROM public.offense_types WHERE id = p_offense_type_id;

  IF submitter_level <= subject_level THEN
    RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.';
  END IF;

  SELECT p.role_id INTO submitter_role_id FROM public.profiles p WHERE id = auth.uid();
  SELECT approval_group_id INTO submitter_approval_group_id FROM public.roles WHERE id = submitter_role_id;

  IF submitter_approval_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your role has no approval group defined.';
  END IF;

  SELECT next_approver_group_id INTO first_approver_group_id FROM public.approval_groups WHERE id = submitter_approval_group_id;

  -- *** FIX: Added 'demerits_effective' to both INSERT statements below ***
  IF first_approver_group_id IS NULL THEN
    INSERT INTO public.demerit_reports 
      (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id, demerits_effective)
    VALUES 
      (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'completed', NULL, v_demerits)
    RETURNING id INTO new_report_id;
    
    -- (Calling the tour calculation here since it's auto-completed)
    PERFORM private.calculate_tours_for_new_report(p_subject_cadet_id, v_demerits, (SELECT policy_category FROM offense_types WHERE id = p_offense_type_id), p_date_of_offense);

    INSERT INTO public.approval_log (report_id, actor_id, action, comment) VALUES (new_report_id, auth.uid(), 'submitted', 'Report created (auto-approved)');
    INSERT INTO public.approval_log (report_id, actor_id, action, comment) VALUES (new_report_id, auth.uid(), 'approved', 'Auto-approved by final authority.');
  ELSE
    INSERT INTO public.demerit_reports 
      (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id, demerits_effective)
    VALUES 
      (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'pending_approval', first_approver_group_id, v_demerits)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment) VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');
  END IF;

  RETURN new_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, running_balance bigint, report_id uuid, appeal_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this audit log.';
  END IF;

  RETURN QUERY
  WITH all_events AS (
    SELECT
      r.created_at AS event_date_inner,
      'demerit'::text AS event_type_inner,
      ot.offense_name AS title_inner,
      r.notes AS details_inner,
      r.demerits_effective AS demerits_issued_inner,
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        WHEN r.status = 'completed' THEN COALESCE(tl.amount, r.demerits_effective)
        ELSE 0 
      END AS tour_change_inner,
      (sub.first_name || ' ' || sub.last_name) AS actor_name_inner,
      r.status AS status_inner,
      r.id AS report_id_inner,
      -- *** FIX: Fetch active appeal status ***
      (SELECT a.status FROM public.appeals a WHERE a.report_id = r.id AND a.status NOT IN ('approved', 'rejected_final') LIMIT 1) AS appeal_status_inner
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

CREATE OR REPLACE FUNCTION public.get_my_dashboard_reports()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, "group" json, offense_type json, appeal_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        dr.id, dr.status, dr.created_at, dr.current_approver_group_id, 
        dr.subject_cadet_id, dr.submitted_by, dr.offense_type_id, dr.notes, dr.date_of_offense,
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object('group_name', ag.group_name) AS "group",
        json_build_object('offense_name', ot.offense_name) AS offense_type,
        -- *** FIX: Include appeal status if it involves me ***
        ap.status AS appeal_status
    FROM public.demerit_reports AS dr
    LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
    LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
    LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
    LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id
    -- Join with appeals to see if there is one active for this report
    LEFT JOIN public.appeals AS ap ON dr.id = ap.report_id AND ap.status NOT IN ('approved', 'rejected_final')
    WHERE 
        -- 1. I am the subject
        dr.subject_cadet_id = auth.uid()
        -- 2. I am the submitter
        OR dr.submitted_by = auth.uid()
        -- 3. I am in the normal approval group
        OR (EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.approval_group_id = dr.current_approver_group_id
        ))
        -- 4. *** NEW: I am assigned to the ACTIVE APPEAL ***
        OR (ap.id IS NOT NULL AND (
             ap.current_assignee_id = auth.uid() OR
             EXISTS (
                SELECT 1 FROM public.profiles p
                JOIN public.roles r ON p.role_id = r.id
                WHERE p.id = auth.uid() AND r.approval_group_id = ap.current_group_id
             )
        ));
END;
$function$
;


