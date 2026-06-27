BEGIN;

DELETE FROM public.work_order_audit_log
WHERE work_order_id IN (
  'f2000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f2000000-0000-0000-0000-000000000003',
  'f2000000-0000-0000-0000-000000000004',
  'f2000000-0000-0000-0000-000000000005'
);

DELETE FROM public.work_orders
WHERE id IN (
  'f2000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002',
  'f2000000-0000-0000-0000-000000000003',
  'f2000000-0000-0000-0000-000000000004',
  'f2000000-0000-0000-0000-000000000005'
);

INSERT INTO public.work_orders (
  id, requester_id, company_id, barracks_room_id, location, issue_type,
  issue_presets, description, priority, status, created_at
)
VALUES
  (
    'f2000000-0000-0000-0000-000000000001',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    NULL, 'barracks', ARRAY['Broken lock', 'Lighting fixture'],
    'Deadbolt sticks and the overhead light flickers after taps.',
    'high', 'submitted', now() - interval '2 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A110' LIMIT 1),
    NULL, 'barracks', ARRAY['HVAC / temperature'],
    'Room runs hot even with the vent fully open.',
    'normal', 'tac_review', now() - interval '1 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A105' LIMIT 1),
    NULL, 'barracks', ARRAY['Plumbing leak'],
    'Slow drip under the sink; towel needed to keep floor dry.',
    'normal', 'forwarded', now() - interval '5 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000004',
    NULL, NULL, 'Main gymnasium — east bleachers', 'other', '{}',
    'Loose handrail on the east bleacher section.',
    'urgent', 'forwarded', now() - interval '3 day'
  ),
  (
    'f2000000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'c0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.barracks_rooms WHERE room_number = 'A110' LIMIT 1),
    NULL, 'barracks', ARRAY['Window damage'],
    'Cracked window pane replaced last month — closed out.',
    'low', 'completed', now() - interval '10 day'
  );

INSERT INTO public.work_order_audit_log (
  work_order_id, actor_id, action, old_status, new_status, comment, created_at
)
VALUES
  ('f2000000-0000-0000-0000-000000000001', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'submitted', NULL, 'submitted', 'Work order submitted for barracks room TAC review', now() - interval '2 day'),
  ('f2000000-0000-0000-0000-000000000002', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'submitted', NULL, 'submitted', 'Work order submitted for barracks room TAC review', now() - interval '1 day'),
  ('f2000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'start_review', 'submitted', 'tac_review', NULL, now() - interval '20 hours'),
  ('f2000000-0000-0000-0000-000000000003', '47bd1324-e8ea-4a4b-8d27-9c1592d71770', 'submitted', NULL, 'submitted', 'Work order submitted for barracks room TAC review', now() - interval '5 day'),
  ('f2000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'forward', 'tac_review', 'forwarded', 'Forwarded to maintenance.', now() - interval '4 day'),
  ('f2000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 'submitted_to_maintenance', NULL, 'forwarded', 'Work order submitted directly to maintenance', now() - interval '3 day'),
  ('f2000000-0000-0000-0000-000000000005', 'fa677a4b-ce1a-4725-b70b-8d4afa328bbe', 'submitted', NULL, 'submitted', 'Work order submitted for barracks room TAC review', now() - interval '10 day'),
  ('f2000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'forward', 'submitted', 'forwarded', NULL, now() - interval '9 day'),
  ('f2000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'complete', 'forwarded', 'completed', 'Window repair verified.', now() - interval '7 day');

COMMIT;
