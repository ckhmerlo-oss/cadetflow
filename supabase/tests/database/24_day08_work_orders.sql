BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(40);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name) VALUES
  ('d4010000-0000-0000-0000-000000000001', 'Work Alpha Company'),
  ('d4010000-0000-0000-0000-000000000002', 'Work Beta Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster, can_manage_all_rosters)
VALUES
  ('d4020000-0000-0000-0000-000000000001', 'Work Alpha TAC', 65, 'd4010000-0000-0000-0000-000000000001', true, false),
  ('d4020000-0000-0000-0000-000000000002', 'Work Beta TAC', 65, 'd4010000-0000-0000-0000-000000000002', true, false),
  ('d4020000-0000-0000-0000-000000000003', 'Work Cadet Leader', 15, 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4020000-0000-0000-0000-000000000004', 'Maintenance Manager', 55, NULL, false, false),
  ('d4020000-0000-0000-0000-000000000005', 'Work Site Admin', 105, NULL, false, true),
  ('d4020000-0000-0000-0000-000000000006', 'Work Faculty', 50, NULL, false, false)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster,
  can_manage_all_rosters = EXCLUDED.can_manage_all_rosters;

INSERT INTO auth.users (id, email) VALUES
  ('d4030000-0000-0000-0000-000000000001', 'work-alpha-tac@test.com'),
  ('d4030000-0000-0000-0000-000000000002', 'work-beta-tac@test.com'),
  ('d4030000-0000-0000-0000-000000000003', 'work-cadet-leader@test.com'),
  ('d4030000-0000-0000-0000-000000000004', 'work-maintenance@test.com'),
  ('d4030000-0000-0000-0000-000000000005', 'work-admin@test.com'),
  ('d4030000-0000-0000-0000-000000000006', 'work-faculty@test.com')
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
  'd4030000-0000-0000-0000-000000000002',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000005',
  'd4030000-0000-0000-0000-000000000006'
);

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived, is_site_admin)
VALUES
  ('d4030000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd4020000-0000-0000-0000-000000000001', 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4030000-0000-0000-0000-000000000002', 'Beta', 'TAC', 'd4020000-0000-0000-0000-000000000002', 'd4010000-0000-0000-0000-000000000002', false, false),
  ('d4030000-0000-0000-0000-000000000003', 'Alex', 'Leader', 'd4020000-0000-0000-0000-000000000003', 'd4010000-0000-0000-0000-000000000001', false, false),
  ('d4030000-0000-0000-0000-000000000004', 'Mike', 'Maintenance', 'd4020000-0000-0000-0000-000000000004', NULL, false, false),
  ('d4030000-0000-0000-0000-000000000005', 'Site', 'Admin', 'd4020000-0000-0000-0000-000000000005', NULL, false, true),
  ('d4030000-0000-0000-0000-000000000006', 'Mary', 'Faculty', 'd4020000-0000-0000-0000-000000000006', NULL, false, false)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id,
  company_id = EXCLUDED.company_id,
  archived = EXCLUDED.archived,
  is_site_admin = EXCLUDED.is_site_admin;

DELETE FROM public.cadet_profiles WHERE profile_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000002',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000005',
  'd4030000-0000-0000-0000-000000000006'
);
DELETE FROM public.staff_profiles WHERE profile_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000002',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000005',
  'd4030000-0000-0000-0000-000000000006'
);

UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000001', company_id = 'd4010000-0000-0000-0000-000000000001' WHERE id = 'd4030000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000002', company_id = 'd4010000-0000-0000-0000-000000000002' WHERE id = 'd4030000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000003', company_id = 'd4010000-0000-0000-0000-000000000001' WHERE id = 'd4030000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000004' WHERE id = 'd4030000-0000-0000-0000-000000000004';
UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000005', is_site_admin = true WHERE id = 'd4030000-0000-0000-0000-000000000005';
UPDATE public.profiles SET role_id = 'd4020000-0000-0000-0000-000000000006' WHERE id = 'd4030000-0000-0000-0000-000000000006';

UPDATE public.barracks_rooms SET company_id = 'd4010000-0000-0000-0000-000000000001' WHERE room_number = 'A115';
UPDATE public.barracks_rooms SET company_id = 'd4010000-0000-0000-0000-000000000002' WHERE room_number = 'B101';

SELECT public.ensure_staff_profile('d4030000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('d4030000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('d4030000-0000-0000-0000-000000000004');
SELECT public.ensure_staff_profile('d4030000-0000-0000-0000-000000000005');
SELECT public.ensure_staff_profile('d4030000-0000-0000-0000-000000000006');
SELECT public.ensure_cadet_profile('d4030000-0000-0000-0000-000000000003');

INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.profiles
WHERE id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000002',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000006'
)
ON CONFLICT (user_id) DO NOTHING;

