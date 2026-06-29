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
  ('e5210000-0000-0000-0000-000000000001', 'History Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('e5220000-0000-0000-0000-000000000002', 'History Cadet', 10, 'e5210000-0000-0000-0000-000000000001', false, false),
  ('e7110000-0000-0000-0000-000000000001', 'Parent', 15, null, false, false)
ON CONFLICT (id) DO UPDATE SET role_name = EXCLUDED.role_name;

INSERT INTO auth.users (id, email) VALUES
  ('e5230000-0000-0000-0000-000000000001', 'history-parent@test.com'),
  ('e5230000-0000-0000-0000-000000000002', 'other-parent@test.com'),
  ('e5230000-0000-0000-0000-000000000003', 'history-cadet@test.com')
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
  'e5230000-0000-0000-0000-000000000001',
  'e5230000-0000-0000-0000-000000000002',
  'e5230000-0000-0000-0000-000000000003'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('e5230000-0000-0000-0000-000000000003', 'Cadet', 'History', 'e5220000-0000-0000-0000-000000000002', 'e5210000-0000-0000-0000-000000000001', false),
  ('e5230000-0000-0000-0000-000000000001', 'Linked', 'Parent', 'e7110000-0000-0000-0000-000000000001', null, false),
  ('e5230000-0000-0000-0000-000000000002', 'Other', 'Parent', 'e7110000-0000-0000-0000-000000000001', null, false)
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.cadet_profiles WHERE profile_id = 'e5230000-0000-0000-0000-000000000003';
SELECT public.ensure_cadet_profile('e5230000-0000-0000-0000-000000000003');

INSERT INTO public.cadet_parent_links (cadet_profile_id, parent_profile_id, status)
VALUES ('e5230000-0000-0000-0000-000000000003', 'e5230000-0000-0000-0000-000000000001', 'active')
ON CONFLICT (cadet_profile_id, parent_profile_id) DO UPDATE SET status = 'active';

SELECT public.mock_auth('e5230000-0000-0000-0000-000000000001');

SELECT ok(
  public.can_view_cadet_history('e5230000-0000-0000-0000-000000000003'),
  'Linked parent can_view_cadet_history'
);

SELECT public.mock_auth('e5230000-0000-0000-0000-000000000002');

SELECT ok(
  NOT public.can_view_cadet_history('e5230000-0000-0000-0000-000000000003'),
  'Unlinked parent cannot view cadet history'
);

SELECT public.mock_auth('e5230000-0000-0000-0000-000000000001');

SELECT ok(
  public.parent_can_view_cadet('e5230000-0000-0000-0000-000000000003'),
  'parent_can_view_cadet helper works'
);

SELECT * FROM finish();
ROLLBACK;
