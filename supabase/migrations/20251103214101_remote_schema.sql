
  create table "public"."tours_marched" (
    "id" uuid not null default gen_random_uuid(),
    "cadet_id" uuid not null,
    "tac_officer_id" uuid not null,
    "tours_marched_count" integer not null,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."tours_marched" enable row level security;

CREATE UNIQUE INDEX tours_marched_pkey ON public.tours_marched USING btree (id);

alter table "public"."tours_marched" add constraint "tours_marched_pkey" PRIMARY KEY using index "tours_marched_pkey";

alter table "public"."tours_marched" add constraint "tours_marched_cadet_id_fkey" FOREIGN KEY (cadet_id) REFERENCES public.profiles(id) not valid;

alter table "public"."tours_marched" validate constraint "tours_marched_cadet_id_fkey";

alter table "public"."tours_marched" add constraint "tours_marched_tac_officer_id_fkey" FOREIGN KEY (tac_officer_id) REFERENCES public.profiles(id) not valid;

alter table "public"."tours_marched" validate constraint "tours_marched_tac_officer_id_fkey";

grant delete on table "public"."tours_marched" to "anon";

grant insert on table "public"."tours_marched" to "anon";

grant references on table "public"."tours_marched" to "anon";

grant select on table "public"."tours_marched" to "anon";

grant trigger on table "public"."tours_marched" to "anon";

grant truncate on table "public"."tours_marched" to "anon";

grant update on table "public"."tours_marched" to "anon";

grant delete on table "public"."tours_marched" to "authenticated";

grant insert on table "public"."tours_marched" to "authenticated";

grant references on table "public"."tours_marched" to "authenticated";

grant select on table "public"."tours_marched" to "authenticated";

grant trigger on table "public"."tours_marched" to "authenticated";

grant truncate on table "public"."tours_marched" to "authenticated";

grant update on table "public"."tours_marched" to "authenticated";

grant delete on table "public"."tours_marched" to "service_role";

grant insert on table "public"."tours_marched" to "service_role";

grant references on table "public"."tours_marched" to "service_role";

grant select on table "public"."tours_marched" to "service_role";

grant trigger on table "public"."tours_marched" to "service_role";

grant truncate on table "public"."tours_marched" to "service_role";

grant update on table "public"."tours_marched" to "service_role";


  create policy "Cadets can see their own tour log"
  on "public"."tours_marched"
  as permissive
  for select
  to authenticated
using ((auth.uid() = cadet_id));



  create policy "Faculty can add tour log entries"
  on "public"."tours_marched"
  as permissive
  for insert
  to authenticated
with check (((( SELECT profiles.role_level
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) > 50) AND (tac_officer_id = auth.uid())));



  create policy "Faculty can see all tour logs"
  on "public"."tours_marched"
  as permissive
  for select
  to authenticated
using ((( SELECT profiles.role_level
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) > 50));



