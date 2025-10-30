-- Start a transaction to roll back changes
BEGIN;
SELECT plan(2);

-- Define the UUID for Cadet A, the primary user for Test 1
\set test_user_id '11111111-1111-1111-1111-111111111111'

-- Set Role to 'postgres' temporarily to insert data into auth.users,
-- which the 'authenticator' user may not have permission to do directly.
SELECT set_config('role', 'postgres', true);

-- Setup: Create three mock users (Auth and Profiles)
-- Cadet A (The test user)
INSERT INTO auth.users (id, email) VALUES (:'test_user_id', 'cadet_a@test.com');
INSERT INTO public.profiles (id, full_name) VALUES (:'test_user_id', 'Cadet A');

-- Cadet B (Random User 1)
INSERT INTO auth.users (id, email) VALUES ('22222222-2222-2222-2222-222222222222', 'cadet_b@test.com');
INSERT INTO public.profiles (id, full_name) VALUES ('22222222-2222-2222-2222-222222222222', 'Cadet B');

-- Cadet C (Random User 2)
INSERT INTO auth.users (id, email) VALUES ('33333333-3333-3333-3333-333333333333', 'cadet_c@test.com');
INSERT INTO public.profiles (id, full_name) VALUES ('33333333-3333-3333-3333-333333333333', 'Cadet C');

-- LOG: Print all inserted rows for reference
SELECT diag('--- Full Dataset for public.profiles (Expected Total: 3) ---');
SELECT diag(array_agg(full_name order by full_name)::text) FROM public.profiles;

-- Restore Role to 'authenticator' for RLS testing
SELECT set_config('role', 'authenticated', true);

-- Test 1: Authenticated User Access
-- Use the variable for the JWT sub claim
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'test_user_id'), true);
SELECT diag(format('--- START TEST 1: Logged test in as: %s (Authenticated) ---', (SELECT auth.uid())::text));

-- LOG: Log the results seen by the authenticated user before running the assertion
SELECT diag(format('  [DEBUG] Authenticated User (%s) Sees: %s', (SELECT auth.uid())::text, array_agg(full_name order by full_name)::text))
FROM public.profiles;

SELECT set_eq(
  'SELECT full_name FROM public.profiles ORDER BY full_name',
  ARRAY['Cadet A', 'Cadet B', 'Cadet C'],
  'PASS: Authenticated user (Cadet A) can see all 3 profile names.'
);


-- Test 2: Anonymous User Access
SELECT set_config('role', 'anon', true);
SELECT diag('--- START TEST 2: Logged in as: anon Anonymous (anon) ---');

-- LOG: Log the results seen by the anonymous user before running the assertion
SELECT diag(format('  [DEBUG] Anonymous User Sees: %s', array_agg(full_name order by full_name)::text))
FROM public.profiles;

SELECT set_eq(
  'SELECT full_name FROM public.profiles',
  ARRAY[]::text[], -- Assert that the returned array of names is empty
  'PASS: Anonymous user should receive an empty set of profile names.'
);

-- Clean up
SELECT * FROM finish();
ROLLBACK;
