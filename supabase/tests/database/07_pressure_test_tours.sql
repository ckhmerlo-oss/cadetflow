-- 07_pressure_test_tours.sql
-- THE CHAOS TEST (Fixed)
BEGIN;

DO $$
DECLARE
  -- Setup UUIDs
  v_cadet_id uuid := '00000000-0000-0000-0000-c4de70000001';
  v_admin_id uuid := '00000000-0000-0000-0000-ad71e0000001';
  v_term_id uuid := '00000000-0000-0000-0000-eeeeeeeeeeee';
  v_role_id uuid := '00000000-0000-0000-0000-701e00000050';
  
  -- Offense Types
  v_off_minor uuid := '00000000-0000-0000-0000-111111111111'; -- Cat 1 (2 Dems)
  v_off_major uuid := '00000000-0000-0000-0000-222222222222'; -- Cat 1 (6 Dems)
  v_off_nuke  uuid := '00000000-0000-0000-0000-333333333333'; -- Cat 3 (10 Dems)

  -- Report IDs for tracking
  v_rep_tipping_point uuid := '00000000-0000-0000-0000-999900000001';
  
  v_balance int;
  v_start_date timestamptz := now() - interval '10 days'; 
BEGIN
  ----------------------------------------------------------------
  -- 1. SETUP: Clean Slate & Definitions
  ----------------------------------------------------------------
  RAISE NOTICE '--- SETTING UP CHAOS ENV ---';
  
  -- Create Term
  INSERT INTO public.academic_terms (id, term_name, start_date, end_date)
  VALUES (v_term_id, 'Chaos Term', CURRENT_DATE - 30, CURRENT_DATE + 30)
  ON CONFLICT (id) DO UPDATE SET start_date = CURRENT_DATE - 30, end_date = CURRENT_DATE + 30;

  -- Create Offense Types
  INSERT INTO public.offense_types (id, offense_name, policy_category, demerits, offense_group, offense_code)
  VALUES 
    (v_off_minor, 'Minor Infraction', 1, 2, 'Test', 'T1'),
    (v_off_major, 'Major Infraction', 1, 6, 'Test', 'T2'),
    (v_off_nuke,  'Nuclear Event',    3, 10, 'Test', 'T3')
  ON CONFLICT (id) DO NOTHING;

  -- Create Role (Required for Profile)
  INSERT INTO public.roles (id, role_name, default_role_level)
  VALUES (v_role_id, 'Test Admin Role', 50)
  ON CONFLICT (id) DO NOTHING;

  -- FIX: Create Admin User & Profile (This was missing!)
  INSERT INTO auth.users (id, email) VALUES (v_admin_id, 'admin@test.com') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.profiles (id, first_name, last_name, role_id) 
  VALUES (v_admin_id, 'Chaos', 'Admin', v_role_id) 
  ON CONFLICT (id) DO NOTHING;

  -- Create Cadet User & Profile
  INSERT INTO auth.users (id, email) VALUES (v_cadet_id, 'chaos_cadet@test.com') ON CONFLICT (id) DO NOTHING;
  -- Ensure cadet has a valid role_id (reusing admin role for simplicity, or create a cadet role)
  INSERT INTO public.profiles (id, first_name, last_name, role_id) 
  VALUES (v_cadet_id, 'Chaos', 'Cadet', v_role_id) 
  ON CONFLICT (id) DO NOTHING;
  
  -- WIPE HISTORY for the Cadet
  DELETE FROM public.appeals WHERE appealing_cadet_id = v_cadet_id;
  DELETE FROM public.tour_ledger WHERE cadet_id = v_cadet_id;
  DELETE FROM public.demerit_reports WHERE subject_cadet_id = v_cadet_id;

  ----------------------------------------------------------------
  -- 2. PHASE 1: THE NOISE (Invalid Reports)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 1: INSERTING NOISE (Should be 0 Tours) ---';
  
  -- Insert "junk" reports (rejected, pending)
  FOR i IN 1..5 LOOP
    INSERT INTO public.demerit_reports (subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
    VALUES (v_cadet_id, v_admin_id, v_off_nuke, 100, 'rejected', v_start_date);
    
    INSERT INTO public.demerit_reports (subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
    VALUES (v_cadet_id, v_admin_id, v_off_nuke, 100, 'pending_approval', v_start_date);
  END LOOP;

  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 0 THEN RAISE EXCEPTION 'FAILED: Noise caused tours. Balance: %', v_balance; END IF;

  ----------------------------------------------------------------
  -- 3. PHASE 2: THE SLOW BURN (Consuming Credits)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 2: CONSUMING CREDITS (Should be 0 Tours) ---';
  
  -- Insert 5 reports of 2 demerits each = 10 Demerits total.
  -- Credits: 15 - 10 = 5 Remaining.
  FOR i IN 1..5 LOOP
    INSERT INTO public.demerit_reports (subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
    VALUES (v_cadet_id, v_admin_id, v_off_minor, 2, 'completed', v_start_date);
  END LOOP;

  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 0 THEN RAISE EXCEPTION 'FAILED: Credits did not protect cadet. Balance: %', v_balance; END IF;

  ----------------------------------------------------------------
  -- 4. PHASE 3: THE TIPPING POINT (Crossing 15)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 3: TIPPING POINT (Should be 1 Tour) ---';
  
  -- Insert 1 report of 6 demerits.
  -- Math: 10 (Previous) + 6 (New) = 16 Total.
  -- Tours: 16 - 15 = 1 Tour.
  INSERT INTO public.demerit_reports (id, subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
  VALUES (v_rep_tipping_point, v_cadet_id, v_admin_id, v_off_major, 6, 'completed', v_start_date + interval '1 day');

  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 1 THEN RAISE EXCEPTION 'FAILED: Tipping point math wrong. Balance: % (Expected 1)', v_balance; END IF;

  ----------------------------------------------------------------
  -- 5. PHASE 4: THE NUKE (Category 3)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 4: THE NUKE (Should be 11 Tours) ---';
  
  -- Insert Cat 3 (10 Demerits)
  -- Math: 
  --   Existing Tours: 1
  --   Cat 3: Adds 10 Tours immediately.
  --   Credits: Permanently set to 0 for term.
  --   Total: 11.
  INSERT INTO public.demerit_reports (subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
  VALUES (v_cadet_id, v_admin_id, v_off_nuke, 10, 'completed', v_start_date + interval '2 days');

  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 11 THEN RAISE EXCEPTION 'FAILED: Nuke math wrong. Balance: % (Expected 11)', v_balance; END IF;

  ----------------------------------------------------------------
  -- 6. PHASE 5: THE AFTERMATH (Credits Gone)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 5: POST-NUKE (Should be 13 Tours) ---';
  
  -- Insert 1 Minor (2 Demerits)
  -- Math: Since Nuke happened, credits are 0. 
  -- 2 Demerits = 2 Tours.
  -- Total: 11 + 2 = 13.
  INSERT INTO public.demerit_reports (subject_cadet_id, submitted_by, offense_type_id, demerits_effective, status, date_of_offense)
  VALUES (v_cadet_id, v_admin_id, v_off_minor, 2, 'completed', v_start_date + interval '3 days');

  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 13 THEN RAISE EXCEPTION 'FAILED: Post-Nuke credits not revoked. Balance: % (Expected 13)', v_balance; END IF;

  ----------------------------------------------------------------
  -- 7. PHASE 6: REDEMPTION (Serving Tours)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 6: SERVING TIME (Should be 8 Tours) ---';
  
  -- Serve 5 Tours
  INSERT INTO public.tour_ledger (cadet_id, term_id, action, amount)
  VALUES (v_cadet_id, v_term_id, 'served', -5);

  -- Math: 13 Earned - 5 Served = 8 Remaining.
  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 8 THEN RAISE EXCEPTION 'FAILED: Served tours not counted. Balance: % (Expected 8)', v_balance; END IF;

  ----------------------------------------------------------------
  -- 8. PHASE 7: THE TIME TRAVEL (Appeal Retroactive)
  ----------------------------------------------------------------
  RAISE NOTICE '--- PHASE 7: THE APPEAL (Should be 7 Tours) ---';
  
  -- We grant an appeal on the "Tipping Point" report (Phase 3).
  -- That report was 6 Demerits.
  -- New Timeline Recalculation:
  --   1. Phase 2 (10 Dems): Credits 15 -> 5.
  --   2. Phase 3 (0 Dems - Appealed): Skipped. Credits still 5.
  --   3. Phase 4 (Nuke, 10 Dems): Nuke Active. Earned += 10. Credits -> 0.
  --   4. Phase 5 (2 Dems): Nuke Active. Earned += 2.
  --   Total Earned: 12.
  --   Total Served: 5.
  --   Final Balance: 7.
  
  -- Mock the appeal grant (set demerits to 0)
  UPDATE public.demerit_reports SET demerits_effective = 0 WHERE id = v_rep_tipping_point;

  v_balance := public.get_cadet_tour_balance(v_cadet_id);
  IF v_balance != 7 THEN 
     RAISE EXCEPTION 'FAILED: Dynamic recalculation wrong. Balance: % (Expected 7)', v_balance; 
  END IF;

  RAISE NOTICE '------------------------------------------';
  RAISE NOTICE '✅ PRESSURE TEST PASSED: SYSTEM IS ROBUST';
  RAISE NOTICE '------------------------------------------';

END $$;
ROLLBACK;