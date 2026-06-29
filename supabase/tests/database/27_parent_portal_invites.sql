BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(7);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name) VALUES
  ('e5010000-0000-0000-0000-000000000001', 'Portal Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('e5020000-0000-0000-0000-000000000001', 'Portal Alpha TAC', 65, 'e5010000-0000-0000-0000-000000000001', true, false),
  ('e5020000-0000-0000-0000-000000000002', 'Portal Cadet', 10, 'e5010000-0000-0000-0000-000000000001', false, false),
  ('e7110000-0000-0000-0000-000000000001', 'Parent', 15, null, false, false)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level;

INSERT INTO auth.users (id, email) VALUES
  ('e5030000-0000-0000-0000-000000000001', 'portal-tac@test.com'),
  ('e5030000-0000-0000-0000-000000000002', 'portal-cadet@test.com'),
  ('e5030000-0000-0000-0000-000000000003', 'portal-parent@test.com')
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
  'e5030000-0000-0000-0000-000000000001',
  'e5030000-0000-0000-0000-000000000002',
  'e5030000-0000-0000-0000-000000000003'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('e5030000-0000-0000-0000-000000000001', 'TAC', 'Portal', 'e5020000-0000-0000-0000-000000000001', 'e5010000-0000-0000-0000-000000000001', false),
  ('e5030000-0000-0000-0000-000000000002', 'Cadet', 'Portal', 'e5020000-0000-0000-0000-000000000002', 'e5010000-0000-0000-0000-000000000001', false),
  ('e5030000-0000-0000-0000-000000000003', 'Parent', 'Portal', 'e7110000-0000-0000-0000-000000000001', null, false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id, archived = EXCLUDED.archived;

DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'e5030000-0000-0000-0000-000000000001',
  'e5030000-0000-0000-0000-000000000002',
  'e5030000-0000-0000-0000-000000000003'
);
DELETE FROM public.staff_profiles WHERE profile_id IN (
  'e5030000-0000-0000-0000-000000000001',
  'e5030000-0000-0000-0000-000000000002',
  'e5030000-0000-0000-0000-000000000003'
);

UPDATE public.profiles SET role_id = 'e5020000-0000-0000-0000-000000000001', company_id = 'e5010000-0000-0000-0000-000000000001'
WHERE id = 'e5030000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'e5020000-0000-0000-0000-000000000002', company_id = 'e5010000-0000-0000-0000-000000000001'
WHERE id = 'e5030000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'e7110000-0000-0000-0000-000000000001'
WHERE id = 'e5030000-0000-0000-0000-000000000003';

SELECT public.ensure_staff_profile('e5030000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('e5030000-0000-0000-0000-000000000002');

SELECT public.mock_auth('e5030000-0000-0000-0000-000000000001');

SELECT set_config(
  'test.portal_token',
  (SELECT public.create_portal_invite(
    'e5030000-0000-0000-0000-000000000002',
    'portal-parent@test.com',
    14
  ) ->> 'token'),
  false
);

SELECT ok(current_setting('test.portal_token') IS NOT NULL, 'TAC can create portal invite');

SELECT ok(
  (SELECT (public.get_portal_invite_public(current_setting('test.portal_token')) ->> 'purpose')) = 'portal',
  'Public portal invite payload includes purpose'
);

SELECT public.mock_auth('e5030000-0000-0000-0000-000000000003');

SELECT lives_ok(
  $$SELECT public.redeem_parent_invite(current_setting('test.portal_token'))$$,
  'Parent can redeem portal invite'
);

SELECT ok(
  (SELECT (public.redeem_parent_invite(current_setting('test.portal_token')) ->> 'purpose')) = 'portal',
  'Redeem returns portal purpose'
);

SELECT ok(
  (SELECT count(*)::int FROM public.cadet_parent_links
   WHERE cadet_profile_id = 'e5030000-0000-0000-0000-000000000002'
     AND parent_profile_id = 'e5030000-0000-0000-0000-000000000003') = 1,
  'Portal redeem creates cadet-parent link'
);

-- Archived cadet blocked
RESET ROLE;
UPDATE public.profiles SET archived = true WHERE id = 'e5030000-0000-0000-0000-000000000002';

SELECT public.mock_auth('e5030000-0000-0000-0000-000000000001');

SELECT throws_ok(
  $$SELECT public.create_portal_invite('e5030000-0000-0000-0000-000000000002', 'other@test.com', 14)$$,
  'Cadet not found or archived',
  'Cannot create portal invite for archived cadet'
);

RESET ROLE;
UPDATE public.profiles SET archived = false WHERE id = 'e5030000-0000-0000-0000-000000000002';

SELECT public.mock_auth('e5030000-0000-0000-0000-000000000001');

SELECT set_config(
  'test.expired_token',
  (SELECT public.create_portal_invite('e5030000-0000-0000-0000-000000000002', 'portal-parent@test.com', 1) ->> 'token'),
  false
);

RESET ROLE;
UPDATE public.parent_invites
SET expires_at = now() - interval '1 day'
WHERE recipient_email = 'portal-parent@test.com'
  AND purpose = 'portal';

SELECT public.mock_auth('e5030000-0000-0000-0000-000000000003');

SELECT throws_ok(
  $$SELECT public.redeem_parent_invite(current_setting('test.expired_token'))$$,
  'Invite expired',
  'Expired portal token rejected'
);

SELECT * FROM finish();
ROLLBACK;
