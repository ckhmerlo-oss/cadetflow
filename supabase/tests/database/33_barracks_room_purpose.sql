BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(4);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name) VALUES
  ('d5010000-0000-0000-0000-000000000001', 'Purpose Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('d5020000-0000-0000-0000-000000000001', 'Purpose Alpha TAC', 65, 'd5010000-0000-0000-0000-000000000001', true, false),
  ('d5020000-0000-0000-0000-000000000003', 'Purpose Alpha Cadet', 15, 'd5010000-0000-0000-0000-000000000001', false, false)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d5030000-0000-0000-0000-000000000001', 'purpose-alpha-tac@test.com'),
  ('d5030000-0000-0000-0000-000000000003', 'purpose-alpha-cadet@test.com')
ON CONFLICT (id) DO NOTHING;

UPDATE auth.users
SET
  aud = coalesce(aud, 'authenticated'),
  role = coalesce(role, 'authenticated'),
  encrypted_password = coalesce(encrypted_password, '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq'),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  instance_id = coalesce(instance_id, '00000000-0000-0000-0000-000000000000'::uuid),
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
WHERE id IN (
  'd5030000-0000-0000-0000-000000000001',
  'd5030000-0000-0000-0000-000000000003'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('d5030000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd5020000-0000-0000-0000-000000000001', 'd5010000-0000-0000-0000-000000000001', false),
  ('d5030000-0000-0000-0000-000000000003', 'Alex', 'Cadet', 'd5020000-0000-0000-0000-000000000003', 'd5010000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id, archived = EXCLUDED.archived;

UPDATE public.profiles SET role_id = 'd5020000-0000-0000-0000-000000000001', company_id = 'd5010000-0000-0000-0000-000000000001'
WHERE id = 'd5030000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'd5020000-0000-0000-0000-000000000003', company_id = 'd5010000-0000-0000-0000-000000000001'
WHERE id = 'd5030000-0000-0000-0000-000000000003';

DELETE FROM public.cadet_profiles WHERE profile_id = 'd5030000-0000-0000-0000-000000000001';
SELECT public.ensure_cadet_profile('d5030000-0000-0000-0000-000000000003');
SELECT public.ensure_staff_profile('d5030000-0000-0000-0000-000000000001');

UPDATE public.barracks_rooms
SET company_id = 'd5010000-0000-0000-0000-000000000001',
    room_purpose = null,
    occupant_top_bunk_id = null,
    occupant_bottom_bunk_id = null
WHERE company_letter = 'A';

SELECT public.mock_auth('d5030000-0000-0000-0000-000000000001');

SELECT public.assign_barracks_bunk(
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  'top',
  'd5030000-0000-0000-0000-000000000003'
);

SELECT public.set_barracks_room_purpose(
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  'supply'
);

SELECT is(
  (SELECT room_purpose FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  'supply',
  'set_barracks_room_purpose stores purpose'
);

SELECT is(
  (SELECT occupant_top_bunk_id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  NULL::uuid,
  'set_barracks_room_purpose clears occupants'
);

SELECT is(
  (SELECT room_number FROM public.cadet_profiles WHERE profile_id = 'd5030000-0000-0000-0000-000000000003'),
  NULL,
  'set_barracks_room_purpose clears cadet room_number'
);

SELECT throws_like(
  $$SELECT public.assign_barracks_bunk(
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    'top',
    'd5030000-0000-0000-0000-000000000003'
  )$$,
  '%cannot accept cadets%',
  'assign_barracks_bunk blocked on purpose room'
);

SELECT * FROM finish();
ROLLBACK;
