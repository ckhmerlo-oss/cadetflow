set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.resubmit_report(p_report_id uuid, p_new_offense_type_id uuid, p_new_notes text, p_new_date_of_offense date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_submitter_id uuid;
  v_current_status text;
BEGIN
  -- 1. Get the report's current status and original submitter
  SELECT
    demerit_reports.status,
    demerit_reports.submitted_by
  INTO
    v_current_status,
    v_submitter_id
  FROM demerit_reports
  WHERE id = p_report_id;

  -- 2. Check permissions
  -- Only the original submitter (auth.uid()) can resubmit it,
  -- and only if the status is 'needs_revision'.
  IF v_submitter_id != auth.uid() THEN
    RAISE EXCEPTION 'You are not the original submitter of this report.';
  END IF;

  IF v_current_status != 'needs_revision' THEN
    RAISE EXCEPTION 'This report is not in a "needs_revision" state.';
  END IF;

  -- 3. Update the report details and set status back to 'pending_approval'
  UPDATE demerit_reports
  SET
    offense_type_id = p_new_offense_type_id,
    notes = p_new_notes,
    date_of_offense = p_new_date_of_offense,
    status = 'pending_approval' -- Put it back in the queue
  WHERE
    id = p_report_id;

  -- 4. Log this action
  INSERT INTO approval_log (report_id, actor_id, action, comment)
  VALUES (
    p_report_id,
    auth.uid(), -- The user taking the action
    'Edited & Resubmitted',
    'The report was updated and resubmitted for approval.'
  );
END;
$function$
;


