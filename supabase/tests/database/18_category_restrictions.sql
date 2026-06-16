BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(13);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name)
VALUES ('e5000000-0000-0000-0000-000000000001', 'Day05 Test Company')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.approval_groups (id, group_name, next_approver_group_id, company_id)
VALUES
  ('e5100000-0000-0000-0000-000000000001', 'Day05 Command', NULL, 'e5000000-0000-0000-0000-000000000001'),
  ('e5100000-0000-0000-0000-000000000002', 'Day05 Platoon', 'e5100000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001'),
  ('e5100000-0000-0000-0000-000000000003', 'Day05 TAC', NULL, 'e5000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE
SET group_name = EXCLUDED.group_name,
    next_approver_group_id = EXCLUDED.next_approver_group_id;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id)
VALUES
  ('e5200000-0000-0000-0000-000000000001', 'Day05 Commandant', 90, 'e5000000-0000-0000-0000-000000000001', 'e5100000-0000-0000-0000-000000000001'),
  ('e5200000-0000-0000-0000-000000000002', 'Day05 Platoon Leader', 20, 'e5000000-0000-0000-0000-000000000001', 'e5100000-0000-0000-0000-000000000002'),
  ('e5200000-0000-0000-0000-000000000003', 'Day05 TAC', 65, 'e5000000-0000-0000-0000-000000000001', 'e5100000-0000-0000-0000-000000000003'),
  ('e5200000-0000-0000-0000-000000000004', 'Day05 Cadet', 0, 'e5000000-0000-0000-0000-000000000001', NULL)
ON CONFLICT (id) DO UPDATE
SET role_name = EXCLUDED.role_name,
    default_role_level = EXCLUDED.default_role_level,
    approval_group_id = EXCLUDED.approval_group_id;

INSERT INTO auth.users (id, email)
VALUES
  ('e5300000-0000-0000-0000-000000000001', 'day05-command@test.email'),
  ('e5300000-0000-0000-0000-000000000002', 'day05-platoon@test.email'),
  ('e5300000-0000-0000-0000-000000000003', 'day05-tac@test.email'),
  ('e5300000-0000-0000-0000-000000000004', 'day05-cadet@test.email')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('e5300000-0000-0000-0000-000000000001', 'Day05', 'Commandant', 'e5200000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001', false),
  ('e5300000-0000-0000-0000-000000000002', 'Day05', 'Platoon', 'e5200000-0000-0000-0000-000000000002', 'e5000000-0000-0000-0000-000000000001', false),
  ('e5300000-0000-0000-0000-000000000003', 'Day05', 'TAC', 'e5200000-0000-0000-0000-000000000003', 'e5000000-0000-0000-0000-000000000001', false),
  ('e5300000-0000-0000-0000-000000000004', 'Day05', 'Cadet', 'e5200000-0000-0000-0000-000000000004', 'e5000000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE
SET role_id = EXCLUDED.role_id,
    archived = EXCLUDED.archived;

SELECT public.ensure_staff_profile('e5300000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('e5300000-0000-0000-0000-000000000003');
SELECT public.ensure_cadet_profile('e5300000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('e5300000-0000-0000-0000-000000000004');

INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES
  ('e5400000-0000-0000-0000-000000000001', 'Day05 Category I', 1, 3, 'Test', 'D05-1'),
  ('e5400000-0000-0000-0000-000000000002', 'Day05 Category II', 2, 6, 'Test', 'D05-2'),
  ('e5400000-0000-0000-0000-000000000003', 'Day05 Category III', 3, 15, 'Test', 'D05-3')
ON CONFLICT (id) DO UPDATE
SET policy_category = EXCLUDED.policy_category,
    demerits = EXCLUDED.demerits;

DELETE FROM public.user_notifications
WHERE user_id = 'e5300000-0000-0000-0000-000000000004';

DELETE FROM public.approval_log
WHERE report_id IN (
  'e5500000-0000-0000-0000-000000000001',
  'e5500000-0000-0000-0000-000000000002',
  'e5500000-0000-0000-0000-000000000003'
);

DELETE FROM public.demerit_reports
WHERE id IN (
  'e5500000-0000-0000-0000-000000000001',
  'e5500000-0000-0000-0000-000000000002',
  'e5500000-0000-0000-0000-000000000003'
);

DELETE FROM public.category_restriction_policy_log
WHERE actor_id = 'e5300000-0000-0000-0000-000000000001';

-- 1) Default policy resolves Category I for platoon band
SELECT is(
  public.get_allowed_policy_categories(20),
  ARRAY[1],
  'Role level 20 resolves to Category I only'
);

-- 2) Default policy resolves Category I-III for TAC band
SELECT is(
  public.get_allowed_policy_categories(65),
  ARRAY[1, 2, 3],
  'Role level 65 resolves to Category I through III'
);

-- 3) Warning category is always allowed
SELECT ok(
  public.is_policy_category_allowed(0, 20),
  'Warnings bypass category restrictions'
);

-- 4) Category III blocked for platoon leader
SELECT ok(
  NOT public.is_policy_category_allowed(3, 20),
  'Platoon leader cannot submit Category III under default policy'
);

