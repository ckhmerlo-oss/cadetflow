-- Day 09: Room inspections, occupancy management, hallway queries

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Inspection item templates
-- ---------------------------------------------------------------------------

create table if not exists public.room_inspection_item_templates (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique,
  label text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.room_inspection_item_templates is
  'Canonical checklist items for move-in/out room inspections.';

insert into public.room_inspection_item_templates (item_key, label, sort_order) values
  ('top_bunk', 'Top bunk / mattress', 10),
  ('bottom_bunk', 'Bottom bunk / mattress', 20),
  ('desk', 'Desk', 30),
  ('chair', 'Chair', 40),
  ('wall_locker', 'Wall locker', 50),
  ('bed_locker', 'Bed locker', 60),
  ('sink', 'Sink / faucet', 70),
  ('mirror', 'Mirror', 80),
  ('medicine_cabinet', 'Medicine cabinet', 90),
  ('trash_can', 'Trash can', 100),
  ('broom_dustpan', 'Broom / dustpan', 110),
  ('window_blinds', 'Window / blinds', 120),
  ('door_lock', 'Door / lock', 130),
  ('light_fixtures', 'Light fixtures', 140),
  ('electrical', 'Electrical outlets / cords', 150),
  ('rifle_rack', 'Rifle rack area', 160),
  ('floor', 'Floor / carpet', 170)
on conflict (item_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Move-in / move-out form tables
-- ---------------------------------------------------------------------------

create table if not exists public.room_move_in_forms (
  id uuid primary key default gen_random_uuid(),
  barracks_room_id uuid not null references public.barracks_rooms (id) on delete restrict,
  cadet_id uuid not null references public.profiles (id) on delete restrict,
  room_number text not null,
  filled_by_id uuid not null references public.profiles (id) on delete restrict,
  validated_by_id uuid references public.profiles (id) on delete set null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_move_out_forms (
  id uuid primary key default gen_random_uuid(),
  barracks_room_id uuid not null references public.barracks_rooms (id) on delete restrict,
  cadet_id uuid not null references public.profiles (id) on delete restrict,
  room_number text not null,
  filled_by_id uuid not null references public.profiles (id) on delete restrict,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_inspection_items (
  id uuid primary key default gen_random_uuid(),
  move_in_form_id uuid references public.room_move_in_forms (id) on delete cascade,
  move_out_form_id uuid references public.room_move_out_forms (id) on delete cascade,
  item_key text not null,
  item_label text not null,
  sort_order integer not null default 0,
  status text not null default 'N/A',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_inspection_items_one_form check (
    (move_in_form_id is not null and move_out_form_id is null)
    or (move_in_form_id is null and move_out_form_id is not null)
  ),
  constraint room_inspection_items_status_check
    check (status in ('INS', 'DAM', 'CLN', 'FIX', 'REP', 'MIS', 'N/A'))
);

create index if not exists idx_room_move_in_forms_room
  on public.room_move_in_forms (barracks_room_id, created_at desc);
create index if not exists idx_room_move_out_forms_room
  on public.room_move_out_forms (barracks_room_id, created_at desc);
create index if not exists idx_room_move_out_forms_cadet
  on public.room_move_out_forms (cadet_id, room_number);
create index if not exists idx_room_inspection_items_move_in
  on public.room_inspection_items (move_in_form_id);
create index if not exists idx_room_inspection_items_move_out
  on public.room_inspection_items (move_out_form_id);

-- Wire barracks_rooms form FKs
alter table public.barracks_rooms
  drop constraint if exists barracks_rooms_latest_move_in_form_id_fkey;
alter table public.barracks_rooms
  add constraint barracks_rooms_latest_move_in_form_id_fkey
  foreign key (latest_move_in_form_id) references public.room_move_in_forms (id) on delete set null;

alter table public.barracks_rooms
  drop constraint if exists barracks_rooms_latest_move_out_form_id_fkey;
alter table public.barracks_rooms
  add constraint barracks_rooms_latest_move_out_form_id_fkey
  foreign key (latest_move_out_form_id) references public.room_move_out_forms (id) on delete set null;

-- ---------------------------------------------------------------------------
-- 3. Permission helper (reuse work-order TAC scope)
-- ---------------------------------------------------------------------------

create or replace function public._barracks_can_tac_manage(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public._work_order_can_tac_manage(p_company_id);
$$;

create or replace function public._barracks_can_read_room(p_company_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.is_maintenance_manager() then
    return true;
  end if;
  return public._barracks_can_tac_manage(p_company_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Occupancy RPCs
-- ---------------------------------------------------------------------------

create or replace function public._barracks_clear_cadet_from_rooms(p_cadet_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.barracks_rooms
  set occupant_top_bunk_id = null
  where occupant_top_bunk_id = p_cadet_id;

  update public.barracks_rooms
  set occupant_bottom_bunk_id = null
  where occupant_bottom_bunk_id = p_cadet_id;
end;
$$;

create or replace function public.assign_barracks_bunk(
  p_room_id uuid,
  p_bunk text,
  p_cadet_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_archived boolean;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if p_bunk not in ('top', 'bottom') then
    raise exception 'Invalid bunk: %', p_bunk;
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  select coalesce(p.archived, false) into v_archived
  from public.profiles p where p.id = p_cadet_id;

  if v_archived then
    raise exception 'Cannot assign archived cadet to room';
  end if;

  perform public._barracks_clear_cadet_from_rooms(p_cadet_id);

  if p_bunk = 'top' then
    update public.barracks_rooms
    set occupant_top_bunk_id = p_cadet_id
    where id = p_room_id;
  else
    update public.barracks_rooms
    set occupant_bottom_bunk_id = p_cadet_id
    where id = p_room_id;
  end if;

  update public.cadet_profiles
  set room_number = v_room.room_number, updated_at = now()
  where profile_id = p_cadet_id;
end;
$$;

create or replace function public.clear_barracks_bunk(
  p_room_id uuid,
  p_bunk text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_cadet_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if p_bunk not in ('top', 'bottom') then
    raise exception 'Invalid bunk: %', p_bunk;
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  v_cadet_id := case when p_bunk = 'top' then v_room.occupant_top_bunk_id else v_room.occupant_bottom_bunk_id end;

  if p_bunk = 'top' then
    update public.barracks_rooms set occupant_top_bunk_id = null where id = p_room_id;
  else
    update public.barracks_rooms set occupant_bottom_bunk_id = null where id = p_room_id;
  end if;

  if v_cadet_id is not null then
    update public.cadet_profiles cp
    set room_number = null, updated_at = now()
    where cp.profile_id = v_cadet_id
      and btrim(coalesce(cp.room_number, '')) = v_room.room_number;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Hallway + room detail queries
-- ---------------------------------------------------------------------------

create or replace function public.get_hallway_floor(
  p_company_letter text,
  p_floor integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_company_name text;
  v_rooms jsonb;
  v_commander jsonb;
  v_first_sergeant jsonb;
  v_open_orders jsonb;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select br.company_id, c.company_name
  into v_company_id, v_company_name
  from public.barracks_rooms br
  left join public.companies c on c.id = br.company_id
  where br.company_letter = p_company_letter
  limit 1;

  if v_company_id is null then
    raise exception 'Company not found';
  end if;

  if not public._barracks_can_read_room(v_company_id) then
    raise exception 'Permission denied';
  end if;

  select coalesce(jsonb_agg(row order by (row ->> 'room_index')::int), '[]'::jsonb)
  into v_rooms
  from (
    select jsonb_build_object(
      'id', br.id,
      'room_number', br.room_number,
      'room_index', br.room_index,
      'floor', br.floor,
      'company_letter', br.company_letter,
      'occupant_top', case
        when tp.id is not null and coalesce(tp.archived, false) = false then jsonb_build_object(
          'id', tp.id,
          'first_name', tp.first_name,
          'last_name', tp.last_name,
          'cadet_rank', coalesce(tcp.cadet_rank, '')
        )
        else null
      end,
      'occupant_bottom', case
        when bp.id is not null and coalesce(bp.archived, false) = false then jsonb_build_object(
          'id', bp.id,
          'first_name', bp.first_name,
          'last_name', bp.last_name,
          'cadet_rank', coalesce(bcp.cadet_rank, '')
        )
        else null
      end,
      'open_work_orders', (
        select count(*)::int
        from public.work_orders wo
        where wo.barracks_room_id = br.id
          and wo.status in ('submitted', 'tac_review', 'forwarded', 'assigned')
      ),
      'latest_move_in_form_id', br.latest_move_in_form_id,
      'latest_move_out_form_id', br.latest_move_out_form_id
    ) as row
    from public.barracks_rooms br
    left join public.profiles tp on tp.id = br.occupant_top_bunk_id
    left join public.cadet_profiles tcp on tcp.profile_id = tp.id
    left join public.profiles bp on bp.id = br.occupant_bottom_bunk_id
    left join public.cadet_profiles bcp on bcp.profile_id = bp.id
    where br.company_letter = p_company_letter
      and br.floor = p_floor
  ) sub;

  select jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'cadet_rank', coalesce(cp.cadet_rank, '')
  )
  into v_commander
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  join public.roles r on r.id = p.role_id
  where p.company_id = v_company_id
    and coalesce(p.archived, false) = false
    and r.role_name ilike '%company commander%'
  order by r.default_role_level desc
  limit 1;

  select jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'cadet_rank', coalesce(cp.cadet_rank, '')
  )
  into v_first_sergeant
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  join public.roles r on r.id = p.role_id
  where p.company_id = v_company_id
    and coalesce(p.archived, false) = false
    and (r.role_name ilike '%first sergeant%' or r.role_name ilike '%1sg%')
  order by r.default_role_level desc
  limit 1;

  return jsonb_build_object(
    'company_letter', p_company_letter,
    'company_name', v_company_name,
    'floor', p_floor,
    'rooms', v_rooms,
    'company_commander', v_commander,
    'first_sergeant', v_first_sergeant
  );
end;
$$;

create or replace function public.get_barracks_room_detail(p_room_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_company_name text;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_read_room(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  select c.company_name into v_company_name
  from public.companies c where c.id = v_room.company_id;

  v_result := jsonb_build_object(
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_number', v_room.room_number,
      'company_letter', v_room.company_letter,
      'floor', v_room.floor,
      'room_index', v_room.room_index,
      'company_id', v_room.company_id,
      'company_name', v_company_name,
      'latest_move_in_form_id', v_room.latest_move_in_form_id,
      'latest_move_out_form_id', v_room.latest_move_out_form_id,
      'occupant_top', (
        select jsonb_build_object(
          'id', p.id, 'first_name', p.first_name, 'last_name', p.last_name,
          'cadet_rank', coalesce(cp.cadet_rank, ''), 'archived', coalesce(p.archived, false)
        )
        from public.profiles p
        left join public.cadet_profiles cp on cp.profile_id = p.id
        where p.id = v_room.occupant_top_bunk_id
      ),
      'occupant_bottom', (
        select jsonb_build_object(
          'id', p.id, 'first_name', p.first_name, 'last_name', p.last_name,
          'cadet_rank', coalesce(cp.cadet_rank, ''), 'archived', coalesce(p.archived, false)
        )
        from public.profiles p
        left join public.cadet_profiles cp on cp.profile_id = p.id
        where p.id = v_room.occupant_bottom_bunk_id
      )
    ),
    'move_in_forms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'cadet_id', f.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
        'completed_at', f.completed_at,
        'validated_by_id', f.validated_by_id,
        'created_at', f.created_at
      ) order by f.created_at desc)
      from public.room_move_in_forms f
      where f.barracks_room_id = p_room_id
    ), '[]'::jsonb),
    'move_out_forms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'cadet_id', f.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
        'completed_at', f.completed_at,
        'created_at', f.created_at
      ) order by f.created_at desc)
      from public.room_move_out_forms f
      where f.barracks_room_id = p_room_id
    ), '[]'::jsonb),
    'work_orders', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', wo.id,
        'status', wo.status,
        'priority', wo.priority,
        'description', wo.description,
        'issue_presets', wo.issue_presets,
        'created_at', wo.created_at,
        'source_inspection_item_id', wo.source_inspection_item_id,
        'source_inspection_form_id', wo.source_inspection_form_id
      ) order by wo.created_at desc)
      from public.work_orders wo
      where wo.barracks_room_id = p_room_id
    ), '[]'::jsonb)
  );

  return v_result;
