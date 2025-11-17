drop policy "Allow high-level staff to edit profiles" on "public"."profiles";

drop function if exists "public"."get_tour_sheet"();

alter table "public"."profiles" add column "has_star_tours" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_role_level()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_level int;
BEGIN
  SELECT r.default_role_level INTO v_role_level
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
  RETURN COALESCE(v_role_level, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role_name()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role_name text;
BEGIN
  SELECT r.role_name INTO v_role_name
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
  SELECT r.default_role_level INTO v_role_level
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;
  RETURN COALESCE(v_role_level, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours integer, has_star_tours boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check (Level >= 50)
  IF NOT (public.get_my_role_level() >= 50) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    split_part(c.company_name, ' ', 1) AS company_name,
    public.get_cadet_tour_balance(p.id) AS total_tours,
    p.has_star_tours -- ADDED to the selection
  FROM
    public.profiles p
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  WHERE
    -- Show if they have a balance OR if they have Star Tours (even with 0 balance)
    public.get_cadet_tour_balance(p.id) > 0
    OR p.has_star_tours = true
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;


  create policy "Allow High Command to edit sensitive info"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((public.get_my_role_name() = ANY (ARRAY['Commandant'::text, 'Deputy Commandant'::text, 'Admin'::text])))
with check (true);



  create policy "Allow S1/TACs to edit non-sensitive profile info"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((public.get_my_role_name() = ANY (ARRAY['S1'::text, 'Command Sergeant Major'::text])) OR (public.get_my_role_name() ~~ '%TAC Officer%'::text)))
with check (true);



