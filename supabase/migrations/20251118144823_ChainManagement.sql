alter table "public"."approval_groups" add column "company_id" uuid;

alter table "public"."approval_groups" add column "is_final_authority" boolean default false;

alter table "public"."approval_groups" add constraint "approval_groups_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) not valid;

alter table "public"."approval_groups" validate constraint "approval_groups_company_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_role_level()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(r.default_role_level, 0)
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
$function$
;


  create policy "Enable delete for Staff only"
  on "public"."approval_groups"
  as permissive
  for delete
  to authenticated
using ((public.get_user_role_level() >= 50));



  create policy "Enable insert for Staff only"
  on "public"."approval_groups"
  as permissive
  for insert
  to authenticated
with check ((public.get_user_role_level() >= 50));



  create policy "Enable read access for all authenticated users"
  on "public"."approval_groups"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable update for Staff only"
  on "public"."approval_groups"
  as permissive
  for update
  to authenticated
using ((public.get_user_role_level() >= 50))
with check ((public.get_user_role_level() >= 50));



  create policy "Enable modification for Staff only"
  on "public"."roles"
  as permissive
  for all
  to authenticated
using ((public.get_user_role_level() >= 50))
with check ((public.get_user_role_level() >= 50));



  create policy "Enable read access for all authenticated users"
  on "public"."roles"
  as permissive
  for select
  to authenticated
using (true);



