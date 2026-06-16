-- Day 05: Configurable stick category restrictions (policy in app_options)

-- Ensure app_options exists (may be live-schema only in some environments).
create table if not exists public.app_options (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  value text not null,
  group_name text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_options_category_active
  on public.app_options (category)
  where is_active = true;

-- ---------------------------------------------------------------------------
-- Policy helpers
-- ---------------------------------------------------------------------------

create or replace function public.get_allowed_policy_categories(p_role_level int default null)
returns int[]
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

  if to_regclass('public.app_options') is null then
    return array[1]::int[];
  end if;

  select ao.value
  into v_value
  from public.app_options ao
  where ao.category = 'category_restriction'
    and ao.is_active = true
    and ao.group_name ~ '^\d+$'
    and ao.group_name::int <= v_role_level
  order by ao.group_name::int desc
  limit 1;

  if v_value is null or btrim(v_value) = '' then
    return array[1]::int[];
  end if;

  return coalesce(
    (
      select array_agg(distinct token::int order by token::int)
      from (
        select btrim(part) as token
        from unnest(string_to_array(v_value, ',')) as part
      ) parsed
      where token ~ '^\d+$'
        and token::int between 1 and 3
    ),
    array[1]::int[]
  );
end;
$$;

create or replace function public.is_policy_category_allowed(
  p_policy_category int,
  p_role_level int default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role_level int;
begin
  if p_policy_category = 0 then
    return true;
  end if;

  v_role_level := coalesce(p_role_level, public.get_my_role_level());

  if v_role_level >= 90 then
    return true;
  end if;

  return p_policy_category = any(public.get_allowed_policy_categories(v_role_level));
end;
$$;

-- ---------------------------------------------------------------------------
-- Enforcement trigger
-- ---------------------------------------------------------------------------

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
    raise exception 'Invalid offense type.';
  end if;

  if not public.is_policy_category_allowed(v_policy_category) then
    if v_policy_category = 3 then
      raise exception 'Category III Demerit Reports require Company TAC authority.';
    elsif v_policy_category = 2 then
      raise exception 'Category II Demerit Reports require Company TAC authority.';
    else
      raise exception 'Your role is not authorized to submit this category of Demerit Report.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_demerit_report_category on public.demerit_reports;
create trigger trg_enforce_demerit_report_category
before insert or update of offense_type_id
on public.demerit_reports
for each row
execute function public.enforce_demerit_report_category();

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table if not exists public.category_restriction_policy_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null default 'updated',
  old_policy jsonb not null default '[]'::jsonb,
  new_policy jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint category_restriction_policy_log_action_check
    check (action in ('updated'))
);

alter table public.category_restriction_policy_log enable row level security;

revoke all on table public.category_restriction_policy_log from anon;
grant select on table public.category_restriction_policy_log to authenticated;
grant all on table public.category_restriction_policy_log to service_role;

drop policy if exists "Admins can view category restriction policy log"
  on public.category_restriction_policy_log;
create policy "Admins can view category restriction policy log"
on public.category_restriction_policy_log
for select
to authenticated
using (public.get_my_role_level() >= 90 or public.is_site_admin());

-- ---------------------------------------------------------------------------
-- Policy snapshot helpers
-- ---------------------------------------------------------------------------

create or replace function public.get_category_restriction_policy()
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
        'allowed_categories', (
          select coalesce(
            jsonb_agg(distinct token::int order by token::int),
            '[]'::jsonb
          )
          from (
            select btrim(part) as token
            from unnest(string_to_array(ao.value, ',')) as part
          ) parsed
          where token ~ '^\d+$'
            and token::int between 1 and 3
        )
      )
      order by ao.group_name::int
    ),
    '[]'::jsonb
  )
  from public.app_options ao
  where ao.category = 'category_restriction'
    and ao.is_active = true
    and ao.group_name ~ '^\d+$';
$$;

create or replace function public.update_category_restriction_policy(p_bands jsonb)
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
  v_cats int[];
  v_value text;
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

  v_old := public.get_category_restriction_policy();

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

    select coalesce(array_agg(distinct cat::int order by cat::int), array[]::int[])
    into v_cats
    from jsonb_array_elements_text(coalesce(band -> 'allowed_categories', '[]'::jsonb)) as cat_text(cat)
    where cat ~ '^\d+$'
      and cat::int between 1 and 3;

    if coalesce(array_length(v_cats, 1), 0) = 0 then
      raise exception 'Each band requires at least one allowed category (1-3).';
    end if;
  end loop;

  delete from public.app_options
  where category = 'category_restriction';

  for band in
    select value
    from jsonb_array_elements(p_bands)
    order by (value ->> 'min_role_level')::int
  loop
    v_min := (band ->> 'min_role_level')::int;

    select coalesce(array_agg(distinct cat::int order by cat::int), array[]::int[])
    into v_cats
    from jsonb_array_elements_text(band -> 'allowed_categories') as cat_text(cat)
    where cat ~ '^\d+$'
      and cat::int between 1 and 3;

    v_value := array_to_string(v_cats, ',');

    insert into public.app_options (category, value, group_name, sort_order, is_active)
    values ('category_restriction', v_value, v_min::text, v_min, true);
  end loop;

  v_new := public.get_category_restriction_policy();

  insert into public.category_restriction_policy_log (actor_id, action, old_policy, new_policy)
  values (auth.uid(), 'updated', v_old, v_new);

  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Default policy seed
-- ---------------------------------------------------------------------------

delete from public.app_options
where category = 'category_restriction';

insert into public.app_options (category, value, group_name, sort_order, is_active)
values
  ('category_restriction', '1', '20', 20, true),
  ('category_restriction', '1,2,3', '65', 65, true);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant execute on function public.get_allowed_policy_categories(int) to authenticated;
grant execute on function public.is_policy_category_allowed(int, int) to authenticated;
grant execute on function public.get_category_restriction_policy() to authenticated;
grant execute on function public.update_category_restriction_policy(jsonb) to authenticated;
