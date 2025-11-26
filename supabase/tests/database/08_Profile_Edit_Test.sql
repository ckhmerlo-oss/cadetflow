BEGIN;

-- 1. Initialize pgTAP
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

-- 2. Define Local Auth Helper (Since 'tests' schema is missing)
CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
    -- Mock the JWT claim so auth.uid() works
    PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
    -- Switch to the authenticated role
    SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- 3. Setup: Create Mock Users/Profiles
-- Must create auth.users FIRST because profiles.id references auth.users.id
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'cadet@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'staff@test.com'),
  ('33333333-3333-3333-3333-333333333333', 'admin@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."roles" (id, role_name, default_role_level)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Cadet', 0),
  ('00000000-0000-0000-0000-000000000002', 'Commandant', 100) 
ON CONFLICT DO NOTHING;

INSERT INTO "public"."profiles" (id, first_name, last_name, role_id, is_site_admin)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test', 'Cadet', '00000000-0000-0000-0000-000000000001', false),
  ('22222222-2222-2222-2222-222222222222', 'Test', 'Staff', '00000000-0000-0000-0000-000000000002', false),
  ('33333333-3333-3333-3333-333333333333', 'Test', 'Admin', '00000000-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO UPDATE 
SET role_id = EXCLUDED.role_id, is_site_admin = EXCLUDED.is_site_admin; 

-- ===============================================================
-- TEST 1: CADET SELF-UPDATE (Should Fail via RLS)
-- ===============================================================

-- Act as the Cadet
SELECT public.mock_auth('11111111-1111-1111-1111-111111111111');

PREPARE cadet_update AS 
UPDATE "public"."profiles" 
SET first_name = 'Hacked' 
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT throws_ok(
  'cadet_update',
  'new row violates row-level security policy%',
  'Cadet should not be able to update their own profile (RLS)'
);

-- ===============================================================
-- TEST 2: STAFF ESCALATION - IS_SITE_ADMIN (Should Fail via Trigger)
-- ===============================================================

-- Act as Staff
SELECT public.mock_auth('22222222-2222-2222-2222-222222222222');

PREPARE staff_make_admin AS 
UPDATE "public"."profiles" 
SET is_site_admin = true 
WHERE id = '22222222-2222-2222-2222-222222222222';

SELECT throws_ok(
  'staff_make_admin',
  'Permission Denied: Only Site Admins can grant admin privileges.',
  'Staff should not be able to grant themselves Admin status'
);

-- ===============================================================
-- TEST 3: STAFF ESCALATION - ROLE_ID (Should Fail via Trigger)
-- ===============================================================

PREPARE staff_change_role AS 
UPDATE "public"."profiles" 
SET role_id = '00000000-0000-0000-0000-000000000002' 
WHERE id = '11111111-1111-1111-1111-111111111111'; 

SELECT throws_ok(
  'staff_change_role',
  'Permission Denied: Only Site Admins can change user roles.',
  'Staff should not be able to change role_id'
);

-- ===============================================================
-- TEST 4: STAFF NORMAL UPDATE (Should Succeed)
-- ===============================================================

PREPARE staff_update_safe AS 
UPDATE "public"."profiles" 
SET room_number = '101-A'
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT lives_ok(
  'staff_update_safe',
  'Staff should be able to update non-sensitive fields'
);

-- ===============================================================
-- TEST 5: ADMIN UPDATE (Should Succeed)
-- ===============================================================

-- Act as Admin
SELECT public.mock_auth('33333333-3333-3333-3333-333333333333');

PREPARE admin_change_role AS 
UPDATE "public"."profiles" 
SET role_id = '00000000-0000-0000-0000-000000000002' 
WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT lives_ok(
  'admin_change_role',
  'Site Admin should be able to change roles'
);

SELECT * FROM finish();
ROLLBACK;