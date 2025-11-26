set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.pull_report(p_report_id uuid, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report record;
  v_viewer_id uuid := auth.uid();
  v_viewer_role_level int := public.get_my_role_level();
  v_viewer_role_name text := public.get_my_role_name();
  v_action_text text;
BEGIN
  -- 1. Get the report
  SELECT * INTO v_report
  FROM public.demerit_reports
  WHERE id = p_report_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found.';
  END IF;

  -- 2. Security Check: Must be original submitter OR Senior Command Staff (Level 90+)
  -- *** CHANGED FROM 50 TO 90 ***
  IF v_report.submitted_by != v_viewer_id AND v_viewer_role_level < 90 THEN
    RAISE EXCEPTION 'Permission Denied: Only the original issuer or Commandant Staff/Admins can pull this report.';
  END IF;

  -- 3. Comment Check: A reason is required
  IF p_comment IS NULL OR p_comment = '' THEN
    RAISE EXCEPTION 'A comment is required to pull a report.';
  END IF;
  
  -- 4. Determine Action Text for the log
  IF v_report.submitted_by = v_viewer_id THEN
    v_action_text := 'Pulled by Issuer';
  ELSE
    v_action_text := 'Pulled by ' || v_viewer_role_name;
  END IF;

  -- 5. Action 1: Update the report
  UPDATE public.demerit_reports
  SET 
    status = 'pulled',
    demerits_effective = 0
  WHERE id = p_report_id;

  -- 6. Action 2: Nullify the tour ledger entry
  UPDATE public.tour_ledger
  SET amount = 0
  WHERE report_id = p_report_id;

  -- 7. Action 3: Log the action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, v_viewer_id, v_action_text, p_comment);

END;
$function$
;


