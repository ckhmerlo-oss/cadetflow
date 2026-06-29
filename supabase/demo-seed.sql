-- Demo environment seed data (remote demo Supabase project + nightly reset)
-- Seeded login password for all users: password123 (must match DEMO_INTERNAL_PASSWORD)
--
-- Apply manually: psql $DATABASE_URL -f supabase/demo-seed.sql
-- Or via Supabase SQL editor after linking the demo project.
--
-- Core roster:
--   commandant@test.email
--   platoon@test.email
--   squad@test.email
--   cadet1@test.email
--   cadet2@test.email
--
-- Day 02 Big-3 oversight fixtures:
--   tac@test.email          Alpha Company TAC (Big-3 TAC)
--   teacher1@test.email     Main-term teacher for cadet1 (Algebra II, Term 2)
--   teacher2@test.email     Main-term teacher for cadet2 + seminar teacher for cadet1
--   faculty@test.email        Voluntary faculty assignment testing
--   maintenance@test.email    Maintenance Staff (WorkFlow portal)
--   coach1@test.email         Head coach, Varsity Lacrosse (cadet1 in-season coach)
--   coach2@test.email         Head coach, Track & Field (cadet2 in-season coach)
--   admin@test.email          System Admin (level 105, force-archive)
--
-- Day 11 parent portal fixtures:
--   parent1@test.email        Linked to cadet1 — conduct history + travel requests
--   parent2@test.email        Linked to cadet2

BEGIN;

-- ---------------------------------------------------------------------------
-- Schema guard — demo-seed requires CadetFlow migrations (companies.company_name)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'companies'
      AND column_name = 'company_name'
  ) THEN
    RAISE EXCEPTION E'Demo seed requires the CadetFlow schema (companies.company_name).\n'
      'The demo project currently has a different schema (e.g. companies.name + school_id).\n'
      'Fix: run supabase/demo-schema-rebuild.sql, then supabase db push, then re-run this file.\n'
      'See specification-checklists/demo-environment.md';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- GoTrue requires empty strings (not NULL) on token columns for password login.
UPDATE auth.users
SET
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- ---------------------------------------------------------------------------
-- Auth users + identities
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id,
  aud,
  email,
  encrypted_password,
  role,
  created_at,
  updated_at,
  email_confirmed_at,
  instance_id,
  last_sign_in_at,
  email_change,
  recovery_token,
  confirmation_token,
  email_change_token_new,
  raw_app_meta_data,
  raw_user_meta_data
)
VALUES
  (
    'b0c0e9df-1061-4721-b589-75780bc64f9c',
    'authenticated',
    'commandant@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"b0c0e9df-1061-4721-b589-75780bc64f9c","email":"commandant@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    'authenticated',
    'platoon@test.email',
    '$2a$10$icOeEyAXp3iwwv.oO6l.e.YR47rJHgmPDljexsAowKhSB7FOXwLfW',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"02c82cc1-f3a6-4327-8c97-acb1ffbaf392","email":"platoon@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'da77b296-ad3e-489f-94c1-955242db224d',
    'authenticated',
    'squad@test.email',
    '$2a$10$tTqd5ljiCg/moC9JyEl0suK1vKMLS9pdhbRZW6hTLC8MFSjdAew8G',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"da77b296-ad3e-489f-94c1-955242db224d","email":"squad@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'authenticated',
    'cadet1@test.email',
    '$2a$10$chyFZ354TxGyWe61cj4xuekDSiZazQ1woNvNzU.CIUEzmWrleV4ye',
    'authenticated',
    '2024-08-01 12:00:00+00',
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"47bd1324-e8ea-4a4b-8d27-9c1592d71770","email":"cadet1@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'authenticated',
    'cadet2@test.email',
    '$2a$10$3dkRXUxWh4sfGAOg9OqLH.BQN2WiryzH8x5lTKV2OI8QN9bzs4YbS',
    'authenticated',
    '2025-08-15 12:00:00+00',
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"fa677a4b-ce1a-4725-b70b-8d4afa328bbe","email":"cadet2@test.email","email_verified":true,"phone_verified":false}'::jsonb
  )
