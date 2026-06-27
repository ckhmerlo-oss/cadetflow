-- Day 06: Archival foundation — role history, snapshots stub, incident closed, helpers

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. cadet_profiles.role_history
-- ---------------------------------------------------------------------------

alter table public.cadet_profiles
  add column if not exists role_history jsonb not null default '[]'::jsonb;

create or replace view public.cadet_profile_view as
select
  p.id,
  p.first_name,
  p.last_name,
  p.role_id,
  p.company_id,
  p.is_site_admin,
  p.archived,
  p.has_seen_tour,
  cp.cadet_rank,
  cp.grade_level,
  cp.room_number,
  cp.years_attended,
  cp.probation_status,
  cp.probation_notes,
  cp.sport_fall,
  cp.sport_winter,
  cp.sport_spring,
  cp.is_in_band,
  cp.extracurriculars,
  cp.has_star_tours,
  cp.cached_tour_balance,
  cp.total_demerits,
  cp.conduct_status,
  cp.parent_name,
  cp.parent_email,
  cp.parent_phone,
  cp.phone_number,
  cp.role_history
from public.profiles p
join public.cadet_profiles cp on cp.profile_id = p.id;

-- ---------------------------------------------------------------------------
-- 2. incident_reports.closed status
-- ---------------------------------------------------------------------------

alter table public.incident_reports
  drop constraint if exists incident_reports_status_check;

alter table public.incident_reports
  add constraint incident_reports_status_check
  check (status in ('pending', 'handled', 'converted', 'closed'));

-- ---------------------------------------------------------------------------
-- 3. cadet_conduct_snapshots (Day 07 stub)
-- ---------------------------------------------------------------------------

create table if not exists public.cadet_conduct_snapshots (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  school_year text not null,
  term_number smallint,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (cadet_id, school_year, term_number)
);

-- Year-end snapshots use term_number 0

create index if not exists idx_cadet_conduct_snapshots_cadet_year
  on public.cadet_conduct_snapshots (cadet_id, school_year);

alter table public.cadet_conduct_snapshots enable row level security;

grant select on public.cadet_conduct_snapshots to authenticated;
grant all on public.cadet_conduct_snapshots to service_role;

create policy "Staff view conduct snapshots"
on public.cadet_conduct_snapshots
for select
to authenticated
using (public.get_my_role_level() >= 50 or public.is_site_admin());

-- ---------------------------------------------------------------------------
-- 4. year_close_audit
-- ---------------------------------------------------------------------------

create table if not exists public.year_close_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id),
  school_year text not null,
  next_school_year text not null,
  counts jsonb not null default '{}'::jsonb,
  executed_at timestamptz not null default now(),
  unique (school_year)
);

alter table public.year_close_audit enable row level security;

grant select on public.year_close_audit to authenticated;
grant all on public.year_close_audit to service_role;

create policy "Admins view year close audit"
on public.year_close_audit
for select
to authenticated
using (public.get_my_role_level() >= 90 or public.is_site_admin());

-- ---------------------------------------------------------------------------
-- 5. role_history_audit (deletions)
-- ---------------------------------------------------------------------------

create table if not exists public.role_history_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id),
  cadet_id uuid not null references public.profiles (id),
  entry_index integer not null,
  removed_entry jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.role_history_audit enable row level security;

grant select on public.role_history_audit to authenticated;
grant insert on public.role_history_audit to authenticated;

-- ---------------------------------------------------------------------------
-- 6. append_cadet_role_history
-- ---------------------------------------------------------------------------

