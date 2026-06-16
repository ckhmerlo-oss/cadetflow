-- Day 02 remote seed data (idempotent). Password for new accounts: password123

-- ---------------------------------------------------------------------------
-- Prerequisites: staff-capable roles must exist before ensure_staff_profile.
-- Uses WHERE NOT EXISTS so live DBs that already have these roles are untouched.
-- ---------------------------------------------------------------------------
INSERT INTO public.companies (id, company_name)
SELECT 'c0000000-0000-0000-0000-000000000001', 'Alpha Company'
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies WHERE company_name = 'Alpha Company'
);

INSERT INTO public.approval_groups (id, group_name, company_id)
SELECT
  'b0000000-0000-0000-0000-000000000010',
  'Alpha Company TAC',
  c.id
FROM public.companies c
WHERE c.company_name = 'Alpha Company'
  AND NOT EXISTS (
    SELECT 1 FROM public.approval_groups WHERE group_name = 'Alpha Company TAC'
  );

INSERT INTO public.roles (
  id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster
)
SELECT 'a0000000-0000-0000-0000-000000000004', 'Cadet', 0, c.id, NULL, false
FROM public.companies c
WHERE c.company_name = 'Alpha Company'
  AND NOT EXISTS (
    SELECT 1 FROM public.roles WHERE role_name = 'Cadet' AND company_id = c.id
  );

INSERT INTO public.roles (
  id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster
)
SELECT 'a0000000-0000-0000-0000-000000000011', 'Faculty', 50, NULL, NULL, false
WHERE NOT EXISTS (
  SELECT 1 FROM public.roles WHERE role_name = 'Faculty' AND company_id IS NULL
);

INSERT INTO public.roles (
  id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster
)
SELECT
  'a0000000-0000-0000-0000-000000000010',
  'Alpha TAC',
  65,
  c.id,
  g.id,
  true
FROM public.companies c
JOIN public.approval_groups g ON g.group_name = 'Alpha Company TAC'
WHERE c.company_name = 'Alpha Company'
  AND NOT EXISTS (
    SELECT 1 FROM public.roles WHERE role_name = 'Alpha TAC' AND company_id = c.id
  );

UPDATE public.roles
SET default_role_level = 50
WHERE role_name = 'Faculty'
  AND company_id IS NULL
  AND default_role_level < 50;

UPDATE public.approval_groups
SET group_name = 'Alpha Company TAC'
WHERE group_name = 'Alpha TAC';

UPDATE public.cadet_profiles cp
SET sport_spring = 'Varsity Lacrosse'
FROM auth.users u
WHERE u.id = cp.profile_id AND u.email = 'cadet1@test.email';

UPDATE public.cadet_profiles cp
SET sport_spring = 'Track & Field'
FROM auth.users u
WHERE u.id = cp.profile_id AND u.email = 'cadet2@test.email';

