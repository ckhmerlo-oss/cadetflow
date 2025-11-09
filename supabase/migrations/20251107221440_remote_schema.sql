drop function if exists "public"."get_cadet_audit_log"(p_cadet_id uuid);


  create table "public"."appeals" (
    "id" uuid not null default gen_random_uuid(),
    "report_id" uuid not null,
    "appealing_cadet_id" uuid not null,
    "status" text not null,
    "current_assignee_id" uuid,
    "current_group_id" uuid,
    "justification" text not null,
    "issuer_comment" text,
    "chain_comment" text,
    "final_comment" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."appeals" enable row level security;

alter table "public"."demerit_reports" add column "demerits_effective" integer not null;

CREATE UNIQUE INDEX appeals_pkey ON public.appeals USING btree (id);

alter table "public"."appeals" add constraint "appeals_pkey" PRIMARY KEY using index "appeals_pkey";

alter table "public"."appeals" add constraint "appeals_appealing_cadet_id_fkey" FOREIGN KEY (appealing_cadet_id) REFERENCES public.profiles(id) not valid;

alter table "public"."appeals" validate constraint "appeals_appealing_cadet_id_fkey";

alter table "public"."appeals" add constraint "appeals_current_assignee_id_fkey" FOREIGN KEY (current_assignee_id) REFERENCES public.profiles(id) not valid;

alter table "public"."appeals" validate constraint "appeals_current_assignee_id_fkey";

alter table "public"."appeals" add constraint "appeals_current_group_id_fkey" FOREIGN KEY (current_group_id) REFERENCES public.approval_groups(id) not valid;

alter table "public"."appeals" validate constraint "appeals_current_group_id_fkey";

alter table "public"."appeals" add constraint "appeals_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.demerit_reports(id) ON DELETE CASCADE not valid;

alter table "public"."appeals" validate constraint "appeals_report_id_fkey";

alter table "public"."appeals" add constraint "appeals_status_check" CHECK ((status = ANY (ARRAY['pending_issuer'::text, 'rejected_by_issuer'::text, 'pending_chain'::text, 'rejected_by_chain'::text, 'pending_commandant'::text, 'approved'::text, 'rejected_final'::text]))) not valid;

alter table "public"."appeals" validate constraint "appeals_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_appeal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Automatically set the initial status
  NEW.status := 'pending_issuer';

  -- 2. Automatically assign it to the original report submitter
  SELECT submitted_by INTO NEW.current_assignee_id
  FROM public.demerit_reports
  WHERE id = NEW.report_id;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cadet_audit_log(p_cadet_id uuid)
 RETURNS TABLE(event_date timestamp with time zone, event_type text, title text, details text, demerits_issued integer, tour_change integer, actor_name text, status text, running_balance bigint, report_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security Check
  IF (auth.uid() != p_cadet_id) AND (public.get_my_role_level() < 50) THEN
    RAISE EXCEPTION 'You do not have permission to view this audit log.';
  END IF;

  RETURN QUERY
  WITH all_events AS (
    -- Demerit Reports
    SELECT
      r.created_at AS event_date_inner,
      'demerit'::text AS event_type_inner,
      ot.offense_name AS title_inner,
      r.notes AS details_inner,
      r.demerits_effective AS demerits_issued_inner,
      CASE 
        WHEN r.status = 'rejected' THEN 0 
        WHEN r.status = 'completed' THEN COALESCE(tl.amount, r.demerits_effective)
        ELSE 0 
      END AS tour_change_inner,
      (sub.first_name || ' ' || sub.last_name) AS actor_name_inner,
      r.status AS status_inner,
      r.id AS report_id_inner -- <-- Capture the ID here
    FROM
      public.demerit_reports r
    LEFT JOIN
      public.offense_types ot ON r.offense_type_id = ot.id
    LEFT JOIN
      public.profiles sub ON r.submitted_by = sub.id
    LEFT JOIN
      public.tour_ledger tl ON r.id = tl.report_id AND tl.action = 'assigned'
    WHERE
      r.subject_cadet_id = p_cadet_id

    UNION ALL

    -- Tours Served
    SELECT
      tl.created_at AS event_date_inner,
      'served'::text AS event_type_inner,
      'Tours Served'::text AS title_inner,
      tl.comment AS details_inner,
      0 AS demerits_issued_inner,
      tl.amount AS tour_change_inner,
      (staff.first_name || ' ' || staff.last_name) AS actor_name_inner,
      'completed'::text AS status_inner,
      NULL::uuid AS report_id_inner -- <-- No report ID for served tours
    FROM
      public.tour_ledger tl
    LEFT JOIN
      public.profiles staff ON tl.staff_id = staff.id
    WHERE
      tl.cadet_id = p_cadet_id
      AND tl.action = 'served'
  )
  SELECT
    ae.event_date_inner,
    ae.event_type_inner,
    ae.title_inner,
    ae.details_inner,
    ae.demerits_issued_inner,
    ae.tour_change_inner,
    ae.actor_name_inner,
    ae.status_inner,
    SUM(ae.tour_change_inner) OVER (ORDER BY ae.event_date_inner ASC) AS running_balance,
    ae.report_id_inner -- <-- Pass it to the final output
  FROM
    all_events ae
  ORDER BY
    ae.event_date_inner DESC;
END;
$function$
;

grant delete on table "public"."appeals" to "anon";

grant insert on table "public"."appeals" to "anon";

grant references on table "public"."appeals" to "anon";

grant select on table "public"."appeals" to "anon";

grant trigger on table "public"."appeals" to "anon";

grant truncate on table "public"."appeals" to "anon";

grant update on table "public"."appeals" to "anon";

grant delete on table "public"."appeals" to "authenticated";

grant insert on table "public"."appeals" to "authenticated";

grant references on table "public"."appeals" to "authenticated";

grant select on table "public"."appeals" to "authenticated";

grant trigger on table "public"."appeals" to "authenticated";

grant truncate on table "public"."appeals" to "authenticated";

grant update on table "public"."appeals" to "authenticated";

grant delete on table "public"."appeals" to "service_role";

grant insert on table "public"."appeals" to "service_role";

grant references on table "public"."appeals" to "service_role";

grant select on table "public"."appeals" to "service_role";

grant trigger on table "public"."appeals" to "service_role";

grant truncate on table "public"."appeals" to "service_role";

grant update on table "public"."appeals" to "service_role";


  create policy "Assignees can update appeals"
  on "public"."appeals"
  as permissive
  for update
  to public
using (((auth.uid() = current_assignee_id) OR public.is_member_of_approver_group(current_group_id)));



  create policy "Cadets can create appeals"
  on "public"."appeals"
  as permissive
  for insert
  to public
with check ((auth.uid() = appealing_cadet_id));



  create policy "Cadets can see own appeals"
  on "public"."appeals"
  as permissive
  for select
  to public
using ((auth.uid() = appealing_cadet_id));



  create policy "Staff can see all appeals"
  on "public"."appeals"
  as permissive
  for select
  to public
using ((public.get_my_role_level() >= 15));


CREATE TRIGGER on_appeal_created BEFORE INSERT ON public.appeals FOR EACH ROW EXECUTE FUNCTION public.handle_new_appeal();