create or replace function public.append_cadet_role_history(
  p_profile_id uuid,
  p_role_id uuid,
  p_company_id uuid,
  p_reason text default 'role_change'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_name text;
  v_company_name text;
  v_school_year text;
  v_entry jsonb;
begin
  if p_role_id is null then
    return;
  end if;

  select r.role_name into v_role_name
  from public.roles r
  where r.id = p_role_id;

  select c.company_name into v_company_name
  from public.companies c
  where c.id = p_company_id;

  v_school_year := coalesce(public.get_active_school_year(), 'unknown');

  v_entry := jsonb_build_object(
    'role_id', p_role_id,
    'role_name', coalesce(v_role_name, 'Unknown'),
    'company_id', p_company_id,
    'company_name', coalesce(v_company_name, 'Unassigned'),
    'school_year', v_school_year,
    'ended_at', now(),
    'reason', p_reason
  );

  update public.cadet_profiles cp
  set
    role_history = coalesce(cp.role_history, '[]'::jsonb) || jsonb_build_array(v_entry),
    updated_at = now()
  where cp.profile_id = p_profile_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Trigger: role_id change only
-- ---------------------------------------------------------------------------

create or replace function public.trg_profiles_append_role_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.role_id is distinct from new.role_id then
    perform public.append_cadet_role_history(
      old.id,
      old.role_id,
      old.company_id,
      'role_change'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_append_role_history on public.profiles;

create trigger trg_profiles_append_role_history
before update of role_id on public.profiles
for each row
execute function public.trg_profiles_append_role_history();

-- ---------------------------------------------------------------------------
-- 8. delete_cadet_role_history_entry
-- ---------------------------------------------------------------------------

create or replace function public.delete_cadet_role_history_entry(
  p_cadet_id uuid,
  p_entry_index integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer_level int := public.get_my_role_level();
  v_viewer_company uuid;
  v_cadet_company uuid;
  v_history jsonb;
  v_removed jsonb;
  v_can boolean := false;
begin
  if v_viewer_level < 65 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  select company_id into v_viewer_company from public.profiles where id = auth.uid();

  select p.company_id, cp.role_history
  into v_cadet_company, v_history
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  where p.id = p_cadet_id;

  if v_viewer_level >= 90 or public.is_site_admin() then
    v_can := true;
  elsif v_viewer_level >= 65 and v_viewer_company is not null and v_viewer_company = v_cadet_company then
    v_can := true;
  end if;

  if not v_can then
    raise exception 'Permission denied';
  end if;

  if p_entry_index < 0 or p_entry_index >= jsonb_array_length(coalesce(v_history, '[]'::jsonb)) then
    raise exception 'Invalid entry index';
  end if;

  v_removed := v_history -> p_entry_index;

  update public.cadet_profiles cp
  set role_history = (
    select coalesce(jsonb_agg(elem order by ord), '[]'::jsonb)
    from jsonb_array_elements(v_history) with ordinality as t(elem, ord)
    where ord - 1 <> p_entry_index
  )
  where cp.profile_id = p_cadet_id;

  insert into public.role_history_audit (actor_id, cadet_id, entry_index, removed_entry)
  values (auth.uid(), p_cadet_id, p_entry_index, v_removed);
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. can_view_archived_cadet
-- ---------------------------------------------------------------------------

create or replace function public.can_view_archived_cadet(p_cadet_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_viewer_id uuid := auth.uid();
  v_level int;
  v_viewer_company uuid;
  v_cadet_company uuid;
  v_perms record;
begin
  if v_viewer_id is null then
    return false;
  end if;

  if public.is_site_admin() or public.get_my_role_level() >= 90 then
    return true;
  end if;

  select * into v_perms from public.get_my_roster_permissions();

  select p.company_id into v_cadet_company
  from public.profiles p
  where p.id = p_cadet_id;

  if v_cadet_company is null then
    select (elem ->> 'company_id')::uuid into v_cadet_company
    from public.cadet_profiles cp,
      jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) with ordinality as t(elem, ord)
    where cp.profile_id = p_cadet_id
    order by ord desc
    limit 1;
  end if;

  select company_id into v_viewer_company from public.profiles where id = v_viewer_id;
  v_level := v_perms.role_level;

  if v_level >= 50 and (v_perms.can_manage_all or v_perms.role_level >= 50) then
    if v_perms.can_manage_all then
      return true;
    end if;
    if v_perms.can_manage_own and v_viewer_company is not null and v_viewer_company = v_cadet_company then
      return true;
    end if;
    if v_level >= 50 and v_cadet_company is null then
      return true;
    end if;
  end if;

  if exists (
    select 1 from public.cadet_oversight_assignments coa
    where coa.cadet_id = p_cadet_id
      and coa.staff_id = v_viewer_id
  ) then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.append_cadet_role_history(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.delete_cadet_role_history_entry(uuid, integer) to authenticated;
grant execute on function public.can_view_archived_cadet(uuid) to authenticated;
