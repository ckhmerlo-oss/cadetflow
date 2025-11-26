set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_create_infraction(p_offense_name text, p_policy_category integer, p_demerits integer, p_offense_code text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Security Check: strictly enforce Level 90+ (Admin/Commandant)
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied: You must be an administrator to create infractions.';
  END IF;

  -- 2. Validation
  IF p_offense_name IS NULL OR p_offense_name = '' THEN
    RAISE EXCEPTION 'Offense name is required.';
  END IF;

  -- 3. Insert
  INSERT INTO public.offense_types (offense_name, policy_category, demerits, offense_code)
  VALUES (p_offense_name, p_policy_category, p_demerits, p_offense_code);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_create_role(p_role_name text, p_default_role_level integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Security Check
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied: You must be an administrator to create roles.';
  END IF;

  -- 2. Validation
  IF p_role_name IS NULL OR p_role_name = '' THEN
    RAISE EXCEPTION 'Role name is required.';
  END IF;

  -- 3. Insert
  INSERT INTO public.roles (role_name, default_role_level)
  VALUES (p_role_name, p_default_role_level);
END;
$function$
;


