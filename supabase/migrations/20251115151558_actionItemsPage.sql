set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.bulk_approve_reports(p_report_ids uuid[], p_comment text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  report_id uuid;
  current_group_id uuid;
  next_group_id uuid;
  success_count int := 0;
  fail_count int := 0;
BEGIN
  FOREACH report_id IN ARRAY p_report_ids
  LOOP
    BEGIN
      -- Get the report's current group
      SELECT current_approver_group_id
      INTO current_group_id
      FROM public.demerit_reports
      WHERE id = report_id;

      -- *** SECURITY CHECK ***
      -- Use the same check from our previous bug fix!
      IF (current_group_id IS NOT NULL AND public.is_member_of_approver_group(current_group_id)) THEN
        
        SELECT next_approver_group_id
        INTO next_group_id
        FROM public.approval_groups
        WHERE id = current_group_id;

        IF next_group_id IS NULL THEN
          UPDATE public.demerit_reports
          SET status = 'completed', current_approver_group_id = NULL
          WHERE id = report_id;
        ELSE
          UPDATE public.demerit_reports
          SET current_approver_group_id = next_group_id
          WHERE id = report_id;
        END IF;

        INSERT INTO public.approval_log (report_id, actor_id, "action", comment)
        VALUES (report_id, auth.uid(), 'approved', p_comment);
        
        success_count := success_count + 1;
      ELSE
        fail_count := fail_count + 1;
      END IF;
    EXCEPTION
      WHEN others THEN
        fail_count := fail_count + 1;
    END;
  END LOOP;

  RETURN json_build_object('success', success_count, 'failed', fail_count);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.bulk_kickback_reports(p_report_ids uuid[], p_comment text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  report_id uuid;
  current_group_id uuid;
  submitter_id uuid;
  success_count int := 0;
  fail_count int := 0;
BEGIN
  IF p_comment IS NULL OR p_comment = '' THEN
    RAISE EXCEPTION 'A comment is required to kick-back reports.';
  END IF;

  FOREACH report_id IN ARRAY p_report_ids
  LOOP
    BEGIN
      SELECT current_approver_group_id, submitted_by
      INTO current_group_id, submitter_id
      FROM public.demerit_reports
      WHERE id = report_id;

      -- Security Check
      IF (current_group_id IS NOT NULL AND public.is_member_of_approver_group(current_group_id)) THEN
        
        -- Kickback logic: Set status to 'needs_revision' and group to NULL (returns to submitter)
        UPDATE public.demerit_reports
        SET status = 'needs_revision', current_approver_group_id = NULL
        WHERE id = report_id;

        INSERT INTO public.approval_log (report_id, actor_id, "action", comment)
        VALUES (report_id, auth.uid(), 'kickback', p_comment);
        
        success_count := success_count + 1;
      ELSE
        fail_count := fail_count + 1;
      END IF;
    EXCEPTION
      WHEN others THEN
        fail_count := fail_count + 1;
    END;
  END LOOP;

  RETURN json_build_object('success', success_count, 'failed', fail_count);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.bulk_reject_reports(p_report_ids uuid[], p_comment text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  report_id uuid;
  current_group_id uuid;
  success_count int := 0;
  fail_count int := 0;
BEGIN
  IF p_comment IS NULL OR p_comment = '' THEN
    RAISE EXCEPTION 'A comment is required to reject reports.';
  END IF;

  FOREACH report_id IN ARRAY p_report_ids
  LOOP
    BEGIN
      SELECT current_approver_group_id
      INTO current_group_id
      FROM public.demerit_reports
      WHERE id = report_id;

      -- *** SECURITY CHECK ***
      IF (current_group_id IS NOT NULL AND public.is_member_of_approver_group(current_group_id)) THEN
        
        UPDATE public.demerit_reports
        SET status = 'rejected', current_approver_group_id = NULL
        WHERE id = report_id;

        INSERT INTO public.approval_log (report_id, actor_id, "action", comment)
        VALUES (report_id, auth.uid(), 'rejected', p_comment);
        
        success_count := success_count + 1;
      ELSE
        fail_count := fail_count + 1;
      END IF;
    EXCEPTION
      WHEN others THEN
        fail_count := fail_count + 1;
    END;
  END LOOP;

  RETURN json_build_object('success', success_count, 'failed', fail_count);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_action_items()
 RETURNS TABLE(id uuid, created_at timestamp with time zone, status text, subject json, submitter json, company json, offense_type json, notes text, logs json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    my_approval_group_id uuid;
BEGIN
    -- Get user's approval group
    SELECT r.approval_group_id
    INTO my_approval_group_id
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid();

    IF my_approval_group_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        dr.id,
        dr.created_at,
        dr.status,
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object('company_name', c.company_name) AS "company", 
        -- Include demerits in the offense object
        json_build_object('offense_name', ot.offense_name, 'demerits', ot.demerits) AS offense_type,
        dr.notes,
        -- Subquery to get the approval log history
        COALESCE((
            SELECT json_agg(json_build_object(
                'actor_name', (SELECT last_name || ', ' || SUBSTRING(first_name, 1, 1) || '.' FROM public.profiles WHERE id = al.actor_id),
                'action', al.action,
                'date', al.created_at,
                'comment', al.comment
            ) ORDER BY al.created_at DESC)
            FROM public.approval_log al
            WHERE al.report_id = dr.id
        ), '[]'::json) AS logs
    FROM 
        public.demerit_reports AS dr
    LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
    LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
    LEFT JOIN public.companies AS c ON s.company_id = c.id
    LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id
    WHERE
        dr.status = 'pending_approval'
        AND dr.current_approver_group_id = my_approval_group_id
    ORDER BY
        dr.created_at ASC;
END;
$function$
;


