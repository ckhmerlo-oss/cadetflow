drop trigger if exists "on_profile_role_change" on "public"."profiles";

alter table "public"."roles" drop constraint "roles_role_name_key";

drop function if exists "public"."get_all_roles_and_groups"();

drop function if exists "public"."get_roster_for_management"();

drop function if exists "public"."sync_profile_role_level"();

drop function if exists "public"."update_user_permissions"(p_user_id uuid, p_new_role_id uuid, p_new_group_ids uuid[]);

drop index if exists "public"."roles_role_name_key";


  create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "company_name" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."companies" enable row level security;

alter table "public"."roles" drop column "can_manage_roster";

alter table "public"."roles" drop column "role_level";

alter table "public"."roles" add column "can_manage_all_rosters" boolean not null default false;

alter table "public"."roles" add column "can_manage_own_company_roster" boolean not null default false;

alter table "public"."roles" add column "company_id" uuid;

alter table "public"."roles" add column "default_role_level" integer not null default 10;

alter table "public"."roles" enable row level security;

CREATE UNIQUE INDEX companies_company_name_key ON public.companies USING btree (company_name);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX roles_company_id_role_name_key ON public.roles USING btree (company_id, role_name);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."companies" add constraint "companies_company_name_key" UNIQUE using index "companies_company_name_key";

alter table "public"."roles" add constraint "roles_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."roles" validate constraint "roles_company_id_fkey";

alter table "public"."roles" add constraint "roles_company_id_role_name_key" UNIQUE using index "roles_company_id_role_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_manageable_companies()
 RETURNS TABLE(company_id uuid, company_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role_id uuid;
  v_can_manage_own boolean;
  v_can_manage_all boolean;
  v_user_company_id uuid;
BEGIN
  -- Get the user's role and permissions
  SELECT
    p.role_id,
    r.can_manage_own_company_roster,
    r.can_manage_all_rosters,
    r.company_id
  INTO
    v_role_id,
    v_can_manage_own,
    v_can_manage_all,
    v_user_company_id
  FROM
    public.profiles p
  JOIN
    public.roles r ON p.role_id = r.id
  WHERE
    p.id = auth.uid();

  -- If they can manage ALL, return all companies
  IF v_can_manage_all = true THEN
    RETURN QUERY
    SELECT id, c.company_name FROM public.companies c;
  
  -- If they can manage their OWN, return only their company
  ELSIF v_can_manage_own = true THEN
    RETURN QUERY
    SELECT id, c.company_name FROM public.companies c
    WHERE c.id = v_user_company_id;
    
  -- Otherwise, they can't manage any
  ELSE
    RETURN;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_roster_for_company(p_company_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_roster json;
  v_roles json;
BEGIN
  -- We must check permission AGAIN to ensure the user
  -- can access the company they are requesting.
  IF NOT EXISTS (
    SELECT 1 FROM public.get_manageable_companies()
    WHERE company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage this company''s roster.';
  END IF;

  -- Get all users whose role is in this company
  SELECT json_agg(
    json_build_object(
      'user_id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'role_id', p.role_id,
      'role_name', r.role_name,
      'role_level', p.role_level -- The user's *actual* level
    )
    ORDER BY p.last_name
  )
  INTO v_roster
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE r.company_id = p_company_id;

  -- Get all roles for this company (for the "Assign Role" dropdown)
  SELECT json_agg(
    json_build_object(
      'id', r.id,
      'role_name', r.role_name,
      'default_role_level', r.default_role_level
    )
    ORDER BY r.default_role_level DESC
  )
  INTO v_roles
  FROM public.roles r
  WHERE r.company_id = p_company_id;

  -- Return both as a single JSON object
  RETURN json_build_object('roster', v_roster, 'roles', v_roles);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id uuid, p_new_role_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_role_company_id uuid;
  v_default_level int;
BEGIN
  -- Get the company of the *new role*
  SELECT company_id, default_role_level
  INTO v_new_role_company_id, v_default_level
  FROM public.roles
  WHERE id = p_new_role_id;

  -- Check if admin has permission to manage this role's company
  IF NOT EXISTS (
    SELECT 1 FROM public.get_manageable_companies()
    WHERE company_id = v_new_role_company_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to assign roles in this company.';
  END IF;

  -- Update the user's role AND their role_level to the default
  UPDATE public.profiles
  SET
    role_id = p_new_role_id,
    role_level = v_default_level
  WHERE
    id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_role_level(p_user_id uuid, p_new_role_level integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_company_id uuid;
BEGIN
  -- Get the company of the *user* being edited
  SELECT r.company_id
  INTO v_user_company_id
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = p_user_id;

  -- Check if admin has permission to manage this user's company
  IF NOT EXISTS (
    SELECT 1 FROM public.get_manageable_companies()
    WHERE company_id = v_user_company_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage this user''s role level.';
  END IF;

  -- Update *only* the role level
  UPDATE public.profiles
  SET
    role_level = p_new_role_level
  WHERE
    id = p_user_id;
END;
$function$
;

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";


  create policy "Allow authenticated users to read companies"
  on "public"."companies"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated users to read roles"
  on "public"."roles"
  as permissive
  for select
  to authenticated
using (true);



