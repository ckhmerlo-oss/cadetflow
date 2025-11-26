set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_create_infraction(p_offense_name text, p_policy_category integer, p_demerits integer, p_offense_code text, p_offense_group text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF p_offense_name IS NULL OR p_offense_name = '' THEN
    RAISE EXCEPTION 'Offense name is required.';
  END IF;
  
  -- Default group if missing to prevent crashes
  IF p_offense_group IS NULL OR p_offense_group = '' THEN
     p_offense_group := 'General'; 
  END IF;

  INSERT INTO public.offense_types (offense_name, policy_category, demerits, offense_code, offense_group)
  VALUES (p_offense_name, p_policy_category, p_demerits, p_offense_code, p_offense_group);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_infraction(p_id uuid, p_offense_name text, p_policy_category integer, p_demerits integer, p_offense_code text, p_offense_group text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF p_offense_name IS NULL OR p_offense_name = '' THEN
    RAISE EXCEPTION 'Offense name is required.';
  END IF;

  UPDATE public.offense_types
  SET
    offense_name = p_offense_name,
    policy_category = p_policy_category,
    demerits = p_demerits,
    offense_code = p_offense_code,
    offense_group = COALESCE(p_offense_group, 'General')
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Infraction not found.';
  END IF;
END;
$function$
;


