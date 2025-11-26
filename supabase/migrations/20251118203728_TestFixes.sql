drop policy "Approvers can see processed reports" on "public"."demerit_reports";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.has_acted_on_report(p_report_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.approval_log
    WHERE report_id = p_report_id
    AND actor_id = auth.uid()
  );
$function$
;


  create policy "Approvers can see processed reports"
  on "public"."demerit_reports"
  as permissive
  for select
  to authenticated
using (public.has_acted_on_report(id));



