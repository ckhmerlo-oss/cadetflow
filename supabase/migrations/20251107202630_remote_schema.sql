alter table "public"."academic_terms" enable row level security;

alter table "public"."tour_ledger" enable row level security;


  create policy "Allow authenticated users to read terms"
  on "public"."academic_terms"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users can see their own ledger or faculty can see all"
  on "public"."tour_ledger"
  as permissive
  for select
  to authenticated
using (((cadet_id = auth.uid()) OR (public.get_my_role_level() >= 50)));



