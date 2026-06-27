BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(10);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Alpha company id matches barracks_rooms seed (c0000000...)
INSERT INTO public.companies (id, company_name) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('d4020000-0000-0000-0000-000000000001', 'Work Alpha TAC', 65, 'c0000000-0000-0000-0000-000000000001', true, false),
  ('d4020000-0000-0000-0000-000000000003', 'Work Cadet Leader', 15, 'c0000000-0000-0000-0000-000000000001', false, false)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d4030000-0000-0000-0000-000000000001', 'work-alpha-tac@test.com'),
  ('d4030000-0000-0000-0000-000000000003', 'work-cadet-leader@test.com')
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
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003'
);

DELETE FROM public.profiles WHERE id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('d4030000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd4020000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', false),
  ('d4030000-0000-0000-0000-000000000003', 'Alex', 'Leader', 'd4020000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', false);

SELECT public.ensure_cadet_profile('d4030000-0000-0000-0000-000000000003');

DELETE FROM public.barracks_roster_marks WHERE company_letter = 'A';

SELECT ok(
  (SELECT count(*)::int FROM public.barracks_roster_tag_definitions) >= 6,
  'Roster tag definitions seeded'
);

SELECT ok(
  (SELECT count(*)::int FROM public.sports WHERE short_code is not null) >= 10,
  'Sport short codes seeded'
);

-- TAC can apply marks
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');

SELECT is(
  public.apply_barracks_roster_marks(
    'A',
    array['d4030000-0000-0000-0000-000000000003'::uuid],
    array['LV', 'MED'],
    'Weekend leave'
  ),
  2,
  'apply_barracks_roster_marks inserts tags'
);

SELECT is(
  (SELECT count(*)::int FROM public.barracks_roster_marks WHERE company_letter = 'A' AND profile_id = 'd4030000-0000-0000-0000-000000000003'),
  2,
  'Two marks stored for cadet'
);

SELECT is(
  jsonb_array_length(public.list_barracks_roster_marks('A')),
  2,
  'list_barracks_roster_marks returns marks'
);

-- Idempotent re-apply updates note
SELECT public.apply_barracks_roster_marks(
  'A',
  array['d4030000-0000-0000-0000-000000000003'::uuid],
  array['LV'],
  'Updated note'
);

SELECT is(
  (SELECT note FROM public.barracks_roster_marks WHERE profile_id = 'd4030000-0000-0000-0000-000000000003' AND tag_code = 'LV'),
  'Updated note',
  'Re-apply updates note on conflict'
);

-- Remove one tag
SELECT is(
  public.remove_barracks_roster_marks(
    'A',
    array['d4030000-0000-0000-0000-000000000003'::uuid],
    array['MED']
  ),
  1,
  'remove_barracks_roster_marks removes specific tag'
);

SELECT is(
  (SELECT count(*)::int FROM public.barracks_roster_marks WHERE company_letter = 'A' AND profile_id = 'd4030000-0000-0000-0000-000000000003'),
  1,
  'One mark remains after partial remove'
);

-- Clear by tag code
SELECT public.apply_barracks_roster_marks(
  'A',
  array['d4030000-0000-0000-0000-000000000003'::uuid],
  array['LV', 'MED'],
  null
);

SELECT is(
  public.clear_barracks_roster_marks('A', 'LV'),
  1,
  'clear_barracks_roster_marks clears by tag code'
);

-- Cadet cannot apply marks
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');

SELECT throws_ok(
  $$SELECT public.apply_barracks_roster_marks('A', array['d4030000-0000-0000-0000-000000000003'::uuid], array['LV'], null)$$,
  'Permission denied',
  'Cadet cannot apply roster marks'
);

SELECT * FROM finish();
ROLLBACK;
