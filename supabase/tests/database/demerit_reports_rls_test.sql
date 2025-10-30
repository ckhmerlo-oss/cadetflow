-- Demerit Reports RLS Test: supabase/tests/database/demerit_reports_rls_test.sql

BEGIN;
SELECT plan(4); -- Expecting 4 main tests

-- Define user UUIDs for clarity
\set submitter_id '11111111-1111-1111-1111-111111111111'
\set subject_id   '22222222-2222-2222-2222-222222222222'
\set approver_id  '33333333-3333-3333-3333-333333333333'
\set random_id    '44444444-4444-4444-4444-444444444444'
\set group_id     '55555555-5555-5555-5555-555555555555'
\set report_id    '66666666-6666-6666-6666-666666666666'

-- 1. Setup: Insert all necessary data as postgres
SELECT set_config('role', 'postgres', true);

-- Create Users in Auth and Profiles
INSERT INTO auth.users (id, email) VALUES (:'submitter_id', 'submitter@test.com'), (:'subject_id', 'subject@test.com'), (:'approver_id', 'approver@test.com'), (:'random_id', 'random@test.com');
INSERT INTO public.profiles (id, full_name) VALUES (:'submitter_id', 'Cadet Submitter'), (:'subject_id', 'Cadet Subject'), (:'approver_id', 'Cadet Approver'), (:'random_id', 'Cadet Random');

-- Create Group and assign Approver
INSERT INTO public.approval_groups (id, group_name) VALUES (:'group_id', 'Test Approval Group');
INSERT INTO public.group_members (group_id, user_id) VALUES (:'group_id', :'approver_id');

-- Create the single report (Submitted by Submitter, about Subject, assigned to Group)
INSERT INTO public.demerit_reports (id, title, submitted_by, subject_cadet_id, current_approver_group_id)
VALUES (:'report_id', 'Test Report for RLS', :'submitter_id', :'subject_id', :'group_id');

-- LOG: Print the details of the created report
SELECT diag('--- Full Test Data Setup ---');
SELECT diag(format('Report ID: %s | Submitter: %s | Subject: %s | Approver Group: %s (Member: %s)', 
    :'report_id', :'submitter_id', :'subject_id', :'group_id', :'approver_id'));
    
-- Set the session role to 'authenticated' which is the context for RLS policies
SELECT set_config('role', 'authenticated', true);

---

-- Test 1: Submitter Access (Should PASS: 1 row)
-- Set JWT claim for the Submitter
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'submitter_id'), true);
SELECT diag(format(E'\n--- START TEST 1: Submitter (%s) ---', (SELECT auth.uid())::text));

-- LOG: What the Submitter sees (Query must be run here, after setting JWT)
SELECT diag(format('  [DEBUG] Submitter Sees: %s', array_agg(title)::text))
FROM public.demerit_reports WHERE id = :'report_id';

SELECT results_eq(
    format('SELECT count(*)::int FROM public.demerit_reports WHERE id = ''%s''', :'report_id'),
    ARRAY[1],
    'PASS: Submitter should see their own report.'
);

---

-- Test 2: Subject Access (Should PASS: 1 row)
-- Set JWT claim for the Subject
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'subject_id'), true);
SELECT diag(format(E'\n--- START TEST 2: Subject (%s) ---', (SELECT auth.uid())::text));

-- LOG: What the Subject sees
SELECT diag(format('  [DEBUG] Subject Sees: %s', array_agg(title)::text))
FROM public.demerit_reports WHERE id = :'report_id';

SELECT results_eq(
    format('SELECT count(*)::int FROM public.demerit_reports WHERE id = ''%s''', :'report_id'),
    ARRAY[1],
    'PASS: Subject should see the report about them.'
);

---

-- Test 3: Approver Access (Should PASS: 1 row)
-- Set JWT claim for the Approver
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'approver_id'), true);
SELECT diag(format(E'\n--- START TEST 3: Approver (%s) ---', (SELECT auth.uid())::text));

-- LOG: What the Approver sees
SELECT diag(format('  [DEBUG] Approver Sees: %s', array_agg(title)::text))
FROM public.demerit_reports WHERE id = :'report_id';

SELECT results_eq(
    format('SELECT count(*)::int FROM public.demerit_reports WHERE id = ''%s''', :'report_id'),
    ARRAY[1],
    'PASS: Approver should see the report assigned to their group.'
);

---

-- Test 4: Random User Access (Should PASS: 0 rows)
-- Set JWT claim for the Random User
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'random_id'), true);
SELECT diag(format(E'\n--- START TEST 4: Random User (%s) ---', (SELECT auth.uid())::text));

-- LOG: What the Random User sees
SELECT diag(format('  [DEBUG] Random User Sees: %s', array_agg(title)::text))
FROM public.demerit_reports WHERE id = :'report_id';

SELECT results_eq(
    format('SELECT count(*)::int FROM public.demerit_reports WHERE id = ''%s''', :'report_id'),
    ARRAY[0],
    'PASS: Random user should NOT see the report.'
);

---

SELECT * FROM finish();
ROLLBACK;

