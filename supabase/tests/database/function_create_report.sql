BEGIN;
SELECT plan(3); -- We will check 3 things

-- Setup:
-- 1. Create a Submitter (Cadet A)
INSERT INTO auth.users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'cadet_a@test.com');
INSERT INTO public.profiles (id, full_name) VALUES ('11111111-1111-1111-1111-111111111111', 'Cadet A');

-- 2. Create a Subject (Cadet B)
INSERT INTO auth.users (id, email) VALUES ('22222222-2222-2222-2222-222222222222', 'cadet_b@test.com');
INSERT INTO public.profiles (id, full_name) VALUES ('22222222-2222-2222-2222-222222222222', 'Cadet B');

-- 3. Create a Supervisor Group
INSERT INTO public.approval_groups (id, group_name) VALUES ('33333333-3333-3333-3333-333333333333', 'Supervisor Group');

-- 4. Link the Submitter to the Supervisor Group
UPDATE public.profiles
SET supervisor_group_id = '33333333-3333-3333-3333-333333333333'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Action: "Log in" as Cadet A and call the function
SELECT set_config('request.jwt.claims', '{"role":"authenticated", "sub":"11111111-1111-1111-1111-111111111111"}', true);

SELECT public.create_new_report(
  'Test Function Report',
  '22222222-2222-2222-2222-222222222222',
  '{"details":"This is a test"}'
);

-- Test 1: Check that the report was created
SELECT results_eq(
  'SELECT count(*)::int FROM public.demerit_reports WHERE title = ''Test Function Report''',
  ARRAY[1],
  'PASS: The report was created.'
);

-- Test 2: Check that it was assigned to the *correct* supervisor group
SELECT results_eq(
  'SELECT current_approver_group_id FROM public.demerit_reports WHERE title = ''Test Function Report''',
  ARRAY['33333333-3333-3333-3333-333333333333'::uuid],
  'PASS: Report was assigned to the submitter''s supervisor group.'
);

-- Test 3: Check that the "submitted" action was logged
SELECT results_eq(
  'SELECT action FROM public.approval_log',
  ARRAY['submitted'],
  'PASS: The "submitted" action was logged.'
);

SELECT * FROM finish();
ROLLBACK;