-- 5) Category III allowed for TAC
SELECT ok(
  public.is_policy_category_allowed(3, 65),
  'Company TAC can submit Category III under default policy'
);

-- 6) Platoon leader blocked on direct INSERT (API bypass)
SELECT public.mock_auth('e5300000-0000-0000-0000-000000000002');
PREPARE day05_platoon_cat3_insert AS
  INSERT INTO public.demerit_reports (
    subject_cadet_id,
    submitted_by,
    offense_type_id,
    demerits_effective,
    status,
    date_of_offense,
    notes
  ) VALUES (
    'e5300000-0000-0000-0000-000000000004',
    'e5300000-0000-0000-0000-000000000002',
    'e5400000-0000-0000-0000-000000000003',
    15,
    'pending_approval',
    CURRENT_DATE,
    'Blocked Category III attempt'
  );
SELECT throws_ok(
  'day05_platoon_cat3_insert',
  'Category III Demerit Reports require Company TAC authority.',
  'Platoon leader direct INSERT with Category III is blocked'
);

-- 7) Blocked insert does not emit notifications
SELECT is(
  (SELECT count(*)::int FROM public.user_notifications
    WHERE user_id = 'e5300000-0000-0000-0000-000000000004'
      AND event_type = 'report.submitted'),
  0,
  'Blocked Category III insert emits no report.submitted notification'
);

-- 8) TAC can INSERT Category III report
SELECT public.mock_auth('e5300000-0000-0000-0000-000000000003');
PREPARE day05_tac_cat3_insert AS
  INSERT INTO public.demerit_reports (
    id,
    subject_cadet_id,
    submitted_by,
    offense_type_id,
    demerits_effective,
    status,
    date_of_offense,
    notes
  ) VALUES (
    'e5500000-0000-0000-0000-000000000001',
    'e5300000-0000-0000-0000-000000000004',
    'e5300000-0000-0000-0000-000000000003',
    'e5400000-0000-0000-0000-000000000003',
    15,
    'pending_approval',
    CURRENT_DATE,
    'Allowed Category III report'
  );
SELECT lives_ok('day05_tac_cat3_insert', 'Company TAC can insert Category III report');

-- 9) Platoon leader blocked on resubmit offense change to Category III
RESET ROLE;
INSERT INTO public.demerit_reports (
  id,
  subject_cadet_id,
  submitted_by,
  offense_type_id,
  demerits_effective,
  status,
  date_of_offense,
  notes
) VALUES (
  'e5500000-0000-0000-0000-000000000002',
  'e5300000-0000-0000-0000-000000000004',
  'e5300000-0000-0000-0000-000000000002',
  'e5400000-0000-0000-0000-000000000001',
  3,
  'needs_revision',
  CURRENT_DATE,
  'Resubmit restriction test'
);

SELECT public.mock_auth('e5300000-0000-0000-0000-000000000002');
PREPARE day05_platoon_cat3_update AS
  UPDATE public.demerit_reports
  SET offense_type_id = 'e5400000-0000-0000-0000-000000000003',
      demerits_effective = 15
  WHERE id = 'e5500000-0000-0000-0000-000000000002';
SELECT throws_ok(
  'day05_platoon_cat3_update',
  'Category III Demerit Reports require Company TAC authority.',
  'Platoon leader UPDATE to Category III is blocked'
);

-- 10) Admin policy update writes audit log and takes effect immediately
SELECT public.mock_auth('e5300000-0000-0000-0000-000000000001');
PREPARE day05_update_policy AS
  SELECT public.update_category_restriction_policy(
    jsonb_build_array(
      jsonb_build_object('min_role_level', 20, 'allowed_categories', jsonb_build_array(1, 2)),
      jsonb_build_object('min_role_level', 65, 'allowed_categories', jsonb_build_array(1, 2, 3))
    )
  );
SELECT lives_ok('day05_update_policy', 'Admin can update category restriction policy');

SELECT ok(
  EXISTS (
    SELECT 1
    FROM public.category_restriction_policy_log
    WHERE actor_id = 'e5300000-0000-0000-0000-000000000001'
  ),
  'Policy update creates audit log entry'
);

SELECT is(
  public.get_allowed_policy_categories(20),
  ARRAY[1, 2],
  'Updated policy allows Category II at role level 20 immediately'
);

-- 11) Platoon leader can now submit Category II under updated policy
SELECT public.mock_auth('e5300000-0000-0000-0000-000000000002');
PREPARE day05_platoon_cat2_insert AS
  INSERT INTO public.demerit_reports (
    id,
    subject_cadet_id,
    submitted_by,
    offense_type_id,
    demerits_effective,
    status,
    date_of_offense,
    notes
  ) VALUES (
    'e5500000-0000-0000-0000-000000000003',
    'e5300000-0000-0000-0000-000000000004',
    'e5300000-0000-0000-0000-000000000002',
    'e5400000-0000-0000-0000-000000000002',
    6,
    'pending_approval',
    CURRENT_DATE,
    'Allowed Category II after policy change'
  );
SELECT lives_ok('day05_platoon_cat2_insert', 'Platoon leader can submit Category II after policy update');

SELECT * FROM finish();
ROLLBACK;
