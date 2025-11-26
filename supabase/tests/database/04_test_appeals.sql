-- 04_test_appeals_fixed.sql

SELECT plan(0);

DO $$
DECLARE
  v_cadet_id uuid := '00000000-0000-0000-0000-c4de70000001';
  v_offense_id uuid := '00000000-0000-0000-0000-111111111111';
  v_report_id uuid := '00000000-0000-0000-0000-999999999999';
  v_appeal_id uuid := '00000000-0000-0000-0000-888888888888';
  v_balance int;
  v_dems_before int;
  v_dems_after int;
BEGIN
  RAISE NOTICE '--- STARTING DEBUG ---';

  -- 1. CLEANUP: Wipe EVERYTHING for this cadet to remove ghosts from Test 03
  -- This fixes the "Final Balance: 10" error by ensuring we start at 0
  DELETE FROM public.appeals WHERE appealing_cadet_id = v_cadet_id;
  DELETE FROM public.tour_ledger WHERE cadet_id = v_cadet_id;
  DELETE FROM public.demerit_reports WHERE subject_cadet_id = v_cadet_id;

  -- 2. Insert Report (20 Demerits -> 5 Tours)
  INSERT INTO public.demerit_reports (id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
  VALUES (v_report_id, v_cadet_id, v_cadet_id, v_offense_id, 20, 'completed', now()); 

  -- 3. Insert Ledger (5 Tours)
  INSERT INTO public.tour_ledger (cadet_id, report_id, amount, action)
  VALUES (v_cadet_id, v_report_id, 5, 'add');

  -- 4. Create Appeal
  INSERT INTO public.appeals (id, report_id, appealing_cadet_id, status, justification) 
  VALUES (v_appeal_id, v_report_id, v_cadet_id, 'pending_commandant', 'debug');

  -- CHECK BEFORE
  SELECT demerits_effective INTO v_dems_before FROM public.demerit_reports WHERE id = v_report_id;
  RAISE NOTICE 'Demerits BEFORE Appeal: % (Expected 20)', v_dems_before;

  -- 5. EXECUTE APPEAL
  PERFORM public.appeal_commandant_action(v_appeal_id, 'grant', 'Fixed.');

  -- CHECK AFTER
  SELECT demerits_effective INTO v_dems_after FROM public.demerit_reports WHERE id = v_report_id;
  RAISE NOTICE 'Demerits AFTER Appeal: % (Expected 0)', v_dems_after;

  -- CHECK BALANCE
  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  RAISE NOTICE 'Final Calculated Balance: % (Expected 0)', v_balance;

  IF v_balance = 0 THEN
    RAISE NOTICE '--- DEBUG PASSED ---';
  ELSE
    RAISE EXCEPTION 'DEBUG FAILED: Balance was %', v_balance;
  END IF;
END $$;