ON CONFLICT (id) DO UPDATE
SET aud = EXCLUDED.aud,
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    email_change = EXCLUDED.email_change,
    recovery_token = EXCLUDED.recovery_token,
    confirmation_token = EXCLUDED.confirmation_token,
    email_change_token_new = EXCLUDED.email_change_token_new,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  created_at,
  updated_at,
  last_sign_in_at
)
VALUES
  (
    'b0c0e9df-1061-4721-b589-75780bc64f9c',
    'b0c0e9df-1061-4721-b589-75780bc64f9c',
    'b0c0e9df-1061-4721-b589-75780bc64f9c',
    'email',
    '{"sub":"b0c0e9df-1061-4721-b589-75780bc64f9c","email":"commandant@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    'email',
    '{"sub":"02c82cc1-f3a6-4327-8c97-acb1ffbaf392","email":"platoon@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'da77b296-ad3e-489f-94c1-955242db224d',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'email',
    '{"sub":"da77b296-ad3e-489f-94c1-955242db224d","email":"squad@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'email',
    '{"sub":"47bd1324-e8ea-4a4b-8d27-9c1592d71770","email":"cadet1@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'email',
    '{"sub":"fa677a4b-ce1a-4725-b70b-8d4afa328bbe","email":"cadet2@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE
SET identity_data = EXCLUDED.identity_data,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at;

-- ---------------------------------------------------------------------------
-- Reference data: companies, groups, roles
-- ---------------------------------------------------------------------------
INSERT INTO public.companies (id, company_name)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Alpha Company'),
  ('c0000000-0000-0000-0000-000000000002', 'Battalion Staff')
ON CONFLICT (id) DO UPDATE
SET company_name = EXCLUDED.company_name;

-- Barracks rooms (wiped by demo-wipe.sql; required before work-order fixtures)
DO $$
BEGIN
  IF to_regprocedure('public.seed_barracks_rooms_catalog()') IS NOT NULL THEN
    PERFORM public.seed_barracks_rooms_catalog();
  ELSE
    RAISE EXCEPTION 'Missing seed_barracks_rooms_catalog(). Run: supabase db push (migration 20260730000001_demo_wipe_helpers.sql)';
  END IF;
END $$;

INSERT INTO public.approval_groups (id, group_name, next_approver_group_id, company_id, is_final_authority)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Commandant''s Office', NULL, 'c0000000-0000-0000-0000-000000000002', true),
  ('b0000000-0000-0000-0000-000000000002', 'Alpha 1st Platoon', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', false),
  ('b0000000-0000-0000-0000-000000000003', 'Alpha 1st Squad', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE
SET group_name = EXCLUDED.group_name,
    next_approver_group_id = EXCLUDED.next_approver_group_id,
    company_id = EXCLUDED.company_id,
    is_final_authority = EXCLUDED.is_final_authority;

INSERT INTO public.roles (
  id,
  role_name,
  can_manage_all_rosters,
  can_manage_own_company_roster,
  company_id,
  default_role_level,
  approval_group_id
)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Commandant', true, true, 'c0000000-0000-0000-0000-000000000002', 90, 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000005', 'Admin', true, true, 'c0000000-0000-0000-0000-000000000002', 105, 'b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000002', 'Platoon Leader', false, true, 'c0000000-0000-0000-0000-000000000001', 20, 'b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000003', 'Squad Leader', false, true, 'c0000000-0000-0000-0000-000000000001', 10, 'b0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000004', 'Cadet', false, false, 'c0000000-0000-0000-0000-000000000001', 0, NULL)
ON CONFLICT (id) DO UPDATE
SET role_name = EXCLUDED.role_name,
    can_manage_all_rosters = EXCLUDED.can_manage_all_rosters,
    can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster,
    company_id = EXCLUDED.company_id,
    default_role_level = EXCLUDED.default_role_level,
    approval_group_id = EXCLUDED.approval_group_id;

-- ---------------------------------------------------------------------------
-- Profiles (identity hub)
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role_id,
  company_id,
  is_site_admin,
  has_seen_tour,
  archived
)
VALUES
  (
    'b0c0e9df-1061-4721-b589-75780bc64f9c',
    'Col.', 'Commandant',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    true,
    false,
    false
  ),
  (
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    'Cadet', 'Platoon',
    'a0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    false,
    false,
    false
  ),
  (
    'da77b296-ad3e-489f-94c1-955242db224d',
    'Cadet', 'Squad',
    'a0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    false,
    false,
    false
  ),
  (
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet', 'Private1',
    'a0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    false,
    false,
    false
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet', 'Private2',
    'a0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    false,
    false,
    false
  )
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role_id = EXCLUDED.role_id,
    company_id = EXCLUDED.company_id,
    is_site_admin = EXCLUDED.is_site_admin,
    has_seen_tour = EXCLUDED.has_seen_tour,
    archived = EXCLUDED.archived;

-- Extension details (rows auto-created by sync trigger when role_id is set)
UPDATE public.staff_profiles
SET staff_title = 'COL', office_location = 'HQ-01'
WHERE profile_id = 'b0c0e9df-1061-4721-b589-75780bc64f9c';

UPDATE public.cadet_profiles
SET
  cadet_rank = v.cadet_rank,
  conduct_status = v.conduct_status,
  grade_level = v.grade_level,
  probation_status = v.probation_status,
  room_number = v.room_number,
  sport_fall = v.sport_fall,
  sport_spring = v.sport_spring,
  sport_winter = v.sport_winter,
  years_attended = v.years_attended,
  has_star_tours = v.has_star_tours,
  cached_tour_balance = v.cached_tour_balance,
  total_demerits = v.total_demerits
FROM (VALUES
  (
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392'::uuid,
    'C/LT', 'Good Standing', '12', 'None', 'A-201',
    'None', 'None', 'None',
    3, false, 0, 0
  ),
  (
    'da77b296-ad3e-489f-94c1-955242db224d'::uuid,
    'C/SGT', 'Good Standing', '11', 'None', 'A-203',
    'None', 'None', 'None',
    2, false, 0, 0
  ),
  (
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770'::uuid,
    'C/PVT', 'Warning', '10', 'None', 'A-105',
    'None', 'Varsity Lacrosse', 'None',
    1, false, 2, 10
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe'::uuid,
    'C/PVT', 'Good Standing', '10', 'None', 'A-106',
    'None', 'Track & Field', 'None',
    1, false, 0, 0
  )
) AS v(
  profile_id, cadet_rank, conduct_status, grade_level, probation_status, room_number,
  sport_fall, sport_spring, sport_winter, years_attended, has_star_tours, cached_tour_balance, total_demerits
)
WHERE cadet_profiles.profile_id = v.profile_id;

-- Re-apply role assignments after company updates.
-- A trigger nullifies role_id whenever company_id changes.
UPDATE public.profiles
SET role_id = CASE id
  WHEN 'b0c0e9df-1061-4721-b589-75780bc64f9c' THEN 'a0000000-0000-0000-0000-000000000001'::uuid
  WHEN '02c82cc1-f3a6-4327-8c97-acb1ffbaf392' THEN 'a0000000-0000-0000-0000-000000000002'::uuid
  WHEN 'da77b296-ad3e-489f-94c1-955242db224d' THEN 'a0000000-0000-0000-0000-000000000003'::uuid
  WHEN '47bd1324-e8ea-4a4b-8d27-9c1592d71770' THEN 'a0000000-0000-0000-0000-000000000004'::uuid
  WHEN 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe' THEN 'a0000000-0000-0000-0000-000000000004'::uuid
  ELSE role_id
END
WHERE id IN (
  'b0c0e9df-1061-4721-b589-75780bc64f9c',
  '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
  'da77b296-ad3e-489f-94c1-955242db224d',
  '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
  'fa677a4b-ce1a-4725-b70b-8d4afa328bbe'
);

-- ---------------------------------------------------------------------------
-- Offense types — full Blue Book v3.6 catalog loaded by migration
-- 20260621000001_blue_book_offense_catalog.sql
-- Demo reports below reference catalog offenses by stable UUID.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Reports + audit logs
-- ---------------------------------------------------------------------------
DELETE FROM public.approval_log
WHERE report_id IN (
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000005'
);

DELETE FROM public.demerit_reports
WHERE id IN (
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000005'
);

ALTER TABLE public.demerit_reports DISABLE TRIGGER trg_enforce_demerit_report_category;

INSERT INTO public.demerit_reports (
  id,
  subject_cadet_id,
  submitted_by,
  status,
  current_approver_group_id,
  date_of_offense,
  notes,
  offense_type_id,
  revision_by_group_id,
  is_posted,
  demerits_effective
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'pending_approval',
    'b0000000-0000-0000-0000-000000000002',
    now() - interval '5 day',
    'Cadet 1 had muddy boots during final formation.',
    'ed185f1c-fbc3-51df-a6b4-9ac6a17af619',
    NULL,
    false,
    3
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'pending_approval',
    'b0000000-0000-0000-0000-000000000001',
    now() - interval '4 day',
    'Cadet 2 room was not inspection-ready.',
    '9984e76d-78d4-5ec0-93a9-cc285f9aba3b',
    NULL,
    false,
    3
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'b0c0e9df-1061-4721-b589-75780bc64f9c',
    'completed',
    NULL,
    now() - interval '3 day',
    'Cadet 1 was disrespectful to their Squad Leader.',
    '01162719-202f-5dbb-9eb0-660b77ffc3cf',
    NULL,
    false,
    15
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'needs_revision',
    NULL,
    now() - interval '2 day',
    'Cadet 1 was late for formation.',
    '5920e46a-2383-5d44-806b-466151884f10',
    'b0000000-0000-0000-0000-000000000002',
    false,
    3
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'rejected',
    NULL,
    now() - interval '1 day',
    'Dust on desk, warning issued only.',
    '4f59bb5a-9f4e-5743-9da4-a6987520d2bf',
    NULL,
    false,
    3
  );

INSERT INTO public.approval_log (report_id, actor_id, action, comment, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '5 day'),
  ('d0000000-0000-0000-0000-000000000002', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '4 day'),
  ('d0000000-0000-0000-0000-000000000002', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'approved', 'Forwarding to Commandant.', now() - interval '3 day'),
  ('d0000000-0000-0000-0000-000000000003', 'b0c0e9df-1061-4721-b589-75780bc64f9c', 'submitted', 'Category III report filed by Commandant', now() - interval '3 day'),
  ('d0000000-0000-0000-0000-000000000003', 'b0c0e9df-1061-4721-b589-75780bc64f9c', 'approved', 'Final approval. Demerits applied.', now() - interval '2 day'),
  ('d0000000-0000-0000-0000-000000000004', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '2 day'),
  ('d0000000-0000-0000-0000-000000000004', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'needs_revision', 'Please add more details about the incident.', now() - interval '1 day'),
  ('d0000000-0000-0000-0000-000000000005', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '1 day'),
  ('d0000000-0000-0000-0000-000000000005', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'rejected', 'Warning given, no demerits necessary.', now())
ON CONFLICT DO NOTHING;

ALTER TABLE public.demerit_reports ENABLE TRIGGER trg_enforce_demerit_report_category;

-- ---------------------------------------------------------------------------
-- Day 02: School year terms, classes, sports coaches, oversight fixtures
-- ---------------------------------------------------------------------------
INSERT INTO public.approval_groups (id, group_name, company_id)
VALUES ('b0000000-0000-0000-0000-000000000010', 'Alpha Company TAC', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster)
VALUES
  ('a0000000-0000-0000-0000-000000000010', 'Alpha TAC Officer', 65, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', true),
  ('a0000000-0000-0000-0000-000000000011', 'Faculty Teacher', 50, NULL, NULL, false),
  ('a0000000-0000-0000-0000-000000000012', 'Maintenance Staff', 45, NULL, NULL, false)
ON CONFLICT (id) DO UPDATE SET role_name = EXCLUDED.role_name;

INSERT INTO auth.users (
  id,
  aud,
  email,
  encrypted_password,
  role,
  created_at,
  updated_at,
  email_confirmed_at,
  instance_id,
  last_sign_in_at,
  email_change,
  recovery_token,
  confirmation_token,
  email_change_token_new,
  raw_app_meta_data,
  raw_user_meta_data
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'authenticated',
    'tac@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000001","email":"tac@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'authenticated',
    'teacher1@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000002","email":"teacher1@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'authenticated',
    'teacher2@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000003","email":"teacher2@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'authenticated',
    'faculty@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000004","email":"faculty@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'authenticated',
    'coach1@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000005","email":"coach1@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'authenticated',
    'coach2@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000006","email":"coach2@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000007',
    'authenticated',
    'admin@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000007","email":"admin@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000008',
    'authenticated',
    'maintenance@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000008","email":"maintenance@test.email","email_verified":true,"phone_verified":false}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  created_at,
  updated_at,
  last_sign_in_at
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000001","email":"tac@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000002","email":"teacher1@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000003',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000003","email":"teacher2@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000004","email":"faculty@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000005',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000005","email":"coach1@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'f0000000-0000-0000-0000-000000000006',
    'f0000000-0000-0000-0000-000000000006',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000006","email":"coach2@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000007',
    'f0000000-0000-0000-0000-000000000007',
    'f0000000-0000-0000-0000-000000000007',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000007","email":"admin@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-000000000008',
    'f0000000-0000-0000-0000-000000000008',
    'f0000000-0000-0000-0000-000000000008',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000008","email":"maintenance@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'a0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002', 'Alice', 'Teacher', 'a0000000-0000-0000-0000-000000000011', NULL),
  ('f0000000-0000-0000-0000-000000000003', 'Bob', 'Teacher', 'a0000000-0000-0000-0000-000000000011', NULL),
  ('f0000000-0000-0000-0000-000000000004', 'Carol', 'Faculty', 'a0000000-0000-0000-0000-000000000011', NULL),
  ('f0000000-0000-0000-0000-000000000005', 'Dan', 'Coach', 'a0000000-0000-0000-0000-000000000011', NULL),
  ('f0000000-0000-0000-0000-000000000006', 'Eve', 'Coach', 'a0000000-0000-0000-0000-000000000011', NULL),
  ('f0000000-0000-0000-0000-000000000007', 'System', 'Admin', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000008', 'Mike', 'Maintenance', 'a0000000-0000-0000-0000-000000000012', NULL)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_id = EXCLUDED.company_id;

UPDATE public.profiles SET role_id = 'a0000000-0000-0000-0000-000000000010' WHERE id = 'f0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'a0000000-0000-0000-0000-000000000011' WHERE id IN (
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004',
  'f0000000-0000-0000-0000-000000000005',
  'f0000000-0000-0000-0000-000000000006'
);
UPDATE public.profiles SET role_id = 'a0000000-0000-0000-0000-000000000005', is_site_admin = true WHERE id = 'f0000000-0000-0000-0000-000000000007';
UPDATE public.profiles SET role_id = 'a0000000-0000-0000-0000-000000000012' WHERE id = 'f0000000-0000-0000-0000-000000000008';

SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000003');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000004');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000005');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000006');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000007');
SELECT public.ensure_staff_profile('f0000000-0000-0000-0000-000000000008');

