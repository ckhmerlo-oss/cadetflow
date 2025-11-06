drop function if exists "public"."update_my_onboarding_profile"(p_first_name text, p_last_name text, p_company_id uuid);

CREATE UNIQUE INDEX approval_groups_group_name_key ON public.approval_groups USING btree (group_name);

alter table "public"."approval_groups" add constraint "approval_groups_group_name_key" UNIQUE using index "approval_groups_group_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_user_by_id(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_can_manage_all boolean;
BEGIN
  -- 1. Security Check: Only allow admins to run this
  SELECT r.can_manage_all_rosters
  INTO v_can_manage_all
  FROM public.profiles p
  LEFT JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.can_manage_all_rosters = true;

  IF v_can_manage_all IS NOT TRUE THEN
    RAISE EXCEPTION 'You do not have permission to delete users.';
  END IF;

  -- 2. Delete the user from the auth.users table
  DELETE FROM auth.users
  WHERE id = p_user_id;
  
  -- The ON DELETE CASCADE on the profiles table
  -- will automatically delete their profile.
END;
$function$
;

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
  SELECT role_level, role_id INTO submitter_level, submitter_role_id
  FROM public.profiles WHERE id = auth.uid();
  
  SELECT role_level INTO subject_level FROM public.profiles WHERE id = p_subject_cadet_id;

  IF submitter_level <= subject_level THEN
    RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.';
  END IF;

  SELECT approval_group_id INTO submitter_approval_group_id
  FROM public.roles WHERE id = submitter_role_id;

  IF submitter_approval_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your role has no approval group defined.';
  END IF;

  SELECT next_approver_group_id INTO first_approver_group_id
  FROM public.approval_groups WHERE id = submitter_approval_group_id;

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

CREATE OR REPLACE FUNCTION public.get_my_dashboard_reports()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, "group" json, offense_type json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        dr.id, dr.status, dr.created_at, dr.current_approver_group_id, 
        dr.subject_cadet_id, dr.submitted_by, dr.offense_type_id, dr.notes, dr.date_of_offense,
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object('group_name', ag.group_name) AS "group",
        json_build_object('offense_name', ot.offense_name) AS offense_type
    FROM public.demerit_reports AS dr
    LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
    LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
    LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
    LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id
    WHERE 
        dr.subject_cadet_id = auth.uid()
        OR dr.submitted_by = auth.uid()
        OR (EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid()
              AND r.approval_group_id = dr.current_approver_group_id
        ));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_member_of_approver_group(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.approval_group_id = p_group_id
  );
$function$
;


  create policy "Involved parties can edit non-completed reports"
  on "public"."demerit_reports"
  as permissive
  for update
  to public
using (((status <> 'completed'::text) AND ((auth.uid() = submitted_by) OR public.is_member_of_approver_group(current_approver_group_id))));



  create policy "Users can see reports they are involved in or faculty"
  on "public"."demerit_reports"
  as permissive
  for select
  to public
using (((subject_cadet_id = auth.uid()) OR (submitted_by = auth.uid()) OR public.is_member_of_approver_group(current_approver_group_id) OR (public.get_my_role_level() >= 50)));



