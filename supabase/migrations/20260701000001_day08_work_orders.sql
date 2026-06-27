-- Day 08: Work orders intake, TAC triage, maintenance portal foundation

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Notification event types
-- ---------------------------------------------------------------------------

insert into public.notification_event_types (code, category, title_template, description) values
  ('workorder.assigned', 'status_change', 'Work order assigned', 'A work order was assigned to maintenance staff.'),
  ('workorder.completed', 'status_change', 'Work order completed', 'A work order was marked complete.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 2. barracks_rooms (Day 09 extends occupancy/form refs)
-- ---------------------------------------------------------------------------

create table if not exists public.barracks_rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null,
  company_letter text not null,
  floor integer not null check (floor between 1 and 3),
  room_index integer not null check (room_index >= 1),
  company_id uuid references public.companies (id) on delete set null,
  occupant_top_bunk_id uuid references public.profiles (id) on delete set null,
  occupant_bottom_bunk_id uuid references public.profiles (id) on delete set null,
  latest_move_in_form_id uuid,
  latest_move_out_form_id uuid,
  created_at timestamptz not null default now(),
  constraint barracks_rooms_room_number_key unique (room_number),
  constraint barracks_rooms_company_letter_check
    check (company_letter in ('A', 'B', 'C', 'D', 'E'))
);

comment on table public.barracks_rooms is
  'Barracks room registry. Day 08 seeds all rooms; Day 09 adds occupancy and inspection form linkage.';

create index if not exists idx_barracks_rooms_company_letter_floor
  on public.barracks_rooms (company_letter, floor, room_index);

-- Seed all barracks rooms per company letter / floor rules
create or replace function public._seed_barracks_rooms()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
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
begin
  for v_idx in 1..array_length(v_letters, 1) loop
    v_letter := v_letters[v_idx];
    select c.id into v_company_id
    from public.companies c
    where c.company_name = v_company_names[v_idx]
    limit 1;

    for v_floor in 1..3 loop
      if v_letter = 'D' then
        v_max_room := case v_floor when 1 then 16 else 19 end;
      else
        v_max_room := case v_floor when 1 then 15 else 18 end;
      end if;

      for v_room in 1..v_max_room loop
        -- Format: {company}{floor}{room} — rooms 1–9 zero-padded (A101, B205); 10+ unpadded (A110, A115)
        v_room_number := v_letter || v_floor::text || case
          when v_room < 10 then lpad(v_room::text, 2, '0')
          else v_room::text
        end;
        insert into public.barracks_rooms (
          room_number, company_letter, floor, room_index, company_id
        ) values (
          v_room_number, v_letter, v_floor, v_room, v_company_id
        )
        on conflict (room_number) do nothing;
      end loop;
    end loop;
  end loop;
end;
$$;

select public._seed_barracks_rooms();
drop function public._seed_barracks_rooms();

-- ---------------------------------------------------------------------------
-- 3. work_orders + audit log
-- ---------------------------------------------------------------------------

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  requester_id uuid not null references public.profiles (id) on delete restrict,
  company_id uuid references public.companies (id) on delete set null,
  barracks_room_id uuid references public.barracks_rooms (id) on delete set null,
  location text,
  issue_type text not null,
  issue_presets text[] not null default '{}',
  description text not null,
  priority text not null default 'normal',
  status text not null default 'submitted',
  notes text,
  assigned_to_id uuid references public.profiles (id) on delete set null,
  source_inspection_item_id uuid,
  source_inspection_form_id uuid,
  constraint work_orders_issue_type_check
    check (issue_type in ('barracks', 'other')),
  constraint work_orders_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint work_orders_status_check
    check (status in ('submitted', 'tac_review', 'forwarded', 'assigned', 'completed', 'cancelled')),
  constraint work_orders_location_required_for_other
    check (issue_type <> 'other' or (location is not null and btrim(location) <> '')),
  constraint work_orders_barracks_room_required_for_barracks
    check (issue_type <> 'barracks' or barracks_room_id is not null)
);

create unique index if not exists idx_work_orders_source_inspection_item
  on public.work_orders (source_inspection_item_id)
  where source_inspection_item_id is not null;

