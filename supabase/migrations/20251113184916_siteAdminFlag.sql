alter table "public"."profiles" add column "is_site_admin" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_site_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Select the user's 'is_site_admin' flag.
  -- Use COALESCE to safely return 'false' if the profile
  -- doesn't exist or the value is somehow NULL.
  SELECT COALESCE(
    (SELECT p.is_site_admin
     FROM public.profiles p
     WHERE p.id = auth.uid()),
    false
  );
$function$
;


