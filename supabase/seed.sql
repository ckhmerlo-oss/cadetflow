-- Local development seed data
-- Seeded login password for all users: password123
-- Users:
--   commandant@test.email
--   platoon@test.email
--   squad@test.email
--   cadet1@test.email
--   cadet2@test.email

BEGIN;

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
    '{"sub":"47bd1324-e8ea-4a4b-8d27-9c1592d71770","email":"cadet1@test.email","email_verified":true,"phone_verified":false}'::jsonb
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'authenticated',
    'cadet2@test.email',
    '$2a$10$3dkRXUxWh4sfGAOg9OqLH.BQN2WiryzH8x5lTKV2OI8QN9bzs4YbS',
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
    'None', 'None', 'None',
    1, false, 2, 10
  ),
  (
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe'::uuid,
    'C/PVT', 'Good Standing', '10', 'None', 'A-106',
    'None', 'None', 'None',
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
-- Offense types
-- ---------------------------------------------------------------------------
INSERT INTO public.offense_types (
  id, offense_group, offense_name, offense_code, demerits, policy_category
)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Uniform', 'Dirty boots', 'U-101', 3, 1),
  ('e0000000-0000-0000-0000-000000000002', 'Barracks', 'Messy room', 'B-201', 5, 1),
  ('e0000000-0000-0000-0000-000000000003', 'Discipline', 'Disrespect to superior', 'D-301', 10, 3),
  ('e0000000-0000-0000-0000-000000000004', 'Punctuality', 'Late for formation', 'P-102', 2, 1),
  ('e0000000-0000-0000-0000-000000000005', 'Barracks', 'Minor room infraction', 'B-101', 1, 1)
ON CONFLICT (id) DO UPDATE
SET offense_group = EXCLUDED.offense_group,
    offense_name = EXCLUDED.offense_name,
    offense_code = EXCLUDED.offense_code,
    demerits = EXCLUDED.demerits,
    policy_category = EXCLUDED.policy_category;

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
    'e0000000-0000-0000-0000-000000000001',
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
    'e0000000-0000-0000-0000-000000000002',
    NULL,
    false,
    5
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
    'completed',
    NULL,
    now() - interval '3 day',
    'Cadet 1 was disrespectful to their Squad Leader.',
    'e0000000-0000-0000-0000-000000000003',
    NULL,
    false,
    10
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'needs_revision',
    NULL,
    now() - interval '2 day',
    'Cadet 1 was late for formation.',
    'e0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    false,
    2
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'da77b296-ad3e-489f-94c1-955242db224d',
    'rejected',
    NULL,
    now() - interval '1 day',
    'Dust on desk, warning issued only.',
    'e0000000-0000-0000-0000-000000000005',
    NULL,
    false,
    1
  );

INSERT INTO public.approval_log (report_id, actor_id, action, comment, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '5 day'),
  ('d0000000-0000-0000-0000-000000000002', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '4 day'),
  ('d0000000-0000-0000-0000-000000000002', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'approved', 'Forwarding to Commandant.', now() - interval '3 day'),
  ('d0000000-0000-0000-0000-000000000003', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'submitted', 'Report created', now() - interval '3 day'),
  ('d0000000-0000-0000-0000-000000000003', 'b0c0e9df-1061-4721-b589-75780bc64f9c', 'approved', 'Final approval. Demerits applied.', now() - interval '2 day'),
  ('d0000000-0000-0000-0000-000000000004', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '2 day'),
  ('d0000000-0000-0000-0000-000000000004', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'needs_revision', 'Please add more details about the incident.', now() - interval '1 day'),
  ('d0000000-0000-0000-0000-000000000005', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created', now() - interval '1 day'),
  ('d0000000-0000-0000-0000-000000000005', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'rejected', 'Warning given, no demerits necessary.', now())
ON CONFLICT DO NOTHING;

COMMIT;
