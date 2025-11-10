alter table "public"."demerit_reports" alter column "date_of_offense" set data type timestamp with time zone using "date_of_offense"::timestamp with time zone;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_report(p_subject_cadet_id uuid, p_offense_type_id uuid, p_notes text, p_offense_timestamp timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report_id uuid;
  v_submitter_role_id uuid;
  v_approval_group_id uuid;
  v_next_group_id uuid;
  v_demerits int;
  v_submitter_level int;
  v_subject_level int;
BEGIN
  -- (Standard checks remain the same, just abbreviated here for clarity)
  SELECT public.get_my_role_level() INTO v_submitter_level;
  SELECT COALESCE(r.default_role_level, 0) INTO v_subject_level FROM public.profiles p LEFT JOIN public.roles r ON p.role_id = r.id WHERE p.id = p_subject_cadet_id;
  IF v_submitter_level <= v_subject_level THEN RAISE EXCEPTION 'Permission denied.'; END IF;

  SELECT demerits INTO v_demerits FROM public.offense_types WHERE id = p_offense_type_id;
  SELECT role_id INTO v_submitter_role_id FROM public.profiles WHERE id = auth.uid();
  SELECT approval_group_id INTO v_approval_group_id FROM public.roles WHERE id = v_submitter_role_id;
  IF v_approval_group_id IS NULL THEN RAISE EXCEPTION 'No approval group.'; END IF;
  SELECT next_approver_group_id INTO v_next_group_id FROM public.approval_groups WHERE id = v_approval_group_id;

  -- Insert with new timestamp
  INSERT INTO public.demerit_reports 
    (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id, demerits_effective)
  VALUES 
    (p_subject_cadet_id, p_offense_type_id, p_notes, p_offense_timestamp, auth.uid(), 
     CASE WHEN v_next_group_id IS NULL THEN 'completed' ELSE 'pending_approval' END, 
     v_next_group_id, v_demerits)
  RETURNING id INTO v_report_id;

  -- Log it
  INSERT INTO public.approval_log (report_id, actor_id, action, comment) VALUES (v_report_id, auth.uid(), 'submitted', 'Report created');
  
  RETURN v_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.resubmit_report(p_report_id uuid, p_new_offense_type_id uuid, p_new_notes text, p_new_timestamp timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report record;
  v_new_demerits int;
BEGIN
  SELECT * INTO v_report FROM public.demerit_reports WHERE id = p_report_id;
  IF v_report.submitted_by != auth.uid() OR v_report.status != 'needs_revision' THEN RAISE EXCEPTION 'Permission denied.'; END IF;
  
  SELECT demerits INTO v_new_demerits FROM public.offense_types WHERE id = p_new_offense_type_id;

  -- We need to find who kicked it back to send it back to them.
  -- (Simplification: sending it back to the group that kicked it, which we stored in revision_by_group_id)
  UPDATE public.demerit_reports
  SET offense_type_id = p_new_offense_type_id, notes = p_new_notes, date_of_offense = p_new_timestamp,
      demerits_effective = v_new_demerits, status = 'pending_approval',
      current_approver_group_id = v_report.revision_by_group_id, revision_by_group_id = NULL
  WHERE id = p_report_id;

  INSERT INTO public.approval_log (report_id, actor_id, action, comment) VALUES (p_report_id, auth.uid(), 'resubmitted', 'Edited and resubmitted.');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cadet_ledger_stats(p_cadet_id uuid)
 RETURNS TABLE(term_demerits integer, year_demerits integer, total_tours_marched integer, current_tour_balance integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term RECORD;
  v_year_start DATE;
BEGIN
  -- (Keep existing permission checks...)
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN RAISE EXCEPTION 'Permission denied.'; END IF;

  SELECT * INTO v_current_term FROM public.academic_terms WHERE now()::date BETWEEN start_date AND end_date LIMIT 1;
  
  IF EXTRACT(MONTH FROM now()) >= 8 THEN v_year_start := make_date(EXTRACT(YEAR FROM now())::int, 8, 1);
  ELSE v_year_start := make_date(EXTRACT(YEAR FROM now())::int - 1, 8, 1); END IF;

  RETURN QUERY SELECT
    -- *** FIX: Use ::date cast for comparisons ***
    (SELECT COALESCE(SUM(r.demerits_effective), 0)::int FROM public.demerit_reports r
     WHERE r.subject_cadet_id = p_cadet_id AND r.status = 'completed'
       AND r.date_of_offense::date BETWEEN COALESCE(v_current_term.start_date, '1900-01-01'::date) AND COALESCE(v_current_term.end_date, '1900-01-01'::date)
    ) AS term_demerits,
    (SELECT COALESCE(SUM(r.demerits_effective), 0)::int FROM public.demerit_reports r
     WHERE r.subject_cadet_id = p_cadet_id AND r.status = 'completed' AND r.date_of_offense::date >= v_year_start
    ) AS year_demerits,
    (SELECT ABS(COALESCE(SUM(amount), 0))::int FROM public.tour_ledger WHERE cadet_id = p_cadet_id AND action = 'served') AS total_tours_marched,
    public.get_cadet_tour_balance(p_cadet_id) AS current_tour_balance;
END;
$function$
;


