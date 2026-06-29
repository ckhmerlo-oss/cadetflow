-- Demo project helpers: full wipe before reseed + barracks catalog rebuild.
-- Safe on production (wipe requires is_demo_environment OR explicit force flag).

CREATE OR REPLACE FUNCTION public.seed_barracks_rooms_catalog()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter text;
  v_floor integer;
  v_room integer;
  v_max_room integer;
  v_room_number text;
  v_company_id uuid;
  v_letters text[] := array['A', 'B', 'C', 'E', 'D'];
  v_company_names text[] := array[
    'Alpha Company', 'Bravo Company', 'Charlie Company', 'Echo Company', 'Delta Company'
  ];
  v_idx integer;
BEGIN
  FOR v_idx IN 1..array_length(v_letters, 1) LOOP
    v_letter := v_letters[v_idx];
    SELECT c.id INTO v_company_id
    FROM public.companies c
    WHERE c.company_name = v_company_names[v_idx]
    LIMIT 1;

    FOR v_floor IN 1..3 LOOP
      IF v_letter = 'D' THEN
        v_max_room := case v_floor when 1 then 16 else 19 end;
      ELSE
        v_max_room := case v_floor when 1 then 15 else 18 end;
      END IF;

      FOR v_room IN 1..v_max_room LOOP
        v_room_number := v_letter || v_floor::text || case
          WHEN v_room < 10 THEN lpad(v_room::text, 2, '0')
          ELSE v_room::text
        END;
        INSERT INTO public.barracks_rooms (
          room_number, canonical_room_number, company_letter, floor, room_index, company_id
        ) VALUES (
          v_room_number, v_room_number, v_letter, v_floor, v_room, v_company_id
        )
        ON CONFLICT (room_number) DO UPDATE SET
          canonical_room_number = EXCLUDED.canonical_room_number,
          company_letter = EXCLUDED.company_letter,
          floor = EXCLUDED.floor,
          room_index = EXCLUDED.room_index,
          company_id = EXCLUDED.company_id;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.wipe_demo_database(p_force boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage
AS $$
DECLARE
  tbl text;
  preserve_tables text[] := ARRAY[
    -- Migration-seeded catalogs (demo-seed.sql does not recreate these)
    'offense_types',
    'sports',
    'notification_event_types',
    'legal_document_versions',
    'room_inspection_item_templates',
    'app_options',
    'barracks_roster_tag_definitions'
  ];
BEGIN
  IF NOT p_force AND NOT coalesce(
    (
      SELECT value
      FROM public.system_settings
      WHERE key = 'is_demo_environment'
    ),
    false
  ) THEN
    RAISE EXCEPTION 'wipe_demo_database refused: set is_demo_environment or pass p_force := true';
  END IF;

  -- Auth sessions/tokens first (no dependency on public.profiles)
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

  -- Storage metadata (Supabase may block direct DELETE — non-fatal)
  IF to_regclass('storage.objects') IS NOT NULL THEN
    BEGIN
      DELETE FROM storage.objects;
    EXCEPTION
      WHEN insufficient_privilege OR OTHERS THEN
        RAISE NOTICE 'Skipped storage.objects wipe: %', SQLERRM;
    END;
  END IF;

  -- Public app data before auth.users (profiles.id → auth.users.id)
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename DESC
  LOOP
    IF NOT (tbl = ANY (preserve_tables)) THEN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', tbl);
    END IF;
  END LOOP;

  DELETE FROM auth.identities;
  DELETE FROM auth.users;

  UPDATE public.demo_reset_log
  SET last_reset_at = NULL, last_reset_date = NULL
  WHERE id = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.wipe_demo_database(boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_barracks_rooms_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wipe_demo_database(boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.seed_barracks_rooms_catalog() TO service_role;
