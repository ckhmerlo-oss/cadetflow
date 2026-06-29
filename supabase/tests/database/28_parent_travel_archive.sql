BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(3);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name) VALUES
  ('e5110000-0000-0000-0000-000000000001', 'Travel Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('e5120000-0000-0000-0000-000000000002', 'Travel Cadet', 10, 'e5110000-0000-0000-0000-000000000001', false, false),
  ('e7110000-0000-0000-0000-000000000001', 'Parent', 15, null, false, false)
ON CONFLICT (id) DO UPDATE SET role_name = EXCLUDED.role_name;

INSERT INTO auth.users (id, email) VALUES
  ('e5130000-0000-0000-0000-000000000001', 'travel-parent@test.com'),
  ('e5130000-0000-0000-0000-000000000002', 'travel-cadet@test.com')
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
  'e5130000-0000-0000-0000-000000000001',
  'e5130000-0000-0000-0000-000000000002'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('e5130000-0000-0000-0000-000000000002', 'Cadet', 'Travel', 'e5120000-0000-0000-0000-000000000002', 'e5110000-0000-0000-0000-000000000001', false),
  ('e5130000-0000-0000-0000-000000000001', 'Parent', 'Travel', 'e7110000-0000-0000-0000-000000000001', null, false)
ON CONFLICT (id) DO UPDATE SET archived = EXCLUDED.archived, role_id = EXCLUDED.role_id;

DELETE FROM public.cadet_profiles WHERE profile_id = 'e5130000-0000-0000-0000-000000000002';
SELECT public.ensure_cadet_profile('e5130000-0000-0000-0000-000000000002');

INSERT INTO public.cadet_parent_links (cadet_profile_id, parent_profile_id, status)
VALUES ('e5130000-0000-0000-0000-000000000002', 'e5130000-0000-0000-0000-000000000001', 'active')
ON CONFLICT (cadet_profile_id, parent_profile_id) DO UPDATE SET status = 'active';

SELECT public.mock_auth('e5130000-0000-0000-0000-000000000001');

SELECT lives_ok(
  $$SELECT public.create_parent_travel_request(
    'e5130000-0000-0000-0000-000000000002',
    'weekend',
    now() + interval '1 day',
    now() + interval '2 days',
    'Home',
    'notes'
  )$$,
  'Active cadet travel request allowed'
);

RESET ROLE;
UPDATE public.profiles SET archived = true WHERE id = 'e5130000-0000-0000-0000-000000000002';

SELECT public.mock_auth('e5130000-0000-0000-0000-000000000001');

SELECT throws_ok(
  $$SELECT public.create_parent_travel_request(
    'e5130000-0000-0000-0000-000000000002',
    'weekend',
    now() + interval '1 day',
    now() + interval '2 days',
    'Home',
    null
  )$$,
  'Cadet is archived; travel requests are read-only until reactivation',
  'Archived cadet travel mutation blocked'
);

SELECT ok(
  (SELECT count(*)::int FROM public.parent_travel_requests
   WHERE cadet_id = 'e5130000-0000-0000-0000-000000000002') = 1,
  'Prior travel request retained after archive'
);

SELECT * FROM finish();
ROLLBACK;
