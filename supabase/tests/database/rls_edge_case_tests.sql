BEGIN;
SELECT plan(3);

-- Define User and Group IDs (FIXED: All characters are now valid hexadecimal 0-9, a-f)
\set submitter_id 'a9999999-9999-9999-9999-00000000000a'
\set subject_id   'f9999999-9999-9999-9999-00000000000f'
\set random_id    'b9999999-9999-9999-9999-00000000000b'
\set group_id     '19999999-9999-9999-9999-000000000001'
\set report_id    'd9999999-9999-9999-9999-00000000000d'

-- 1. SETUP: Create data
SELECT set_config('role', 'postgres', true);
INSERT INTO auth.users (id, email) VALUES (:'submitter_id', 'submitter@edge.com'), (:'subject_id', 'subject@edge.com'), (:'random_id', 'random@edge.com');
INSERT INTO public.profiles (id, full_name, role_level) VALUES (:'submitter_id', 'Submitter', 10), (:'subject_id', 'Subject', 0), (:'random_id', 'Random', 0);
INSERT INTO public.approval_groups (id, group_name) VALUES (:'group_id', 'Test Group');

-- Create Report
INSERT INTO public.demerit_reports (id, title, submitted_by, subject_cadet_id, current_approver_group_id, date_of_offense)
VALUES (:'report_id', 'Edge Case Report', :'submitter_id', :'subject_id', :'group_id', now()::date); -- *** FIX: Added date_of_offense ***
SELECT set_config('role', 'authenticated', true);

-- Test 1: Critical Security Check - Anonymous Function Call
SELECT diag(E'\n--- Test 1: Anonymous Access (HIGH SECURITY RISK) ---');
-- This test checks if the anon user can even call the function, which is allowed by your grants!
SELECT set_config('request.jwt.claims', '{}', true); -- Anonymous
SELECT throws_ok(
    format(
        $$ SELECT public.create_new_report('Anon Report', '%s', '{"category":"Test", "demerit_count": 1, "notes":"Test"}'::jsonb, now()::date) $$, -- *** FIX: Added date ***
        :'subject_id'
    ),
    'Cannot submit: You are not assigned to a group.',
    'PASS (Security): Anonymous user fails to create report because auth.uid() is NULL.'
);

-- Test 2: RLS Check - Subject Can View
SELECT diag(E'\n--- Test 2: Subject View Access Check ---');
-- Log in as the Subject
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'subject_id'), true);
SELECT results_eq(
    format('SELECT count(*)::int FROM public.demerit_reports WHERE id = ''%s''', :'report_id'),
    ARRAY[1],
    'PASS: Subject must be able to view report about them (missing RLS condition).'
);

-- Test 3: RLS Check - Random User Cannot View (Double Check)
SELECT diag(E'\n--- Test 3: Random User Access Check ---');
-- Log in as a Random User
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'random_id'), true);
SELECT results_eq(
    format('SELECT count(*)::int FROM public.demerit_reports WHERE id = ''%s''', :'report_id'),
    ARRAY[0],
    'PASS: Random user must NOT see the report.'
);

SELECT * FROM finish();
ROLLBACK;