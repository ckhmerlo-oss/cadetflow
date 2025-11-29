set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_group_id uuid;
  next_group_id uuid;
BEGIN
  -- Get the report's CURRENT approval group
  SELECT current_approver_group_id
  INTO current_group_id
  FROM public.demerit_reports
  WHERE id = report_id_to_approve;

  -- Security Check: Prevent stale approvals
  IF NOT public.is_member_of_approver_group(current_group_id) THEN
    RAISE EXCEPTION 'Permission denied: This report may have been actioned by someone else.';
  END IF;

  -- Determine next step in chain
  SELECT next_approver_group_id
  INTO next_group_id
  FROM public.approval_groups
  WHERE id = current_group_id;

  IF next_group_id IS NULL THEN
    -- Final Approval: Mark completed
    -- This UPDATE will fire the 'on_report_affect_balance' trigger automatically
    UPDATE public.demerit_reports
    SET
      status = 'completed',
      current_approver_group_id = NULL
    WHERE id = report_id_to_approve;
  ELSE
    -- Intermediate Approval: Move to next group
    UPDATE public.demerit_reports
    SET
      current_approver_group_id = next_group_id
    WHERE id = report_id_to_approve;
  END IF;

  -- Log the action
  INSERT INTO public.approval_log (report_id, actor_id, "action", comment)
  VALUES (report_id_to_approve, auth.uid(), 'approved', approval_comment);

END;
$function$
;


