-- Day 10: Special reports, events, notifications, year-close preflight

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(15);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Fixtures (d40 prefix)
DELETE FROM public.special_report_audit_log
WHERE special_report_id IN ('d4040000-0000-0000-0000-000000000001', 'd4040000-0000-0000-0000-000000000002');
DELETE FROM public.special_reports
WHERE id IN ('d4040000-0000-0000-0000-000000000001', 'd4040000-0000-0000-0000-000000000002');
DELETE FROM public.incident_reports WHERE id = 'd4050000-0000-0000-0000-000000000001';
DELETE FROM public.events WHERE id IN ('d4030000-0000-0000-0000-000000000001', 'd4030000-0000-0000-0000-000000000002');
DELETE FROM public.user_notifications
WHERE user_id IN (
  'd4000000-0000-0000-0000-000000000001',
  'd4000000-0000-0000-0000-000000000002',
  'd4000000-0000-0000-0000-000000000099'
);

INSERT INTO public.companies (id, company_name) VALUES
  ('d4010000-0000-0000-0000-000000000001', 'Day10 Alpha Co'),
  ('d4010000-0000-0000-0000-000000000002', 'Day10 Beta Co')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES
  ('d4020000-0000-0000-0000-000000000001', 'Day10 Cadet', 0, 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4020000-0000-0000-0000-000000000002', 'Day10 Alpha TAC', 65, 'd4010000-0000-0000-0000-000000000001', false, true),
  ('d4020000-0000-0000-0000-000000000003', 'Day10 Beta TAC', 65, 'd4010000-0000-0000-0000-000000000002', false, true),
  ('d4020000-0000-0000-0000-000000000099', 'Day10 Commandant', 90, NULL, true, true)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  can_manage_all_rosters = EXCLUDED.can_manage_all_rosters,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d4000000-0000-0000-0000-000000000001', 'day10-cadet@test.com'),
  ('d4000000-0000-0000-0000-000000000002', 'day10-alpha-tac@test.com'),
  ('d4000000-0000-0000-0000-000000000003', 'day10-beta-tac@test.com'),
  ('d4000000-0000-0000-0000-000000000099', 'day10-admin@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived, is_site_admin)
VALUES
  ('d4000000-0000-0000-0000-000000000001', 'Alex', 'Cadet', 'd4020000-0000-0000-0000-000000000001', 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4000000-0000-0000-0000-000000000002', 'Alpha', 'TAC', 'd4020000-0000-0000-0000-000000000002', 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4000000-0000-0000-0000-000000000003', 'Beta', 'TAC', 'd4020000-0000-0000-0000-000000000003', 'd4010000-0000-0000-0000-000000000002', false, false),
  ('d4000000-0000-0000-0000-000000000099', 'Col', 'Admin', 'd4020000-0000-0000-0000-000000000099', NULL, false, true)
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  company_id = EXCLUDED.company_id,
  archived = EXCLUDED.archived,
  is_site_admin = EXCLUDED.is_site_admin;

SELECT public.ensure_cadet_profile('d4000000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('d4000000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('d4000000-0000-0000-0000-000000000003');
SELECT public.ensure_staff_profile('d4000000-0000-0000-0000-000000000099');

INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.profiles
WHERE id IN (
  'd4000000-0000-0000-0000-000000000002',
  'd4000000-0000-0000-0000-000000000099'
)
ON CONFLICT (user_id) DO NOTHING;

UPDATE public.user_preferences
SET in_app_new_report = 'immediate', in_app_status_change = 'immediate'
WHERE user_id IN (
  'd4000000-0000-0000-0000-000000000002',
  'd4000000-0000-0000-0000-000000000099'
);

-- 1) Cadet can submit special report via RPC
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000001');

SELECT lives_ok(
  $$SELECT public.submit_special_report(
    'Witnessed a hallway dispute.',
    'Barracks A',
    now() - interval '1 hour',
    'witness',
    null
  )$$,
  'Cadet submits special report'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.special_reports sr
    WHERE sr.submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001'
      AND sr.status = 'submitted'
  ),
  'Special report row created with submitted status'
);

-- 2) Submission notifies leadership recipients
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications un
    WHERE un.user_id = 'd4000000-0000-0000-0000-000000000099'
      AND un.event_type = 'special_report.action_required'
  ),
  'Commandant receives special_report.action_required'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications un
    WHERE un.user_id = 'd4000000-0000-0000-0000-000000000002'
      AND un.event_type = 'special_report.action_required'
  ),
  'Company TAC receives special_report.action_required'
);

-- 3) TAC can create event
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000002');

