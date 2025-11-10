set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is level 50 or higher
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    c.company_name,
    SUM(tl.amount) AS total_tours
  FROM
    public.tour_ledger tl
  JOIN
    public.profiles p ON tl.cadet_id = p.id
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  GROUP BY
    p.id, c.company_name
  HAVING
    SUM(tl.amount) > 0
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unposted_green_sheet()
 RETURNS TABLE(report_id uuid, subject_name text, company_name text, offense_name text, policy_category integer, demerits integer, submitter_name text, date_of_offense date, notes text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is level 50 or higher
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this report.';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS report_id,
    p_subject.last_name || ', ' || p_subject.first_name AS subject_name,
    c.company_name,
    ot.offense_name,
    ot.policy_category,
    ot.demerits,
    p_submitter.last_name || ', ' || p_submitter.first_name AS submitter_name,
    r.date_of_offense::date,
    r.notes
  FROM
    demerit_reports r
  JOIN
    profiles p_subject ON r.subject_cadet_id = p_subject.id
  LEFT JOIN
    companies c ON p_subject.company_id = c.id
  JOIN
    profiles p_submitter ON r.submitted_by = p_submitter.id
  JOIN
    offense_types ot ON r.offense_type_id = ot.id
  WHERE
    r.status = 'completed' AND r.is_posted = false
  ORDER BY
    subject_name, r.date_of_offense;
END;
$function$
;


