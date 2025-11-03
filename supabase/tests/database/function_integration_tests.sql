BEGIN;
SELECT plan(12); -- Total number of assertions

-- Setup UUIDs for users and groups (use distinct IDs from your full_workflow_test.sql for safety)
-- NOTE: Variables are now defined on a single line to avoid syntax errors.
\set submitter_id 'a1111111-1111-1111-1111-00000000000a'
\set subject_id   'f1111111-1111-1111-1111-00000000000f'
\set peer_id      'e1111111-1111-1111-1111-00000000000e'
\set approver_id  'b1111111-1111-1111-1111-00000000000b'

\set group_A 'd1111111-1111-1111-1111-00000000000a'
\set group_B 'd1111111-1111-1111-1111-00000000000b'

-- 1. SETUP: Create a minimal environment
SELECT diag('--- SETUP: Creating Users and Groups ---');

-- Approval Chain: A -> B
INSERT INTO public.approval_groups (id, group_name, next_approver_group_id) VALUES (:'group_B', 'Group B (Final)', NULL);
INSERT INTO public.approval_groups (id, group_name, next_approver_group_id) VALUES (:'group_A', 'Group A (Submitter)', :'group_B');

-- Users
INSERT INTO auth.users (id, email) VALUES (:'submitter_id', 'submitter@func.com');
INSERT INTO public.profiles (id, full_name, role_level, group_id) VALUES (:'submitter_id', 'Submitter', 10, :'group_A');
INSERT INTO auth.users (id, email) VALUES (:'subject_id', 'subject@func.com');
INSERT INTO public.profiles (id, full_name, role_level, group_id) VALUES (:'subject_id', 'Subject', 0, :'group_A');
INSERT INTO auth.users (id, email) VALUES (:'peer_id', 'peer@func.com');
INSERT INTO public.profiles (id, full_name, role_level, group_id) VALUES (:'peer_id', 'Peer', 10, :'group_A');
INSERT INTO auth.users (id, email) VALUES (:'approver_id', 'approver@func.com');
INSERT INTO public.profiles (id, full_name, role_level, group_id) VALUES (:'approver_id', 'Approver', 20, :'group_B');

-- Approver Group Membership
INSERT INTO public.group_members (user_id, group_id) VALUES (:'approver_id', :'group_B');
SELECT diag('Setup complete.');

---

-- SECTION 1: Testing public.get_my_role_level() and is_member_of_approver_group()

SELECT diag(E'\n--- SECTION 1: Role and Membership Functions ---');

-- Test 1.1: get_my_role_level() for Submitter (Level 10)
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'submitter_id'), true);
SELECT results_eq(
    'SELECT public.get_my_role_level()',
    ARRAY[10],
    'PASS: get_my_role_level returns correct role level (10).'
);

-- Test 1.2: is_member_of_approver_group() for correct group (Group B)
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'approver_id'), true);
SELECT is(
    public.is_member_of_approver_group(:'group_B'),
    TRUE,
    'PASS: is_member_of_approver_group returns TRUE for current approver.'
);

-- Test 1.3: is_member_of_approver_group() for incorrect group (Group A)
SELECT is(
    public.is_member_of_approver_group(:'group_A'),
    FALSE,
    'PASS: is_member_of_approver_group returns FALSE for irrelevant group.'
);

---

-- SECTION 2: Testing public.create_new_report() (The Hierarchical Check)

SELECT diag(E'\n--- SECTION 2: Report Creation and Hierarchy Check ---');
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'submitter_id'), true); -- Log in as Submitter (Level 10)

-- Test 2.1: Should FAIL (Peer Report)
SELECT throws_ok(
    format(
        $$ SELECT public.create_new_report('Peer Report', '%s', '{"category":"Peer", "demerit_count": 1, "notes":"Test"}'::jsonb, now()::date) $$, -- *** FIX: Added date ***
        :'peer_id'
    ),
    'Permission denied: Cannot report on a peer or superior.',
    'PASS: create_new_report fails on peer (Level 10 <= Level 10).'
);

-- Test 2.2: Should FAIL (Self Report - Level 10 <= Level 10)
SELECT throws_ok(
    format(
        $$ SELECT public.create_new_report('Self Report', '%s', '{"category":"Self", "demerit_count": 1, "notes":"Test"}'::jsonb, now()::date) $$, -- *** FIX: Added date ***
        :'submitter_id'
    ),
    'Permission denied: Cannot report on a peer or superior.',
    'PASS: create_new_report fails on self (Level 10 <= Level 10).'
);

-- Test 2.3: Should SUCCEED (Subordinate Report)
CREATE TEMP TABLE t_report AS
SELECT public.create_new_report('Subordinate Report', :'subject_id', '{"category":"Sub", "demerit_count": 1, "notes":"Test"}'::jsonb, now()::date) AS report_id; -- *** FIX: Added date ***

SELECT is_empty(
    'SELECT report_id FROM t_report WHERE report_id IS NULL',
    'PASS: create_new_report succeeds for subordinate (Level 10 > Level 0).'
);

-- Test 2.4: Check initial state of the report
SELECT results_eq(
    'SELECT status, submitted_by, current_approver_group_id FROM public.demerit_reports WHERE id = (SELECT report_id FROM t_report)',
    format('VALUES (''pending_approval''::text, %L::uuid, %L::uuid)', :'submitter_id', :'group_B'),
    'PASS: Report created with correct status, submitter, and next approver group (Group B).'
);


---

-- SECTION 3: Testing public.handle_approval()

SELECT diag(E'\n--- SECTION 3: Approval Process ---');

-- Test 3.1: Should FAIL (Unauthorized Approver - Submitter tries to approve)
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'submitter_id'), true); -- Submitter is Level 10
SELECT throws_ok(
    $$ SELECT public.handle_approval((SELECT report_id FROM t_report), 'Unauthorized approval attempt') $$,
    'You do not have permission to approve this report.',
    'PASS: handle_approval fails when user is not in the current approver group.'
);

-- Test 3.2: Should SUCCEED (Authorized Approver)
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'approver_id'), true); -- Log in as Approver (Level 20)
SELECT lives_ok(
    $$ SELECT public.handle_approval((SELECT report_id FROM t_report), 'Approved by Final Approver') $$,
    'PASS: handle_approval succeeds when user is the authorized approver.'
);

-- Test 3.3: Check final report status
SELECT results_eq(
    'SELECT status, current_approver_group_id FROM public.demerit_reports WHERE id = (SELECT report_id FROM t_report)',
    'VALUES (''completed''::text, NULL::uuid)', -- *** FIX: Status is now 'completed' ***
    'PASS: Report status is set to "completed" and group ID is NULL after final approval.'
);

-- Test 3.4: Check log entry
SELECT results_eq(
    'SELECT action, actor_id FROM public.approval_log WHERE report_id = (SELECT report_id FROM t_report) AND action = ''approved''',
    format('VALUES (''approved''::text, %L::uuid)', :'approver_id'),
    'PASS: Log entry was correctly created for the approval action.'
);

-- Test 3.5: Attempt to approve an already approved report (Should fail gracefully or be handled)
SELECT throws_ok(
    $$ SELECT public.handle_approval((SELECT report_id FROM t_report), 'Second approval attempt') $$,
    'This report is already completed and cannot be modified.', -- *** FIX: Check for new error message ***
    'PASS: handle_approval gracefully fails/prevents re-approval of a final report.'
);


---

-- Cleanup and Finish
SELECT * FROM finish();
ROLLBACK;