-- Complete Day 02 test accounts on CadetFlow Live (password: password123)
-- Creates tac/faculty/cadet1/cadet2 if missing, enrollments, and oversight sync.

INSERT INTO auth.users (
  id, aud, email, encrypted_password, role,
  created_at, updated_at, email_confirmed_at, instance_id,
  raw_app_meta_data, raw_user_meta_data
)
VALUES
  (
    'd1010000-0000-0000-0000-000000000001', 'authenticated', 'tac@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1010000-0000-0000-0000-000000000001","email":"tac@test.email","email_verified":true}'::jsonb
  ),
  (
    'd1010000-0000-0000-0000-000000000002', 'authenticated', 'faculty@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1010000-0000-0000-0000-000000000002","email":"faculty@test.email","email_verified":true}'::jsonb
  ),
  (
    'd1010000-0000-0000-0000-000000000003', 'authenticated', 'cadet1@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1010000-0000-0000-0000-000000000003","email":"cadet1@test.email","email_verified":true}'::jsonb
  ),
  (
    'd1010000-0000-0000-0000-000000000004', 'authenticated', 'cadet2@test.email',
    '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated',
    now(), now(), now(), '00000000-0000-0000-0000-000000000000',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"d1010000-0000-0000-0000-000000000004","email":"cadet2@test.email","email_verified":true}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
VALUES
  ('d1010000-0000-0000-0000-000000000001', 'd1010000-0000-0000-0000-000000000001', 'd1010000-0000-0000-0000-000000000001', 'email',
   '{"sub":"d1010000-0000-0000-0000-000000000001","email":"tac@test.email","email_verified":true}'::jsonb, now(), now()),
  ('d1010000-0000-0000-0000-000000000002', 'd1010000-0000-0000-0000-000000000002', 'd1010000-0000-0000-0000-000000000002', 'email',
   '{"sub":"d1010000-0000-0000-0000-000000000002","email":"faculty@test.email","email_verified":true}'::jsonb, now(), now()),
  ('d1010000-0000-0000-0000-000000000003', 'd1010000-0000-0000-0000-000000000003', 'd1010000-0000-0000-0000-000000000003', 'email',
   '{"sub":"d1010000-0000-0000-0000-000000000003","email":"cadet1@test.email","email_verified":true}'::jsonb, now(), now()),
  ('d1010000-0000-0000-0000-000000000004', 'd1010000-0000-0000-0000-000000000004', 'd1010000-0000-0000-0000-000000000004', 'email',
   '{"sub":"d1010000-0000-0000-0000-000000000004","email":"cadet2@test.email","email_verified":true}'::jsonb, now(), now())
ON CONFLICT (id) DO UPDATE SET identity_data = EXCLUDED.identity_data, updated_at = EXCLUDED.updated_at;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
SELECT v.id, v.first_name, v.last_name, r.id, c.id
FROM (VALUES
  ('d1010000-0000-0000-0000-000000000001'::uuid, 'Alpha', 'TAC', 'Alpha TAC', 'Alpha Company'),
  ('d1010000-0000-0000-0000-000000000002'::uuid, 'Carol', 'Faculty', 'Faculty', 'Faculty'),
  ('d1010000-0000-0000-0000-000000000003'::uuid, 'Cadet', 'One', 'Cadet', 'Alpha Company'),
  ('d1010000-0000-0000-0000-000000000004'::uuid, 'Cadet', 'Two', 'Cadet', 'Alpha Company')
) AS v(id, first_name, last_name, role_name, company_name)
JOIN public.roles r ON r.role_name = v.role_name
JOIN public.companies c ON c.company_name = v.company_name
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_id = EXCLUDED.company_id;

UPDATE public.profiles p
SET role_id = v.role_id
FROM (VALUES
  ('d1010000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM public.roles WHERE role_name = 'Alpha TAC' LIMIT 1)),
  ('d1010000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM public.roles WHERE role_name = 'Faculty' LIMIT 1)),
  ('d1010000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM public.roles WHERE role_name = 'Cadet' LIMIT 1)),
  ('d1010000-0000-0000-0000-000000000004'::uuid, (SELECT id FROM public.roles WHERE role_name = 'Cadet' LIMIT 1))
) AS v(id, role_id)
WHERE p.id = v.id;

SELECT public.ensure_staff_profile(p.id)
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
WHERE p.id IN (
  'd1010000-0000-0000-0000-000000000001',
  'd1010000-0000-0000-0000-000000000002'
)
AND r.default_role_level >= 50;

SELECT public.ensure_cadet_profile(p.id)
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id
WHERE p.id IN (
  'd1010000-0000-0000-0000-000000000003',
  'd1010000-0000-0000-0000-000000000004'
)
AND r.default_role_level < 50;

UPDATE public.cadet_profiles SET sport_spring = 'Varsity Lacrosse' WHERE profile_id = 'd1010000-0000-0000-0000-000000000003';
UPDATE public.cadet_profiles SET sport_spring = 'Track & Field' WHERE profile_id = 'd1010000-0000-0000-0000-000000000004';

UPDATE public.cadet_class_enrollments
SET archived = true, updated_at = now()
WHERE cadet_id IN ('d1010000-0000-0000-0000-000000000003', 'd1010000-0000-0000-0000-000000000004')
  AND school_year = '2025-2026'
  AND archived = false;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
VALUES
  ('d1010000-0000-0000-0000-000000000003', 'd1040000-0000-0000-0000-000000000001', 'term_2', '2025-2026', 'd1020000-0000-0000-0000-000000000001'),
  ('d1010000-0000-0000-0000-000000000003', 'd1040000-0000-0000-0000-000000000003', 'seminar_a', '2025-2026', 'd1020000-0000-0000-0000-000000000002'),
  ('d1010000-0000-0000-0000-000000000004', 'd1040000-0000-0000-0000-000000000002', 'term_2', '2025-2026', 'd1020000-0000-0000-0000-000000000002');

SELECT public.sync_cadet_oversight('d1010000-0000-0000-0000-000000000003', NULL);
SELECT public.sync_cadet_oversight('d1010000-0000-0000-0000-000000000004', NULL);
