BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(6);

-- Fixture IDs (d38 prefix)
-- d381...001 alpha company, d381...002 beta company
-- d382...001 tac role (alpha), d382...002 teacher role, d382...003 cadet role, d382...004 beta tac role
-- d383...001 alpha tac, d383...002 teacher, d383...003 cadet, d383...004 beta tac
-- d384...001 incident

INSERT INTO public.companies (id, company_name) VALUES
  ('d3810000-0000-0000-0000-000000000001', 'Incident Alpha Company'),
  ('d3810000-0000-0000-0000-000000000002', 'Incident Beta Company')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO public.roles (id, role_name, default_role_level, company_id, can_manage_own_company_roster)
VALUES
  ('d3820000-0000-0000-0000-000000000001', 'Incident Alpha TAC', 65, 'd3810000-0000-0000-0000-000000000001', true),
  ('d3820000-0000-0000-0000-000000000002', 'Incident Teacher', 50, NULL, false),
  ('d3820000-0000-0000-0000-000000000003', 'Incident Cadet', 0, 'd3810000-0000-0000-0000-000000000001', false),
  ('d3820000-0000-0000-0000-000000000004', 'Incident Beta TAC', 65, 'd3810000-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  default_role_level = EXCLUDED.default_role_level,
  company_id = EXCLUDED.company_id,
  can_manage_own_company_roster = EXCLUDED.can_manage_own_company_roster;

INSERT INTO auth.users (id, email) VALUES
  ('d3830000-0000-0000-0000-000000000001', 'incident-alpha-tac@test.com'),
  ('d3830000-0000-0000-0000-000000000002', 'incident-teacher@test.com'),
  ('d3830000-0000-0000-0000-000000000003', 'incident-cadet@test.com'),
  ('d3830000-0000-0000-0000-000000000004', 'incident-beta-tac@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('d3830000-0000-0000-0000-000000000001', 'Alpha', 'TAC', 'd3820000-0000-0000-0000-000000000001', 'd3810000-0000-0000-0000-000000000001', false),
  ('d3830000-0000-0000-0000-000000000002', 'Mary', 'Teacher', 'd3820000-0000-0000-0000-000000000002', NULL, false),
  ('d3830000-0000-0000-0000-000000000003', 'Alex', 'Cadet', 'd3820000-0000-0000-0000-000000000003', 'd3810000-0000-0000-0000-000000000001', false),
  ('d3830000-0000-0000-0000-000000000004', 'Beta', 'TAC', 'd3820000-0000-0000-0000-000000000004', 'd3810000-0000-0000-0000-000000000002', false)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id,
  company_id = EXCLUDED.company_id,
  archived = EXCLUDED.archived;

UPDATE public.profiles SET role_id = 'd3820000-0000-0000-0000-000000000001', company_id = 'd3810000-0000-0000-0000-000000000001' WHERE id = 'd3830000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role_id = 'd3820000-0000-0000-0000-000000000002' WHERE id = 'd3830000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role_id = 'd3820000-0000-0000-0000-000000000003', company_id = 'd3810000-0000-0000-0000-000000000001' WHERE id = 'd3830000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role_id = 'd3820000-0000-0000-0000-000000000004', company_id = 'd3810000-0000-0000-0000-000000000002' WHERE id = 'd3830000-0000-0000-0000-000000000004';

SELECT public.ensure_staff_profile('d3830000-0000-0000-0000-000000000001');
SELECT public.ensure_staff_profile('d3830000-0000-0000-0000-000000000002');
SELECT public.ensure_staff_profile('d3830000-0000-0000-0000-000000000004');
SELECT public.ensure_cadet_profile('d3830000-0000-0000-0000-000000000003');

INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.profiles
WHERE id IN (
  'd3830000-0000-0000-0000-000000000001',
  'd3830000-0000-0000-0000-000000000002',
  'd3830000-0000-0000-0000-000000000004'
)
ON CONFLICT (user_id) DO NOTHING;

UPDATE public.user_preferences
SET in_app_new_report = 'immediate', in_app_status_change = 'immediate'
WHERE user_id IN (
  'd3830000-0000-0000-0000-000000000001',
  'd3830000-0000-0000-0000-000000000002',
  'd3830000-0000-0000-0000-000000000004'
);

DELETE FROM public.user_notifications
WHERE user_id IN (
  'd3830000-0000-0000-0000-000000000001',
  'd3830000-0000-0000-0000-000000000002',
  'd3830000-0000-0000-0000-000000000004'
);

DELETE FROM public.incident_reports
WHERE id = 'd3840000-0000-0000-0000-000000000001';

-- 1) New pending incident notifies company TAC
INSERT INTO public.incident_reports (
  id, reporter_id, subject_cadet_id, description, location, incident_time, status
) VALUES (
  'd3840000-0000-0000-0000-000000000001',
  'd3830000-0000-0000-0000-000000000002',
  'd3830000-0000-0000-0000-000000000003',
  'Disruptive behavior in class',
  'Room 204',
  now(),
  'pending'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3830000-0000-0000-0000-000000000001'
      AND event_type = 'incident.pending_review'
      AND idempotency_key = 'incident.pending_review:d3840000-0000-0000-0000-000000000001:d3830000-0000-0000-0000-000000000001'
      AND link_url = '/incidents/d3840000-0000-0000-0000-000000000001'
  ),
  'Alpha TAC receives pending incident review notification'
);

