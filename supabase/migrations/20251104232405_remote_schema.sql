drop function if exists "public"."assign_tours_for_report"(p_report_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_tour_balance(p_cadet_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_total_tours_earned INTEGER := 0;
    v_total_tours_served INTEGER := 0;
    v_term RECORD;
    v_report_data RECORD;
    v_term_credits_remaining INTEGER;
    v_term_cat3_received BOOLEAN;
    v_demerits INTEGER;
    v_policy_category INTEGER;
    v_tours_to_add INTEGER;
BEGIN
    -- Loop through each term to apply credit logic correctly
    FOR v_term IN
        SELECT * FROM public.academic_terms ORDER BY start_date ASC
    LOOP
        v_term_credits_remaining := 15; 
        v_term_cat3_received := false;

        -- Get all completed reports for this user IN THIS TERM
        FOR v_report_data IN
            SELECT 
                ot.demerits, 
                ot.policy_category
            FROM public.demerit_reports dr
            JOIN public.offense_types ot ON dr.offense_type_id = ot.id
            WHERE dr.subject_cadet_id = p_cadet_id
              AND dr.status = 'completed'
              AND dr.date_of_offense BETWEEN v_term.start_date AND v_term.end_date
            ORDER BY dr.date_of_offense ASC, dr.created_at ASC
        LOOP
            v_demerits := v_report_data.demerits;
            v_policy_category := v_report_data.policy_category;

            IF v_policy_category = 3 THEN
                v_total_tours_earned := v_total_tours_earned + v_demerits;
                v_term_cat3_received := true;
                v_term_credits_remaining := 0;
            ELSIF v_term_cat3_received = true THEN
                v_total_tours_earned := v_total_tours_earned + v_demerits;
            ELSE
                IF v_demerits <= v_term_credits_remaining THEN
                    v_term_credits_remaining := v_term_credits_remaining - v_demerits;
                ELSE
                    v_tours_to_add := v_demerits - v_term_credits_remaining;
                    v_total_tours_earned := v_total_tours_earned + v_tours_to_add;
                    v_term_credits_remaining := 0;
                END IF;
            END IF;
        END LOOP; 
    END LOOP; 

    -- Get total tours served from our new ledger
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_tours_served
    FROM public.tour_ledger
    WHERE cadet_id = p_cadet_id
      AND action IN ('served', 'adjustment'); -- We only sum negative/adjustment numbers

    -- Note: v_total_tours_served will be negative or 0
    RETURN v_total_tours_earned + v_total_tours_served;
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
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND end_date
  LIMIT 1;

  -- *** THIS IS THE FIX ***
  -- Call the new master function to get the correct balance
  SELECT public.get_cadet_tour_balance(auth.uid())
  INTO v_total_tours;
  -- *** END FIX ***

  IF v_current_term.id IS NOT NULL THEN
    SELECT COALESCE(SUM(ot.demerits), 0)
    INTO v_term_demerits
    FROM public.demerit_reports r
    JOIN public.offense_types ot ON r.offense_type_id = ot.id
    WHERE r.subject_cadet_id = auth.uid()
      AND r.status = 'completed'
      AND r.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;
  ELSE
    v_term_demerits := 0;
  END IF;

  RETURN json_build_object(
    'term_demerits', v_term_demerits,
    'year_demerits', 0,
    'total_tours', v_total_tours
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check... (No change)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    split_part(c.company_name, ' ', 1) AS company_name,
    -- *** THIS IS THE FIX ***
    -- Call the master function for each cadet
    public.get_cadet_tour_balance(p.id) AS total_tours
    -- *** END FIX ***
  FROM
    public.profiles p
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  -- We must filter out users who don't have tours
  WHERE
    public.get_cadet_tour_balance(p.id) > 0
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_next_group_id uuid;
BEGIN
  -- 1. Log this approval action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (report_id_to_approve, auth.uid(), 'Approved', approval_comment);

  -- 2. Find the *next* approval group
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
    UPDATE public.demerit_reports
    SET
      status = 'completed',
      current_approver_group_id = NULL
    WHERE
      id = report_id_to_approve;
      
  ELSE
    -- This is NOT the final step
    UPDATE public.demerit_reports
    SET
      current_approver_group_id = v_next_group_id
    WHERE
      id = report_id_to_approve;
  END IF;
  
  -- 4. NOTE: The flawed PERFORM call has been removed.
END;
$function$
;


