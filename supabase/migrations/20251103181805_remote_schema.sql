drop policy "Allow access to involved parties" on "public"."demerit_reports";

drop policy "Users can see relevant reports (Group Model)" on "public"."demerit_reports";


  create policy "Users can see reports they are involved with or can oversee"
  on "public"."demerit_reports"
  as permissive
  for select
  to authenticated
using (((auth.uid() = subject_cadet_id) OR (auth.uid() = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id) OR (( SELECT profiles.role_level
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) >= 50)));