UPDATE public.user_preferences
SET in_app_new_report = 'immediate', in_app_status_change = 'immediate', email_status_change = 'immediate'
WHERE user_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000002',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004',
  'd4030000-0000-0000-0000-000000000006'
);

DELETE FROM public.user_notifications
WHERE user_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000003',
  'd4030000-0000-0000-0000-000000000004'
);

DELETE FROM public.notification_queue
WHERE user_id IN ('d4030000-0000-0000-0000-000000000004');

DELETE FROM public.work_order_audit_log
WHERE work_order_id IN (
  SELECT id FROM public.work_orders
  WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
);

DELETE FROM public.work_orders
WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
   OR source_inspection_item_id = 'd4040000-0000-0000-0000-000000000002';

SELECT ok(
  (SELECT count(*)::int FROM public.barracks_rooms) = 258,
  'barracks_rooms seed contains 258 rooms'
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.barracks_rooms WHERE room_number = 'A101'),
  'room 1 on floor 1 uses zero-padded index (A101)'
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.barracks_rooms WHERE room_number = 'A109'),
  'room 9 on floor 1 uses zero-padded index (A109)'
);

SELECT ok(
  EXISTS (SELECT 1 FROM public.barracks_rooms WHERE room_number = 'A110'),
  'room 10 on floor 1 is unpadded (A110)'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');

SELECT lives_ok(
  $$
    SELECT public.create_work_order(
      'barracks',
      'Broken lock on door',
      (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
      NULL,
      ARRAY['Broken lock']
    );
  $$,
  'cadet can submit barracks work order'
);

RESET ROLE;
SELECT set_config(
  'test.work_order_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000003' ORDER BY created_at DESC LIMIT 1),
  false
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.work_orders
    WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
      AND status = 'submitted'
  ),
  'new work order starts in submitted status'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE event_type = 'workorder.submitted'
      AND user_id IN (
        'd4030000-0000-0000-0000-000000000001',
        'd4030000-0000-0000-0000-000000000003'
      )
  ),
  'submitted notification fan-out reaches TAC or requester'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000002');

SELECT throws_ok(
  $$
    SELECT public.transition_work_order(
      current_setting('test.work_order_id')::uuid,
      'forward',
      'Should fail'
    );
  $$,
  'P0001',
  '[transition_work_order] Permission denied — action=forward status=submitted',
  'transition_work_order → cross-company TAC cannot forward work order'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');

SELECT lives_ok(
  $$
    SELECT public.transition_work_order(
      current_setting('test.work_order_id')::uuid,
      'forward',
      'Forward to maintenance'
    );
  $$,
  'company TAC can forward work order'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.work_orders
    WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
      AND status = 'forwarded'
  ),
  'forward updates status'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.work_order_audit_log
    WHERE work_order_id = current_setting('test.work_order_id')::uuid
      AND action = 'forward'
  ),
  'forward writes audit log entry'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000004');

SELECT lives_ok(
  $$
    SELECT public.transition_work_order(
      current_setting('test.work_order_id')::uuid,
      'assign',
      'Assigned to Mike',
      'd4030000-0000-0000-0000-000000000004'
    );
  $$,
  'maintenance can assign work order'
);

SELECT lives_ok(
  $$
    SELECT public.transition_work_order(
      current_setting('test.work_order_id')::uuid,
      'complete',
      'Fixed lock'
    );
  $$,
  'maintenance can complete work order'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');

SELECT ok(
  public.create_work_order_from_inspection_item(
    'd4040000-0000-0000-0000-000000000001',
    'd4040000-0000-0000-0000-000000000002',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
    'DAM',
    'Door lock',
    'd4030000-0000-0000-0000-000000000003'
  ) = public.create_work_order_from_inspection_item(
    'd4040000-0000-0000-0000-000000000001',
    'd4040000-0000-0000-0000-000000000002',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
    'DAM',
    'Door lock',
    'd4030000-0000-0000-0000-000000000003'
  ),
  'inspection work order creation is idempotent'
);

SELECT set_config(
  'test.inspection_work_order_id',
  (SELECT id::text FROM public.work_orders WHERE source_inspection_item_id = 'd4040000-0000-0000-0000-000000000002' LIMIT 1),
  false
);

UPDATE public.profiles SET archived = true WHERE id = 'd4030000-0000-0000-0000-000000000003';

DELETE FROM public.user_notifications
WHERE user_id = 'd4030000-0000-0000-0000-000000000003';

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');
SELECT public.transition_work_order(
  current_setting('test.inspection_work_order_id')::uuid,
  'forward',
  'fwd'
);
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000004');
SELECT public.transition_work_order(
  current_setting('test.inspection_work_order_id')::uuid,
  'assign',
  'assign',
  'd4030000-0000-0000-0000-000000000004'
);
SELECT public.transition_work_order(
  current_setting('test.inspection_work_order_id')::uuid,
  'complete',
  'done'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd4030000-0000-0000-0000-000000000003'
      AND event_type = 'workorder.completed'
  ),
  'archived requester does not receive completion notification'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.work_orders
    WHERE id = current_setting('test.work_order_id')::uuid
      AND company_id = 'd4010000-0000-0000-0000-000000000001'
  ),
  'barracks work order company_id matches room company'
);

