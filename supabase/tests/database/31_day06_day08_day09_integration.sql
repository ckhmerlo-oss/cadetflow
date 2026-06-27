BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(7);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Year close + work order + barracks integration
INSERT INTO public.companies (id, company_name)
VALUES ('f5100000-0000-0000-0000-000000000001', 'Integration Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.approval_groups (id, group_name, company_id)
VALUES ('f5150000-0000-0000-0000-000000000001', 'Integration Company TAC', 'f5100000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET group_name = EXCLUDED.group_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, approval_group_id, can_manage_all_rosters, can_manage_own_company_roster)
VALUES
  ('f5200000-0000-0000-0000-000000000001', 'Integration Admin', 90, NULL, NULL, true, true),
  ('f5200000-0000-0000-0000-000000000002', 'Integration TAC', 65, 'f5100000-0000-0000-0000-000000000001', 'f5150000-0000-0000-0000-000000000001', false, true),
  ('f5200000-0000-0000-0000-000000000003', 'Integration Cadet', 0, 'f5100000-0000-0000-0000-000000000001', NULL, false, false),
  ('f5200000-0000-0000-0000-000000000004', 'Integration Cadet Leader', 15, 'f5100000-0000-0000-0000-000000000001', NULL, false, false)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('f5300000-0000-0000-0000-000000000001', 'int-admin@test.com'),
  ('f5300000-0000-0000-0000-000000000002', 'int-tac@test.com'),
  ('f5300000-0000-0000-0000-000000000003', 'int-cadet@test.com'),
  ('f5300000-0000-0000-0000-000000000004', 'int-leader@test.com')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.staff_profiles WHERE profile_id IN (
  'f5300000-0000-0000-0000-000000000001',
  'f5300000-0000-0000-0000-000000000002',
  'f5300000-0000-0000-0000-000000000003',
  'f5300000-0000-0000-0000-000000000004'
);
DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'f5300000-0000-0000-0000-000000000001',
  'f5300000-0000-0000-0000-000000000002',
  'f5300000-0000-0000-0000-000000000003',
  'f5300000-0000-0000-0000-000000000004'
);
DELETE FROM public.profiles WHERE id IN (
  'f5300000-0000-0000-0000-000000000001',
  'f5300000-0000-0000-0000-000000000002',
  'f5300000-0000-0000-0000-000000000003',
  'f5300000-0000-0000-0000-000000000004'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, is_site_admin)
VALUES
  ('f5300000-0000-0000-0000-000000000001', 'Int', 'Admin', 'f5200000-0000-0000-0000-000000000001', NULL, true),
  ('f5300000-0000-0000-0000-000000000002', 'Int', 'TAC', 'f5200000-0000-0000-0000-000000000002', 'f5100000-0000-0000-0000-000000000001', false),
  ('f5300000-0000-0000-0000-000000000003', 'Int', 'Cadet', 'f5200000-0000-0000-0000-000000000003', 'f5100000-0000-0000-0000-000000000001', false),
  ('f5300000-0000-0000-0000-000000000004', 'Int', 'Leader', 'f5200000-0000-0000-0000-000000000004', 'f5100000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, is_site_admin = EXCLUDED.is_site_admin, company_id = EXCLUDED.company_id;

UPDATE public.barracks_rooms SET company_id = 'f5100000-0000-0000-0000-000000000001'
WHERE room_number = 'A106';

DELETE FROM public.academic_terms WHERE school_year IN ('2073-2074', '2074-2075');
DELETE FROM public.year_close_audit WHERE school_year IN ('2073-2074', '2074-2075');
DELETE FROM public.work_orders WHERE requester_id = 'f5300000-0000-0000-0000-000000000004';
DELETE FROM public.room_move_in_forms WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A106' LIMIT 1);

INSERT INTO public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
VALUES
  ('IY1', CURRENT_DATE - 120, CURRENT_DATE - 90, '2073-2074', 1, false),
  ('IY2', CURRENT_DATE - 89, CURRENT_DATE - 60, '2073-2074', 2, false),
  ('IY3', CURRENT_DATE - 59, CURRENT_DATE - 30, '2073-2074', 3, false),
  ('IY4', CURRENT_DATE - 29, CURRENT_DATE + 30, '2073-2074', 4, false),
  ('IY5', CURRENT_DATE + 31, CURRENT_DATE + 60, '2073-2074', 5, false),
  ('IN1', CURRENT_DATE + 61, CURRENT_DATE + 90, '2074-2075', 1, false),
  ('IN2', CURRENT_DATE + 91, CURRENT_DATE + 120, '2074-2075', 2, false),
  ('IN3', CURRENT_DATE + 121, CURRENT_DATE + 150, '2074-2075', 3, false),
  ('IN4', CURRENT_DATE + 151, CURRENT_DATE + 180, '2074-2075', 4, false),
  ('IN5', CURRENT_DATE + 181, CURRENT_DATE + 210, '2074-2075', 5, false);

-- Assign bunk + save move-in form before close
SELECT public.mock_auth('f5300000-0000-0000-0000-000000000002');
SELECT public.assign_barracks_bunk(
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A106' LIMIT 1),
  'top', 'f5300000-0000-0000-0000-000000000003'
);

SELECT public.save_room_inspection_form(
  'move_in',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A106' LIMIT 1),
  'f5300000-0000-0000-0000-000000000003',
  null,
  jsonb_build_array(jsonb_build_object('item_key', 'desk_top_l', 'item_label', 'Top', 'sort_order', 80, 'status', 'INS')),
  'integration form', 'f5300000-0000-0000-0000-000000000002', true
);

SELECT set_config(
  'test.int_form_id',
  (SELECT latest_move_in_form_id::text FROM public.barracks_rooms WHERE room_number = 'A106' LIMIT 1),
  false
);

-- Open work order
SELECT public.mock_auth('f5300000-0000-0000-0000-000000000004');
SELECT public.create_work_order(
  'barracks', 'Integration WO',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A106' LIMIT 1),
  NULL, '{}'
);

SELECT set_config(
  'test.int_wo_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'f5300000-0000-0000-0000-000000000004' LIMIT 1),
  false
);

SELECT public.mock_auth('f5300000-0000-0000-0000-000000000001');
SELECT ok(
  (public.get_year_close_preflight('2073-2074', '2074-2075') -> 'informational' ->> 'open_work_orders')::int >= 1,
  'get_year_close_preflight → open_work_orders reflects open work order'
);

-- Resolve suspended blocker cadet from day06 pattern: use set_departure if needed
SELECT public.mock_auth('f5300000-0000-0000-0000-000000000001');
SELECT public.close_school_year('2073-2074', '2074-2075');

SELECT ok(
  (SELECT status FROM public.work_orders WHERE id = current_setting('test.int_wo_id')::uuid) = 'submitted',
  'close_school_year → open work order status unchanged'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.room_move_in_forms
    WHERE id = current_setting('test.int_form_id')::uuid
  ),
  'close_school_year → move-in inspection form history preserved'
);

SELECT ok(
  (SELECT occupant_top_bunk_id FROM public.barracks_rooms WHERE room_number = 'A106' LIMIT 1) IS NULL,
  'close_school_year → barracks bunk occupancy cleared'
);

SELECT ok(
  (SELECT room_number FROM public.cadet_profiles WHERE profile_id = 'f5300000-0000-0000-0000-000000000003') IS NULL,
  'close_school_year → cadet room_number cleared'
);

SELECT ok(
  (SELECT count(*)::int FROM public.work_orders WHERE status NOT IN ('completed', 'cancelled')) >= 1,
  'close_school_year → work orders remain in maintenance queue'
);

SELECT ok(
  (public.get_year_close_preflight('2073-2074', '2074-2075') -> 'informational' ->> 'open_work_orders')::int >= 1,
  'get_year_close_preflight → open count still populated after year close'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