end;
$$;

create or replace function public.get_room_inspection_form(p_form_id uuid, p_form_type text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_company_id uuid;
  v_form jsonb;
  v_items jsonb;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if p_form_type = 'move_in' then
    select f.barracks_room_id into v_room_id
    from public.room_move_in_forms f where f.id = p_form_id;
    if not found then raise exception 'Form not found'; end if;

    select br.company_id into v_company_id from public.barracks_rooms br where br.id = v_room_id;

    if not public._barracks_can_read_room(v_company_id) then
      raise exception 'Permission denied';
    end if;

    select jsonb_build_object(
      'id', f.id,
      'form_type', 'move_in',
      'barracks_room_id', f.barracks_room_id,
      'room_number', f.room_number,
      'cadet_id', f.cadet_id,
      'filled_by_id', f.filled_by_id,
      'validated_by_id', f.validated_by_id,
      'completed_at', f.completed_at,
      'notes', f.notes,
      'created_at', f.created_at
    ) into v_form
    from public.room_move_in_forms f where f.id = p_form_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'item_key', i.item_key, 'item_label', i.item_label,
      'sort_order', i.sort_order, 'status', i.status, 'notes', i.notes
    ) order by i.sort_order), '[]'::jsonb)
    into v_items
    from public.room_inspection_items i
    where i.move_in_form_id = p_form_id;

  elsif p_form_type = 'move_out' then
    select f.barracks_room_id into v_room_id
    from public.room_move_out_forms f where f.id = p_form_id;
    if not found then raise exception 'Form not found'; end if;

    select br.company_id into v_company_id from public.barracks_rooms br where br.id = v_room_id;

    if not public._barracks_can_read_room(v_company_id) then
      raise exception 'Permission denied';
    end if;

    select jsonb_build_object(
      'id', f.id,
      'form_type', 'move_out',
      'barracks_room_id', f.barracks_room_id,
      'room_number', f.room_number,
      'cadet_id', f.cadet_id,
      'filled_by_id', f.filled_by_id,
      'completed_at', f.completed_at,
      'notes', f.notes,
      'created_at', f.created_at
    ) into v_form
    from public.room_move_out_forms f where f.id = p_form_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'item_key', i.item_key, 'item_label', i.item_label,
      'sort_order', i.sort_order, 'status', i.status, 'notes', i.notes
    ) order by i.sort_order), '[]'::jsonb)
    into v_items
    from public.room_inspection_items i
    where i.move_out_form_id = p_form_id;
  else
    raise exception 'Invalid form type';
  end if;

  return jsonb_build_object('form', v_form, 'items', v_items);
