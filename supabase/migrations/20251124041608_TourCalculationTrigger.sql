alter table "public"."profiles" add column "cached_tour_balance" integer default 0;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.refresh_cadet_tour_cache(p_cadet_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_balance integer;
BEGIN
  -- Calculate using the existing complex logic
  v_new_balance := public.get_cadet_tour_balance(p_cadet_id);

  -- Update the cache column
  UPDATE public.profiles
  SET cached_tour_balance = v_new_balance
  WHERE id = p_cadet_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_refresh_on_ledger_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM public.refresh_cadet_tour_cache(NEW.cadet_id);
    RETURN NEW;
  END IF;
  
  IF (TG_OP = 'DELETE') THEN
    PERFORM public.refresh_cadet_tour_cache(OLD.cadet_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_refresh_on_report_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- If a report is inserted or updated, refresh the subject
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM public.refresh_cadet_tour_cache(NEW.subject_cadet_id);
    RETURN NEW;
  END IF;
  
  -- If deleted (rare, but possible), refresh the old subject
  IF (TG_OP = 'DELETE') THEN
    PERFORM public.refresh_cadet_tour_cache(OLD.subject_cadet_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_roster()
 RETURNS TABLE(id uuid, first_name text, last_name text, cadet_rank text, company_name text, grade_level text, room_number text, term_demerits bigint, year_demerits bigint, current_tour_balance integer, has_star_tours boolean, conduct_status text, recent_reports json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_viewer_level int;
  v_current_term record;
BEGIN
  v_viewer_level := public.get_my_role_level();

  IF v_viewer_level < 15 THEN
    RAISE EXCEPTION 'You do not have permission to view the roster.';
  END IF;

  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE now() BETWEEN start_date AND (end_date + interval '1 day')
  LIMIT 1;

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.cadet_rank,
    c.company_name,
    p.grade_level,
    p.room_number,
    COALESCE(stats.term_demerits, 0) as term_demerits,
    COALESCE(stats.year_demerits, 0) as year_demerits,
    
    -- *** OPTIMIZATION HERE: Read from cache instead of calculating ***
    COALESCE(p.cached_tour_balance, 0) as current_tour_balance,
    
    p.has_star_tours,
    public.calculate_conduct_status(COALESCE(stats.term_demerits, 0), COALESCE(stats.year_demerits, 0)) as conduct_status,
    rr.recent_reports
  FROM
    public.profiles p
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  LEFT JOIN
    public.roles r ON p.role_id = r.id
  LEFT JOIN LATERAL (
    SELECT
      SUM(CASE 
            WHEN dr.date_of_offense BETWEEN v_current_term.start_date AND (v_current_term.end_date + interval '1 day') 
            THEN dr.demerits_effective ELSE 0 
          END) as term_demerits,
      SUM(dr.demerits_effective) as year_demerits
    FROM public.demerit_reports dr
    WHERE dr.subject_cadet_id = p.id AND dr.status = 'completed'
  ) stats ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object(
        'id', rpt.id,
        'offense_name', ot.offense_name,
        'status', rpt.status,
        'created_at', rpt.created_at,
        'appeal_status', a.status
      )) as recent_reports
    FROM (
      SELECT * FROM public.demerit_reports
      WHERE subject_cadet_id = p.id
      ORDER BY created_at DESC
      LIMIT 3
    ) rpt
    LEFT JOIN public.offense_types ot ON rpt.offense_type_id = ot.id
    LEFT JOIN public.appeals a ON rpt.id = a.report_id
  ) rr ON true
  WHERE
    (r.default_role_level < 50 OR r.default_role_level IS NULL)
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE TRIGGER on_report_affect_balance AFTER INSERT OR DELETE OR UPDATE ON public.demerit_reports FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_on_report_change();

CREATE TRIGGER on_ledger_affect_balance AFTER INSERT OR DELETE OR UPDATE ON public.tour_ledger FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_on_ledger_change();


