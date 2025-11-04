set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_completed_reports_for_faculty()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, subject json, submitter json, "group" json, title text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the user is faculty (role_level >= 50)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role_level >= 50
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view all reports.';
  END IF;

  -- Return all reports that are 'completed' or 'rejected'
  RETURN QUERY
  SELECT
    r.id,
    r.status,
    r.created_at,
    r.current_approver_group_id,
    r.subject_cadet_id,
    r.submitted_by,
    json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS subject,
    json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
    json_build_object('group_name', g.group_name) AS "group",
    ot.offense_name AS title
  FROM
    demerit_reports AS r
  LEFT JOIN
    profiles AS s ON r.subject_cadet_id = s.id
  LEFT JOIN
    profiles AS sub ON r.submitted_by = sub.id
  LEFT JOIN
    groups AS g ON r.current_approver_group_id = g.id
  LEFT JOIN
    offense_types AS ot ON r.offense_type_id = ot.id
  WHERE
    r.status = 'completed' OR r.status = 'rejected'
  ORDER BY
    r.created_at DESC;
END;
$function$
;


