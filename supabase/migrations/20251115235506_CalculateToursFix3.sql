set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_tour_balance(p_cadet_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance int;
BEGIN
  -- Strict Summation Logic:
  -- 1. 'served' entries reduce the balance (Negative)
  -- 2. Everything else ('add', 'demerit') increases the balance (Positive)
  -- 3. COALESCE handles the case where a cadet has no entries (returns 0)
  
  SELECT COALESCE(SUM(
    CASE 
      WHEN action = 'served' THEN -ABS(amount) 
      ELSE ABS(amount) 
    END
  ), 0)
  INTO v_balance
  FROM public.tour_ledger
  WHERE cadet_id = p_cadet_id;
  
  RETURN v_balance;
END;
$function$
;


