alter table "public"."demerit_reports" drop constraint "check_offense_date_not_future";

alter table "public"."demerit_reports" add constraint "check_offense_date_not_future" CHECK ((date_of_offense <= (now() + '00:05:00'::interval))) not valid;

alter table "public"."demerit_reports" validate constraint "check_offense_date_not_future";

set check_function_bodies = off;

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
  -- Permission check
  IF v_appeal.current_assignee_id != auth.uid() OR v_appeal.status != 'pending_issuer' THEN
     RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF p_action = 'grant' THEN
     -- *** FIX: Get Commandant Group ID directly, no 'private' schema needed ***
     SELECT id INTO v_cmd_group_id FROM public.approval_groups WHERE group_name = 'Commandant Staff' LIMIT 1;
     
     UPDATE public.appeals 
     SET status = 'pending_commandant', current_assignee_id = NULL, current_group_id = v_cmd_group_id, issuer_comment = p_comment, updated_at = now() 
     WHERE id = p_appeal_id;
     
     v_action_text := 'Appeal Granted (Forwarded)';
     
  ELSIF p_action = 'reject' THEN
     UPDATE public.appeals 
     SET status = 'rejected_by_issuer', current_assignee_id = v_appeal.appealing_cadet_id, issuer_comment = p_comment, updated_at = now() 
     WHERE id = p_appeal_id;
     
     v_action_text := 'Appeal Rejected by Issuer';
  ELSE
      RAISE EXCEPTION 'Invalid action';
  END IF;

  -- LOG IT
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (v_appeal.report_id, auth.uid(), v_action_text, p_comment);
END;
$function$
;


