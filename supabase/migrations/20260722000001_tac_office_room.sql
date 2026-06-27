-- TAC office as floor-1 room 100 (non-cadet, display name split across bunks).

set check_function_bodies = off;

alter table public.barracks_rooms
  drop constraint if exists barracks_rooms_room_index_check;

alter table public.barracks_rooms
  add constraint barracks_rooms_room_index_check
  check (room_index >= 0);

insert into public.barracks_rooms (
  room_number,
  canonical_room_number,
  company_letter,
  floor,
  room_index,
  company_id,
  room_display_name,
  room_purpose
)
select
  c.letter || '100',
  c.letter || '100',
  c.letter,
  1,
  0,
  co.id,
  'TAC Office',
  'special'
from (
  values
    ('A', 'Alpha Company'),
    ('B', 'Bravo Company'),
    ('C', 'Charlie Company'),
    ('D', 'Delta Company'),
    ('E', 'Echo Company')
) as c(letter, company_name)
join public.companies co on co.company_name = c.company_name
on conflict (room_number) do update
set
  canonical_room_number = excluded.canonical_room_number,
  floor = 1,
  room_index = 0,
  room_display_name = 'TAC Office',
  room_purpose = 'special';

create or replace function public.reset_barracks_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_old_number text;
  v_is_tac_office boolean;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception '[reset_barracks_room] Permission denied';
  end if;

  v_old_number := v_room.room_number;
  v_is_tac_office := v_room.floor = 1 and v_room.canonical_room_number ~ '^[A-E]100$';

  if v_is_tac_office then
    update public.barracks_rooms
    set room_display_name = 'TAC Office',
        room_number = v_room.canonical_room_number,
        room_purpose = 'special'
    where id = p_room_id;
  else
    update public.barracks_rooms
    set room_display_name = null,
        room_number = v_room.canonical_room_number,
        room_purpose = null
    where id = p_room_id;
  end if;

  if v_room.occupant_top_bunk_id is not null then
    update public.cadet_profiles cp
    set room_number = v_room.canonical_room_number, updated_at = now()
    where cp.profile_id = v_room.occupant_top_bunk_id
      and btrim(coalesce(cp.room_number, '')) = v_old_number;
  end if;

  if v_room.occupant_bottom_bunk_id is not null then
    update public.cadet_profiles cp
    set room_number = v_room.canonical_room_number, updated_at = now()
    where cp.profile_id = v_room.occupant_bottom_bunk_id
      and btrim(coalesce(cp.room_number, '')) = v_old_number;
  end if;
end;
$$;
