BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(14);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Reuse Day 08 work order fixtures
INSERT INTO public.companies (id, company_name) VALUES
  ('d4010000-0000-0000-0000-000000000001', 'Work Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('d4020000-0000-0000-0000-000000000001', 'Work Alpha TAC', 65, 'd4010000-0000-0000-0000-000000000001', true, false),
  ('d4020000-0000-0000-0000-000000000003', 'Work Cadet Leader', 15, 'd4010000-0000-0000-0000-000000000001', false, false)
ON CONFLICT (id) DO UPDATE SET
  default_role_level = EXCLUDED.default_role_level,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d4030000-0000-0000-0000-000000000001', 'work-alpha-tac@test.com'),
  ('d4030000-0000-0000-0000-000000000003', 'work-cadet-leader@test.com')
ON CONFLICT (id) DO NOTHING;

UPDATE auth.users
SET
  aud = coalesce(aud, 'authenticated'),
  role = coalesce(role, 'authenticated'),
  encrypted_password = coalesce(encrypted_password, '$2a$10$I2yqa/fBks6Ai/mPCiNit.00BDLcmDdLe2GVCKNCD6bpI4515ZKSq'),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  instance_id = coalesce(instance_id, '00000000-0000-0000-0000-000000000000'::uuid),
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
WHERE id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('d4030000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd4020000-0000-0000-0000-000000000001', 'd4010000-0000-0000-0000-000000000001', false),
  ('d4030000-0000-0000-0000-000000000003', 'Alex', 'Leader', 'd4020000-0000-0000-0000-000000000003', 'd4010000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id, archived = EXCLUDED.archived;

UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000001', company_id = 'd4010000-0000-0000-0000-000000000001'
WHERE id = 'd4030000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000003', company_id = 'd4010000-0000-0000-0000-000000000001'
WHERE id = 'd4030000-0000-0000-0000-000000000003';

DELETE FROM public.cadet_profiles WHERE profile_id = 'd4030000-0000-0000-0000-000000000001';
DELETE FROM public.staff_profiles WHERE profile_id IN ('d4030000-0000-0000-0000-000000000001', 'd4030000-0000-0000-0000-000000000003');

SELECT public.ensure_cadet_profile('d4030000-0000-0000-0000-000000000003');
SELECT public.ensure_staff_profile('d4030000-0000-0000-0000-000000000001');

UPDATE public.barracks_rooms
SET company_id = 'd4010000-0000-0000-0000-000000000001',
    occupant_top_bunk_id = null,
    occupant_bottom_bunk_id = null
WHERE company_letter = 'A';

UPDATE public.profiles
SET company_id = 'd4010000-0000-0000-0000-000000000001'
WHERE id IN ('d4030000-0000-0000-0000-000000000001', 'd4030000-0000-0000-0000-000000000003');

UPDATE public.barracks_rooms
SET occupant_top_bunk_id = null,
    occupant_bottom_bunk_id = null
WHERE room_number = 'A105';

UPDATE public.cadet_profiles SET room_number = null WHERE profile_id = 'd4030000-0000-0000-0000-000000000003';

SELECT ok(
  (SELECT count(*)::int FROM public.room_inspection_item_templates WHERE active = true) >= 35,
  'Inspection item templates seeded'
);

-- Assign bunk syncs room_number
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');

SELECT lives_ok(
  format(
    $$SELECT public.assign_barracks_bunk(
      (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
      'top',
      'd4030000-0000-0000-0000-000000000003'::uuid
    )$$
  ),
  'assign_barracks_bunk succeeds for TAC'
);

SELECT is(
  (SELECT room_number FROM public.cadet_profiles WHERE profile_id = 'd4030000-0000-0000-0000-000000000003'),
  'A105',
  'assign_barracks_bunk syncs cadet_profiles.room_number'
);

SELECT is(
  (SELECT occupant_top_bunk_id::text FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  'd4030000-0000-0000-0000-000000000003',
  'assign_barracks_bunk sets top bunk occupant'
);

-- Clear bunk clears room_number
SELECT lives_ok(
  format(
    $$SELECT public.clear_barracks_bunk(
      (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
      'top'
    )$$
  ),
  'clear_barracks_bunk succeeds'
);

SELECT is(
  (SELECT room_number FROM public.cadet_profiles WHERE profile_id = 'd4030000-0000-0000-0000-000000000003'),
  null,
  'clear_barracks_bunk clears cadet_profiles.room_number'
);

-- Re-assign for hallway + form tests
SELECT public.assign_barracks_bunk(
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  'bottom',
  'd4030000-0000-0000-0000-000000000003'
);

-- Hallway excludes archived occupants
UPDATE public.profiles SET archived = true WHERE id = 'd4030000-0000-0000-0000-000000000003';

SELECT is(
  (
    SELECT (elem -> 'occupant_bottom')::text
    FROM public.get_hallway_floor('A', 1) cross join lateral jsonb_array_elements(public.get_hallway_floor('A', 1) -> 'rooms') elem
    WHERE elem ->> 'room_number' = 'A105'
    LIMIT 1
  ),
  'null',
  'get_hallway_floor A105 shows vacant bottom when occupant archived'
);

UPDATE public.profiles SET archived = false WHERE id = 'd4030000-0000-0000-0000-000000000003';
SELECT public.assign_barracks_bunk(
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
  'bottom',
  'd4030000-0000-0000-0000-000000000003'
);

-- Save move-in form with deficiency creates work order (idempotent)
DELETE FROM public.work_order_audit_log WHERE work_order_id IN (
  SELECT id FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1)
);
DELETE FROM public.work_orders WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1);
DELETE FROM public.room_inspection_items WHERE move_in_form_id IN (
  SELECT id FROM public.room_move_in_forms WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1)
);
DELETE FROM public.room_move_in_forms WHERE barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');

SELECT ok(
  public.save_room_inspection_form(
    'move_in',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    'd4030000-0000-0000-0000-000000000003',
    null,
    jsonb_build_array(
      jsonb_build_object('item_key', 'desk_top_l', 'item_label', 'Top', 'sort_order', 80, 'status', 'DAM'),
      jsonb_build_object('item_key', 'desk_chair_l', 'item_label', 'Chair', 'sort_order', 160, 'status', 'INS')
    ),
    null,
    'd4030000-0000-0000-0000-000000000001',
    true
  ) is not null,
  'save_room_inspection_form creates move-in form'
);

SELECT is(
  (SELECT count(*)::int FROM public.work_orders wo
   WHERE wo.barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1)
     AND wo.issue_presets @> array['DAM']),
  1,
  'Deficiency on form save creates one work order'
);

-- Re-save same form with updated item should not duplicate work order
SELECT ok(
  public.save_room_inspection_form(
    'move_in',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    'd4030000-0000-0000-0000-000000000003',
    (SELECT latest_move_in_form_id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    (SELECT jsonb_agg(jsonb_build_object(
      'id', i.id,
      'item_key', i.item_key,
      'item_label', i.item_label,
      'sort_order', i.sort_order,
      'status', i.status
    )) FROM public.room_inspection_items i
    JOIN public.room_move_in_forms f ON f.id = i.move_in_form_id
    WHERE f.barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1)),
    null,
    'd4030000-0000-0000-0000-000000000001',
    true
  ) is not null,
  'Re-save move-in form succeeds'
);

SELECT is(
  (SELECT count(*)::int FROM public.work_orders wo
   WHERE wo.barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1)
     AND wo.issue_presets @> array['DAM']),
  1,
  'Re-save does not duplicate deficiency work order'
);

-- Move-out form completes year-close helper semantics
SELECT ok(
  public.save_room_inspection_form(
    'move_out',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    'd4030000-0000-0000-0000-000000000003',
    null,
    jsonb_build_array(
      jsonb_build_object('item_key', 'desk_top_l', 'item_label', 'Top', 'sort_order', 80, 'status', 'INS')
    ),
    null,
    null,
    true
  ) is not null,
  'save_room_inspection_form creates move-out form'
);

SELECT ok(
  NOT public._year_close_cadet_needs_move_out('d4030000-0000-0000-0000-000000000003'),
  'Completed move-out form clears year-close move-out pending'
);

-- Negative: cadet cannot assign bunk
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');
SELECT throws_ok(
  $$SELECT public.assign_barracks_bunk(
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    'top', 'd4030000-0000-0000-0000-000000000003'::uuid
  )$$,
  'P0001',
  '[assign_barracks_bunk] Permission denied',
  'assign_barracks_bunk → cadet cannot assign bunks'
);

SELECT * FROM finish();

ROLLBACK;
