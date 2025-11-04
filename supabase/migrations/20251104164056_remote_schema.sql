alter table "public"."demerit_reports" add column "revision_by_group_id" uuid;

alter table "public"."demerit_reports" add constraint "demerit_reports_revision_by_group_id_fkey" FOREIGN KEY (revision_by_group_id) REFERENCES public.approval_groups(id) ON DELETE SET NULL not valid;

alter table "public"."demerit_reports" validate constraint "demerit_reports_revision_by_group_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_kickback(p_report_id uuid, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_kicker_group_id uuid;
BEGIN
  -- 1. Get the group that is currently assigned to approve
  SELECT current_approver_group_id
  INTO v_kicker_group_id
  FROM demerit_reports
  WHERE id = p_report_id;

  -- 2. Update the report:
  --    - Set status to 'needs_revision'
  --    - Clear the 'current_approver_group_id'
  --    - Store the kicker's group ID in 'revision_by_group_id'
  UPDATE demerit_reports
  SET
    status = 'needs_revision',
    current_approver_group_id = NULL,
    revision_by_group_id = v_kicker_group_id
  WHERE id = p_report_id;

  -- 3. Log this action
  INSERT INTO approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, auth.uid(), 'Kicked Back for Revision', p_comment);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.resubmit_report(p_report_id uuid, p_new_offense_type_id uuid, p_new_notes text, p_new_date_of_offense date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_submitter_id uuid;
  v_current_status text;
  v_next_approver_group_id uuid; -- The group that kicked it back
BEGIN
  -- 1. Get the report's data, including who kicked it back
  SELECT
    status,
    submitted_by,
    revision_by_group_id
  INTO
    v_current_status,
    v_submitter_id,
    v_next_approver_group_id
  FROM demerit_reports
  WHERE id = p_report_id;

  -- 2. Check permissions
  IF v_submitter_id != auth.uid() THEN
    RAISE EXCEPTION 'You are not the original submitter of this report.';
  END IF;
  IF v_current_status != 'needs_revision' THEN
    RAISE EXCEPTION 'This report is not in a "needs_revision" state.';
  END IF;

  -- 3. Update the report details
  UPDATE demerit_reports
  SET
    offense_type_id = p_new_offense_type_id,
    notes = p_new_notes,
    date_of_offense = p_new_date_of_offense,
    status = 'pending_approval',
    current_approver_group_id = v_next_approver_group_id, -- Re-assign to the kicker
    revision_by_group_id = NULL -- Clear the field
  WHERE
    id = p_report_id;

  -- 4. Log this action
  INSERT INTO approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, auth.uid(), 'Edited & Resubmitted', 'The report was updated and resubmitted for approval.');
END;
$function$
;


