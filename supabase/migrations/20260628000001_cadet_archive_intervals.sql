-- Cadet archive intervals for point-in-time historical roster/profile views

-- ---------------------------------------------------------------------------
-- 1. cadet_archive_intervals table
-- ---------------------------------------------------------------------------

create table if not exists public.cadet_archive_intervals (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  reason text not null default 'archived',
  departure_classification text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint cadet_archive_intervals_dates check (ended_at is null or ended_at > started_at),
  constraint cadet_archive_intervals_departure_classification_check check (
    departure_classification is null
    or departure_classification in ('non_return', 'withdrawn', 'suspended', 'dismissal')
  )
);

create unique index if not exists cadet_archive_intervals_one_open
  on public.cadet_archive_intervals (cadet_id)
  where ended_at is null;

create index if not exists cadet_archive_intervals_cadet_started
  on public.cadet_archive_intervals (cadet_id, started_at desc);

alter table public.cadet_archive_intervals enable row level security;

create policy "Staff can view cadet archive intervals"
  on public.cadet_archive_intervals
  for select
  to authenticated
  using (
    public.get_my_role_level() >= 50
    or public.can_view_archived_cadet(cadet_id)
    or cadet_id = auth.uid()
  );

grant select on public.cadet_archive_intervals to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Interval helpers
-- ---------------------------------------------------------------------------

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
  set ended_at = p_ended_at
  where cadet_id = p_cadet_id
    and ended_at is null;
end;
$$;

