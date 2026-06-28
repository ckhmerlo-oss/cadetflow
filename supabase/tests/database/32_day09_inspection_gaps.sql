BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name)
VALUES ('d4010000-0000-0000-0000-000000000001', 'Inspect Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster)
VALUES
  ('d4020000-0000-0000-0000-000000000001', 'Inspect Alpha TAC', 65, 'd4010000-0000-0000-0000-000000000001', true),
  ('d4020000-0000-0000-0000-000000000003', 'Inspect Cadet', 15, 'd4010000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d4030000-0000-0000-0000-000000000001', 'inspect-tac@test.com'),
  ('d4030000-0000-0000-0000-000000000003', 'inspect-cadet@test.com')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.staff_profiles WHERE profile_id IN ('d4030000-0000-0000-0000-000000000001', 'd4030000-0000-0000-0000-000000000003');
DELETE FROM public.cadet_profiles WHERE profile_id IN ('d4030000-0000-0000-0000-000000000001', 'd4030000-0000-0000-0000-000000000003');
DELETE FROM public.profiles WHERE id IN ('d4030000-0000-0000-0000-000000000001', 'd4030000-0000-0000-0000-000000000003');

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id)
VALUES
  ('d4030000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd4020000-0000-0000-0000-000000000001', 'd4010000-0000-0000-0000-000000000001'),
  ('d4030000-0000-0000-0000-000000000003', 'Alex', 'Cadet', 'd4020000-0000-0000-0000-000000000003', 'd4010000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id;

UPDATE public.barracks_rooms SET company_id = 'd4010000-0000-0000-0000-000000000001',
  occupant_top_bunk_id = null, occupant_bottom_bunk_id = null
WHERE room_number = 'A107';

UPDATE public.cadet_profiles SET room_number = null WHERE profile_id = 'd4030000-0000-0000-0000-000000000003';

DELETE FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1);
DELETE FROM public.room_inspection_items WHERE move_in_form_id IN (
  SELECT id FROM public.room_move_in_forms WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1)
);
DELETE FROM public.room_move_out_forms WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1);
DELETE FROM public.room_move_in_forms WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');
SELECT public.assign_barracks_bunk(
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  'bottom', 'd4030000-0000-0000-0000-000000000003'
);

-- OTH does not create work order
SELECT public.save_room_inspection_form(
  'move_in',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  'd4030000-0000-0000-0000-000000000003', null,
  jsonb_build_array(jsonb_build_object('item_key', 'room_other', 'item_label', 'Other', 'sort_order', 900, 'status', 'OTH', 'notes', 'Custom note')),
  null, 'd4030000-0000-0000-0000-000000000001', true
);

SELECT is(
  (SELECT count(*)::int FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1)),
  0,
  'save_room_inspection_form → OTH status does not create work order'
);

-- Multiple deficiency codes
DELETE FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1);

SELECT public.save_room_inspection_form(
  'move_in',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  'd4030000-0000-0000-0000-000000000003',
  (SELECT latest_move_in_form_id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  jsonb_build_array(
    jsonb_build_object('item_key', 'desk_top_l', 'item_label', 'Top L', 'sort_order', 80, 'status', 'DAM'),
    jsonb_build_object('item_key', 'desk_top_r', 'item_label', 'Top R', 'sort_order', 81, 'status', 'CLN'),
    jsonb_build_object('item_key', 'desk_chair_l', 'item_label', 'Chair', 'sort_order', 160, 'status', 'FIX'),
    jsonb_build_object('item_key', 'window_glass', 'item_label', 'Glass', 'sort_order', 200, 'status', 'REP'),
    jsonb_build_object('item_key', 'bed_locker_top_locker', 'item_label', 'Locker', 'sort_order', 300, 'status', 'MIS')
  ),
  null, 'd4030000-0000-0000-0000-000000000001', true
);

SELECT is(
  (SELECT count(*)::int FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1)),
  5,
  'save_room_inspection_form → each deficiency code creates one work order'
);

-- Re-save idempotent
SELECT public.save_room_inspection_form(
  'move_in',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  'd4030000-0000-0000-0000-000000000003',
  (SELECT latest_move_in_form_id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  (SELECT jsonb_agg(jsonb_build_object(
    'id', i.id, 'item_key', i.item_key, 'item_label', i.item_label, 'sort_order', i.sort_order, 'status', i.status
  )) FROM public.room_inspection_items i
  JOIN public.room_move_in_forms f ON f.id = i.move_in_form_id
  WHERE f.barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1)),
  null, 'd4030000-0000-0000-0000-000000000001', true
);

SELECT is(
  (SELECT count(*)::int FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1)),
  5,
  'save_room_inspection_form → re-save does not duplicate deficiency work orders'
);

-- Move-out + compare forms
SELECT public.save_room_inspection_form(
  'move_out',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  'd4030000-0000-0000-0000-000000000003', null,
  jsonb_build_array(
    jsonb_build_object('item_key', 'desk_top_l', 'item_label', 'Top L', 'sort_order', 80, 'status', 'INS'),
    jsonb_build_object('item_key', 'desk_top_r', 'item_label', 'Top R', 'sort_order', 81, 'status', 'DAM')
  ),
  null, null, true
);

SELECT set_config(
  'test.move_out_id',
  (SELECT latest_move_out_form_id::text FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
  false
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      public.compare_room_inspection_forms(
        (SELECT latest_move_in_form_id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
        current_setting('test.move_out_id')::uuid
      ) -> 'rows'
    )) elem
    WHERE (elem ->> 'item_key') = 'desk_top_l'
      AND (elem ->> 'changed')::boolean = true
  ),
  'compare_room_inspection_forms → marks item status changes between move-in and move-out'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      public.compare_room_inspection_forms(
        (SELECT latest_move_in_form_id FROM public.barracks_rooms WHERE room_number = 'A107' LIMIT 1),
        current_setting('test.move_out_id')::uuid
      ) -> 'rows'
    )) elem
    WHERE (elem ->> 'item_key') = 'desk_top_r'
      AND (elem ->> 'changed')::boolean = false
  ),
  'compare_room_inspection_forms → unchanged items flagged changed=false'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
