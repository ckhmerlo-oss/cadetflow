BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Reuse work-order fixture pattern from day08
INSERT INTO public.companies (id, company_name) VALUES
  ('d4010000-0000-0000-0000-000000000001', 'Email Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('d4020000-0000-0000-0000-000000000001', 'Email Alpha TAC', 65, 'd4010000-0000-0000-0000-000000000001', true, false),
  ('d4020000-0000-0000-0000-000000000003', 'Email Cadet', 15, 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4020000-0000-0000-0000-000000000004', 'Email Maintenance', 55, NULL, false, false),
  ('d4020000-0000-0000-0000-000000000006', 'Email Faculty', 50, NULL, false, false),
  ('d4020000-0000-0000-0000-000000000005', 'Email Admin', 90, NULL, false, false)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d4030000-0000-0000-0000-000000000001', 'email-alpha-tac@test.com'),
  ('d4030000-0000-0000-0000-000000000003', 'email-cadet@test.com'),
  ('d4030000-0000-0000-0000-000000000004', 'email-maintenance@test.com'),
  ('d4030000-0000-0000-0000-000000000006', 'email-faculty@test.com'),
  ('d4030000-0000-0000-0000-000000000005', 'email-admin@test.com')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.staff_profiles WHERE profile_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000006',
  'd4030000-0000-0000-0000-000000000005'
);
DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000006',
  'd4030000-0000-0000-0000-000000000005'
);
DELETE FROM public.profiles WHERE id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000006',
  'd4030000-0000-0000-0000-000000000005'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('d4030000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd4020000-0000-0000-0000-000000000001', 'd4010000-0000-0000-0000-000000000001'),
  ('d4030000-0000-0000-0000-000000000003', 'Alex', 'Cadet', 'd4020000-0000-0000-0000-000000000003', 'd4010000-0000-0000-0000-000000000001'),
  ('d4030000-0000-0000-0000-000000000004', 'Mike', 'Maint', 'd4020000-0000-0000-0000-000000000004', NULL),
  ('d4030000-0000-0000-0000-000000000006', 'Mary', 'Faculty', 'd4020000-0000-0000-0000-000000000006', NULL),
  ('d4030000-0000-0000-0000-000000000005', 'Site', 'Admin', 'd4020000-0000-0000-0000-000000000005', NULL)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id;

UPDATE public.barracks_rooms SET company_id = 'd4010000-0000-0000-0000-000000000001' WHERE room_number = 'A115';

INSERT INTO public.user_preferences (user_id, email_status_change, in_app_status_change)
SELECT id, 'immediate', 'immediate' FROM public.profiles
WHERE id IN ('d4030000-0000-0000-0000-000000000004', 'd4030000-0000-0000-0000-000000000001')
ON CONFLICT (user_id) DO UPDATE SET
  email_status_change = 'immediate',
  in_app_status_change = 'immediate';

DELETE FROM public.notification_queue WHERE user_id = 'd4030000-0000-0000-0000-000000000004';
DELETE FROM public.work_orders WHERE requester_id IN ('d4030000-0000-0000-0000-000000000003', 'd4030000-0000-0000-0000-000000000006');

-- Other-space create → maintenance email on portal intake
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000006');
SELECT public.create_work_order('other', 'Hallway light out', NULL, 'Main hall', '{}');

RESET ROLE;
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.notification_queue nq
    WHERE nq.user_id = 'd4030000-0000-0000-0000-000000000004'
      AND nq.status = 'pending'
      AND nq.idempotency_key LIKE 'email:workorder.%'
  ),
  'enqueue_email_notification → maintenance email on other-space work order create'
);

-- TAC forward → maintenance email
RESET ROLE;
SELECT set_config(
  'test.email_wo_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000006' ORDER BY created_at DESC LIMIT 1),
  false
);

DELETE FROM public.notification_queue WHERE idempotency_key LIKE 'email:workorder.forwarded:' || current_setting('test.email_wo_id') || '%';

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');
SELECT public.create_work_order(
  'barracks', 'Forward email test',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
  NULL, '{}'
);

SELECT set_config(
  'test.barracks_wo_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
   AND status = 'submitted' ORDER BY created_at DESC LIMIT 1),
  false
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');
SELECT public.transition_work_order(current_setting('test.barracks_wo_id')::uuid, 'forward', 'To maintenance');

RESET ROLE;
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.notification_queue
    WHERE idempotency_key LIKE 'email:workorder.forwarded:' || current_setting('test.barracks_wo_id') || '%'
  ),
  'enqueue_email_notification → email on TAC forward to maintenance'
);

-- Per-cadet email off suppresses maintenance enqueue for oversight (sanity)
RESET ROLE;
INSERT INTO public.cadet_notification_preferences (staff_id, cadet_id, category, email_frequency, in_app_frequency)
VALUES ('d4030000-0000-0000-0000-000000000004', 'd4030000-0000-0000-0000-000000000003', 'status_change', 'off', 'off')
ON CONFLICT DO NOTHING;

SELECT public.enqueue_email_notification(
  'd4030000-0000-0000-0000-000000000004',
  'oversight.report_submitted', 'Test', 'Body', '/x',
  'email.test.percadet.off:1', 'd4030000-0000-0000-0000-000000000003'
);

SELECT is(
  (SELECT count(*)::int FROM public.notification_queue WHERE idempotency_key = 'email.test.percadet.off:1'),
  0,
  'enqueue_email_notification → per-cadet off suppresses email enqueue'
);

-- Year closeout reminder email (minimal fixture from day06 pattern)
DELETE FROM public.academic_terms WHERE school_year IN ('2075-2076', '2076-2077');
DELETE FROM public.notification_queue WHERE idempotency_key LIKE 'email.archive.pre_close:2075-2076:%';
DELETE FROM public.user_notifications WHERE idempotency_key LIKE 'archive.pre_close:2075-2076:%';

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('EY1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2075-2076', 1, false),
  ('EY2', CURRENT_DATE - 89, CURRENT_DATE - 60, '2075-2076', 2, false),
  ('EY3', CURRENT_DATE - 59, CURRENT_DATE - 30, '2075-2076', 3, false),
  ('EY4', CURRENT_DATE - 29, CURRENT_DATE + 30, '2075-2076', 4, false),
  ('EY5', CURRENT_DATE + 31, CURRENT_DATE + 60, '2075-2076', 5, false),
  ('EN1', CURRENT_DATE + 61, CURRENT_DATE + 90, '2076-2077', 1, false),
  ('EN2', CURRENT_DATE + 91, CURRENT_DATE + 120, '2076-2077', 2, false),
  ('EN3', CURRENT_DATE + 121, CURRENT_DATE + 150, '2076-2077', 3, false),
  ('EN4', CURRENT_DATE + 151, CURRENT_DATE + 180, '2076-2077', 4, false),
  ('EN5', CURRENT_DATE + 181, CURRENT_DATE + 210, '2076-2077', 5, false);

RESET ROLE;
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000005');
SELECT public.send_year_close_reminders('2075-2076');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.notification_queue
    WHERE idempotency_key LIKE 'email.archive.pre_close:2075-2076:%'
  ),
  'send_year_close_reminders → closeout email enqueued with archive.pre_close key'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE event_type = 'archive.pre_close_summary'
      AND idempotency_key LIKE 'archive.pre_close:2075-2076:%'
  ),
  'send_year_close_reminders → in-app archive.pre_close_summary notification created'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
