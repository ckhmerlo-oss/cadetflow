drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, report_id uuid, appeal_status text, appeal_note text, date_of_offense timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  
  -- Part 1: Get all Demerit Reports
  SELECT
    dr.created_at as event_date,
    'demerit' as event_type,
    ot.offense_name as title,
    dr.notes as details,
    dr.demerits_effective as demerits_issued,
    tl.amount as tour_change,
    (submitter.last_name || ', ' || submitter.first_name) as actor_name,
    dr.status,
    dr.id as report_id,
    a.status as appeal_status,
    a.final_comment as appeal_note,
    dr.date_of_offense -- <<< ADDED THIS LINE
  FROM
    public.demerit_reports dr
  LEFT JOIN
    public.offense_types ot ON dr.offense_type_id = ot.id
  LEFT JOIN
    public.profiles submitter ON dr.submitted_by = submitter.id
  LEFT JOIN
    public.tour_ledger tl ON dr.id = tl.report_id
  LEFT JOIN
    public.appeals a ON dr.id = a.report_id
  WHERE
    dr.subject_cadet_id = p_cadet_id
  
  UNION ALL
  
  -- Part 2: Get all Served Tour entries
  SELECT
    tl.created_at as event_date,
    'served' as event_type,
    'Tours Served' as title,
    tl.comment as details,
    0 as demerits_issued,
    tl.amount as tour_change,
    (staff.last_name || ', ' || staff.first_name) as actor_name,
    'completed' as status,
    NULL as report_id,
    NULL as appeal_status,
    NULL as appeal_note,
    NULL as date_of_offense -- <<< ADDED THIS LINE (NULL for served)
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


