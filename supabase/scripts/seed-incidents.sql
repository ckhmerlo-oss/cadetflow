-- Seed incident reports and trigger associated in-app notifications.
-- Safe to re-run: deletes fixture rows by fixed IDs first.

BEGIN;

DELETE FROM public.user_notifications
WHERE event_type IN ('incident.pending_review', 'incident.actioned')
  AND (
    idempotency_key LIKE 'incident.%:f1000000-0000-0000-0000-00000000000%'
    OR metadata->>'incident_id' IN (
      'f1000000-0000-0000-0000-000000000001',
      'f1000000-0000-0000-0000-000000000002',
      'f1000000-0000-0000-0000-000000000003',
      'f1000000-0000-0000-0000-000000000004',
      'f1000000-0000-0000-0000-000000000005',
      'f1000000-0000-0000-0000-000000000006'
    )
  );

DELETE FROM public.incident_reports
WHERE id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f1000000-0000-0000-0000-000000000002',
  'f1000000-0000-0000-0000-000000000003',
  'f1000000-0000-0000-0000-000000000004',
  'f1000000-0000-0000-0000-000000000005',
  'f1000000-0000-0000-0000-000000000006'
);

INSERT INTO public.user_preferences (user_id, in_app_new_report, in_app_status_change)
SELECT id, 'immediate'::public.notification_frequency, 'immediate'::public.notification_frequency
FROM public.profiles
WHERE id IN (
  'b0c0e9df-1061-4721-b589-75780bc64f9c',
  'f0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004'
)
ON CONFLICT (user_id) DO UPDATE
SET in_app_new_report = EXCLUDED.in_app_new_report,
    in_app_status_change = EXCLUDED.in_app_status_change;

INSERT INTO public.incident_reports (
  id,
  reporter_id,
  subject_cadet_id,
  description,
  location,
  incident_time,
  action_taken,
  status,
  created_at
)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000002',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet Private1 was disruptive during Algebra II — talking over instruction and refusing to take a seat after two warnings.',
    'Room 112',
    now() - interval '2 day',
    'Removed cadet to hallway; notified squad leader.',
    'pending',
    now() - interval '2 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000004',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet Private2 used a phone during study hall after being told to put it away.',
    'Study Hall B',
    now() - interval '1 day',
    'Phone confiscated for the period.',
    'pending',
    now() - interval '1 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000002',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet Private1 arrived to formation without cover and argued with the inspecting officer.',
    'Parade Field',
    now() - interval '5 day',
    'Sent back to barracks to retrieve cover.',
    'pending',
    now() - interval '5 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000003',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet Private2 was disrespectful to a classmate during US History group work.',
    'Room 204',
    now() - interval '4 day',
    'Separated students and documented statements.',
    'pending',
    now() - interval '4 day'
  ),
  (
    'f1000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'Cadet Private2 left formation early without permission during company drill.',
    'Parade Field — south end',
    now() - interval '6 hours',
    'Returned cadet to formation; documented with platoon sergeant.',
    'pending',
    now() - interval '6 hours'
  ),
  (
    'f1000000-0000-0000-0000-000000000006',
    'f0000000-0000-0000-0000-000000000004',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Cadet Private1 ate food in the academic building hallway in violation of mess hall policy.',
    'Academic Building — first floor',
    now() - interval '8 day',
    'Confiscated food; cadet cleaned the area.',
    'pending',
    now() - interval '8 day'
  );

UPDATE public.incident_reports
SET
  status = 'handled',
  resolved_at = now() - interval '3 day',
  resolved_by = 'f0000000-0000-0000-0000-000000000001',
  handled_by_id = 'f0000000-0000-0000-0000-000000000001',
  resolution_notes = 'Spoke with cadet and parent; cadet apologized to inspecting officer.',
  event_id = NULL
WHERE id = 'f1000000-0000-0000-0000-000000000003';

UPDATE public.incident_reports
SET
  status = 'converted',
  resolved_at = now() - interval '2 day',
  resolved_by = 'f0000000-0000-0000-0000-000000000001',
  resolution_notes = 'Converted to demerit report for disrespect.',
  event_id = NULL
WHERE id = 'f1000000-0000-0000-0000-000000000004';

UPDATE public.incident_reports
SET
  status = 'handled',
  resolved_at = now() - interval '7 day',
  resolved_by = 'f0000000-0000-0000-0000-000000000001',
  handled_by_id = 'f0000000-0000-0000-0000-000000000002',
  resolution_notes = 'Cadet mopped hallway; verbal warning logged with TAC.',
  event_id = NULL,
  flagged_for_review = false
WHERE id = 'f1000000-0000-0000-0000-000000000006';

UPDATE public.incident_reports
SET
  event_id = NULL,
  flagged_for_review = true
WHERE id = 'f1000000-0000-0000-0000-000000000002';

COMMIT;
