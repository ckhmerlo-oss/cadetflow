BEGIN;
SELECT plan(4); -- We're running 4 tests

-- 1. SETUP
-- Set to postgres role for setup, including simple diag logging
SELECT set_config('role', 'postgres', true);
SELECT diag('--- Test 1: Setup ---');

-- User IDs
\set admin_id '11111111-1111-1111-1111-000000000001'
\set platoon_leader_id '22222222-2222-2222-2222-000000000002'
\set squad_leader_id '33333333-3333-3333-3333-000000000003'
\set cadet_id '44444444-4444-4444-4444-000000000004'

-- Insert all users
INSERT INTO auth.users (id, email) VALUES (:'admin_id', 'admin@test.com'), (:'platoon_leader_id', 'platoon_leader@test.com'), (:'squad_leader_id', 'squad_leader@test.com'), (:'cadet_id', 'cadet@test.com');
-- Insert profiles with roles and levels
INSERT INTO public.profiles (id, full_name, role, role_level) VALUES (:'admin_id', 'Admin', 'admin', 99), (:'platoon_leader_id', 'Platoon Leader', 'plt', 20), (:'squad_leader_id', 'Squad Leader', 'sql', 10), (:'cadet_id', 'Cadet', 'cdt', 0);
SELECT diag('  Setup complete. 4 users created.');

-- Restore Role to authenticated for testing
SELECT set_config('role', 'authenticated', true);

-- 2. RUN TESTS

-- Test 1: Log in as Cadet (Level 0)
SELECT diag(E'\n--- Test 1: Logging in as Cadet (Level 0) ---');
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'cadet_id'), true);
-- DIAG: Show current user and what they see (no complex EXPLAIN)
SELECT diag(format('  [DEBUG] User ID: %s | Sees: %s Profiles', auth.uid(), count(*))) FROM public.profiles;

SELECT results_eq('SELECT count(*)::int FROM public.profiles', ARRAY[1], 'PASS: Cadet (Level 0) can see only 1 profile (themselves).');

-- Test 2: Log in as Squad Leader (Level 10)
SELECT diag(E'\n--- Test 2: Logging in as Squad Leader (Level 10) ---');
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'squad_leader_id'), true);
-- DIAG: Show current user and what they see (no complex EXPLAIN)
SELECT diag(format('  [DEBUG] User ID: %s | Sees: %s Profiles', auth.uid(), count(*))) FROM public.profiles;

SELECT results_eq('SELECT count(*)::int FROM public.profiles', ARRAY[2], 'PASS: Squad Leader (Level 10) can see 2 profiles (self + cadet).');

-- Test 3: Log in as Platoon Leader (Level 20)
SELECT diag(E'\n--- Test 3: Logging in as Platoon Leader (Level 20) ---');
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'platoon_leader_id'), true);
-- DIAG: Show current user and what they see (no complex EXPLAIN)
SELECT diag(format('  [DEBUG] User ID: %s | Sees: %s Profiles', auth.uid(), count(*))) FROM public.profiles;

SELECT results_eq('SELECT count(*)::int FROM public.profiles', ARRAY[3], 'PASS: Platoon Leader (Level 20) can see 3 profiles (self + sql + cdt).');

-- Test 4: Log in as Admin (Level 99)
SELECT diag(E'\n--- Test 4: Logging in as Admin (Level 99) ---');
SELECT set_config('request.jwt.claims', format('{"role":"authenticated", "sub":"%s"}', :'admin_id'), true);
-- DIAG: Show current user and what they see (no complex EXPLAIN)
SELECT diag(format('  [DEBUG] User ID: %s | Sees: %s Profiles', auth.uid(), count(*))) FROM public.profiles;

SELECT results_eq('SELECT count(*)::int FROM public.profiles', ARRAY[4], 'PASS: Admin (Level 99) can see all 4 profiles.');

-- 3. CLEANUP
SELECT * FROM finish();
ROLLBACK;
