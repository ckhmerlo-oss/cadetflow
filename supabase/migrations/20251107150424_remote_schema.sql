drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, amount integer, actor_name text, status text, running_balance bigint, action_comment text)
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
      r.created_at AS event_date,
      'demerit' AS event_type,
      ot.offense_name AS title,
      r.notes AS details,
      -- FIX 1: If rejected, show 0 amount.
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        ELSE ot.demerits 
      END AS amount,
      sub.first_name || ' ' || sub.last_name AS actor_name,
      r.status,
      -- FIX 2: Fetch the latest action comment (e.g., rejection reason or approval note)
      (
        SELECT comment 
        FROM public.approval_log al 
        WHERE al.report_id = r.id 
        ORDER BY al.created_at DESC 
        LIMIT 1
      ) AS action_comment
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
      tl.amount AS amount,
      staff.first_name || ' ' || staff.last_name AS actor_name,
      'completed' AS status,
      NULL AS action_comment -- No separate action comment for tour logs
    FROM
      public.tour_ledger tl
    LEFT JOIN
      public.profiles staff ON tl.staff_id = staff.id
    WHERE
      tl.cadet_id = p_cadet_id
      AND tl.action = 'served'
  )
  SELECT
    *,
    SUM(COALESCE(amount, 0)) OVER (ORDER BY event_date ASC) AS running_balance
  FROM
    all_events
  ORDER BY
    event_date DESC;
END;
$function$
;


