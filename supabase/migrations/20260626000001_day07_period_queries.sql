-- Day 07: Period-query layer for multi-year history; remove conduct snapshot stub

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Performance index
-- ---------------------------------------------------------------------------

create index if not exists idx_demerit_reports_cadet_offense
  on public.demerit_reports (subject_cadet_id, date_of_offense)
  where status = 'completed';

-- ---------------------------------------------------------------------------
-- 2. can_view_cadet_history (Day 11 parent hook deferred)
-- ---------------------------------------------------------------------------

create or replace function public.can_view_cadet_history(p_cadet_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_viewer_id uuid := auth.uid();
  v_perms record;
  v_cadet_company uuid;
  v_archived boolean;
begin
  if v_viewer_id is null then
    return false;
  end if;

  if v_viewer_id = p_cadet_id then
    return true;
  end if;

  select coalesce(p.archived, false), p.company_id
  into v_archived, v_cadet_company
  from public.profiles p
  where p.id = p_cadet_id;

  if not found then
    return false;
  end if;

  if v_archived then
    return public.can_view_archived_cadet(p_cadet_id);
  end if;

  if public.is_site_admin() or public.get_my_role_level() >= 90 then
    return true;
  end if;

  select * into v_perms from public.get_my_roster_permissions();

  if v_perms.can_manage_all then
    return true;
  end if;

  if v_perms.can_manage_own and v_cadet_company is not null
     and v_cadet_company = v_perms.company_id then
    return true;
  end if;

  if v_perms.role_level >= 50 and v_cadet_company is null then
    return true;
  end if;

  if exists (
    select 1 from public.cadet_oversight_assignments coa
    where coa.cadet_id = p_cadet_id
      and coa.staff_id = v_viewer_id
      and coa.is_active = true
  ) then
    return true;
  end if;

  -- Day 11: parent linked-cadet scope

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. resolve_period_bounds
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
    return query
    select
      v_school_year,
      null::smallint,
      min(t.start_date),
      max(t.end_date),
      year_start
    from public.academic_terms t
    where t.school_year = v_school_year;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. _get_cadet_period_stats_core (no auth — used by ledger wrapper + conduct list)
-- ---------------------------------------------------------------------------

create or replace function public._get_cadet_period_stats_core(
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
declare
  v_bounds record;
  v_current record;
  v_is_current boolean := false;
  v_term_end_ts timestamptz;
begin
  select * into v_bounds
  from public.resolve_period_bounds(p_school_year, p_term_number)
  limit 1;

  v_term_end_ts := v_bounds.term_end + interval '1 day' - interval '1 microsecond';

  select t.school_year, t.term_number, t.start_date, t.end_date
  into v_current
  from public.academic_terms t
  where now() between t.start_date and (t.end_date + interval '1 day')
    and t.archived = false
  order by t.start_date desc
  limit 1;

  v_is_current := v_current.school_year is not null
    and v_bounds.school_year = v_current.school_year
    and v_bounds.term_number is not null
    and v_bounds.term_number = v_current.term_number;

  return query
  select
    v_bounds.school_year,
    v_bounds.term_number,
    coalesce((
      select sum(dr.demerits_effective)
      from public.demerit_reports dr
      where dr.subject_cadet_id = p_cadet_id
        and dr.status = 'completed'
        and dr.date_of_offense::date >= v_bounds.term_start
        and dr.date_of_offense::date <= v_bounds.term_end
    ), 0)::bigint,
    coalesce((
      select sum(dr.demerits_effective)
      from public.demerit_reports dr
      where dr.subject_cadet_id = p_cadet_id
        and dr.status = 'completed'
        and dr.date_of_offense::date >= v_bounds.year_start
        and dr.date_of_offense::date <= v_bounds.term_end
    ), 0)::bigint,
    public.calculate_conduct_status(
      coalesce((
        select sum(dr.demerits_effective)::integer
        from public.demerit_reports dr
        where dr.subject_cadet_id = p_cadet_id
          and dr.status = 'completed'
          and dr.date_of_offense::date >= v_bounds.term_start
          and dr.date_of_offense::date <= v_bounds.term_end
      ), 0),
      coalesce((
        select sum(dr.demerits_effective)::integer
        from public.demerit_reports dr
        where dr.subject_cadet_id = p_cadet_id
          and dr.status = 'completed'
          and dr.date_of_offense::date >= v_bounds.year_start
          and dr.date_of_offense::date <= v_bounds.term_end
      ), 0)
    ),
    coalesce((
      select abs(sum(tl.amount))
      from public.tour_ledger tl
      where tl.cadet_id = p_cadet_id
        and tl.action = 'served'
        and tl.created_at <= v_term_end_ts
    ), 0)::bigint,
    case
      when v_is_current then (
        select coalesce(cp.cached_tour_balance, 0)
        from public.cadet_profiles cp
        where cp.profile_id = p_cadet_id
      )
      else null
    end::integer,
    v_is_current;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. get_cadet_period_stats (authorized)
-- ---------------------------------------------------------------------------

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
    raise exception 'Permission denied';
  end if;

  return query
  select * from public._get_cadet_period_stats_core(p_cadet_id, p_school_year, p_term_number);
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. get_cadet_ledger_stats (wrapper — backward compatible, no auth gate)
-- ---------------------------------------------------------------------------

create or replace function public.get_cadet_ledger_stats(p_cadet_id uuid)
returns table(term_demerits bigint, year_demerits bigint, total_tours_marched bigint, current_tour_balance integer)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  select
    ps.term_demerits,
    ps.year_demerits,
    ps.total_tours_marched,
    coalesce(ps.current_tour_balance, 0)::integer
  from public._get_cadet_period_stats_core(p_cadet_id, null, null) ps;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. get_cadet_ledger_for_period + get_cadet_audit_log
-- ---------------------------------------------------------------------------

create or replace function public.get_cadet_ledger_for_period(
  p_cadet_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table(
  event_date timestamptz,
  event_type text,
  title text,
  details text,
  demerits_issued integer,
  tour_change integer,
  actor_name text,
  status text,
  report_id uuid,
  appeal_status text,
  appeal_note text,
  date_of_offense timestamptz,
  policy_category integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_cadet_history(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return query
  select
    dr.created_at as event_date,
    'demerit'::text as event_type,
    ot.offense_name as title,
    dr.notes as details,
    dr.demerits_effective as demerits_issued,
    tl.amount as tour_change,
    (submitter.last_name || ', ' || submitter.first_name) as actor_name,
    dr.status,
    dr.id as report_id,
    a.status as appeal_status,
    a.final_comment as appeal_note,
    dr.date_of_offense,
    coalesce(ot.policy_category, 0) as policy_category
  from public.demerit_reports dr
  left join public.offense_types ot on dr.offense_type_id = ot.id
  left join public.profiles submitter on dr.submitted_by = submitter.id
  left join public.tour_ledger tl on dr.id = tl.report_id
  left join public.appeals a on dr.id = a.report_id
  where dr.subject_cadet_id = p_cadet_id
    and coalesce(dr.date_of_offense, dr.created_at) >= p_start
    and coalesce(dr.date_of_offense, dr.created_at) <= p_end

  union all

  select
    tl.created_at as event_date,
    case when tl.amount > 0 then 'adjustment' else 'served' end as event_type,
    case when tl.amount > 0 then 'Tour Adjustment' else 'Tours Served' end as title,
    tl.comment as details,
    0 as demerits_issued,
    tl.amount as tour_change,
    (staff.last_name || ', ' || staff.first_name) as actor_name,
    'completed'::text as status,
    null::uuid as report_id,
    null::text as appeal_status,
    null::text as appeal_note,
    null::timestamptz as date_of_offense,
    null::integer as policy_category
  from public.tour_ledger tl
  left join public.profiles staff on tl.staff_id = staff.id
  where tl.cadet_id = p_cadet_id
    and (tl.action = 'served' or tl.action = 'adjustment')
    and tl.created_at >= p_start
    and tl.created_at <= p_end

  order by event_date desc;
end;
$$;

drop function if exists public.get_cadet_audit_log(uuid);

create or replace function public.get_cadet_audit_log(p_cadet_id uuid)
returns table(
  event_date timestamptz,
  event_type text,
  title text,
  details text,
  demerits_issued integer,
  tour_change integer,
  actor_name text,
  status text,
  report_id uuid,
  appeal_status text,
  appeal_note text,
  date_of_offense timestamptz,
  policy_category integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_view_cadet_history(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return query
  select * from public.get_cadet_ledger_for_period(
    p_cadet_id,
    '-infinity'::timestamptz,
    'infinity'::timestamptz
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. get_cadet_academic_history
-- ---------------------------------------------------------------------------

create or replace function public.get_cadet_academic_history(
  p_cadet_id uuid,
  p_school_year text default null,
  p_term_number smallint default null
)
returns table(
  school_year text,
  term_number smallint,
  seminar_period text,
  course_name text,
  slot_type text,
  teacher_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_cadet_history(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return query
  select
    ce.school_year,
    cs.term_number,
    cs.seminar_period,
    cs.course_name,
    ce.slot_type,
    (t.last_name || ', ' || t.first_name) as teacher_name
  from public.cadet_class_enrollments ce
  join public.class_sections cs on cs.id = ce.class_section_id
  left join public.profiles t on t.id = cs.teacher_id
  where ce.cadet_id = p_cadet_id
    and (p_school_year is null or ce.school_year = p_school_year)
    and (p_term_number is null or cs.term_number = p_term_number)
  order by ce.school_year desc, cs.term_number nulls last, cs.seminar_period nulls last;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. list_cadet_historical_years
-- ---------------------------------------------------------------------------

create or replace function public.list_cadet_historical_years(p_cadet_id uuid)
returns table(school_year text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_cadet_history(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return query
  select distinct y.school_year
  from (
    select ce.school_year from public.cadet_class_enrollments ce where ce.cadet_id = p_cadet_id
    union
    select t.school_year
    from public.demerit_reports dr
    join public.academic_terms t
      on dr.date_of_offense::date between t.start_date and t.end_date
    where dr.subject_cadet_id = p_cadet_id
      and dr.status = 'completed'
    union
    select t.school_year
    from public.academic_terms t
    where exists (
      select 1 from public.demerit_reports dr
      where dr.subject_cadet_id = p_cadet_id
        and dr.status = 'completed'
        and dr.date_of_offense::date >= t.start_date
        and dr.date_of_offense::date <= t.end_date
    )
  ) y
  where y.school_year is not null
  order by y.school_year desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. list_cadets_by_conduct
-- ---------------------------------------------------------------------------

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
    raise exception 'Permission denied';
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

-- ---------------------------------------------------------------------------
-- 10. Remove snapshot stub from close_school_year
-- ---------------------------------------------------------------------------

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
  v_cadet record;
  v_preflight jsonb;
  v_force_bypassed jsonb;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if p_force and not public.can_force_close_school_year() then
    raise exception 'Force archive requires admin role level above 100';
  end if;

  if exists (select 1 from public.year_close_audit where school_year = p_school_year) then
    raise exception 'School year % has already been closed', p_school_year;
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, p_next_school_year);

  if not (v_preflight ->> 'next_year_terms_configured')::boolean then
    raise exception 'Next school year % must have 5 active terms configured before close', p_next_school_year;
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'open_events')::integer, 0) > 0 then
    raise exception 'Open events must be resolved or carried forward before year close (Day 10)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'open_special_reports')::integer, 0) > 0 then
    raise exception 'Open special reports must be resolved before year close (Day 10)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'summary_drafts')::integer, 0) > 0 then
    raise exception 'Summary drafts must be finalized before year close (Day 12)';
  end if;

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'suspended_cadets')::integer, 0) > 0 then
    raise exception 'Archived cadets marked suspended must be resolved to non_return or dismissal before year close';
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
    select p.id, p.role_id, p.company_id, cp.departure_classification
    from public.profiles p
    join public.cadet_profiles cp on cp.profile_id = p.id
    left join public.roles r on r.id = p.role_id
    where coalesce(p.archived, false) = false
      and (r.default_role_level is null or r.default_role_level < 50)
  loop
    if v_cadet.role_id is not null then
      perform public.append_cadet_role_history(v_cadet.id, v_cadet.role_id, v_cadet.company_id, 'archived');
    end if;

    update public.cadet_profiles cp
    set
      room_number = null,
      cached_tour_balance = 0,
      has_star_tours = false,
      probation_status = 'None',
      probation_notes = null,
      departure_classification = case
        when cp.departure_classification in ('withdrawn', 'dismissal') then cp.departure_classification
        else 'non_return'
      end,
      updated_at = now()
    where cp.profile_id = v_cadet.id;

    update public.profiles p
    set
      archived = true,
      company_id = null,
      role_id = null
    where p.id = v_cadet.id;

    v_cadets_archived := v_cadets_archived + 1;
  end loop;

  v_counts := jsonb_build_object(
    'demerits_pulled', v_pulled,
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

drop function if exists public.generate_year_conduct_snapshots(text);

drop policy if exists "Staff view conduct snapshots" on public.cadet_conduct_snapshots;
drop table if exists public.cadet_conduct_snapshots;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant execute on function public.can_view_cadet_history(uuid) to authenticated;
grant execute on function public.resolve_period_bounds(text, smallint) to authenticated;
grant execute on function public.get_cadet_period_stats(uuid, text, smallint) to authenticated;
grant execute on function public.get_cadet_ledger_for_period(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.get_cadet_academic_history(uuid, text, smallint) to authenticated;
grant execute on function public.list_cadet_historical_years(uuid) to authenticated;
grant execute on function public.list_cadets_by_conduct(text, smallint, text, uuid, boolean) to authenticated;
