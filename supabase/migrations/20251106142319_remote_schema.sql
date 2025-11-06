alter table "public"."profiles" drop constraint "profiles_id_fkey";

drop function if exists "public"."search_all_profiles"(p_search_term text);

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_searchable_profiles()
 RETURNS TABLE(user_id uuid, first_name text, last_name text, company_name text, role_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_all boolean;
BEGIN
  -- Security check
  SELECT r.can_manage_all_rosters INTO v_can_manage_all
  FROM profiles p
  LEFT JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to search all profiles.';
  END IF;

  -- Return ALL profiles
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
  ORDER BY p.last_name;
END;
$function$
;


