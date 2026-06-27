BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(12);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

-- Fixtures
INSERT INTO public.companies (id, company_name) VALUES
  ('e4010000-0000-0000-0000-000000000001', 'Invite Alpha Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('e4020000-0000-0000-0000-000000000001', 'Invite Alpha TAC', 65, 'e4010000-0000-0000-0000-000000000001', true, false),
  ('e4020000-0000-0000-0000-000000000002', 'Invite Cadet', 10, 'e4010000-0000-0000-0000-000000000001', false, false),
  ('e7110000-0000-0000-0000-000000000001', 'Parent', 15, null, false, false)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level;

INSERT INTO auth.users (id, email) VALUES
  ('e4030000-0000-0000-0000-000000000001', 'invite-tac@test.com'),
  ('e4030000-0000-0000-0000-000000000002', 'invite-cadet@test.com'),
  ('e4030000-0000-0000-0000-000000000003', 'invite-parent@test.com')
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
  'e4030000-0000-0000-0000-000000000001',
  'e4030000-0000-0000-0000-000000000002',
  'e4030000-0000-0000-0000-000000000003'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('e4030000-0000-0000-0000-000000000001', 'TAC', 'Invite', 'e4020000-0000-0000-0000-000000000001', 'e4010000-0000-0000-0000-000000000001', false),
  ('e4030000-0000-0000-0000-000000000002', 'Cadet', 'Invite', 'e4020000-0000-0000-0000-000000000002', 'e4010000-0000-0000-0000-000000000001', false),
  ('e4030000-0000-0000-0000-000000000003', 'Parent', 'Invite', 'e7110000-0000-0000-0000-000000000001', null, false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id, company_id = EXCLUDED.company_id;

DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'e4030000-0000-0000-0000-000000000001',
  'e4030000-0000-0000-0000-000000000002',
  'e4030000-0000-0000-0000-000000000003'
);
DELETE FROM public.staff_profiles WHERE profile_id IN (
  'e4030000-0000-0000-0000-000000000001',
  'e4030000-0000-0000-0000-000000000002',
  'e4030000-0000-0000-0000-000000000003'
);

UPDATE public.profiles SET role_id = 'e4020000-0000-0000-0000-000000000001', company_id = 'e4010000-0000-0000-0000-000000000001'
WHERE id = 'e4030000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'e4020000-0000-0000-0000-000000000002', company_id = 'e4010000-0000-0000-0000-000000000001'
WHERE id = 'e4030000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'e7110000-0000-0000-0000-000000000001'
WHERE id = 'e4030000-0000-0000-0000-000000000003';

SELECT public.ensure_staff_profile('e4030000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('e4030000-0000-0000-0000-000000000002');

UPDATE public.barracks_rooms
SET company_id = 'e4010000-0000-0000-0000-000000000001',
    occupant_top_bunk_id = 'e4030000-0000-0000-0000-000000000002',
    occupant_bottom_bunk_id = null
WHERE room_number = 'A105';

-- TAC creates invite
SELECT public.mock_auth('e4030000-0000-0000-0000-000000000001');

SELECT set_config(
  'test.invite_token',
  (SELECT public.create_move_in_invite(
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105'),
    'e4030000-0000-0000-0000-000000000002',
    'invite-parent@test.com',
    'top',
    'left',
    14
  ) ->> 'token'),
  false
);

SELECT ok(
  current_setting('test.invite_token') IS NOT NULL,
  'TAC can create move-in invite with token'
);

-- Parent redeems and submits external form (no work orders yet)
SELECT public.mock_auth('e4030000-0000-0000-0000-000000000003');

SELECT lives_ok(
  $$SELECT public.redeem_parent_invite(current_setting('test.invite_token'))$$,
  'Parent can redeem invite'
);

SELECT ok(
  (SELECT count(*)::int FROM public.cadet_parent_links
   WHERE cadet_profile_id = 'e4030000-0000-0000-0000-000000000002'
     AND parent_profile_id = 'e4030000-0000-0000-0000-000000000003'
     AND status = 'active') = 1,
  'Cadet-parent link created on redeem'
);

-- Parent submits external form on a fresh invite (no work orders until TAC validates)
SELECT public.mock_auth('e4030000-0000-0000-0000-000000000001');

WITH inv AS (
  SELECT public.create_move_in_invite(
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105'),
    'e4030000-0000-0000-0000-000000000002',
    'invite-parent@test.com',
    'top',
    'left',
    14
  ) AS payload
)
SELECT
  set_config('test.external_token', (SELECT payload ->> 'token' FROM inv), false),
  set_config('test.external_form_id', (SELECT payload ->> 'form_id' FROM inv), false);

SELECT public.mock_auth('e4030000-0000-0000-0000-000000000003');

SELECT lives_ok(
  $$SELECT public.redeem_parent_invite(current_setting('test.external_token'))$$,
  'Parent can redeem invite for external submit'
);

SELECT lives_ok(
  $$SELECT public.save_move_in_form_external(
    current_setting('test.external_form_id')::uuid,
    jsonb_build_array(jsonb_build_object(
      'item_key', 'door_body', 'item_label', 'Body', 'sort_order', 10, 'status', 'DAM', 'notes', 'scratch'
    )),
    'parent note',
    true
  )$$,
  'Parent can save external move-in form'
);

SELECT ok(
  (SELECT submission_status FROM public.room_move_in_forms
   WHERE id = current_setting('test.external_form_id')::uuid) = 'submitted',
  'External submit sets submission_status submitted'
);

SELECT ok(
  (SELECT count(*)::int FROM public.work_orders wo
   JOIN public.room_inspection_items i ON i.id = wo.source_inspection_item_id
   WHERE i.move_in_form_id = current_setting('test.external_form_id')::uuid) = 0,
  'No work orders until TAC validates'
);

-- TAC validates
SELECT public.mock_auth('e4030000-0000-0000-0000-000000000001');

SELECT lives_ok(
  $$SELECT public.validate_move_in_form(current_setting('test.external_form_id')::uuid)$$,
  'TAC can validate submitted form'
);

SELECT ok(
  (SELECT count(*)::int FROM public.work_orders wo
   JOIN public.room_inspection_items i ON i.id = wo.source_inspection_item_id
   WHERE i.move_in_form_id = current_setting('test.external_form_id')::uuid) >= 1,
  'Work orders created after validation'
);

SELECT ok(
  (SELECT submission_status FROM public.room_move_in_forms
   WHERE id = current_setting('test.external_form_id')::uuid) = 'validated',
  'Validated form has submission_status validated'
);

SELECT ok(
  (SELECT latest_move_in_form_id FROM public.barracks_rooms WHERE room_number = 'A105') IS NOT NULL,
  'latest_move_in_form_id updated on validation'
);

-- Parent cannot update validated form
SELECT public.mock_auth('e4030000-0000-0000-0000-000000000003');

SELECT throws_ok(
  $$SELECT public.save_move_in_form_external(
    current_setting('test.external_form_id')::uuid,
    '[]'::jsonb,
    null,
    false
  )$$,
  'Form already validated',
  'Parent cannot update after validation'
);

SELECT * FROM finish();
ROLLBACK;
