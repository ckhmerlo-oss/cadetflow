drop policy "Involved parties can edit report" on "public"."demerit_reports";

drop function if exists "public"."create_new_report"(title text, subject_cadet_id uuid, content jsonb);


  create table "public"."academic_terms" (
    "id" uuid not null default gen_random_uuid(),
    "academic_year_start" integer not null,
    "term_number" integer not null,
    "start_date" date not null,
    "end_date" date not null
      );


alter table "public"."academic_terms" enable row level security;

alter table "public"."demerit_reports" add column "date_of_offense" date not null;

alter table "public"."profiles" add column "total_demerits" integer not null default 0;

CREATE UNIQUE INDEX academic_terms_pkey ON public.academic_terms USING btree (id);

CREATE UNIQUE INDEX academic_terms_year_term_unique ON public.academic_terms USING btree (academic_year_start, term_number);

CREATE INDEX idx_demerit_reports_date_of_offense ON public.demerit_reports USING btree (date_of_offense);

alter table "public"."academic_terms" add constraint "academic_terms_pkey" PRIMARY KEY using index "academic_terms_pkey";

alter table "public"."academic_terms" add constraint "academic_terms_year_term_unique" UNIQUE using index "academic_terms_year_term_unique";

alter table "public"."academic_terms" add constraint "check_dates" CHECK ((start_date < end_date)) not valid;

alter table "public"."academic_terms" validate constraint "check_dates";

alter table "public"."demerit_reports" add constraint "check_offense_date_not_future" CHECK ((date_of_offense <= (created_at)::date)) not valid;

alter table "public"."demerit_reports" validate constraint "check_offense_date_not_future";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_report(p_title text, p_subject_cadet_id uuid, p_content jsonb, p_date_of_offense date)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  submitter_level INTEGER := public.get_my_role_level(); 
  subject_level INTEGER;
  submitter_group_id uuid;
  first_approver_group_id uuid;
  new_report_id uuid;
BEGIN
  -- 0. HIERARCHICAL CHECK
  SELECT role_level INTO subject_level
  FROM public.profiles
  WHERE id = p_subject_cadet_id;

  IF submitter_level <= subject_level THEN
      RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.'
      USING HINT = 'Reports must be submitted by a user with a strictly higher role_level than the subject.';
  END IF;

  -- Step 1: Find the submitter's "home" group
  SELECT group_id INTO submitter_group_id
  FROM public.profiles
  WHERE id = auth.uid();

  IF submitter_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: You are not assigned to a group.';
  END IF;

  -- Step 2: Find the *next* group in the chain
  SELECT next_approver_group_id INTO first_approver_group_id
  FROM public.approval_groups
  WHERE id = submitter_group_id;

  IF first_approver_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your group has no approval chain defined.';
  END IF;

  -- Step 3: Create the new report (MODIFIED INSERT)
  INSERT INTO public.demerit_reports 
    (title, subject_cadet_id, content, date_of_offense, submitted_by, status, current_approver_group_id) -- Added date_of_offense
  VALUES 
    (p_title, p_subject_cadet_id, p_content, p_date_of_offense, auth.uid(), 'pending_approval', first_approver_group_id) -- Added p_date_of_offense
  RETURNING id INTO new_report_id;

  -- Step 4: Log this submission
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');

  RETURN new_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_demerits_for_term(p_cadet_id uuid, p_term_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$
  SELECT 
    COALESCE(SUM((dr.content->>'demerit_count')::int), 0)
  FROM 
    public.demerit_reports AS dr
  JOIN 
    public.academic_terms AS at ON dr.date_of_offense BETWEEN at.start_date AND at.end_date
  WHERE 
    dr.subject_cadet_id = p_cadet_id
    AND at.id = p_term_id
    AND dr.status = 'completed';
$function$
;

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_report record;
  current_group_chain record;
  demerit_count_to_add INTEGER; -- Variable to hold the count
BEGIN
  -- Security Check
  SELECT * INTO current_report FROM public.demerit_reports WHERE id = report_id_to_approve;
  
  -- Prevent action on already completed reports
  IF current_report.status = 'completed' THEN
    RAISE EXCEPTION 'This report is already completed and cannot be modified.';
  END IF;

  IF NOT public.is_member_of_approver_group(current_report.current_approver_group_id) THEN
    RAISE EXCEPTION 'You do not have permission to approve this report.';
  END IF;

  -- Logic: Find the *next* group from the current one
  SELECT next_approver_group_id INTO current_group_chain
  FROM public.approval_groups
  WHERE id = current_report.current_approver_group_id;

  -- Update the report based on the chain
  IF current_group_chain.next_approver_group_id IS NULL THEN
    -- *** This is the FINAL approver. ***
    -- *** BEGIN NEW LOGIC ***
    
    -- 1. Get the demerit count from the report's JSON content
    demerit_count_to_add := (current_report.content->>'demerit_count')::int;

    -- 2. Atomically update the subject cadet's profile
    UPDATE public.profiles
    SET total_demerits = total_demerits + demerit_count_to_add
    WHERE id = current_report.subject_cadet_id;
    
    -- 3. Set the report status to 'completed' and remove from queues
    UPDATE public.demerit_reports
    SET status = 'completed', current_approver_group_id = NULL
    WHERE id = report_id_to_approve;

    -- *** END NEW LOGIC ***
    
  ELSE
    -- This is NOT the final approver. Pass it up the chain.
    UPDATE public.demerit_reports
    SET status = 'pending_approval', current_approver_group_id = current_group_chain.next_approver_group_id
    WHERE id = report_id_to_approve;
  END IF;

  -- Log this action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (report_id_to_approve, auth.uid(), 'approved', approval_comment);
END;
$function$
;

grant delete on table "public"."academic_terms" to "anon";

grant insert on table "public"."academic_terms" to "anon";

grant references on table "public"."academic_terms" to "anon";

grant select on table "public"."academic_terms" to "anon";

grant trigger on table "public"."academic_terms" to "anon";

grant truncate on table "public"."academic_terms" to "anon";

grant update on table "public"."academic_terms" to "anon";

grant delete on table "public"."academic_terms" to "authenticated";

grant insert on table "public"."academic_terms" to "authenticated";

grant references on table "public"."academic_terms" to "authenticated";

grant select on table "public"."academic_terms" to "authenticated";

grant trigger on table "public"."academic_terms" to "authenticated";

grant truncate on table "public"."academic_terms" to "authenticated";

grant update on table "public"."academic_terms" to "authenticated";

grant delete on table "public"."academic_terms" to "service_role";

grant insert on table "public"."academic_terms" to "service_role";

grant references on table "public"."academic_terms" to "service_role";

grant select on table "public"."academic_terms" to "service_role";

grant trigger on table "public"."academic_terms" to "service_role";

grant truncate on table "public"."academic_terms" to "service_role";

grant update on table "public"."academic_terms" to "service_role";


  create policy "Allow public read-only access"
  on "public"."academic_terms"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Involved parties can edit report"
  on "public"."demerit_reports"
  as permissive
  for update
  to authenticated
using (((status <> 'completed'::text) AND ((( SELECT auth.uid() AS uid) = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id) OR public.user_acted_on_report(id))))
with check (((status <> 'completed'::text) AND ((( SELECT auth.uid() AS uid) = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id))));