-- Replace remote Day02 migration term/class fixtures (different UUIDs, same school year).
-- Drop pgTAP / ad-hoc test school years outside the local config window (2024–2027).
DELETE FROM public.cadet_class_enrollments
WHERE school_year NOT IN ('2024-2025', '2025-2026', '2026-2027', '2027-2028');
DELETE FROM public.class_sections
WHERE school_year NOT IN ('2024-2025', '2025-2026', '2026-2027', '2027-2028');
DELETE FROM public.academic_terms
WHERE school_year NOT IN ('2024-2025', '2025-2026', '2026-2027', '2027-2028');

DELETE FROM public.cadet_class_enrollments WHERE school_year = '2025-2026';
DELETE FROM public.class_sections WHERE school_year = '2025-2026';
DELETE FROM public.academic_terms WHERE school_year = '2025-2026' AND archived = false;

-- Prior school year (archived) — cadet1 returner history only
INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('e0000000-0000-0000-0000-000000000011', 'Term 1', '2024-08-15', '2024-10-15', '2024-2025', 1, true),
  ('e0000000-0000-0000-0000-000000000012', 'Term 2', '2024-10-16', '2025-01-15', '2024-2025', 2, true),
  ('e0000000-0000-0000-0000-000000000013', 'Term 3', '2025-01-16', '2025-03-15', '2024-2025', 3, true),
  ('e0000000-0000-0000-0000-000000000014', 'Term 4', '2025-03-16', '2025-05-15', '2024-2025', 4, true),
  ('e0000000-0000-0000-0000-000000000015', 'Term 5', '2025-05-16', '2025-06-15', '2024-2025', 5, true)
