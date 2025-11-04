drop policy "Cadets can see profiles of people involved in their reports" on "public"."profiles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_dashboard_reports()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, "group" json, offense_type json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    -- This function's WHERE clause effectively re-implements RLS
    -- but allows us to safely join to get names.
    RETURN QUERY
    SELECT 
        dr.id, 
        dr.status, 
        dr.created_at, 
        dr.current_approver_group_id, 
        dr.subject_cadet_id, 
        dr.submitted_by,
        dr.offense_type_id,
        dr.notes,
        dr.date_of_offense,
        
        -- Build JSON objects for related data
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object('group_name', ag.group_name) AS "group",
        json_build_object('offense_name', ot.offense_name) AS offense_type

    FROM public.demerit_reports AS dr
    -- Joins to get names (bypasses RLS because of SECURITY DEFINER)
    LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
    LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
    LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
    LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id
    
    -- WHERE clause (enforces security inside the function)
    WHERE 
        -- 1. I am the subject
        dr.subject_cadet_id = auth.uid()
        
        -- 2. I am the submitter
        OR dr.submitted_by = auth.uid()
        
        -- 3. I am in the current approval group
        OR (EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = dr.current_approver_group_id
            AND gm.user_id = auth.uid()
        ));
END;
$function$
;


