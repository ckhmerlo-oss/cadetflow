-- Fix batch: year-close greensheets, graduated classification, reactivate, active year fallback

-- ---------------------------------------------------------------------------
-- get_active_school_year — fallback to earliest non-archived year post-close
-- ---------------------------------------------------------------------------

create or replace function public.get_active_school_year()
returns text
language sql
stable
security definer
set search_path = public
as $$
  (
    select t.school_year
    from public.academic_terms t
    where t.archived = false
    group by t.school_year
    having current_date between min(t.start_date) and max(t.end_date)
    order by min(t.start_date) desc
    limit 1
  )
  union all
  (
    select t.school_year
    from public.academic_terms t
    where t.archived = false
    group by t.school_year
    order by min(t.start_date)
    limit 1
  )
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Green sheet posting — use posted_at as source of truth
-- ---------------------------------------------------------------------------

drop function if exists public.get_unposted_green_sheet();

create or replace function public.get_unposted_green_sheet()
returns table(
  report_id uuid,
  subject_name text,
  company_name text,
  offense_name text,
  policy_category integer,
  demerits integer,
  submitter_name text,
  date_of_offense date,
  notes text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.get_my_role_level() >= 50) then
    raise exception 'You do not have permission to view this report.';
  end if;

  return query
  select
    r.id as report_id,
    p_subject.last_name || ', ' || p_subject.first_name as subject_name,
    c.company_name,
    ot.offense_name,
    ot.policy_category,
    ot.demerits,
    p_submitter.last_name || ', ' || p_submitter.first_name as submitter_name,
    r.date_of_offense::date,
    r.notes
  from public.demerit_reports r
  join public.profiles p_subject on r.subject_cadet_id = p_subject.id
  left join public.companies c on p_subject.company_id = c.id
  join public.profiles p_submitter on r.submitted_by = p_submitter.id
  join public.offense_types ot on r.offense_type_id = ot.id
  where r.status = 'completed'
    and r.posted_at is null
  order by subject_name, r.date_of_offense;
end;
$$;

create or replace function public.mark_green_sheet_as_posted(p_report_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    join public.roles r on p.role_id = r.id
    where p.id = auth.uid()
      and r.role_name in ('Commandant', 'Deputy Commandant', 'Admin')
  ) then
    raise exception 'You do not have permission to perform this action.';
  end if;

  update public.demerit_reports
  set posted_at = now()
  where id = any(p_report_ids);
end;
$$;

-- ---------------------------------------------------------------------------
-- reactivate_cadets — record role history; fail when no cadets reactivated
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

  if p_cadet_ids is null or array_length(p_cadet_ids, 1) is null then
    raise exception 'No cadets specified for reactivation';
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

      perform public.append_cadet_role_history(v_cadet_id, p_role_id, p_company_id, 'reactivated');
      perform public.sync_cadet_oversight(v_cadet_id, auth.uid());
      v_count := v_count + 1;
    end if;
  end loop;

  if v_count = 0 then
    raise exception 'No archived cadets were reactivated (check permissions and cadet status)';
  end if;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- close_school_year — post pending greensheets; graduated cadets skip non_return
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
  v_greensheets_posted integer := 0;
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
