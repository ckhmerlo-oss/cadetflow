alter table "public"."profiles" add column "cadet_rank" text;

alter table "public"."profiles" add column "conduct_status" text;

alter table "public"."profiles" add column "grade_level" text;

alter table "public"."profiles" add column "probation_status" text;

alter table "public"."profiles" add column "room_number" text;

alter table "public"."profiles" add column "sport_fall" text;

alter table "public"."profiles" add column "sport_spring" text;

alter table "public"."profiles" add column "sport_winter" text;

alter table "public"."profiles" add column "years_attended" integer default 0;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_role_name()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_name text;
BEGIN
  SELECT r.role_name
  INTO v_role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  RETURN v_role_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_role_level_for_user(user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_level int;
BEGIN
  SELECT r.default_role_level
  INTO v_role_level
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;
  
  RETURN COALESCE(v_role_level, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role_level()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_level int;
BEGIN
  SELECT r.default_role_level
  INTO v_role_level
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  
  RETURN COALESCE(v_role_level, 0);
END;
$function$
;


  create policy "Allow admins to create new profiles"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((public.get_my_role_name() = 'Admin'::text));



  create policy "Allow high-level staff to edit profiles"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((public.get_my_role_name() = ANY (ARRAY['S1'::text, 'Command Sergeant Major'::text, 'Deputy Commandant'::text, 'Commandant'::text, 'Admin'::text])) OR (public.get_my_role_name() ~~ '%TAC Officer%'::text)))
with check (((public.get_my_role_name() = ANY (ARRAY['S1'::text, 'Command Sergeant Major'::text, 'Deputy Commandant'::text, 'Commandant'::text, 'Admin'::text])) OR (public.get_my_role_name() ~~ '%TAC Officer%'::text)));



  create policy "Allow users to see profiles based on role level"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR (public.get_my_role_level() >= public.get_role_level_for_user(id))));