SELECT ok(
  public.create_event('Hallway dispute review', 'Grouped filings for alpha company') IS NOT NULL,
  'TAC creates event'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.title = 'Hallway dispute review'
      AND e.status = 'open'
  ),
  'Event exists in open status'
);

-- 4) Beta TAC cannot read alpha cadet special report narrative
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000003');

SELECT is(
  (SELECT count(*)::integer FROM public.special_reports),
  0,
  'Beta TAC cannot SELECT alpha special reports via RLS'
);

-- 5) Alpha TAC can read and link special report to event
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000002');

SELECT ok(
  (SELECT count(*) FROM public.special_reports) >= 1,
  'Alpha TAC can read company special reports'
);

SELECT lives_ok(
  format(
    $$SELECT public.link_filings_to_event(
      (SELECT id FROM public.events WHERE title = 'Hallway dispute review' LIMIT 1),
      '{}'::uuid[],
      ARRAY(SELECT id FROM public.special_reports WHERE submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001' LIMIT 1),
      '{}'::uuid[],
      '{}'::uuid[]
    )$$
  ),
  'Link special report to event'
);

-- 6) Review special report
SELECT lives_ok(
  format(
    $$SELECT public.mark_special_report_reviewed(
      (SELECT id FROM public.special_reports WHERE submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001' LIMIT 1),
      'Reviewed and linked.'
    )$$
  ),
  'TAC marks special report reviewed'
);

SELECT ok(
  (
    SELECT sr.status
    FROM public.special_reports sr
    WHERE sr.submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001'
    LIMIT 1
  ) = 'reviewed',
  'Special report status is reviewed after mark'
);

-- 7) Cadet cannot submit when archived
UPDATE public.profiles SET archived = true WHERE id = 'd4000000-0000-0000-0000-000000000001';
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000001');

SELECT throws_ok(
  $$SELECT public.submit_special_report('Blocked', 'Room', now(), 'witness', null)$$,
  'Permission denied — only active cadets may submit special reports.',
  'Archived cadet cannot submit special report'
);

UPDATE public.profiles SET archived = false WHERE id = 'd4000000-0000-0000-0000-000000000001';

-- 8) Year-close preflight counts open events
INSERT INTO public.events (id, title, summary, status, school_year, created_by)
VALUES (
  'd4030000-0000-0000-0000-000000000002',
  'Open year-close event',
  'Should block close',
  'open',
  coalesce(public.get_active_school_year(), '2025-2026'),
  'd4000000-0000-0000-0000-000000000099'
);

SELECT public.mock_auth('d4000000-0000-0000-0000-000000000099');

SELECT ok(
  coalesce(
    (public.get_year_close_preflight(coalesce(public.get_active_school_year(), '2025-2026')) -> 'manual' ->> 'open_events')::integer,
    0
  ) >= 1,
  'Preflight reports at least one open event'
);

-- 9) Carry forward clears open event blocker for that event school year
SELECT lives_ok(
  format(
    $$SELECT public.carry_forward_event(
      'd4030000-0000-0000-0000-000000000002',
      %L
    )$$,
    coalesce(
      (
        SELECT t.school_year
        FROM public.academic_terms t
        WHERE t.archived = false
          AND t.school_year <> coalesce(public.get_active_school_year(), '2025-2026')
        ORDER BY t.school_year
        LIMIT 1
      ),
      '2099-2100'
    )
  ),
  'Admin carry-forwards open event'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = 'd4030000-0000-0000-0000-000000000002'
      AND e.status = 'carried_forward'
  ),
  'Event status is carried_forward after carry forward'
);

-- 10) TAC can flag and unflag a special report
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000002');

SELECT ok(
  public.toggle_special_report_flag(
    (SELECT id FROM public.special_reports WHERE submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001' LIMIT 1)
  ),
  'TAC flags special report for review'
);

SELECT ok(
  (
    SELECT sr.flagged_for_review
    FROM public.special_reports sr
    WHERE sr.submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001'
    LIMIT 1
  ),
  'Special report flagged_for_review is true'
);

SELECT ok(
  NOT public.toggle_special_report_flag(
    (SELECT id FROM public.special_reports WHERE submitter_cadet_id = 'd4000000-0000-0000-0000-000000000001' LIMIT 1)
  ),
  'TAC unflags special report'
);

-- 11) Cadet cannot create events
SELECT public.mock_auth('d4000000-0000-0000-0000-000000000001');

SELECT throws_ok(
  $$SELECT public.create_event('Cadet attempt', null)$$,
  'Permission denied',
  'Cadet cannot create events'
);

SELECT * FROM finish();
ROLLBACK;
