alter table "public"."user_preferences" alter column "email_new_report" drop default;

alter table "public"."user_preferences" alter column "email_status_change" drop default;

alter table "public"."user_preferences" alter column email_new_report type "public"."notification_frequency" using email_new_report::text::"public"."notification_frequency";

alter table "public"."user_preferences" alter column email_status_change type "public"."notification_frequency" using email_status_change::text::"public"."notification_frequency";

alter table "public"."user_preferences" alter column "email_new_report" set default 'immediate'::public.notification_frequency;

alter table "public"."user_preferences" alter column "email_status_change" set default 'immediate'::public.notification_frequency;

alter table "public"."user_preferences" alter column "email_green_sheet" set default false;

alter table "public"."user_preferences" alter column "email_new_report" set default 'off'::public.notification_frequency;

alter table "public"."user_preferences" alter column "email_status_change" set default 'off'::public.notification_frequency;

alter table "public"."user_preferences" alter column "email_tour_reminder" set default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_cadet_companies()
 RETURNS TABLE(id uuid, company_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- We only return companies that are NOT 'Battalion Staff' or 'Faculty'
  RETURN QUERY
  SELECT c.id, c.company_name
  FROM public.companies c
  WHERE c.company_name NOT IN ('Battalion Staff', 'Faculty')
  ORDER BY c.company_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Create the preference row immediately when a profile is created
  INSERT INTO public.user_preferences (user_id, email_new_report, email_status_change, email_tour_reminder, email_green_sheet)
  VALUES (NEW.id, 'off', 'off', false, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

CREATE TRIGGER on_profile_created_add_prefs AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();


