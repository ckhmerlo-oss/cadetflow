BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(13);

-- Minimal fixtures (d34... prefix)
INSERT INTO public.companies (id, company_name)
VALUES ('d3100000-0000-0000-0000-000000000001', 'Day04 Test Company')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.roles (id, role_name, default_role_level, company_id)
VALUES
  ('d3300000-0000-0000-0000-000000000002', 'Day04 Teacher', 50, NULL),
  ('d3300000-0000-0000-0000-000000000003', 'Day04 Cadet', 0, 'd3100000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (id, email) VALUES
  ('d3400000-0000-0000-0000-000000000002', 'day04-teacher@test.com'),
  ('d3400000-0000-0000-0000-000000000003', 'day04-cadet@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('d3400000-0000-0000-0000-000000000002', 'Jane', 'Teacher', 'd3300000-0000-0000-0000-000000000002', NULL, false),
  ('d3400000-0000-0000-0000-000000000003', 'John', 'Cadet', 'd3300000-0000-0000-0000-000000000003', 'd3100000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  archived = EXCLUDED.archived;

UPDATE public.profiles SET role_id = 'd3300000-0000-0000-0000-000000000002' WHERE id = 'd3400000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'd3300000-0000-0000-0000-000000000003' WHERE id = 'd3400000-0000-0000-0000-000000000003';

SELECT public.ensure_staff_profile('d3400000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('d3400000-0000-0000-0000-000000000003');

INSERT INTO public.cadet_oversight_assignments (cadet_id, staff_id, assignment_type, source, is_active)
VALUES ('d3400000-0000-0000-0000-000000000003', 'd3400000-0000-0000-0000-000000000002', 'teacher', 'manual', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_preferences (user_id, email_new_report, in_app_new_report)
VALUES ('d3400000-0000-0000-0000-000000000002', 'immediate', 'immediate')
ON CONFLICT (user_id) DO UPDATE SET
  email_new_report = 'immediate',
  in_app_new_report = 'immediate';

INSERT INTO public.user_preferences (user_id, email_new_report, in_app_new_report)
VALUES ('d3400000-0000-0000-0000-000000000003', 'immediate', 'immediate')
ON CONFLICT (user_id) DO UPDATE SET
  email_new_report = 'immediate',
  in_app_new_report = 'immediate';

-- Reuse Day03 fixture IDs (d34... teacher oversees d34...003 cadet)
-- Teacher: d3400000-0000-0000-0000-000000000002
-- Cadet:  d3400000-0000-0000-0000-000000000003

DELETE FROM public.notification_queue
WHERE user_id IN (
  'd3400000-0000-0000-0000-000000000002',
  'd3400000-0000-0000-0000-000000000003'
);

DELETE FROM public.cadet_notification_preferences
WHERE staff_id = 'd3400000-0000-0000-0000-000000000002'
  AND cadet_id = 'd3400000-0000-0000-0000-000000000003';

UPDATE public.user_preferences
SET email_new_report = 'immediate',
    in_app_new_report = 'immediate'
WHERE user_id = 'd3400000-0000-0000-0000-000000000002';

-- 1. Global email frequency resolves correctly
SELECT is(
  public.resolve_email_frequency(
    'd3400000-0000-0000-0000-000000000002'::uuid,
    'oversight.report_submitted'::text,
    null::uuid
  )::text,
  'immediate',
  'Global email frequency is immediate for oversight new_report'
);

-- 2. Per-cadet override takes precedence
INSERT INTO public.cadet_notification_preferences (
  staff_id, cadet_id, category, email_frequency, in_app_frequency
) VALUES (
  'd3400000-0000-0000-0000-000000000002',
  'd3400000-0000-0000-0000-000000000003',
  'new_report',
  'off',
  'off'
);

SELECT is(
  public.resolve_email_frequency(
    'd3400000-0000-0000-0000-000000000002',
    'oversight.report_submitted',
    'd3400000-0000-0000-0000-000000000003'
  )::text,
  'off',
  'Per-cadet email override suppresses oversight new_report'
);

SELECT is(
  public.resolve_in_app_frequency(
    'd3400000-0000-0000-0000-000000000002',
    'oversight.report_submitted',
    'd3400000-0000-0000-0000-000000000003'
  )::text,
  'off',
  'Per-cadet in-app override suppresses oversight new_report'
);

-- 3. Without cadet context, global preference still applies
SELECT is(
  public.resolve_email_frequency(
    'd3400000-0000-0000-0000-000000000002'::uuid,
    'oversight.report_submitted'::text,
    null::uuid
  )::text,
  'immediate',
  'Without cadet_id, global preference is used'
);

-- 4. Enqueue respects per-cadet off override (oversight events only)
SELECT public.enqueue_email_notification(
  'd3400000-0000-0000-0000-000000000002',
  'oversight.report_submitted',
  'Test oversight',
  'Body',
  '/report/test',
  'email.test.oversight.off:1',
  'd3400000-0000-0000-0000-000000000003'
);

SELECT is(
  (SELECT count(*)::int FROM public.notification_queue
   WHERE idempotency_key = 'email.test.oversight.off:1'),
  0,
  'Per-cadet off override prevents email enqueue'
);

-- 5. Enqueue works when override removed
DELETE FROM public.cadet_notification_preferences
WHERE staff_id = 'd3400000-0000-0000-0000-000000000002'
  AND cadet_id = 'd3400000-0000-0000-0000-000000000003';

SELECT public.enqueue_email_notification(
  'd3400000-0000-0000-0000-000000000002',
  'oversight.report_submitted',
  'Test oversight',
  'Body',
  '/report/test',
  'email.test.oversight.on:1',
  'd3400000-0000-0000-0000-000000000003'
);

SELECT is(
  (SELECT count(*)::int FROM public.notification_queue
   WHERE idempotency_key = 'email.test.oversight.on:1'
     AND status = 'pending'),
  1,
  'Email enqueued when preferences allow'
);

-- 6. Idempotency prevents duplicate queue rows
SELECT public.enqueue_email_notification(
  'd3400000-0000-0000-0000-000000000002',
  'oversight.report_submitted',
  'Test oversight',
  'Body',
  '/report/test',
  'email.test.oversight.on:1',
  'd3400000-0000-0000-0000-000000000003'
);

SELECT is(
  (SELECT count(*)::int FROM public.notification_queue
   WHERE idempotency_key = 'email.test.oversight.on:1'),
  1,
  'Duplicate enqueue is idempotent'
);

-- 7. Archived user suppresses email enqueue
UPDATE public.profiles SET archived = true
WHERE id = 'd3400000-0000-0000-0000-000000000002';

SELECT public.enqueue_email_notification(
  'd3400000-0000-0000-0000-000000000002',
  'oversight.report_submitted',
  'Archived test',
  'Body',
  null,
  'email.test.archived:1',
  null
);

SELECT is(
  (SELECT count(*)::int FROM public.notification_queue
   WHERE idempotency_key = 'email.test.archived:1'),
  0,
  'Archived users do not receive email enqueue'
);

UPDATE public.profiles SET archived = false
WHERE id = 'd3400000-0000-0000-0000-000000000002';

-- 8. Development mode settings exist
SELECT ok(
  EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'email_development_mode'),
  'email_development_mode setting exists'
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.system_settings WHERE key = 'email_development_forward_to'),
  'email_development_forward_to setting exists'
);

-- 9. dispatch_user_notification enqueues email alongside in-app
DELETE FROM public.user_notifications
WHERE idempotency_key = 'email.dual.test:1';

DELETE FROM public.notification_queue
WHERE idempotency_key = 'email:email.dual.test:1';

SELECT public.enqueue_email_notification(
  'd3400000-0000-0000-0000-000000000003',
  'report.submitted',
  'Direct enqueue test',
  'body',
  '/x',
  'email.direct.cadet:1',
  null
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.notification_queue WHERE idempotency_key = 'email.direct.cadet:1'),
  'Direct cadet email enqueue works'
);

SELECT public.dispatch_user_notification(
  'd3400000-0000-0000-0000-000000000003',
  'report.submitted',
  'Dual channel test',
  'Test body',
  '/report/dual',
  'email.dual.test:1',
  jsonb_build_object('cadet_id', 'd3400000-0000-0000-0000-000000000003')
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.user_notifications WHERE idempotency_key = 'email.dual.test:1'),
  'dispatch_user_notification creates in-app notification'
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.notification_queue WHERE idempotency_key = 'email:email.dual.test:1'),
  'dispatch_user_notification enqueues email'
);

SELECT * FROM finish();
ROLLBACK;