ON CONFLICT (id) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, archived = true;

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, seminar_period, course_name, archived)
VALUES
  ('c0000000-0000-0000-0000-000000000110', 'f0000000-0000-0000-0000-000000000003', '2024-2025', 2, NULL, 'World History', true)
ON CONFLICT (id) DO UPDATE SET
  teacher_id = EXCLUDED.teacher_id,
  course_name = EXCLUDED.course_name,
  term_number = EXCLUDED.term_number,
  archived = true;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
VALUES
  ('47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'c0000000-0000-0000-0000-000000000110', 'term_2', '2024-2025', 'f0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 5-term school year with Term 2 as the active main term
INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Term 1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2025-2026', 1, false),
  ('e0000000-0000-0000-0000-000000000002', 'Term 2', CURRENT_DATE - 30, CURRENT_DATE + 30, '2025-2026', 2, false),
  ('e0000000-0000-0000-0000-000000000003', 'Term 3', CURRENT_DATE + 31, CURRENT_DATE + 60, '2025-2026', 3, false),
  ('e0000000-0000-0000-0000-000000000004', 'Term 4', CURRENT_DATE + 61, CURRENT_DATE + 90, '2025-2026', 4, false),
  ('e0000000-0000-0000-0000-000000000005', 'Term 5', CURRENT_DATE + 91, CURRENT_DATE + 120, '2025-2026', 5, false)
ON CONFLICT (id) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

-- Upcoming school year (future terms, not yet active)
INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('e0000000-0000-0000-0000-000000000021', 'Term 1', CURRENT_DATE + 121, CURRENT_DATE + 150, '2026-2027', 1, false),
  ('e0000000-0000-0000-0000-000000000022', 'Term 2', CURRENT_DATE + 151, CURRENT_DATE + 180, '2026-2027', 2, false),
  ('e0000000-0000-0000-0000-000000000023', 'Term 3', CURRENT_DATE + 181, CURRENT_DATE + 210, '2026-2027', 3, false),
  ('e0000000-0000-0000-0000-000000000024', 'Term 4', CURRENT_DATE + 211, CURRENT_DATE + 240, '2026-2027', 4, false),
  ('e0000000-0000-0000-0000-000000000025', 'Term 5', CURRENT_DATE + 241, CURRENT_DATE + 270, '2026-2027', 5, false)
ON CONFLICT (id) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

-- Main-term classes + seminar (seminar_a is active before Term 3 midpoint)
INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, seminar_period, course_name)
VALUES
  ('c0000000-0000-0000-0000-000000000100', 'f0000000-0000-0000-0000-000000000002', '2025-2026', 2, NULL, 'Algebra II'),
  ('c0000000-0000-0000-0000-000000000101', 'f0000000-0000-0000-0000-000000000003', '2025-2026', 2, NULL, 'US History'),
  ('c0000000-0000-0000-0000-000000000102', 'f0000000-0000-0000-0000-000000000003', '2025-2026', NULL, 'a', 'Leadership Seminar'),
  ('c0000000-0000-0000-0000-000000000103', 'f0000000-0000-0000-0000-000000000002', '2025-2026', 1, NULL, 'Geometry')
ON CONFLICT (id) DO UPDATE SET
  teacher_id = EXCLUDED.teacher_id,
  course_name = EXCLUDED.course_name,
  term_number = EXCLUDED.term_number,
  seminar_period = EXCLUDED.seminar_period,
  archived = false;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
