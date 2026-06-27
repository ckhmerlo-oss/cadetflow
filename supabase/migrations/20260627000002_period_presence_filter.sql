-- Cadet presence in a school period + filter historical roster/years to real configured years

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
  ) y
  where y.school_year is not null
    and exists (
      select 1 from public.academic_terms at
      where at.school_year = y.school_year
    )
    and public.cadet_present_in_period(p_cadet_id, y.school_year, null)
  order by y.school_year desc;
end;
$$;

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
  graduated_at timestamptz
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
    c.company_name,
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
    cp.graduated_at
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.companies c on p.company_id = c.id
  left join public.roles r on p.role_id = r.id
  cross join lateral public._get_cadet_period_stats_core(p.id, p_school_year, p_term_number) ps
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
    (p_include_archived or coalesce(p.archived, false) = false)
    and (
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
        )
      )
      or (p_include_archived and coalesce(p.archived, false) = true and (v_perms.role_level >= 65 or v_perms.can_manage_all))
    )
    and (
      v_is_current
      or public.cadet_present_in_period(p.id, p_school_year, p_term_number)
    )
  order by p.last_name, p.first_name;
end;
$function$;

grant execute on function public.cadet_present_in_period(uuid, text, smallint) to authenticated;
