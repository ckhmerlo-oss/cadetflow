set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_roster_permissions()
 RETURNS TABLE(role_level integer, company_id uuid, can_manage_all boolean, can_manage_own boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.default_role_level,
    p.company_id,
    r.can_manage_all_rosters,
    r.can_manage_own_company_roster
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_roster()
 RETURNS TABLE(id uuid, first_name text, last_name text, cadet_rank text, company_name text, role_name text, grade_level text, room_number text, term_demerits bigint, year_demerits bigint, current_tour_balance integer, has_star_tours boolean, conduct_status text, recent_reports json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_perms record;
  v_current_term record;
BEGIN
  -- Fetch permissions
  SELECT * INTO v_perms FROM public.get_my_roster_permissions();

  -- *** SECURITY CHECK ***
  -- Allow if: 
  -- 1. Faculty/Staff (Level 50+)
  -- 2. Manager (All or Own)
  IF (v_perms.role_level < 50 AND v_perms.can_manage_all = false AND v_perms.can_manage_own = false) THEN
    RAISE EXCEPTION 'Permission Denied: You are not authorized to view the roster.';
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
    r.role_name,
    p.grade_level,
    p.room_number,
    COALESCE(stats.term_demerits, 0) as term_demerits,
    COALESCE(stats.year_demerits, 0) as year_demerits,
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
    (r.default_role_level < 50 OR r.default_role_level IS NULL) -- Only show Cadets
    AND
    -- *** VISIBILITY FILTER ***
    (
      v_perms.can_manage_all = true
      OR v_perms.role_level >= 50 -- Faculty see all
      OR (v_perms.can_manage_own = true AND p.company_id = v_perms.company_id)
    )
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.protect_critical_profile_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_modifier_perms record;
BEGIN
  -- 1. Get permissions of the user performing the update
  SELECT 
    p.is_site_admin,
    p.company_id,
    r.default_role_level,
    r.can_manage_all_rosters,
    r.can_manage_own_company_roster
  INTO v_modifier_perms
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();

  -- 2. Bypass checks completely for Service Role or Site Admins
  IF (auth.uid() IS NULL) OR (v_modifier_perms.is_site_admin = true) THEN
    RETURN NEW;
  END IF;

  -- 3. Check Critical Field: is_site_admin
  -- STRICT: Only Site Admins can change this flag.
  IF NEW.is_site_admin IS DISTINCT FROM OLD.is_site_admin THEN
      RAISE EXCEPTION 'Permission Denied: Only Site Admins can grant admin privileges.';
  END IF;

  -- 4. Check Critical Field: role_id
  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
      
      -- Rule A: Global Managers can change roles anywhere
      IF v_modifier_perms.can_manage_all_rosters THEN
          RETURN NEW;
      END IF;

      -- Rule B: Company Managers can change roles for their OWN company scope
      IF v_modifier_perms.can_manage_own_company_roster THEN
          -- The target must currently be Unassigned (NULL) OR in the modifier's company
          IF (OLD.company_id IS NULL OR OLD.company_id = v_modifier_perms.company_id) THEN
              RETURN NEW;
          END IF;
      END IF;

      -- If neither Rule A nor B applies, block the change
      RAISE EXCEPTION 'Permission Denied: You do not have permission to change this user''s role.';
  END IF;

  RETURN NEW;
END;
$function$
;


  create policy "Admins can delete companies"
  on "public"."companies"
  as permissive
  for delete
  to authenticated
using ((public.get_my_role_level() >= 90));



  create policy "Admins can insert companies"
  on "public"."companies"
  as permissive
  for insert
  to authenticated
with check ((public.get_my_role_level() >= 90));



  create policy "Admins can update companies"
  on "public"."companies"
  as permissive
  for update
  to authenticated
using ((public.get_my_role_level() >= 90))
with check ((public.get_my_role_level() >= 90));



  create policy "Enable read access for all authenticated users"
  on "public"."companies"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Managers can update cadets in their scope"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.get_my_roster_permissions() perms(role_level, company_id, can_manage_all, can_manage_own)
  WHERE ((perms.can_manage_all = true) OR ((perms.can_manage_own = true) AND ((profiles.company_id = perms.company_id) OR (profiles.company_id IS NULL)))))))
with check ((EXISTS ( SELECT 1
   FROM public.get_my_roster_permissions() perms(role_level, company_id, can_manage_all, can_manage_own)
  WHERE ((perms.can_manage_all = true) OR ((perms.can_manage_own = true) AND (profiles.company_id = perms.company_id))))));