create or replace function public._open_cadet_archive_interval(
  p_cadet_id uuid,
  p_reason text default 'archived',
  p_departure_classification text default null,
  p_started_at timestamptz default now(),
  p_created_by uuid default auth.uid()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._close_cadet_archive_interval(p_cadet_id, p_started_at);

  insert into public.cadet_archive_intervals (
    cadet_id,
    started_at,
    reason,
    departure_classification,
    created_by
  )
  values (
    p_cadet_id,
    p_started_at,
    coalesce(p_reason, 'archived'),
    p_departure_classification,
    p_created_by
  );
end;
$$;

create or replace function public.cadet_was_archived_at(
  p_cadet_id uuid,
  p_as_of timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cadet_archive_intervals i
    where i.cadet_id = p_cadet_id
      and i.started_at <= p_as_of
      and (i.ended_at is null or i.ended_at > p_as_of)
  );
$$;

create or replace function public.cadet_archive_as_of(
  p_cadet_id uuid,
  p_as_of timestamptz
)
returns table(
  departure_classification text,
  archive_started_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select i.departure_classification, i.started_at
  from public.cadet_archive_intervals i
  where i.cadet_id = p_cadet_id
    and i.started_at <= p_as_of
    and (i.ended_at is null or i.ended_at > p_as_of)
  order by i.started_at desc
  limit 1;
$$;

create or replace function public.cadet_company_name_as_of(
  p_cadet_id uuid,
  p_as_of date
)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select c.company_name
      from public.profiles p
      left join public.companies c on c.id = p.company_id
      where p.id = p_cadet_id
    ),
    (
      select elem ->> 'company_name'
      from public.cadet_profiles cp,
        jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) with ordinality as t(elem, ord)
      where cp.profile_id = p_cadet_id
        and nullif(elem ->> 'ended_at', '') is not null
        and (elem ->> 'ended_at')::timestamptz <= (p_as_of + interval '1 day')
      order by (elem ->> 'ended_at')::timestamptz desc
      limit 1
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Backfill open intervals for currently archived cadets
-- ---------------------------------------------------------------------------

insert into public.cadet_archive_intervals (
  cadet_id,
  started_at,
  reason,
  departure_classification
)
select
  p.id,
  coalesce(
    (
      select (elem ->> 'ended_at')::timestamptz
      from public.cadet_profiles cp2,
        jsonb_array_elements(coalesce(cp2.role_history, '[]'::jsonb)) with ordinality as t(elem, ord)
      where cp2.profile_id = p.id
        and elem ->> 'reason' = 'archived'
      order by ord desc
      limit 1
    ),
    cp.updated_at,
    now()
  ),
  'archived',
  cp.departure_classification
from public.profiles p
join public.cadet_profiles cp on cp.profile_id = p.id
where coalesce(p.archived, false) = true
  and not exists (
    select 1
    from public.cadet_archive_intervals i
    where i.cadet_id = p.id
      and i.ended_at is null
  );

-- ---------------------------------------------------------------------------
-- 4. resolve_period_bounds — reject unstarted periods
-- ---------------------------------------------------------------------------

create or replace function public.resolve_period_bounds(
  p_school_year text default null,
  p_term_number smallint default null
)
returns table(
  school_year text,
  term_number smallint,
  term_start date,
  term_end date,
  year_start date
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_school_year text := p_school_year;
  v_term_number smallint := p_term_number;
begin
  if v_school_year is null then
    select t.school_year, t.term_number
    into v_school_year, v_term_number
    from public.academic_terms t
    where now() between t.start_date and (t.end_date + interval '1 day')
    order by t.start_date desc
    limit 1;

    if v_school_year is null then
      raise exception 'No current academic term configured';
    end if;
  end if;

  select min(t.start_date) into year_start
  from public.academic_terms t
  where t.school_year = v_school_year;

  if year_start is null then
    raise exception 'School year % not found', v_school_year;
  end if;

  if v_term_number is not null then
    if not exists (
      select 1 from public.academic_terms t
      where t.school_year = v_school_year and t.term_number = v_term_number
    ) then
      raise exception 'Term % not found for school year %', v_term_number, v_school_year;
    end if;

    if not exists (
      select 1 from public.academic_terms t
      where t.school_year = v_school_year
        and t.term_number = v_term_number
        and t.start_date <= current_date
    ) then
      raise exception 'Term % has not started yet for school year %', v_term_number, v_school_year;
    end if;

    return query
    select
      v_school_year,
      v_term_number,
      t.start_date,
      t.end_date,
      year_start
    from public.academic_terms t
    where t.school_year = v_school_year
      and t.term_number = v_term_number;
  else
    if year_start > current_date then
      raise exception 'School year % has not started yet', v_school_year;
    end if;

    return query
    select
      v_school_year,
      null::smallint,
      min(t.start_date),
      max(t.end_date),
      year_start
    from public.academic_terms t
    where t.school_year = v_school_year
      and t.start_date <= current_date;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. archive_cadet_profile — record interval
-- ---------------------------------------------------------------------------

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
    raise exception 'Departure classification is required (non_return, withdrawn, suspended, dismissal)';
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

  perform public._open_cadet_archive_interval(
    p_cadet_id,
    coalesce(p_reason, 'archived'),
    p_departure_classification
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. reactivate_cadets — close open interval
-- ---------------------------------------------------------------------------

create or replace function public.reactivate_cadets(
  p_cadet_ids uuid[],
  p_company_id uuid,
  p_role_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cadet_id uuid;
  v_count integer := 0;
  v_level int := public.get_my_role_level();
  v_viewer_company uuid;
begin
  if not public.is_site_admin() and v_level < 65 then
    raise exception 'Permission denied';
  end if;

  select company_id into v_viewer_company from public.profiles where id = auth.uid();

  foreach v_cadet_id in array p_cadet_ids loop
    if v_level < 90 and not public.is_site_admin() then
      if v_viewer_company is distinct from (
        select (elem ->> 'company_id')::uuid
        from public.cadet_profiles cp,
          jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) with ordinality as t(elem, ord)
        where cp.profile_id = v_cadet_id
        order by ord desc
        limit 1
      ) and v_viewer_company is distinct from (
        select company_id from public.profiles where id = v_cadet_id
      ) then
        continue;
      end if;
    end if;

    update public.profiles p
    set archived = false, company_id = p_company_id
    where p.id = v_cadet_id
      and coalesce(p.archived, false) = true;

    if found then
      perform public._close_cadet_archive_interval(v_cadet_id);

      update public.profiles p
      set role_id = p_role_id
      where p.id = v_cadet_id;

      update public.cadet_profiles cp
      set
        years_attended = coalesce(cp.years_attended, 0) + 1,
        room_number = null,
        cached_tour_balance = 0,
        has_star_tours = false,
        probation_status = 'None',
        probation_notes = null,
        graduated_at = null,
        departure_classification = null,
        updated_at = now()
      where cp.profile_id = v_cadet_id;

      perform public.sync_cadet_oversight(v_cadet_id, auth.uid());
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.cadet_was_archived_at(uuid, timestamptz) to authenticated;
grant execute on function public.cadet_archive_as_of(uuid, timestamptz) to authenticated;
grant execute on function public.cadet_company_name_as_of(uuid, date) to authenticated;
