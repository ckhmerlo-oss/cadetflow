drop policy "Users can create reports" on "public"."demerit_reports";

drop policy "Users can see reports they are involved with or can oversee" on "public"."demerit_reports";

drop policy "Hierarchical view policy" on "public"."profiles";

drop function if exists "public"."update_user_role_level"(p_user_id uuid, p_new_role_level integer);

alter table "public"."profiles" drop column "role_level";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_new_report(p_subject_cadet_id uuid, p_offense_type_id uuid, p_notes text, p_date_of_offense date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  submitter_level INTEGER;
  subject_level INTEGER;
  submitter_role_id uuid;
  submitter_approval_group_id uuid;
  first_approver_group_id uuid;
  new_report_id uuid;
BEGIN
  -- Get level & role from helper and profiles
  SELECT public.get_my_role_level() INTO submitter_level;
  SELECT p.role_id INTO submitter_role_id FROM public.profiles p WHERE id = auth.uid();
  
  -- Get subject's level from their role
  SELECT r.default_role_level INTO subject_level 
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = p_subject_cadet_id;

  IF submitter_level <= subject_level THEN
    RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.';
  END IF;

  -- Find the submitter's approval group *from their role*
  SELECT approval_group_id INTO submitter_approval_group_id
  FROM public.roles WHERE id = submitter_role_id;

  IF submitter_approval_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your role has no approval group defined.';
  END IF;

  -- Find the *next* group in the chain
  SELECT next_approver_group_id INTO first_approver_group_id
  FROM public.approval_groups WHERE id = submitter_approval_group_id;

  -- (Rest of function is unchanged)
  IF first_approver_group_id IS NULL THEN
    INSERT INTO public.demerit_reports (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'completed', NULL)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created (auto-approved)');
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'approved', 'Auto-approved by final authority.');
  ELSE
    INSERT INTO public.demerit_reports (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'pending_approval', first_approver_group_id)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');
  END IF;

  RETURN new_report_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role_level()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- It now reads the level from the user's role
  SELECT r.default_role_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id uuid, p_new_role_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_role_company_id uuid;
BEGIN
  -- Get company of the *new role*
  SELECT company_id
  INTO v_new_role_company_id
  FROM public.roles
  WHERE id = p_new_role_id;

  -- Check if admin has permission to manage this role's company
  IF NOT EXISTS (
    SELECT 1 FROM public.get_manageable_companies()
    WHERE company_id = v_new_role_company_id
  ) THEN
    RAISE EXCEPTION 'You do not have permission to assign roles in this company.';
  END IF;

  -- Update *only* the user's role_id.
  UPDATE public.profiles
  SET
    role_id = p_new_role_id
  WHERE
    id = p_user_id;
END;
$function$
;


  create policy "Users with permission can create reports"
  on "public"."demerit_reports"
  as permissive
  for insert
  to public
with check (((auth.uid() = submitted_by) AND (public.get_my_role_level() > ( SELECT r.default_role_level
   FROM (public.profiles p
     JOIN public.roles r ON ((p.role_id = r.id)))
  WHERE (p.id = demerit_reports.subject_cadet_id)))));



  create policy "Authenticated users can see all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Staff (level 50+) can see all tour ledgers"
  on "public"."tour_ledger"
  as permissive
  for select
  to public
using ((public.get_my_role_level() >= 50));



  create policy "Staff can add tour log entries"
  on "public"."tour_ledger"
  as permissive
  for insert
  to public
with check (((public.get_my_role_level() >= 50) AND (staff_id = auth.uid())));



