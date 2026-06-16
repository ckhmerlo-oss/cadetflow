BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(14);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Fixture IDs (d03 prefix to avoid collisions with other tests)
-- d310...001 company
-- d320...001 tac group
-- d330...001 tac role, d330...002 teacher role, d330...003 cadet role, d330...004 submitter role
-- d340...001 tac, d340...002 teacher, d340...003 cadet, d340...004 submitter
-- d350...001 term
-- d360...001 class section, d360...002 offense
-- d370...001 report

INSERT INTO public.companies (id, company_name)
VALUES ('d3100000-0000-0000-0000-000000000001', 'Day03 Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.approval_groups (id, group_name, company_id)
VALUES ('d3200000-0000-0000-0000-000000000001', 'Day03 Alpha TAC', 'd3100000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster)
VALUES
  ('d3300000-0000-0000-0000-000000000001', 'Day03 TAC', 65, 'd3100000-0000-0000-0000-000000000001', 'd3200000-0000-0000-0000-000000000001', true),
  ('d3300000-0000-0000-0000-000000000002', 'Day03 Teacher', 50, NULL, NULL, false),
  ('d3300000-0000-0000-0000-000000000003', 'Day03 Cadet', 0, 'd3100000-0000-0000-0000-000000000001', NULL, false),
  ('d3300000-0000-0000-0000-000000000004', 'Day03 Submitter', 10, 'd3100000-0000-0000-0000-000000000001', NULL, false)
ON CONFLICT (id) DO UPDATE SET role_name = EXCLUDED.role_name;

INSERT INTO auth.users (id, email) VALUES
  ('d3400000-0000-0000-0000-000000000001', 'day03-tac@test.com'),
  ('d3400000-0000-0000-0000-000000000002', 'day03-teacher@test.com'),
  ('d3400000-0000-0000-0000-000000000003', 'day03-cadet@test.com'),
  ('d3400000-0000-0000-0000-000000000004', 'day03-submitter@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('d3400000-0000-0000-0000-000000000001', 'TAC', 'Officer', 'd3300000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000001', false),
  ('d3400000-0000-0000-0000-000000000002', 'Jane', 'Teacher', 'd3300000-0000-0000-0000-000000000002', NULL, false),
  ('d3400000-0000-0000-0000-000000000003', 'John', 'Cadet', 'd3300000-0000-0000-0000-000000000003', 'd3100000-0000-0000-0000-000000000001', false),
  ('d3400000-0000-0000-0000-000000000004', 'Sam', 'Submitter', 'd3300000-0000-0000-0000-000000000004', 'd3100000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, archived = EXCLUDED.archived;

UPDATE public.profiles SET role_id = 'd3300000-0000-0000-0000-000000000001' WHERE id = 'd3400000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'd3300000-0000-0000-0000-000000000002' WHERE id = 'd3400000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'd3300000-0000-0000-0000-000000000003' WHERE id = 'd3400000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'd3300000-0000-0000-0000-000000000004' WHERE id = 'd3400000-0000-0000-0000-000000000004';

SELECT public.ensure_staff_profile('d3400000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('d3400000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('d3400000-0000-0000-0000-000000000003');
SELECT public.ensure_cadet_profile('d3400000-0000-0000-0000-000000000004');

-- Direct oversight assignment (avoid active school-year sync dependencies in test)
DELETE FROM public.cadet_oversight_assignments
WHERE cadet_id = 'd3400000-0000-0000-0000-000000000003'
  AND staff_id = 'd3400000-0000-0000-0000-000000000002';

INSERT INTO public.cadet_oversight_assignments (
  cadet_id, staff_id, assignment_type, source, is_active
) VALUES (
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000002',
  'teacher',
  'manual',
  true
);

DELETE FROM public.user_notifications
WHERE user_id IN (
  'd3400000-0000-0000-0000-000000000001',
  'd3400000-0000-0000-0000-000000000002',
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000004'
);

DELETE FROM public.in_app_notification_queue
WHERE user_id IN (
  'd3400000-0000-0000-0000-000000000001',
  'd3400000-0000-0000-0000-000000000002',
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000004'
);

DELETE FROM public.approval_log WHERE report_id IN (
  'd3700000-0000-0000-0000-000000000001',
  'd3700000-0000-0000-0000-000000000002',
  'd3700000-0000-0000-0000-000000000003'
);
DELETE FROM public.demerit_reports WHERE id IN (
  'd3700000-0000-0000-0000-000000000001',
  'd3700000-0000-0000-0000-000000000002',
  'd3700000-0000-0000-0000-000000000003'
);

INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES ('d3500000-0000-0000-0000-000000000001', 'Term 2', CURRENT_DATE - 30, CURRENT_DATE + 30, '2199-2200', 2, false)
ON CONFLICT (id) DO UPDATE SET archived = false;

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, course_name)
VALUES ('d3600000-0000-0000-0000-000000000001', 'd3400000-0000-0000-0000-000000000002', '2199-2200', 2, 'Algebra II')
ON CONFLICT (id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id;

SELECT public.add_cadet_to_class_section('d3600000-0000-0000-0000-000000000001', 'd3400000-0000-0000-0000-000000000003');

INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES ('d3600000-0000-0000-0000-000000000002', 'Day03 Offense', 1, 3, 'Test', 'D03')
ON CONFLICT (id) DO NOTHING;

-- Ensure preferences are immediate for test users
INSERT INTO public.user_preferences (user_id)
VALUES
  ('d3400000-0000-0000-0000-000000000002'),
  ('d3400000-0000-0000-0000-000000000003'),
  ('d3400000-0000-0000-0000-000000000004')
ON CONFLICT (user_id) DO NOTHING;

UPDATE public.user_preferences
SET
  in_app_new_report = 'immediate',
  in_app_status_change = 'immediate',
  in_app_tour_change = 'immediate',
  in_app_conduct_change = 'immediate'
WHERE user_id IN (
  'd3400000-0000-0000-0000-000000000002',
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000004'
);

-- Reset cadet tour balance baseline for transition test
UPDATE public.cadet_profiles
SET cached_tour_balance = 0, conduct_status = 'Level 1'
WHERE profile_id = 'd3400000-0000-0000-0000-000000000003';

-- 1) Report submitted notifies subject and oversight teacher
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
) VALUES (
  'd3700000-0000-0000-0000-000000000001',
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000004',
  'd3600000-0000-0000-0000-000000000002',
  3,
  'pending_approval',
  CURRENT_DATE
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000003'
      AND event_type = 'report.submitted'
  ),
  'Subject cadet receives report.submitted notification'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000002'
      AND event_type = 'oversight.report_submitted'
  ),
  'Assigned teacher receives oversight.report_submitted notification'
);

-- 2) Report rejected notifies submitter with the rejector comment (approval_log trigger)
UPDATE public.demerit_reports
SET status = 'rejected'
WHERE id = 'd3700000-0000-0000-0000-000000000001';

