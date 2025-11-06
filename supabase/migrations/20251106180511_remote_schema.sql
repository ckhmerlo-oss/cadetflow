alter table "public"."profiles" drop column "role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_served_tours(p_cadet_id uuid, p_tours_served integer, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_negative_amount int;
BEGIN
  -- *** THIS IS THE FIX ***
  -- Check permission using the helper function
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to log tours.';
  END IF;
  
  v_negative_amount := -1 * ABS(p_tours_served);

  INSERT INTO public.tour_ledger
    (cadet_id, action, amount, comment, staff_id, term_id)
  VALUES
    (p_cadet_id, 'served', v_negative_amount, p_comment, auth.uid(),
     (SELECT id FROM academic_terms WHERE now() BETWEEN start_date AND end_date LIMIT 1));
END;
$function$
;


