-- Day 07: Archive intervals and historical roster visibility

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(10);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

DELETE FROM public.staff_profiles WHERE profile_id IN (
  'f3000000-0000-0000-0000-000000000010',
  'f3000000-0000-0000-0000-000000000011',
  'f3000000-0000-0000-0000-000000000099'
);
DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'f3000000-0000-0000-0000-000000000010',
  'f3000000-0000-0000-0000-000000000011'
);
DELETE FROM public.profiles WHERE id IN (
  'f3000000-0000-0000-0000-000000000010',
  'f3000000-0000-0000-0000-000000000011',
  'f3000000-0000-0000-0000-000000000099'
);
DELETE FROM public.cadet_archive_intervals WHERE cadet_id IN (
  'f3000000-0000-0000-0000-000000000010',
  'f3000000-0000-0000-0000-000000000011'
);
DELETE FROM public.cadet_class_enrollments WHERE cadet_id IN (
  'f3000000-0000-0000-0000-000000000010',
  'f3000000-0000-0000-0000-000000000011'
);
DELETE FROM auth.users WHERE id IN (
  'f3000000-0000-0000-0000-000000000010',
  'f3000000-0000-0000-0000-000000000011',
  'f3000000-0000-0000-0000-000000000099'
);

INSERT INTO public.companies (id, company_name)
VALUES ('f1000000-0000-0000-0000-000000000010', 'Day07 Archive Co')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES
  ('f2000000-0000-0000-0000-000000000010', 'Day07 Archive Cadet', 0, 'f1000000-0000-0000-0000-000000000010', false, false),
  ('f2000000-0000-0000-0000-000000000099', 'Day07 Archive Admin', 90, NULL, true, true)
ON CONFLICT (id) DO UPDATE SET default_role_level = EXCLUDED.default_role_level;

INSERT INTO auth.users (id, email, created_at, raw_user_meta_data) VALUES
  ('f3000000-0000-0000-0000-000000000010', 'day07-archived@test.com', '2020-08-01', '{"first_name":"Arch","last_name":"MidYear"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000011', 'day07-earlyarch@test.com', '2020-08-01', '{"first_name":"Arch","last_name":"Early"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000099', 'day07-arch-admin@test.com', now(), '{"first_name":"Arch","last_name":"Admin"}'::jsonb);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, is_site_admin, archived)
VALUES
  ('f3000000-0000-0000-0000-000000000010', 'Arch', 'MidYear', 'f2000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000010', false, true),
  ('f3000000-0000-0000-0000-000000000011', 'Arch', 'Early', 'f2000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000010', false, true),
  ('f3000000-0000-0000-0000-000000000099', 'Arch', 'Admin', 'f2000000-0000-0000-0000-000000000099', NULL, true, false)
ON CONFLICT (id) DO UPDATE SET
  archived = EXCLUDED.archived,
  company_id = EXCLUDED.company_id,
  role_id = EXCLUDED.role_id,
  is_site_admin = EXCLUDED.is_site_admin,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

SELECT public.ensure_cadet_profile('f3000000-0000-0000-0000-000000000010');
SELECT public.ensure_cadet_profile('f3000000-0000-0000-0000-000000000011');
SELECT public.ensure_staff_profile('f3000000-0000-0000-0000-000000000099');

UPDATE public.cadet_profiles SET departure_classification = 'withdrawn' WHERE profile_id = 'f3000000-0000-0000-0000-000000000010';
UPDATE public.cadet_profiles SET departure_classification = 'non_return' WHERE profile_id = 'f3000000-0000-0000-0000-000000000011';

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('D7A T1', CURRENT_DATE - 200, CURRENT_DATE - 170, '2079-2080', 1, true),
  ('D7A T2', CURRENT_DATE - 169, CURRENT_DATE - 140, '2079-2080', 2, true),
  ('D7A T3', CURRENT_DATE - 139, CURRENT_DATE - 110, '2079-2080', 3, true),
  ('D7A T4', CURRENT_DATE - 109, CURRENT_DATE - 80, '2079-2080', 4, true),
  ('D7A T5', CURRENT_DATE - 79, CURRENT_DATE - 50, '2079-2080', 5, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, course_name)
