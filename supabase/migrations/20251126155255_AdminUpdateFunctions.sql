set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_delete_infraction(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check: Only Admin/Commandant (Level 90+)
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied: You must be an administrator to delete infractions.';
  END IF;

  DELETE FROM public.offense_types WHERE id = p_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_infraction(p_id uuid, p_offense_name text, p_policy_category integer, p_demerits integer, p_offense_code text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Security Check: Only Admin/Commandant (Level 90+)
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied: You must be an administrator to update infractions.';
  END IF;

  -- 2. Validation
  IF p_offense_name IS NULL OR p_offense_name = '' THEN
    RAISE EXCEPTION 'Offense name is required.';
  END IF;

  -- 3. Update
  UPDATE public.offense_types
  SET
    offense_name = p_offense_name,
    policy_category = p_policy_category,
    demerits = p_demerits,
    offense_code = p_offense_code
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Infraction not found.';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_role(p_id uuid, p_role_name text, p_default_role_level integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Security Check
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied: You must be an administrator to update roles.';
  END IF;

  -- 2. Validation
  IF p_role_name IS NULL OR p_role_name = '' THEN
    RAISE EXCEPTION 'Role name is required.';
  END IF;

  -- 3. Update
  UPDATE public.roles
  SET
    role_name = p_role_name,
    default_role_level = p_default_role_level
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role not found.';
  END IF;
END;
$function$
;


