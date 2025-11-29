alter table "public"."profiles" add column "has_seen_tour" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.complete_onboarding_tour()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET has_seen_tour = true
  WHERE id = auth.uid();
END;
$function$
;


