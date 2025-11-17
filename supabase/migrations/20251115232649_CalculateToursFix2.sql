set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_tours_for_new_report(p_cadet_id uuid, p_demerits integer, p_offense_category integer, p_date_of_offense timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_term_id uuid;
  v_term_start date;
  v_term_end date;
  v_term_demerits int;
  v_credits_remaining int;
  v_tours int;
  v_has_cat3 boolean;
BEGIN
  -- 1. Find the Academic Term
  SELECT id, start_date, end_date INTO v_term_id, v_term_start, v_term_end
  FROM public.academic_terms
  WHERE p_date_of_offense >= start_date 
    AND p_date_of_offense < (end_date + 1)
  LIMIT 1;

  -- 2. Handle "Outside of Term"
  IF v_term_id IS NULL THEN
      v_credits_remaining := 0;
      v_term_demerits := 0;
  ELSE
      -- 3. Sum existing demerits
      SELECT COALESCE(SUM(demerits_effective), 0) INTO v_term_demerits
      FROM public.demerit_reports
      WHERE subject_cadet_id = p_cadet_id
        AND status = 'completed'
        AND date_of_offense >= v_term_start
        AND date_of_offense < (v_term_end + 1);

      -- 4. THE NUKE CHECK: Did a Category 3 offense occur previously in this term?
      SELECT EXISTS (
        SELECT 1 FROM public.demerit_reports dr
        JOIN public.offense_types ot ON dr.offense_type_id = ot.id
        WHERE dr.subject_cadet_id = p_cadet_id
          AND dr.status = 'completed'
          AND ot.policy_category = 3
          AND dr.date_of_offense >= v_term_start
          AND dr.date_of_offense < (v_term_end + 1)
      ) INTO v_has_cat3;

      IF v_has_cat3 THEN
         -- NUKE ACTIVE: Previous Cat 3 destroys all remaining credits
         v_credits_remaining := 0;
      ELSE
         -- Standard Math: 15 minus used
         v_credits_remaining := 15 - v_term_demerits;
      END IF;
  END IF;

  -- 5. Enforce Credit Floors
  IF v_credits_remaining < 0 THEN 
    v_credits_remaining := 0; 
  END IF;

  -- 6. Calculate Final Tours
  IF p_offense_category = 3 THEN
     v_tours := p_demerits; -- Cat 3 is always immediate tours
  ELSE
     IF v_credits_remaining >= p_demerits THEN
        v_tours := 0;
     ELSE
        v_tours := p_demerits - v_credits_remaining;
     END IF;
  END IF;
  
  RETURN v_tours;
END;
$function$
;


