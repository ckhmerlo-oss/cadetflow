BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.roles (id, role_name, default_role_level)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Day01 Admin', 90),
  ('a1000000-0000-0000-0000-000000000002', 'Day01 Cadet', 0),
  ('a1000000-0000-0000-0000-000000000003', 'Day01 Band Dir', 50)
ON CONFLICT (id) DO UPDATE SET default_role_level = EXCLUDED.default_role_level;

INSERT INTO auth.users (id, email) VALUES
  ('a2000000-0000-0000-0000-000000000001', 'day01-admin@test.com'),
  ('a2000000-0000-0000-0000-000000000002', 'day01-cadet@test.com'),
  ('a2000000-0000-0000-0000-000000000003', 'day01-band@test.com'),
  ('a2000000-0000-0000-0000-000000000099', 'day01-other@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, is_site_admin)
VALUES
  ('a2000000-0000-0000-0000-000000000001', 'Admin', 'User', 'a1000000-0000-0000-0000-000000000001', false),
  ('a2000000-0000-0000-0000-000000000002', 'Cadet', 'User', 'a1000000-0000-0000-0000-000000000002', false),
  ('a2000000-0000-0000-0000-000000000003', 'Band', 'Director', 'a1000000-0000-0000-0000-000000000003', false),
  ('a2000000-0000-0000-0000-000000000099', 'Other', 'Cadet', 'a1000000-0000-0000-0000-000000000002', false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

UPDATE public.profiles SET role_id = 'a1000000-0000-0000-0000-000000000001' WHERE id = 'a2000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'a1000000-0000-0000-0000-000000000002' WHERE id = 'a2000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'a1000000-0000-0000-0000-000000000003' WHERE id = 'a2000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'a1000000-0000-0000-0000-000000000002' WHERE id = 'a2000000-0000-0000-0000-000000000099';

SELECT public.ensure_cadet_profile('a2000000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('a2000000-0000-0000-0000-000000000099');
SELECT public.ensure_staff_profile('a2000000-0000-0000-0000-000000000003');

UPDATE public.cadet_profiles SET is_in_band = true WHERE profile_id = 'a2000000-0000-0000-0000-000000000002';

INSERT INTO public.app_options (id, category, value, group_name, sort_order, is_active)
VALUES ('a3000000-0000-0000-0000-000000000001', 'test_policy', 'day01', 'Test', 1, true)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, is_active = true;

INSERT INTO public.app_options (id, category, value, group_name, sort_order, is_active)
VALUES ('a3000000-0000-0000-0000-000000000002', 'instrument', 'Trumpet', 'Band', 1, true)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, is_active = true;

DELETE FROM public.band_details WHERE cadet_id = 'a2000000-0000-0000-0000-000000000002';
INSERT INTO public.band_details (cadet_id, instrument, leadership_role)
VALUES ('a2000000-0000-0000-0000-000000000002', 'Trumpet', 'Member')
ON CONFLICT (cadet_id) DO UPDATE SET instrument = EXCLUDED.instrument;

-- app_options RLS: admin can update (cadet write blocked by lack of matching policy)
SELECT public.mock_auth('a2000000-0000-0000-0000-000000000001');
SELECT lives_ok(
  $$UPDATE public.app_options SET value = 'admin_ok' WHERE id = 'a3000000-0000-0000-0000-000000000001'$$,
  'app_options RLS → admin UPDATE allowed'
);

-- band_details: cadet can read own row
SELECT public.mock_auth('a2000000-0000-0000-0000-000000000002');
SELECT ok(
  EXISTS (SELECT 1 FROM public.band_details WHERE cadet_id = 'a2000000-0000-0000-0000-000000000002'),
  'band_details RLS → cadet reads own band row'
);

-- band_details: unrelated cadet cannot read another cadet band row
SELECT public.mock_auth('a2000000-0000-0000-0000-000000000099');
SELECT ok(
  NOT EXISTS (SELECT 1 FROM public.band_details WHERE cadet_id = 'a2000000-0000-0000-0000-000000000002'),
  'band_details RLS → unrelated cadet cannot read peer band row'
);

-- band_details: band manager can insert band app_options
SELECT public.mock_auth('a2000000-0000-0000-0000-000000000003');
SELECT lives_ok(
  $$INSERT INTO public.app_options (category, value, group_name, sort_order, is_active)
    VALUES ('band_role', 'Section Leader', 'Band', 2, true)$$,
  'app_options RLS → band manager can insert band category option'
);

-- profiles RLS: cadet cannot read admin profile (hierarchical view)
SELECT public.mock_auth('a2000000-0000-0000-0000-000000000002');
SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = 'a2000000-0000-0000-0000-000000000001'
  ),
  'profiles RLS → cadet cannot read higher-role admin profile'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
