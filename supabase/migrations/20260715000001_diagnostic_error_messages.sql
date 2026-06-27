-- Days 1-9 diagnostic error message prefixes for breakable RPCs

CREATE OR REPLACE FUNCTION public.handle_approval(report_id_to_approve uuid, approval_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public
AS $function$
DECLARE
  current_group_id uuid;
  next_group_id uuid;
BEGIN
  SELECT current_approver_group_id
  INTO current_group_id
  FROM public.demerit_reports
  WHERE id = report_id_to_approve;

  IF NOT public.is_member_of_approver_group(current_group_id) THEN
    RAISE EXCEPTION '[handle_approval] Permission denied — not current approver for report';
  END IF;

  SELECT next_approver_group_id
  INTO next_group_id
  FROM public.approval_groups
  WHERE id = current_group_id;

  IF next_group_id IS NULL THEN
    UPDATE public.demerit_reports
    SET status = 'completed', current_approver_group_id = NULL
    WHERE id = report_id_to_approve;
  ELSE
    UPDATE public.demerit_reports
    SET current_approver_group_id = next_group_id
    WHERE id = report_id_to_approve;
  END IF;

  INSERT INTO public.approval_log (report_id, actor_id, "action", comment)
  VALUES (report_id_to_approve, auth.uid(), 'approved', approval_comment);
END;
$function$;

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
    raise exception '[create_work_order] Unauthorized';
  end if;

  select r.default_role_level
  into v_role_level
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if v_role_level is null or v_role_level < 15 then
    raise exception '[create_work_order] Insufficient permissions to submit work orders';
  end if;

  if p_issue_type = 'barracks' and p_barracks_room_id is null then
    raise exception '[create_work_order] Barracks room required for issue_type=barracks';
  end if;

  if p_issue_type = 'other' and (p_location is null or btrim(p_location) = '') then
    raise exception '[create_work_order] Location is required for non-barracks issues';
  end if;

  if p_description is null or btrim(p_description) = '' then
    raise exception '[create_work_order] Description is required';
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
    raise exception '[create_work_order] Invalid issue type';
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
    raise exception '[assign_barracks_bunk] Permission denied';
  end if;

  select coalesce(p.archived, false) into v_archived
  from public.profiles p where p.id = p_cadet_id;

  if v_archived then
    raise exception '[assign_barracks_bunk] Cannot assign archived cadet to room';
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
  if not found then raise exception '[compare_room_inspection_forms] Move-in form not found'; end if;

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
    raise exception '[save_room_inspection_form] Permission denied';
  end if;

  select r.default_role_level into v_role_level
  from public.profiles p join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  if p_form_type = 'move_out' and coalesce(v_role_level, 0) < 65 then
    raise exception '[save_room_inspection_form] Move-out requires TAC';
  end if;

  if p_form_type = 'move_in' then
    if p_form_id is null then
      insert into public.room_move_in_forms (
        barracks_room_id, cadet_id, room_number, filled_by_id, validated_by_id, notes, completed_at,
        submission_status
      ) values (
        p_room_id, p_cadet_id, v_room.room_number, auth.uid(), p_validated_by_id, p_notes,
        case when p_mark_complete then now() else null end,
        case when p_mark_complete then 'validated' else 'draft' end
      )
      returning id into v_form_id;
    else
      v_form_id := p_form_id;
      update public.room_move_in_forms
      set
        validated_by_id = coalesce(p_validated_by_id, validated_by_id),
        notes = coalesce(p_notes, notes),
        completed_at = case when p_mark_complete then coalesce(completed_at, now()) else completed_at end,
        submission_status = case when p_mark_complete then 'validated' else submission_status end,
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
          p_cadet_id
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
  v_greensheets_posted integer := 0;
  v_cadet record;
  v_classification text;
  v_preflight jsonb;
  v_force_bypassed jsonb;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception '[close_school_year] Permission denied';
  end if;

  if p_force and not public.can_force_close_school_year() then
    raise exception '[close_school_year] Force archive requires admin role level above 100';
  end if;

  if exists (select 1 from public.year_close_audit where school_year = p_school_year) then
    raise exception '[close_school_year] School year % has already been closed', p_school_year;
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, p_next_school_year);

  if not (v_preflight ->> 'next_year_terms_configured')::boolean then
    raise exception '[close_school_year] Next school year % must have 5 active terms configured before close', p_next_school_year;
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'open_events')::integer, 0) > 0 then
    raise exception '[close_school_year] Open events must be resolved or carried forward before year close (Day 10)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'open_special_reports')::integer, 0) > 0 then
    raise exception '[close_school_year] Open special reports must be resolved before year close (Day 10)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'summary_drafts')::integer, 0) > 0 then
    raise exception '[close_school_year] Summary drafts must be finalized before year close (Day 12)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'suspended_cadets')::integer, 0) > 0 then
    raise exception '[close_school_year] Archived cadets marked suspended must be resolved to non_return or dismissal before year close';
  end if;

  if p_force then
    v_force_bypassed := v_preflight -> 'manual';
  end if;

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

  update public.demerit_reports dr
  set posted_at = now()
  where dr.status = 'completed'
    and dr.posted_at is null
    and dr.date_of_offense >= (
      select min(start_date) from public.academic_terms where school_year = p_school_year
    )
    and dr.date_of_offense < (
      select max(end_date) + interval '1 day' from public.academic_terms where school_year = p_school_year
    );
  get diagnostics v_greensheets_posted = row_count;

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
    select p.id, p.role_id, p.company_id, cp.departure_classification, cp.graduated_at
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

    v_classification := case
      when v_cadet.graduated_at is not null then null
      when v_cadet.departure_classification in ('withdrawn', 'dismissal') then v_cadet.departure_classification
      else 'non_return'
    end;

    update public.cadet_profiles cp
    set
      room_number = null,
      cached_tour_balance = 0,
      has_star_tours = false,
      probation_status = 'None',
      probation_notes = null,
      departure_classification = v_classification,
      updated_at = now()
    where cp.profile_id = v_cadet.id;

    update public.profiles p
    set
      archived = true,
      company_id = null,
      role_id = null
    where p.id = v_cadet.id;

    perform public._open_cadet_archive_interval(
      v_cadet.id,
      'archived',
      v_classification,
      now(),
      v_actor
    );

    v_cadets_archived := v_cadets_archived + 1;
  end loop;

  v_counts := jsonb_build_object(
    'demerits_pulled', v_pulled,
    'greensheets_posted', v_greensheets_posted,
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

create or replace function public.get_cadet_period_stats(
  p_cadet_id uuid,
  p_school_year text default null,
  p_term_number smallint default null
)
returns table(
  school_year text,
  term_number smallint,
  term_demerits bigint,
  year_demerits bigint,
  conduct_status text,
  total_tours_marched bigint,
  current_tour_balance integer,
  is_current_period boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_cadet_history(p_cadet_id) then
    raise exception '[get_cadet_period_stats] Permission denied — viewer cannot access cadet history';
  end if;

  return query
  select * from public._get_cadet_period_stats_core(p_cadet_id, p_school_year, p_term_number);
end;
$$;

create or replace function public.list_cadets_by_conduct(
  p_school_year text,
  p_term_number smallint,
  p_conduct_level text default 'Exemplary',
  p_company_id uuid default null,
  p_include_archived boolean default false
)
returns table(
  cadet_id uuid,
  first_name text,
  last_name text,
  company_name text,
  term_demerits bigint,
  year_demerits bigint,
  conduct_status text,
  archived boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_perms record;
  v_bounds record;
  v_year_archived boolean;
begin
  select * into v_perms from public.get_my_roster_permissions();

  if v_perms.role_level < 50
     and v_perms.can_manage_all = false
     and v_perms.can_manage_own = false then
    raise exception '[list_cadets_by_conduct] Permission denied — company scope';
  end if;

  select * into v_bounds
  from public.resolve_period_bounds(p_school_year, p_term_number)
  limit 1;

  select not exists (
    select 1 from public.academic_terms t
    where t.school_year = p_school_year and t.archived = false
  ) into v_year_archived;

  return query
  with eligible_cadets as (
    select distinct p.id as cadet_id
    from public.profiles p
    join public.cadet_profiles cp on cp.profile_id = p.id
    left join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and (
        v_year_archived
        or p_include_archived
        or coalesce(p.archived, false) = false
      )
      and (
        v_year_archived
        or exists (
          select 1 from public.demerit_reports dr
          where dr.subject_cadet_id = p.id
            and dr.status = 'completed'
            and dr.date_of_offense::date >= v_bounds.year_start
            and dr.date_of_offense::date <= v_bounds.term_end
        )
        or exists (
          select 1 from public.cadet_class_enrollments ce
          where ce.cadet_id = p.id and ce.school_year = p_school_year
        )
        or (coalesce(p.archived, false) = false and not v_year_archived)
      )
  )
  select
    p.id,
    p.first_name,
    p.last_name,
    c.company_name,
    ps.term_demerits,
    ps.year_demerits,
    ps.conduct_status,
    coalesce(p.archived, false)
  from eligible_cadets ec
  join public.profiles p on p.id = ec.cadet_id
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.companies c on c.id = p.company_id
  cross join lateral public._get_cadet_period_stats_core(p.id, p_school_year, p_term_number) ps
  where ps.conduct_status = coalesce(p_conduct_level, ps.conduct_status)
    and (
      v_perms.can_manage_all = true
      or v_perms.role_level >= 90
      or public.is_site_admin()
      or (
        v_perms.can_manage_own = true
        and (
          v_year_archived
          or p_company_id is null and p.company_id = v_perms.company_id
          or p_company_id is not null and p.company_id = p_company_id
        )
      )
    )
  order by p.last_name, p.first_name;
end;
$$;

create or replace function public.archive_cadet_profile(
  p_cadet_id uuid,
  p_reason text default 'archived',
  p_departure_classification text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level int := public.get_my_role_level();
  v_viewer_company uuid;
  v_cadet record;
begin
  if p_departure_classification is null
    or p_departure_classification not in ('non_return', 'withdrawn', 'suspended', 'dismissal') then
    raise exception '[archive_cadet_profile] departure_classification required (non_return, withdrawn, suspended, dismissal)';
  end if;

  select p.id, p.role_id, p.company_id, p.archived
  into v_cadet
  from public.profiles p
  where p.id = p_cadet_id;

  if not found or coalesce(v_cadet.archived, false) then
    raise exception 'Cadet not found or already archived';
  end if;

  select company_id into v_viewer_company from public.profiles where id = auth.uid();

  if not public.is_site_admin() and v_level < 90 then
    if v_level < 65 or v_viewer_company is distinct from v_cadet.company_id then
      raise exception 'Permission denied';
    end if;
  end if;

  if v_cadet.role_id is not null then
    perform public.append_cadet_role_history(p_cadet_id, v_cadet.role_id, v_cadet.company_id, p_reason);
  end if;

  update public.cadet_oversight_assignments o
  set is_active = false, ended_at = now()
  where o.cadet_id = p_cadet_id and o.is_active = true;

  update public.cadet_profiles cp
  set
    room_number = null,
    cached_tour_balance = 0,
    probation_status = 'None',
    probation_notes = null,
    departure_classification = p_departure_classification,
    updated_at = now()
  where cp.profile_id = p_cadet_id;

  update public.profiles p
  set archived = true, company_id = null, role_id = null
  where p.id = p_cadet_id;
end;
$$;

create or replace function public.add_manual_oversight(
  p_cadet_id uuid,
  p_staff_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce((select archived from public.profiles where id = p_cadet_id), false) then
    raise exception 'Cannot assign oversight to an archived cadet';
  end if;

  if p_staff_id = auth.uid() then
    if not public.is_teacher_staff() then
      raise exception '[add_manual_oversight] Permission denied — cadet cannot self-assign';
    end if;
  elsif not public.can_manage_cadet_schedule(p_cadet_id) and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception '[add_manual_oversight] Permission denied';
  end if;

  perform public.upsert_oversight_assignment(
    p_cadet_id, p_staff_id, 'faculty', 'manual', 'manual:' || auth.uid()::text,
    null, null, null, null, auth.uid()
  );

  select id into v_id
  from public.cadet_oversight_assignments
  where cadet_id = p_cadet_id
    and staff_id = p_staff_id
    and assignment_type = 'faculty'
    and source = 'manual'
    and is_active = true
  limit 1;

  return v_id;
end;
$$;

create or replace function public.remove_manual_oversight(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  select * into v_row
  from public.cadet_oversight_assignments
  where id = p_assignment_id and is_active = true;

  if v_row.id is null then
    raise exception 'Assignment not found';
  end if;

  if v_row.source <> 'manual' or v_row.assignment_type <> 'faculty' then
    raise exception 'Only manual faculty assignments can be removed this way';
  end if;

  if v_row.staff_id <> auth.uid()
    and not public.can_manage_cadet_schedule(v_row.cadet_id)
    and public.get_my_role_level() < 90
    and not public.is_site_admin() then
    raise exception '[remove_manual_oversight] Permission denied';
  end if;

  update public.cadet_oversight_assignments
  set is_active = false, ended_at = now()
  where id = p_assignment_id;

  perform public.log_oversight_change(
    v_row.cadet_id, v_row.staff_id, v_row.assignment_type, 'removed', v_row.source, auth.uid(), '{}'::jsonb
  );
end;
$$;

CREATE OR REPLACE FUNCTION public.pull_report(p_report_id uuid, p_comment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report record;
  v_viewer_id uuid := auth.uid();
  v_viewer_role_level int := public.get_my_role_level();
  v_viewer_role_name text := public.get_my_role_name();
  v_action_text text;
BEGIN
  -- 1. Get the report
  SELECT * INTO v_report
  FROM public.demerit_reports
  WHERE id = p_report_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '[pull_report] Report not found.';
  END IF;

  -- 2. Security Check: Must be original submitter OR Senior Command Staff (Level 90+)
  -- *** CHANGED FROM 50 TO 90 ***
  IF v_report.submitted_by != v_viewer_id AND v_viewer_role_level < 90 THEN
    RAISE EXCEPTION '[pull_report] Permission Denied — Only the original issuer or Commandant Staff/Admins can pull this report.';
  END IF;

  -- 3. Comment Check: A reason is required
  IF p_comment IS NULL OR p_comment = '' THEN
    RAISE EXCEPTION '[pull_report] A comment is required to pull a report.';
  END IF;
  
  -- 4. Determine Action Text for the log
  IF v_report.submitted_by = v_viewer_id THEN
    v_action_text := 'Pulled by Issuer';
  ELSE
    v_action_text := 'Pulled by ' || v_viewer_role_name;
  END IF;

  -- 5. Action 1: Update the report
  UPDATE public.demerit_reports
  SET 
    status = 'pulled',
    demerits_effective = 0
  WHERE id = p_report_id;

  -- 6. Action 2: Nullify the tour ledger entry
  UPDATE public.tour_ledger
  SET amount = 0
  WHERE report_id = p_report_id;

  -- 7. Action 3: Log the action
  INSERT INTO public.approval_log (report_id, actor_id, action, comment)
  VALUES (p_report_id, v_viewer_id, v_action_text, p_comment);

END;
$function$
;

create or replace function public.enforce_demerit_report_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_policy_category int;
begin
  if public.get_my_role_level() >= 90 then
    return new;
  end if;

  select ot.policy_category
  into v_policy_category
  from public.offense_types ot
  where ot.id = new.offense_type_id;

  if v_policy_category is null then
    raise exception '[enforce_demerit_report_category] Invalid offense type.';
  end if;

  if not public.is_policy_category_allowed(v_policy_category) then
    if v_policy_category = 3 then
      raise exception '[enforce_demerit_report_category] Category III Demerit Reports require Company TAC authority.';
    elsif v_policy_category = 2 then
      raise exception '[enforce_demerit_report_category] Category II Demerit Reports require Company TAC authority.';
    else
      raise exception '[enforce_demerit_report_category] Your role is not authorized to submit this category of Demerit Report.';
    end if;
  end if;

  return new;
end;
$$;

-- Same-transaction close/reactivate uses a stable now(); ensure ended_at > started_at.
create or replace function public._close_cadet_archive_interval(
  p_cadet_id uuid,
  p_ended_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cadet_archive_intervals
  set ended_at = greatest(p_ended_at, started_at + interval '1 microsecond')
  where cadet_id = p_cadet_id
    and ended_at is null;
end;
$$;

-- Same-transaction close/reactivate uses a stable now(); ensure ended_at > started_at.
create or replace function public._close_cadet_archive_interval(
  p_cadet_id uuid,
  p_ended_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cadet_archive_intervals
  set ended_at = greatest(p_ended_at, started_at + interval '1 microsecond')
  where cadet_id = p_cadet_id
    and ended_at is null;
end;
$$;