VALUES ('c7000000-0000-0000-0000-000000000010', 'f3000000-0000-0000-0000-000000000099', '2079-2080', 2, 'Archive Test Class')
ON CONFLICT (id) DO UPDATE SET school_year = EXCLUDED.school_year;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, slot_type, school_year, assigned_by)
VALUES
  ('f3000000-0000-0000-0000-000000000010', 'c7000000-0000-0000-0000-000000000010', 'term_2', '2079-2080', 'f3000000-0000-0000-0000-000000000099'),
  ('f3000000-0000-0000-0000-000000000011', 'c7000000-0000-0000-0000-000000000010', 'term_2', '2079-2080', 'f3000000-0000-0000-0000-000000000099')
ON CONFLICT DO NOTHING;

-- MidYear: archived during Term 2 (after Term 2 start, before Term 3)
INSERT INTO public.cadet_archive_intervals (cadet_id, started_at, ended_at, reason, departure_classification)
VALUES (
  'f3000000-0000-0000-0000-000000000010',
  (SELECT (start_date + 5)::timestamptz FROM public.academic_terms WHERE school_year = '2079-2080' AND term_number = 2),
  (SELECT (end_date + 30)::timestamptz FROM public.academic_terms WHERE school_year = '2079-2080' AND term_number = 5),
  'archived',
  'withdrawn'
);

-- Early: archived before Term 2 start
INSERT INTO public.cadet_archive_intervals (cadet_id, started_at, ended_at, reason, departure_classification)
VALUES (
  'f3000000-0000-0000-0000-000000000011',
  (SELECT (start_date - 5)::timestamptz FROM public.academic_terms WHERE school_year = '2079-2080' AND term_number = 2),
  NULL,
  'archived',
  'non_return'
);

SELECT ok(
  public.cadet_was_archived_at(
    'f3000000-0000-0000-0000-000000000010',
    (SELECT (start_date + 10)::timestamptz FROM public.academic_terms WHERE school_year = '2079-2080' AND term_number = 2)
  ),
  'cadet_was_archived_at true during mid-year archive interval'
);

SELECT ok(
  NOT public.cadet_was_archived_at(
    'f3000000-0000-0000-0000-000000000010',
    (SELECT start_date::timestamptz FROM public.academic_terms WHERE school_year = '2079-2080' AND term_number = 1)
  ),
  'cadet_was_archived_at false before mid-year archive started'
);

SELECT ok(
  public.cadet_present_in_period('f3000000-0000-0000-0000-000000000010', '2079-2080', 1::smallint),
  'Mid-year archived cadet present in Term 1 (before archive)'
);

SELECT ok(
  NOT public.cadet_present_in_period('f3000000-0000-0000-0000-000000000011', '2079-2080', 2::smallint),
  'Cadet archived before Term 2 start excluded from Term 2'
);

SELECT ok(
  public.cadet_present_in_period('f3000000-0000-0000-0000-000000000010', '2079-2080', 2::smallint),
  'Mid-year archived cadet present in Term 2 (not archived at term start)'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000099');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.get_roster_for_period('2079-2080', 2::smallint, false) r
    WHERE r.id = 'f3000000-0000-0000-0000-000000000010'
      AND r.archived_as_of_period = true
      AND r.departure_classification = 'withdrawn'
  ),
  'Historical roster includes mid-year archived cadet with period archive fields'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.get_roster_for_period('2079-2080', 2::smallint, false) r
    WHERE r.id = 'f3000000-0000-0000-0000-000000000011'
  ),
  'Historical roster excludes cadet archived before Term 2 start'
);

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES ('D7 Future', CURRENT_DATE + 200, CURRENT_DATE + 230, '2090-2091', 1, false)
ON CONFLICT DO NOTHING;

SELECT throws_ok(
  $$SELECT * FROM public.resolve_period_bounds('2090-2091', 1::smallint)$$,
  'P0001',
  NULL,
  'resolve_period_bounds rejects unstarted term'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.list_cadet_historical_years('f3000000-0000-0000-0000-000000000010') y
    WHERE y.school_year = '2090-2091'
  ),
  'list_cadet_historical_years excludes unstarted school years'
);

SELECT is(
  (SELECT departure_classification FROM public.cadet_archive_as_of(
    'f3000000-0000-0000-0000-000000000010',
    (SELECT (term_end + interval '1 day')::timestamptz FROM public.resolve_period_bounds('2079-2080', 2::smallint) LIMIT 1)
  )),
  'withdrawn',
  'cadet_archive_as_of returns classification at period end'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
