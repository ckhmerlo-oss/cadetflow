drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, amount integer, actor_name text, status text, running_balance bigint)
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
    SELECT
      r.created_at AS event_date_inner,
      'demerit'::text AS event_type_inner,
      ot.offense_name AS title_inner,
      r.notes AS details_inner,
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        WHEN r.status = 'completed' THEN COALESCE(tl.amount, ot.demerits)
        ELSE ot.demerits 
      END AS amount_inner,
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

    SELECT
      tl.created_at AS event_date_inner,
      'served'::text AS event_type_inner,
      'Tours Served'::text AS title_inner,
      tl.comment AS details_inner,
      tl.amount AS amount_inner,
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
    ae.amount_inner AS amount,
    ae.actor_name_inner AS actor_name,
    ae.status_inner AS status,
    SUM(ae.amount_inner) OVER (ORDER BY ae.event_date_inner ASC) AS running_balance
  FROM
    all_events ae
  ORDER BY
    ae.event_date_inner DESC;
END;
$function$
;


