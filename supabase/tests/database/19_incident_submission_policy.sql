BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(8);

CREATE OR REPLACE FUNCTION public.mock_auth(user_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
  SET ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.companies (id, company_name)
VALUES ('f5000000-0000-0000-0000-000000000001', 'Incident Policy Test Co')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.roles (id, role_name, default_role_level, company_id)
VALUES
  ('f5200000-0000-0000-0000-000000000001', 'Incident Test Commandant', 90, 'f5000000-0000-0000-0000-000000000001'),
  ('f5200000-0000-0000-0000-000000000002', 'Incident Test Platoon', 20, 'f5000000-0000-0000-0000-000000000001'),
  ('f5200000-0000-0000-0000-000000000003', 'Incident Test Cadet', 0, 'f5000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE
SET default_role_level = EXCLUDED.default_role_level;

INSERT INTO auth.users (id, email)
VALUES
  ('f5300000-0000-0000-0000-000000000001', 'incident-admin@test.email'),
  ('f5300000-0000-0000-0000-000000000002', 'incident-platoon@test.email'),
  ('f5300000-0000-0000-0000-000000000003', 'incident-cadet@test.email')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, role_id, company_id, archived)
VALUES
  ('f5300000-0000-0000-0000-000000000001', 'Test', 'Admin', 'f5200000-0000-0000-0000-000000000001', 'f5000000-0000-0000-0000-000000000001', false),
  ('f5300000-0000-0000-0000-000000000002', 'Test', 'Platoon', 'f5200000-0000-0000-0000-000000000002', 'f5000000-0000-0000-0000-000000000001', false),
  ('f5300000-0000-0000-0000-000000000003', 'Test', 'Cadet', 'f5200000-0000-0000-0000-000000000003', 'f5000000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

SELECT public.ensure_staff_profile('f5300000-0000-0000-0000-000000000001');
SELECT public.ensure_cadet_profile('f5300000-0000-0000-0000-000000000002');
SELECT public.ensure_cadet_profile('f5300000-0000-0000-0000-000000000003');

DELETE FROM public.incident_submission_policy_log
WHERE actor_id = 'f5300000-0000-0000-0000-000000000001';

DELETE FROM public.incident_reports
WHERE reporter_id = 'f5300000-0000-0000-0000-000000000002';

-- 1) Default policy allows platoon leader incidents
SELECT ok(
  public.can_submit_incidents(20),
  'Role level 20 can submit incidents under default policy'
);

-- 2) Cadet cannot submit incidents
SELECT ok(
  NOT public.can_submit_incidents(0),
  'Cadets cannot submit incidents under default policy'
);

-- 3) Platoon leader can INSERT incident
SELECT public.mock_auth('f5300000-0000-0000-0000-000000000002');
PREPARE incident_platoon_insert AS
  INSERT INTO public.incident_reports (
    reporter_id,
    subject_cadet_id,
    description,
    location,
    incident_time,
    status
  ) VALUES (
    'f5300000-0000-0000-0000-000000000002',
    'f5300000-0000-0000-0000-000000000003',
    'Test incident',
    'Barracks',
    now(),
    'pending'
  );
SELECT lives_ok('incident_platoon_insert', 'Platoon leader can insert incident report');

-- 4) Admin disables incidents at level 20
SELECT public.mock_auth('f5300000-0000-0000-0000-000000000001');
PREPARE incident_disable_policy AS
  SELECT public.update_incident_submission_policy(
    jsonb_build_array(
      jsonb_build_object('min_role_level', 20, 'allowed', false),
      jsonb_build_object('min_role_level', 65, 'allowed', true)
    )
  );
SELECT lives_ok('incident_disable_policy', 'Admin can update incident submission policy');

SELECT ok(
  NOT public.can_submit_incidents(20),
  'Updated policy blocks incidents at role level 20'
);

-- 6) Audit log created (check while still admin — RLS hides log from platoon)
SELECT ok(
  EXISTS (
    SELECT 1
    FROM public.incident_submission_policy_log
    WHERE actor_id = 'f5300000-0000-0000-0000-000000000001'
  ),
  'Policy update creates audit log entry'
);

-- 7) Blocked insert fails
SELECT public.mock_auth('f5300000-0000-0000-0000-000000000002');
PREPARE incident_platoon_blocked AS
  INSERT INTO public.incident_reports (
    reporter_id,
    subject_cadet_id,
    description,
    location,
    incident_time,
    status
  ) VALUES (
    'f5300000-0000-0000-0000-000000000002',
    'f5300000-0000-0000-0000-000000000003',
    'Blocked incident',
    'Mess Hall',
    now(),
    'pending'
  );
SELECT throws_ok(
  'incident_platoon_blocked',
  'new row violates row-level security policy for table "incident_reports"',
  'Blocked platoon leader incident insert rejected by RLS'
);

-- 8) Demerit submission default at level 15
SELECT ok(
  public.can_submit_demerits(15),
  'Role level 15 can submit demerit reports under default policy'
);

SELECT * FROM finish();
ROLLBACK;