VALUES
  ('47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'c0000000-0000-0000-0000-000000000100', 'term_2', '2025-2026', 'f0000000-0000-0000-0000-000000000002'),
  ('47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'c0000000-0000-0000-0000-000000000102', 'seminar_a', '2025-2026', 'f0000000-0000-0000-0000-000000000003'),
  ('fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'c0000000-0000-0000-0000-000000000101', 'term_2', '2025-2026', 'f0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Spring coaches (June = Spring season for in-season coach Big-3)
INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'f0000000-0000-0000-0000-000000000005'::uuid, 'Head Coach'
FROM public.sports s
WHERE s.name = 'Varsity Lacrosse' AND s.season = 'Spring'
ON CONFLICT (sport_id, coach_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'f0000000-0000-0000-0000-000000000006'::uuid, 'Head Coach'
FROM public.sports s
WHERE s.name = 'Track & Field' AND s.season = 'Spring'
ON CONFLICT (sport_id, coach_id) DO UPDATE SET role = EXCLUDED.role;

SELECT public.sync_cadet_oversight('47bd1324-e8ea-4a4b-8d27-9c1592d71770', NULL);
SELECT public.sync_cadet_oversight('fa677a4b-ce1a-4725-b70b-8d4afa328bbe', NULL);

-- ---------------------------------------------------------------------------
-- Incident reports + in-app notifications (via trg_notify_on_incident_* triggers)
-- Login as tac@test.email to see pending review alerts; teacher1@test.email /
-- faculty@test.email / teacher2@test.email to see actioned outcomes.
-- ---------------------------------------------------------------------------
DELETE FROM public.user_notifications
WHERE event_type IN ('incident.pending_review', 'incident.actioned')
  AND (
    idempotency_key LIKE 'incident.%:f1000000-0000-0000-0000-00000000000%'
    OR metadata->>'incident_id' IN (
      'f1000000-0000-0000-0000-000000000001',
      'f1000000-0000-0000-0000-000000000002',
      'f1000000-0000-0000-0000-000000000003',
      'f1000000-0000-0000-0000-000000000004',
      'f1000000-0000-0000-0000-000000000005',
      'f1000000-0000-0000-0000-000000000006'
    )
  );

DELETE FROM public.incident_reports
WHERE id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f1000000-0000-0000-0000-000000000002',
  'f1000000-0000-0000-0000-000000000003',
  'f1000000-0000-0000-0000-000000000004',
  'f1000000-0000-0000-0000-000000000005',
  'f1000000-0000-0000-0000-000000000006'
);

INSERT INTO public.user_preferences (user_id, in_app_new_report, in_app_status_change)
SELECT id, 'immediate'::public.notification_frequency, 'immediate'::public.notification_frequency
FROM public.profiles
WHERE id IN (
  'b0c0e9df-1061-4721-b589-75780bc64f9c',
  'f0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004'
)
ON CONFLICT (user_id) DO UPDATE
SET in_app_new_report = EXCLUDED.in_app_new_report,
    in_app_status_change = EXCLUDED.in_app_status_change;

INSERT INTO public.incident_reports (
  id,
  reporter_id,
  subject_cadet_id,
  description,
  location,
  incident_time,
  action_taken,
  status,
  created_at
)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000002',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet Private1 was disruptive during Algebra II — talking over instruction and refusing to take a seat after two warnings.',
    'Room 112',
    now() - interval '2 day',
    'Removed cadet to hallway; notified squad leader.',
    'pending',
    now() - interval '2 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000004',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet Private2 used a phone during study hall after being told to put it away.',
    'Study Hall B',
    now() - interval '1 day',
    'Phone confiscated for the period.',
    'pending',
    now() - interval '1 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000002',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet Private1 arrived to formation without cover and argued with the inspecting officer.',
    'Parade Field',
    now() - interval '5 day',
    'Sent back to barracks to retrieve cover.',
    'pending',
    now() - interval '5 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000003',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet Private2 was disrespectful to a classmate during US History group work.',
    'Room 204',
    now() - interval '4 day',
    'Separated students and documented statements.',
    'pending',
    now() - interval '4 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet Private2 left formation early without permission during company drill.',
    'Parade Field — south end',
    now() - interval '6 hours',
    'Returned cadet to formation; documented with platoon sergeant.',
    'pending',
    now() - interval '6 hours'
  ),
  (
    'f1000000-0000-0000-0000-000000000006',
    'f0000000-0000-0000-0000-000000000004',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet Private1 ate food in the academic building hallway in violation of mess hall policy.',
    'Academic Building — first floor',
    now() - interval '8 day',
    'Confiscated food; cadet cleaned the area.',
    'pending',
    now() - interval '8 day'
  );

UPDATE public.incident_reports
SET
  status = 'handled',
  resolved_at = now() - interval '3 day',
  resolved_by = 'f0000000-0000-0000-0000-000000000001',
  handled_by_id = 'f0000000-0000-0000-0000-000000000001',
  resolution_notes = 'Spoke with cadet and parent; cadet apologized to inspecting officer.',
  event_id = NULL
WHERE id = 'f1000000-0000-0000-0000-000000000003';

UPDATE public.incident_reports
SET
  status = 'converted',
  resolved_at = now() - interval '2 day',
  resolved_by = 'f0000000-0000-0000-0000-000000000001',
  resolution_notes = 'Converted to demerit report for disrespect.',
  event_id = NULL
WHERE id = 'f1000000-0000-0000-0000-000000000004';

UPDATE public.incident_reports
SET
  status = 'handled',
  resolved_at = now() - interval '7 day',
  resolved_by = 'f0000000-0000-0000-0000-000000000001',
  handled_by_id = 'f0000000-0000-0000-0000-000000000002',
  resolution_notes = 'Cadet mopped hallway; verbal warning logged with TAC.',
  event_id = NULL,
  flagged_for_review = false
WHERE id = 'f1000000-0000-0000-0000-000000000006';

UPDATE public.incident_reports
SET
  event_id = NULL,
  flagged_for_review = true
WHERE id = 'f1000000-0000-0000-0000-000000000002';

-- ---------------------------------------------------------------------------
-- Day 08 work order fixtures (TAC queue + history samples)
-- Login as tac@test.email / admin@test.email for queue; cadet1@test.email for My Requests.
-- ---------------------------------------------------------------------------
DELETE FROM public.work_order_audit_log
WHERE work_order_id IN (
  'f2000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f2000000-0000-0000-0000-000000000003',
  'f2000000-0000-0000-0000-000000000004',
  'f2000000-0000-0000-0000-000000000005'
);

DELETE FROM public.work_orders
WHERE id IN (
  'f2000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f2000000-0000-0000-0000-000000000003',
  'f2000000-0000-0000-0000-000000000004',
  'f2000000-0000-0000-0000-000000000005'
);

INSERT INTO public.work_orders (
  id,
  requester_id,
  company_id,
  barracks_room_id,
  location,
  issue_type,
  issue_presets,
  description,
  priority,
  status,
  created_at
)
VALUES
  (
    'f2000000-0000-0000-0000-000000000001',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    NULL,
    'barracks',
    ARRAY['Broken lock', 'Lighting fixture'],
    'Deadbolt sticks and the overhead light flickers after taps.',
    'high',
    'submitted',
    now() - interval '2 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A110' LIMIT 1),
    NULL,
    'barracks',
    ARRAY['HVAC / temperature'],
    'Room runs hot even with the vent fully open.',
    'normal',
    'tac_review',
    now() - interval '1 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    NULL,
    'barracks',
    ARRAY['Plumbing leak'],
    'Slow drip under the sink; towel needed to keep floor dry.',
    'normal',
    'forwarded',
    now() - interval '5 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    NULL,
    NULL,
    'Main gymnasium — east bleachers',
    'other',
    '{}',
    'Loose handrail on the east bleacher section.',
    'urgent',
    'forwarded',
    now() - interval '3 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A110' LIMIT 1),
    NULL,
    'barracks',
    ARRAY['Window damage'],
    'Cracked window pane replaced last month — closed out.',
    'low',
    'completed',
    now() - interval '10 day'
  );

