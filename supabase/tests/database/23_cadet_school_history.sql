-- Cadet school history report (on-demand aggregator)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(12);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

DELETE FROM public.demerit_reports WHERE subject_cadet_id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002'
);
DELETE FROM public.cadet_class_enrollments WHERE cadet_id IN (
  'f3000000-0000-0000-0000-000000000001'
);
DELETE FROM public.cadet_archive_intervals WHERE cadet_id IN (
  'f3000000-0000-0000-0000-000000000001'
);
DELETE FROM public.staff_profiles WHERE profile_id IN (
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000099',
  'f3000000-0000-0000-0000-0000000000aa'
);
DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002'
);
DELETE FROM public.profiles WHERE id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000099',
  'f3000000-0000-0000-0000-0000000000aa'
);
DELETE FROM public.academic_terms WHERE school_year IN ('2080-2081', '2081-2082');
DELETE FROM auth.users WHERE id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000099',
  'f3000000-0000-0000-0000-0000000000aa'
);

INSERT INTO public.companies (id, company_name)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Hist Alpha'),
  ('f1000000-0000-0000-0000-000000000002', 'Hist Bravo')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES
  ('f2000000-0000-0000-0000-000000000001', 'Hist Cadet', 0, 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f2000000-0000-0000-0000-000000000002', 'Hist TAC Alpha', 65, 'f1000000-0000-0000-0000-000000000001', false, true),
  ('f2000000-0000-0000-0000-000000000003', 'Hist TAC Bravo', 65, 'f1000000-0000-0000-0000-000000000002', false, true),
  ('f2000000-0000-0000-0000-000000000099', 'Hist Admin', 90, NULL, true, true)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_all_rosters = EXCLUDED.can_manage_all_rosters,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email, created_at, raw_user_meta_data) VALUES
  ('f3000000-0000-0000-0000-000000000001', 'hist-cadet@test.com', '2020-08-01', '{"first_name":"Hist","last_name":"Returner"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000002', 'hist-peer@test.com', '2020-08-01', '{"first_name":"Hist","last_name":"Peer"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000003', 'hist-alpha-tac@test.com', now(), '{"first_name":"Hist","last_name":"AlphaTAC"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000099', 'hist-admin@test.com', now(), '{"first_name":"Hist","last_name":"Admin"}'::jsonb),
  ('f3000000-0000-0000-0000-0000000000aa', 'hist-bravo-tac@test.com', now(), '{"first_name":"Hist","last_name":"BravoTAC"}'::jsonb);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, is_site_admin, archived)
VALUES
  ('f3000000-0000-0000-0000-000000000001', 'Hist', 'Returner', 'f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f3000000-0000-0000-0000-000000000002', 'Hist', 'Peer', 'f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f3000000-0000-0000-0000-000000000003', 'Hist', 'AlphaTAC', 'f2000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f3000000-0000-0000-0000-000000000099', 'Hist', 'Admin', 'f2000000-0000-0000-0000-000000000099', NULL, true, false),
  ('f3000000-0000-0000-0000-0000000000aa', 'Hist', 'BravoTAC', 'f2000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000002', false, false)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id,
  company_id = EXCLUDED.company_id,
  archived = EXCLUDED.archived,
  is_site_admin = EXCLUDED.is_site_admin;

UPDATE public.profiles SET role_id = 'f2000000-0000-0000-0000-000000000003', company_id = 'f1000000-0000-0000-0000-000000000002'
WHERE id = 'f3000000-0000-0000-0000-0000000000aa';
UPDATE public.profiles SET role_id = 'f2000000-0000-0000-0000-000000000002', company_id = 'f1000000-0000-0000-0000-000000000001'
WHERE id = 'f3000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'f2000000-0000-0000-0000-000000000099', company_id = NULL, is_site_admin = true
WHERE id = 'f3000000-0000-0000-0000-000000000099';
UPDATE public.profiles SET role_id = 'f2000000-0000-0000-0000-000000000001', company_id = 'f1000000-0000-0000-0000-000000000001'
WHERE id IN ('f3000000-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000002');

