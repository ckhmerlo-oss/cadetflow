-- Day 06: Year close job, roster archive filter, reactivation

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(52);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Test fixtures (isolated school years and users)
DELETE FROM public.appeals WHERE report_id = 'e5000000-0000-0000-0000-000000000001';
DELETE FROM public.tour_ledger WHERE report_id = 'e5000000-0000-0000-0000-000000000001';
DELETE FROM public.demerit_reports WHERE id IN ('e5000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000002');
DELETE FROM public.incident_reports WHERE id = 'e6000000-0000-0000-0000-000000000001';
DELETE FROM public.year_close_audit WHERE school_year IN ('2070-2071', '2071-2072');
DELETE FROM public.academic_terms WHERE school_year IN ('2070-2071', '2071-2072');
DELETE FROM auth.users WHERE id IN (
  'e3000000-0000-0000-0000-000000000001',
  'e3000000-0000-0000-0000-000000000002',
  'e3000000-0000-0000-0000-000000000003',
  'e3000000-0000-0000-0000-000000000099'
);

INSERT INTO public.companies (id, company_name)
VALUES ('e1000000-0000-0000-0000-000000000001', 'Day06 Company')
ON CONFLICT (company_name) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES
  ('e2000000-0000-0000-0000-000000000001', 'Day06 Cadet', 0, 'e1000000-0000-0000-0000-000000000001', false, false),
  ('e2000000-0000-0000-0000-000000000002', 'Day06 TAC', 65, 'e1000000-0000-0000-0000-000000000001', false, true),
  ('e2000000-0000-0000-0000-000000000099', 'Day06 Admin', 90, NULL, true, true)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  can_manage_all_rosters = EXCLUDED.can_manage_all_rosters,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('e3000000-0000-0000-0000-000000000001', 'day06-cadet@test.com', '{"first_name":"Day06","last_name":"Cadet"}'::jsonb),
  ('e3000000-0000-0000-0000-000000000002', 'day06-tac@test.com', '{"first_name":"Day06","last_name":"TAC"}'::jsonb),
  ('e3000000-0000-0000-0000-000000000003', 'day06-suspended@test.com', '{"first_name":"Day06","last_name":"Suspended"}'::jsonb),
  ('e3000000-0000-0000-0000-000000000099', 'day06-admin@test.com', '{"first_name":"Day06","last_name":"Admin"}'::jsonb);

UPDATE public.profiles AS p SET
  first_name = v.first_name,
  last_name = v.last_name,
  company_id = v.company_id,
  is_site_admin = v.is_site_admin,
  archived = false
FROM (VALUES
  ('e3000000-0000-0000-0000-000000000001'::uuid, 'Day06', 'Cadet', 'e1000000-0000-0000-0000-000000000001'::uuid, false),
  ('e3000000-0000-0000-0000-000000000002'::uuid, 'Day06', 'TAC', 'e1000000-0000-0000-0000-000000000001'::uuid, false),
  ('e3000000-0000-0000-0000-000000000003'::uuid, 'Day06', 'Suspended', 'e1000000-0000-0000-0000-000000000001'::uuid, false),
  ('e3000000-0000-0000-0000-000000000099'::uuid, 'Day06', 'Admin', NULL::uuid, true)
) AS v(id, first_name, last_name, company_id, is_site_admin)
WHERE p.id = v.id;

UPDATE public.profiles AS p SET
  role_id = v.role_id
FROM (VALUES
  ('e3000000-0000-0000-0000-000000000001'::uuid, 'e2000000-0000-0000-0000-000000000001'::uuid),
  ('e3000000-0000-0000-0000-000000000002'::uuid, 'e2000000-0000-0000-0000-000000000002'::uuid),
  ('e3000000-0000-0000-0000-000000000003'::uuid, 'e2000000-0000-0000-0000-000000000001'::uuid),
  ('e3000000-0000-0000-0000-000000000099'::uuid, 'e2000000-0000-0000-0000-000000000099'::uuid)
) AS v(id, role_id)
WHERE p.id = v.id;

