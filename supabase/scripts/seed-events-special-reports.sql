-- Seed Day 10 events and special reports (+ linked incident reports, in-app notifications).
-- Safe to re-run: deletes fixture rows by fixed IDs first.
--
-- Organizer layout (login tac@test.email → /incidents):
--   Inbox — unfiled pending: incidents f100…001, f100…002, f100…005; special f301…005, f301…008
--   Resolved archive — unfiled terminal: incidents f100…003 (handled), f100…004 (converted), f100…006 (handled);
--     special f301…006 (reviewed), f301…007 (closed)
--   Events — linked filings: special f301…001–004 on events f300…001–003

BEGIN;

DELETE FROM public.user_notifications
WHERE event_type IN (
    'special_report.action_required',
    'special_report.reviewed',
    'event.action_required',
    'event.status_changed'
  )
  AND (
    idempotency_key LIKE 'special_report.%:f3010000-0000-0000-0000-00000000000%'
    OR idempotency_key LIKE 'event.%:f3000000-0000-0000-0000-00000000000%'
    OR metadata->>'special_report_id' IN (
      'f3010000-0000-0000-0000-000000000001',
      'f3010000-0000-0000-0000-000000000002',
      'f3010000-0000-0000-0000-000000000003',
      'f3010000-0000-0000-0000-000000000004',
      'f3010000-0000-0000-0000-000000000005',
      'f3010000-0000-0000-0000-000000000006',
      'f3010000-0000-0000-0000-000000000007',
      'f3010000-0000-0000-0000-000000000008'
    )
    OR metadata->>'event_id' IN (
      'f3000000-0000-0000-0000-000000000001',
      'f3000000-0000-0000-0000-000000000002',
      'f3000000-0000-0000-0000-000000000003',
      'f3000000-0000-0000-0000-000000000004'
    )
  );

DELETE FROM public.special_report_audit_log
WHERE special_report_id IN (
  'f3010000-0000-0000-0000-000000000001',
  'f3010000-0000-0000-0000-000000000002',
  'f3010000-0000-0000-0000-000000000003',
  'f3010000-0000-0000-0000-000000000004',
  'f3010000-0000-0000-0000-000000000005',
  'f3010000-0000-0000-0000-000000000006',
  'f3010000-0000-0000-0000-000000000007',
  'f3010000-0000-0000-0000-000000000008'
);

DELETE FROM public.special_reports
WHERE id IN (
  'f3010000-0000-0000-0000-000000000001',
  'f3010000-0000-0000-0000-000000000002',
  'f3010000-0000-0000-0000-000000000003',
  'f3010000-0000-0000-0000-000000000004',
  'f3010000-0000-0000-0000-000000000005',
  'f3010000-0000-0000-0000-000000000006',
  'f3010000-0000-0000-0000-000000000007',
  'f3010000-0000-0000-0000-000000000008'
);

UPDATE public.incident_reports
SET event_id = NULL
WHERE event_id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000004'
);

DELETE FROM public.events
WHERE id IN (
  'f3000000-0000-0000-0000-000000000001',
  'f3000000-0000-0000-0000-000000000002',
  'f3000000-0000-0000-0000-000000000003',
  'f3000000-0000-0000-0000-000000000004'
);

