drop index if exists "public"."academic_terms_is_current_term_idx";

alter table "public"."academic_terms" drop column "is_current_term";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_tours_for_report(p_report_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report RECORD;
  v_offense RECORD;
  v_current_term RECORD;
  v_first_cat3_date date;
  v_credits_used_this_term int;
  v_credits_available int;
  v_credits_to_apply int;
  v_tours_to_assign int;
  v_credits_nuked boolean := false;
BEGIN
  -- 1. Get the report, offense, and term details
  SELECT * INTO v_report
  FROM public.demerit_reports
  WHERE id = p_report_id;

  SELECT * INTO v_offense
  FROM public.offense_types
  WHERE id = v_report.offense_type_id;
  
  -- *** CHANGED: Find the current term dynamically ***
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND end_date
  LIMIT 1;

  IF v_current_term.id IS NULL THEN
    RAISE LOG 'No current academic term found for date %. Cannot assign tours.', now();
    RETURN;
  END IF;
  
  -- (The rest of the function remains exactly the same)
  
  -- 2. Check for the "Category 3 Nuke"
  SELECT MIN(r.date_of_offense)
  INTO v_first_cat3_date
  FROM public.demerit_reports r
  JOIN public.offense_types ot ON r.offense_type_id = ot.id
  WHERE r.subject_cadet_id = v_report.subject_cadet_id
    AND r.status = 'completed'
    AND ot.policy_category = 3
    AND r.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;

  IF v_first_cat3_date IS NOT NULL AND v_report.date_of_offense >= v_first_cat3_date THEN
    v_credits_nuked := true;
  END IF;

  -- 3. Calculate Tours (1 demerit = 1 tour)
  v_tours_to_assign := v_offense.demerits;

  -- 4. Apply Credits (if not Category 3 and not nuked)
  IF v_offense.policy_category != 3 AND v_credits_nuked = false THEN
    
    SELECT COALESCE(SUM(ot.demerits - tl.amount), 0)
    INTO v_credits_used_this_term
    FROM public.tour_ledger tl
    JOIN public.demerit_reports r ON tl.report_id = r.id
    JOIN public.offense_types ot ON r.offense_type_id = ot.id
    WHERE tl.cadet_id = v_report.subject_cadet_id
      AND tl.term_id = v_current_term.id
      AND tl.action = 'assigned'
      AND ot.policy_category IN (1, 2);

    v_credits_available := 15 - v_credits_used_this_term;
    
    IF v_credits_available > 0 THEN
      v_credits_to_apply := LEAST(v_tours_to_assign, v_credits_available);
      v_tours_to_assign := v_tours_to_assign - v_credits_to_apply;
    END IF;
  END IF;

  -- 5. Add to ledger (only if tours > 0)
  IF v_tours_to_assign > 0 THEN
    INSERT INTO public.tour_ledger
      (cadet_id, report_id, term_id, action, amount, comment, staff_id)
    VALUES
      (v_report.subject_cadet_id, p_report_id, v_current_term.id, 'assigned', v_tours_to_assign,
       'From report: ' || v_offense.offense_name, v_report.submitted_by);
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_tour_and_demerit_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term RECORD;
  v_term_demerits int;
  v_total_tours int;
BEGIN
  -- *** CHANGED: Find the current term dynamically ***
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND end_date
  LIMIT 1;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_tours
  FROM public.tour_ledger
  WHERE cadet_id = auth.uid();

  -- Check if a term was found before trying to use it
  IF v_current_term.id IS NOT NULL THEN
    SELECT COALESCE(SUM(ot.demerits), 0)
    INTO v_term_demerits
    FROM public.demerit_reports r
    JOIN public.offense_types ot ON r.offense_type_id = ot.id
    WHERE r.subject_cadet_id = auth.uid()
      AND r.status = 'completed'
      AND r.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;
  ELSE
    v_term_demerits := 0; -- No current term, so no term demerits
  END IF;

  RETURN json_build_object(
    'term_demerits', v_term_demerits,
    'year_demerits', 0, -- Placeholder
    'total_tours', v_total_tours
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_served_tours(p_cadet_id uuid, p_tours_served integer, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_negative_amount int;
BEGIN
  -- Permission Check... (no change)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role_level >= 50
  ) THEN
    RAISE EXCEPTION 'You do not have permission to log tours.';
  END IF;
  
  v_negative_amount := -1 * ABS(p_tours_served);

  INSERT INTO public.tour_ledger
    (cadet_id, action, amount, comment, staff_id, term_id)
  VALUES
    (p_cadet_id, 'served', v_negative_amount, p_comment, auth.uid(),
     -- *** CHANGED: Find the current term dynamically ***
     (SELECT id FROM academic_terms WHERE now() BETWEEN start_date AND end_date LIMIT 1));
END;
$function$
;


