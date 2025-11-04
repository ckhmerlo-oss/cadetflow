
  create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "role_name" text not null,
    "role_level" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "can_manage_roster" boolean not null default false
      );


alter table "public"."profiles" add column "role_id" uuid;

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX roles_role_name_key ON public.roles USING btree (role_name);

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."profiles" add constraint "profiles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "profiles_role_id_fkey";

alter table "public"."roles" add constraint "roles_role_name_key" UNIQUE using index "roles_role_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_roles_and_groups()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_has_permission boolean;
  v_roles json;
  v_groups json;
BEGIN
  -- Check permission
  SELECT r.can_manage_roster INTO v_has_permission
  FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();

  IF v_has_permission IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to manage roles.';
  END IF;

  -- Get all roles
  SELECT json_agg(
    json_build_object('id', r.id, 'role_name', r.role_name)
    ORDER BY r.role_level
  )
  INTO v_roles
  FROM roles r;

  -- Get all groups
  SELECT json_agg(
    json_build_object('id', ag.id, 'group_name', ag.group_name)
    ORDER BY ag.group_name
  )
  INTO v_groups
  FROM approval_groups ag;

  -- Return both as a single JSON object
  RETURN json_build_object(
    'roles', v_roles,
    'groups', v_groups
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_roster_for_management()
 RETURNS TABLE(user_id uuid, first_name text, last_name text, current_role_id uuid, current_role_name text, current_groups json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_has_permission boolean;
BEGIN
  -- Get the current user's 'can_manage_roster' permission
  SELECT r.can_manage_roster INTO v_has_permission
  FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();

  -- Only allow users with that permission
  IF v_has_permission IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to manage roles.';
  END IF;

  -- Return the roster
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.first_name,
    p.last_name,
    p.role_id as current_role_id,
    r.role_name as current_role_name,
    (
      SELECT json_agg(
        json_build_object(
          'id', ag.id,
          'group_name', ag.group_name
        )
      )
      FROM group_members gm
      JOIN approval_groups ag ON gm.group_id = ag.id
      WHERE gm.user_id = p.id
    ) as current_groups
  FROM
    profiles p
  LEFT JOIN
    roles r ON p.role_id = r.id
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_profile_role_level()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- When profiles.role_id changes,
  -- find the role_level from the 'roles' table
  -- and copy it into the 'profiles.role_level' column.
  SELECT role_level
  INTO NEW.role_level
  FROM public.roles
  WHERE id = NEW.role_id;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_permissions(p_user_id uuid, p_new_role_id uuid, p_new_group_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_has_permission boolean;
BEGIN
  -- Check permission
  SELECT r.can_manage_roster INTO v_has_permission
  FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();

  IF v_has_permission IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to update roles.';
  END IF;

  -- 1. Update the user's role
  UPDATE public.profiles
  SET role_id = p_new_role_id
  WHERE id = p_user_id;
  -- (The trigger will automatically update the role_level)

  -- 2. Update the user's groups
  DELETE FROM public.group_members
  WHERE user_id = p_user_id;

  INSERT INTO public.group_members (user_id, group_id)
  SELECT p_user_id, unnest(p_new_group_ids);
  
END;
$function$
;

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

CREATE TRIGGER on_profile_role_change BEFORE INSERT OR UPDATE OF role_id ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_level();


