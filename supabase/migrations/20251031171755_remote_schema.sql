drop policy "Involved parties can edit report" on "public"."demerit_reports";


  create policy "Involved parties can edit report"
  on "public"."demerit_reports"
  as permissive
  for update
  to authenticated
using (((auth.uid() = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id) OR (EXISTS ( SELECT 1
   FROM public.approval_log
  WHERE ((approval_log.report_id = demerit_reports.id) AND (approval_log.actor_id = auth.uid()))))));



