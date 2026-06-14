BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(15);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Test fixture IDs
-- Groups
-- 300...001 -> Command
-- 300...002 -> Platoon
-- 300...003 -> Squad
-- Roles
-- 400...001 -> Commandant
-- 400...002 -> Platoon Leader
-- 400...003 -> Squad Leader
-- 400...004 -> Cadet
-- Users
-- 500...001 -> Commandant user
-- 500...002 -> Platoon user
-- 500...003 -> Squad user
-- 500...004 -> Cadet user

INSERT INTO public.approval_groups (id, group_name, next_approver_group_id)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'Test Command', NULL),
  ('30000000-0000-0000-0000-000000000002', 'Test Platoon', '30000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000003', 'Test Squad', '30000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO UPDATE
SET group_name = EXCLUDED.group_name,
    next_approver_group_id = EXCLUDED.next_approver_group_id;

INSERT INTO public.roles (id, role_name, default_role_level, approval_group_id)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Test Commandant', 90, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'Test Platoon Leader', 20, '30000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000003', 'Test Squad Leader', 10, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000004', 'Test Cadet', 0, NULL)
ON CONFLICT (id) DO UPDATE
SET role_name = EXCLUDED.role_name,
    default_role_level = EXCLUDED.default_role_level,
    approval_group_id = EXCLUDED.approval_group_id;

INSERT INTO auth.users (id, email)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'rls-command@test.email'),
  ('50000000-0000-0000-0000-000000000002', 'rls-platoon@test.email'),
  ('50000000-0000-0000-0000-000000000003', 'rls-squad@test.email'),
  ('50000000-0000-0000-0000-000000000004', 'rls-cadet@test.email')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, is_site_admin)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'Test', 'Command', '40000000-0000-0000-0000-000000000001', false),
  ('50000000-0000-0000-0000-000000000002', 'Test', 'Platoon', '40000000-0000-0000-0000-000000000002', false),
  ('50000000-0000-0000-0000-000000000003', 'Test', 'Squad', '40000000-0000-0000-0000-000000000003', false),
  ('50000000-0000-0000-0000-000000000004', 'Test', 'Cadet', '40000000-0000-0000-0000-000000000004', false)
ON CONFLICT (id) DO UPDATE
SET role_id = EXCLUDED.role_id;

SELECT public.ensure_staff_profile('50000000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('50000000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('50000000-0000-0000-0000-000000000003');
SELECT public.ensure_cadet_profile('50000000-0000-0000-0000-000000000004');

INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES ('60000000-0000-0000-0000-000000000001', 'RLS Lifecycle Offense', 1, 3, 'Test', 'RLS1')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.approval_log
WHERE report_id IN (
  '70000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000002'
);

DELETE FROM public.demerit_reports
WHERE id IN (
  '70000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000002'
);

INSERT INTO public.demerit_reports (
  id,
  subject_cadet_id,
  submitted_by,
  offense_type_id,
  demerits_effective,
  status,
  current_approver_group_id,
  date_of_offense,
  notes
) VALUES (
  '70000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000004',
  '60000000-0000-0000-0000-000000000001',
  3,
  'pending_approval',
  '30000000-0000-0000-0000-000000000003',
  now(),
  'Lifecycle test report'
);

-- 1) Cadet cannot approve
SELECT public.mock_auth('50000000-0000-0000-0000-000000000004');
PREPARE t1_cadet_approve AS
  SELECT public.handle_approval('70000000-0000-0000-0000-000000000001', 'cadet attempt');
SELECT throws_ok(
  't1_cadet_approve',
  'Permission denied: This report may have been actioned by someone else.',
  'Cadet cannot approve a report'
);

-- 2) Wrong approver group cannot approve
SELECT public.mock_auth('50000000-0000-0000-0000-000000000002');
PREPARE t2_wrong_group_approve AS
  SELECT public.handle_approval('70000000-0000-0000-0000-000000000001', 'wrong group attempt');
SELECT throws_ok(
  't2_wrong_group_approve',
  'Permission denied: This report may have been actioned by someone else.',
  'Non-current approver group cannot approve'
);

