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
  -- First, get the report's CURRENT approval group
  SELECT current_approver_group_id
  INTO current_group_id
  FROM public.demerit_reports
  WHERE id = report_id_to_approve;

  -- *** THIS IS THE FIX ***
  -- Check if the user is a member of THAT group.
  -- This prevents a user with a stale client from approving a report
  -- that has already been moved to the next group.
  -- It uses your existing 'is_member_of_approver_group' function.
  IF NOT public.is_member_of_approver_group(current_group_id) THEN
    RAISE EXCEPTION 'Permission denied: This report may have been actioned by someone else.';
  END IF;
  -- *** END OF FIX ***

  -- If the check passes, proceed with the approval logic
  SELECT next_approver_group_id
  INTO next_group_id
  FROM public.approval_groups
  WHERE id = current_group_id;

  IF next_group_id IS NULL THEN
    -- This is the final approval, set status to 'completed'
    UPDATE public.demerit_reports
    SET
      status = 'completed',
      current_approver_group_id = NULL
    WHERE id = report_id_to_approve;
  ELSE
    -- Move to the next group
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

CREATE OR REPLACE FUNCTION public.mark_green_sheet_as_posted(p_report_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This check is correct per your request.
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action.';
  END IF;

  UPDATE public.demerit_reports
  SET is_posted = true
  WHERE id = ANY(p_report_ids);
END;
$function$
;


