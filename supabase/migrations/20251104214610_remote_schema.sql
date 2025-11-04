drop function if exists "public"."get_unposted_green_sheet"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_unposted_green_sheet()
 RETURNS TABLE(report_id uuid, subject_name text, company_name text, offense_name text, policy_category integer, demerits integer, submitter_name text, date_of_offense date, notes text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check: Only Commandant or Deputy Commandant
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view this report.';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS report_id,
    p_subject.last_name || ', ' || p_subject.first_name AS subject_name,
    c.company_name, -- *** NEW: Get company name ***
    ot.offense_name,
    ot.policy_category, -- *** NEW: Get offense category ***
    ot.demerits,
    p_submitter.last_name || ', ' || p_submitter.first_name AS submitter_name,
    r.date_of_offense,
    r.notes
  FROM
    demerit_reports r
  JOIN
    profiles p_subject ON r.subject_cadet_id = p_subject.id
  LEFT JOIN -- Use LEFT JOIN in case a user is unassigned
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


