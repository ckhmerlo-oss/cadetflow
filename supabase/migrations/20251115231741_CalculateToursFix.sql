drop function if exists "public"."calculate_tours_for_new_report"(p_cadet_id uuid, p_demerits integer, p_policy_category integer, p_offense_timestamp timestamp with time zone);

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
BEGIN
  -- 1. Find the Academic Term for this date
  -- Robustness: We check the full 24-hour range of the end date
  SELECT id, start_date, end_date INTO v_term_id, v_term_start, v_term_end
  FROM public.academic_terms
  WHERE p_date_of_offense >= start_date 
    AND p_date_of_offense < (end_date + 1) -- Captures until 23:59:59 of end_date
  LIMIT 1;

  -- 2. Handle "Outside of Term" Scenario (Robustness)
  IF v_term_id IS NULL THEN
      -- POLICY: If no term exists (Summer/Break), the cadet has 0 Tour Credits.
      -- This ensures the function never crashes or returns NULL.
      v_credits_remaining := 0;
      v_term_demerits := 0; -- Irrelevant, but good for initialization
  ELSE
      -- 3. Calculate History for Valid Term
      -- Robustness: Use COALESCE to handle cases with no prior reports (returns 0 instead of NULL)
      SELECT COALESCE(SUM(demerits_effective), 0) INTO v_term_demerits
      FROM public.demerit_reports
      WHERE subject_cadet_id = p_cadet_id
        AND status = 'completed'
        AND date_of_offense >= v_term_start
        AND date_of_offense < (v_term_end + 1);
        
      -- Calculate credits based on the 15-point rule
      v_credits_remaining := 15 - v_term_demerits;
  END IF;

  -- 4. Enforce Credit Floors
  IF v_credits_remaining < 0 THEN 
    v_credits_remaining := 0; 
  END IF;

  -- 5. Calculate Final Tours
  IF p_offense_category = 3 THEN
     -- NUKE: Category 3 bypasses credits entirely (Immediate Tours)
     v_tours := p_demerits; 
  ELSE
     -- Standard Logic: Check against calculated credits
     IF v_credits_remaining >= p_demerits THEN
        -- Credits absorb the blow
        v_tours := 0;
     ELSE
        -- Debt exceeds credits (or credits were 0 due to no term)
        v_tours := p_demerits - v_credits_remaining;
     END IF;
  END IF;
  
  RETURN v_tours;
END;
$function$
;


