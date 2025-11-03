set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_kickback(p_report_id uuid, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_report record;
BEGIN
  -- Security Check: Get the report
  SELECT * INTO current_report 
  FROM public.demerit_reports 
  WHERE id = p_report_id;
  
  -- Check if user is in the current approver group
  IF NOT public.is_member_of_approver_group(current_report.current_approver_group_id) THEN
    RAISE EXCEPTION 'You do not have permission to kick-back this report.';
  END IF;

  -- Update report to 'needs_revision' and send it back to the submitter's "queue"
  -- (by setting group to NULL, the submitter will be the only one with edit rights)
  UPDATE public.demerit_reports
  SET 
    status = 'needs_revision', 
    current_approver_group_id = NULL 
  WHERE id = p_report_id;

  -- Log this action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, auth.uid(), 'needs_revision', p_comment);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_rejection(p_report_id uuid, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_report record;
BEGIN
  -- Security Check: Get the report
  SELECT * INTO current_report 
  FROM public.demerit_reports 
  WHERE id = p_report_id;
  
  -- Check if user is in the current approver group
  IF NOT public.is_member_of_approver_group(current_report.current_approver_group_id) THEN
    RAISE EXCEPTION 'You do not have permission to reject this report.';
  END IF;

  -- Update report to 'rejected'
  UPDATE public.demerit_reports
  SET 
    status = 'rejected', 
    current_approver_group_id = NULL -- Remove from all queues
  WHERE id = p_report_id;

  -- Log this action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, auth.uid(), 'rejected', p_comment);
END;
$function$
;


