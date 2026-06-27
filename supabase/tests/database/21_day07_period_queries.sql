-- Day 07: Period query layer tests

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(20);

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
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002'
);
DELETE FROM public.year_close_audit WHERE school_year IN ('2080-2081', '2081-2082');
DELETE FROM public.academic_terms WHERE school_year IN ('2080-2081', '2081-2082');
DELETE FROM auth.users WHERE id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000099',
  'f3000000-0000-0000-0000-0000000000aa'
);

INSERT INTO public.companies (id, company_name)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Day07 Alpha'),
  ('f1000000-0000-0000-0000-000000000002', 'Day07 Bravo')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES
  ('f2000000-0000-0000-0000-000000000001', 'Day07 Cadet', 0, 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f2000000-0000-0000-0000-000000000002', 'Day07 TAC Alpha', 65, 'f1000000-0000-0000-0000-000000000001', false, true),
  ('f2000000-0000-0000-0000-000000000003', 'Day07 TAC Bravo', 65, 'f1000000-0000-0000-0000-000000000002', false, true),
  ('f2000000-0000-0000-0000-000000000099', 'Day07 Admin', 90, NULL, true, true)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_all_rosters = EXCLUDED.can_manage_all_rosters,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email, created_at, raw_user_meta_data) VALUES
  ('f3000000-0000-0000-0000-000000000001', 'day07-cadet@test.com', '2020-08-01', '{"first_name":"Day07","last_name":"Returner"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000002', 'day07-peer@test.com', '2020-08-01', '{"first_name":"Day07","last_name":"Peer"}'::jsonb),
  ('f3000000-0000-0000-0000-000000000099', 'day07-admin@test.com', now(), '{"first_name":"Day07","last_name":"Admin"}'::jsonb),
  ('f3000000-0000-0000-0000-0000000000aa', 'day07-bravo-tac@test.com', now(), '{"first_name":"Day07","last_name":"BravoTAC"}'::jsonb);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, is_site_admin, archived)
VALUES
  ('f3000000-0000-0000-0000-000000000001', 'Day07', 'Returner', 'f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f3000000-0000-0000-0000-000000000002', 'Day07', 'Peer', 'f2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', false, false),
  ('f3000000-0000-0000-0000-000000000099', 'Day07', 'Admin', 'f2000000-0000-0000-0000-000000000099', NULL, true, false),
  ('f3000000-0000-0000-0000-0000000000aa', 'Day07', 'BravoTAC', 'f2000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000002', false, false)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id,
  company_id = EXCLUDED.company_id,
  is_site_admin = EXCLUDED.is_site_admin,
  archived = EXCLUDED.archived;

UPDATE public.profiles AS p SET
  first_name = v.first_name,
  last_name = v.last_name,
  company_id = v.company_id,
  is_site_admin = v.is_site_admin,
  archived = false,
  role_id = v.role_id
FROM (VALUES
  ('f3000000-0000-0000-0000-000000000001'::uuid, 'Day07', 'Returner', 'f1000000-0000-0000-0000-000000000001'::uuid, false, 'f2000000-0000-0000-0000-000000000001'::uuid),
  ('f3000000-0000-0000-0000-000000000002'::uuid, 'Day07', 'Peer', 'f1000000-0000-0000-0000-000000000001'::uuid, false, 'f2000000-0000-0000-0000-000000000001'::uuid),
  ('f3000000-0000-0000-0000-000000000099'::uuid, 'Day07', 'Admin', NULL::uuid, true, 'f2000000-0000-0000-0000-000000000099'::uuid),
  ('f3000000-0000-0000-0000-0000000000aa'::uuid, 'Day07', 'BravoTAC', 'f1000000-0000-0000-0000-000000000002'::uuid, false, 'f2000000-0000-0000-0000-000000000003'::uuid)
) AS v(id, first_name, last_name, company_id, is_site_admin, role_id)
WHERE p.id = v.id;

SELECT public.ensure_cadet_profile('f3000000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('f3000000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('f3000000-0000-0000-0000-000000000099');
SELECT public.ensure_staff_profile('f3000000-0000-0000-0000-0000000000aa');

INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES ('f4000000-0000-0000-0000-000000000001', 'Day07 Test Offense', 1, 5, 'Test', 'D7')
ON CONFLICT (id) DO NOTHING;

-- Prior year 2080-2081 (archived after close simulation) + current 2081-2082
INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('D7 P1', CURRENT_DATE - 400, CURRENT_DATE - 370, '2080-2081', 1, true),
  ('D7 P2', CURRENT_DATE - 369, CURRENT_DATE - 340, '2080-2081', 2, true),
  ('D7 P3', CURRENT_DATE - 339, CURRENT_DATE - 310, '2080-2081', 3, true),
  ('D7 P4', CURRENT_DATE - 309, CURRENT_DATE - 280, '2080-2081', 4, true),
  ('D7 P5', CURRENT_DATE - 279, CURRENT_DATE - 250, '2080-2081', 5, true),
  ('D7 C1', CURRENT_DATE - 60, CURRENT_DATE - 30, '2081-2082', 1, false),
  ('D7 C2', CURRENT_DATE - 29, CURRENT_DATE + 30, '2081-2082', 2, false),
  ('D7 C3', CURRENT_DATE + 31, CURRENT_DATE + 60, '2081-2082', 3, false),
  ('D7 C4', CURRENT_DATE + 61, CURRENT_DATE + 90, '2081-2082', 4, false),
  ('D7 C5', CURRENT_DATE + 91, CURRENT_DATE + 120, '2081-2082', 5, false);

-- Returner: 5 demerits in prior Term 3 (Exemplary), 0 in current Term 2
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
    'f3000000-0000-0000-0000-000000000002',
    'f3000000-0000-0000-0000-000000000099',
    'f4000000-0000-0000-0000-000000000001',
    50,
    'completed',
    CURRENT_DATE - 325
  );

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, course_name)
VALUES ('f6000000-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-0000000000aa', '2080-2081', 3, 'Day07 History')
ON CONFLICT (id) DO UPDATE SET term_number = EXCLUDED.term_number, school_year = EXCLUDED.school_year;