-- 3) Current approver can approve and advance
SELECT public.mock_auth('50000000-0000-0000-0000-000000000003');
PREPARE t3_squad_approve AS
  SELECT public.handle_approval('70000000-0000-0000-0000-000000000001', 'approved by squad');
SELECT lives_ok('t3_squad_approve', 'Current approver can approve');
SELECT is(
  (SELECT current_approver_group_id::text FROM public.demerit_reports WHERE id = '70000000-0000-0000-0000-000000000001'),
  '30000000-0000-0000-0000-000000000002',
  'Approval moves report to next approver group'
);
SELECT is(
  (SELECT count(*)::int FROM public.approval_log WHERE report_id = '70000000-0000-0000-0000-000000000001' AND action = 'approved'),
  1,
  'Approval writes an audit log entry'
);

-- 4) Platoon kickback works and logs
SELECT public.mock_auth('50000000-0000-0000-0000-000000000002');
PREPARE t4_platoon_kickback AS
  SELECT public.handle_kickback('70000000-0000-0000-0000-000000000001', 'needs details');
SELECT lives_ok('t4_platoon_kickback', 'Current approver can kick back');
SELECT is(
  (SELECT status FROM public.demerit_reports WHERE id = '70000000-0000-0000-0000-000000000001'),
  'needs_revision',
  'Kickback transitions report to needs_revision'
);
SELECT is(
  (SELECT count(*)::int FROM public.approval_log WHERE report_id = '70000000-0000-0000-0000-000000000001' AND comment = 'needs details'),
  1,
  'Kickback writes an audit log entry'
);

-- 5) Reject from current approver works and clears queue ownership
UPDATE public.demerit_reports
SET status = 'pending_approval',
    current_approver_group_id = '30000000-0000-0000-0000-000000000002',
    revision_by_group_id = NULL
WHERE id = '70000000-0000-0000-0000-000000000001';

SELECT public.mock_auth('50000000-0000-0000-0000-000000000002');
PREPARE t5_platoon_reject AS
  SELECT public.handle_rejection('70000000-0000-0000-0000-000000000001', 'rejected');
SELECT lives_ok('t5_platoon_reject', 'Current approver can reject');
SELECT is(
  (SELECT status FROM public.demerit_reports WHERE id = '70000000-0000-0000-0000-000000000001'),
  'rejected',
  'Reject transitions report to rejected'
);
SELECT is(
  (SELECT current_approver_group_id::text FROM public.demerit_reports WHERE id = '70000000-0000-0000-0000-000000000001'),
  NULL,
  'Reject removes report from approval queue'
);

-- 6) Pull authorization checks (only submitter or role 90+)
RESET ROLE;
INSERT INTO public.demerit_reports (
  id,
  subject_cadet_id,
  submitted_by,
  offense_type_id,
  demerits_effective,
  status,
  current_approver_group_id,
  date_of_offense,
  notes
) VALUES (
  '70000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000004',
  '60000000-0000-0000-0000-000000000001',
  3,
  'pending_approval',
  '30000000-0000-0000-0000-000000000003',
  now(),
  'Pull test report'
);

SELECT public.mock_auth('50000000-0000-0000-0000-000000000003');
PREPARE t6_non_submitter_pull AS
  SELECT public.pull_report('70000000-0000-0000-0000-000000000002', 'no authority');
SELECT throws_ok(
  't6_non_submitter_pull',
  'Permission Denied: Only the original issuer or Commandant Staff/Admins can pull this report.',
  'Non-submitter non-command staff cannot pull'
);

SELECT public.mock_auth('50000000-0000-0000-0000-000000000004');
PREPARE t7_submitter_pull AS
  SELECT public.pull_report('70000000-0000-0000-0000-000000000002', 'issuer pull reason');
SELECT lives_ok('t7_submitter_pull', 'Submitter can pull own report');
SELECT is(
  (SELECT status FROM public.demerit_reports WHERE id = '70000000-0000-0000-0000-000000000002'),
  'pulled',
  'Pull transitions report to pulled'
);
SELECT is(
  (SELECT count(*)::int FROM public.approval_log WHERE report_id = '70000000-0000-0000-0000-000000000002' AND action = 'Pulled by Issuer'),
  1,
  'Pull writes an audit log entry'
);

SELECT * FROM finish();
ROLLBACK;
