set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_tours_for_new_report(p_cadet_id uuid, p_demerits integer, p_policy_category integer, p_offense_timestamp timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term RECORD;
  v_first_cat3_date date;
  v_credits_used_this_term int;
  v_credits_available int;
  v_tours_to_assign int;
  v_credits_nuked boolean := false;
  -- New variable to hold the date part of the timestamp
  v_offense_date date;
BEGIN
  -- Convert timestamp to just a date for term matching
  v_offense_date := p_offense_timestamp::date;

  -- 1. Find the academic term for this offense
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE v_offense_date BETWEEN start_date AND end_date
  LIMIT 1;

  -- If no term is found, we can't apply credits, so return the full amount.
  IF v_current_term.id IS NULL THEN
    RETURN p_demerits;
  END IF;

  -- 2. Check for the "Category 3 Nuke"
  SELECT MIN(r.date_of_offense::date)
  INTO v_first_cat3_date
  FROM public.demerit_reports r
  JOIN public.offense_types ot ON r.offense_type_id = ot.id
  WHERE r.subject_cadet_id = p_cadet_id
    AND r.status = 'completed'
    AND ot.policy_category = 3
    AND r.date_of_offense::date BETWEEN v_current_term.start_date AND v_current_term.end_date;

  IF v_first_cat3_date IS NOT NULL AND v_offense_date >= v_first_cat3_date THEN
    v_credits_nuked := true;
  END IF;

  -- 3. Calculate Tours (1 demerit = 1 tour)
  v_tours_to_assign := p_demerits;

  -- 4. Apply Credits (if not Category 3 and not nuked)
  IF p_policy_category != 3 AND v_credits_nuked = false THEN
    
    -- Find how many credits have been used by *other* Cat 1/2 reports in this term
    SELECT COALESCE(SUM(ot.demerits - tl.amount), 0)
    INTO v_credits_used_this_term
    FROM public.tour_ledger tl
    JOIN public.demerit_reports r ON tl.report_id = r.id
    JOIN public.offense_types ot ON r.offense_type_id = ot.id
    WHERE tl.cadet_id = p_cadet_id
      AND tl.term_id = v_current_term.id
      AND tl.action = 'assigned'
      AND ot.policy_category IN (1, 2)
      AND r.status = 'completed'
      -- Exclude the current report to avoid double counting if re-running
      AND r.date_of_offense < p_offense_timestamp;

    v_credits_available := 15 - v_credits_used_this_term;
    
    IF v_credits_available > 0 THEN
      -- Only apply credits up to the amount of the demerits
      v_tours_to_assign := GREATEST(0, p_demerits - v_credits_available);
    END IF;
  END IF;

  -- 5. Return the final number of tours to be assigned
  RETURN v_tours_to_assign;
END;
$function$
;