INSERT INTO public.approval_log (report_id, actor_id, action, comment)
VALUES ('d3700000-0000-0000-0000-000000000001', 'd3400000-0000-0000-0000-000000000001', 'rejected', 'Insufficient evidence');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000004'
      AND event_type = 'report.rejected'
      AND body LIKE '%Insufficient evidence%'
  ),
  'Submitter receives report.rejected with reason'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000003'
      AND event_type = 'report.rejected'
  ),
  'Subject cadet is not notified on reject-only path'
);

-- 3) Tour 0 -> N notifies cadet and oversight teacher
UPDATE public.cadet_profiles
SET cached_tour_balance = 3
WHERE profile_id = 'd3400000-0000-0000-0000-000000000003';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000003'
      AND event_type = 'tour.added'
  ),
  'Cadet receives tour.added notification'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000002'
      AND event_type = 'oversight.tour_changed'
  ),
  'Oversight teacher receives tour change notification'
);

-- 4) Conduct change notifies cadet and oversight teacher
UPDATE public.cadet_profiles
SET conduct_status = 'Level 2'
WHERE profile_id = 'd3400000-0000-0000-0000-000000000003';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000003'
      AND event_type = 'conduct.changed'
  ),
  'Cadet receives conduct.changed notification'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000002'
      AND event_type = 'oversight.conduct_changed'
      AND body LIKE '%conduct%'
  ),
  'Oversight teacher receives conduct change notification'
);

