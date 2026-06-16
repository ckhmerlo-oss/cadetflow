BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Avoid cross-test term collisions from other Day 02 tests
DELETE FROM public.academic_terms WHERE school_year IN ('2099-2100', '2100-2101');

INSERT INTO public.companies (id, company_name)
VALUES ('d1000000-0000-0000-0000-000000000001', 'Signoff Company')
ON CONFLICT (company_name) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.approval_groups (id, group_name, company_id)
VALUES ('d1500000-0000-0000-0000-000000000001', 'Signoff Company TAC', 'd1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id, can_manage_own_company_roster)
VALUES
  ('d2000000-0000-0000-0000-000000000001', 'Signoff Teacher', 50, NULL, NULL, false),
  ('d2000000-0000-0000-0000-000000000002', 'Signoff Cadet', 0, 'd1000000-0000-0000-0000-000000000001', NULL, false),
  ('d2000000-0000-0000-0000-000000000003', 'Signoff TAC', 65, 'd1000000-0000-0000-0000-000000000001', 'd1500000-0000-0000-0000-000000000001', true),
  ('d2000000-0000-0000-0000-000000000099', 'Signoff Admin', 90, NULL, NULL, true)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  approval_group_id = EXCLUDED.approval_group_id,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d3000000-0000-0000-0000-000000000001', 'signoff-teacher@test.com'),
  ('d3000000-0000-0000-0000-000000000002', 'signoff-cadet@test.com'),
  ('d3000000-0000-0000-0000-000000000003', 'signoff-tac@test.com'),
  ('d3000000-0000-0000-0000-000000000099', 'signoff-admin@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, is_site_admin)
VALUES
  ('d3000000-0000-0000-0000-000000000001', 'Signoff', 'Teacher', 'd2000000-0000-0000-0000-000000000001', NULL, false),
  ('d3000000-0000-0000-0000-000000000002', 'Signoff', 'Cadet', 'd2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', false),
  ('d3000000-0000-0000-0000-000000000003', 'Signoff', 'TAC', 'd2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', false),
  ('d3000000-0000-0000-0000-000000000099', 'Signoff', 'Admin', 'd2000000-0000-0000-0000-000000000099', NULL, true)
ON CONFLICT (id) DO UPDATE SET company_id = EXCLUDED.company_id, is_site_admin = EXCLUDED.is_site_admin;

UPDATE public.profiles SET role_id = 'd2000000-0000-0000-0000-000000000001' WHERE id = 'd3000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'd2000000-0000-0000-0000-000000000002' WHERE id = 'd3000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'd2000000-0000-0000-0000-000000000003' WHERE id = 'd3000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'd2000000-0000-0000-0000-000000000099' WHERE id = 'd3000000-0000-0000-0000-000000000099';

SELECT public.ensure_staff_profile('d3000000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('d3000000-0000-0000-0000-000000000003');
SELECT public.ensure_cadet_profile('d3000000-0000-0000-0000-000000000002');

DELETE FROM public.academic_terms WHERE school_year = '2088-2089';

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('Term 1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2088-2089', 1, false),
  ('Term 2', CURRENT_DATE - 30, CURRENT_DATE + 30, '2088-2089', 2, false),
  ('Term 3', CURRENT_DATE + 31, CURRENT_DATE + 60, '2088-2089', 3, false),
  ('Term 4', CURRENT_DATE + 61, CURRENT_DATE + 90, '2088-2089', 4, false),
  ('Term 5', CURRENT_DATE + 91, CURRENT_DATE + 120, '2088-2089', 5, false);

INSERT INTO public.class_sections (id, teacher_id, school_year, term_number, course_name)
VALUES
  ('d4000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', '2088-2089', 2, 'Current Term Class'),
  ('d4000000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000001', '2088-2089', 3, 'Future Term Class')
ON CONFLICT (id) DO UPDATE SET
  teacher_id = EXCLUDED.teacher_id,
  school_year = EXCLUDED.school_year,
  term_number = EXCLUDED.term_number,
  course_name = EXCLUDED.course_name,
  archived = false;

SELECT public.mock_auth('d3000000-0000-0000-0000-000000000001');
SELECT public.add_cadet_to_class_section('d4000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000002');
SELECT public.add_cadet_to_class_section('d4000000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000002');

RESET ROLE;

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'd3000000-0000-0000-0000-000000000002'
      AND assignment_type = 'teacher'
      AND is_active = true
      AND staff_id = 'd3000000-0000-0000-0000-000000000001'
  ),
  'Big-3 teacher follows current main-term enrollment'
);

SELECT ok(
  (SELECT slot_type FROM public.cadet_class_enrollments
   WHERE cadet_id = 'd3000000-0000-0000-0000-000000000002'
     AND archived = false
     AND class_section_id = 'd4000000-0000-0000-0000-000000000001') = 'term_2',
  'Teacher roster add writes term_2 enrollment slot'
);

SELECT public.mock_auth('d3000000-0000-0000-0000-000000000003');
SELECT public.set_cadet_schedule_slot('d3000000-0000-0000-0000-000000000002', 'term_3', 'd4000000-0000-0000-0000-000000000002');

RESET ROLE;

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_class_enrollments
    WHERE cadet_id = 'd3000000-0000-0000-0000-000000000002'
      AND slot_type = 'term_3'
      AND archived = false
  ),
  'TAC schedule edit updates same enrollment table'
);

SELECT ok(
  public.get_seminar_period((SELECT start_date + ((end_date - start_date) / 2) FROM public.academic_terms WHERE school_year = '2088-2089' AND term_number = 3)) = 'b',
  'Seminar period flips to B at Term 3 midpoint'
);

SELECT public.mock_auth('d3000000-0000-0000-0000-000000000099');
SELECT public.archive_school_year('2088-2089');

RESET ROLE;

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.cadet_class_enrollments
    WHERE school_year = '2088-2089' AND archived = false
  ),
  'Year archive clears active enrollments'
);

SELECT * FROM finish();
COMMIT;
