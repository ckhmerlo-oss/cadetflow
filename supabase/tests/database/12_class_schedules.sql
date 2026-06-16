BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(4);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.roles (id, role_name, default_role_level, can_manage_all_rosters)
VALUES ('a3000000-0000-0000-0000-000000000001', 'Day02 Admin', 90, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (id, email) VALUES ('a4000000-0000-0000-0000-000000000001', 'day02-admin@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, is_site_admin)
VALUES ('a4000000-0000-0000-0000-000000000001', 'Admin', 'User', 'a3000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

SELECT public.mock_auth('a4000000-0000-0000-0000-000000000001');

DELETE FROM public.academic_terms WHERE school_year = '2100-2101';

SELECT throws_ok(
  $$SELECT public.setup_school_year_terms(
    '2100-2101',
    ARRAY['T1','T2','T3','T4','T5'],
    ARRAY[CURRENT_DATE, CURRENT_DATE + 10, CURRENT_DATE + 20, CURRENT_DATE + 5, CURRENT_DATE + 40]::date[],
    ARRAY[CURRENT_DATE + 9, CURRENT_DATE + 19, CURRENT_DATE + 30, CURRENT_DATE + 39, CURRENT_DATE + 50]::date[]
  )$$,
  'Term dates overlap within school year',
  'Rejects overlapping term dates'
);

SELECT lives_ok(
  $$SELECT public.setup_school_year_terms(
    '2100-2101',
    ARRAY['Term 1','Term 2','Term 3','Term 4','Term 5'],
    ARRAY[CURRENT_DATE, CURRENT_DATE + 30, CURRENT_DATE + 60, CURRENT_DATE + 90, CURRENT_DATE + 120]::date[],
    ARRAY[CURRENT_DATE + 29, CURRENT_DATE + 59, CURRENT_DATE + 89, CURRENT_DATE + 119, CURRENT_DATE + 149]::date[]
  )$$,
  'Creates 5 non-overlapping terms'
);

SELECT ok(
  (SELECT count(*) FROM public.academic_terms WHERE school_year = '2100-2101' AND archived = false) = 5,
  'Exactly 5 active terms for school year'
);

SELECT public.archive_school_year('2100-2101');

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.academic_terms
    WHERE school_year = '2100-2101' AND archived = false
  ),
  'Archive marks all terms archived'
);

SELECT * FROM finish();
COMMIT;