INSERT INTO auth.users (
  id, aud, email, encrypted_password, role,
  created_at, updated_at, email_confirmed_at, instance_id,
  raw_app_meta_data, raw_user_meta_data
)
VALUES
  (
    'd1020000-0000-0000-0000-000000000001', 'authenticated', 'teacher1@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1020000-0000-0000-0000-000000000001","email":"teacher1@test.email","email_verified":true}'::jsonb
  ),
  (
    'd1020000-0000-0000-0000-000000000002', 'authenticated', 'teacher2@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1020000-0000-0000-0000-000000000002","email":"teacher2@test.email","email_verified":true}'::jsonb
  ),
  (
    'd1020000-0000-0000-0000-000000000003', 'authenticated', 'coach1@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1020000-0000-0000-0000-000000000003","email":"coach1@test.email","email_verified":true}'::jsonb
  ),
  (
    'd1020000-0000-0000-0000-000000000004', 'authenticated', 'coach2@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1020000-0000-0000-0000-000000000004","email":"coach2@test.email","email_verified":true}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
VALUES
  ('d1020000-0000-0000-0000-000000000001', 'd1020000-0000-0000-0000-000000000001', 'd1020000-0000-0000-0000-000000000001', 'email',
   '{"sub":"d1020000-0000-0000-0000-000000000001","email":"teacher1@test.email","email_verified":true}'::jsonb, now(), now()),
  ('d1020000-0000-0000-0000-000000000002', 'd1020000-0000-0000-0000-000000000002', 'd1020000-0000-0000-0000-000000000002', 'email',
   '{"sub":"d1020000-0000-0000-0000-000000000002","email":"teacher2@test.email","email_verified":true}'::jsonb, now(), now()),
  ('d1020000-0000-0000-0000-000000000003', 'd1020000-0000-0000-0000-000000000003', 'd1020000-0000-0000-0000-000000000003', 'email',
   '{"sub":"d1020000-0000-0000-0000-000000000003","email":"coach1@test.email","email_verified":true}'::jsonb, now(), now()),
  ('d1020000-0000-0000-0000-000000000004', 'd1020000-0000-0000-0000-000000000004', 'd1020000-0000-0000-0000-000000000004', 'email',
   '{"sub":"d1020000-0000-0000-0000-000000000004","email":"coach2@test.email","email_verified":true}'::jsonb, now(), now())
ON CONFLICT (id) DO UPDATE SET identity_data = EXCLUDED.identity_data, updated_at = EXCLUDED.updated_at;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
SELECT v.id, v.first_name, v.last_name, r.id, NULL
FROM (VALUES
  ('d1020000-0000-0000-0000-000000000001'::uuid, 'Alice', 'Teacher'),
  ('d1020000-0000-0000-0000-000000000002'::uuid, 'Bob', 'Teacher'),
  ('d1020000-0000-0000-0000-000000000003'::uuid, 'Dan', 'Coach'),
  ('d1020000-0000-0000-0000-000000000004'::uuid, 'Eve', 'Coach')
) AS v(id, first_name, last_name)
CROSS JOIN public.roles r
WHERE r.role_name = 'Faculty'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id;

UPDATE public.profiles p
SET role_id = faculty.id
FROM public.roles faculty
WHERE faculty.role_name = 'Faculty'
  AND faculty.company_id IS NULL
  AND faculty.default_role_level >= 50
  AND p.id IN (
    'd1020000-0000-0000-0000-000000000001',
    'd1020000-0000-0000-0000-000000000002',
    'd1020000-0000-0000-0000-000000000003',
    'd1020000-0000-0000-0000-000000000004'
  );

SELECT public.ensure_staff_profile(p.id)
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
WHERE p.id IN (
  'd1020000-0000-0000-0000-000000000001',
  'd1020000-0000-0000-0000-000000000002',
  'd1020000-0000-0000-0000-000000000003',
  'd1020000-0000-0000-0000-000000000004'
)
AND r.default_role_level >= 50;

SELECT public.ensure_staff_profile(p.id)
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'faculty@test.email'
  AND r.default_role_level >= 50;

INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('d1030000-0000-0000-0000-000000000001', 'Term 1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2025-2026', 1, false),
  ('d1030000-0000-0000-0000-000000000002', 'Term 2', CURRENT_DATE - 30, CURRENT_DATE + 30, '2025-2026', 2, false),
  ('d1030000-0000-0000-0000-000000000003', 'Term 3', CURRENT_DATE + 31, CURRENT_DATE + 60, '2025-2026', 3, false),
  ('d1030000-0000-0000-0000-000000000004', 'Term 4', CURRENT_DATE + 61, CURRENT_DATE + 90, '2025-2026', 4, false),
  ('d1030000-0000-0000-0000-000000000005', 'Term 5', CURRENT_DATE + 91, CURRENT_DATE + 120, '2025-2026', 5, false)
ON CONFLICT (id) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  school_year = EXCLUDED.school_year,
  term_number = EXCLUDED.term_number,
  archived = false;

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, seminar_period, course_name)
VALUES
  ('d1040000-0000-0000-0000-000000000001', 'd1020000-0000-0000-0000-000000000001', '2025-2026', 2, NULL, 'Algebra II'),
  ('d1040000-0000-0000-0000-000000000002', 'd1020000-0000-0000-0000-000000000002', '2025-2026', 2, NULL, 'US History'),
  ('d1040000-0000-0000-0000-000000000003', 'd1020000-0000-0000-0000-000000000002', '2025-2026', NULL, 'a', 'Leadership Seminar'),
  ('d1040000-0000-0000-0000-000000000004', 'd1020000-0000-0000-0000-000000000001', '2025-2026', 1, NULL, 'Geometry')
ON CONFLICT (id) DO UPDATE SET
  teacher_id = EXCLUDED.teacher_id,
  course_name = EXCLUDED.course_name,
  term_number = EXCLUDED.term_number,
  seminar_period = EXCLUDED.seminar_period,
  archived = false;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
SELECT c.id, 'd1040000-0000-0000-0000-000000000001'::uuid, 'term_2', '2025-2026', 'd1020000-0000-0000-0000-000000000001'::uuid
FROM auth.users c WHERE c.email = 'cadet1@test.email'
ON CONFLICT DO NOTHING;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
SELECT c.id, 'd1040000-0000-0000-0000-000000000003'::uuid, 'seminar_a', '2025-2026', 'd1020000-0000-0000-0000-000000000002'::uuid
FROM auth.users c WHERE c.email = 'cadet1@test.email'
ON CONFLICT DO NOTHING;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
SELECT c.id, 'd1040000-0000-0000-0000-000000000002'::uuid, 'term_2', '2025-2026', 'd1020000-0000-0000-0000-000000000002'::uuid
FROM auth.users c WHERE c.email = 'cadet2@test.email'
ON CONFLICT DO NOTHING;

INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'd1020000-0000-0000-0000-000000000003'::uuid, 'Head Coach'
FROM public.sports s
WHERE s.name = 'Varsity Lacrosse' AND s.season = 'Spring'
ON CONFLICT (sport_id, coach_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'd1020000-0000-0000-0000-000000000004'::uuid, 'Head Coach'
FROM public.sports s
WHERE s.name = 'Track & Field' AND s.season = 'Spring'
ON CONFLICT (sport_id, coach_id) DO UPDATE SET role = EXCLUDED.role;

SELECT public.sync_cadet_oversight(u.id, NULL)
FROM auth.users u
WHERE u.email IN ('cadet1@test.email', 'cadet2@test.email');
