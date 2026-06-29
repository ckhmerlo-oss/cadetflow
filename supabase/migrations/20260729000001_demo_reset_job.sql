-- Demo environment reset infrastructure (safe on prod — no-op unless is_demo_environment)

CREATE TABLE IF NOT EXISTS public.demo_reset_log (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_reset_at timestamptz,
  last_reset_date date
);

INSERT INTO public.demo_reset_log (id, last_reset_at, last_reset_date)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_demo_environment()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (
      SELECT value
      FROM public.system_settings
      WHERE key = 'is_demo_environment'
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.truncate_demo_mutable_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tbl text;
  mutable_tables text[] := ARRAY[
    'approval_log',
    'appeals',
    'cadet_archive_intervals',
    'cadet_class_enrollments',
    'cadet_conduct_snapshots',
    'cadet_notification_preferences',
    'cadet_oversight_assignment_log',
    'cadet_oversight_assignments',
    'cadet_parent_links',
    'email_delivery_log',
    'email_rate_limit_state',
    'in_app_notification_queue',
    'incident_reports',
    'incident_submission_policy_log',
    'notification_queue',
    'oversight_assignment_events',
    'parent_invites',
    'parent_travel_requests',
    'room_inspection_items',
    'room_move_in_forms',
    'room_move_out_forms',
    'special_report_audit_log',
    'special_report_subjects',
    'special_reports',
    'sport_events',
    'tour_ledger',
    'tours_marched',
    'user_legal_acceptances',
    'user_notifications',
    'user_preferences',
    'work_order_audit_log',
    'work_orders',
    'year_close_audit',
    'role_history_audit',
    'category_restriction_policy_log',
    'demerit_reports',
    'events',
    'feedback',
    'group_members',
    'cadet_oversight_secondary_opt_outs'
  ];
BEGIN
  FOREACH tbl IN ARRAY mutable_tables LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', tbl);
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_demo_environment()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_demo_environment() THEN
    RAISE NOTICE 'reset_demo_environment skipped — not a demo environment';
    RETURN;
  END IF;

  PERFORM public.truncate_demo_mutable_data();
  PERFORM public.apply_demo_seed_data();

  UPDATE auth.users
  SET
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change_token = coalesce(phone_change_token, ''),
    reauthentication_token = coalesce(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL
    OR recovery_token IS NULL
    OR email_change_token_new IS NULL
    OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  UPDATE public.demo_reset_log
  SET
    last_reset_at = now(),
    last_reset_date = (now() AT TIME ZONE 'America/New_York')::date
  WHERE id = 1;
END;
$$;

-- Restores demo fixtures after truncate. Full body lives in supabase/demo-seed.sql;
-- this function re-applies the mutable slices needed for nightly reset.
CREATE OR REPLACE FUNCTION public.apply_demo_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_demo_environment() THEN
    RETURN;
  END IF;

  INSERT INTO public.system_settings (key, value)
  VALUES
    ('is_demo_environment', true),
    ('email_development_mode', true)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  -- Re-run demo-seed.sql on the demo project after schema migrations for full fixtures.
  -- Nightly reset restores email dev mode; ops should schedule:
  --   psql $DEMO_DATABASE_URL -f supabase/demo-seed.sql
  -- following reset_demo_environment() until apply_demo_seed_data embeds full seed SQL.
  RAISE NOTICE 'apply_demo_seed_data: run supabase/demo-seed.sql on demo project for full fixture restore';
END;
$$;

CREATE OR REPLACE FUNCTION public.maybe_reset_demo_environment()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_et timestamptz := now() AT TIME ZONE 'America/New_York';
  today_et date := now_et::date;
  last_date date;
BEGIN
  IF NOT public.is_demo_environment() THEN
    RETURN;
  END IF;

  SELECT last_reset_date INTO last_date FROM public.demo_reset_log WHERE id = 1;

  IF now_et::time >= time '00:00'
     AND now_et::time < time '01:00'
     AND (last_date IS NULL OR last_date < today_et) THEN
    PERFORM public.reset_demo_environment();
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_demo_environment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.maybe_reset_demo_environment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.truncate_demo_mutable_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_demo_seed_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_demo_environment() TO service_role;
GRANT EXECUTE ON FUNCTION public.maybe_reset_demo_environment() TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_demo_seed_data() TO service_role;

DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'cadetflow-demo-reset';

    PERFORM cron.schedule(
      'cadetflow-demo-reset',
      '0 * * * *',
      $$SELECT public.maybe_reset_demo_environment();$$
    );
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'pg_cron job table unavailable — schedule maybe_reset_demo_environment manually on demo project';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule demo reset cron: %', SQLERRM;
END;
$cron$;
