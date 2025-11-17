-- 01_setup.sql
BEGIN;

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
INSERT INTO public.academic_terms (id, term_name, start_date, end_date)
VALUES 
  ('00000000-0000-0000-0000-eeeeeeeeeeee', 'Test Term', CURRENT_DATE - 30, CURRENT_DATE + 30)
ON CONFLICT (id) DO UPDATE 
SET start_date = CURRENT_DATE - 30, end_date = CURRENT_DATE + 30;

-- 3. Create Test Offense Types
INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
VALUES 
  ('00000000-0000-0000-0000-111111111111', 'Test Minor Offense', 1, 5, 'Test', 'T1'),
  ('00000000-0000-0000-0000-333333333333', 'Test Major Offense', 3, 10, 'Test', 'T3')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Test Role
-- FIX: Changed to valid HEX UUID (701e... instead of role...)
INSERT INTO public.roles (id, role_name, default_role_level)
VALUES ('00000000-0000-0000-0000-701e00000001', 'Test Cadet Role', 0)
ON CONFLICT (id) DO NOTHING;

-- 5. Create Test User & Profile
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-c4de70000001', 'testcadet@test.com') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, total_demerits)
VALUES (
  '00000000-0000-0000-0000-c4de70000001', 
  'Test', 
  'Cadet', 
  '00000000-0000-0000-0000-701e00000001', -- Matches the fixed Role UUID above
  0
)
ON CONFLICT (id) DO UPDATE SET total_demerits = 0;

-- Clean slate for runs
DELETE FROM public.demerit_reports WHERE subject_cadet_id = '00000000-0000-0000-0000-c4de70000001';
DELETE FROM public.tour_ledger WHERE cadet_id = '00000000-0000-0000-0000-c4de70000001';

COMMIT;