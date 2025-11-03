/*

-- This script will set up a complete mock environment for testing your frontend.
-- All users have the password: password123 (from your manual creation)

/*
This script will create 5 test users based on the UUIDs you provided.
    commandant@test.email (Level 30)
    platoon@test.email (Level 20)
    squad@test.email (Level 10)
    cadet1@test.email (Level 0)
    cadet2@test.email (Level 0)
*/

-- 1. CREATE AUTH USERS
-- *** FIX: Removed the 'confirmed_at' column from the INSERT statement ***
INSERT INTO auth.users (id, email, encrypted_password, role, email_confirmed_at, instance_id, last_sign_in_at)
VALUES
  ('b0c0e9df-1061-4721-b589-75780bc64f9c', 'commandant@test.email', '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq', 'authenticated', now(), '00000000-0000-0000-0000-000000000000', now()),
  ('02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'platoon@test.email', '$2a$10$icOeEyAXp3iwwv.oO6l.e.YR47rJHgmPDljexsAowKhSB7FOXwLfW', 'authenticated', now(), '00000000-0000-0000-0000-000000000000', now()),
  ('da77b296-ad3e-489f-94c1-955242db224d', 'squad@test.email', '$2a$10$tTqd5ljiCg/moC9JyEl0suK1vKMLS9pdhbRZW6hTLC8MFSjdAew8G', 'authenticated', now(), '00000000-0000-0000-0000-000000000000', now()),
  ('47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'cadet1@test.email', '$2a$10$chyFZ354TxGyWe61cj4xuekDSiZazQ1woNvNzU.CIUEzmWrleV4ye', 'authenticated', now(), '00000000-0000-0000-0000-000000000000', now()),
  ('fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'cadet2@test.email', '$2a$10$3dkRXUxWh4sfGAOg9OqLH.BQN2WiryzH8x5lTKV2OI8QN9bzs4YbS', 'authenticated', now(), '00000000-0000-0000-0000-000000000000', now());

-- 2. CREATE AUTH IDENTITIES
-- *** FIX: Using your provided UUIDs and emails ***
INSERT INTO auth.identities (id, user_id, provider_id, "provider", identity_data, last_sign_in_at)
VALUES
  ('b0c0e9df-1061-4721-b589-75780bc64f9c', 'b0c0e9df-1061-4721-b589-75780bc64f9c', 'b0c0e9df-1061-4721-b589-75780bc64f9c', 'email', 
   format('{"sub": "%s", "email": "commandant@test.email"}', 'b0c0e9df-1061-4721-b589-75780bc64f9c')::jsonb, 
   now()),
  ('02c82cc1-f3a6-4327-8c97-acb1ffbaf392', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'email', 
   format('{"sub": "%s", "email": "platoon@test.email"}', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392')::jsonb, 
   now()),
  ('da77b296-ad3e-489f-94c1-955242db224d', 'da77b296-ad3e-489f-94c1-955242db224d', 'da77b296-ad3e-489f-94c1-955242db224d', 'email', 
   format('{"sub": "%s", "email": "squad@test.email"}', 'da77b296-ad3e-489f-94c1-955242db224d')::jsonb, 
   now()),
  ('47bd1324-e8ea-4a4b-8d27-9c1592d71770', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'email', 
   format('{"sub": "%s", "email": "cadet1@test.email"}', '47bd1324-e8ea-4a4b-8d27-9c1592d71770')::jsonb, 
   now()),
  ('fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'email', 
   format('{"sub": "%s", "email": "cadet2@test.email"}', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe')::jsonb, 
   now());

-- 3. CREATE APPROVAL GROUPS (The Chain of Command)
-- These UUIDs are fine to be hard-coded as they don't depend on auth
INSERT INTO public.approval_groups (id, group_name, next_approver_group_id)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Commandant''s Office', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Alpha 1st Platoon', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Alpha 1st Squad', 'b0000000-0000-0000-0000-000000000002');

-- 4. CREATE PROFILES
-- *** FIX: Using your new user UUIDs as the 'id' (primary key) ***
INSERT INTO public.profiles (id, full_name, role, role_level, group_id, total_demerits)
VALUES
  ('b0c0e9df-1061-4721-b589-75780bc64f9c', 'Col. Commandant', 'commandant', 30, 'b0000000-0000-0000-0000-000000000001', 0),
  ('02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'Cadet PLT Leader', 'plt_leader', 20, 'b0000000-0000-0000-0000-000000000002', 0),
  ('da77b296-ad3e-489f-94c1-955242db224d', 'Cadet Squad Leader', 'squad_leader', 10, 'b0000000-0000-0000-0000-000000000003', 0),
  ('47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'Cadet Private 1', 'cadet', 0, 'b0000000-0000-0000-0000-000000000003', 10),
  ('fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'Cadet Private 2', 'cadet', 0, 'b0000000-0000-0000-0000-000000000003', 0);

-- 5. CREATE GROUP MEMBERS
-- *** FIX: Using your new user UUIDs ***
INSERT INTO public.group_members (user_id, group_id)
VALUES
  ('b0c0e9df-1061-4721-b589-75780bc64f9c', 'b0000000-0000-0000-0000-000000000001'),
  ('02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'b0000000-0000-0000-0000-000000000002'),
  ('da77b296-ad3e-489f-94c1-955242db224d', 'b0000000-0000-0000-0000-000000000003');

-- 6. CREATE ACADEMIC TERMS
INSERT INTO public.academic_terms (id, academic_year_start, term_number, start_date, end_date)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 2025, 1, '2025-08-15', '2025-12-20');

-- 7. CREATE DEMERIT REPORTS
-- *** FIX: Using your new user UUIDs for 'subject_cadet_id' and 'submitted_by' ***
INSERT INTO public.demerit_reports (id, title, subject_cadet_id, submitted_by, content, date_of_offense, status, current_approver_group_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Uniform - Dirty boots', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'da77b296-ad3e-489f-94c1-955242db224d',
   '{"category": "Uniform", "notes": "Cadet 1 had muddy boots during final formation.", "demerit_count": 3}',
   '2025-10-25', 'pending_approval', 'b0000000-0000-0000-0000-000000000002'),
   
  ('c0000000-0000-0000-0000-000000000002', 'Barracks - Messy room', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'da77b296-ad3e-489f-94c1-955242db224d',
   '{"category": "Barracks", "notes": "Cadet 2''s room was not inspection-ready.", "demerit_count": 5}',
   '2025-10-26', 'pending_approval', 'b0000000-0000-0000-0000-000000000001'),

  ('c0000000-0000-0000-0000-000000000003', 'Disrespect to Superior', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392',
   '{"category": "Discipline", "notes": "Cadet 1 was disrespectful to their Squad Leader.", "demerit_count": 10}',
   '2025-10-20', 'completed', NULL),

  ('c0000000-0000-0000-0000-000000000004', 'Late for Formation', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'da77b296-ad3e-489f-94c1-955242db224d',
   '{"category": "Punctuality", "notes": "Cadet 1 was late.", "demerit_count": 2}',
   '2025-10-22', 'needs_revision', NULL),
   
  ('c0000000-0000-0000-0000-000000000005', 'Minor Room Infraction', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'da77b296-ad3e-489f-94c1-955242db224d',
   '{"category": "Barracks", "notes": "Dust on desk, but not worth a demerit.", "demerit_count": 1}',
   '2025-10-21', 'rejected', NULL);

-- 8. CREATE APPROVAL LOGS
-- *** FIX: Using your new user UUIDs for 'actor_id' ***
INSERT INTO public.approval_log (report_id, actor_id, action, comment)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created'),
  ('c0000000-0000-0000-0000-000000000002', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created'),
  ('c0000000-0000-0000-0000-000000000002', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'approved', 'Forwarding to Commandant.'),
  ('c0000000-0000-0000-0000-000000000003', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'submitted', 'Report created'),
  ('c0000000-0000-0000-0000-000000000003', 'b0c0e9df-1061-4721-b589-75780bc64f9c', 'approved', 'Final approval. Demerits applied.'),
  ('c0000000-0000-0000-0000-000000000004', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created'),
  ('c0000000-0000-0000-0000-000000000004', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'needs_revision', 'Please add more details about the incident.'),
  ('c0000000-0000-0000-0000-000000000005', 'da77b296-ad3e-489f-94c1-955242db224d', 'submitted', 'Report created'),
  ('c0000000-0000-0000-0000-000000000005', '02c82cc1-f3a6-4327-8c97-acb1ffbaf392', 'rejected', 'Warning given, no demerits necessary.');

*/