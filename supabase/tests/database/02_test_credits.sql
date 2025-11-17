-- 02_test_credits.sql (Debug Version)
DO $$
DECLARE
  v_cadet_id uuid := '00000000-0000-0000-0000-c4de70000001';
  v_offense_id uuid := '00000000-0000-0000-0000-111111111111'; -- 5 Demerits
  v_tours int;
  v_count int;
  -- FIX: Use a specific hardcoded timestamp to ensure alignment
  v_test_date timestamptz := now(); 
BEGIN
  -- Clear previous history
  DELETE FROM public.demerit_reports WHERE subject_cadet_id = v_cadet_id;
  DELETE FROM public.tour_ledger WHERE cadet_id = v_cadet_id;

  RAISE NOTICE '--- STARTING CREDIT LOGIC TEST ---';

  -- STEP 1: First Offense (5 Demerits). Should be 0 Tours.
  v_tours := public.calculate_tours_for_new_report(v_cadet_id, 5, 1, v_test_date);
  PERFORM test_assert(v_tours = 0, 'First 5 demerits should result in 0 tours');

  -- Simulate saving to DB
  INSERT INTO public.demerit_reports (
    subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
  )
  VALUES (
    v_cadet_id, v_cadet_id, v_offense_id, 5, 'completed', v_test_date
  );

  -- DEBUG: Verify it exists
  SELECT count(*) INTO v_count FROM public.demerit_reports WHERE subject_cadet_id = v_cadet_id AND status = 'completed';
  RAISE NOTICE 'Debug: Reports found in DB: %', v_count;

  -- STEP 2: Second Offense (12 Demerits).
  -- Math: 10 Credits Remaining. 12 Demerits. 12 - 10 = 2 Tours.
  v_tours := public.calculate_tours_for_new_report(v_cadet_id, 12, 1, v_test_date);
  
  -- Add diagnostic notice if it fails
  IF v_tours != 2 THEN
      RAISE NOTICE 'Debug Failure: Expected 2 tours, got %. This means the function likely did not see the previous 5 demerits.', v_tours;
  END IF;

  PERFORM test_assert(v_tours = 2, 'Overflow demerits should be 2 tours (12 demerits - 10 credits left)');

  RAISE NOTICE '--- CREDIT LOGIC TEST PASSED ---';
END $$;