INSERT INTO public.work_order_audit_log (
  work_order_id,
  actor_id,
  action,
  old_status,
  new_status,
  comment,
  created_at
)
VALUES
  (
    'f2000000-0000-0000-0000-000000000001',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'submitted',
    NULL,
    'submitted',
    'Work order submitted for barracks room TAC review',
    now() - interval '2 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'submitted',
    NULL,
    'submitted',
    'Work order submitted for barracks room TAC review',
    now() - interval '1 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'start_review',
    'submitted',
    'tac_review',
    NULL,
    now() - interval '20 hours'
  ),
  (
    'f2000000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'submitted',
    NULL,
    'submitted',
    'Work order submitted for barracks room TAC review',
    now() - interval '5 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000001',
    'forward',
    'tac_review',
    'forwarded',
    'Forwarded to maintenance.',
    now() - interval '4 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    'submitted_to_maintenance',
    NULL,
    'forwarded',
    'Work order submitted directly to maintenance',
    now() - interval '3 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'submitted',
    NULL,
    'submitted',
    'Work order submitted for barracks room TAC review',
    now() - interval '10 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000001',
    'forward',
    'submitted',
    'forwarded',
    NULL,
    now() - interval '9 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000001',
    'complete',
    'forwarded',
    'completed',
    'Window repair verified.',
    now() - interval '7 day'
  );

-- GoTrue requires non-null token columns on every auth.users row (password login breaks otherwise).
UPDATE auth.users
SET
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- ---------------------------------------------------------------------------
-- Day 10 events + special reports (via trg_notify_on_* triggers)
-- Login as cadet1@test.email / cadet2@test.email for My Special Reports;
-- tac@test.email / commandant@test.email for review queues and notifications.
-- Re-runnable standalone script: supabase/scripts/seed-events-special-reports.sql
-- ---------------------------------------------------------------------------
DELETE FROM public.user_notifications
WHERE event_type IN (
    'special_report.action_required',
    'special_report.reviewed',
    'event.action_required',
    'event.status_changed'
  )
  AND (
    idempotency_key LIKE 'special_report.%:f3010000-0000-0000-0000-00000000000%'
    OR idempotency_key LIKE 'event.%:f3000000-0000-0000-0000-00000000000%'
    OR metadata->>'special_report_id' IN (
      'f3010000-0000-0000-0000-000000000001',
      'f3010000-0000-0000-0000-000000000002',
      'f3010000-0000-0000-0000-000000000003',
      'f3010000-0000-0000-0000-000000000004',
      'f3010000-0000-0000-0000-000000000005',
      'f3010000-0000-0000-0000-000000000006',
      'f3010000-0000-0000-0000-000000000007',
      'f3010000-0000-0000-0000-000000000008'
    )
    OR metadata->>'event_id' IN (
      'f3000000-0000-0000-0000-000000000001',
      'f3000000-0000-0000-0000-000000000002',
      'f3000000-0000-0000-0000-000000000003',
      'f3000000-0000-0000-0000-000000000004'
    )
  );

DELETE FROM public.special_report_audit_log
WHERE special_report_id IN (
  'f3010000-0000-0000-0000-000000000001',
  'f3010000-0000-0000-0000-000000000002',
  'f3010000-0000-0000-0000-000000000003',
  'f3010000-0000-0000-0000-000000000004',
  'f3010000-0000-0000-0000-000000000005',
  'f3010000-0000-0000-0000-000000000006',
  'f3010000-0000-0000-0000-000000000007',
  'f3010000-0000-0000-0000-000000000008'
);

DELETE FROM public.special_reports
WHERE id IN (
  'f3010000-0000-0000-0000-000000000001',
  'f3010000-0000-0000-0000-000000000002',
  'f3010000-0000-0000-0000-000000000003',
  'f3010000-0000-0000-0000-000000000004',
  'f3010000-0000-0000-0000-000000000005',
  'f3010000-0000-0000-0000-000000000006',
  'f3010000-0000-0000-0000-000000000007',
  'f3010000-0000-0000-0000-000000000008'
);

UPDATE public.incident_reports
SET event_id = NULL
WHERE event_id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000004'
);

DELETE FROM public.events
WHERE id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000004'
);

