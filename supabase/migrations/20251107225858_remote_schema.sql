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
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  
  -- Verify user is in the assigned group
  IF NOT public.is_member_of_approver_group(v_appeal.current_group_id) OR v_appeal.status != 'pending_chain' THEN
     RAISE EXCEPTION 'Permission denied: You cannot act on this appeal right now.';
  END IF;

  IF p_action = 'grant' THEN
     -- If any chain member GRANTS, it goes straight to Commandant for final sign-off
     SELECT id INTO v_cmd_group_id FROM public.approval_groups WHERE group_name = 'Commandant Staff';
     UPDATE public.appeals 
     SET status = 'pending_commandant', current_group_id = v_cmd_group_id, chain_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSIF p_action = 'reject' THEN
     -- Reject back to cadet so they can escalate further if they want
     UPDATE public.appeals 
     SET status = 'rejected_by_chain', chain_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSE
     RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.escalate_appeal(p_appeal_id uuid, p_justification text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_appeal record;
  v_report record;
  v_current_group_id uuid;
  v_next_group_id uuid;
  v_commandant_group_id uuid;
  v_submitter_role_id uuid;
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;
  
  -- Security Check: Only the cadet can escalate
  IF v_appeal.appealing_cadet_id != auth.uid() THEN
     RAISE EXCEPTION 'Permission denied.';
  END IF;

  -- Ensure it's in a state that CAN be escalated
  IF v_appeal.status NOT IN ('rejected_by_issuer', 'rejected_by_chain') THEN
     RAISE EXCEPTION 'This appeal cannot be escalated currently.';
  END IF;

  -- 1. Find where we are currently in the chain
  IF v_appeal.status = 'rejected_by_issuer' THEN
     -- Starting escalation: Find the ISSUER'S group to determine who is next
     SELECT submitted_by INTO v_report FROM public.demerit_reports WHERE id = v_appeal.report_id;
     
     SELECT role_id INTO v_submitter_role_id FROM public.profiles WHERE id = v_report.submitted_by;
     SELECT approval_group_id INTO v_current_group_id FROM public.roles WHERE id = v_submitter_role_id;
  ELSE
     -- Continuing escalation: We already have a current group
     v_current_group_id := v_appeal.current_group_id;
  END IF;

  -- 2. Find the NEXT group
  SELECT next_approver_group_id INTO v_next_group_id FROM public.approval_groups WHERE id = v_current_group_id;
  
  -- 3. Identify Commandant Group (for final destination check)
  SELECT id INTO v_commandant_group_id FROM public.approval_groups WHERE group_name = 'Commandant Staff';

  -- 4. Update Appeal based on what we found
  IF v_next_group_id IS NULL OR v_next_group_id = v_commandant_group_id THEN
     -- Reached the top: Send to Commandant
     UPDATE public.appeals 
     SET status = 'pending_commandant', current_group_id = v_commandant_group_id, current_assignee_id = NULL,
         justification = p_justification, -- Allow them to update their argument
         updated_at = now()
     WHERE id = p_appeal_id;
  ELSE
     -- Still in the chain: Send to next group (e.g., TAC)
     UPDATE public.appeals 
     SET status = 'pending_chain', current_group_id = v_next_group_id, current_assignee_id = NULL,
         justification = p_justification,
         updated_at = now()
     WHERE id = p_appeal_id;
  END IF;
END;
$function$
;


