BEGIN;
SELECT plan(1);

-- Create mock users
INSERT INTO auth.users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'cadet_a@test.com');
INSERT INTO public.profiles (id, full_name) VALUES ('11111111-1111-1111-1111-111111111111', 'Cadet A');
INSERT INTO auth.users (id, email) VALUES ('22222222-2222-2222-2222-222222222222', 'cadet_b@test.com');
INSERT INTO public.profiles (id, full_name) VALUES ('22222222-2222-2222-2222-222222222222', 'Cadet B');

-- Create a mock group (using 'group_name')
INSERT INTO public.approval_groups (id, group_name) VALUES ('33333333-3333-3333-3333-333333333333', 'Test Group');

-- Add Cadet B (Approver) to the approval group
INSERT INTO public.group_members (group_id, user_id) 
VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222');

-- "Log in" as Cadet A (Submitter)
SELECT set_config('request.jwt.claims', '{"role":"authenticated", "sub":"11111111-1111-1111-1111-111111111111"}', true);

-- Create a report (adding 'subject_cadet_id' and 'date_of_offense')
INSERT INTO public.demerit_reports (id, title, submitted_by, current_approver_group_id, subject_cadet_id, date_of_offense) 
VALUES (
    '44444444-4444-4444-4444-444444444444', 
    'Test Report', 
    '11111111-1111-1111-1111-111111111111', 
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111', -- Cadet A is the subject
    now()::date -- *** FIX: Added date_of_offense ***
);

-- "Log in" as Cadet B (the Approver)
SELECT set_config('request.jwt.claims', '{"role":"authenticated", "sub":"22222222-2222-2222-2222-222222222222"}', true);

-- Test 1: Cadet B (the approver) *should* see the report
SELECT results_eq(
  'SELECT count(*)::int FROM public.demerit_reports WHERE title = ''Test Report''',
  ARRAY[1],
  'PASS: Approver should see a report in their group.'
);

SELECT * FROM finish();
ROLLBACK;