end;
$$;

create or replace function public.compare_room_inspection_forms(
  p_move_in_form_id uuid,
  p_move_out_form_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select f.barracks_room_id into v_room_id
  from public.room_move_in_forms f where f.id = p_move_in_form_id;
  if not found then raise exception 'Move-in form not found'; end if;

  select br.company_id into v_company_id from public.barracks_rooms br where br.id = v_room_id;
  if not public._barracks_can_read_room(v_company_id) then
    raise exception 'Permission denied';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'item_key', coalesce(i_in.item_key, i_out.item_key),
      'item_label', coalesce(i_in.item_label, i_out.item_label),
      'move_in_status', i_in.status,
      'move_out_status', i_out.status,
      'changed', i_in.status is distinct from i_out.status
    ) order by coalesce(i_in.sort_order, i_out.sort_order))
    from public.room_inspection_items i_in
    full outer join public.room_inspection_items i_out
      on i_in.item_key = i_out.item_key
     and i_out.move_out_form_id = p_move_out_form_id
    where i_in.move_in_form_id = p_move_in_form_id
       or i_out.move_out_form_id = p_move_out_form_id
  ), '[]'::jsonb);
end;
$$;

create or replace function public.list_room_inspection_templates()
returns setof public.room_inspection_item_templates
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.room_inspection_item_templates
  where active = true
  order by sort_order, label;
