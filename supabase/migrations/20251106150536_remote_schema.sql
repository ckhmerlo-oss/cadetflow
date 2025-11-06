drop policy "Users with permission can create reports" on "public"."demerit_reports";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_report(p_subject_cadet_id uuid, p_offense_type_id uuid, p_notes text, p_date_of_offense date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  submitter_level INTEGER;
  subject_level INTEGER;
  submitter_role_id uuid;
  submitter_approval_group_id uuid;
  first_approver_group_id uuid;
  new_report_id uuid;
BEGIN
  -- Get level & role from helper and profiles
  SELECT public.get_my_role_level() INTO submitter_level;
  SELECT p.role_id INTO submitter_role_id FROM public.profiles p WHERE id = auth.uid();
  
  -- Get subject's level from their role
  SELECT COALESCE(r.default_role_level, 0) INTO subject_level 
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = p_subject_cadet_id;

  IF submitter_level <= subject_level THEN
    RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.';
  END IF;

  SELECT approval_group_id INTO submitter_approval_group_id
  FROM public.roles WHERE id = submitter_role_id;

  IF submitter_approval_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your role has no approval group defined.';
  END IF;

  SELECT next_approver_group_id INTO first_approver_group_id
  FROM public.approval_groups WHERE id = submitter_approval_group_id;

  IF first_approver_group_id IS NULL THEN
    INSERT INTO public.demerit_reports (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'completed', NULL)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created (auto-approved)');
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'approved', 'Auto-approved by final authority.');
  ELSE
    INSERT INTO public.demerit_reports (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'pending_approval', first_approver_group_id)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');
  END IF;

  RETURN new_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_completed_reports_for_faculty()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, subject json, submitter json, "group" json, title text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- *** FIX: Use new helper function ***
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view all reports.';
  END IF;

  RETURN QUERY
  SELECT
    r.id, r.status, r.created_at, r.current_approver_group_id,
    r.subject_cadet_id, r.submitted_by,
    json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS subject,
    json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
    json_build_object('group_name', g.group_name) AS "group",
    ot.offense_name AS title
  FROM
    demerit_reports AS r
  LEFT JOIN profiles AS s ON r.subject_cadet_id = s.id
  LEFT JOIN profiles AS sub ON r.submitted_by = sub.id
  LEFT JOIN approval_groups AS g ON r.current_approver_group_id = g.id
  LEFT JOIN offense_types AS ot ON r.offense_type_id = ot.id
  WHERE r.status = 'completed' OR r.status = 'rejected'
  ORDER BY r.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_pending_reports_for_faculty()
 RETURNS TABLE(id uuid, title text, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, subject json, submitter json, "group" json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    my_level INTEGER;
BEGIN
    SELECT public.get_my_role_level() INTO my_level;

    IF my_level >= 50 THEN
        RETURN QUERY
        SELECT 
            dr.id, ot.offense_name AS title, dr.status, dr.created_at,
            dr.current_approver_group_id, dr.subject_cadet_id, dr.submitted_by,
            json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
            json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
            json_build_object('group_name', ag.group_name) AS "group"
        FROM public.demerit_reports AS dr
        LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id 
        LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
        LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
        LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
        WHERE dr.status = 'pending_approval' OR dr.status = 'needs_revision'
        ORDER BY dr.created_at DESC;
    END IF;
    RETURN;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role_level()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- This now reads the level from the user's role
  SELECT COALESCE(r.default_role_level, 0)
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_roster_for_company(p_company_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_roster json;
  v_roles json;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.get_manageable_companies()
    WHERE company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage this company''s roster.';
  END IF;

  SELECT json_agg(
    json_build_object(
      'user_id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'role_id', p.role_id,
      'role_name', COALESCE(r.role_name, 'Unassigned Role'),
      'role_level', COALESCE(r.default_role_level, 0) -- *** FIX ***
    )
    ORDER BY p.last_name
  )
  INTO v_roster
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.company_id = p_company_id;

  SELECT json_agg(
    json_build_object(
      'id', r.id,
      'role_name', r.role_name,
      'default_role_level', r.default_role_level
    )
    ORDER BY r.default_role_level DESC
  )
  INTO v_roles
  FROM public.roles r
  WHERE r.company_id = p_company_id;

  RETURN json_build_object('roster', v_roster, 'roles', v_roles);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_subordinates()
 RETURNS TABLE(id uuid, first_name text, last_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    my_level INTEGER;
BEGIN
    SELECT public.get_my_role_level() INTO my_level;
    
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name
    FROM public.profiles p
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE COALESCE(r.default_role_level, 0) < my_level;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unassigned_roster()
 RETURNS TABLE(user_id uuid, first_name text, last_name text, role_level integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_all boolean;
BEGIN
  SELECT r.can_manage_all_rosters INTO v_can_manage_all
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to view unassigned users.';
  END IF;

  RETURN QUERY
  SELECT
    p.id as user_id,
    p.first_name,
    p.last_name,
    0 AS role_level -- *** FIX: Return 0, this column is gone ***
  FROM public.profiles p
  WHERE p.company_id IS NULL
  ORDER BY p.last_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_member_of_approver_group(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- This checks if the user's *role* is tied to the approval group
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.approval_group_id = p_group_id
  );
$function$
;


  create policy "Users with permission can create reports"
  on "public"."demerit_reports"
  as permissive
  for insert
  to public
with check (((auth.uid() = submitted_by) AND (public.get_my_role_level() > ( SELECT COALESCE(r.default_role_level, 0) AS "coalesce"
   FROM (public.profiles p
     LEFT JOIN public.roles r ON ((p.role_id = r.id)))
  WHERE (p.id = demerit_reports.subject_cadet_id)))));



