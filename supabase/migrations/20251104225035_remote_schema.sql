set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_next_group_id uuid;
  v_is_final_step boolean := false;
BEGIN
  -- 1. Log this approval action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (report_id_to_approve, auth.uid(), 'Approved', approval_comment);

  -- 2. Find the *next* approval group
  --    (This uses your 'approval_groups' table and 'next_approver_group_id' column)
  SELECT
    ag.next_approver_group_id
  INTO
    v_next_group_id
  FROM
    public.demerit_reports r
  JOIN
    public.approval_groups ag ON r.current_approver_group_id = ag.id
  WHERE
    r.id = report_id_to_approve;

  -- 3. Check if this is the final step
  IF v_next_group_id IS NULL THEN
    -- This IS the final step
    v_is_final_step := true;
    
    UPDATE public.demerit_reports
    SET
      status = 'completed', -- Report is finalized
      current_approver_group_id = NULL
    WHERE
      id = report_id_to_approve;
      
  ELSE
    -- This is NOT the final step
    v_is_final_step := false;
    
    UPDATE public.demerit_reports
    SET
      current_approver_group_id = v_next_group_id -- Advance to next approver
    WHERE
      id = report_id_to_approve;
  END IF;

  -- 4. *** THE FIX ***
  -- If this was the final approval, call the tour calculation function
  IF v_is_final_step = true THEN
    PERFORM public.assign_tours_for_report(report_id_to_approve);
  END IF;

END;
$function$
;


