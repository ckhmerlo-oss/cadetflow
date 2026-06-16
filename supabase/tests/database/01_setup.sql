-- 01_setup.sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(1);

-- 0. FIX PERMISSIONS (Crucial for test runner)
GRANT USAGE, CREATE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres;

-- 1. Assertion Function
CREATE OR REPLACE FUNCTION test_assert(condition boolean, message text) RETURNS void AS $$
BEGIN
  IF NOT condition THEN
    RAISE EXCEPTION 'TEST FAILED: %', message;
  END IF;
  RAISE NOTICE 'TEST PASSED: %', message;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Test Term
INSERT INTO public.academic_terms (id, term_name, start_date, end_date, school_year, term_number, archived)
VALUES 
  ('00000000-0000-0000-0000-eeeeeeeeeeee', 'Test Term', CURRENT_DATE - 30, CURRENT_DATE + 30, '2099-2100', 1, false)
ON CONFLICT (id) DO UPDATE 
SET start_date = CURRENT_DATE - 30, end_date = CURRENT_DATE + 30, school_year = EXCLUDED.school_year, term_number = EXCLUDED.term_number;

-- 3. Create Test Offense Types
INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES 
  ('00000000-0000-0000-0000-111111111111', 'Test Minor Offense', 1, 5, 'Test', 'T1'),
  ('00000000-0000-0000-0000-333333333333', 'Test Major Offense', 3, 10, 'Test', 'T3')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Test Role
INSERT INTO public.roles (id, role_name, default_role_level)
VALUES ('00000000-0000-0000-0000-701e00000001', 'Test Cadet Role', 0)
ON CONFLICT (id) DO NOTHING;

-- 5. Create Test User & Profile
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-c4de70000001', 'testcadet@test.com') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id)
VALUES (
  '00000000-0000-0000-0000-c4de70000001', 
  'Test', 
  'Cadet', 
  '00000000-0000-0000-0000-701e00000001'
)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, role_id = EXCLUDED.role_id;

SELECT public.ensure_cadet_profile('00000000-0000-0000-0000-c4de70000001');

UPDATE public.cadet_profiles
SET total_demerits = 0
WHERE profile_id = '00000000-0000-0000-0000-c4de70000001';

-- Clean slate for runs
DELETE FROM public.demerit_reports WHERE subject_cadet_id = '00000000-0000-0000-0000-c4de70000001';
DELETE FROM public.tour_ledger WHERE cadet_id = '00000000-0000-0000-0000-c4de70000001';

SELECT ok(true, 'setup fixtures prepared');
SELECT * FROM finish();

COMMIT;