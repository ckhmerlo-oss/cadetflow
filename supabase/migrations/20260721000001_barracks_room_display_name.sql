-- Custom room display names with reset to canonical room number.

set check_function_bodies = off;

alter table public.barracks_rooms
  add column if not exists canonical_room_number text,
  add column if not exists room_display_name text;

update public.barracks_rooms
set canonical_room_number = room_number
where canonical_room_number is null;

alter table public.barracks_rooms
  alter column canonical_room_number set not null;

comment on column public.barracks_rooms.canonical_room_number is
  'Original seeded room number; used when resetting room label and number.';
comment on column public.barracks_rooms.room_display_name is
  'Optional custom room label shown in hallway and room detail.';

create or replace function public.set_barracks_room_display_name(
  p_room_id uuid,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_display_name text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_display_name := nullif(btrim(p_display_name), '');

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception '[set_barracks_room_display_name] Permission denied';
  end if;

  update public.barracks_rooms
  set room_display_name = v_display_name
  where id = p_room_id;
end;
$$;

create or replace function public.reset_barracks_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_old_number text;
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

  update public.barracks_rooms
  set room_display_name = null,
      room_number = v_room.canonical_room_number,
      room_purpose = null
  where id = p_room_id;

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
  v_platoon_leader jsonb;
  v_platoon_sergeant jsonb;
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
      'room_display_name', br.room_display_name,
      'room_index', br.room_index,
      'floor', br.floor,
      'company_letter', br.company_letter,
      'room_purpose', br.room_purpose,
      'occupant_top', (
        case
          when br.room_purpose is not null then null
          when tp.id is not null and coalesce(tp.archived, false) = false then
            jsonb_build_object(
              'id', tp.id,
              'first_name', tp.first_name,
              'last_name', tp.last_name,
              'cadet_rank', coalesce(tcp.cadet_rank, ''),
              'pending_move_in', public._barracks_bunk_pending_move_in(br.id, 'top', tp.id)
            )
          else public._barracks_pending_move_in_occupant_json(br.id, 'top')
        end
      ),
      'occupant_bottom', (
        case
          when br.room_purpose is not null then null
          when bp.id is not null and coalesce(bp.archived, false) = false then
            jsonb_build_object(
              'id', bp.id,
              'first_name', bp.first_name,
              'last_name', bp.last_name,
              'cadet_rank', coalesce(bcp.cadet_rank, ''),
              'pending_move_in', public._barracks_bunk_pending_move_in(br.id, 'bottom', bp.id)
            )
          else public._barracks_pending_move_in_occupant_json(br.id, 'bottom')
        end
      ),
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

  v_platoon_leader := public._hallway_platoon_role_holder(
    v_company_id,
    p_floor,
    array['%platoon leader%', '%plt leader%', '%plt ldr%']
  );

  v_platoon_sergeant := public._hallway_platoon_role_holder(
    v_company_id,
    p_floor,
    array['%platoon sergeant%', '%plt sergeant%', '%plt sgt%', '%platoon sgt%']
  );

  return jsonb_build_object(
    'company_letter', p_company_letter,
    'company_name', v_company_name,
    'company_id', v_company_id,
    'floor', p_floor,
    'rooms', v_rooms,
    'company_commander', v_commander,
    'first_sergeant', v_first_sergeant,
    'platoon_leader', v_platoon_leader,
    'platoon_sergeant', v_platoon_sergeant
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
      'canonical_room_number', v_room.canonical_room_number,
      'room_display_name', v_room.room_display_name,
      'company_letter', v_room.company_letter,
      'floor', v_room.floor,
      'room_index', v_room.room_index,
      'company_id', v_room.company_id,
      'company_name', v_company_name,
      'room_purpose', v_room.room_purpose,
      'latest_move_in_form_id', v_room.latest_move_in_form_id,
      'latest_move_out_form_id', v_room.latest_move_out_form_id,
      'occupant_top', (
        case when v_room.room_purpose is not null then null else (
          select jsonb_build_object(
            'id', p.id, 'first_name', p.first_name, 'last_name', p.last_name,
            'cadet_rank', coalesce(cp.cadet_rank, ''), 'archived', coalesce(p.archived, false)
          )
          from public.profiles p
          left join public.cadet_profiles cp on cp.profile_id = p.id
          where p.id = v_room.occupant_top_bunk_id
        ) end
      ),
      'occupant_bottom', (
        case when v_room.room_purpose is not null then null else (
          select jsonb_build_object(
            'id', p.id, 'first_name', p.first_name, 'last_name', p.last_name,
            'cadet_rank', coalesce(cp.cadet_rank, ''), 'archived', coalesce(p.archived, false)
          )
          from public.profiles p
          left join public.cadet_profiles cp on cp.profile_id = p.id
          where p.id = v_room.occupant_bottom_bunk_id
        ) end
      )
    ),
    'move_in_forms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'cadet_id', f.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
        'submission_status', f.submission_status,
        'completed_at', f.completed_at,
        'created_at', f.created_at,
        'validated_by_id', f.validated_by_id,
        'validated_by_name', (
          select first_name || ' ' || last_name from public.profiles where id = f.validated_by_id
        ),
        'filled_by_id', f.filled_by_id,
        'filled_by_name', (
          select first_name || ' ' || last_name from public.profiles where id = f.filled_by_id
        ),
        'invite_id', f.invite_id,
        'sent_at', pi.created_at,
        'sent_by_id', pi.created_by_id,
        'sent_by_name', (
          select first_name || ' ' || last_name from public.profiles where id = pi.created_by_id
        ),
        'recipient_email', pi.recipient_email,
        'invite_revoked_at', pi.revoked_at,
        'invite_redeemed_at', pi.redeemed_at,
        'invite_expires_at', pi.expires_at,
        'invite_can_edit', (
          pi.id is not null
          and pi.revoked_at is null
          and pi.redeemed_at is null
          and pi.expires_at >= now()
        ),
        'locked_bunk', f.locked_bunk,
        'locked_desk_side', f.locked_desk_side
      ) order by f.created_at desc)
      from public.room_move_in_forms f
      left join public.parent_invites pi on pi.id = f.invite_id
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

grant execute on function public.set_barracks_room_display_name(uuid, text) to authenticated;
grant execute on function public.reset_barracks_room(uuid) to authenticated;
