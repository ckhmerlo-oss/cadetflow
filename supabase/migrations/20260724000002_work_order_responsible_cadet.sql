-- Assign cadet responsibility on inspection work orders (move-out comparison chain)

set check_function_bodies = off;

alter table public.work_orders
  add column if not exists responsible_cadet_id uuid references public.profiles (id) on delete set null;

create index if not exists idx_work_orders_responsible_cadet
  on public.work_orders (responsible_cadet_id)
  where responsible_cadet_id is not null;

comment on column public.work_orders.responsible_cadet_id is
  'Cadet held responsible for repair/charges. Defaults to moving cadet when condition degraded between move-in and move-out.';

-- ---------------------------------------------------------------------------
-- Repair severity helpers (higher = worse condition)
-- ---------------------------------------------------------------------------

create or replace function public._inspection_repair_score(p_status text)
returns integer
language sql
immutable
as $$
  select case p_status
    when 'INS' then 0
    when 'CLN' then 1
    when 'FIX' then 2
    when 'DAM' then 3
    when 'REP' then 4
    when 'MIS' then 5
    else null
  end;
$$;

create or replace function public._inspection_status_degraded(p_in_status text, p_out_status text)
returns boolean
language sql
immutable
as $$
  select
    public._inspection_repair_score(p_out_status) is not null
    and public._inspection_repair_score(p_out_status) > 0
    and (
      public._inspection_repair_score(p_in_status) is null
      or public._inspection_repair_score(p_out_status) > public._inspection_repair_score(p_in_status)
    );
$$;

-- ---------------------------------------------------------------------------
-- create_work_order_from_inspection_item — optional responsible cadet
-- ---------------------------------------------------------------------------

create or replace function public.create_work_order_from_inspection_item(
  p_source_inspection_form_id uuid,
  p_source_inspection_item_id uuid,
  p_barracks_room_id uuid,
  p_deficiency_code text,
  p_item_label text,
  p_requester_id uuid default null,
  p_responsible_cadet_id uuid default null
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
    if p_responsible_cadet_id is not null then
      update public.work_orders
      set responsible_cadet_id = coalesce(responsible_cadet_id, p_responsible_cadet_id),
          updated_at = now()
      where id = v_existing;
    end if;
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
    source_inspection_item_id,
    responsible_cadet_id
  ) values (
    v_requester,
    v_company_id,
    p_barracks_room_id,
    'barracks',
    array[coalesce(p_deficiency_code, 'UNK')],
    v_description,
    'submitted',
    p_source_inspection_form_id,
    p_source_inspection_item_id,
    p_responsible_cadet_id
  )
  returning id into v_id;

  perform public._work_order_append_audit(
    v_id, 'inspection_created', null, 'submitted', 'Auto-created from inspection deficiency'
  );
  perform public.notify_work_order_submitted(v_id);

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- compare_room_inspection_forms — degradation + work order linkage
-- ---------------------------------------------------------------------------

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
  v_moving_cadet_id uuid;
  v_moving_cadet_name text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select f.barracks_room_id into v_room_id
  from public.room_move_in_forms f where f.id = p_move_in_form_id;
  if not found then
    raise exception '[compare_room_inspection_forms] Move-in form not found';
  end if;

  select br.company_id into v_company_id from public.barracks_rooms br where br.id = v_room_id;
  if not public._barracks_can_read_room(v_company_id) then
    raise exception 'Permission denied';
  end if;

  select f.cadet_id,
         p.last_name || ', ' || p.first_name
  into v_moving_cadet_id, v_moving_cadet_name
  from public.room_move_out_forms f
  join public.profiles p on p.id = f.cadet_id
  where f.id = p_move_out_form_id;

  return jsonb_build_object(
    'move_in_form_id', p_move_in_form_id,
    'move_out_form_id', p_move_out_form_id,
    'moving_cadet_id', v_moving_cadet_id,
    'moving_cadet_name', v_moving_cadet_name,
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_key', coalesce(i_in.item_key, i_out.item_key),
        'item_label', coalesce(i_in.item_label, i_out.item_label),
        'move_in_status', i_in.status,
        'move_out_status', i_out.status,
        'changed', i_in.status is distinct from i_out.status,
        'degraded',
          public._inspection_status_degraded(i_in.status, i_out.status),
        'move_out_item_id', i_out.id,
        'work_order_id', wo.id,
        'default_responsible_cadet_id',
          case
            when public._inspection_status_degraded(i_in.status, i_out.status)
            then v_moving_cadet_id
            else null
          end
      ) order by coalesce(i_in.sort_order, i_out.sort_order))
      from public.room_inspection_items i_in
      full outer join public.room_inspection_items i_out
        on i_in.item_key = i_out.item_key
       and i_out.move_out_form_id = p_move_out_form_id
      left join public.work_orders wo
        on wo.source_inspection_item_id = i_out.id
      where i_in.move_in_form_id = p_move_in_form_id
         or i_out.move_out_form_id = p_move_out_form_id
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- transition_work_order — set responsible cadet on forward
-- ---------------------------------------------------------------------------