$$;

-- ---------------------------------------------------------------------------
-- 6. Save inspection form + work order handoff
-- ---------------------------------------------------------------------------

create or replace function public.save_room_inspection_form(
  p_form_type text,
  p_room_id uuid,
  p_cadet_id uuid,
  p_form_id uuid default null,
  p_items jsonb default '[]'::jsonb,
  p_notes text default null,
  p_validated_by_id uuid default null,
  p_mark_complete boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_form_id uuid;
  v_item jsonb;
  v_item_id uuid;
  v_status text;
  v_deficiency_codes text[] := array['DAM', 'CLN', 'FIX', 'REP', 'MIS'];
  v_role_level integer;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then raise exception 'Room not found'; end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  select r.default_role_level into v_role_level
  from public.profiles p join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  if p_form_type = 'move_out' and coalesce(v_role_level, 0) < 65 then
    raise exception 'Move-out forms require TAC';
  end if;

  if p_form_type = 'move_in' then
    if p_form_id is null then
      insert into public.room_move_in_forms (
        barracks_room_id, cadet_id, room_number, filled_by_id, validated_by_id, notes, completed_at
      ) values (
        p_room_id, p_cadet_id, v_room.room_number, auth.uid(), p_validated_by_id, p_notes,
        case when p_mark_complete then now() else null end
      )
      returning id into v_form_id;
    else
      v_form_id := p_form_id;
      update public.room_move_in_forms
      set
        validated_by_id = coalesce(p_validated_by_id, validated_by_id),
        notes = coalesce(p_notes, notes),
        completed_at = case when p_mark_complete then coalesce(completed_at, now()) else completed_at end,
        updated_at = now()
      where id = v_form_id and barracks_room_id = p_room_id;
    end if;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_item_id := nullif(v_item ->> 'id', '')::uuid;
      v_status := coalesce(v_item ->> 'status', 'N/A');

      if v_item_id is not null then
        update public.room_inspection_items
        set status = v_status,
            notes = nullif(v_item ->> 'notes', ''),
            updated_at = now()
        where id = v_item_id and move_in_form_id = v_form_id;
      else
        insert into public.room_inspection_items (
          move_in_form_id, item_key, item_label, sort_order, status, notes
        ) values (
          v_form_id,
          v_item ->> 'item_key',
          v_item ->> 'item_label',
          coalesce((v_item ->> 'sort_order')::int, 0),
          v_status,
          nullif(v_item ->> 'notes', '')
        )
        returning id into v_item_id;
      end if;

      if v_status = any(v_deficiency_codes) then
        perform public.create_work_order_from_inspection_item(
          v_form_id,
          v_item_id,
          p_room_id,
          v_status,
          v_item ->> 'item_label',
          p_cadet_id
        );
      end if;
    end loop;

    if p_mark_complete then
      update public.barracks_rooms
      set latest_move_in_form_id = v_form_id
      where id = p_room_id;
    end if;

  elsif p_form_type = 'move_out' then
    if p_form_id is null then
      insert into public.room_move_out_forms (
        barracks_room_id, cadet_id, room_number, filled_by_id, notes, completed_at
      ) values (
        p_room_id, p_cadet_id, v_room.room_number, auth.uid(), p_notes,
        case when p_mark_complete then now() else null end
      )
      returning id into v_form_id;
    else
      v_form_id := p_form_id;
      update public.room_move_out_forms
      set
        notes = coalesce(p_notes, notes),
        completed_at = case when p_mark_complete then coalesce(completed_at, now()) else completed_at end,
        updated_at = now()
      where id = v_form_id and barracks_room_id = p_room_id;
    end if;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_item_id := nullif(v_item ->> 'id', '')::uuid;
      v_status := coalesce(v_item ->> 'status', 'N/A');

      if v_item_id is not null then
        update public.room_inspection_items
        set status = v_status,
            notes = nullif(v_item ->> 'notes', ''),
            updated_at = now()
        where id = v_item_id and move_out_form_id = v_form_id;
      else
        insert into public.room_inspection_items (
          move_out_form_id, item_key, item_label, sort_order, status, notes
        ) values (
          v_form_id,
          v_item ->> 'item_key',
          v_item ->> 'item_label',
          coalesce((v_item ->> 'sort_order')::int, 0),
          v_status,
          nullif(v_item ->> 'notes', '')
        )
        returning id into v_item_id;
      end if;

      if v_status = any(v_deficiency_codes) then
        perform public.create_work_order_from_inspection_item(
          v_form_id,
          v_item_id,
          p_room_id,
          v_status,
          v_item ->> 'item_label',
          auth.uid()
        );
      end if;
    end loop;

    if p_mark_complete then
      update public.barracks_rooms
      set latest_move_out_form_id = v_form_id
      where id = p_room_id;
    end if;
  else
    raise exception 'Invalid form type';
  end if;

  return v_form_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Year close — clear bunk refs when archiving cadets
-- ---------------------------------------------------------------------------

create or replace function public.close_school_year(
  p_school_year text,
  p_next_school_year text,
  p_force boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_demerit record;
  v_counts jsonb := '{}'::jsonb;
  v_pulled integer := 0;
  v_appeals_closed integer := 0;
  v_incidents_closed integer := 0;
  v_cadets_archived integer := 0;
  v_snapshots integer := 0;
  v_cadet record;
  v_preflight jsonb;
  v_force_bypassed jsonb;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if p_force and not public.can_force_close_school_year() then
    raise exception 'Force archive requires admin role level above 100';
  end if;

  if exists (select 1 from public.year_close_audit where school_year = p_school_year) then
    raise exception 'School year % has already been closed', p_school_year;
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, p_next_school_year);

  if not (v_preflight ->> 'next_year_terms_configured')::boolean then
    raise exception 'Next school year % must have 5 active terms configured before close', p_next_school_year;
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'open_events')::integer, 0) > 0 then
    raise exception 'Open events must be resolved or carried forward before year close (Day 10)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'open_special_reports')::integer, 0) > 0 then
    raise exception 'Open special reports must be resolved before year close (Day 10)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'summary_drafts')::integer, 0) > 0 then
    raise exception 'Summary drafts must be finalized before year close (Day 12)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'suspended_cadets')::integer, 0) > 0 then
    raise exception 'Archived cadets marked suspended must be resolved to non_return or dismissal before year close';
  end if;

  if p_force then
    v_force_bypassed := v_preflight -> 'manual';
  end if;

  v_snapshots := public.generate_year_conduct_snapshots(p_school_year);

  for v_demerit in
    select dr.id
    from public.demerit_reports dr
    where dr.status in ('pending_approval', 'needs_revision')
      and dr.date_of_offense >= (
        select min(start_date) from public.academic_terms where school_year = p_school_year
      )
      and dr.date_of_offense <= (
        select max(end_date) + interval '1 day' from public.academic_terms where school_year = p_school_year
      )
  loop
    perform public._year_close_pull_demerit(v_demerit.id, v_actor);
    v_pulled := v_pulled + 1;
  end loop;

  update public.appeals a
  set
    status = 'rejected_final',
    final_comment = coalesce(a.final_comment, 'school_year_closed')
  where a.status not in ('approved', 'rejected_final');
  get diagnostics v_appeals_closed = row_count;

  update public.incident_reports ir
  set
    status = 'closed',
    resolved_at = now(),
    resolved_by = v_actor,
    resolution_notes = coalesce(ir.resolution_notes, 'school_year_closed')
  where ir.status = 'pending';
  get diagnostics v_incidents_closed = row_count;

  perform public.archive_school_year(p_school_year);

  update public.cadet_oversight_assignments o
  set is_active = false, ended_at = now()
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.roles r on r.id = p.role_id
  where o.cadet_id = p.id
    and o.is_active = true
    and coalesce(p.archived, false) = false
    and (r.default_role_level is null or r.default_role_level < 50);

  update public.cadet_profiles cp
  set
    cached_tour_balance = 0,
    has_star_tours = false,
    probation_status = 'None',
    probation_notes = null,
    updated_at = now()
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where cp.profile_id = p.id
    and coalesce(p.archived, false) = false
    and (r.default_role_level is null or r.default_role_level < 50);

  for v_cadet in
    select p.id, p.role_id, p.company_id, cp.departure_classification
    from public.profiles p
    join public.cadet_profiles cp on cp.profile_id = p.id
    left join public.roles r on r.id = p.role_id
    where coalesce(p.archived, false) = false
      and (r.default_role_level is null or r.default_role_level < 50)
  loop
    if v_cadet.role_id is not null then
      perform public.append_cadet_role_history(v_cadet.id, v_cadet.role_id, v_cadet.company_id, 'archived');
    end if;

    update public.barracks_rooms br
    set
      occupant_top_bunk_id = case when br.occupant_top_bunk_id = v_cadet.id then null else br.occupant_top_bunk_id end,
      occupant_bottom_bunk_id = case when br.occupant_bottom_bunk_id = v_cadet.id then null else br.occupant_bottom_bunk_id end
    where br.occupant_top_bunk_id = v_cadet.id
       or br.occupant_bottom_bunk_id = v_cadet.id;

    update public.cadet_profiles cp
    set
      room_number = null,
      cached_tour_balance = 0,
      has_star_tours = false,
      probation_status = 'None',
      probation_notes = null,
      departure_classification = case
        when cp.departure_classification in ('withdrawn', 'dismissal') then cp.departure_classification
        else 'non_return'
      end,
      updated_at = now()
    where cp.profile_id = v_cadet.id;

    update public.profiles p
    set
      archived = true,
      company_id = null,
      role_id = null
    where p.id = v_cadet.id;

    v_cadets_archived := v_cadets_archived + 1;
  end loop;

  v_counts := jsonb_build_object(
    'snapshots', v_snapshots,
    'demerits_pulled', v_pulled,
    'appeals_closed', v_appeals_closed,
    'incidents_closed', v_incidents_closed,
    'cadets_archived', v_cadets_archived,
    'force_close', p_force
  );

  if p_force then
    v_counts := v_counts || jsonb_build_object('force_bypassed', v_force_bypassed);
  end if;

  insert into public.year_close_audit (actor_id, school_year, next_school_year, counts)
  values (v_actor, p_school_year, p_next_school_year, v_counts);

  return v_counts;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. RLS
