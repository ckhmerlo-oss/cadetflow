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

  IF p_action = 'grant' THEN
     UPDATE public.appeals 
     SET status = 'approved', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
     
     -- 1. Zero out the effective demerits on the report
     UPDATE public.demerit_reports SET demerits_effective = 0 WHERE id = v_appeal.report_id;

     -- 2. CRITICAL FIX: Zero out the tour ledger entry so the balance drops
     UPDATE public.tour_ledger SET amount = 0 WHERE report_id = v_appeal.report_id;
     
  ELSIF p_action = 'reject' THEN
     UPDATE public.appeals 
     SET status = 'rejected_final', current_assignee_id = NULL, current_group_id = NULL, final_comment = p_comment, updated_at = now()
     WHERE id = p_appeal_id;
  ELSE
     RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$function$
;


