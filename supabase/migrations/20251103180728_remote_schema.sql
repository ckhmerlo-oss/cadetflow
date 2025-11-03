set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_pending_reports_for_faculty()
 RETURNS TABLE(id uuid, title text, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, subject json, submitter json, "group" json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    my_level INTEGER;
BEGIN
    -- Get the role_level of the currently authenticated user
    -- This will now work because auth.uid() is in the search_path
    SELECT p.role_level 
    INTO my_level 
    FROM public.profiles p 
    WHERE p.id = auth.uid();

    -- Only return data if the user is faculty (role_level > 10)
    IF my_level >= 50 THEN
        RETURN QUERY
        SELECT 
            dr.id,
            dr.title,
            dr.status,
            dr.created_at,
            dr.current_approver_group_id,
            dr.subject_cadet_id,
            dr.submitted_by,
            json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
            json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
            json_build_object('group_name', ag.group_name) AS "group"
        FROM public.demerit_reports AS dr
        LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
        LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
        LEFT JOIN public.approval_groups AS ag ON dr.current_approver_group_id = ag.id
        WHERE
            dr.status = 'pending_approval' OR dr.status = 'needs_revision'
        ORDER BY
            dr.created_at DESC;
    END IF;

    -- If not faculty, return an empty set
    RETURN;
END;
$function$
;


