set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_next_escalation_target(p_appeal_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_appeal record;
  v_report_submitter_id uuid;
  v_current_group_id uuid;
  v_next_group_name text;
BEGIN
  SELECT * INTO v_appeal FROM public.appeals WHERE id = p_appeal_id;

  -- Case 1: Rejected by the original issuer. We need to find THEIR group's boss.
  IF v_appeal.status = 'rejected_by_issuer' THEN
     SELECT submitted_by INTO v_report_submitter_id 
     FROM public.demerit_reports WHERE id = v_appeal.report_id;
     
     -- Find the submitter's group ID first
     SELECT r.approval_group_id INTO v_current_group_id
     FROM public.profiles p
     JOIN public.roles r ON p.role_id = r.id
     WHERE p.id = v_report_submitter_id;

  -- Case 2: Rejected by someone in the chain. We already know the current group.
  ELSIF v_appeal.status = 'rejected_by_chain' THEN
     v_current_group_id := v_appeal.current_group_id;
  
  ELSE
     RETURN NULL; -- Not in a state that can be escalated
  END IF;

  -- Now find the name of the NEXT group
  SELECT next_ag.group_name INTO v_next_group_name
  FROM public.approval_groups current_ag
  JOIN public.approval_groups next_ag ON current_ag.next_approver_group_id = next_ag.id
  WHERE current_ag.id = v_current_group_id;

  -- If no next group is found, it usually means the next step is the Commandant
  RETURN COALESCE(v_next_group_name, 'Commandant Staff');
END;
$function$
;


