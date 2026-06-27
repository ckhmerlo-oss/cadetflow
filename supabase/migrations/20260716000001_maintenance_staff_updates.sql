-- Maintenance staff: alias helper + work order detail edits

create or replace function public.is_maintenance_profile(p_profile_id uuid)
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
    where p.id = p_profile_id
      and r.role_name ilike '%maintenance%'
  );
$$;

create or replace function public.is_staff(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.profile_role_level(p_profile_id) >= 50
    or public.is_maintenance_profile(p_profile_id);
$$;

create or replace function public.is_cadet(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.profile_role_level(p_profile_id) < 50
    and not public.is_maintenance_profile(p_profile_id);
$$;

create or replace function public.sync_profile_extensions_on_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_staff boolean;
  v_new_staff boolean;
  v_staff_title text;
begin
  if tg_op = 'INSERT' then
    v_new_staff := public.is_staff(new.id);
    if v_new_staff then
      perform public.ensure_staff_profile(new.id);
    elsif public.is_cadet(new.id) then
      perform public.ensure_cadet_profile(new.id);
    end if;
    return new;
  end if;

  if new.role_id is not distinct from old.role_id then
    return new;
  end if;

  v_old_staff := coalesce((
    select coalesce(r.default_role_level, 0) >= 50
      or r.role_name ilike '%maintenance%'
    from public.roles r
    where r.id = old.role_id
  ), false);
  v_new_staff := public.is_staff(new.id);

  if not v_old_staff and v_new_staff then
    select cadet_rank into v_staff_title
    from public.cadet_profiles
    where profile_id = new.id;

    delete from public.cadet_profiles where profile_id = new.id;
    insert into public.staff_profiles (profile_id, staff_title)
    values (new.id, v_staff_title)
    on conflict (profile_id) do update
      set staff_title = coalesce(public.staff_profiles.staff_title, excluded.staff_title);
  elsif v_old_staff and not v_new_staff then
    select staff_title into v_staff_title
    from public.staff_profiles
    where profile_id = new.id;

    delete from public.staff_profiles where profile_id = new.id;
    insert into public.cadet_profiles (profile_id, cadet_rank)
    values (new.id, v_staff_title)
    on conflict (profile_id) do update
      set cadet_rank = coalesce(public.cadet_profiles.cadet_rank, excluded.cadet_rank);
  end if;

  return new;
end;
$$;

create or replace function public.is_maintenance_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_maintenance_manager();
$$;

grant execute on function public.is_maintenance_staff() to authenticated;

create or replace function public.update_work_order_details(
  p_work_order_id uuid,
  p_description text default null,
  p_issue_presets text[] default null,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wo public.work_orders%rowtype;
  v_is_admin boolean;
  v_is_maint boolean;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_wo from public.work_orders where id = p_work_order_id for update;
  if not found then
    raise exception 'Work order not found';
  end if;

  v_is_admin := public.is_site_admin() or public.get_my_role_level() >= 90;
  v_is_maint := public.is_maintenance_manager();

  if not v_is_maint and not v_is_admin then
    raise exception 'Permission denied';
  end if;

  if v_wo.status not in ('forwarded', 'assigned') and not v_is_admin then
    raise exception 'Work order cannot be edited in status %', v_wo.status;
  end if;

  update public.work_orders
  set
    description = coalesce(nullif(btrim(p_description), ''), description),
    issue_presets = coalesce(p_issue_presets, issue_presets),
    notes = case
      when p_notes is null then notes
      else nullif(btrim(p_notes), '')
    end,
    updated_at = now()
  where id = p_work_order_id;

  perform public._work_order_append_audit(
    p_work_order_id,
    'update_details',
    v_wo.status,
    v_wo.status,
    null,
    jsonb_build_object(
      'description_changed', p_description is not null,
      'issue_presets_changed', p_issue_presets is not null,
      'notes_changed', p_notes is not null
    )
  );
end;
$$;

grant execute on function public.update_work_order_details(uuid, text, text[], text) to authenticated;