-- Faculty submits shared-space issue → maintenance portal
DELETE FROM public.work_order_audit_log
WHERE work_order_id IN (
  SELECT id FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000006'
);
DELETE FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000006';

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000006');

SELECT lives_ok(
  $$
    SELECT public.create_work_order(
      'other',
      'Broken hallway light',
      NULL,
      'Main gymnasium',
      '{}'
    );
  $$,
  'faculty can submit other-space work order'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.work_orders
    WHERE requester_id = 'd4030000-0000-0000-0000-000000000006'
      AND status = 'forwarded'
      AND issue_type = 'other'
  ),
  'other-space work order lands in maintenance portal as forwarded'
);

-- Cross-company barracks routing: faculty reports Bravo room → Beta TAC (not submitter company)
DELETE FROM public.user_notifications
WHERE user_id IN (
  'd4030000-0000-0000-0000-000000000001',
  'd4030000-0000-0000-0000-000000000002'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000006');

SELECT lives_ok(
  $$
    SELECT public.create_work_order(
      'barracks',
      'Issue in bravo room',
      (SELECT id FROM public.barracks_rooms WHERE room_number = 'B101' LIMIT 1),
      NULL,
      '{}'
    );
  $$,
  'faculty can submit barracks work order routed to room company TAC'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.work_orders
    WHERE requester_id = 'd4030000-0000-0000-0000-000000000006'
      AND barracks_room_id = (SELECT id FROM public.barracks_rooms WHERE room_number = 'B101' LIMIT 1)
      AND company_id = 'd4010000-0000-0000-0000-000000000002'
  ),
  'cross-company barracks order company_id is bravo room company'
);

RESET ROLE;

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE event_type = 'workorder.submitted'
      AND user_id = 'd4030000-0000-0000-0000-000000000002'
  ),
  'bravo room work order notifies bravo company TAC'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE event_type = 'workorder.submitted'
      AND user_id = 'd4030000-0000-0000-0000-000000000001'
      AND body ilike '%B101%'
  ),
  'alpha TAC is not notified for bravo room work order'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000005');

SELECT ok(
  (public.get_year_close_preflight('2026-2027', '2027-2028') -> 'informational' ->> 'open_work_orders')::int >= 0,
  'preflight informational open_work_orders is populated from work_orders table'
);

-- Scoped work order views
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');

SELECT ok(
  (SELECT count(*) FROM public.get_my_work_orders('actionable')) >= 0,
  'cadet can query actionable work orders scope'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.get_my_work_orders('actionable') wo
    WHERE wo.requester_id <> 'd4030000-0000-0000-0000-000000000003'
  ),
  'cadet actionable scope is limited to own submissions'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.get_my_work_orders('actionable') wo
    WHERE wo.company_id IS NOT NULL
      AND wo.company_id <> 'd4010000-0000-0000-0000-000000000001'
  ),
  'alpha TAC actionable scope is company-scoped'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000004');

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.get_my_work_orders('actionable') wo
    WHERE wo.status NOT IN ('forwarded', 'assigned')
  ),
  'maintenance actionable scope is forwarded/assigned only'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM (
      SELECT created_at, row_number() OVER () AS rn
      FROM public.get_work_order_audit_log(current_setting('test.work_order_id')::uuid)
    ) o1
    JOIN (
      SELECT created_at, row_number() OVER () AS rn
      FROM public.get_work_order_audit_log(current_setting('test.work_order_id')::uuid)
    ) o2 ON o2.rn = o1.rn + 1
    WHERE o1.created_at < o2.created_at
  ),
  'audit log returns newest entries first'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM public.work_order_audit_log wal
    WHERE wal.work_order_id = current_setting('test.work_order_id')::uuid
      AND wal.action = 'forward'
      AND wal.metadata ? 'email_recipients'
  ),
  'forward audit metadata includes email recipients'
);

-- Cancel path: TAC can cancel submitted order
DELETE FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
  AND status = 'submitted'
  AND id <> current_setting('test.work_order_id')::uuid;

