set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_report_details(p_report_id uuid)
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, offense_type json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    v_my_level int;
BEGIN
    SELECT p.role_level INTO v_my_level FROM public.profiles p WHERE p.id = auth.uid();

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
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object(
            'offense_name', ot.offense_name,
            'offense_code', ot.offense_code,
            'demerits', ot.demerits,
            'policy_category', ot.policy_category
        ) AS offense_type

    FROM public.demerit_reports AS dr
    LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
    LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
    LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id
    
    WHERE 
        dr.id = p_report_id
    AND (
        dr.subject_cadet_id = auth.uid()
        OR dr.submitted_by = auth.uid()
        OR (EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = dr.current_approver_group_id
            AND gm.user_id = auth.uid()
        ))
        -- *** FIX: Changed > 50 to >= 50 ***
        OR v_my_level >= 50
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_pending_reports_for_faculty()
 RETURNS TABLE(id uuid, title text, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, subject json, submitter json, "group" json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    my_level INTEGER;
BEGIN
    SELECT p.role_level 
    INTO my_level 
    FROM public.profiles p 
    WHERE p.id = auth.uid();

    -- *** FIX: Changed > 50 to >= 50 ***
    IF my_level >= 50 THEN
        RETURN QUERY
        SELECT 
            dr.id,
            ot.offense_name AS title, 
            dr.status,
            dr.created_at,
            dr.current_approver_group_id,
            dr.subject_cadet_id,
            dr.submitted_by,
            json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
            json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
            json_build_object('group_name', ag.group_name) AS "group"
        FROM public.demerit_reports AS dr
        LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id 
        LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
        LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
        LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
        WHERE
            dr.status = 'pending_approval' OR dr.status = 'needs_revision'
        ORDER BY
            dr.created_at DESC;
    END IF;

    RETURN;
END;
$function$
;


