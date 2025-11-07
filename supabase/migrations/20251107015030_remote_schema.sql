set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- FIX: Changed from role_name check to role_level check
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    split_part(c.company_name, ' ', 1) AS company_name,
    public.get_cadet_tour_balance(p.id) AS total_tours
  FROM
    public.profiles p
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  WHERE
    public.get_cadet_tour_balance(p.id) > 0
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unposted_green_sheet()
 RETURNS TABLE(report_id uuid, subject_name text, company_name text, offense_name text, policy_category integer, demerits integer, submitter_name text, date_of_offense date, notes text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- FIX: Changed from role_name check to role_level check
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this report.';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS report_id,
    p_subject.last_name || ', ' || p_subject.first_name AS subject_name,
    c.company_name,
    ot.offense_name,
    ot.policy_category,
    ot.demerits,
    p_submitter.last_name || ', ' || p_submitter.first_name AS submitter_name,
    r.date_of_offense,
    r.notes
  FROM
    demerit_reports r
  JOIN
    profiles p_subject ON r.subject_cadet_id = p_subject.id
  LEFT JOIN
    companies c ON p_subject.company_id = c.id
  JOIN
    profiles p_submitter ON r.submitted_by = p_submitter.id
  JOIN
    offense_types ot ON r.offense_type_id = ot.id
  WHERE
    r.status = 'completed' AND r.is_posted = false
  ORDER BY
    subject_name, r.date_of_offense;
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
  v_current_balance int;
  v_role_name text;
BEGIN
  -- 1. NEW PERMISSION CHECK: Get the user's role_name
  SELECT r.role_name INTO v_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- 2. NEW: Check if the role_name is 'TAC Officer'
  IF v_role_name != 'TAC Officer' THEN
    RAISE EXCEPTION 'You do not have permission to log tours. This action is restricted to TAC Officers.';
  END IF;
  
  -- 3. Get the cadet's current tour balance
  SELECT public.get_cadet_tour_balance(p_cadet_id)
  INTO v_current_balance;

  -- 4. Check for over-serving
  IF p_tours_served > v_current_balance THEN
    RAISE EXCEPTION 'Cannot log % tours, cadet only has % tours remaining.', p_tours_served, v_current_balance;
  END IF;
  
  -- 5. Proceed with logging
  v_negative_amount := -1 * ABS(p_tours_served);
  INSERT INTO public.tour_ledger
    (cadet_id, action, amount, comment, staff_id, term_id)
  VALUES
    (p_cadet_id, 'served', v_negative_amount, p_comment, auth.uid(),
     (SELECT id FROM academic_terms WHERE now() BETWEEN start_date AND end_date LIMIT 1));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_green_sheet_as_posted(p_report_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This check is correct per your request.
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action.';
  END IF;

  UPDATE public.demerit_reports
  SET is_posted = true
  WHERE id = ANY(p_report_ids);
END;
$function$
;