-- ---------------------------------------------------------------------------

alter table public.room_inspection_item_templates enable row level security;
alter table public.room_move_in_forms enable row level security;
alter table public.room_move_out_forms enable row level security;
alter table public.room_inspection_items enable row level security;

revoke all on table public.room_inspection_item_templates from anon;
revoke all on table public.room_move_in_forms from anon;
revoke all on table public.room_move_out_forms from anon;
revoke all on table public.room_inspection_items from anon;

grant select on table public.room_inspection_item_templates to authenticated;
grant select on table public.room_move_in_forms to authenticated;
grant select on table public.room_move_out_forms to authenticated;
grant select on table public.room_inspection_items to authenticated;

grant all on table public.room_inspection_item_templates to service_role;
grant all on table public.room_move_in_forms to service_role;
grant all on table public.room_move_out_forms to service_role;
grant all on table public.room_inspection_items to service_role;

drop policy if exists "Authenticated read inspection templates" on public.room_inspection_item_templates;
create policy "Authenticated read inspection templates"
on public.room_inspection_item_templates for select to authenticated using (true);

drop policy if exists "Scoped read move in forms" on public.room_move_in_forms;
create policy "Scoped read move in forms"
on public.room_move_in_forms for select to authenticated
using (
  exists (
    select 1 from public.barracks_rooms br
    where br.id = barracks_room_id
      and public._barracks_can_read_room(br.company_id)
  )
  or cadet_id = auth.uid()
);

