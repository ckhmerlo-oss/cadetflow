-- seed_barracks_rooms_catalog omitted canonical_room_number (NOT NULL since day 210).

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

REVOKE ALL ON FUNCTION public.seed_barracks_rooms_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_barracks_rooms_catalog() TO service_role;
