drop policy "Users Can Update Their Own Profile" on "public"."profiles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.protect_critical_profile_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_modifier_site_admin boolean;
BEGIN
  -- Check if the user performing the update is a Site Admin
  SELECT is_site_admin INTO is_modifier_site_admin
  FROM public.profiles
  WHERE id = auth.uid();

  -- Allow the operation if it's the Service Role (Supabase Admin) or a Site Admin
  -- (auth.uid() IS NULL check handles service_role operations in some configurations, 
  -- but explicitly checking role is safer if RLS is bypassed)
  IF (auth.uid() IS NOT NULL) AND (is_modifier_site_admin IS NOT TRUE) THEN
    
    -- If a Non-Admin tries to change role_id: BLOCK IT
    IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
      RAISE EXCEPTION 'Permission Denied: Only Site Admins can change user roles.';
    END IF;

    -- If a Non-Admin tries to change is_site_admin: BLOCK IT
    IF NEW.is_site_admin IS DISTINCT FROM OLD.is_site_admin THEN
      RAISE EXCEPTION 'Permission Denied: Only Site Admins can grant admin privileges.';
    END IF;
    
  END IF;

  RETURN NEW;
END;
$function$
;


  create policy "Approvers can see processed reports"
  on "public"."demerit_reports"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.approval_log
  WHERE ((approval_log.report_id = demerit_reports.id) AND (approval_log.actor_id = auth.uid())))));


CREATE TRIGGER tr_protect_critical_profile_fields BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_critical_profile_fields();


