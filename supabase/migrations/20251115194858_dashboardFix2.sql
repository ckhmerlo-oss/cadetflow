set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_dashboard_reports()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, "group" json, offense_type json, appeal_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        dr.id, 
        dr.status, 
        dr.created_at, 
        dr.current_approver_group_id, 
        dr.subject_cadet_id, 
        dr.submitted_by, 
        dr.offense_type_id, -- Column 7
        dr.notes,           -- Column 8
        dr.date_of_offense, -- Column 9
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object('group_name', ag.group_name) AS "group",
        json_build_object('offense_name', ot.offense_name) AS offense_type,
        -- FIX: Added alias 'dr' to report_id to prevent ambiguity
        (SELECT a.status FROM public.appeals a WHERE a.report_id = dr.id ORDER BY a.updated_at DESC LIMIT 1) AS appeal_status
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


