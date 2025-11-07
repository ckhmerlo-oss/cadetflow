set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, amount integer, actor_name text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check:
  -- Allow if you ARE the cadet OR you are faculty (level 50+)
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this audit log.';
  END IF;

  RETURN QUERY
  SELECT
    r.created_at AS event_date,
    'demerit' AS event_type,
    ot.offense_name AS title,
    r.notes AS details,
    ot.demerits AS amount,
    sub.first_name || ' ' || sub.last_name AS actor_name,
    r.status
  FROM
    public.demerit_reports r
  LEFT JOIN
    public.offense_types ot ON r.offense_type_id = ot.id
  LEFT JOIN
    public.profiles sub ON r.submitted_by = sub.id
  WHERE
    r.subject_cadet_id = p_cadet_id

  UNION ALL

  SELECT
    tl.created_at AS event_date,
    'served' AS event_type,
    'Tours Served' AS title,
    tl.comment AS details,
    tl.amount AS amount, -- This will be negative
    staff.first_name || ' ' || staff.last_name AS actor_name,
    'completed' AS status -- Served tours are always 'completed'
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
  -- 1. Get the user's role_name
  SELECT r.role_name INTO v_role_name
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  -- 2. *** THIS IS THE FIX ***
  -- Check if role is TAC *or* Commandant Staff
  IF NOT (
    v_role_name LIKE '%TAC%' OR
    v_role_name = 'Commandant' OR
    v_role_name = 'Deputy Commandant'
  ) THEN
    RAISE EXCEPTION 'You do not have permission to log tours.';
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