drop policy if exists "Scoped read move out forms" on public.room_move_out_forms;
create policy "Scoped read move out forms"
on public.room_move_out_forms for select to authenticated
using (
  exists (
    select 1 from public.barracks_rooms br
    where br.id = barracks_room_id
      and public._barracks_can_read_room(br.company_id)
  )
  or cadet_id = auth.uid()
);

drop policy if exists "Scoped read inspection items" on public.room_inspection_items;
create policy "Scoped read inspection items"
on public.room_inspection_items for select to authenticated
using (
  (move_in_form_id is not null and exists (
    select 1 from public.room_move_in_forms f
    join public.barracks_rooms br on br.id = f.barracks_room_id
    where f.id = move_in_form_id
      and (public._barracks_can_read_room(br.company_id) or f.cadet_id = auth.uid())
  ))
  or (move_out_form_id is not null and exists (
    select 1 from public.room_move_out_forms f
    join public.barracks_rooms br on br.id = f.barracks_room_id
    where f.id = move_out_form_id
      and (public._barracks_can_read_room(br.company_id) or f.cadet_id = auth.uid())
  ))
);

-- ---------------------------------------------------------------------------
-- 9. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.assign_barracks_bunk(uuid, text, uuid) to authenticated;
grant execute on function public.clear_barracks_bunk(uuid, text) to authenticated;
grant execute on function public.get_hallway_floor(text, integer) to authenticated;
grant execute on function public.get_barracks_room_detail(uuid) to authenticated;
grant execute on function public.get_room_inspection_form(uuid, text) to authenticated;
grant execute on function public.compare_room_inspection_forms(uuid, uuid) to authenticated;
grant execute on function public.list_room_inspection_templates() to authenticated;
grant execute on function public.save_room_inspection_form(text, uuid, uuid, uuid, jsonb, text, uuid, boolean) to authenticated;
