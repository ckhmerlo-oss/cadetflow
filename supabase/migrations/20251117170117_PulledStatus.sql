alter table "public"."demerit_reports" add constraint "demerit_reports_status_check" CHECK ((status = ANY (ARRAY['pending_approval'::text, 'completed'::text, 'rejected'::text, 'needs_revision'::text, 'pulled'::text]))) not valid;

alter table "public"."demerit_reports" validate constraint "demerit_reports_status_check";

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

  -- 2. Security Check: Must be original submitter or Staff (Level 50+)
  IF v_report.submitted_by != v_viewer_id AND v_viewer_role_level < 50 THEN
    RAISE EXCEPTION 'You must be the original issuer or staff (TAC/Commandant) to pull this report.';
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
  -- Set status to "pulled" and nullify demerits
  UPDATE public.demerit_reports
  SET 
    status = 'pulled',
    demerits_effective = 0
  WHERE id = p_report_id;

  -- 6. Action 2: Nullify the tour ledger entry
  -- This ensures the dynamic balance function recalculates correctly.
  UPDATE public.tour_ledger
  SET amount = 0
  WHERE report_id = p_report_id;

  -- 7. Action 3: Log the action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, v_viewer_id, v_action_text, p_comment);

END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, report_id uuid, appeal_status text, appeal_note text, date_of_offense timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  
  -- Part 1: Get all Demerit Reports
  SELECT
    dr.created_at as event_date,
    'demerit' as event_type,
    ot.offense_name as title,
    dr.notes as details,
    dr.demerits_effective as demerits_issued,
    tl.amount as tour_change,
    (submitter.last_name || ', ' || submitter.first_name) as actor_name,
    dr.status, -- This will now show 'pulled'
    dr.id as report_id,
    a.status as appeal_status,
    a.final_comment as appeal_note,
    dr.date_of_offense
  FROM
    public.demerit_reports dr
  LEFT JOIN
    public.offense_types ot ON dr.offense_type_id = ot.id
  LEFT JOIN
    public.profiles submitter ON dr.submitted_by = submitter.id
  LEFT JOIN
    public.tour_ledger tl ON dr.id = tl.report_id
  LEFT JOIN
    public.appeals a ON dr.id = a.report_id
  WHERE
    dr.subject_cadet_id = p_cadet_id
  
  UNION ALL
  
  -- Part 2: Get all Served Tour entries
  SELECT
    tl.created_at as event_date,
    'served' as event_type,
    'Tours Served' as title,
    tl.comment as details,
    0 as demerits_issued,
    tl.amount as tour_change,
    (staff.last_name || ', ' || staff.first_name) as actor_name,
    'completed' as status,
    NULL as report_id,
    NULL as appeal_status,
    NULL as appeal_note,
    NULL as date_of_offense
  FROM
    public.tour_ledger tl
  LEFT JOIN
    public.profiles staff ON tl.staff_id = staff.id
  WHERE
    tl.cadet_id = p_cadet_id
    AND tl.action = 'served'
    
  ORDER BY
    event_date DESC;

END;
$function$
;


