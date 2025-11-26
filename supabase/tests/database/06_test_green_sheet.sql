-- 06_test_green_sheet_fixed.sql


SELECT plan(0);

BEGIN;

DO $$
DECLARE
  v_admin_id uuid := '00000000-0000-0000-0000-ad71e0000001';
  v_cadet_id uuid := '00000000-0000-0000-0000-c4de70000001';
  v_offense_id uuid := '00000000-0000-0000-0000-111111111111';
  v_report_unposted uuid := '00000000-0000-0000-0000-999900000001';
  v_count int;
  v_role_id uuid;
BEGIN
  -- 1. DYNAMIC ROLE LOOKUP
  -- We find the real 'Commandant' role ID to satisfy the permission check.
  -- If it doesn't exist (e.g. blank DB), we fall back to creating a temp one.
  SELECT id INTO v_role_id FROM public.roles WHERE role_name = 'Commandant' LIMIT 1;
  
  IF v_role_id IS NULL THEN
    -- Fallback for empty test DBs
    v_role_id := '00000000-0000-0000-0000-701e00000050';
    INSERT INTO public.roles (id, role_name, default_role_level)
    VALUES (v_role_id, 'Commandant', 50) ON CONFLICT DO NOTHING;
  END IF;

  -- 2. Setup Users
  INSERT INTO auth.users (id, email) VALUES (v_admin_id, 'admin@test.com') ON CONFLICT (id) DO NOTHING;
  
  -- Assign the COMMANDANT role to our test admin
  INSERT INTO public.profiles (id, first_name, last_name, role_id)
  VALUES (v_admin_id, 'Test', 'Admin', v_role_id)
  ON CONFLICT (id) DO UPDATE SET role_id = v_role_id;

  INSERT INTO auth.users (id, email) VALUES (v_cadet_id, 'cadet@test.com') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.profiles (id, first_name, last_name, role_id)
  VALUES (v_cadet_id, 'Test', 'Cadet', v_role_id) -- Role doesn't matter for cadet
  ON CONFLICT (id) DO NOTHING;

  -- 3. Setup Data
  DELETE FROM public.demerit_reports WHERE id = v_report_unposted;

  RAISE NOTICE '--- STARTING GREEN SHEET TEST ---';

  -- Create Report: Completed, NOT Posted
  INSERT INTO public.demerit_reports (id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, is_posted, date_of_offense)
  VALUES (v_report_unposted, v_cadet_id, v_admin_id, v_offense_id, 5, 'completed', false, now());

  -- 4. VERIFY DETECTION
  SELECT count(*) INTO v_count 
  FROM public.demerit_reports 
  WHERE status = 'completed' AND is_posted = false AND id = v_report_unposted;
  
  PERFORM test_assert(v_count = 1, 'Should find 1 unposted completed report');

  -- 5. MOCK LOGIN & EXECUTE
  -- We simulate being logged in as the Admin so the RLS/Permission check passes
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  PERFORM public.mark_green_sheet_as_posted(ARRAY[v_report_unposted]);

  -- 6. VERIFY RESULT
  PERFORM test_assert(
    (SELECT is_posted FROM public.demerit_reports WHERE id = v_report_unposted) = true,
    'Report should now be marked as posted'
  );

  RAISE NOTICE '--- GREEN SHEET TEST PASSED ---';
END $$;
ROLLBACK;