comment on table public.work_orders is
  'Maintenance work order requests. Not year-scoped; persists across school year boundaries.';

create table if not exists public.work_order_audit_log (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  old_status text,
  new_status text,
  comment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_work_order_audit_log_work_order
  on public.work_order_audit_log (work_order_id, created_at desc);

create index if not exists idx_work_orders_company_status
  on public.work_orders (company_id, status, created_at desc);

create index if not exists idx_work_orders_status
  on public.work_orders (status, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_maintenance_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and coalesce(p.archived, false) = false
      and r.role_name ilike '%maintenance%'
  );
$$;

create or replace function public.get_maintenance_manager_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where coalesce(p.archived, false) = false
    and r.role_name ilike '%maintenance%';
$$;

create or replace function public.get_work_order_tac_recipient_ids(p_company_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where coalesce(p.archived, false) = false
    and r.default_role_level >= 65
    and (
      r.can_manage_all_rosters = true
      or (
        r.can_manage_own_company_roster = true
        and p.company_id is not distinct from p_company_id
      )
    );
$$;

create or replace function public._work_order_display_location(p_work_order_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    br.room_number,
    wo.location,
    'Unknown location'
  )
  from public.work_orders wo
  left join public.barracks_rooms br on br.id = wo.barracks_room_id
  where wo.id = p_work_order_id;
$$;

create or replace function public._work_order_can_tac_manage(p_company_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_can_all boolean;
  v_can_own boolean;
  v_company_id uuid;
begin
  if public.is_site_admin() then
    return true;
  end if;

  select
    r.default_role_level,
    coalesce(r.can_manage_all_rosters, false),
    coalesce(r.can_manage_own_company_roster, false),
    p.company_id
  into v_level, v_can_all, v_can_own, v_company_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if v_level is null or v_level < 65 then
    return false;
  end if;

  if v_level >= 90 or v_can_all then
    return true;
  end if;

  return v_can_own and v_company_id is not distinct from p_company_id;
end;
$$;

create or replace function public._work_order_append_audit(
  p_work_order_id uuid,
  p_action text,
  p_old_status text,
  p_new_status text,
  p_comment text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.work_order_audit_log (
    work_order_id, actor_id, action, old_status, new_status, comment, metadata
  ) values (
    p_work_order_id,
    auth.uid(),
    p_action,
    p_old_status,
    p_new_status,
    p_comment,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Notification fan-out
-- ---------------------------------------------------------------------------

create or replace function public.notify_work_order_submitted(p_work_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo public.work_orders%rowtype;
  v_tac_id uuid;
  v_requester_name text;
  v_location text;
  v_link text;
  v_title text;
  v_body text;
begin
  select * into v_wo from public.work_orders where id = p_work_order_id;
  if not found then
    return;
  end if;

  v_requester_name := public.format_profile_name(v_wo.requester_id);
  v_location := public._work_order_display_location(p_work_order_id);
  v_link := '/work-orders/' || p_work_order_id::text;
  v_title := 'Work order submitted';
  v_body := v_requester_name || ' submitted a work order for ' || v_location || '.';

  perform public.dispatch_notification(
    v_wo.requester_id,
    'workorder.submitted',
    v_title,
    v_body,
    v_link,
    'workorder.submitted:' || p_work_order_id::text || ':requester:' || v_wo.requester_id::text,
    jsonb_build_object('work_order_id', p_work_order_id, 'requester_id', v_wo.requester_id)
  );

  for v_tac_id in
    select public.get_work_order_tac_recipient_ids(v_wo.company_id)
  loop
    if v_tac_id = v_wo.requester_id then
      continue;
    end if;

    perform public.dispatch_notification(
      v_tac_id,
      'workorder.submitted',
      v_title,
      v_body,
      v_link,
      'workorder.submitted:' || p_work_order_id::text || ':tac:' || v_tac_id::text,
      jsonb_build_object('work_order_id', p_work_order_id, 'requester_id', v_wo.requester_id)
    );
  end loop;
end;
$$;

create or replace function public.notify_work_order_forwarded(p_work_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo public.work_orders%rowtype;
  v_mm_id uuid;
  v_location text;
  v_link text;
  v_title text;
  v_body text;
begin
  select * into v_wo from public.work_orders where id = p_work_order_id;
  if not found then
    return;
  end if;

  v_location := public._work_order_display_location(p_work_order_id);
  v_link := '/work-orders/' || p_work_order_id::text;
  v_title := 'Work order forwarded to maintenance';
  v_body := 'Work order for ' || v_location || ' was forwarded to the maintenance portal.';

  for v_mm_id in select public.get_maintenance_manager_ids()
  loop
    perform public.dispatch_user_notification(
      v_mm_id,
      'workorder.forwarded',
      v_title,
      v_body,
      v_link,
      'workorder.forwarded:' || p_work_order_id::text || ':' || v_mm_id::text,
      jsonb_build_object('work_order_id', p_work_order_id)
    );
  end loop;
end;
$$;

create or replace function public.notify_work_order_assigned(p_work_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo public.work_orders%rowtype;
  v_tac_id uuid;
  v_location text;
  v_link text;
  v_title text;
  v_body text;
begin
  select * into v_wo from public.work_orders where id = p_work_order_id;
  if not found or v_wo.assigned_to_id is null then
    return;
  end if;

  v_location := public._work_order_display_location(p_work_order_id);
  v_link := '/work-orders/' || p_work_order_id::text;
  v_title := 'Work order assigned';
  v_body := 'Work order for ' || v_location || ' was assigned for maintenance.';

  perform public.dispatch_notification(
    v_wo.assigned_to_id,
    'workorder.assigned',
    v_title,
    v_body,
    v_link,
    'workorder.assigned:' || p_work_order_id::text || ':assignee:' || v_wo.assigned_to_id::text,
    jsonb_build_object('work_order_id', p_work_order_id, 'assigned_to_id', v_wo.assigned_to_id)
  );

  perform public.dispatch_notification(
    v_wo.requester_id,
    'workorder.assigned',
    v_title,
    v_body,
    v_link,
    'workorder.assigned:' || p_work_order_id::text || ':requester:' || v_wo.requester_id::text,
    jsonb_build_object('work_order_id', p_work_order_id, 'assigned_to_id', v_wo.assigned_to_id)
  );
end;
$$;

create or replace function public.notify_work_order_completed(p_work_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo public.work_orders%rowtype;
  v_tac_id uuid;
  v_location text;
  v_link text;
  v_title text;
  v_body text;
begin
  select * into v_wo from public.work_orders where id = p_work_order_id;
  if not found then
    return;
  end if;

  v_location := public._work_order_display_location(p_work_order_id);
  v_link := '/work-orders/' || p_work_order_id::text;
  v_title := 'Work order completed';
  v_body := 'Work order for ' || v_location || ' was marked complete.';

  perform public.dispatch_notification(
    v_wo.requester_id,
    'workorder.completed',
    v_title,
    v_body,
    v_link,
    'workorder.completed:' || p_work_order_id::text || ':requester:' || v_wo.requester_id::text,
    jsonb_build_object('work_order_id', p_work_order_id)
  );

  for v_tac_id in
    select public.get_work_order_tac_recipient_ids(v_wo.company_id)
  loop
    perform public.dispatch_notification(
      v_tac_id,
      'workorder.completed',
      v_title,
      v_body,
      v_link,
      'workorder.completed:' || p_work_order_id::text || ':tac:' || v_tac_id::text,
      jsonb_build_object('work_order_id', p_work_order_id)
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Core RPCs
-- ---------------------------------------------------------------------------

create or replace function public.list_barracks_rooms(p_company_letter text default null)
returns table (
  id uuid,
  room_number text,
  company_letter text,
  floor integer,
  room_index integer
)
language sql
stable
security definer
set search_path = public
as $$
  select br.id, br.room_number, br.company_letter, br.floor, br.room_index
  from public.barracks_rooms br
  where p_company_letter is null or br.company_letter = p_company_letter
  order by br.company_letter, br.floor, br.room_index;
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
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select r.default_role_level, p.company_id
  into v_role_level, v_company_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if v_role_level is null or v_role_level >= 50 then
    raise exception 'Only cadets may submit work orders through this path';
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
    'submitted'
  )
  returning id into v_id;

  perform public._work_order_append_audit(v_id, 'submitted', null, 'submitted', 'Work order submitted');
  perform public.notify_work_order_submitted(v_id);

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

  select p.company_id into v_company_id
  from public.profiles p
  where p.id = v_requester;

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

create or replace function public.transition_work_order(
  p_work_order_id uuid,
  p_action text,
  p_comment text default null,
  p_assigned_to_id uuid default null,
  p_priority text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo public.work_orders%rowtype;
  v_old_status text;
  v_new_status text;
  v_is_admin boolean;
  v_is_tac boolean;
  v_is_maint boolean;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_wo from public.work_orders where id = p_work_order_id for update;
  if not found then
    raise exception 'Work order not found';
  end if;

  v_old_status := v_wo.status;
  v_is_admin := public.is_site_admin() or public.get_my_role_level() >= 90;
  v_is_tac := public._work_order_can_tac_manage(v_wo.company_id);
  v_is_maint := public.is_maintenance_manager();

  case p_action
    when 'start_review' then
      if not v_is_tac and not v_is_admin then
        raise exception 'Permission denied';
      end if;
      if v_wo.status not in ('submitted') then
        raise exception 'Invalid status transition';
      end if;
      v_new_status := 'tac_review';

    when 'forward' then
      if not v_is_tac and not v_is_admin then
        raise exception 'Permission denied';
      end if;
      if v_wo.status not in ('submitted', 'tac_review') then
        raise exception 'Invalid status transition';
      end if;
      v_new_status := 'forwarded';

    when 'assign' then
      if not v_is_maint and not v_is_admin then
        raise exception 'Permission denied';
      end if;
      if v_wo.status not in ('forwarded', 'assigned') then
        raise exception 'Invalid status transition';
      end if;
      if p_assigned_to_id is null then
        raise exception 'Assignee is required';
      end if;
      if not exists (
        select 1 from public.get_maintenance_manager_ids() mm where mm = p_assigned_to_id
      ) and not v_is_admin then
        raise exception 'Assignee must be a maintenance manager';
      end if;
      v_new_status := 'assigned';

    when 'complete' then
      if not v_is_maint and not v_is_admin then
        raise exception 'Permission denied';
      end if;
      if v_wo.status not in ('forwarded', 'assigned') then
        raise exception 'Invalid status transition';
      end if;
      v_new_status := 'completed';

    when 'cancel' then
      if not v_is_tac and not v_is_admin then
        raise exception 'Permission denied';
      end if;
      if v_wo.status in ('completed', 'cancelled') then
        raise exception 'Invalid status transition';
      end if;
      v_new_status := 'cancelled';

    when 'set_priority' then
      if not v_is_tac and not v_is_admin then
        raise exception 'Permission denied';
      end if;
      if p_priority is null or p_priority not in ('low', 'normal', 'high', 'urgent') then
        raise exception 'Valid priority is required';
      end if;
      update public.work_orders
      set priority = p_priority, updated_at = now()
      where id = p_work_order_id;
      perform public._work_order_append_audit(
        p_work_order_id, 'set_priority', v_old_status, v_old_status, p_comment,
        jsonb_build_object('priority', p_priority)
      );
      return;

    when 'add_note' then
      if not (v_is_maint or v_is_tac or v_is_admin) then
        raise exception 'Permission denied';
      end if;
      if p_comment is null or btrim(p_comment) = '' then
        raise exception 'Note is required';
      end if;
      update public.work_orders
      set
        notes = case
          when notes is null or btrim(notes) = '' then btrim(p_comment)
          else notes || E'\n' || btrim(p_comment)
        end,
        updated_at = now()
      where id = p_work_order_id;
      perform public._work_order_append_audit(
        p_work_order_id, 'add_note', v_old_status, v_old_status, p_comment
      );
      return;

    else
      raise exception 'Unknown action: %', p_action;
  end case;

  update public.work_orders
  set
    status = v_new_status,
    assigned_to_id = case when p_action = 'assign' then p_assigned_to_id else assigned_to_id end,
    updated_at = now()
  where id = p_work_order_id;

  perform public._work_order_append_audit(
    p_work_order_id, p_action, v_old_status, v_new_status, p_comment,
    case when p_action = 'assign' then jsonb_build_object('assigned_to_id', p_assigned_to_id) else '{}'::jsonb end
  );

  if p_action = 'forward' then
    perform public.notify_work_order_forwarded(p_work_order_id);
  elsif p_action = 'assign' then
    perform public.notify_work_order_assigned(p_work_order_id);
  elsif p_action = 'complete' then
    perform public.notify_work_order_completed(p_work_order_id);
  end if;
end;
$$;

create or replace function public.get_work_order_audit_log(p_work_order_id uuid)
returns setof public.work_order_audit_log
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.work_order_audit_log
  where work_order_id = p_work_order_id
  order by created_at asc;
$$;

-- ---------------------------------------------------------------------------
-- 7. RLS
-- ---------------------------------------------------------------------------

alter table public.barracks_rooms enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_audit_log enable row level security;

revoke all on table public.barracks_rooms from anon;
revoke all on table public.work_orders from anon;
revoke all on table public.work_order_audit_log from anon;

grant select on table public.barracks_rooms to authenticated;
grant select on table public.work_orders to authenticated;
grant select on table public.work_order_audit_log to authenticated;
grant all on table public.barracks_rooms to service_role;
grant all on table public.work_orders to service_role;
grant all on table public.work_order_audit_log to service_role;

drop policy if exists "Authenticated read barracks rooms" on public.barracks_rooms;
create policy "Authenticated read barracks rooms"
on public.barracks_rooms
for select
to authenticated
using (true);

drop policy if exists "Requester read own work orders" on public.work_orders;
create policy "Requester read own work orders"
on public.work_orders
for select
to authenticated
using (requester_id = auth.uid());

drop policy if exists "TAC read company work orders" on public.work_orders;
create policy "TAC read company work orders"
on public.work_orders
for select
to authenticated
using (
  public.get_my_role_level() >= 65
  and (
    public.is_site_admin()
    or public.get_my_role_level() >= 90
    or exists (
      select 1
      from public.profiles viewer
      join public.roles vr on vr.id = viewer.role_id
      where viewer.id = auth.uid()
        and coalesce(vr.can_manage_all_rosters, false) = true
    )
    or exists (
      select 1
      from public.profiles viewer
      join public.roles vr on vr.id = viewer.role_id
      where viewer.id = auth.uid()
        and coalesce(vr.can_manage_own_company_roster, false) = true
        and viewer.company_id is not distinct from work_orders.company_id
    )
  )
);

drop policy if exists "Maintenance read portal work orders" on public.work_orders;
create policy "Maintenance read portal work orders"
on public.work_orders
for select
to authenticated
using (
  public.is_maintenance_manager()
  and status in ('forwarded', 'assigned', 'completed')
);

drop policy if exists "Audit log read scoped to work order access" on public.work_order_audit_log;
create policy "Audit log read scoped to work order access"
on public.work_order_audit_log
for select
to authenticated
using (
  exists (
    select 1 from public.work_orders wo
    where wo.id = work_order_audit_log.work_order_id
  )
);

-- ---------------------------------------------------------------------------
-- 8. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.is_maintenance_manager() to authenticated;
grant execute on function public.get_maintenance_manager_ids() to authenticated;
grant execute on function public.get_work_order_tac_recipient_ids(uuid) to authenticated;
grant execute on function public.list_barracks_rooms(text) to authenticated;
grant execute on function public.create_work_order(text, text, uuid, text, text[]) to authenticated;
grant execute on function public.create_work_order_from_inspection_item(uuid, uuid, uuid, text, text, uuid) to authenticated;
grant execute on function public.transition_work_order(uuid, text, text, uuid, text) to authenticated;
grant execute on function public.get_work_order_audit_log(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Day 06 preflight — real open_work_orders count
-- ---------------------------------------------------------------------------

create or replace function public.get_year_close_preflight(
  p_school_year text,
  p_next_school_year text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_next text := p_next_school_year;
  v_next_terms integer;
  v_open_events integer := 0;
  v_uncleared_rooms integer;
  v_tour_sheet integer;
  v_probation integer;
  v_suspended integer;
  v_open_work_orders integer;
  v_items_uncleared jsonb;
  v_items_tour jsonb;
  v_items_probation jsonb;
  v_items_suspended jsonb;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if v_next is null then
    v_next := (
      select distinct t.school_year
      from public.academic_terms t
      where t.archived = false
        and t.school_year <> p_school_year
      order by t.school_year
      limit 1
    );
  end if;

  select count(*) into v_next_terms
  from public.academic_terms t
  where t.school_year = v_next and t.archived = false;

  select count(*) into v_uncleared_rooms
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  join public.roles r on r.id = p.role_id
  where coalesce(r.default_role_level, 0) < 50
    and coalesce(p.archived, false) = false
    and public._year_close_cadet_needs_move_out(p.id);

  select count(*) into v_tour_sheet
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  join public.roles r on r.id = p.role_id
  where coalesce(r.default_role_level, 0) < 50
    and coalesce(p.archived, false) = false
    and (coalesce(cp.cached_tour_balance, 0) > 0 or cp.has_star_tours = true);

  select count(*) into v_probation
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  join public.roles r on r.id = p.role_id
  where coalesce(r.default_role_level, 0) < 50
    and coalesce(p.archived, false) = false
    and cp.probation_status is not null
    and cp.probation_status <> 'None';

  select count(*) into v_suspended
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  where coalesce(p.archived, false) = true
    and cp.departure_classification = 'suspended';

  select count(*) into v_open_work_orders
  from public.work_orders wo
  where wo.status not in ('completed', 'cancelled');

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_uncleared
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — Room ' || btrim(cp.room_number)
        || ' (move-out pending)' as label,
      '/profile/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and public._year_close_cadet_needs_move_out(p.id)
    order by p.last_name, p.first_name
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_tour
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — '
        || case
          when coalesce(cp.cached_tour_balance, 0) > 0 then cp.cached_tour_balance::text || ' tour(s)'
          else 'star tours'
        end as label,
      '/ledger/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and (coalesce(cp.cached_tour_balance, 0) > 0 or cp.has_star_tours = true)
    order by p.last_name, p.first_name
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_probation
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — Probation: ' || cp.probation_status as label,
      '/ledger/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and cp.probation_status is not null
      and cp.probation_status <> 'None'
    order by p.last_name, p.first_name
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_suspended
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — Suspended (resolve before close)' as label,
      '/profile/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    where coalesce(p.archived, false) = true
      and cp.departure_classification = 'suspended'
    order by p.last_name, p.first_name
  ) t;

  return jsonb_build_object(
    'school_year', p_school_year,
    'next_school_year', v_next,
    'next_year_terms_configured', v_next_terms >= 5,
    'already_closed', exists (
      select 1 from public.year_close_audit y where y.school_year = p_school_year
    ),
    'auto_handled', jsonb_build_object(
      'open_demerit_reports', (
        select count(*) from public.demerit_reports dr
        where dr.status in ('pending_approval', 'needs_revision')
          and dr.date_of_offense >= (
            select min(start_date) from public.academic_terms where school_year = p_school_year
          )
          and dr.date_of_offense <= (
            select max(end_date) from public.academic_terms where school_year = p_school_year
          )
      ),
      'open_appeals', (
        select count(*) from public.appeals a
        where a.status not in ('approved', 'rejected_final')
      ),
      'pending_incidents', (
        select count(*) from public.incident_reports ir where ir.status = 'pending'
      ),
      'tour_sheet_cleared', v_tour_sheet,
      'probation_reset', v_probation,
      'rooms_cleared_at_execute', v_uncleared_rooms
    ),
    'manual', jsonb_build_object(
      'open_events', v_open_events,
      'open_special_reports', 0,
      'uncleared_rooms', v_uncleared_rooms,
      'summary_drafts', 0,
      'suspended_cadets', v_suspended
    ),
    'informational', jsonb_build_object(
      'open_work_orders', v_open_work_orders
    ),
    'items', jsonb_build_object(
      'uncleared_rooms', v_items_uncleared,
      'open_events', '[]'::jsonb,
      'open_special_reports', '[]'::jsonb,
      'summary_drafts', '[]'::jsonb,
      'suspended_cadets', v_items_suspended,
      'tour_sheet_cleared', v_items_tour,
      'probation_reset', v_items_probation
    )
  );
end;
$$;
