create sequence "public"."tour_ledger_id_seq";

drop policy "Allow public read-only access" on "public"."academic_terms";

drop policy "Cadets can see their own tour log" on "public"."tours_marched";

drop policy "Faculty can add tour log entries" on "public"."tours_marched";

drop policy "Faculty can see all tour logs" on "public"."tours_marched";

revoke delete on table "public"."tours_marched" from "anon";

revoke insert on table "public"."tours_marched" from "anon";

revoke references on table "public"."tours_marched" from "anon";

revoke select on table "public"."tours_marched" from "anon";

revoke trigger on table "public"."tours_marched" from "anon";

revoke truncate on table "public"."tours_marched" from "anon";

revoke update on table "public"."tours_marched" from "anon";

revoke delete on table "public"."tours_marched" from "authenticated";

revoke insert on table "public"."tours_marched" from "authenticated";

revoke references on table "public"."tours_marched" from "authenticated";

revoke select on table "public"."tours_marched" from "authenticated";

revoke trigger on table "public"."tours_marched" from "authenticated";

revoke truncate on table "public"."tours_marched" from "authenticated";

revoke update on table "public"."tours_marched" from "authenticated";

revoke delete on table "public"."tours_marched" from "service_role";

revoke insert on table "public"."tours_marched" from "service_role";

revoke references on table "public"."tours_marched" from "service_role";

revoke select on table "public"."tours_marched" from "service_role";

revoke trigger on table "public"."tours_marched" from "service_role";

revoke truncate on table "public"."tours_marched" from "service_role";

revoke update on table "public"."tours_marched" from "service_role";

alter table "public"."academic_terms" drop constraint "academic_terms_year_term_unique";

alter table "public"."tours_marched" drop constraint "tours_marched_cadet_id_fkey";

alter table "public"."tours_marched" drop constraint "tours_marched_tac_officer_id_fkey";

alter table "public"."tours_marched" drop constraint "tours_marched_pkey";

drop index if exists "public"."academic_terms_year_term_unique";

drop index if exists "public"."tours_marched_pkey";

