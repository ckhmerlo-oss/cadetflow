
  create policy "Enable modification for Staff only"
  on "public"."approval_groups"
  as permissive
  for all
  to authenticated
using ((public.get_user_role_level() >= 50))
with check ((public.get_user_role_level() >= 50));



  create policy "Enable role modification for Staff only"
  on "public"."roles"
  as permissive
  for all
  to authenticated
using ((public.get_user_role_level() >= 50))
with check ((public.get_user_role_level() >= 50));



