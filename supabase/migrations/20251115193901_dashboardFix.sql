drop function if exists "public"."get_my_dashboard_reports"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_action_items()
 RETURNS TABLE(id uuid, created_at timestamp with time zone, status text, subject json, submitter json, company json, offense_type json, notes text, logs json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    my_approval_group_id uuid;
BEGIN
    SELECT r.approval_group_id
    INTO my_approval_group_id
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid();

    IF my_approval_group_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        dr.id,
        dr.created_at,
        dr.status,
        json_build_object('first_name', s.first_name, 'last_name', s.last_name) AS "subject",
        json_build_object('first_name', sub.first_name, 'last_name', sub.last_name) AS submitter,
        json_build_object('company_name', c.company_name) AS "company", 
        json_build_object('offense_name', ot.offense_name, 'demerits', ot.demerits) AS offense_type,
        dr.notes,
        COALESCE((
            SELECT json_agg(json_build_object(
                'actor_name', (
                    -- *** THIS IS THE FIX ***
                    SELECT p_actor.last_name || ', ' || SUBSTRING(p_actor.first_name, 1, 1) || '.' 
                    FROM public.profiles p_actor -- Aliased to p_actor
                    WHERE p_actor.id = al.actor_id -- No ambiguity
                    -- *** END FIX ***
                ),
                'action', al.action,
                'date', al.created_at,
                'comment', al.comment
            ) ORDER BY al.created_at DESC)
            FROM public.approval_log al
            WHERE al.report_id = dr.id
        ), '[]'::json) AS logs
    FROM 
        public.demerit_reports AS dr
    LEFT JOIN public.profiles AS s ON dr.subject_cadet_id = s.id
    LEFT JOIN public.profiles AS sub ON dr.submitted_by = sub.id
    LEFT JOIN public.companies AS c ON s.company_id = c.id
    LEFT JOIN public.offense_types AS ot ON dr.offense_type_id = ot.id
    WHERE
        dr.status = 'pending_approval'
        AND dr.current_approver_group_id = my_approval_group_id
    ORDER BY
        dr.created_at ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_dashboard_reports()
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, "group" json, offense_type json, appeal_status text)
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
        json_build_object('offense_name', ot.offense_name) AS offense_type,
        -- *** THIS IS THE FIX ***
        (SELECT a.status FROM public.appeals a WHERE a.report_id = dr.id ORDER BY a.updated_at DESC LIMIT 1) AS appeal_status
        -- *** END FIX ***
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