drop table "public"."tours_marched";


  create table "public"."tour_ledger" (
    "id" bigint not null default nextval('public.tour_ledger_id_seq'::regclass),
    "cadet_id" uuid not null,
    "report_id" uuid,
    "term_id" uuid,
    "action" text not null,
    "amount" integer not null,
    "comment" text,
    "staff_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."academic_terms" drop column "academic_year_start";

alter table "public"."academic_terms" drop column "term_number";

alter table "public"."academic_terms" add column "created_at" timestamp with time zone not null default now();

alter table "public"."academic_terms" add column "is_current_term" boolean not null default false;

alter table "public"."academic_terms" add column "term_name" text not null;

alter table "public"."academic_terms" disable row level security;

alter table "public"."demerit_reports" add column "is_posted" boolean not null default false;

alter sequence "public"."tour_ledger_id_seq" owned by "public"."tour_ledger"."id";

CREATE INDEX academic_terms_is_current_term_idx ON public.academic_terms USING btree (is_current_term) WHERE (is_current_term = true);

CREATE INDEX tour_ledger_cadet_id_idx ON public.tour_ledger USING btree (cadet_id);

CREATE UNIQUE INDEX tour_ledger_pkey ON public.tour_ledger USING btree (id);

alter table "public"."tour_ledger" add constraint "tour_ledger_pkey" PRIMARY KEY using index "tour_ledger_pkey";

alter table "public"."tour_ledger" add constraint "tour_ledger_cadet_id_fkey" FOREIGN KEY (cadet_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."tour_ledger" validate constraint "tour_ledger_cadet_id_fkey";

alter table "public"."tour_ledger" add constraint "tour_ledger_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.demerit_reports(id) ON DELETE SET NULL not valid;

alter table "public"."tour_ledger" validate constraint "tour_ledger_report_id_fkey";

alter table "public"."tour_ledger" add constraint "tour_ledger_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."tour_ledger" validate constraint "tour_ledger_staff_id_fkey";

alter table "public"."tour_ledger" add constraint "tour_ledger_term_id_fkey" FOREIGN KEY (term_id) REFERENCES public.academic_terms(id) ON DELETE SET NULL not valid;

alter table "public"."tour_ledger" validate constraint "tour_ledger_term_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_tours_for_report(p_report_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report RECORD;
  v_offense RECORD;
  v_current_term RECORD;
  v_first_cat3_date date;
  v_credits_used_this_term int;
  v_credits_available int;
  v_credits_to_apply int;
  v_tours_to_assign int;
  v_credits_nuked boolean := false;
BEGIN
  -- 1. Get the report, offense, and term details
  SELECT * INTO v_report
  FROM public.demerit_reports
  WHERE id = p_report_id;

  SELECT * INTO v_offense
  FROM public.offense_types
  WHERE id = v_report.offense_type_id;
  
  -- Use the new academic_terms table
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE is_current_term = true
  LIMIT 1;

  IF v_current_term.id IS NULL THEN
    RAISE LOG 'No current term set. Cannot assign tours.';
    RETURN;
  END IF;
  
  -- 2. Check for the "Category 3 Nuke"
  SELECT MIN(r.date_of_offense)
  INTO v_first_cat3_date
  FROM public.demerit_reports r
  JOIN public.offense_types ot ON r.offense_type_id = ot.id
  WHERE r.subject_cadet_id = v_report.subject_cadet_id
    AND r.status = 'completed'
    AND ot.policy_category = 3
    AND r.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;

  IF v_first_cat3_date IS NOT NULL AND v_report.date_of_offense >= v_first_cat3_date THEN
    v_credits_nuked := true;
  END IF;

  -- 3. Calculate Tours (1 demerit = 1 tour)
  v_tours_to_assign := v_offense.demerits;

  -- 4. Apply Credits (if not Category 3 and not nuked)
  IF v_offense.policy_category != 3 AND v_credits_nuked = false THEN
    
    -- Find how many credits have been used by other Cat 1/2 sticks
    SELECT COALESCE(SUM(ot.demerits - tl.amount), 0)
    INTO v_credits_used_this_term
    FROM public.tour_ledger tl
    JOIN public.demerit_reports r ON tl.report_id = r.id
    JOIN public.offense_types ot ON r.offense_type_id = ot.id
    WHERE tl.cadet_id = v_report.subject_cadet_id
      AND tl.term_id = v_current_term.id
      AND tl.action = 'assigned'
      AND ot.policy_category IN (1, 2);

    v_credits_available := 15 - v_credits_used_this_term;
    
    IF v_credits_available > 0 THEN
      v_credits_to_apply := LEAST(v_tours_to_assign, v_credits_available);
      v_tours_to_assign := v_tours_to_assign - v_credits_to_apply;
    END IF;
  END IF;

  -- 5. Add to ledger (only if tours > 0)
  IF v_tours_to_assign > 0 THEN
    INSERT INTO public.tour_ledger
      (cadet_id, report_id, term_id, action, amount, comment, staff_id)
    VALUES
      (v_report.subject_cadet_id, p_report_id, v_current_term.id, 'assigned', v_tours_to_assign,
       'From report: ' || v_offense.offense_name, v_report.submitted_by);
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_tour_and_demerit_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_term RECORD;
  v_term_demerits int;
  v_total_tours int;
BEGIN
  SELECT * INTO v_current_term
  FROM public.academic_terms
  WHERE is_current_term = true
  LIMIT 1;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_tours
  FROM public.tour_ledger
  WHERE cadet_id = auth.uid();

  SELECT COALESCE(SUM(ot.demerits), 0)
  INTO v_term_demerits
  FROM public.demerit_reports r
  JOIN public.offense_types ot ON r.offense_type_id = ot.id
  WHERE r.subject_cadet_id = auth.uid()
    AND r.status = 'completed'
    AND r.date_of_offense BETWEEN v_current_term.start_date AND v_current_term.end_date;

  RETURN json_build_object(
    'term_demerits', v_term_demerits,
    'year_demerits', 0, -- Placeholder
    'total_tours', v_total_tours
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check: Only Commandant or Deputy Commandant
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view the tour sheet.';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS cadet_id,
    p.last_name,
    p.first_name,
    c.company_name,
    SUM(tl.amount) AS total_tours
  FROM
    public.tour_ledger tl
  JOIN
    public.profiles p ON tl.cadet_id = p.id
  LEFT JOIN
    public.companies c ON p.company_id = c.id
  GROUP BY
    p.id, c.company_name
  HAVING
    SUM(tl.amount) > 0 -- Only show cadets who have tours
  ORDER BY
    p.last_name, p.first_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unposted_stick_sheet()
 RETURNS TABLE(report_id uuid, subject_name text, offense_name text, demerits integer, submitter_name text, date_of_offense date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check: Only Commandant or Deputy Commandant
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view this report.';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS report_id,
    p_subject.last_name || ', ' || p_subject.first_name AS subject_name,
    ot.offense_name,
    ot.demerits,
    p_submitter.last_name || ', ' || p_submitter.first_name AS submitter_name,
    r.date_of_offense
  FROM
    demerit_reports r
  JOIN
    profiles p_subject ON r.subject_cadet_id = p_subject.id
  JOIN
    profiles p_submitter ON r.submitted_by = p_submitter.id
  JOIN
    offense_types ot ON r.offense_type_id = ot.id
  WHERE
    r.status = 'completed' AND r.is_posted = false
  ORDER BY
    subject_name, r.date_of_offense;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_served_tours(p_cadet_id uuid, p_tours_served integer, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_negative_amount int;
BEGIN
  -- Permission Check: Faculty/Staff (level >= 50)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role_level >= 50
  ) THEN
    RAISE EXCEPTION 'You do not have permission to log tours.';
  END IF;
  
  v_negative_amount := -1 * ABS(p_tours_served);

  INSERT INTO public.tour_ledger
    (cadet_id, action, amount, comment, staff_id, term_id)
  VALUES
    (p_cadet_id, 'served', v_negative_amount, p_comment, auth.uid(),
     (SELECT id FROM academic_terms WHERE is_current_term = true LIMIT 1));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_reports_as_posted(p_report_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Permission Check: Only Commandant or Deputy Commandant
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action.';
  END IF;

  UPDATE public.demerit_reports
  SET is_posted = true
  WHERE id = ANY(p_report_ids);
END;
$function$
;

grant delete on table "public"."tour_ledger" to "anon";

grant insert on table "public"."tour_ledger" to "anon";

grant references on table "public"."tour_ledger" to "anon";

grant select on table "public"."tour_ledger" to "anon";

grant trigger on table "public"."tour_ledger" to "anon";

grant truncate on table "public"."tour_ledger" to "anon";

grant update on table "public"."tour_ledger" to "anon";

grant delete on table "public"."tour_ledger" to "authenticated";

grant insert on table "public"."tour_ledger" to "authenticated";

grant references on table "public"."tour_ledger" to "authenticated";

grant select on table "public"."tour_ledger" to "authenticated";

grant trigger on table "public"."tour_ledger" to "authenticated";

grant truncate on table "public"."tour_ledger" to "authenticated";

grant update on table "public"."tour_ledger" to "authenticated";

grant delete on table "public"."tour_ledger" to "service_role";

grant insert on table "public"."tour_ledger" to "service_role";

grant references on table "public"."tour_ledger" to "service_role";

grant select on table "public"."tour_ledger" to "service_role";

grant trigger on table "public"."tour_ledger" to "service_role";

grant truncate on table "public"."tour_ledger" to "service_role";

grant update on table "public"."tour_ledger" to "service_role";


