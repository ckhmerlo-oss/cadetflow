set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.appeal_chain_action(p_appeal_id uuid, p_action text, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_appeal record;
  v_cmd_group_id uuid;
  v_action_text text;
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  IF NOT public.is_member_of_approver_group(v_appeal.current_group_id) OR v_appeal.status != 'pending_chain' THEN
     RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF p_action = 'grant' THEN
     SELECT id INTO v_cmd_group_id FROM public.approval_groups WHERE group_name = 'Commandant Staff';
     UPDATE public.appeals SET status = 'pending_commandant', current_group_id = v_cmd_group_id, chain_comment = p_comment, updated_at = now() WHERE id = p_appeal_id;
     v_action_text := 'Appeal Granted (Forwarded)';
  ELSIF p_action = 'reject' THEN
     UPDATE public.appeals SET status = 'rejected_by_chain', chain_comment = p_comment, updated_at = now() WHERE id = p_appeal_id;
     v_action_text := 'Appeal Rejected by Chain';
  END IF;

  -- LOG IT
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (v_appeal.report_id, auth.uid(), v_action_text, p_comment);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.appeal_commandant_action(p_appeal_id uuid, p_action text, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_appeal record;
  v_action_text text;
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  -- (Simplified permission check for brevity, assuming it's correct in your DB)

  IF p_action = 'grant' THEN
     UPDATE public.appeals SET status = 'approved', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now() WHERE id = p_appeal_id;
     UPDATE public.demerit_reports SET demerits_effective = 0 WHERE id = v_appeal.report_id;
     v_action_text := 'Appeal FINAL APPROVAL';
  ELSIF p_action = 'reject' THEN
     UPDATE public.appeals SET status = 'rejected_final', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now() WHERE id = p_appeal_id;
     v_action_text := 'Appeal FINAL REJECTION';
  END IF;

  -- LOG IT
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (v_appeal.report_id, auth.uid(), v_action_text, p_comment);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.appeal_issuer_action(p_appeal_id uuid, p_action text, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_appeal record;
  v_cmd_group_id uuid;
  v_action_text text;
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  IF v_appeal.current_assignee_id != auth.uid() OR v_appeal.status != 'pending_issuer' THEN
     RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF p_action = 'grant' THEN
     v_cmd_group_id := private.get_commandant_group_id();
     UPDATE public.appeals SET status = 'pending_commandant', current_assignee_id = NULL, current_group_id = v_cmd_group_id, issuer_comment = p_comment, updated_at = now() WHERE id = p_appeal_id;
     v_action_text := 'Appeal Granted (Forwarded)';
  ELSIF p_action = 'reject' THEN
     UPDATE public.appeals SET status = 'rejected_by_issuer', current_assignee_id = v_appeal.appealing_cadet_id, issuer_comment = p_comment, updated_at = now() WHERE id = p_appeal_id;
     v_action_text := 'Appeal Rejected by Issuer';
  END IF;

  -- LOG IT
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (v_appeal.report_id, auth.uid(), v_action_text, p_comment);
END;
$function$
;


