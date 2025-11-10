drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, report_id uuid, appeal_status text, appeal_note text)
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
      r.demerits_effective AS demerits_issued_inner,
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        WHEN r.status = 'completed' THEN COALESCE(tl.amount, r.demerits_effective)
        ELSE 0 
      END AS tour_change_inner,
      (sub.first_name || ' ' || sub.last_name) AS actor_name_inner,
      r.status AS status_inner,
      r.id AS report_id_inner,
      -- Get appeal status
      (SELECT a.status FROM public.appeals a WHERE a.report_id = r.id ORDER BY a.updated_at DESC LIMIT 1) AS appeal_status_inner,
      -- *** FIX: Get the final appeal comment if it exists ***
      (SELECT a.final_comment FROM public.appeals a WHERE a.report_id = r.id AND a.final_comment IS NOT NULL ORDER BY a.updated_at DESC LIMIT 1) AS appeal_note_inner
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
      0 AS demerits_issued_inner,
      tl.amount AS tour_change_inner,
      (staff.first_name || ' ' || staff.last_name) AS actor_name_inner,
      'completed'::text AS status_inner,
      NULL::uuid AS report_id_inner,
      NULL::text AS appeal_status_inner,
      NULL::text AS appeal_note_inner
    FROM
      public.tour_ledger tl
    LEFT JOIN
      public.profiles staff ON tl.staff_id = staff.id
    WHERE
      tl.cadet_id = p_cadet_id
      AND tl.action = 'served'
  )
  SELECT
    ae.event_date_inner, ae.event_type_inner, ae.title_inner, ae.details_inner, ae.demerits_issued_inner, ae.tour_change_inner, ae.actor_name_inner, ae.status_inner,
    ae.report_id_inner, ae.appeal_status_inner, ae.appeal_note_inner
  FROM all_events ae
  ORDER BY ae.event_date_inner DESC;
END;
$function$
;