INSERT INTO public.cadet_class_enrollments (cadet_id, class_section_id, school_year, slot_type)
VALUES ('f3000000-0000-0000-0000-000000000001', 'f6000000-0000-0000-0000-000000000001', '2080-2081', 'term_3')
ON CONFLICT DO NOTHING;

RESET ROLE;

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000099');

SELECT is(
  (SELECT term_start FROM public.resolve_period_bounds('2080-2081', 3::smallint)),
  (SELECT start_date FROM public.academic_terms WHERE school_year = '2080-2081' AND term_number = 3),
  'resolve_period_bounds returns Term 3 start'
);

SELECT is(
  (SELECT term_demerits FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)),
  5::bigint,
  'get_cadet_period_stats term demerits for prior Term 3'
);

SELECT is(
  (SELECT conduct_status FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)),
  'Exemplary',
  'get_cadet_period_stats conduct Exemplary at 5 term demerits'
);

SELECT ok(
  (SELECT count(*) FROM public.list_cadet_historical_years('f3000000-0000-0000-0000-000000000001')) >= 1,
  'list_cadet_historical_years includes prior school year'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.list_cadets_by_conduct('2080-2081', 3::smallint, 'Exemplary', NULL, true) r
    WHERE r.cadet_id = 'f3000000-0000-0000-0000-000000000001'
  ),
  'list_cadets_by_conduct includes Exemplary returner for prior Term 3'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.list_cadets_by_conduct('2080-2081', 3::smallint, 'Exemplary', NULL, true) r
    WHERE r.cadet_id = 'f3000000-0000-0000-0000-000000000002'
  ),
  'list_cadets_by_conduct excludes Deficient cadet from Exemplary list'
);

SELECT ok(
  (SELECT count(*) FROM public.get_cadet_ledger_for_period(
    'f3000000-0000-0000-0000-000000000001',
    (SELECT term_start FROM public.resolve_period_bounds('2080-2081', 3::smallint)),
    (SELECT (term_end + interval '1 day')::timestamptz FROM public.resolve_period_bounds('2080-2081', 3::smallint) LIMIT 1)
  )) >= 1,
  'get_cadet_ledger_for_period returns demerit in Term 3 window'
);

SELECT ok(
  public.can_view_cadet_history('f3000000-0000-0000-0000-000000000001'),
  'Admin can_view_cadet_history for cadet'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000001');

SELECT ok(
  public.can_view_cadet_history('f3000000-0000-0000-0000-000000000001'),
  'Cadet can view own history'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-0000000000aa');

SELECT ok(
  NOT public.can_view_cadet_history('f3000000-0000-0000-0000-000000000001'),
  'Bravo TAC cannot view Alpha cadet history'
);

SELECT throws_ok(
  $$SELECT * FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)$$,
  'P0001',
  NULL,
  'Unauthorized period stats raises permission denied'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000099');

SELECT is(
  (SELECT term_demerits FROM public.get_cadet_ledger_stats('f3000000-0000-0000-0000-000000000001')),
  (SELECT term_demerits FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', NULL, NULL)),
  'get_cadet_ledger_stats wrapper matches get_cadet_period_stats for current term'
);

SELECT is(
  (SELECT year_demerits FROM public.get_cadet_ledger_stats('f3000000-0000-0000-0000-000000000001')),
  (SELECT year_demerits FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2081-2082', 2::smallint)),
  'Current term year demerits scoped to active school year through current term'
);

SELECT ok(
  (SELECT current_tour_balance FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)) IS NULL,
  'Historical period stats omit live tour balance'
);

SELECT ok(
  (SELECT is_current_period FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2081-2082', 2::smallint)) = true,
  'Current term period flagged is_current_period'
);

SELECT ok(
  (SELECT is_current_period FROM public.get_cadet_period_stats('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)) = false,
  'Historical term not flagged is_current_period'
);

SELECT ok(
  (SELECT count(*)::int FROM public.get_cadet_academic_history('f3000000-0000-0000-0000-000000000001', '2080-2081', 3::smallint)) >= 1,
  'get_cadet_academic_history → returns enrollment rows for prior term'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000001');
SELECT throws_ok(
  $$SELECT * FROM public.list_cadets_by_conduct('2080-2081', 3::smallint, 'Exemplary', NULL, true)$$,
  'P0001',
  NULL,
  'list_cadets_by_conduct → cadet role denied'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000099');
UPDATE public.profiles SET archived = true WHERE id = 'f3000000-0000-0000-0000-000000000002';
SELECT ok(
  public.can_view_archived_cadet('f3000000-0000-0000-0000-000000000002'),
  'can_view_archived_cadet → admin can view archived cadet'
);

SELECT public.mock_auth('f3000000-0000-0000-0000-000000000001');
SELECT ok(
  NOT public.can_view_archived_cadet('f3000000-0000-0000-0000-000000000002'),
  'can_view_archived_cadet → cadet cannot view peer archived cadet'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