-- 5) Preference off suppresses notifications
UPDATE public.user_preferences
SET in_app_new_report = 'off'
WHERE user_id = 'd3400000-0000-0000-0000-000000000002';

DELETE FROM public.demerit_reports WHERE id = 'd3700000-0000-0000-0000-000000000002';
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
) VALUES (
  'd3700000-0000-0000-0000-000000000002',
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000004',
  'd3600000-0000-0000-0000-000000000002',
  2,
  'pending_approval',
  CURRENT_DATE
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000002'
      AND event_type = 'oversight.report_submitted'
      AND idempotency_key LIKE '%' || 'd3700000-0000-0000-0000-000000000002'
  ),
  'Preference off suppresses oversight notifications'
);

-- 6) Archived recipient is skipped
UPDATE public.profiles SET archived = true WHERE id = 'd3400000-0000-0000-0000-000000000004';
UPDATE public.user_preferences SET in_app_status_change = 'immediate' WHERE user_id = 'd3400000-0000-0000-0000-000000000004';

DELETE FROM public.demerit_reports WHERE id = 'd3700000-0000-0000-0000-000000000003';
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
) VALUES (
  'd3700000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000003',
  'd3400000-0000-0000-0000-000000000004',
  'd3600000-0000-0000-0000-000000000002',
  2,
  'pending_approval',
  CURRENT_DATE
);

UPDATE public.demerit_reports SET status = 'rejected' WHERE id = 'd3700000-0000-0000-0000-000000000003';

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000004'
      AND event_type = 'report.rejected'
      AND idempotency_key LIKE '%d3700000-0000-0000-0000-000000000003%'
  ),
  'Archived recipient does not receive notifications'
);

-- 7) Idempotency prevents duplicate dispatch
SELECT public.dispatch_notification(
  'd3400000-0000-0000-0000-000000000003',
  'report.submitted',
  'Duplicate',
  'Should not insert twice',
  '/report/test',
  'idempotency-test:1:subject:d3400000-0000-0000-0000-000000000003',
  '{}'::jsonb
);

SELECT public.dispatch_notification(
  'd3400000-0000-0000-0000-000000000003',
  'report.submitted',
  'Duplicate',
  'Should not insert twice',
  '/report/test',
  'idempotency-test:1:subject:d3400000-0000-0000-0000-000000000003',
  '{}'::jsonb
);

SELECT is(
  (SELECT count(*)::int FROM public.user_notifications WHERE idempotency_key = 'idempotency-test:1:subject:d3400000-0000-0000-0000-000000000003'),
  1,
  'Idempotency key prevents duplicate notifications'
);

-- 8) RLS blocks cross-user reads
SELECT public.mock_auth('d3400000-0000-0000-0000-000000000003');

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3400000-0000-0000-0000-000000000002'
  ),
  'RLS prevents reading another user notifications'
);

-- 9) Mark read updates unread count
SELECT public.mock_auth('d3400000-0000-0000-0000-000000000003');

SELECT public.dispatch_notification(
  'd3400000-0000-0000-0000-000000000003',
  'report.submitted',
  'Unread test',
  'Body',
  '/report/test',
  'mark-read-test:final:1',
  '{}'::jsonb
);

SELECT is(
  (SELECT count(*)::int FROM public.user_notifications
   WHERE user_id = 'd3400000-0000-0000-0000-000000000003'
     AND idempotency_key = 'mark-read-test:final:1'
     AND read_at IS NULL),
  1,
  'Unread notification exists before mark read'
);

SELECT public.mark_notification_read(
  (SELECT id FROM public.user_notifications WHERE idempotency_key = 'mark-read-test:final:1')
);

SELECT is(
  (SELECT count(*)::int FROM public.user_notifications
   WHERE user_id = 'd3400000-0000-0000-0000-000000000003'
     AND idempotency_key = 'mark-read-test:final:1'
     AND read_at IS NOT NULL),
  1,
  'Mark read sets read_at on notification'
);

SELECT * FROM finish();
ROLLBACK;