-- 2) TAC from another company is not notified
SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3830000-0000-0000-0000-000000000004'
      AND event_type = 'incident.pending_review'
  ),
  'Beta TAC does not receive notification for another company cadet'
);

-- 3) Resolving as handled notifies reporter
UPDATE public.incident_reports
SET
  status = 'handled',
  resolved_at = now(),
  resolved_by = 'd3830000-0000-0000-0000-000000000001',
  resolution_notes = 'Spoke with cadet and parent.'
WHERE id = 'd3840000-0000-0000-0000-000000000001';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3830000-0000-0000-0000-000000000002'
      AND event_type = 'incident.actioned'
      AND body LIKE '%marked as handled%'
      AND body LIKE '%Spoke with cadet and parent.%'
  ),
  'Reporter receives handled incident notification with resolution notes'
);

-- 4) Converted status also notifies reporter (separate incident)
DELETE FROM public.user_notifications
WHERE user_id = 'd3830000-0000-0000-0000-000000000002'
  AND event_type = 'incident.actioned';

DELETE FROM public.incident_reports
WHERE id = 'd3840000-0000-0000-0000-000000000002';

INSERT INTO public.incident_reports (
  id, reporter_id, subject_cadet_id, description, location, incident_time, status
) VALUES (
  'd3840000-0000-0000-0000-000000000002',
  'd3830000-0000-0000-0000-000000000002',
  'd3830000-0000-0000-0000-000000000003',
  'Uniform violation',
  'Hallway',
  now(),
  'pending'
);

UPDATE public.incident_reports
SET status = 'converted', resolved_at = now(), resolved_by = 'd3830000-0000-0000-0000-000000000001'
WHERE id = 'd3840000-0000-0000-0000-000000000002';

SELECT ok(
  EXISTS (
    SELECT 1 FROM public.user_notifications
    WHERE user_id = 'd3830000-0000-0000-0000-000000000002'
      AND event_type = 'incident.actioned'
      AND body LIKE '%converted to a demerit report%'
  ),
  'Reporter receives converted incident notification'
);

-- 5) No duplicate actioned notification when status unchanged
SELECT is(
  (SELECT count(*)::int FROM public.user_notifications
   WHERE user_id = 'd3830000-0000-0000-0000-000000000002'
     AND event_type = 'incident.actioned'
     AND idempotency_key LIKE 'incident.actioned:d3840000-0000-0000-0000-000000000002%'),
  1,
  'Actioned incident notification is idempotent per status'
);

UPDATE public.incident_reports
SET resolution_notes = 'Updated notes only'
WHERE id = 'd3840000-0000-0000-0000-000000000002';

SELECT is(
  (SELECT count(*)::int FROM public.user_notifications
   WHERE user_id = 'd3830000-0000-0000-0000-000000000002'
     AND event_type = 'incident.actioned'
     AND idempotency_key LIKE 'incident.actioned:d3840000-0000-0000-0000-000000000002%'),
  1,
  'Updating notes without status change does not create another actioned notification'
);

SELECT * FROM finish();
ROLLBACK;
