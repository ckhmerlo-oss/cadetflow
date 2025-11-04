alter table "public"."profiles" add column "company_id" uuid;

alter table "public"."profiles" add constraint "profiles_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "profiles_company_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_user_company(p_user_id uuid, p_new_company_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_all boolean;
BEGIN
  -- Check permission (must have 'can_manage_all_rosters')
  SELECT r.can_manage_all_rosters INTO v_can_manage_all
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to assign users to companies.';
  END IF;

  -- Update the user's company.
  -- The trigger will automatically set their role_id to NULL.
  UPDATE public.profiles
  SET company_id = p_new_company_id
  WHERE id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_companies_list()
 RETURNS TABLE(id uuid, company_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_all boolean;
BEGIN
  -- Check permission
  SELECT r.can_manage_all_rosters INTO v_can_manage_all
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to get all companies.';
  END IF;

  -- Return all companies
  RETURN QUERY
  SELECT c.id, c.company_name
  FROM public.companies c
  ORDER BY c.company_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_manage_permissions()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_own boolean;
  v_can_manage_all boolean;
BEGIN
  -- Get the user's permissions from their role
  SELECT
    COALESCE(r.can_manage_own_company_roster, false),
    COALESCE(r.can_manage_all_rosters, false)
  INTO
    v_can_manage_own,
    v_can_manage_all
  FROM
    public.profiles p
  LEFT JOIN
    public.roles r ON p.role_id = r.id
  WHERE
    p.id = auth.uid();

  RETURN json_build_object(
    'can_manage_own', v_can_manage_own,
    'can_manage_all', v_can_manage_all
  );
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
  -- Check permission (must have 'can_manage_all_rosters')
  SELECT r.can_manage_all_rosters INTO v_can_manage_all
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to view unassigned users.';
  END IF;

  -- Return all users with no company assigned
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.first_name,
    p.last_name,
    p.role_level
  FROM public.profiles p
  WHERE p.company_id IS NULL
  ORDER BY p.last_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_profile_company_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Trigger 1: If the user's company is changing
  IF (TG_OP = 'UPDATE' AND OLD.company_id IS DISTINCT FROM NEW.company_id) THEN
      -- ...set their role to NULL and reset their level,
      -- as their old role is no longer valid.
      NEW.role_id := NULL;
      NEW.role_level := 10; -- Reset to a base 'Cadet' level
  END IF;

  -- Trigger 2: If the user's role is changing
  IF (NEW.role_id IS NOT NULL) AND
     (TG_OP = 'INSERT' OR OLD.role_id IS DISTINCT FROM NEW.role_id) THEN
      
      -- ...check if the new role belongs to the user's assigned company.
      IF NOT EXISTS (
        SELECT 1 FROM public.roles r
        WHERE r.id = NEW.role_id AND r.company_id = NEW.company_id
      ) THEN
        RAISE EXCEPTION 'Role assignment failed: The selected role does not belong to the user''s assigned company.';
      END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_all_profiles(p_search_term text)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, company_name text, role_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_all boolean;
BEGIN
  -- Check permission
  SELECT r.can_manage_all_rosters INTO v_can_manage_all
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to search all profiles.';
  END IF;

  -- Return all users matching the search term
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.first_name,
    p.last_name,
    c.company_name,
    r.role_name
  FROM public.profiles p
  LEFT JOIN public.companies c ON p.company_id = c.id
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE
    p.first_name ILIKE ('%' || p_search_term || '%') OR
    p.last_name ILIKE ('%' || p_search_term || '%')
  ORDER BY p.last_name;
END;
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
  -- Check if admin has permission to manage this company
  IF NOT EXISTS (
    SELECT 1 FROM public.get_manageable_companies()
    WHERE company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage this company''s roster.';
  END IF;

  -- Get all users *directly assigned to this company*
  SELECT json_agg(
    json_build_object(
      'user_id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'role_id', p.role_id,
      -- Get role_name, or 'Unassigned Role' if role_id is NULL
      'role_name', COALESCE(r.role_name, 'Unassigned Role'),
      'role_level', p.role_level
    )
    ORDER BY p.last_name
  )
  INTO v_roster
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.company_id = p_company_id; -- The join is now on profiles.company_id

  -- Get all roles for this company (for the "Assign Role" dropdown)
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

  -- Return both
  RETURN json_build_object('roster', v_roster, 'roles', v_roles);
END;
$function$
;

CREATE TRIGGER on_profile_company_or_role_change BEFORE UPDATE OF company_id, role_id ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_profile_company_change();


