set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_served_tours(p_cadet_id uuid, p_tours_served integer, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_negative_amount int;
  v_current_balance int; -- To store the cadet's balance
BEGIN
  -- 1. Permission Check (using the fix from our last conversation)
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to log tours.';
  END IF;
  
  -- 2. *** NEW: Get the cadet's current tour balance ***
  SELECT public.get_cadet_tour_balance(p_cadet_id)
  INTO v_current_balance;

  -- 3. *** NEW: Check if the amount being served is more than they owe ***
  IF p_tours_served > v_current_balance THEN
    RAISE EXCEPTION 'Cannot log % tours, cadet only has % tours remaining.', p_tours_served, v_current_balance;
  END IF;
  
  -- 4. If the check passes, proceed with logging the tours
  v_negative_amount := -1 * ABS(p_tours_served);

  INSERT INTO public.tour_ledger
    (cadet_id, action, amount, comment, staff_id, term_id)
  VALUES
    (p_cadet_id, 'served', v_negative_amount, p_comment, auth.uid(),
     (SELECT id FROM academic_terms WHERE now() BETWEEN start_date AND end_date LIMIT 1));
END;
$function$
;


