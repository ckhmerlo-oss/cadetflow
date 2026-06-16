-- Unified submit hub: configurable incident submission + demerit submit permission helpers.
-- School defaults in app_options (company overrides deferred to Day 12.4 company_policy_settings).

-- ---------------------------------------------------------------------------
-- Incident submission policy helpers
-- ---------------------------------------------------------------------------

create or replace function public.can_submit_incidents(p_role_level int default null)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role_level int;
  v_value text;
begin
  v_role_level := coalesce(p_role_level, public.get_my_role_level());

  if v_role_level >= 90 then
    return true;
  end if;

  if to_regclass('public.app_options') is null then
    return v_role_level >= 20;
  end if;

  select ao.value
  into v_value
  from public.app_options ao
  where ao.category = 'incident_submission'
    and ao.is_active = true
    and ao.group_name ~ '^\d+$'
    and ao.group_name::int <= v_role_level
  order by ao.group_name::int desc
  limit 1;

  if v_value is null then
    return false;
  end if;

  return lower(btrim(v_value)) in ('true', '1', 'yes');
end;
$$;

create or replace function public.can_submit_demerits(p_role_level int default null)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role_level int;
  v_value text;
begin
  v_role_level := coalesce(p_role_level, public.get_my_role_level());

  if v_role_level >= 90 then
    return true;
  end if;

  if to_regclass('public.app_options') is null then
    return v_role_level >= 15;
  end if;

  select ao.value
  into v_value
  from public.app_options ao
  where ao.category = 'demerit_submission'
    and ao.is_active = true
    and ao.group_name ~ '^\d+$'
    and ao.group_name::int <= v_role_level
  order by ao.group_name::int desc
  limit 1;

  if v_value is null then
    return v_role_level >= 15;
  end if;

  return lower(btrim(v_value)) in ('true', '1', 'yes');
end;
$$;

create or replace function public.get_incident_submission_policy()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'min_role_level', ao.group_name::int,
        'allowed', lower(btrim(ao.value)) in ('true', '1', 'yes')
      )
      order by ao.group_name::int
    ),
    '[]'::jsonb
  )
  from public.app_options ao
  where ao.category = 'incident_submission'
    and ao.is_active = true
    and ao.group_name ~ '^\d+$';
$$;

create or replace function public.get_demerit_submission_policy()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'min_role_level', ao.group_name::int,
        'allowed', lower(btrim(ao.value)) in ('true', '1', 'yes')
      )
      order by ao.group_name::int
    ),
    '[]'::jsonb
  )
  from public.app_options ao
  where ao.category = 'demerit_submission'
    and ao.is_active = true
    and ao.group_name ~ '^\d+$';
$$;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table if not exists public.incident_submission_policy_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null default 'updated',
  old_policy jsonb not null default '[]'::jsonb,
  new_policy jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint incident_submission_policy_log_action_check
    check (action in ('updated'))
);

alter table public.incident_submission_policy_log enable row level security;

revoke all on table public.incident_submission_policy_log from anon;
grant select on table public.incident_submission_policy_log to authenticated;
grant all on table public.incident_submission_policy_log to service_role;

drop policy if exists "Admins can view incident submission policy log"
  on public.incident_submission_policy_log;
create policy "Admins can view incident submission policy log"
on public.incident_submission_policy_log
for select
to authenticated
using (public.get_my_role_level() >= 90 or public.is_site_admin());

-- ---------------------------------------------------------------------------
-- Admin update RPC
-- ---------------------------------------------------------------------------

create or replace function public.update_incident_submission_policy(p_bands jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old jsonb;
  v_new jsonb;
  band jsonb;
  v_min int;
  v_allowed boolean;
  seen_thresholds int[] := array[]::int[];
begin
  if public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied.';
  end if;

  if p_bands is null or jsonb_typeof(p_bands) <> 'array' then
    raise exception 'Policy bands must be a JSON array.';
  end if;

  if jsonb_array_length(p_bands) = 0 then
    raise exception 'At least one policy band is required.';
  end if;

  v_old := public.get_incident_submission_policy();

  for band in select value from jsonb_array_elements(p_bands)
  loop
    v_min := (band ->> 'min_role_level')::int;
    if v_min is null or v_min < 0 then
      raise exception 'Each band requires a non-negative min_role_level.';
    end if;

    if v_min = any(seen_thresholds) then
      raise exception 'Duplicate min_role_level in policy bands.';
    end if;
    seen_thresholds := array_append(seen_thresholds, v_min);

    v_allowed := coalesce((band ->> 'allowed')::boolean, false);
    if v_allowed is null then
      raise exception 'Each band requires an allowed boolean.';
    end if;
  end loop;

  delete from public.app_options
  where category = 'incident_submission';

  for band in
    select value
    from jsonb_array_elements(p_bands)
    order by (value ->> 'min_role_level')::int
  loop
    v_min := (band ->> 'min_role_level')::int;
    v_allowed := coalesce((band ->> 'allowed')::boolean, false);

    insert into public.app_options (category, value, group_name, sort_order, is_active)
    values (
      'incident_submission',
      case when v_allowed then 'true' else 'false' end,
      v_min::text,
      v_min,
      true
    );
  end loop;

  v_new := public.get_incident_submission_policy();

  insert into public.incident_submission_policy_log (actor_id, action, old_policy, new_policy)
  values (auth.uid(), 'updated', v_old, v_new);

  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Default seeds
-- ---------------------------------------------------------------------------

delete from public.app_options
where category in ('incident_submission', 'demerit_submission');

insert into public.app_options (category, value, group_name, sort_order, is_active)
values
  ('incident_submission', 'true', '20', 20, true),
  ('demerit_submission', 'true', '15', 15, true);

-- ---------------------------------------------------------------------------
-- RLS: incident_reports insert uses policy function
-- ---------------------------------------------------------------------------

drop policy if exists "Faculty create incidents" on public.incident_reports;
create policy "Authorized users create incidents"
on public.incident_reports
for insert
to authenticated
with check (public.can_submit_incidents());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant execute on function public.can_submit_incidents(int) to authenticated;
grant execute on function public.can_submit_demerits(int) to authenticated;
grant execute on function public.get_incident_submission_policy() to authenticated;
grant execute on function public.get_demerit_submission_policy() to authenticated;
grant execute on function public.update_incident_submission_policy(jsonb) to authenticated;
