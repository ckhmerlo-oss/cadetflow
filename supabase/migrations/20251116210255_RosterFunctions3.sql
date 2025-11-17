set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_role(p_role_name text, p_company_id uuid, p_approval_group_id uuid, p_default_role_level integer, p_can_manage_all_rosters boolean, p_can_manage_own_company_roster boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check: Only Role Level 90+ can create new roles
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'You do not have permission to create new roles.';
  END IF;

  -- Check for valid role level
  IF p_default_role_level < 0 OR p_default_role_level > 100 THEN
     RAISE EXCEPTION 'Role level must be between 0 and 100.';
  END IF;

  INSERT INTO public.roles (
    role_name,
    company_id,
    approval_group_id,
    default_role_level,
    can_manage_all_rosters,
    can_manage_own_company_roster
  ) VALUES (
    p_role_name,
    p_company_id,
    p_approval_group_id,
    p_default_role_level,
    p_can_manage_all_rosters,
    p_can_manage_own_company_roster
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_roster()
 RETURNS TABLE(id uuid, first_name text, last_name text, cadet_rank text, company_name text, grade_level text, term_demerits bigint, year_demerits bigint, current_tour_balance integer, has_star_tours boolean, conduct_status text, recent_reports json)
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
    COALESCE(stats.term_demerits, 0) as term_demerits,
    COALESCE(stats.year_demerits, 0) as year_demerits,
    public.get_cadet_tour_balance(p.id) as current_tour_balance,
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
        'created_at', rpt.created_at
      )) as recent_reports
    FROM (
      SELECT * FROM public.demerit_reports
      WHERE subject_cadet_id = p.id
      ORDER BY created_at DESC
      LIMIT 3
    ) rpt
    LEFT JOIN public.offense_types ot ON rpt.offense_type_id = ot.id
  ) rr ON true
  WHERE
    -- *** FIX IS HERE ***
    -- Show users if their role level is < 50 (Cadet leaders, etc.)
    -- OR if their role is not set (Default cadet)
    (r.default_role_level < 50 OR r.default_role_level IS NULL)
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