INSERT INTO public.user_preferences (user_id, in_app_new_report, in_app_status_change)
SELECT id, 'immediate'::public.notification_frequency, 'immediate'::public.notification_frequency
FROM public.profiles
WHERE id IN (
  'b0c0e9df-1061-4721-b589-75780bc64f9c',
  'f0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (user_id) DO UPDATE
SET in_app_new_report = EXCLUDED.in_app_new_report,
    in_app_status_change = EXCLUDED.in_app_status_change;

INSERT INTO public.events (
  id,
  title,
  summary,
  status,
  school_year,
  created_by,
  created_at,
  updated_at,
  closed_at,
  closed_by
)
VALUES
  (
    'f3000000-0000-0000-0000-000000000001',
    'Barracks Third Deck altercation',
    'Multiple cadet affidavits and faculty incident reports grouped for Alpha Company command review.',
    'under_review',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '3 day',
    now() - interval '1 day',
    NULL,
    NULL
  ),
  (
    'f3000000-0000-0000-0000-000000000002',
    'Parade field cover dispute follow-up',
    'Follow-up event linking cadet affidavit to the handled parade-field incident.',
    'open',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '4 day',
    now() - interval '4 day',
    NULL,
    NULL
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'Study hall phone policy — February',
    'Closed event after incident was converted to a demerit report; affidavit retained for record.',
    'closed',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '14 day',
    now() - interval '2 day',
    now() - interval '2 day',
    'f0000000-0000-0000-0000-000000000001'
  ),
  (
    'f3000000-0000-0000-0000-000000000004',
    'Mess hall conduct concern',
    'TAC-created event awaiting linked filings after cadet tip.',
    'open',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '6 hours',
    now() - interval '6 hours',
    NULL,
    NULL
  );

INSERT INTO public.special_reports (
  id,
  submitter_cadet_id,
  subject_cadet_id,
  narrative,
  location,
  occurred_at,
  involvement_type,
  status,
  event_id,
  school_year,
  created_at,
  updated_at
)
VALUES
  (
    'f3010000-0000-0000-0000-000000000001',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'I was walking to the latrine on Third Deck when I heard shouting from A105. Cadet Private2 pushed Cadet Private1 against the bunk frame after an argument about lights-out. I did not intervene but stayed within earshot until the squad leader arrived.',
    'Barracks A — Third Deck hallway',
    now() - interval '3 day 30 minutes',
    'witness',
    'submitted',
    'f3000000-0000-0000-0000-000000000001',
    '2025-2026',
    now() - interval '3 day',
    now() - interval '3 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Private1 kept the overhead light on after taps while I was trying to sleep. I asked him twice to turn it off and he refused. I admit I raised my voice and stepped toward his bunk, but I did not intend to fight.',
    'Barracks A — Room A105',
    now() - interval '3 day 45 minutes',
    'participant',
    'reviewed',
    'f3000000-0000-0000-0000-000000000001',
    '2025-2026',
    now() - interval '2 day 20 hours',
    now() - interval '1 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'During morning formation I realized my cover was still in my room. I asked to be dismissed to retrieve it and the inspecting officer told me to fall out immediately. I spoke back because I felt the instruction was unclear, which I now understand was disrespectful.',
    'Parade Field — Alpha Company formation',
    now() - interval '5 day 15 minutes',
    'participant',
    'submitted',
    'f3000000-0000-0000-0000-000000000002',
    '2025-2026',
    now() - interval '4 day',
    now() - interval '4 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000004',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'I used my phone during study hall to check a message from my parent. The proctor asked me to put it away and I did, but I was frustrated and made a comment under my breath. I understand why the incident report was filed.',
    'Study Hall B',
    now() - interval '4 day',
    'participant',
    'reviewed',
    'f3000000-0000-0000-0000-000000000003',
    '2025-2026',
    now() - interval '4 day',
    now() - interval '2 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    NULL,
    'At dinner I saw two upperclassmen pressuring a new cadet to eat faster and make fun of how he cut his food. I did not know their names but they wore Bravo Company pins. I am submitting this in case leadership wants to follow up.',
    'Cadet Mess — main serving line',
    now() - interval '8 hours',
    'witness',
    'submitted',
    NULL,
    '2025-2026',
    now() - interval '7 hours',
    now() - interval '7 hours'
  ),
  (
    'f3010000-0000-0000-0000-000000000006',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'I heard cadets running in the barracks hallway after taps. By the time I looked out, they had gone back into their rooms. No names, but it was on Second Deck near the stairwell.',
    'Barracks A — Second Deck',
    now() - interval '10 day',
    'witness',
    'reviewed',
    NULL,
    '2025-2026',
    now() - interval '10 day',
    now() - interval '8 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000007',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    NULL,
    'Submitted a report about a loud argument in the dayroom that turned out to be a misunderstanding between friends. No discipline action needed.',
    'Barracks A — Dayroom',
    now() - interval '12 day',
    'witness',
    'closed',
    NULL,
    '2025-2026',
    now() - interval '12 day',
    now() - interval '11 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000008',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'During PT I slipped on a wet patch near the track and scraped my knee. I want it on record in case the cut gets worse, though I did not see anyone cause it.',
    'Track — east straightaway',
    now() - interval '18 hours',
    'participant',
    'submitted',
    NULL,
    '2025-2026',
    now() - interval '17 hours',
    now() - interval '17 hours'
  );

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '1 day',
  review_notes = 'Interview scheduled with both roommates; statements consistent with hallway witness account.'
WHERE id = 'f3010000-0000-0000-0000-000000000002';

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '2 day',
  review_notes = 'Reviewed; incident converted to demerit report. No further action on affidavit.'
WHERE id = 'f3010000-0000-0000-0000-000000000004';

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '8 day',
  review_notes = 'Reviewed; no further action required beyond verbal reminder about hallway noise.',
  flagged_for_review = false
WHERE id = 'f3010000-0000-0000-0000-000000000006';

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '11 day',
  review_notes = 'Closed — misunderstanding confirmed with both cadets present.',
  flagged_for_review = false
WHERE id = 'f3010000-0000-0000-0000-000000000007';

UPDATE public.special_reports
SET flagged_for_review = true
WHERE id = 'f3010000-0000-0000-0000-000000000005';

-- Incidents stay unfiled for inbox / resolved archive; only special reports link to events.

INSERT INTO public.special_report_audit_log (
  special_report_id,
  actor_id,
  action,
  details,
  created_at
)
VALUES
  (
    'f3010000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'status_change',
    '{"from":"submitted","to":"reviewed","notes":"Interview scheduled with both roommates; statements consistent with hallway witness account."}'::jsonb,
    now() - interval '1 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    'status_change',
    '{"from":"submitted","to":"reviewed","notes":"Reviewed; incident converted to demerit report. No further action on affidavit."}'::jsonb,
    now() - interval '2 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000006',
    'f0000000-0000-0000-0000-000000000001',
    'marked_reviewed',
    '{"notes":"Reviewed; no further action required beyond verbal reminder about hallway noise."}'::jsonb,
    now() - interval '8 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000007',
    'f0000000-0000-0000-0000-000000000001',
    'closed',
    '{"notes":"Closed — misunderstanding confirmed with both cadets present."}'::jsonb,
    now() - interval '11 day'
  );

-- Returner archive interval: cadet1 withdrew mid 2024-2025 Term 3, reactivated before 2025-2026
INSERT INTO public.cadet_archive_intervals (cadet_id, started_at, ended_at, reason, departure_classification)
VALUES (
  '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
  '2025-01-20 12:00:00+00',
  '2025-08-15 12:00:00+00',
  'archived',
  'withdrawn'
);

-- ---------------------------------------------------------------------------
-- Day 11: Parent portal seed users (password123 for all)
-- Login as parent1@test.email or parent2@test.email → /parent
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (
  id,
  role_name,
  default_role_level,
  company_id,
  can_manage_own_company_roster,
  can_manage_all_rosters
)
VALUES (
  'e7110000-0000-0000-0000-000000000001',
  'Parent',
  15,
  NULL,
  false,
  false
)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level;

INSERT INTO auth.users (
  id,
  aud,
  email,
  encrypted_password,
  role,
  created_at,
  updated_at,
  email_confirmed_at,
  instance_id,
  last_sign_in_at,
  email_change,
  recovery_token,
  confirmation_token,
  email_change_token_new,
  raw_app_meta_data,
  raw_user_meta_data
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000009',
    'authenticated',
    'parent1@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-000000000009","email":"parent1@test.email","email_verified":true,"phone_verified":false,"first_name":"Patricia","last_name":"Private1"}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-00000000000a',
    'authenticated',
    'parent2@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq',
    'authenticated',
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f0000000-0000-0000-0000-00000000000a","email":"parent2@test.email","email_verified":true,"phone_verified":false,"first_name":"Paul","last_name":"Private2"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  created_at,
  updated_at,
  last_sign_in_at
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000009',
    'f0000000-0000-0000-0000-000000000009',
    'f0000000-0000-0000-0000-000000000009',
    'email',
    '{"sub":"f0000000-0000-0000-0000-000000000009","email":"parent1@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  ),
  (
    'f0000000-0000-0000-0000-00000000000a',
    'f0000000-0000-0000-0000-00000000000a',
    'f0000000-0000-0000-0000-00000000000a',
    'email',
    '{"sub":"f0000000-0000-0000-0000-00000000000a","email":"parent2@test.email","email_verified":true,"phone_verified":false}'::jsonb,
    now(),
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('f0000000-0000-0000-0000-000000000009', 'Patricia', 'Private1', 'e7110000-0000-0000-0000-000000000001', NULL),
  ('f0000000-0000-0000-0000-00000000000a', 'Paul', 'Private2', 'e7110000-0000-0000-0000-000000000001', NULL)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id,
  company_id = NULL;

DELETE FROM public.staff_profiles
WHERE profile_id IN (
  'f0000000-0000-0000-0000-000000000009',
  'f0000000-0000-0000-0000-00000000000a'
);
DELETE FROM public.cadet_profiles
WHERE profile_id IN (
  'f0000000-0000-0000-0000-000000000009',
  'f0000000-0000-0000-0000-00000000000a'
);

UPDATE public.cadet_profiles
SET
  parent_name = 'Patricia Private1',
  parent_email = 'parent1@test.email',
  parent_phone = '(555) 101-2001'
WHERE profile_id = '47bd1324-e8ea-4a4b-8d27-9c1592d71770';

UPDATE public.cadet_profiles
SET
  parent_name = 'Paul Private2',
  parent_email = 'parent2@test.email',
  parent_phone = '(555) 101-2002'
WHERE profile_id = 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe';

INSERT INTO public.cadet_parent_links (
  cadet_profile_id,
  parent_profile_id,
  status,
  created_by_id
)
VALUES
  (
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'f0000000-0000-0000-0000-000000000009',
    'active',
    'f0000000-0000-0000-0000-000000000001'
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'f0000000-0000-0000-0000-00000000000a',
    'active',
    'f0000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (cadet_profile_id, parent_profile_id) DO UPDATE SET
  status = 'active';

INSERT INTO public.user_legal_acceptances (user_id, doc_key, version, accepted_at)
VALUES
  ('f0000000-0000-0000-0000-000000000009', 'terms_of_service', '2026-06-01', now()),
  ('f0000000-0000-0000-0000-000000000009', 'privacy_policy', '2026-06-01', now()),
  ('f0000000-0000-0000-0000-000000000009', 'parent_portal_agreement', '2026-06-01', now()),
  ('f0000000-0000-0000-0000-00000000000a', 'terms_of_service', '2026-06-01', now()),
  ('f0000000-0000-0000-0000-00000000000a', 'privacy_policy', '2026-06-01', now()),
  ('f0000000-0000-0000-0000-00000000000a', 'parent_portal_agreement', '2026-06-01', now())
ON CONFLICT (user_id, doc_key, version) DO NOTHING;

INSERT INTO public.parent_travel_requests (
  id,
  cadet_id,
  parent_profile_id,
  trip_type,
  departure_at,
  return_at,
  destination,
  notes,
  status
)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
  'f0000000-0000-0000-0000-000000000009',
  'weekend',
  now() + interval '14 days',
  now() + interval '16 days',
  'Richmond, VA',
  'Family visit — seed fixture',
  'submitted'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  destination = EXCLUDED.destination;

-- Demo environment flags (no real outbound email — dev mode on, no forward address)
INSERT INTO public.system_settings (key, value)
VALUES
  ('is_demo_environment', true),
  ('email_development_mode', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

UPDATE public.system_settings
SET description = NULL, value = false
WHERE key = 'email_development_forward_to';

COMMIT;