create or replace function public.transition_work_order(
  p_work_order_id uuid,
  p_action text,
  p_comment text default null,
  p_assigned_to_id uuid default null,
  p_priority text default null,
  p_responsible_cadet_id uuid default null
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
  v_default_responsible uuid;
  v_move_in_status text;
  v_move_out_status text;
begin
  if auth.uid() is null then
    raise exception '[transition_work_order] Unauthorized';
  end if;

  select * into v_wo from public.work_orders where id = p_work_order_id for update;
  if not found then
    raise exception '[transition_work_order] Work order not found';
  end if;

  v_old_status := v_wo.status;
  v_is_admin := public.is_site_admin() or public.get_my_role_level() >= 90;
  v_is_tac := public._work_order_can_tac_manage(v_wo.company_id);
  v_is_maint := public.is_maintenance_manager();

  case p_action
    when 'start_review' then
      if not v_is_tac and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if v_wo.status not in ('submitted') then
        raise exception '[transition_work_order] Invalid transition — status=% action=%', v_wo.status, p_action;
      end if;
      v_new_status := 'tac_review';

    when 'forward' then
      if not v_is_tac and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if v_wo.status not in ('submitted', 'tac_review') then
        raise exception '[transition_work_order] Invalid transition — status=% action=%', v_wo.status, p_action;
      end if;
      v_new_status := 'forwarded';

    when 'assign' then
      if not v_is_maint and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if v_wo.status not in ('forwarded', 'assigned') then
        raise exception '[transition_work_order] Invalid transition — status=% action=%', v_wo.status, p_action;
      end if;
      if p_assigned_to_id is null then
        raise exception '[transition_work_order] Assignee is required';
      end if;
      if not exists (
        select 1 from public.get_maintenance_manager_ids() mm where mm = p_assigned_to_id
      ) and not v_is_admin then
        raise exception '[transition_work_order] Assignee must be a maintenance manager';
      end if;
      v_new_status := 'assigned';

    when 'complete' then
      if not v_is_maint and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if v_wo.status not in ('forwarded', 'assigned') then
        raise exception '[transition_work_order] Invalid transition — status=% action=%', v_wo.status, p_action;
      end if;
      v_new_status := 'completed';

    when 'cancel' then
      if not v_is_tac and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if v_wo.status in ('completed', 'cancelled') then
        raise exception '[transition_work_order] Invalid transition — status=% action=%', v_wo.status, p_action;
      end if;
      v_new_status := 'cancelled';

    when 'set_priority' then
      if not v_is_tac and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if p_priority is null or p_priority not in ('low', 'normal', 'high', 'urgent') then
        raise exception '[transition_work_order] Valid priority is required';
      end if;
      update public.work_orders
      set priority = p_priority, updated_at = now()
      where id = p_work_order_id;
      perform public._work_order_append_audit(
        p_work_order_id, 'set_priority', v_old_status, v_old_status, p_comment,
        jsonb_build_object('priority', p_priority)
      );
      return;

    when 'set_responsible_cadet' then
      if not v_is_tac and not v_is_admin then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if p_responsible_cadet_id is null then
        raise exception '[transition_work_order] Responsible cadet is required';
      end if;
      if not exists (select 1 from public.profiles p where p.id = p_responsible_cadet_id) then
        raise exception '[transition_work_order] Responsible cadet not found';
      end if;
      update public.work_orders
      set responsible_cadet_id = p_responsible_cadet_id, updated_at = now()
      where id = p_work_order_id;
      perform public._work_order_append_audit(
        p_work_order_id, 'set_responsible_cadet', v_old_status, v_old_status, p_comment,
        jsonb_build_object('responsible_cadet_id', p_responsible_cadet_id)
      );
      return;

    when 'add_note' then
      if not (v_is_maint or v_is_tac or v_is_admin) then
        raise exception '[transition_work_order] Permission denied — action=% status=%', p_action, v_wo.status;
      end if;
      if p_comment is null or btrim(p_comment) = '' then
        raise exception '[transition_work_order] Note is required';
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
      raise exception '[transition_work_order] Unknown action: %', p_action;
  end case;

  v_default_responsible := p_responsible_cadet_id;

  if p_action = 'forward'
    and v_default_responsible is null
    and v_wo.responsible_cadet_id is null
    and v_wo.source_inspection_item_id is not null then
    select f.cadet_id,
           i_out.status,
           (
             select i_in2.status
             from public.room_move_in_forms f_in
             join public.room_inspection_items i_in2
               on i_in2.move_in_form_id = f_in.id
              and i_in2.item_key = i_out.item_key
             where f_in.barracks_room_id = f.barracks_room_id
             order by f_in.completed_at desc nulls last
             limit 1
           )
    into v_default_responsible, v_move_out_status, v_move_in_status
    from public.room_inspection_items i_out
    join public.room_move_out_forms f on f.id = i_out.move_out_form_id
    where i_out.id = v_wo.source_inspection_item_id;

    if not public._inspection_status_degraded(v_move_in_status, v_move_out_status) then
      v_default_responsible := null;
    end if;
  end if;

  update public.work_orders
  set
    status = v_new_status,
    assigned_to_id = case when p_action = 'assign' then p_assigned_to_id else assigned_to_id end,
    responsible_cadet_id = case
      when p_action = 'forward' and coalesce(p_responsible_cadet_id, v_default_responsible) is not null
        then coalesce(p_responsible_cadet_id, v_default_responsible, responsible_cadet_id)
      else responsible_cadet_id
    end,
    updated_at = now()
  where id = p_work_order_id;

  perform public._work_order_append_audit(
    p_work_order_id, p_action, v_old_status, v_new_status, p_comment,
    case
      when p_action = 'assign' then jsonb_build_object('assigned_to_id', p_assigned_to_id)
      when p_action = 'forward' and coalesce(p_responsible_cadet_id, v_default_responsible) is not null
        then jsonb_build_object('responsible_cadet_id', coalesce(p_responsible_cadet_id, v_default_responsible))
      else '{}'::jsonb
    end
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

grant execute on function public.create_work_order_from_inspection_item(uuid, uuid, uuid, text, text, uuid, uuid) to authenticated;
grant execute on function public.transition_work_order(uuid, text, text, uuid, text, uuid) to authenticated;
