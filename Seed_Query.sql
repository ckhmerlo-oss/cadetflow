BEGIN;

-- === 0. THE FIX ===
-- Add the missing unique constraint to the approval_groups table
ALTER TABLE public.approval_groups
ADD CONSTRAINT approval_groups_group_name_key UNIQUE (group_name);


-- === 1. SEED COMPANIES ===
INSERT INTO public.companies (company_name)
VALUES
  ('Battalion Staff'),
  ('Alpha Company'),
  ('Bravo Company'),
  ('Charlie Company'),
  ('Delta Company'),
  ('Band Company'),
  ('Faculty')
ON CONFLICT (company_name) DO NOTHING;


-- === 2. SEED APPROVAL GROUPS (The "Offices") ===
-- (This section will now work thanks to the fix above)
WITH comm_staff_group AS (
  INSERT INTO public.approval_groups (group_name, next_approver_group_id)
  VALUES ('Commandant Staff', NULL)
  ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = NULL
  RETURNING id
),

-- Level 4 (Parallel): TAC Officers, Faculty, and Batt Staff
tac_groups AS (
  INSERT INTO public.approval_groups (group_name, next_approver_group_id)
  SELECT
    c.company_name || ' TAC',
    comm_staff_group.id
  FROM public.companies c, comm_staff_group
  WHERE c.company_name IN ('Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company', 'Band Company')
  ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = EXCLUDED.next_approver_group_id
  RETURNING id, group_name
),
faculty_group AS (
  INSERT INTO public.approval_groups (group_name, next_approver_group_id)
  SELECT 'Faculty', comm_staff_group.id FROM comm_staff_group
  ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = EXCLUDED.next_approver_group_id
  RETURNING id
),
batt_staff_group AS (
  INSERT INTO public.approval_groups (group_name, next_approver_group_id)
  SELECT 'Battalion Staff', comm_staff_group.id FROM comm_staff_group
  ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = EXCLUDED.next_approver_group_id
  RETURNING id
),

-- Level 3: Company Staff
co_staff_groups AS (
  INSERT INTO public.approval_groups (group_name, next_approver_group_id)
  SELECT
    c.company_name || ' Co. Staff',
    tg.id
  FROM public.companies c
  JOIN tac_groups tg ON tg.group_name = c.company_name || ' TAC'
  WHERE c.company_name IN ('Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company', 'Band Company')
  ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = EXCLUDED.next_approver_group_id
  RETURNING id, group_name
),

-- Level 2: Platoon Staff
plt_staff_groups AS (
  INSERT INTO public.approval_groups (group_name, next_approver_group_id)
  SELECT
    c.company_name || ' Platoon Staff',
    csg.id
  FROM public.companies c
  JOIN co_staff_groups csg ON csg.group_name = c.company_name || ' Co. Staff'
  WHERE c.company_name IN ('Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company', 'Band Company')
  ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = EXCLUDED.next_approver_group_id
  RETURNING id, group_name
)

-- Level 1: Squad Staff
INSERT INTO public.approval_groups (group_name, next_approver_group_id)
SELECT
  c.company_name || ' Squad Staff',
  psg.id
FROM public.companies c
JOIN plt_staff_groups psg ON psg.group_name = c.company_name || ' Platoon Staff'
WHERE c.company_name IN ('Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company', 'Band Company')
ON CONFLICT (group_name) DO UPDATE SET next_approver_group_id = EXCLUDED.next_approver_group_id;


-- === 3. SEED ROLES (The "Jobs") ===

-- A) Commandant & Faculty Roles
INSERT INTO public.roles (company_id, role_name, default_role_level, approval_group_id, can_manage_all_rosters)
VALUES
  ((SELECT id FROM companies WHERE company_name = 'Battalion Staff'), 'Commandant', 100, (SELECT id FROM approval_groups WHERE group_name = 'Commandant Staff'), true),
  ((SELECT id FROM companies WHERE company_name = 'Battalion Staff'), 'Deputy Commandant', 95, (SELECT id FROM approval_groups WHERE group_name = 'Commandant Staff'), true),
  ((SELECT id FROM companies WHERE company_name = 'Battalion Staff'), 'Assistant Commandant', 90, (SELECT id FROM approval_groups WHERE group_name = 'Commandant Staff'), true),
  ((SELECT id FROM companies WHERE company_name = 'Faculty'), 'Faculty', 50, (SELECT id FROM approval_groups WHERE group_name = 'Faculty'), false)
ON CONFLICT (company_id, role_name) DO NOTHING;

-- B) Cadet Company Roles (Dynamic Insertion)
INSERT INTO public.roles (company_id, role_name, default_role_level, can_manage_own_company_roster, approval_group_id)
SELECT
  c.id as company_id,
  c.company_name || ' ' || rt.role_name_suffix as role_name,
  rt.default_role_level,
  rt.can_manage_own,
  ag.id as approval_group_id
FROM
  public.companies c
CROSS JOIN (
  VALUES
    ('Company Commander', 40, true, ' Co. Staff'),
    ('Executive Officer', 38, false, ' Co. Staff'),
    ('First Sergeant', 38, false, ' Co. Staff'),
    ('Platoon Leader', 30, false, ' Platoon Staff'),
    ('Platoon Sergeant', 28, false, ' Platoon Staff'),
    ('Squad Leader', 20, false, ' Squad Staff'),
    ('Laundry Sergeant', 15, false, ' Squad Staff'),
    ('Cadet', 10, false, NULL)
) AS rt(role_name_suffix, default_role_level, can_manage_own, group_suffix)
LEFT JOIN public.approval_groups ag
  ON ag.group_name = c.company_name || rt.group_suffix
WHERE c.company_name IN ('Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company', 'Band Company')
ON CONFLICT (company_id, role_name) DO NOTHING;


-- === 4. UPDATE CORE FUNCTIONS ===

CREATE OR REPLACE FUNCTION public.is_member_of_approver_group(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
        dr.subject_cadet_id = auth.uid()
        OR dr.submitted_by = auth.uid()
        OR (EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid()
              AND r.approval_group_id = dr.current_approver_group_id
        ));
END;
$$;

-- === 5. UPDATE RLS POLICIES ===

DROP POLICY IF EXISTS "Users can see reports they are involved in or faculty" ON public.demerit_reports;
CREATE POLICY "Users can see reports they are involved in or faculty"
  ON public.demerit_reports FOR SELECT
  USING (
    subject_cadet_id = auth.uid() OR
    submitted_by = auth.uid() OR
    public.is_member_of_approver_group(current_approver_group_id) OR
    (public.get_my_role_level() >= 50)
  );

DROP POLICY IF EXISTS "Involved parties can edit non-completed reports" ON public.demerit_reports;
CREATE POLICY "Involved parties can edit non-completed reports"
  ON public.demerit_reports FOR UPDATE
  USING (
    (status <> 'completed'::text) AND (
      (auth.uid() = submitted_by) OR
      public.is_member_of_approver_group(current_approver_group_id)
    )
  );
  
COMMIT;