SELECT public.ensure_cadet_profile('e3000000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('e3000000-0000-0000-0000-000000000003');
SELECT public.ensure_staff_profile('e3000000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('e3000000-0000-0000-0000-000000000099');

UPDATE public.cadet_profiles
SET years_attended = 0, room_number = '101', cached_tour_balance = 2, graduated_at = null,
    probation_status = 'Academic', probation_notes = 'Day06 test'
WHERE profile_id = 'e3000000-0000-0000-0000-000000000001';

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES ('e2000000-0000-0000-0000-000000000004', 'Day06 Cadet Leader', 15, 'e1000000-0000-0000-0000-000000000001', false, false)
ON CONFLICT (id) DO UPDATE SET default_role_level = EXCLUDED.default_role_level;

UPDATE public.profiles
SET role_id = 'e2000000-0000-0000-0000-000000000004'
WHERE id = 'e3000000-0000-0000-0000-000000000001';

INSERT INTO public.cadet_oversight_assignments (cadet_id, staff_id, assignment_type, source, is_active)
VALUES ('e3000000-0000-0000-0000-000000000001', 'e3000000-0000-0000-0000-000000000002', 'tac', 'system', true)
ON CONFLICT DO NOTHING;

UPDATE public.profiles
SET role_id = 'e2000000-0000-0000-0000-000000000001'
WHERE id = 'e3000000-0000-0000-0000-000000000001';

-- Closing year: 5 terms spanning now()
INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('D6 T1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2070-2071', 1, false),
  ('D6 T2', CURRENT_DATE - 89, CURRENT_DATE - 60, '2070-2071', 2, false),
  ('D6 T3', CURRENT_DATE - 59, CURRENT_DATE - 30, '2070-2071', 3, false),
  ('D6 T4', CURRENT_DATE - 29, CURRENT_DATE + 30, '2070-2071', 4, false),
  ('D6 T5', CURRENT_DATE + 31, CURRENT_DATE + 60, '2070-2071', 5, false);

-- Next year: 5 future terms
INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('D6 N1', CURRENT_DATE + 61, CURRENT_DATE + 90, '2071-2072', 1, false),
  ('D6 N2', CURRENT_DATE + 91, CURRENT_DATE + 120, '2071-2072', 2, false),
  ('D6 N3', CURRENT_DATE + 121, CURRENT_DATE + 150, '2071-2072', 3, false),
  ('D6 N4', CURRENT_DATE + 151, CURRENT_DATE + 180, '2071-2072', 4, false),
  ('D6 N5', CURRENT_DATE + 181, CURRENT_DATE + 210, '2071-2072', 5, false);

-- Offense type for demerit
INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES ('e4000000-0000-0000-0000-000000000001', 'Day06 Test Offense', 1, 5, 'Test', 'D6')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.appeals WHERE report_id = 'e5000000-0000-0000-0000-000000000001';
DELETE FROM public.tour_ledger WHERE report_id = 'e5000000-0000-0000-0000-000000000001';
DELETE FROM public.demerit_reports WHERE id IN ('e5000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000002');
DELETE FROM public.incident_reports WHERE id = 'e6000000-0000-0000-0000-000000000001';

INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
)
VALUES (
  'e5000000-0000-0000-0000-000000000001',
  'e3000000-0000-0000-0000-000000000001',
  'e3000000-0000-0000-0000-000000000002',
  'e4000000-0000-0000-0000-000000000001',
  5,
  'pending_approval',
  CURRENT_DATE
);

INSERT INTO public.appeals (id, report_id, appealing_cadet_id, status, justification)
VALUES (
  'e7000000-0000-0000-0000-000000000001',
  'e5000000-0000-0000-0000-000000000001',
  'e3000000-0000-0000-0000-000000000001',
  'pending_commandant',
  'Day06 test appeal'
);

INSERT INTO public.incident_reports (
  id, reporter_id, subject_cadet_id, description, location, incident_time, status
)
VALUES (
  'e6000000-0000-0000-0000-000000000001',
  'e3000000-0000-0000-0000-000000000002',
  'e3000000-0000-0000-0000-000000000001',
  'Day06 pending incident',
  'Barracks',
  CURRENT_DATE,
  'pending'
);

RESET ROLE;

UPDATE public.cadet_profiles
SET cached_tour_balance = 2, probation_status = 'Academic', probation_notes = 'Day06 test', room_number = '101'
WHERE profile_id = 'e3000000-0000-0000-0000-000000000001';

SELECT public.mock_auth('e3000000-0000-0000-0000-000000000099');

SELECT ok(
  (public.get_year_close_preflight('2070-2071', '2071-2072') -> 'next_year_terms_configured')::text = 'true',
  'Preflight confirms next school year has 5 terms'
);

SELECT ok(
  jsonb_array_length(
    public.get_year_close_preflight('2070-2071', '2071-2072') -> 'items' -> 'uncleared_rooms'
  ) >= 1,
  'Preflight returns linked uncleared room item'
);

SELECT ok(
  (public.get_year_close_preflight('2070-2071', '2071-2072') -> 'items' -> 'uncleared_rooms' -> 0 ->> 'href')
    = '/profile/e3000000-0000-0000-0000-000000000001',
  'Preflight uncleared room href points to cadet profile'
);

SELECT ok(
  (public.get_year_close_preflight('2070-2071', '2071-2072') -> 'auto_handled' ->> 'tour_sheet_cleared')::integer >= 1,
  'Tour sheet count appears under auto_handled operational cleanup'
);

SELECT ok(
  (public.get_year_close_preflight('2070-2071', '2071-2072') -> 'manual' ->> 'cadets_on_tour') is null,
  'Tour sheet is not listed under manual blockers'
);

SELECT is(
  public.mark_cadets_graduated(ARRAY['e3000000-0000-0000-0000-000000000001']::uuid[]),
  1,
  'mark_cadets_graduated tags cadet'
);

SELECT ok(
  (SELECT graduated_at IS NOT NULL FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001'),
  'graduated_at set on cadet profile'
);

SELECT ok(
  (public.get_year_close_reminder_preview('2070-2071') ->> 'recipient_count')::integer >= 1,
  'Reminder preview returns at least one recipient'
);

SELECT ok(
  (public.get_year_close_preflight('2070-2071', '2071-2072') -> 'items' -> 'uncleared_rooms' -> 0 ->> 'label')
    like '%move-out pending%',
  'Preflight uncleared room label references move-out pending'
);

SELECT ok(
  public._year_close_is_company_tac('e3000000-0000-0000-0000-000000000002'),
  'Assigned company TAC recognized by helper'
);

SELECT ok(
  NOT public._year_close_is_company_tac('e3000000-0000-0000-0000-000000000099'),
  'Leadership admin is not a company TAC'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      public.get_year_close_reminder_preview('2070-2071') -> 'recipients'
    ) rec
    WHERE rec ->> 'user_id' = 'e3000000-0000-0000-0000-000000000099'
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(rec -> 'manual_items') mi
        WHERE mi ->> 'category' = 'uncleared_rooms'
      )
  ),
  'Leadership admin does not receive uncleared room reminder items'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      public.get_year_close_reminder_preview('2070-2071') -> 'recipients'
    ) rec
    WHERE rec ->> 'user_id' = 'e3000000-0000-0000-0000-000000000002'
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(rec -> 'manual_items') mi
        WHERE mi ->> 'category' = 'uncleared_rooms'
      )
  ),
  'Company TAC receives uncleared room reminder items'
);

