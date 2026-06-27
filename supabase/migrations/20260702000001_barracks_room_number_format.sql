-- Correct barracks room_number format: rooms 1–9 use zero-padded hallway index (A101, B205, C309).

set check_function_bodies = off;

create or replace function public.format_barracks_room_number(
  p_company_letter text,
  p_floor integer,
  p_room_index integer
)
returns text
language sql
immutable
as $$
  select p_company_letter || p_floor::text || case
    when p_room_index < 10 then lpad(p_room_index::text, 2, '0')
    else p_room_index::text
  end;
$$;

comment on function public.format_barracks_room_number(text, integer, integer) is
  'Barracks room label: company letter + floor + room index (01–09 padded, 10+ unpadded). Examples: A101, B205, A115.';

update public.barracks_rooms br
set room_number = public.format_barracks_room_number(br.company_letter, br.floor, br.room_index)
where br.room_number is distinct from public.format_barracks_room_number(br.company_letter, br.floor, br.room_index);

grant execute on function public.format_barracks_room_number(text, integer, integer) to authenticated;
