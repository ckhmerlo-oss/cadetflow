set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_role(p_role_name text, p_company_id uuid, p_approval_group_id uuid, p_default_role_level integer, p_can_manage_own boolean, p_can_manage_all boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true
  ) THEN
    RAISE EXCEPTION 'You do not have permission to create roles.';
  END IF;

  INSERT INTO public.roles (
    role_name, company_id, approval_group_id,
    default_role_level, can_manage_own_company_roster, can_manage_all_rosters
  ) VALUES (
    p_role_name, p_company_id, p_approval_group_id,
    p_default_role_level, p_can_manage_own, p_can_manage_all
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_role(p_role_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true
  ) THEN
    RAISE EXCEPTION 'You do not have permission to delete roles.';
  END IF;

  DELETE FROM public.roles
  WHERE id = p_role_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_companies_and_groups_for_admin()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_companies json;
  v_groups json;
BEGIN
  -- Security Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage roles.';
  END IF;

  SELECT json_agg(json_build_object('id', id, 'company_name', company_name) ORDER BY company_name)
  INTO v_companies
  FROM public.companies;

  SELECT json_agg(json_build_object('id', id, 'group_name', group_name) ORDER BY group_name)
  INTO v_groups
  FROM public.approval_groups;

  RETURN json_build_object(
    'companies', v_companies,
    'approval_groups', v_groups
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_roles_for_admin()
 RETURNS TABLE(role_id uuid, role_name text, company_id uuid, company_name text, approval_group_id uuid, approval_group_name text, default_role_level integer, can_manage_own_company_roster boolean, can_manage_all_rosters boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check: Only users with 'can_manage_all_rosters' can access this
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage roles.';
  END IF;

  RETURN QUERY
  SELECT
    r.id as role_id,
    r.role_name,
    c.id as company_id,
    c.company_name,
    ag.id as approval_group_id,
    ag.group_name as approval_group_name,
    r.default_role_level,
    r.can_manage_own_company_roster,
    r.can_manage_all_rosters
  FROM
    public.roles r
  LEFT JOIN
    public.companies c ON r.company_id = c.id
  LEFT JOIN
    public.approval_groups ag ON r.approval_group_id = ag.id
  ORDER BY
    c.company_name, r.default_role_level DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_role(p_role_id uuid, p_role_name text, p_company_id uuid, p_approval_group_id uuid, p_default_role_level integer, p_can_manage_own boolean, p_can_manage_all boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true
  ) THEN
    RAISE EXCEPTION 'You do not have permission to update roles.';
  END IF;

  UPDATE public.roles
  SET
    role_name = p_role_name,
    company_id = p_company_id,
    approval_group_id = p_approval_group_id,
    default_role_level = p_default_role_level,
    can_manage_own_company_roster = p_can_manage_own,
    can_manage_all_rosters = p_can_manage_all
  WHERE id = p_role_id;
END;
$function$
;


