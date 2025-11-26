-- 03_test_nuke.sql (Persistent Version)

SELECT plan(0);

DO $$
DECLARE
  v_cadet_id uuid := '00000000-0000-0000-0000-c4de70000001';
  v_cat3_id uuid := '00000000-0000-0000-0000-333333333333'; -- 10 Demerits, Cat 3
  v_tours int;
  v_test_date timestamptz := now(); 
BEGIN
  -- Reset
  DELETE FROM public.demerit_reports WHERE subject_cadet_id = v_cadet_id;
  
  RAISE NOTICE '--- STARTING NUKE TEST ---';

  -- STEP 1: Immediate Category 3.
  v_tours := public.calculate_tours_for_new_report(v_cadet_id, 10, 3, v_test_date);
  PERFORM test_assert(v_tours = 10, 'Category 3 should assign full tours immediately');

  -- Insert it into history
  INSERT INTO public.demerit_reports (
    subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense
  )
  VALUES (
    v_cadet_id, v_cadet_id, v_cat3_id, 10, 'completed', v_test_date
  );

  -- STEP 2: Subsequent Minor Offense (5 Demerits).
  -- Math: 10 Used. 5 "Credits" technically left.
  -- Policy: But a Cat 3 exists in history, so credits should be 0.
  -- Expected: 5 Tours (Full Penalty).
  
  v_tours := public.calculate_tours_for_new_report(v_cadet_id, 5, 1, v_test_date);
  
  -- *** UPDATED ASSERTION ***
  PERFORM test_assert(v_tours = 5, 'Subsequent minor offense should generate FULL tours because Cat 3 revoked credits');

  RAISE NOTICE '--- NUKE TEST PASSED ---';
END $$;