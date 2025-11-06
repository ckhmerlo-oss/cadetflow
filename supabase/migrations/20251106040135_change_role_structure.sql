

-- 1. Drop the old 'group_id' column from profiles
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS group_id;

-- Drop the old policy, as the table is gone
DROP POLICY IF EXISTS "Authenticated users can see all group memberships" ON public.group_members;

-- 2. Drop the old 'group_members' table, as roles now handle membership
DROP TABLE IF EXISTS public.group_members;

-- 3. Add a new column to 'roles' to link a role to an approval group
ALTER TABLE public.roles
ADD COLUMN approval_group_id UUID REFERENCES public.approval_groups(id) ON DELETE SET NULL;

-- 4. Add an index for this new column
CREATE INDEX IF NOT EXISTS idx_roles_approval_group_id ON public.roles (approval_group_id);

CREATE OR REPLACE FUNCTION public.is_member_of_approver_group(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- NEW LOGIC:
  -- A user is a "member" if their assigned role is linked to that group.
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.approval_group_id = p_group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.create_new_report(
  p_subject_cadet_id uuid,
  p_offense_type_id uuid,
  p_notes text,
  p_date_of_offense date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submitter_level INTEGER;
  subject_level INTEGER;
  submitter_role_id uuid;
  submitter_approval_group_id uuid; -- New variable
  first_approver_group_id uuid;
  new_report_id uuid;
BEGIN
  -- 0. Get levels and the submitter's ROLE ID
  SELECT role_level, role_id INTO submitter_level, submitter_role_id
  FROM public.profiles WHERE id = auth.uid();
  
  SELECT role_level INTO subject_level FROM public.profiles WHERE id = p_subject_cadet_id;

  IF submitter_level <= subject_level THEN
    RAISE EXCEPTION 'Permission denied: Cannot report on a peer or superior.';
  END IF;

  -- 1. Find the submitter's approval group *from their role*
  SELECT approval_group_id INTO submitter_approval_group_id
  FROM public.roles WHERE id = submitter_role_id;

  IF submitter_approval_group_id IS NULL THEN
    RAISE EXCEPTION 'Cannot submit: Your role has no approval group defined.';
  END IF;

  -- 2. Find the *next* group in the chain
  SELECT next_approver_group_id INTO first_approver_group_id
  FROM public.approval_groups WHERE id = submitter_approval_group_id;

  -- 3. Check if submitter is their own final approver
  IF first_approver_group_id IS NULL THEN
    -- Auto-complete the report
    INSERT INTO public.demerit_reports (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'completed', NULL)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created (auto-approved)');
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'approved', 'Auto-approved by final authority.');
  ELSE
    -- Standard approval chain
    INSERT INTO public.demerit_reports (subject_cadet_id, offense_type_id, notes, date_of_offense, submitted_by, status, current_approver_group_id)
    VALUES (p_subject_cadet_id, p_offense_type_id, p_notes, p_date_of_offense, auth.uid(), 'pending_approval', first_approver_group_id)
    RETURNING id INTO new_report_id;
    
    INSERT INTO public.approval_log (report_id, actor_id, action, comment)
    VALUES (new_report_id, auth.uid(), 'submitted', 'Report created');
  END IF;

  RETURN new_report_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_dashboard_reports()
RETURNS TABLE(id uuid, status text, created_at timestamptz, current_approver_group_id uuid, subject_cadet_id uuid, submitted_by uuid, offense_type_id uuid, notes text, date_of_offense date, subject json, submitter json, "group" json, offense_type json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        -- 1. I am the subject
        dr.subject_cadet_id = auth.uid()
        -- 2. I am the submitter
        OR dr.submitted_by = auth.uid()
        -- 3. I am in the current approval group
        -- *** UPDATED LOGIC (no longer uses group_members) ***
        OR (EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid()
              AND r.approval_group_id = dr.current_approver_group_id
        ));
END;
$$;