SELECT public.ensure_cadet_profile('f3000000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('f3000000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('f3000000-0000-0000-0000-000000000003');
SELECT public.ensure_staff_profile('f3000000-0000-0000-0000-000000000099');
SELECT public.ensure_staff_profile('f3000000-0000-0000-0000-0000000000aa');

UPDATE public.cadet_profiles SET
  years_attended = 2,
  role_history = jsonb_build_array(
    jsonb_build_object(
      'role_name', 'Cadet',
      'company_name', 'Hist Alpha',
      'school_year', '2080-2081',
      'ended_at', (CURRENT_DATE - 320)::timestamptz,
      'reason', 'Promotion'
    )
  )
WHERE profile_id = 'f3000000-0000-0000-0000-000000000001';

INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES ('f4000000-0000-0000-0000-000000000001', 'Hist Test Offense', 1, 5, 'Test', 'H1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('H P1', CURRENT_DATE - 400, CURRENT_DATE - 370, '2080-2081', 1, true),
  ('H P2', CURRENT_DATE - 369, CURRENT_DATE - 340, '2080-2081', 2, true),
  ('H P3', CURRENT_DATE - 339, CURRENT_DATE - 310, '2080-2081', 3, true),
  ('H P4', CURRENT_DATE - 309, CURRENT_DATE - 280, '2080-2081', 4, true),
  ('H P5', CURRENT_DATE - 279, CURRENT_DATE - 250, '2080-2081', 5, true),
  ('H C1', CURRENT_DATE - 60, CURRENT_DATE - 30, '2081-2082', 1, false),
  ('H C2', CURRENT_DATE - 29, CURRENT_DATE + 30, '2081-2082', 2, false);

INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
)
VALUES
  (
    'f5000000-0000-0000-0000-000000000001',
    'f3000000-0000-0000-0000-000000000001',
    'f3000000-0000-0000-0000-000000000099',
    'f4000000-0000-0000-0000-000000000001',
    5,
    'completed',
    CURRENT_DATE - 325
  ),
  (
    'f5000000-0000-0000-0000-000000000002',
    'f3000000-0000-0000-0000-000000000001',
    'f3000000-0000-0000-0000-000000000099',
    'f4000000-0000-0000-0000-000000000001',
    3,
    'completed',
    CURRENT_DATE - 45
  );

INSERT INTO public.cadet_archive_intervals (cadet_id, started_at, ended_at, reason, departure_classification)
VALUES (
  'f3000000-0000-0000-0000-000000000001',
  (CURRENT_DATE - 305)::timestamptz,
  (CURRENT_DATE - 285)::timestamptz,
  'Year close',
  'non_return'
);

RESET ROLE;

-- Permissions
SELECT public.mock_auth('f3000000-0000-0000-0000-000000000001');

SELECT ok(
  (public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) -> 'cadet' ->> 'first_name') = 'Hist',
  'Cadet can generate own history report'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000099');

SELECT ok(
  (public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) -> 'cadet' ->> 'last_name') = 'Returner',
  'Admin can generate cadet history report'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000003');

SELECT ok(
  (public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) -> 'cadet' ->> 'last_name') = 'Returner',
  'Same-company TAC can generate history report'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-0000000000aa');

SELECT throws_ok(
  $$SELECT public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false)$$,
  'P0001',
  NULL,
  'Cross-company TAC denied history report'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000099');

-- Conduct matches period stats
SELECT is(
  (
    SELECT (elem ->> 'term_demerits')::bigint
    FROM public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) r,
      jsonb_array_elements(r -> 'conduct_by_term') elem
    WHERE elem ->> 'school_year' = '2080-2081' AND (elem ->> 'term_number')::int = 3
    LIMIT 1
  ),
  (SELECT term_demerits FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)),
  'Conduct row term demerits match get_cadet_period_stats'
);

-- Discipline count matches ledger for period
SELECT is(
  jsonb_array_length(public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) -> 'discipline_events'),
  (SELECT count(*)::int FROM public.get_cadet_ledger_for_period(
    'f3000000-0000-0000-0000-000000000001',
    (SELECT term_start FROM public.resolve_period_bounds('2080-2081', 3::smallint)),
    (SELECT (term_end + interval '1 day')::timestamptz - interval '1 microsecond' FROM public.resolve_period_bounds('2080-2081', 3::smallint) LIMIT 1)
  )),
  'Discipline events match get_cadet_ledger_for_period count'
);

-- Archive interval overlaps Term 4 (not Term 3 start)
SELECT ok(
  jsonb_array_length(public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 4::smallint, false) -> 'archive_intervals') >= 1,
  'Archive interval included when overlapping term scope'
);

-- Role event in scope for Term 3
SELECT ok(
  jsonb_array_length(public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) -> 'role_events') >= 1,
  'Role events included when ended_at within scope'
);

-- Narrow scope excludes role event outside bounds (current term only, role was prior year)
SELECT is(
  jsonb_array_length(public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2081-2082', 1::smallint, false) -> 'role_events'),
  0,
  'Role events clipped out of single-term scope'
);

-- Full career spans multiple school years in conduct
SELECT ok(
  (
    SELECT count(DISTINCT elem ->> 'school_year')
    FROM public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', NULL, NULL, true) r,
      jsonb_array_elements(r -> 'conduct_by_term') elem
  ) >= 2,
  'Full career conduct includes multiple school years'
);

SELECT ok(
  (public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', NULL, NULL, true) -> 'scope' ->> 'full_career')::boolean,
  'Full career scope flag set'
);

-- Historical-only scope omits activities
SELECT ok(
  jsonb_typeof(
    public.get_cadet_history_report('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint, false) -> 'activities_current'
  ) = 'null',
  'Historical scope omits current activities block'
);

SELECT * FROM finish();
ROLLBACK;
