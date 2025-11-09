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
  -- Verify user is in the assigned group (Commandant Staff)
  IF NOT public.is_member_of_approver_group(v_appeal.current_group_id) THEN
     RAISE EXCEPTION 'Permission denied: You are not in the Commandant Staff.';
  END IF;

  IF p_action = 'grant' THEN
     -- 1. Mark appeal as finally approved
     UPDATE public.appeals 
     SET status = 'approved', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
     
     -- 2. CRITICAL: Set effective demerits to 0 on the report
     UPDATE public.demerit_reports SET demerits_effective = 0 WHERE id = v_appeal.report_id;
     
     -- 3. RE-RUN Ledger Calculation for this report to refund the tours
     -- We do this by 'touching' the tour_ledger. 
     -- Actually, the cleanest way is to delete its ledger entry and re-insert it.
     -- Since it's now 0 demerits, the new insertion will be for 0 tours.
     DELETE FROM public.tour_ledger WHERE report_id = v_appeal.report_id AND action = 'assigned';
     -- (We don't need to re-insert, 0 tours = no entry is fine, or we can insert a 0 entry if we want a record)
     
  ELSIF p_action = 'reject' THEN
     -- Final rejection, nothing changes on the report
     UPDATE public.appeals 
     SET status = 'rejected_final', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSE
     RAISE EXCEPTION 'Invalid action';
  END IF;
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
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  IF v_appeal.current_assignee_id != auth.uid() OR v_appeal.status != 'pending_issuer' THEN
     RAISE EXCEPTION 'Permission denied: You are not the assigned issuer for this appeal.';
  END IF;

  IF p_action = 'grant' THEN
     -- Forward to Commandant
     v_cmd_group_id := public.get_commandant_group_id();
     UPDATE public.appeals 
     SET status = 'pending_commandant', current_assignee_id = NULL, current_group_id = v_cmd_group_id, issuer_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSIF p_action = 'reject' THEN
     -- Send back to cadet to decide on escalation
     UPDATE public.appeals 
     SET status = 'rejected_by_issuer', current_assignee_id = v_appeal.appealing_cadet_id, issuer_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSE
     RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_commandant_group_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT id FROM public.approval_groups WHERE group_name = 'Commandant Staff' LIMIT 1;
$function$
;


