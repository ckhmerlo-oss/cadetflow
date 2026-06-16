BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(9);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Companies
INSERT INTO public.companies (id, company_name)
VALUES ('f1000000-0000-0000-0000-000000000001', 'Day02 Alpha Company')
ON CONFLICT (company_name) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.approval_groups (id, group_name, company_id)
VALUES ('f2000000-0000-0000-0000-000000000001', 'Day02 Alpha Company TAC', 'f1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster)
VALUES
  ('f3000000-0000-0000-0000-000000000001', 'Test TAC Officer', 65, 'f1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000001', true),
  ('f3000000-0000-0000-0000-000000000002', 'Test Teacher', 50, NULL, NULL, false),
  ('f3000000-0000-0000-0000-000000000003', 'Test Cadet', 0, 'f1000000-0000-0000-0000-000000000001', NULL, false)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  approval_group_id = EXCLUDED.approval_group_id,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('f4000000-0000-0000-0000-000000000001', 'day02-tac@test.com'),
  ('f4000000-0000-0000-0000-000000000002', 'day02-teacher@test.com'),
  ('f4000000-0000-0000-0000-000000000003', 'day02-cadet@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('f4000000-0000-0000-0000-000000000001', 'TAC', 'Officer', 'f3000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001'),
  ('f4000000-0000-0000-0000-000000000002', 'Jane', 'Teacher', 'f3000000-0000-0000-0000-000000000002', NULL),
  ('f4000000-0000-0000-0000-000000000003', 'John', 'Cadet', 'f3000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_id = EXCLUDED.company_id;

-- Set role_id after company_id (trigger nulls role when company changes in same update)
UPDATE public.profiles SET role_id = 'f3000000-0000-0000-0000-000000000001' WHERE id = 'f4000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'f3000000-0000-0000-0000-000000000002' WHERE id = 'f4000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'f3000000-0000-0000-0000-000000000003' WHERE id = 'f4000000-0000-0000-0000-000000000003';

DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'f4000000-0000-0000-0000-000000000001',
  'f4000000-0000-0000-0000-000000000002',
  'f4000000-0000-0000-0000-000000000003'
);
DELETE FROM public.staff_profiles WHERE profile_id IN (
  'f4000000-0000-0000-0000-000000000001',
  'f4000000-0000-0000-0000-000000000002',
  'f4000000-0000-0000-0000-000000000003'
);

SELECT public.ensure_staff_profile('f4000000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('f4000000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('f4000000-0000-0000-0000-000000000003');

-- School year with Term 2 as current
DELETE FROM public.academic_terms WHERE school_year = '2099-2100';

INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('f5000000-0000-0000-0000-000000000001', 'Term 1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2099-2100', 1, false),
  ('f5000000-0000-0000-0000-000000000002', 'Term 2', CURRENT_DATE - 30, CURRENT_DATE + 30, '2099-2100', 2, false),
  ('f5000000-0000-0000-0000-000000000003', 'Term 3', CURRENT_DATE + 31, CURRENT_DATE + 60, '2099-2100', 3, false),
  ('f5000000-0000-0000-0000-000000000004', 'Term 4', CURRENT_DATE + 61, CURRENT_DATE + 90, '2099-2100', 4, false),
  ('f5000000-0000-0000-0000-000000000005', 'Term 5', CURRENT_DATE + 91, CURRENT_DATE + 120, '2099-2100', 5, false);

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, course_name)
VALUES
  ('f6000000-0000-0000-0000-000000000001', 'f4000000-0000-0000-0000-000000000002', '2099-2100', 2, 'Algebra II'),
  ('f6000000-0000-0000-0000-000000000003', 'f4000000-0000-0000-0000-000000000002', '2099-2100', 1, 'Geometry')
ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name, term_number = EXCLUDED.term_number;

INSERT INTO public.class_sections (id, teacher_id, school_year, seminar_period, course_name)
VALUES ('f6000000-0000-0000-0000-000000000002', 'f4000000-0000-0000-0000-000000000002', '2099-2100', 'a', 'Leadership Seminar')
ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;

-- Teacher adds cadet to Term 2 class
SELECT public.mock_auth('f4000000-0000-0000-0000-000000000002');
SELECT public.add_cadet_to_class_section('f6000000-0000-0000-0000-000000000001', 'f4000000-0000-0000-0000-000000000003');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
      AND staff_id = 'f4000000-0000-0000-0000-000000000002'
      AND assignment_type = 'teacher'
      AND is_active = true
  ),
  'Main-term teacher assigned from class enrollment'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
      AND staff_id = 'f4000000-0000-0000-0000-000000000001'
      AND assignment_type = 'tac'
      AND is_active = true
  ),
  'TAC assigned from company mapping'
);

-- Seminar enrollment
SELECT public.add_cadet_to_class_section('f6000000-0000-0000-0000-000000000002', 'f4000000-0000-0000-0000-000000000003');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
      AND assignment_type = 'secondary'
      AND is_active = true
  ),
  'Seminar teacher assigned as secondary'
);

-- Self-remove secondary
SELECT public.self_remove_secondary_assignment(
  (SELECT id FROM public.cadet_oversight_assignments
   WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
     AND assignment_type = 'secondary'
     AND is_active = true
   LIMIT 1)
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
      AND assignment_type = 'secondary'
      AND is_active = true
  ),
  'Seminar teacher can self-remove secondary assignment'
);

-- Voluntary faculty
SELECT public.add_manual_oversight('f4000000-0000-0000-0000-000000000003', 'f4000000-0000-0000-0000-000000000002');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
      AND assignment_type = 'faculty'
      AND source = 'manual'
      AND is_active = true
  ),
  'Faculty voluntary assignment works'
);

RESET ROLE;

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.oversight_assignment_events
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
  ),
  'Oversight events emitted'
);

-- TAC schedule slot
SELECT public.mock_auth('f4000000-0000-0000-0000-000000000001');
SELECT public.set_cadet_schedule_slot('f4000000-0000-0000-0000-000000000003', 'term_1', 'f6000000-0000-0000-0000-000000000003');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_class_enrollments
    WHERE cadet_id = 'f4000000-0000-0000-0000-000000000003'
      AND slot_type = 'term_1'
      AND archived = false
  ),
  'TAC can set cadet schedule slot'
);

SELECT public.mock_auth('f4000000-0000-0000-0000-000000000003');
SELECT throws_ok(
  $$SELECT public.add_manual_oversight('f4000000-0000-0000-0000-000000000003', 'f4000000-0000-0000-0000-000000000003')$$,
  'Permission denied',
  'Cadet cannot self-assign as faculty'
);

SELECT public.mock_auth('f4000000-0000-0000-0000-000000000002');
SELECT ok(
  (SELECT count(*) FROM public.get_my_oversight_cadets()) >= 1,
  'Teacher sees cadets under oversight'
);

SELECT * FROM finish();
COMMIT;
