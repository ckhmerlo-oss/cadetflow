drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_ledger_stats(p_cadet_id uuid)
 RETURNS TABLE(term_demerits integer, year_demerits integer, total_tours_marched integer, current_tour_balance integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term RECORD;
  v_year_start DATE;
BEGIN
  -- Security Check
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view these stats.';
  END IF;

  -- 1. Get Term Info (FIXED: uses date range instead of is_current_term flag)
  SELECT * INTO v_current_term 
  FROM public.academic_terms 
  WHERE now()::date BETWEEN start_date AND end_date
  LIMIT 1;
  
  -- 2. Get Year Start Info
  IF v_current_term.id IS NOT NULL THEN
      SELECT MIN(start_date) INTO v_year_start
      FROM public.academic_terms
      WHERE academic_year_start = v_current_term.academic_year_start;
  END IF;

  RETURN QUERY SELECT
    -- Metric 1: Term Demerits
    (SELECT COALESCE(SUM(ot.demerits), 0)::int
     FROM public.demerit_reports r
     JOIN public.offense_types ot ON r.offense_type_id = ot.id
     WHERE r.subject_cadet_id = p_cadet_id
       AND r.status = 'completed'
       AND r.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date
    ) AS term_demerits,

    -- Metric 2: Year Demerits
    (SELECT COALESCE(SUM(ot.demerits), 0)::int
     FROM public.demerit_reports r
     JOIN public.offense_types ot ON r.offense_type_id = ot.id
     WHERE r.subject_cadet_id = p_cadet_id
       AND r.status = 'completed'
       AND r.date_of_offense >= v_year_start
    ) AS year_demerits,

    -- Metric 3: Total Tours Marched
    (SELECT ABS(COALESCE(SUM(amount), 0))::int
     FROM public.tour_ledger
     WHERE cadet_id = p_cadet_id AND action = 'served'
    ) AS total_tours_marched,

    -- Metric 4: Current Balance
    public.get_cadet_tour_balance(p_cadet_id) AS current_tour_balance;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, running_balance bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this audit log.';
  END IF;

  RETURN QUERY
  WITH all_events AS (
    -- Demerit Reports
    SELECT
      r.created_at AS event_date_inner,
      'demerit'::text AS event_type_inner,
      ot.offense_name AS title_inner,
      r.notes AS details_inner,
      ot.demerits AS demerits_issued_inner, -- Always show the raw demerits
      -- Actual impact on tour balance:
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        WHEN r.status = 'completed' THEN COALESCE(tl.amount, ot.demerits)
        ELSE 0 -- Pending reports have no tour impact yet
      END AS tour_change_inner,
      (sub.first_name || ' ' || sub.last_name) AS actor_name_inner,
      r.status AS status_inner
    FROM
      public.demerit_reports r
    LEFT JOIN
      public.offense_types ot ON r.offense_type_id = ot.id
    LEFT JOIN
      public.profiles sub ON r.submitted_by = sub.id
    LEFT JOIN
      public.tour_ledger tl ON r.id = tl.report_id AND tl.action = 'assigned'
    WHERE
      r.subject_cadet_id = p_cadet_id

    UNION ALL

    -- Tours Served
    SELECT
      tl.created_at AS event_date_inner,
      'served'::text AS event_type_inner,
      'Tours Served'::text AS title_inner,
      tl.comment AS details_inner,
      0 AS demerits_issued_inner, -- Serving tours doesn't issue demerits
      tl.amount AS tour_change_inner,
      (staff.first_name || ' ' || staff.last_name) AS actor_name_inner,
      'completed'::text AS status_inner
    FROM
      public.tour_ledger tl
    LEFT JOIN
      public.profiles staff ON tl.staff_id = staff.id
    WHERE
      tl.cadet_id = p_cadet_id
      AND tl.action = 'served'
  )
  SELECT
    ae.event_date_inner AS event_date,
    ae.event_type_inner AS event_type,
    ae.title_inner AS title,
    ae.details_inner AS details,
    ae.demerits_issued_inner AS demerits_issued,
    ae.tour_change_inner AS tour_change,
    ae.actor_name_inner AS actor_name,
    ae.status_inner AS status,
    SUM(ae.tour_change_inner) OVER (ORDER BY ae.event_date_inner ASC) AS running_balance
  FROM
    all_events ae
  ORDER BY
    ae.event_date_inner DESC;
END;
$function$
;


