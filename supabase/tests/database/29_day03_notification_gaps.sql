BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name)
VALUES ('c3100000-0000-0000-0000-000000000001', 'Day03 Gap Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.approval_groups (id, group_name, company_id, next_approver_group_id)
VALUES
  ('c3200000-0000-0000-0000-000000000001', 'Gap Command', NULL, NULL),
  ('c3200000-0000-0000-0000-000000000002', 'Gap Squad', 'c3100000-0000-0000-0000-000000000001', 'c3200000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name, next_approver_group_id = EXCLUDED.next_approver_group_id;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id)
VALUES
  ('c3300000-0000-0000-0000-000000000001', 'Gap Commandant', 90, 'c3100000-0000-0000-0000-000000000001', 'c3200000-0000-0000-0000-000000000001'),
  ('c3300000-0000-0000-0000-000000000002', 'Gap Squad Leader', 10, 'c3100000-0000-0000-0000-000000000001', 'c3200000-0000-0000-0000-000000000002'),
  ('c3300000-0000-0000-0000-000000000003', 'Gap Cadet', 0, 'c3100000-0000-0000-0000-000000000001', NULL),
  ('c3300000-0000-0000-0000-000000000004', 'Gap Submitter', 10, 'c3100000-0000-0000-0000-000000000001', 'c3200000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level,
  approval_group_id = EXCLUDED.approval_group_id;

INSERT INTO auth.users (id, email) VALUES
  ('c3400000-0000-0000-0000-000000000001', 'gap-command@test.com'),
  ('c3400000-0000-0000-0000-000000000002', 'gap-squad@test.com'),
  ('c3400000-0000-0000-0000-000000000003', 'gap-cadet@test.com'),
  ('c3400000-0000-0000-0000-000000000004', 'gap-submitter@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('c3400000-0000-0000-0000-000000000001', 'Cmd', 'Gap', 'c3300000-0000-0000-0000-000000000001', 'c3100000-0000-0000-0000-000000000001'),
  ('c3400000-0000-0000-0000-000000000002', 'Squad', 'Gap', 'c3300000-0000-0000-0000-000000000002', 'c3100000-0000-0000-0000-000000000001'),
  ('c3400000-0000-0000-0000-000000000003', 'Cadet', 'Gap', 'c3300000-0000-0000-0000-000000000003', 'c3100000-0000-0000-0000-000000000001'),
  ('c3400000-0000-0000-0000-000000000004', 'Sub', 'Gap', 'c3300000-0000-0000-0000-000000000004', 'c3100000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'c3400000-0000-0000-0000-000000000001',
  'c3400000-0000-0000-0000-000000000002',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004'
);
DELETE FROM public.staff_profiles WHERE profile_id IN (
  'c3400000-0000-0000-0000-000000000001',
  'c3400000-0000-0000-0000-000000000002',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004'
);

UPDATE public.profiles SET role_id = 'c3300000-0000-0000-0000-000000000001' WHERE id = 'c3400000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'c3300000-0000-0000-0000-000000000002' WHERE id = 'c3400000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'c3300000-0000-0000-0000-000000000003' WHERE id = 'c3400000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'c3300000-0000-0000-0000-000000000004' WHERE id = 'c3400000-0000-0000-0000-000000000004';

SELECT public.ensure_staff_profile('c3400000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('c3400000-0000-0000-0000-000000000003');
SELECT public.ensure_cadet_profile('c3400000-0000-0000-0000-000000000004');

INSERT INTO public.cadet_oversight_assignments (cadet_id, staff_id, assignment_type, source, is_active)
VALUES ('c3400000-0000-0000-0000-000000000003', 'c3400000-0000-0000-0000-000000000002', 'teacher', 'manual', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES ('c3600000-0000-0000-0000-000000000001', 'Gap Offense', 1, 3, 'Test', 'GAP1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.profiles
WHERE id IN (
  'c3400000-0000-0000-0000-000000000001',
  'c3400000-0000-0000-0000-000000000002',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004'
)
ON CONFLICT (user_id) DO NOTHING;

UPDATE public.user_preferences
SET in_app_status_change = 'immediate', in_app_tour_change = 'immediate', in_app_conduct_change = 'immediate'
WHERE user_id IN (
  'c3400000-0000-0000-0000-000000000001',
  'c3400000-0000-0000-0000-000000000002',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004'
);

DELETE FROM public.user_notifications WHERE user_id IN (
  'c3400000-0000-0000-0000-000000000002', 'c3400000-0000-0000-0000-000000000003', 'c3400000-0000-0000-0000-000000000004'
);
DELETE FROM public.approval_log WHERE report_id IN (
  'c3700000-0000-0000-0000-000000000001', 'c3700000-0000-0000-0000-000000000002', 'c3700000-0000-0000-0000-000000000003'
);
DELETE FROM public.demerit_reports WHERE id IN (
  'c3700000-0000-0000-0000-000000000001', 'c3700000-0000-0000-0000-000000000002', 'c3700000-0000-0000-0000-000000000003'
);
DELETE FROM public.appeals WHERE id = 'c3800000-0000-0000-0000-000000000001';

-- Final approve notification (approval_log trigger)
RESET ROLE;
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status,
  current_approver_group_id, date_of_offense
) VALUES (
  'c3700000-0000-0000-0000-000000000001',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004',
  'c3600000-0000-0000-0000-000000000001', 3, 'completed', NULL, CURRENT_DATE
);

INSERT INTO public.approval_log (report_id, actor_id, action, comment)
VALUES ('c3700000-0000-0000-0000-000000000001', 'c3400000-0000-0000-0000-000000000001', 'approved', 'final ok');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'c3400000-0000-0000-0000-000000000004'
      AND event_type = 'report.final_approved'
  ),
  'notify_on_report_status_change → report.final_approved reaches submitter'
);

-- Kickback notification (approval_log trigger)
RESET ROLE;
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status,
  current_approver_group_id, date_of_offense
) VALUES (
  'c3700000-0000-0000-0000-000000000002',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004',
  'c3600000-0000-0000-0000-000000000001', 3, 'needs_revision', NULL, CURRENT_DATE
);

INSERT INTO public.approval_log (report_id, actor_id, action, comment)
VALUES ('c3700000-0000-0000-0000-000000000002', 'c3400000-0000-0000-0000-000000000002', 'Kicked Back for Revision', 'Need more detail');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'c3400000-0000-0000-0000-000000000004'
      AND event_type = 'report.kickback'
      AND body LIKE '%Need more detail%'
  ),
  'notify_on_report_status_change → report.kickback includes reason'
);

-- Appeal notification (appeal status trigger)
RESET ROLE;
INSERT INTO public.demerit_reports (
  id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense, posted_at
) VALUES (
  'c3700000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000003',
  'c3400000-0000-0000-0000-000000000004',
  'c3600000-0000-0000-0000-000000000001', 3, 'completed', CURRENT_DATE, now()
);

INSERT INTO public.appeals (id, report_id, appealing_cadet_id, status, justification)
VALUES ('c3800000-0000-0000-0000-000000000001', 'c3700000-0000-0000-0000-000000000003', 'c3400000-0000-0000-0000-000000000003', 'pending_commandant', 'unfair');

UPDATE public.appeals
SET status = 'approved', final_comment = 'Granted'
WHERE id = 'c3800000-0000-0000-0000-000000000001';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'c3400000-0000-0000-0000-000000000003'
      AND event_type = 'appeal.final_approved'
  ),
  'notify_on_appeal_status_change → appeal.final_approved reaches cadet'
);

-- Tour removed (N -> 0)
RESET ROLE;
UPDATE public.cadet_profiles SET cached_tour_balance = 2 WHERE profile_id = 'c3400000-0000-0000-0000-000000000003';
UPDATE public.cadet_profiles SET cached_tour_balance = 0 WHERE profile_id = 'c3400000-0000-0000-0000-000000000003';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'c3400000-0000-0000-0000-000000000003'
      AND event_type = 'tour.removed'
  ),
  'notify_on_tour_balance_change → tour.removed when balance goes to zero'
);

-- Probation / conduct change
RESET ROLE;
UPDATE public.cadet_profiles SET probation_status = 'Academic', conduct_status = 'Level 1'
WHERE profile_id = 'c3400000-0000-0000-0000-000000000003';
UPDATE public.cadet_profiles SET probation_status = 'None'
WHERE profile_id = 'c3400000-0000-0000-0000-000000000003';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'c3400000-0000-0000-0000-000000000003'
      AND event_type = 'probation.changed'
  ),
  'notify_on_conduct_change → probation.changed on probation status update'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
