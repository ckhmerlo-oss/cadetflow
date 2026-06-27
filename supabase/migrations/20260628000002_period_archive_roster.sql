-- Period presence, historical roster archive visibility, close_school_year interval writes

-- ---------------------------------------------------------------------------
-- cadet_present_in_period — exclude archived-at-start; historical uses intervals
-- ---------------------------------------------------------------------------

create or replace function public.cadet_present_in_period(
  p_cadet_id uuid,
  p_school_year text,
  p_term_number smallint default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_bounds record;
  v_created timestamptz;
  v_is_current boolean;
begin
  if p_term_number is not null then
    if not exists (
      select 1 from public.academic_terms t
      where t.school_year = p_school_year
        and t.term_number = p_term_number
        and t.start_date <= current_date
    ) then
      return false;
    end if;
  elsif not exists (
    select 1 from public.academic_terms t
    where t.school_year = p_school_year
      and t.start_date <= current_date
  ) then
    return false;
  end if;

  select * into v_bounds
  from public.resolve_period_bounds(p_school_year, p_term_number)
  limit 1;

  select u.created_at into v_created
  from auth.users u
  where u.id = p_cadet_id;

  if v_created is null then
    return false;
  end if;

  if v_created::date > v_bounds.term_end then
    return false;
  end if;

  if public.cadet_was_archived_at(p_cadet_id, v_bounds.term_start::timestamptz) then
    return false;
  end if;

  select exists (
    select 1
    from public.academic_terms t
    where t.school_year = v_bounds.school_year
      and t.term_number is not distinct from v_bounds.term_number
      and now() between t.start_date and (t.end_date + interval '1 day')
      and t.archived = false
  ) into v_is_current;

  if v_is_current then
    return coalesce((
      select not p.archived
      from public.profiles p
      where p.id = p_cadet_id
    ), false);
  end if;

  if exists (
    select 1 from public.cadet_class_enrollments ce
    where ce.cadet_id = p_cadet_id and ce.school_year = v_bounds.school_year
  ) then
    return true;
  end if;

  if exists (
    select 1 from public.demerit_reports dr
    where dr.subject_cadet_id = p_cadet_id
      and dr.status = 'completed'
      and dr.date_of_offense::date between v_bounds.year_start and v_bounds.term_end
  ) then
    return true;
  end if;

  if exists (
    select 1 from public.tour_ledger tl
    where tl.cadet_id = p_cadet_id
      and tl.created_at::date between v_bounds.term_start and v_bounds.term_end
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- list_cadet_historical_years — started years only
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
      and t.start_date <= current_date
  ) y
  where y.school_year is not null
    and exists (
      select 1 from public.academic_terms at
      where at.school_year = y.school_year
        and at.start_date <= current_date
    )
    and public.cadet_present_in_period(p_cadet_id, y.school_year, null)
  order by y.school_year desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_roster_for_period — historical auto-includes archived; period-as-of fields
-- ---------------------------------------------------------------------------

drop function if exists public.get_roster_for_period(text, smallint, boolean);

create or replace function public.get_roster_for_period(
  p_school_year text default null,
  p_term_number smallint default null,
  p_include_archived boolean default false
)
returns table(
  id uuid,
  first_name text,
  last_name text,
  cadet_rank text,
  company_name text,
  role_name text,
  grade_level text,
  room_number text,
  term_demerits bigint,
  year_demerits bigint,
  current_tour_balance integer,
  has_star_tours boolean,
  conduct_status text,
  recent_reports json,
  archived boolean,
  graduated_at timestamptz,
  departure_classification text,
  archived_as_of_period boolean
)
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  v_perms record;
  v_bounds record;
  v_year_archived boolean;
  v_is_current boolean;
  v_period_end timestamptz;
begin
  select * into v_perms from public.get_my_roster_permissions();

  if v_perms.role_level < 50
     and v_perms.can_manage_all = false
     and v_perms.can_manage_own = false then
    raise exception 'Permission Denied: You are not authorized to view the roster.';
  end if;

  select * into v_bounds
  from public.resolve_period_bounds(p_school_year, p_term_number)
  limit 1;

  v_period_end := (v_bounds.term_end + interval '1 day')::timestamptz;

  select not exists (
    select 1 from public.academic_terms t
    where t.school_year = v_bounds.school_year and t.archived = false
  ) into v_year_archived;

  select exists (
    select 1
    from public.academic_terms t
    where t.school_year = v_bounds.school_year
      and t.term_number is not distinct from v_bounds.term_number
      and now() between t.start_date and (t.end_date + interval '1 day')
      and t.archived = false
  ) into v_is_current;

  return query
  select
    p.id,
    p.first_name,
    p.last_name,
    cp.cadet_rank,
    public.cadet_company_name_as_of(p.id, v_bounds.term_end) as company_name,
    r.role_name,
    cp.grade_level,
    cp.room_number,
    coalesce(ps.term_demerits, 0) as term_demerits,
    coalesce(ps.year_demerits, 0) as year_demerits,
    coalesce(ps.current_tour_balance, cp.cached_tour_balance, 0)::integer as current_tour_balance,
    cp.has_star_tours,
    coalesce(ps.conduct_status, 'Exemplary') as conduct_status,
    rr.recent_reports,
    coalesce(p.archived, false) as archived,
    cp.graduated_at,
    arc.departure_classification,
    public.cadet_was_archived_at(p.id, v_period_end) as archived_as_of_period
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.companies c on p.company_id = c.id
  left join public.roles r on p.role_id = r.id
  cross join lateral public._get_cadet_period_stats_core(p.id, p_school_year, p_term_number) ps
  left join lateral public.cadet_archive_as_of(p.id, v_period_end) arc on true
  left join lateral (
    select json_agg(json_build_object(
      'id', rpt.id,
      'offense_name', ot.offense_name,
      'status', rpt.status,
      'created_at', rpt.created_at,
      'appeal_status', a.status
    )) as recent_reports
    from (
      select * from public.demerit_reports
      where subject_cadet_id = p.id
        and coalesce(date_of_offense, created_at::date) >= v_bounds.term_start::date
        and coalesce(date_of_offense, created_at::date) <= v_bounds.term_end::date
      order by created_at desc
      limit 3
    ) rpt
    left join public.offense_types ot on rpt.offense_type_id = ot.id
    left join public.appeals a on rpt.id = a.report_id
  ) rr on true
  where
    (
      coalesce(p.archived, false) = true
      or r.default_role_level < 50
      or r.default_role_level is null
    )
    and (
      v_perms.can_manage_all = true
      or v_perms.role_level >= 90
      or public.is_site_admin()
      or (
        v_perms.can_manage_own = true
        and (
          v_year_archived
          or p.company_id = v_perms.company_id
          or public.cadet_company_name_as_of(p.id, v_bounds.term_end) = (
            select c2.company_name
            from public.companies c2
            where c2.id = v_perms.company_id
          )
        )
      )
      or (p_include_archived and coalesce(p.archived, false) = true and (v_perms.role_level >= 65 or v_perms.can_manage_all))
    )
    and (
      (
        v_is_current
        and (p_include_archived or coalesce(p.archived, false) = false)
      )
      or (
        not v_is_current
        and public.cadet_present_in_period(p.id, p_school_year, p_term_number)
      )
    )
  order by p.last_name, p.first_name;
end;
$function$;

-- ---------------------------------------------------------------------------
-- list_cadets_by_conduct — archive-at-start exclusion + started periods
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
  v_is_current boolean;
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

  select exists (
    select 1
    from public.academic_terms t
    where t.school_year = p_school_year
      and t.term_number is not distinct from p_term_number
      and now() between t.start_date and (t.end_date + interval '1 day')
      and t.archived = false
  ) into v_is_current;

  return query
  with eligible_cadets as (
    select distinct p.id as cadet_id
    from public.profiles p
    join public.cadet_profiles cp on cp.profile_id = p.id
    left join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and not public.cadet_was_archived_at(p.id, v_bounds.term_start::timestamptz)
      and (
        (
          v_is_current
          and (p_include_archived or coalesce(p.archived, false) = false)
        )
        or (
          not v_is_current
          and public.cadet_present_in_period(p.id, p_school_year, p_term_number)
        )
      )
  )
  select
    p.id,
    p.first_name,
    p.last_name,
    public.cadet_company_name_as_of(p.id, v_bounds.term_end) as company_name,
    ps.term_demerits,
    ps.year_demerits,
    ps.conduct_status,
    coalesce(p.archived, false)
  from eligible_cadets ec
  join public.profiles p on p.id = ec.cadet_id
  join public.cadet_profiles cp on cp.profile_id = p.id
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
          or p_company_id is null and (
            p.company_id = v_perms.company_id
            or public.cadet_company_name_as_of(p.id, v_bounds.term_end) = (
              select c2.company_name from public.companies c2 where c2.id = v_perms.company_id
            )
          )
          or p_company_id is not null and p.company_id = p_company_id
        )
      )
    )
  order by p.last_name, p.first_name;
end;
$$;

-- ---------------------------------------------------------------------------
-- close_school_year — record archive intervals (preserve full pre-flight logic)
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
  v_classification text;
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

    v_classification := case
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