SELECT ok(
  NOT public.can_force_close_school_year(),
  'Force archive denied for role level 90 admin'
);

SELECT throws_ok(
  $$SELECT public.close_school_year('2070-2071', '2071-2072', true)$$,
  'P0001',
  NULL,
  'Force close rejected when role level is not above 100'
);

SELECT lives_ok(
  $$SELECT public.send_year_close_reminders('2070-2071')$$,
  'send_year_close_reminders completes without error'
);

SELECT ok(
  (public.send_year_close_reminders('2070-2071') ->> 'recipients') is not null,
  'send_year_close_reminders returns jsonb with recipients count'
);

UPDATE public.profiles SET role_id = null WHERE id = 'e3000000-0000-0000-0000-000000000001';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.get_unassigned_users() u
    WHERE u.user_id = 'e3000000-0000-0000-0000-000000000001'
  ),
  'get_unassigned_users includes active cadet missing role'
);

UPDATE public.profiles SET role_id = 'e2000000-0000-0000-0000-000000000001' WHERE id = 'e3000000-0000-0000-0000-000000000001';

SELECT throws_ok(
  $$SELECT public.archive_cadet_profile('e3000000-0000-0000-0000-000000000003', 'archived', NULL)$$,
  'P0001',
  NULL,
  'archive_cadet_profile requires departure classification'
);

