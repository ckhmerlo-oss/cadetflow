-- Add platoon leader / sergeant resolution to hallway floor payload (floor N -> Nth platoon).

create or replace function public._hallway_platoon_ordinal(p_floor integer)
returns text
language sql
immutable
as $$
  select case p_floor
    when 1 then '1st'
    when 2 then '2nd'
    when 3 then '3rd'
    else p_floor::text
  end;
$$;

create or replace function public._hallway_platoon_group_id(p_company_id uuid, p_floor integer)
returns uuid
language sql
stable
as $$
  select ag.id
  from public.approval_groups ag
  where ag.company_id = p_company_id
    and (
      ag.group_name ilike '%' || public._hallway_platoon_ordinal(p_floor) || '%platoon%'
      or ag.group_name ilike '%' || public._hallway_platoon_ordinal(p_floor) || '%plt%'
    )
  order by
    case when ag.group_name ilike '%platoon%' then 0 else 1 end,
    length(ag.group_name)
  limit 1;
$$;

create or replace function public._hallway_platoon_role_holder(
  p_company_id uuid,
  p_floor integer,
  p_role_patterns text[]
)
returns jsonb
language plpgsql
stable
as $$
declare
  v_platoon_group_id uuid;
  v_ordinal text;
  v_result jsonb;
  v_pattern text;
begin
  v_platoon_group_id := public._hallway_platoon_group_id(p_company_id, p_floor);
  v_ordinal := public._hallway_platoon_ordinal(p_floor);

  if v_platoon_group_id is not null then
    select jsonb_build_object(
      'id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'cadet_rank', coalesce(cp.cadet_rank, '')
    )
    into v_result
    from public.profiles p
    join public.cadet_profiles cp on cp.profile_id = p.id
    join public.roles r on r.id = p.role_id
    where p.company_id = p_company_id
      and coalesce(p.archived, false) = false
      and r.approval_group_id = v_platoon_group_id
      and exists (
        select 1
        from unnest(p_role_patterns) pat(pattern)
        where r.role_name ilike pat.pattern
      )
    order by r.default_role_level desc, p.last_name, p.first_name
    limit 1;

    if v_result is not null then
      return v_result;
    end if;
  end if;

  select jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'cadet_rank', coalesce(cp.cadet_rank, '')
  )
  into v_result
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  join public.roles r on r.id = p.role_id
  where p.company_id = p_company_id
    and coalesce(p.archived, false) = false
    and r.role_name ilike '%' || v_ordinal || '%'
    and exists (
      select 1
      from unnest(p_role_patterns) pat(pattern)
      where r.role_name ilike pat.pattern
    )
  order by r.default_role_level desc, p.last_name, p.first_name
  limit 1;

  return v_result;
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
