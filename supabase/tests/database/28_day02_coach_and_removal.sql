BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(7);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

DELETE FROM public.academic_terms WHERE school_year = '2198-2199';

INSERT INTO public.companies (id, company_name)
VALUES ('b1000000-0000-0000-0000-000000000001', 'Coach Test Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Coach TAC', 65, 'b1000000-0000-0000-0000-000000000001', true),
  ('b2000000-0000-0000-0000-000000000002', 'Head Coach Staff', 50, NULL, false),
  ('b2000000-0000-0000-0000-000000000003', 'Coach Cadet', 0, 'b1000000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('b3000000-0000-0000-0000-000000000001', 'coach-tac@test.com'),
  ('b3000000-0000-0000-0000-000000000002', 'coach-staff@test.com'),
  ('b3000000-0000-0000-0000-000000000003', 'coach-cadet@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('b3000000-0000-0000-0000-000000000001', 'TAC', 'Coach', 'b2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'),
  ('b3000000-0000-0000-0000-000000000002', 'Pat', 'Coach', 'b2000000-0000-0000-0000-000000000002', NULL),
  ('b3000000-0000-0000-0000-000000000003', 'Sam', 'Athlete', 'b2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id;

UPDATE public.profiles SET role_id = 'b2000000-0000-0000-0000-000000000001' WHERE id = 'b3000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'b2000000-0000-0000-0000-000000000002' WHERE id = 'b3000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'b2000000-0000-0000-0000-000000000003' WHERE id = 'b3000000-0000-0000-0000-000000000003';

SELECT public.ensure_staff_profile('b3000000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('b3000000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('b3000000-0000-0000-0000-000000000003');

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('Coach T1', CURRENT_DATE - 30, CURRENT_DATE + 30, '2198-2199', 1, false),
  ('Coach T2', CURRENT_DATE + 31, CURRENT_DATE + 60, '2198-2199', 2, false),
  ('Coach T3', CURRENT_DATE + 61, CURRENT_DATE + 90, '2198-2199', 3, false),
  ('Coach T4', CURRENT_DATE + 91, CURRENT_DATE + 120, '2198-2199', 4, false),
  ('Coach T5', CURRENT_DATE + 121, CURRENT_DATE + 150, '2198-2199', 5, false);

-- Pick sport column matching current season
DO $$
DECLARE
  v_season text := public.get_current_sports_season();
BEGIN
  IF v_season = 'Fall' THEN
    UPDATE public.cadet_profiles SET sport_fall = 'Test Soccer', sport_winter = 'None', sport_spring = 'None'
    WHERE profile_id = 'b3000000-0000-0000-0000-000000000003';
  ELSIF v_season = 'Winter' THEN
    UPDATE public.cadet_profiles SET sport_winter = 'Test Soccer', sport_fall = 'None', sport_spring = 'None'
    WHERE profile_id = 'b3000000-0000-0000-0000-000000000003';
  ELSE
    UPDATE public.cadet_profiles SET sport_spring = 'Test Soccer', sport_fall = 'None', sport_winter = 'None'
    WHERE profile_id = 'b3000000-0000-0000-0000-000000000003';
  END IF;
END $$;

INSERT INTO public.sports (id, name, season, short_code)
SELECT 'b4000000-0000-0000-0000-000000000001', 'Test Soccer', public.get_current_sports_season(), 'TS'
WHERE NOT EXISTS (
  SELECT 1 FROM public.sports WHERE name = 'Test Soccer' AND season = public.get_current_sports_season()
);

INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'b3000000-0000-0000-0000-000000000002', 'Head Coach'
FROM public.sports s
WHERE s.name = 'Test Soccer' AND s.season = public.get_current_sports_season()
ON CONFLICT DO NOTHING;

DELETE FROM public.cadet_oversight_assignments WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003';
DELETE FROM public.oversight_assignment_events WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003';

RESET ROLE;
SELECT public.sync_cadet_oversight('b3000000-0000-0000-0000-000000000003', 'b3000000-0000-0000-0000-000000000001');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
      AND staff_id = 'b3000000-0000-0000-0000-000000000002'
      AND assignment_type = 'coach'
      AND is_active = true
  ),
  'sync_cadet_oversight → in-season coach assignment created'
);

-- Coach change: swap coach and re-sync
UPDATE public.sport_coaches sc
SET coach_id = 'b3000000-0000-0000-0000-000000000001'
FROM public.sports s
WHERE sc.sport_id = s.id
  AND s.name = 'Test Soccer'
  AND s.season = public.get_current_sports_season();

SELECT public.sync_cadet_oversight('b3000000-0000-0000-0000-000000000003', 'b3000000-0000-0000-0000-000000000001');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
      AND staff_id = 'b3000000-0000-0000-0000-000000000001'
      AND assignment_type = 'coach'
      AND is_active = true
  ),
  'sync_cadet_oversight → coach reassignment updates active coach'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
      AND staff_id = 'b3000000-0000-0000-0000-000000000002'
      AND assignment_type = 'coach'
      AND is_active = true
  ),
  'sync_cadet_oversight → prior coach assignment deactivated'
);

-- Manual faculty add + TAC remove
SELECT public.mock_auth('b3000000-0000-0000-0000-000000000002');
SELECT public.add_manual_oversight('b3000000-0000-0000-0000-000000000003', 'b3000000-0000-0000-0000-000000000002');

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
      AND assignment_type = 'faculty'
      AND source = 'manual'
      AND is_active = true
  ),
  'add_manual_oversight → manual faculty assignment created'
);

SELECT public.mock_auth('b3000000-0000-0000-0000-000000000001');
SELECT public.remove_manual_oversight(
  (SELECT id FROM public.cadet_oversight_assignments
   WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
     AND assignment_type = 'faculty'
     AND source = 'manual'
     AND is_active = true
   LIMIT 1)
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.cadet_oversight_assignments
    WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
      AND assignment_type = 'faculty'
      AND source = 'manual'
      AND is_active = true
  ),
  'remove_manual_oversight → TAC removes manual faculty assignment'
);

SELECT public.mock_auth('b3000000-0000-0000-0000-000000000003');
SELECT throws_ok(
  $$SELECT public.remove_manual_oversight(
    (SELECT id FROM public.cadet_oversight_assignments
     WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
       AND assignment_type = 'coach'
       AND is_active = true LIMIT 1)
  )$$,
  'P0001',
  NULL,
  'remove_manual_oversight → cadet cannot remove assignments'
);

RESET ROLE;
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.oversight_assignment_events
    WHERE cadet_id = 'b3000000-0000-0000-0000-000000000003'
  ),
  'oversight_assignment_events → audit rows emitted for assignment changes'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