RESET ROLE;
UPDATE public.profiles
SET role_id = 'd4020000-0000-0000-0000-000000000003', archived = false, company_id = 'd4010000-0000-0000-0000-000000000001'
WHERE id = 'd4030000-0000-0000-0000-000000000003';
DELETE FROM public.staff_profiles WHERE profile_id = 'd4030000-0000-0000-0000-000000000003';
SELECT public.ensure_cadet_profile('d4030000-0000-0000-0000-000000000003');

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');
SELECT lives_ok(
  $$SELECT public.create_work_order(
    'barracks', 'Cancel test',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
    NULL, '{}'
  )$$,
  'create_work_order → cadet leader can submit barracks work order for cancel test'
);

SELECT set_config(
  'test.cancel_wo_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
   AND status = 'submitted' ORDER BY created_at DESC LIMIT 1),
  false
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');
SELECT throws_ok(
  $$SELECT public.transition_work_order(current_setting('test.cancel_wo_id')::uuid, 'cancel', 'cadet attempt')$$,
  'P0001',
  NULL,
  'transition_work_order → cadet cannot cancel work order'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');
SELECT lives_ok(
  $$SELECT public.transition_work_order(current_setting('test.cancel_wo_id')::uuid, 'cancel', 'No longer needed')$$,
  'transition_work_order → TAC can cancel submitted work order'
);

-- In-app workorder.forwarded and workorder.assigned notifications
DELETE FROM public.user_notifications WHERE event_type IN ('workorder.forwarded', 'workorder.assigned');
DELETE FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000001';

UPDATE public.user_preferences
SET in_app_status_change = 'immediate'
WHERE user_id = 'd4030000-0000-0000-0000-000000000004';

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');
SELECT public.create_work_order(
  'barracks', 'Notify forward test',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
  NULL, '{}'
);

SELECT set_config(
  'test.notify_wo_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000003'
   AND status = 'submitted' ORDER BY created_at DESC LIMIT 1),
  false
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');
SELECT public.transition_work_order(current_setting('test.notify_wo_id')::uuid, 'forward', 'fwd');

RESET ROLE;
SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE event_type = 'workorder.forwarded'
      AND user_id = 'd4030000-0000-0000-0000-000000000004'
  ),
  'notify_work_order → workorder.forwarded in-app to maintenance'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000004');
SELECT public.transition_work_order(
  current_setting('test.notify_wo_id')::uuid, 'assign', 'assign me', 'd4030000-0000-0000-0000-000000000004'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE event_type = 'workorder.assigned'
      AND user_id = 'd4030000-0000-0000-0000-000000000004'
  ),
  'notify_work_order → workorder.assigned in-app to assignee'
);

-- Admin read-all actionable scope
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000005');
SELECT ok(
  (SELECT count(*) FROM public.get_my_work_orders('actionable')) >= 1,
  'get_my_work_orders → admin actionable scope includes cross-company orders'
);

-- Invalid transition message includes function prefix and context
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000001');
SELECT public.create_work_order(
  'barracks', 'Invalid transition test',
  (SELECT id FROM public.barracks_rooms WHERE room_number = 'A115' LIMIT 1),
  NULL, '{}'
);

SELECT set_config(
  'test.invalid_wo_id',
  (SELECT id::text FROM public.work_orders WHERE requester_id = 'd4030000-0000-0000-0000-000000000001'
   AND status = 'submitted' ORDER BY created_at DESC LIMIT 1),
  false
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000004');
SELECT throws_ok(
  $$SELECT public.transition_work_order(
    current_setting('test.invalid_wo_id')::uuid,
    'assign',
    'bad assign',
    'd4030000-0000-0000-0000-000000000004'::uuid
  )$$,
  'P0001',
  '[transition_work_order] Invalid transition — status=submitted action=assign',
  'transition_work_order → invalid transition includes function prefix and context'
);

-- Maintenance staff helpers and detail edits
SELECT public.mock_auth('d4030000-0000-0000-0000-000000000004');
SELECT ok(
  public.is_maintenance_staff(),
  'is_maintenance_staff → true for maintenance role'
);

SELECT lives_ok(
  $$SELECT public.update_work_order_details(
    current_setting('test.notify_wo_id')::uuid,
    'Updated maintenance description',
    ARRAY['Plumbing leak'],
    'Internal maintenance notes'
  )$$,
  'update_work_order_details → maintenance can edit forwarded work order'
);

SELECT is(
  (SELECT description FROM public.work_orders WHERE id = current_setting('test.notify_wo_id')::uuid),
  'Updated maintenance description',
  'update_work_order_details → description persisted'
);

SELECT public.mock_auth('d4030000-0000-0000-0000-000000000003');
SELECT throws_ok(
  $$SELECT public.update_work_order_details(
    current_setting('test.notify_wo_id')::uuid,
    'Cadet edit attempt',
    '{}',
    null
  )$$,
  'P0001',
  'Permission denied',
  'update_work_order_details → cadet cannot edit work order details'
);

SELECT * FROM finish();
ROLLBACK;
