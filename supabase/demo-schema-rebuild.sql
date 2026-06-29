-- Rebuild demo database schema for CadetFlow (NOT the V2/starter multi-tenant schema)
--
-- Run this ONCE on the demo Supabase project (gnxycfheypaciwwzcokj) when you see errors like:
--   column "company_name" of relation "companies" does not exist
--
-- That means the demo project has the wrong schema. This script clears it so
-- `supabase db push` can apply CadetFlow migrations from this repo.
--
-- After this script succeeds, from the repo root:
--   supabase link --project-ref gnxycfheypaciwwzcokj
--   supabase db push
--   psql "$DEMO_DATABASE_URL" -f supabase/demo-seed.sql
--
-- NEVER run this against production.

BEGIN;

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Default privileges (matches Supabase baseline)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- Clear migration history so db push applies CadetFlow migrations from scratch
DELETE FROM supabase_migrations.schema_migrations;

COMMIT;

-- Next: supabase db push (from repo root, linked to demo project)
