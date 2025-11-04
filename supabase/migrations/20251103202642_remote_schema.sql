
  create table "public"."offense_types" (
    "id" uuid not null default gen_random_uuid(),
    "offense_group" text not null,
    "offense_name" text not null,
    "offense_code" text not null,
    "demerits" integer not null,
    "policy_category" integer not null
      );


alter table "public"."offense_types" enable row level security;

CREATE UNIQUE INDEX offense_types_pkey ON public.offense_types USING btree (id);

alter table "public"."offense_types" add constraint "offense_types_pkey" PRIMARY KEY using index "offense_types_pkey";

grant delete on table "public"."offense_types" to "anon";

grant insert on table "public"."offense_types" to "anon";

grant references on table "public"."offense_types" to "anon";

grant select on table "public"."offense_types" to "anon";

grant trigger on table "public"."offense_types" to "anon";

grant truncate on table "public"."offense_types" to "anon";

grant update on table "public"."offense_types" to "anon";

grant delete on table "public"."offense_types" to "authenticated";

grant insert on table "public"."offense_types" to "authenticated";

grant references on table "public"."offense_types" to "authenticated";

grant select on table "public"."offense_types" to "authenticated";

grant trigger on table "public"."offense_types" to "authenticated";

grant truncate on table "public"."offense_types" to "authenticated";

grant update on table "public"."offense_types" to "authenticated";

grant delete on table "public"."offense_types" to "service_role";

grant insert on table "public"."offense_types" to "service_role";

grant references on table "public"."offense_types" to "service_role";

grant select on table "public"."offense_types" to "service_role";

grant trigger on table "public"."offense_types" to "service_role";

grant truncate on table "public"."offense_types" to "service_role";

grant update on table "public"."offense_types" to "service_role";


  create policy "Allow read access to all users"
  on "public"."offense_types"
  as permissive
  for select
  to authenticated
using (true);



