set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_demerits_for_term(p_cadet_id uuid, p_term_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_term_start_date date;
  v_term_end_date date;
  v_total_demerits int;
BEGIN
  SELECT start_date, end_date INTO v_term_start_date, v_term_end_date
  FROM public.academic_terms
  WHERE id = p_term_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(ot.demerits), 0)
  INTO v_total_demerits
  FROM public.demerit_reports r
  JOIN public.offense_types ot ON r.offense_type_id = ot.id
  WHERE r.subject_cadet_id = p_cadet_id
    AND r.status = 'completed'
    AND r.date_of_offense::date BETWEEN v_term_start_date AND v_term_end_date;

  RETURN v_total_demerits;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_profile_company_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If company_id is changed, nullify the role_id
  IF OLD.company_id IS DISTINCT FROM NEW.company_id THEN
    NEW.role_id := NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_acted_on_report(p_report_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.approval_log
    WHERE report_id = p_report_id AND actor_id = auth.uid()
  );
END;
$function$
;


