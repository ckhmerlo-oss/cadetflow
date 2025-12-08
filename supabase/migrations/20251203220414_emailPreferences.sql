create extension if not exists "pg_cron" with schema "pg_catalog";

create type "public"."notification_frequency" as enum ('immediate', 'digest', 'off');


  create table "public"."mailing_list" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "name" text,
    "is_active" boolean default true
      );


alter table "public"."mailing_list" enable row level security;


  create table "public"."notification_queue" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "event_type" text not null,
    "subject" text not null,
    "message" text not null,
    "link_url" text,
    "created_at" timestamp with time zone default now(),
    "processed_at" timestamp with time zone
      );


alter table "public"."notification_queue" enable row level security;


  create table "public"."system_settings" (
    "key" text not null,
    "value" boolean default false,
    "description" text
      );


alter table "public"."system_settings" enable row level security;


  create table "public"."user_preferences" (
    "user_id" uuid not null,
    "email_new_report" public.notification_frequency default 'immediate'::public.notification_frequency,
    "email_status_change" public.notification_frequency default 'immediate'::public.notification_frequency,
    "email_tour_reminder" boolean default true,
    "email_green_sheet" boolean default true,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_preferences" enable row level security;

CREATE UNIQUE INDEX mailing_list_pkey ON public.mailing_list USING btree (id);

CREATE UNIQUE INDEX notification_queue_pkey ON public.notification_queue USING btree (id);

CREATE UNIQUE INDEX system_settings_pkey ON public.system_settings USING btree (key);

CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (user_id);

alter table "public"."mailing_list" add constraint "mailing_list_pkey" PRIMARY KEY using index "mailing_list_pkey";

alter table "public"."notification_queue" add constraint "notification_queue_pkey" PRIMARY KEY using index "notification_queue_pkey";

alter table "public"."system_settings" add constraint "system_settings_pkey" PRIMARY KEY using index "system_settings_pkey";

alter table "public"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "public"."notification_queue" add constraint "notification_queue_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notification_queue" validate constraint "notification_queue_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_and_send_blast()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_enabled boolean;
  v_schedule_time text;
  v_current_time text;
BEGIN
  -- 1. Check if enabled
  SELECT value INTO v_enabled FROM public.system_settings WHERE key = 'enable_email_blasts';
  IF v_enabled IS NOT TRUE THEN RETURN; END IF;

  -- 2. Get Target Time (e.g. '06:00')
  SELECT description INTO v_schedule_time FROM public.system_settings WHERE key = 'green_sheet_schedule_time';
  
  -- 3. Get Current Time (HH:MI)
  v_current_time := to_char(now() AT TIME ZONE 'UTC', 'HH24:MI');

  -- 4. Match? (Simple equality check. Run this cron every minute or 15 mins to catch it)
  -- To be safe against minute-skips, we check if current time is WITHIN the target hour
  -- A more robust way is just equality if we run cron every minute.
  
  IF v_current_time = v_schedule_time THEN
     -- FIRE!
     PERFORM net.http_post(
        url:='https://PROJECT_REF.supabase.co/functions/v1/send-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_KEY"}',
        body:=json_build_object(
            'type', 'greensheet',
            'recipients', (SELECT array_agg(email) FROM mailing_list),
            'subject', 'Daily Green Sheet',
            'htmlContent', (SELECT generate_daily_email_html())
        )
    );
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_daily_email_html()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_html text := '<h1>Daily Disciplinary Report</h1>';
  v_row record;
  v_date text := to_char(now(), 'Mon DD, YYYY');
BEGIN
  v_html := v_html || '<h2>Green Sheet - ' || v_date || '</h2>';
  v_html := v_html || '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; width:100%;">';
  v_html := v_html || '<tr style="background:#eee;"><th>Cadet</th><th>Offense</th><th>Dem</th><th>By</th></tr>';

  FOR v_row IN SELECT * FROM public.get_unposted_green_sheet() LOOP
    v_html := v_html || '<tr>';
    v_html := v_html || '<td>' || v_row.subject_name || '</td>';
    v_html := v_html || '<td>' || v_row.offense_name || '</td>';
    v_html := v_html || '<td style="text-align:center;">' || v_row.demerits || '</td>';
    v_html := v_html || '<td>' || v_row.submitter_name || '</td>';
    v_html := v_html || '</tr>';
  END LOOP;
  v_html := v_html || '</table>';
  
  -- Add Tour Sheet Section
  v_html := v_html || '<h2>Tour Sheet (Must March)</h2>';
  v_html := v_html || '<ul>';
  FOR v_row IN SELECT * FROM public.get_tour_sheet() LOOP
    v_html := v_html || '<li><strong>' || v_row.last_name || ', ' || v_row.first_name || '</strong> (' || v_row.company_name || '): ' || v_row.total_tours || ' Tours</li>';
  END LOOP;
  v_html := v_html || '</ul>';

  RETURN v_html;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_faculty_user_ids()
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id 
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE r.default_role_level >= 50;
$function$
;

CREATE OR REPLACE FUNCTION public.get_or_create_preferences(p_user_id uuid)
 RETURNS SETOF public.user_preferences
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.user_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO UPDATE 
    SET user_id = EXCLUDED.user_id -- No-op to return the row
    RETURNING *;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tour_sheet_debtors()
 RETURNS TABLE(id uuid, balance integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, cached_tour_balance 
  FROM public.profiles
  WHERE cached_tour_balance > 0;
$function$
;

CREATE OR REPLACE FUNCTION public.get_users_with_pending_actions()
 RETURNS TABLE(user_id uuid, approval_count bigint, revision_count bigint, appeal_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH 
  -- A. Approvers (People linked to the group currently holding the report)
  approvers AS (
    SELECT p.id as uid
    FROM demerit_reports dr
    JOIN roles r ON r.approval_group_id = dr.current_approver_group_id
    JOIN profiles p ON p.role_id = r.id
    WHERE dr.status = 'pending_approval'
  ),
  -- B. Authors (People who need to revise a report)
  authors AS (
    SELECT submitted_by as uid
    FROM demerit_reports
    WHERE status = 'needs_revision'
  ),
  -- C. Appellants (Cadets whose appeal was rejected but can still escalate)
  appellants AS (
    SELECT dr.subject_cadet_id as uid
    FROM appeals a
    JOIN demerit_reports dr ON a.report_id = dr.id
    WHERE a.status IN ('rejected_by_issuer', 'rejected_by_chain')
  )
  SELECT 
    u.uid,
    COUNT(DISTINCT a.uid) as approval_count,
    COUNT(DISTINCT b.uid) as revision_count,
    COUNT(DISTINCT c.uid) as appeal_count
  FROM (
    SELECT uid FROM approvers
    UNION
    SELECT uid FROM authors
    UNION
    SELECT uid FROM appellants
  ) u
  LEFT JOIN approvers a ON u.uid = a.uid
  LEFT JOIN authors b ON u.uid = b.uid
  LEFT JOIN appellants c ON u.uid = c.uid
  GROUP BY u.uid;
END;
$function$
;

grant delete on table "public"."mailing_list" to "anon";

grant insert on table "public"."mailing_list" to "anon";

grant references on table "public"."mailing_list" to "anon";

grant select on table "public"."mailing_list" to "anon";

grant trigger on table "public"."mailing_list" to "anon";

grant truncate on table "public"."mailing_list" to "anon";

grant update on table "public"."mailing_list" to "anon";

grant delete on table "public"."mailing_list" to "authenticated";

grant insert on table "public"."mailing_list" to "authenticated";

grant references on table "public"."mailing_list" to "authenticated";

grant select on table "public"."mailing_list" to "authenticated";

grant trigger on table "public"."mailing_list" to "authenticated";

grant truncate on table "public"."mailing_list" to "authenticated";

grant update on table "public"."mailing_list" to "authenticated";

grant delete on table "public"."mailing_list" to "service_role";

grant insert on table "public"."mailing_list" to "service_role";

grant references on table "public"."mailing_list" to "service_role";

grant select on table "public"."mailing_list" to "service_role";

grant trigger on table "public"."mailing_list" to "service_role";

grant truncate on table "public"."mailing_list" to "service_role";

grant update on table "public"."mailing_list" to "service_role";

grant delete on table "public"."notification_queue" to "anon";

grant insert on table "public"."notification_queue" to "anon";

grant references on table "public"."notification_queue" to "anon";

grant select on table "public"."notification_queue" to "anon";

grant trigger on table "public"."notification_queue" to "anon";

grant truncate on table "public"."notification_queue" to "anon";

grant update on table "public"."notification_queue" to "anon";

grant delete on table "public"."notification_queue" to "authenticated";

grant insert on table "public"."notification_queue" to "authenticated";

grant references on table "public"."notification_queue" to "authenticated";

grant select on table "public"."notification_queue" to "authenticated";

grant trigger on table "public"."notification_queue" to "authenticated";

grant truncate on table "public"."notification_queue" to "authenticated";

grant update on table "public"."notification_queue" to "authenticated";

grant delete on table "public"."notification_queue" to "service_role";

grant insert on table "public"."notification_queue" to "service_role";

grant references on table "public"."notification_queue" to "service_role";

grant select on table "public"."notification_queue" to "service_role";

grant trigger on table "public"."notification_queue" to "service_role";

grant truncate on table "public"."notification_queue" to "service_role";

grant update on table "public"."notification_queue" to "service_role";

grant delete on table "public"."system_settings" to "anon";

grant insert on table "public"."system_settings" to "anon";

grant references on table "public"."system_settings" to "anon";

grant select on table "public"."system_settings" to "anon";

grant trigger on table "public"."system_settings" to "anon";

grant truncate on table "public"."system_settings" to "anon";

grant update on table "public"."system_settings" to "anon";

grant delete on table "public"."system_settings" to "authenticated";

grant insert on table "public"."system_settings" to "authenticated";

grant references on table "public"."system_settings" to "authenticated";

grant select on table "public"."system_settings" to "authenticated";

grant trigger on table "public"."system_settings" to "authenticated";

grant truncate on table "public"."system_settings" to "authenticated";

grant update on table "public"."system_settings" to "authenticated";

grant delete on table "public"."system_settings" to "service_role";

grant insert on table "public"."system_settings" to "service_role";

grant references on table "public"."system_settings" to "service_role";

grant select on table "public"."system_settings" to "service_role";

grant trigger on table "public"."system_settings" to "service_role";

grant truncate on table "public"."system_settings" to "service_role";

grant update on table "public"."system_settings" to "service_role";

grant delete on table "public"."user_preferences" to "anon";

grant insert on table "public"."user_preferences" to "anon";

grant references on table "public"."user_preferences" to "anon";

grant select on table "public"."user_preferences" to "anon";

grant trigger on table "public"."user_preferences" to "anon";

grant truncate on table "public"."user_preferences" to "anon";

grant update on table "public"."user_preferences" to "anon";

grant delete on table "public"."user_preferences" to "authenticated";

grant insert on table "public"."user_preferences" to "authenticated";

grant references on table "public"."user_preferences" to "authenticated";

grant select on table "public"."user_preferences" to "authenticated";

grant trigger on table "public"."user_preferences" to "authenticated";

grant truncate on table "public"."user_preferences" to "authenticated";

grant update on table "public"."user_preferences" to "authenticated";

grant delete on table "public"."user_preferences" to "service_role";

grant insert on table "public"."user_preferences" to "service_role";

grant references on table "public"."user_preferences" to "service_role";

grant select on table "public"."user_preferences" to "service_role";

grant trigger on table "public"."user_preferences" to "service_role";

grant truncate on table "public"."user_preferences" to "service_role";

grant update on table "public"."user_preferences" to "service_role";


  create policy "Admins can manage mailing list"
  on "public"."mailing_list"
  as permissive
  for all
  to public
using ((public.get_my_role_level() >= 90))
with check ((public.get_my_role_level() >= 90));



  create policy "Admins manage mailing list"
  on "public"."mailing_list"
  as permissive
  for all
  to public
using ((public.get_my_role_level() >= 90))
with check ((public.get_my_role_level() >= 90));



  create policy "Admins view queue"
  on "public"."notification_queue"
  as permissive
  for all
  to public
using ((public.get_my_role_level() >= 90));



  create policy "Admins can manage settings"
  on "public"."system_settings"
  as permissive
  for all
  to public
using ((public.get_my_role_level() >= 90))
with check ((public.get_my_role_level() >= 90));



  create policy "Everyone can read settings"
  on "public"."system_settings"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins manage all preferences"
  on "public"."user_preferences"
  as permissive
  for all
  to public
using ((public.get_my_role_level() >= 90));



  create policy "Users manage own preferences"
  on "public"."user_preferences"
  as permissive
  for all
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



