-- Faculty/staff work order submission + routing: barracks → room-company TAC; other → maintenance portal.

set check_function_bodies = off;

-- Resolve owning rifle company for a barracks room (TAC triage scope).
create or replace function public.get_barracks_room_company_id(p_barracks_room_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_br public.barracks_rooms%rowtype;
  v_company_id uuid;
begin
  if p_barracks_room_id is null then
    return null;
  end if;

  select * into v_br from public.barracks_rooms where id = p_barracks_room_id;
  if not found then
    raise exception 'Barracks room not found';
  end if;

  if v_br.company_id is not null then
    return v_br.company_id;
  end if;

  select c.id into v_company_id
  from public.companies c
  where c.company_name = case v_br.company_letter
    when 'A' then 'Alpha Company'
    when 'B' then 'Bravo Company'
    when 'C' then 'Charlie Company'
    when 'D' then 'Delta Company'
    when 'E' then 'Echo Company'
  end
  limit 1;

  return v_company_id;
end;
$$;

create or replace function public.create_work_order(
  p_issue_type text,
  p_description text,
  p_barracks_room_id uuid default null,
  p_location text default null,
  p_issue_presets text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_company_id uuid;
  v_role_level integer;
  v_status text;
  v_audit_action text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select r.default_role_level
  into v_role_level
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if v_role_level is null or v_role_level < 15 then
    raise exception 'Insufficient permissions to submit work orders';
  end if;

  if p_issue_type = 'barracks' and p_barracks_room_id is null then
    raise exception 'Barracks room is required';
  end if;

  if p_issue_type = 'other' and (p_location is null or btrim(p_location) = '') then
    raise exception 'Location is required for non-barracks issues';
  end if;

  if p_description is null or btrim(p_description) = '' then
    raise exception 'Description is required';
  end if;

  if p_issue_type = 'barracks' then
    v_company_id := public.get_barracks_room_company_id(p_barracks_room_id);
    v_status := 'submitted';
    v_audit_action := 'submitted';
  elsif p_issue_type = 'other' then
    v_company_id := null;
    v_status := 'forwarded';
    v_audit_action := 'submitted_to_maintenance';
  else
    raise exception 'Invalid issue type';
  end if;

  insert into public.work_orders (
    requester_id,
    company_id,
    barracks_room_id,
    location,
    issue_type,
    issue_presets,
    description,
    status
  ) values (
    auth.uid(),
    v_company_id,
    p_barracks_room_id,
    nullif(btrim(p_location), ''),
    p_issue_type,
    coalesce(p_issue_presets, '{}'),
    btrim(p_description),
    v_status
  )
  returning id into v_id;

  perform public._work_order_append_audit(
    v_id, v_audit_action, null, v_status,
    case
      when p_issue_type = 'barracks' then 'Work order submitted for barracks room TAC review'
      else 'Work order submitted directly to maintenance'
    end
  );

  if p_issue_type = 'barracks' then
    perform public.notify_work_order_submitted(v_id);
  else
    perform public.notify_work_order_forwarded(v_id);
    perform public.dispatch_notification(
      auth.uid(),
      'workorder.submitted',
      'Work order submitted',
      'Your maintenance request for ' || coalesce(nullif(btrim(p_location), ''), 'shared space')
        || ' was sent to the maintenance portal.',
      '/work-orders/' || v_id::text,
      'workorder.submitted:' || v_id::text || ':requester:' || auth.uid()::text,
      jsonb_build_object('work_order_id', v_id, 'requester_id', auth.uid())
    );
  end if;

  return v_id;
end;
$$;

create or replace function public.create_work_order_from_inspection_item(
  p_source_inspection_form_id uuid,
  p_source_inspection_item_id uuid,
  p_barracks_room_id uuid,
  p_deficiency_code text,
  p_item_label text,
  p_requester_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
  v_id uuid;
  v_company_id uuid;
  v_requester uuid;
  v_description text;
begin
  if p_source_inspection_item_id is null then
    raise exception 'Inspection item id is required';
  end if;

  select wo.id into v_existing
  from public.work_orders wo
  where wo.source_inspection_item_id = p_source_inspection_item_id;

  if v_existing is not null then
    return v_existing;
  end if;

  v_requester := coalesce(p_requester_id, auth.uid());
  if v_requester is null then
    raise exception 'Requester is required';
  end if;

  v_company_id := public.get_barracks_room_company_id(p_barracks_room_id);

  v_description := 'Inspection deficiency (' || coalesce(p_deficiency_code, 'UNK') || '): '
    || coalesce(p_item_label, 'Item');

  insert into public.work_orders (
    requester_id,
    company_id,
    barracks_room_id,
    issue_type,
    issue_presets,
    description,
    status,
    source_inspection_form_id,
    source_inspection_item_id
  ) values (
    v_requester,
    v_company_id,
    p_barracks_room_id,
    'barracks',
    array[coalesce(p_deficiency_code, 'UNK')],
    v_description,
    'submitted',
    p_source_inspection_form_id,
    p_source_inspection_item_id
  )
  returning id into v_id;

  perform public._work_order_append_audit(
    v_id, 'inspection_created', null, 'submitted', 'Auto-created from inspection deficiency'
  );
  perform public.notify_work_order_submitted(v_id);

  return v_id;
end;
$$;

grant execute on function public.get_barracks_room_company_id(uuid) to authenticated;
