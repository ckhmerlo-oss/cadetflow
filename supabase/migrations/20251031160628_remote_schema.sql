drop policy "Involved parties can edit report" on "public"."demerit_reports";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.user_acted_on_report(p_report_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  -- Enforce search_path to prevent schema spoofing attacks
  SET search_path = public;

  SELECT EXISTS (
    SELECT 1
    FROM public.approval_log
    WHERE 
      report_id = p_report_id 
      AND actor_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.create_new_report(title text, subject_cadet_id uuid, content jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  submitter_level INTEGER := public.get_my_role_level(); -- Use the STABLE function!
  subject_level INTEGER;
  submitter_group_id uuid;
  first_approver_group_id uuid;
  new_report_id uuid;
BEGIN
  -- 0. HIERARCHICAL CHECK (New Step)
  SELECT role_level INTO subject_level
  FROM public.profiles
  WHERE id = subject_cadet_id;

  IF submitter_level <= subject_level THEN
      RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.'
      USING HINT = 'Reports must be submitted by a user with a strictly higher role_level than the subject.';
  END IF;

  -- Step 1: Find the submitter's "home" group
  SELECT group_id INTO submitter_group_id
  FROM public.profiles
  WHERE id = auth.uid();

  IF submitter_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: You are not assigned to a group.';
  END IF;

  -- Step 2: Find the *next* group in the chain
  SELECT next_approver_group_id INTO first_approver_group_id
  FROM public.approval_groups
  WHERE id = submitter_group_id;

  IF first_approver_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your group has no approval chain defined.';
  END IF;

  -- Step 3: Create the new report
  INSERT INTO public.demerit_reports (title, subject_cadet_id, content, submitted_by, status, current_approver_group_id)
  VALUES (title, subject_cadet_id, content, auth.uid(), 'pending_approval', first_approver_group_id)
  RETURNING id INTO new_report_id;

  -- Step 4: Log this submission
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');

  RETURN new_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role_level()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  -- RLS is effectively bypassed for this internal query because 
  -- the function is running as the definer (e.g., postgres), not the invoker (the authenticated user).
  SELECT role_level
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_report record;
  current_group_chain record;
BEGIN
  -- Security Check
  SELECT * INTO current_report FROM public.demerit_reports WHERE id = report_id_to_approve;
  IF NOT public.is_member_of_approver_group(current_report.current_approver_group_id) THEN
    RAISE EXCEPTION 'You do not have permission to approve this report.';
  END IF;

  -- Logic: Find the *next* group from the current one
  SELECT next_approver_group_id INTO current_group_chain
  FROM public.approval_groups
  WHERE id = current_report.current_approver_group_id;

  -- Update the report based on the chain
  IF current_group_chain.next_approver_group_id IS NULL THEN
    -- This is the FINAL approver.
    UPDATE public.demerit_reports
    SET status = 'approved', current_approver_group_id = NULL
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

CREATE OR REPLACE FUNCTION public.is_member_of_approver_group(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = (SELECT auth.uid())::uuid
  );
$function$
;


  create policy "Involved parties can edit report"
  on "public"."demerit_reports"
  as permissive
  for update
  to authenticated
using (((( SELECT auth.uid() AS uid) = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id) OR public.user_acted_on_report(id)))
with check (((( SELECT auth.uid() AS uid) = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id)));



