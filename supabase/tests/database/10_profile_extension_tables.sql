BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(6);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO auth.users (id, email) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'ext-cadet@test.com'),
  ('a1000000-0000-0000-0000-000000000002', 'ext-staff@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.roles (id, role_name, default_role_level)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Extension Cadet', 0),
  ('b1000000-0000-0000-0000-000000000002', 'Extension Staff', 90)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Cadet', 'Extension', 'b1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000002', 'Staff', 'Extension', 'b1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

SELECT public.ensure_cadet_profile('a1000000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('a1000000-0000-0000-0000-000000000002');

DELETE FROM public.academic_terms;

INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES ('c1000000-0000-0000-0000-000000000001', 'Extension Term', CURRENT_DATE - 30, CURRENT_DATE + 30, '2098-2099', 1, false)
ON CONFLICT (id) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  school_year = EXCLUDED.school_year,
  term_number = EXCLUDED.term_number;

SELECT ok(
  EXISTS (SELECT 1 FROM public.cadet_profiles WHERE profile_id = 'a1000000-0000-0000-0000-000000000001'),
  'cadet extension row exists for cadet-capable profile'
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.staff_profiles WHERE profile_id = 'a1000000-0000-0000-0000-000000000002'),
  'staff extension row exists for staff profile'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM public.cadet_profiles cp
    JOIN public.staff_profiles sp ON sp.profile_id = cp.profile_id
    WHERE cp.profile_id IN (
      'a1000000-0000-0000-0000-000000000001',
      'a1000000-0000-0000-0000-000000000002'
    )
  ),
  'no profile has both cadet and staff extension rows'
);

UPDATE public.cadet_profiles
SET cached_tour_balance = 7, has_star_tours = true
WHERE profile_id = 'a1000000-0000-0000-0000-000000000001';

SELECT is(
  (SELECT cached_tour_balance FROM public.cadet_profiles WHERE profile_id = 'a1000000-0000-0000-0000-000000000001'),
  7,
  'cadet tour cache lives on cadet_profiles'
);

SELECT is(
  (SELECT current_tour_balance FROM public._get_cadet_period_stats_core(
    'a1000000-0000-0000-0000-000000000001', '2098-2099', 1::smallint
  ) LIMIT 1),
  7,
  'get_cadet_ledger_stats reads cadet_profiles cache'
);

UPDATE public.staff_profiles
SET staff_title = 'COL', department = 'Command'
WHERE profile_id = 'a1000000-0000-0000-0000-000000000002';

SELECT public.mock_auth('a1000000-0000-0000-0000-000000000002');

SELECT is(
  (SELECT staff_title FROM public.get_faculty_roster() WHERE id = 'a1000000-0000-0000-0000-000000000002'),
  'COL',
  'get_faculty_roster exposes staff_profiles.staff_title'
);

SELECT * FROM finish();
ROLLBACK;
