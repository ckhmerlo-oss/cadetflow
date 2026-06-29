-- Wipe the demo Supabase project before applying demo-seed.sql
--
-- Removes all auth users and public app data. Preserves schema, functions, RLS,
-- and migration-seeded catalogs (offense_types, sports, notification_event_types,
-- legal_document_versions, room_inspection_item_templates, app_options).
--
-- Demo project: gnxycfheypaciwwzcokj (https://gnxycfheypaciwwzcokj.supabase.co)
--
-- Usage (requires service-role / postgres connection):
--   psql "$DEMO_DATABASE_URL" -f supabase/demo-wipe.sql
--   psql "$DEMO_DATABASE_URL" -f supabase/demo-seed.sql
--
-- Or in Supabase SQL editor (run as postgres role):
--   \i supabase/demo-wipe.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Auth sessions/tokens (safe before public truncate)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('auth.sessions') IS NOT NULL THEN
    DELETE FROM auth.sessions;
  END IF;
  IF to_regclass('auth.refresh_tokens') IS NOT NULL THEN
    DELETE FROM auth.refresh_tokens;
  END IF;
  IF to_regclass('auth.mfa_factors') IS NOT NULL THEN
    DELETE FROM auth.mfa_factors;
  END IF;
  IF to_regclass('auth.one_time_tokens') IS NOT NULL THEN
    DELETE FROM auth.one_time_tokens;
  END IF;
  IF to_regclass('auth.flow_state') IS NOT NULL THEN
    DELETE FROM auth.flow_state;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Storage metadata (Supabase blocks direct DELETE — skip if protected)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  DELETE FROM storage.objects;
  RAISE NOTICE 'cleared storage.objects';
EXCEPTION
  WHEN insufficient_privilege OR OTHERS THEN
    RAISE NOTICE 'Skipped storage.objects wipe (use Storage API or dashboard): %', SQLERRM;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Public app data — must run BEFORE auth.users delete (profiles FK → auth.users)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
  preserve_tables text[] := ARRAY[
    'offense_types',
    'sports',
    'notification_event_types',
    'legal_document_versions',
    'room_inspection_item_templates',
    'app_options',
    'barracks_roster_tag_definitions'
  ];
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename DESC
  LOOP
    IF NOT (tbl = ANY (preserve_tables)) THEN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', tbl);
      RAISE NOTICE 'truncated public.%', tbl;
    ELSE
      RAISE NOTICE 'preserved public.%', tbl;
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Auth users (after profiles and other FKs are gone)
-- ---------------------------------------------------------------------------
DELETE FROM auth.identities;
DELETE FROM auth.users;

COMMIT;

-- Next step: psql "$DEMO_DATABASE_URL" -f supabase/demo-seed.sql