SELECT lives_ok(
  $$SELECT public.archive_cadet_profile('e3000000-0000-0000-0000-000000000003', 'archived', 'suspended')$$,
  'archive_cadet_profile accepts suspended classification'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.get_unassigned_users() u
    WHERE u.user_id = 'e3000000-0000-0000-0000-000000000003'
  ),
  'get_unassigned_users excludes archived cadet even when unassigned'
);

SELECT ok(
  (public.get_year_close_preflight('2070-2071', '2071-2072') -> 'manual' ->> 'suspended_cadets')::integer >= 1,
  'Preflight reports suspended archived cadets as manual blocker'
);

SELECT throws_ok(
  $$SELECT public.close_school_year('2070-2071', '2071-2072')$$,
  'P0001',
  NULL,
  'close_school_year blocked while suspended cadet unresolved'
);

SELECT lives_ok(
  $$SELECT public.set_departure_classification('e3000000-0000-0000-0000-000000000003', 'non_return')$$,
  'set_departure_classification resolves suspended cadet'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_profiles cp,
      jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) elem
    WHERE cp.profile_id = 'e3000000-0000-0000-0000-000000000001'
      AND elem ->> 'reason' = 'role_change'
  ),
  'trg_profiles_append_role_history → role_id change appends role_history entry'
);

SELECT public.mock_auth('e3000000-0000-0000-0000-000000000002');
SELECT lives_ok(
  $$SELECT public.delete_cadet_role_history_entry('e3000000-0000-0000-0000-000000000001', 0)$$,
  'delete_cadet_role_history_entry → TAC can delete role history entry'
);

RESET ROLE;
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.role_history_audit
    WHERE cadet_id = 'e3000000-0000-0000-0000-000000000001'
  ),
  'delete_cadet_role_history_entry → writes role_history_audit row'
);

RESET ROLE;
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense, posted_at
)
VALUES (
  'e5000000-0000-0000-0000-000000000002',
  'e3000000-0000-0000-0000-000000000001',
  'e3000000-0000-0000-0000-000000000002',
  'e4000000-0000-0000-0000-000000000001',
  5,
  'completed',
  CURRENT_DATE,
  NULL
);

SELECT ok(
  (SELECT posted_at IS NULL FROM public.demerit_reports WHERE id = 'e5000000-0000-0000-0000-000000000002'),
  'Completed greensheet report is unposted before year close'
);

SELECT public.mock_auth('e3000000-0000-0000-0000-000000000099');
SELECT lives_ok(
  $$SELECT public.close_school_year('2070-2071', '2071-2072')$$,
  'close_school_year executes without error'
);

SELECT ok(
  (SELECT posted_at IS NOT NULL FROM public.demerit_reports WHERE id = 'e5000000-0000-0000-0000-000000000002'),
  'Year close posts pending completed greensheets in closing school year'
);

SELECT ok(
  (SELECT status FROM public.demerit_reports WHERE id = 'e5000000-0000-0000-0000-000000000001') = 'pulled',
  'Open demerit pulled at year close'
);

SELECT ok(
  (SELECT status FROM public.appeals WHERE id = 'e7000000-0000-0000-0000-000000000001') = 'rejected_final',
  'Open appeal rejected_final at year close'
);

SELECT ok(
  (SELECT status FROM public.incident_reports WHERE id = 'e6000000-0000-0000-0000-000000000001') = 'closed',
  'Pending incident closed at year close'
);

SELECT ok(
  (SELECT archived FROM public.profiles WHERE id = 'e3000000-0000-0000-0000-000000000001') = true,
  'Active cadet archived at year close'
);

