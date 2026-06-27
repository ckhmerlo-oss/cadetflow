-- Work order scoped views, audit history ordering, and email notification history

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Audit log: newest first
-- ---------------------------------------------------------------------------

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
  order by created_at desc;
$$;

-- ---------------------------------------------------------------------------
-- 2. Email notification history for forwarded work orders
-- ---------------------------------------------------------------------------

create or replace function public.get_work_order_notification_history(p_work_order_id uuid)
returns table (
  sent_at timestamptz,
  recipient_name text,
  intended_email text,
  status text,
  error_message text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.work_orders wo where wo.id = p_work_order_id
  ) then
    return;
  end if;

  return query
  select
    coalesce(edl.created_at, nq.created_at) as sent_at,
    coalesce(
      nullif(btrim(edl.profile_name), ''),
      nullif(btrim(pr.first_name || ' ' || pr.last_name), ''),
      'Unknown recipient'
    ) as recipient_name,
    coalesce(edl.intended_email, nq.intended_email, au.email::text) as intended_email,
    coalesce(edl.status, nq.status::text, 'pending') as status,
    coalesce(edl.error_message, nq.last_error) as error_message
  from public.notification_queue nq
  left join public.email_delivery_log edl on edl.queue_id = nq.id
  left join public.profiles pr on pr.id = nq.user_id
  left join auth.users au on au.id = nq.user_id
  where nq.idempotency_key like 'email:workorder.forwarded:' || p_work_order_id::text || ':%'
  order by coalesce(edl.created_at, nq.created_at) desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Persona-scoped work order lists
-- ---------------------------------------------------------------------------

create or replace function public._work_order_viewer_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_site_admin()
    or public.get_my_role_level() >= 90
    or exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = auth.uid()
        and coalesce(p.archived, false) = false
        and coalesce(r.can_manage_all_rosters, false) = true
    );
$$;

create or replace function public.get_my_work_orders(p_scope text)
returns setof public.work_orders
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_is_admin boolean;
  v_is_maint boolean;
  v_is_tac boolean;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_level := public.get_my_role_level();
  if v_level < 15 then
    raise exception 'Insufficient permissions';
  end if;

  if p_scope not in ('actionable', 'history', 'all') then
    raise exception 'Invalid scope: %', p_scope;
  end if;

  v_is_admin := public._work_order_viewer_is_admin();
  v_is_maint := public.is_maintenance_manager();
  v_is_tac := v_level >= 65;

  if p_scope = 'all' and not v_is_admin then
    raise exception 'Permission denied';
  end if;

  if p_scope = 'all' then
    return query
    select wo.*
    from public.work_orders wo
    order by wo.created_at desc;
    return;
  end if;

  -- Maintenance persona (even if also TAC, portal queue takes precedence for actionable)
  if v_is_maint and not v_is_admin then
    if p_scope = 'actionable' then
      return query
      select wo.*
      from public.work_orders wo
      where wo.status in ('forwarded', 'assigned')
      order by
        case when wo.assigned_to_id = auth.uid() then 0 else 1 end,
        wo.created_at desc;
    else
      return query
      select wo.*
      from public.work_orders wo
      where wo.status in ('completed', 'cancelled')
      order by wo.created_at desc;
    end if;
    return;
  end if;

  -- TAC persona
  if v_is_tac and not v_is_admin then
    if p_scope = 'actionable' then
      return query
      select wo.*
      from public.work_orders wo
      where wo.status in ('submitted', 'tac_review')
        and public._work_order_can_tac_manage(wo.company_id)
      order by wo.created_at desc;
    else
      return query
      select wo.*
      from public.work_orders wo
      where wo.status in ('forwarded', 'assigned', 'completed', 'cancelled')
        and public._work_order_can_tac_manage(wo.company_id)
      order by wo.created_at desc;
    end if;
    return;
  end if;

  -- Admin persona for actionable/history split
  if v_is_admin then
    if p_scope = 'actionable' then
      return query
      select wo.*
      from public.work_orders wo
      where wo.status in ('submitted', 'tac_review')
      order by wo.created_at desc;
    else
      return query
      select wo.*
      from public.work_orders wo
      where wo.status in ('forwarded', 'assigned', 'completed', 'cancelled')
      order by wo.created_at desc;
    end if;
    return;
  end if;

  -- Submitter persona (role 15–64)
  if p_scope = 'actionable' then
    return query
    select wo.*
    from public.work_orders wo
    where wo.requester_id = auth.uid()
      and wo.status in ('submitted', 'tac_review')
    order by wo.created_at desc;
  else
    return query
    select wo.*
    from public.work_orders wo
    where wo.requester_id = auth.uid()
      and wo.status in ('forwarded', 'assigned', 'completed', 'cancelled')
    order by wo.created_at desc;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Forward notifications: record email recipients on audit entry
-- ---------------------------------------------------------------------------

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
  v_recipients jsonb := '[]'::jsonb;
  v_email text;
  v_name text;
  v_idempotency text;
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
    select au.email::text, p.first_name || ' ' || p.last_name
    into v_email, v_name
    from public.profiles p
    left join auth.users au on au.id = p.id
    where p.id = v_mm_id;

    v_idempotency := 'workorder.forwarded:' || p_work_order_id::text || ':' || v_mm_id::text;

    perform public.dispatch_user_notification(
      v_mm_id,
      'workorder.forwarded',
      v_title,
      v_body,
      v_link,
      v_idempotency,
      jsonb_build_object('work_order_id', p_work_order_id)
    );

    v_recipients := v_recipients || jsonb_build_array(
      jsonb_build_object(
        'user_id', v_mm_id,
        'name', coalesce(nullif(btrim(v_name), ''), 'Maintenance staff'),
        'email', coalesce(v_email, ''),
        'idempotency_key', v_idempotency
      )
    );
  end loop;

  update public.work_order_audit_log wal
  set metadata = coalesce(wal.metadata, '{}'::jsonb) || jsonb_build_object('email_recipients', v_recipients)
  where wal.id = (
    select w.id
    from public.work_order_audit_log w
    where w.work_order_id = p_work_order_id
      and w.action in ('forward', 'submitted_to_maintenance')
    order by w.created_at desc
    limit 1
  );
end;
$$;

grant execute on function public.get_my_work_orders(text) to authenticated;
grant execute on function public.get_work_order_notification_history(uuid) to authenticated;
