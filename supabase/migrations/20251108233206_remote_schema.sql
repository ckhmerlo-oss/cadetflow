drop policy "Users can see reports they are involved in or faculty" on "public"."demerit_reports";


  create policy "Users can see reports they are involved in or faculty"
  on "public"."demerit_reports"
  as permissive
  for select
  to authenticated
using (((subject_cadet_id = auth.uid()) OR (submitted_by = auth.uid()) OR (public.get_my_role_level() >= 50) OR public.is_member_of_approver_group(current_approver_group_id) OR (EXISTS ( SELECT 1
   FROM public.appeals a
  WHERE ((a.report_id = demerit_reports.id) AND ((a.current_assignee_id = auth.uid()) OR public.is_member_of_approver_group(a.current_group_id)))))));