SELECT ok(
  (SELECT graduated_at IS NOT NULL FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001'),
  'graduated_at preserved on archived cadet profile'
);

SELECT ok(
  (SELECT departure_classification IS NULL FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001'),
  'Graduated cadet gets null departure classification at year close (not non_return)'
);

SELECT ok(
  (SELECT departure_classification FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000003') = 'non_return',
  'Previously archived cadet keeps non_return after resolution at close'
);

SELECT ok(
  (SELECT years_attended FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001') = 0,
  'years_attended unchanged until reactivation'
);

SELECT ok(
  (SELECT room_number FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001') IS NULL,
  'close_school_year → cadet room_number cleared'
);

SELECT ok(
  (SELECT probation_status FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001') = 'None',
  'close_school_year → probation_status reset to None'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'e3000000-0000-0000-0000-000000000001'
      AND is_active = true
  ),
  'close_school_year → oversight assignments deactivated'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.get_full_roster(true) r
    WHERE r.id = 'e3000000-0000-0000-0000-000000000001'
  ),
  'get_full_roster(true) → includes archived cadet'
);

INSERT INTO public.roles (id, role_name, default_role_level, can_manage_all_rosters)
VALUES ('e2000000-0000-0000-0000-000000000105', 'Day06 Super Admin', 105, true)
ON CONFLICT (id) DO UPDATE SET default_role_level = 105;

SELECT set_config('request.jwt.claim.sub', '', true);
RESET ROLE;
INSERT INTO auth.users (id, email) VALUES ('e3000000-0000-0000-0000-000000000105', 'day06-super@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, is_site_admin)
VALUES ('e3000000-0000-0000-0000-000000000105', 'Day06', 'Super', 'e2000000-0000-0000-0000-000000000105', true)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, is_site_admin = true;

DELETE FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000105';
SELECT public.ensure_staff_profile('e3000000-0000-0000-0000-000000000105');

SELECT public.mock_auth('e3000000-0000-0000-0000-000000000105');
SELECT ok(
  public.can_force_close_school_year(),
  'can_force_close_school_year → true for role level 105'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'cadet_conduct_snapshots'
  ),
  'cadet_conduct_snapshots table removed (Day 07)'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.get_full_roster(false) r
    WHERE r.id = 'e3000000-0000-0000-0000-000000000001'
  ),
  'get_full_roster(false) excludes archived cadet'
);

SELECT public.mock_auth('e3000000-0000-0000-0000-000000000099');
SELECT throws_ok(
  $$SELECT public.close_school_year('2070-2071', '2071-2072')$$,
  'P0001',
  NULL,
  'Second close_school_year call fails (already closed)'
);

SELECT public.mock_auth('e3000000-0000-0000-0000-000000000099');
SELECT is(
  public.reactivate_cadets(
    ARRAY['e3000000-0000-0000-0000-000000000001']::uuid[],
    'e1000000-0000-0000-0000-000000000001',
    'e2000000-0000-0000-0000-000000000001'
  ),
  1,
  'reactivate_cadets returns 1 for archived cadet'
);

SELECT ok(
  (SELECT years_attended FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001') = 1,
  'reactivate_cadets increments years_attended'
);

SELECT ok(
  (SELECT graduated_at IS NULL FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001'),
  'reactivate_cadets clears graduated_at'
);

SELECT ok(
  (SELECT departure_classification IS NULL FROM public.cadet_profiles WHERE profile_id = 'e3000000-0000-0000-0000-000000000001'),
  'reactivate_cadets clears departure_classification'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM public.cadet_profiles cp,
      jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) elem
    WHERE cp.profile_id = 'e3000000-0000-0000-0000-000000000001'
      AND elem ->> 'reason' = 'reactivated'
  ),
  'reactivate_cadets appends role history with reactivated reason'
);

SELECT throws_ok(
  $$SELECT public.reactivate_cadets(
    ARRAY['e3000000-0000-0000-0000-000000000001']::uuid[],
    'e1000000-0000-0000-0000-000000000001',
    'e2000000-0000-0000-0000-000000000001'
  )$$,
  'P0001',
  NULL,
  'reactivate_cadets raises when no archived cadets were reactivated'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