INSERT INTO public.user_preferences (user_id, in_app_new_report, in_app_status_change)
SELECT id, 'immediate'::public.notification_frequency, 'immediate'::public.notification_frequency
FROM public.profiles
WHERE id IN (
  'b0c0e9df-1061-4721-b589-75780bc64f9c',
  'f0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (user_id) DO UPDATE
SET in_app_new_report = EXCLUDED.in_app_new_report,
    in_app_status_change = EXCLUDED.in_app_status_change;

INSERT INTO public.events (
  id,
  title,
  summary,
  status,
  school_year,
  created_by,
  created_at,
  updated_at,
  closed_at,
  closed_by
)
VALUES
  (
    'f3000000-0000-0000-0000-000000000001',
    'Barracks Third Deck altercation',
    'Multiple cadet affidavits and faculty incident reports grouped for Alpha Company command review.',
    'under_review',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '3 day',
    now() - interval '1 day',
    NULL,
    NULL
  ),
  (
    'f3000000-0000-0000-0000-000000000002',
    'Parade field cover dispute follow-up',
    'Follow-up event linking cadet affidavit to the handled parade-field incident.',
    'open',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '4 day',
    now() - interval '4 day',
    NULL,
    NULL
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'Study hall phone policy — February',
    'Closed event after incident was converted to a demerit report; affidavit retained for record.',
    'closed',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '14 day',
    now() - interval '2 day',
    now() - interval '2 day',
    'f0000000-0000-0000-0000-000000000001'
  ),
  (
    'f3000000-0000-0000-0000-000000000004',
    'Mess hall conduct concern',
    'TAC-created event awaiting linked filings after cadet tip.',
    'open',
    '2025-2026',
    'f0000000-0000-0000-0000-000000000001',
    now() - interval '6 hours',
    now() - interval '6 hours',
    NULL,
    NULL
  );

INSERT INTO public.special_reports (
  id,
  submitter_cadet_id,
  subject_cadet_id,
  narrative,
  location,
  occurred_at,
  involvement_type,
  status,
  event_id,
  school_year,
  created_at,
  updated_at
)
VALUES
  (
    'f3010000-0000-0000-0000-000000000001',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'I was walking to the latrine on Third Deck when I heard shouting from A105. Cadet Private2 pushed Cadet Private1 against the bunk frame after an argument about lights-out. I did not intervene but stayed within earshot until the squad leader arrived.',
    'Barracks A — Third Deck hallway',
    now() - interval '3 day 30 minutes',
    'witness',
    'submitted',
    'f3000000-0000-0000-0000-000000000001',
    '2025-2026',
    now() - interval '3 day',
    now() - interval '3 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000002',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'Private1 kept the overhead light on after taps while I was trying to sleep. I asked him twice to turn it off and he refused. I admit I raised my voice and stepped toward his bunk, but I did not intend to fight.',
    'Barracks A — Room A105',
    now() - interval '3 day 45 minutes',
    'participant',
    'reviewed',
    'f3000000-0000-0000-0000-000000000001',
    '2025-2026',
    now() - interval '2 day 20 hours',
    now() - interval '1 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000003',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'During morning formation I realized my cover was still in my room. I asked to be dismissed to retrieve it and the inspecting officer told me to fall out immediately. I spoke back because I felt the instruction was unclear, which I now understand was disrespectful.',
    'Parade Field — Alpha Company formation',
    now() - interval '5 day 15 minutes',
    'participant',
    'submitted',
    'f3000000-0000-0000-0000-000000000002',
    '2025-2026',
    now() - interval '4 day',
    now() - interval '4 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000004',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'I used my phone during study hall to check a message from my parent. The proctor asked me to put it away and I did, but I was frustrated and made a comment under my breath. I understand why the incident report was filed.',
    'Study Hall B',
    now() - interval '4 day',
    'participant',
    'reviewed',
    'f3000000-0000-0000-0000-000000000003',
    '2025-2026',
    now() - interval '4 day',
    now() - interval '2 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000005',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    NULL,
    'At dinner I saw two upperclassmen pressuring a new cadet to eat faster and make fun of how he cut his food. I did not know their names but they wore Bravo Company pins. I am submitting this in case leadership wants to follow up.',
    'Cadet Mess — main serving line',
    now() - interval '8 hours',
    'witness',
    'submitted',
    NULL,
    '2025-2026',
    now() - interval '7 hours',
    now() - interval '7 hours'
  ),
  (
    'f3010000-0000-0000-0000-000000000006',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    'I heard cadets running in the barracks hallway after taps. By the time I looked out, they had gone back into their rooms. No names, but it was on Second Deck near the stairwell.',
    'Barracks A — Second Deck',
    now() - interval '10 day',
    'witness',
    'reviewed',
    NULL,
    '2025-2026',
    now() - interval '10 day',
    now() - interval '8 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000007',
    'fa677a4b-ce1a-4725-b70b-8d4afa328bbe',
    NULL,
    'Submitted a report about a loud argument in the dayroom that turned out to be a misunderstanding between friends. No discipline action needed.',
    'Barracks A — Dayroom',
    now() - interval '12 day',
    'witness',
    'closed',
    NULL,
    '2025-2026',
    now() - interval '12 day',
    now() - interval '11 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000008',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    '47bd1324-e8ea-4a4b-8d27-9c1592d71770',
    'During PT I slipped on a wet patch near the track and scraped my knee. I want it on record in case the cut gets worse, though I did not see anyone cause it.',
    'Track — east straightaway',
    now() - interval '18 hours',
    'participant',
    'submitted',
    NULL,
    '2025-2026',
    now() - interval '17 hours',
    now() - interval '17 hours'
  );

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '1 day',
  review_notes = 'Interview scheduled with both roommates; statements consistent with hallway witness account.'
WHERE id = 'f3010000-0000-0000-0000-000000000002';

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '2 day',
  review_notes = 'Reviewed; incident converted to demerit report. No further action on affidavit.'
WHERE id = 'f3010000-0000-0000-0000-000000000004';

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '8 day',
  review_notes = 'Reviewed; no further action required beyond verbal reminder about hallway noise.',
  flagged_for_review = false
WHERE id = 'f3010000-0000-0000-0000-000000000006';

UPDATE public.special_reports
SET
  reviewed_by = 'f0000000-0000-0000-0000-000000000001',
  reviewed_at = now() - interval '11 day',
  review_notes = 'Closed — misunderstanding confirmed with both cadets present.',
  flagged_for_review = false
WHERE id = 'f3010000-0000-0000-0000-000000000007';

UPDATE public.special_reports
SET flagged_for_review = true
WHERE id = 'f3010000-0000-0000-0000-000000000005';

-- Incidents stay unfiled for inbox / resolved archive; only special reports link to events.

INSERT INTO public.special_report_audit_log (
  special_report_id,
  actor_id,
  action,
  details,
  created_at
)
VALUES
  (
    'f3010000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'status_change',
    '{"from":"submitted","to":"reviewed","notes":"Interview scheduled with both roommates; statements consistent with hallway witness account."}'::jsonb,
    now() - interval '1 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    'status_change',
    '{"from":"submitted","to":"reviewed","notes":"Reviewed; incident converted to demerit report. No further action on affidavit."}'::jsonb,
    now() - interval '2 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000006',
    'f0000000-0000-0000-0000-000000000001',
    'marked_reviewed',
    '{"notes":"Reviewed; no further action required beyond verbal reminder about hallway noise."}'::jsonb,
    now() - interval '8 day'
  ),
  (
    'f3010000-0000-0000-0000-000000000007',
    'f0000000-0000-0000-0000-000000000001',
    'closed',
    '{"notes":"Closed — misunderstanding confirmed with both cadets present."}'::jsonb,
    now() - interval '11 day'
  );

COMMIT;
