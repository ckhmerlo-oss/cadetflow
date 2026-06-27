-- Day 06: Year close job, preflight, reminders, roster, reactivation

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Internal: pull demerit for year close (no auth check)
-- ---------------------------------------------------------------------------

create or replace function public._year_close_pull_demerit(p_report_id uuid, p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.demerit_reports
  set status = 'pulled', demerits_effective = 0
  where id = p_report_id
    and status in ('pending_approval', 'needs_revision');

  update public.tour_ledger
  set amount = 0
  where report_id = p_report_id;

  insert into public.approval_log (report_id, actor_id, action, comment)
  select p_report_id, p_actor_id, 'Pulled by Year Close', 'school_year_closed'
  where exists (
    select 1 from public.demerit_reports dr
    where dr.id = p_report_id and dr.status = 'pulled'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Generate conduct snapshots for a school year
-- ---------------------------------------------------------------------------

create or replace function public.generate_year_conduct_snapshots(p_school_year text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cadet record;
  v_stats record;
  v_count integer := 0;
begin
  for v_cadet in
    select p.id as cadet_id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
  loop
    select * into v_stats
    from public.get_cadet_ledger_stats(v_cadet.cadet_id);

    insert into public.cadet_conduct_snapshots (cadet_id, school_year, term_number, stats)
    values (
      v_cadet.cadet_id,
      p_school_year,
      0,
      jsonb_build_object(
        'term_demerits', coalesce(v_stats.term_demerits, 0),
        'year_demerits', coalesce(v_stats.year_demerits, 0),
        'current_tour_balance', coalesce(v_stats.current_tour_balance, 0),
        'total_tours_marched', coalesce(v_stats.total_tours_marched, 0)
      )
    )
    on conflict (cadet_id, school_year, term_number) do update
    set stats = excluded.stats, created_at = now();

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. get_year_close_preflight
-- ---------------------------------------------------------------------------

create or replace function public.get_year_close_preflight(
  p_school_year text,
  p_next_school_year text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_next text := p_next_school_year;
  v_next_terms integer;
  v_open_events integer := 0;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if v_next is null then
    v_next := (
      select distinct t.school_year
      from public.academic_terms t
      where t.archived = false
        and t.school_year <> p_school_year
      order by t.school_year
      limit 1
    );
  end if;

  select count(*) into v_next_terms
  from public.academic_terms t
  where t.school_year = v_next and t.archived = false;

  return jsonb_build_object(
    'school_year', p_school_year,
    'next_school_year', v_next,
    'next_year_terms_configured', v_next_terms >= 5,
    'already_closed', exists (
      select 1 from public.year_close_audit y where y.school_year = p_school_year
    ),
    'auto_handled', jsonb_build_object(
      'open_demerit_reports', (
        select count(*) from public.demerit_reports dr
        where dr.status in ('pending_approval', 'needs_revision')
          and dr.date_of_offense >= (
            select min(start_date) from public.academic_terms where school_year = p_school_year
          )
          and dr.date_of_offense <= (
            select max(end_date) from public.academic_terms where school_year = p_school_year
          )
      ),
      'open_appeals', (
        select count(*) from public.appeals a
        where a.status not in ('approved', 'rejected_final')
      ),
      'pending_incidents', (
        select count(*) from public.incident_reports ir where ir.status = 'pending'
      )
    ),
    'manual', jsonb_build_object(
      'open_events', v_open_events,
      'open_special_reports', 0,
      'summary_drafts', 0,
      'uncleared_rooms', (
        select count(*) from public.cadet_profiles cp
        join public.profiles p on p.id = cp.profile_id
        join public.roles r on r.id = p.role_id
        where coalesce(r.default_role_level, 0) < 50
          and coalesce(p.archived, false) = false
          and nullif(btrim(cp.room_number), '') is not null
      ),
      'cadets_on_tour', (
        select count(*) from public.cadet_profiles cp
        join public.profiles p on p.id = cp.profile_id
        where coalesce(p.archived, false) = false and cp.cached_tour_balance > 0
      ),
      'cadets_on_probation', (
        select count(*) from public.cadet_profiles cp
        join public.profiles p on p.id = cp.profile_id
        where coalesce(p.archived, false) = false
          and cp.probation_status is not null
          and cp.probation_status <> 'None'
      )
    ),
    'informational', jsonb_build_object(
      'open_work_orders', 0
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. close_school_year (orchestrator)
-- ---------------------------------------------------------------------------

create or replace function public.close_school_year(
  p_school_year text,
  p_next_school_year text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_demerit record;
  v_appeal record;
  v_counts jsonb := '{}'::jsonb;
  v_pulled integer := 0;
  v_appeals_closed integer := 0;
  v_incidents_closed integer := 0;
  v_cadets_archived integer := 0;
  v_snapshots integer := 0;
  v_cadet record;
  v_preflight jsonb;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if exists (select 1 from public.year_close_audit where school_year = p_school_year) then
    raise exception 'School year % has already been closed', p_school_year;
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, p_next_school_year);

  if not (v_preflight ->> 'next_year_terms_configured')::boolean then
    raise exception 'Next school year % must have 5 active terms configured before close', p_next_school_year;
  end if;

  if coalesce((v_preflight -> 'manual' ->> 'open_events')::integer, 0) > 0 then
    raise exception 'Open events must be resolved or carried forward before year close (Day 10)';
  end if;

  -- 1. Snapshots
  v_snapshots := public.generate_year_conduct_snapshots(p_school_year);

  -- 2a. Pull open demerits in school year date range
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

  -- 2b. Reject open appeals
  update public.appeals a
  set
    status = 'rejected_final',
    final_comment = coalesce(a.final_comment, 'school_year_closed')
  where a.status not in ('approved', 'rejected_final');
  get diagnostics v_appeals_closed = row_count;

  -- 2c. Close pending incidents
  update public.incident_reports ir
  set
    status = 'closed',
    resolved_at = now(),
    resolved_by = v_actor,
    resolution_notes = coalesce(ir.resolution_notes, 'school_year_closed')
  where ir.status = 'pending';
  get diagnostics v_incidents_closed = row_count;

  -- 3. Academic archive (existing RPC)
  perform public.archive_school_year(p_school_year);

  -- 4. Deactivate active oversight for cadets being archived
  update public.cadet_oversight_assignments o
  set is_active = false, ended_at = now()
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.roles r on r.id = p.role_id
  where o.cadet_id = p.id
    and o.is_active = true
    and coalesce(p.archived, false) = false
    and (r.default_role_level is null or r.default_role_level < 50);

  -- 5. Archive all active cadets
  for v_cadet in
    select p.id, p.role_id, p.company_id
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
    'snapshots', v_snapshots,
    'demerits_pulled', v_pulled,
    'appeals_closed', v_appeals_closed,
    'incidents_closed', v_incidents_closed,
    'cadets_archived', v_cadets_archived
  );

  insert into public.year_close_audit (actor_id, school_year, next_school_year, counts)
  values (v_actor, p_school_year, p_next_school_year, v_counts);

  return v_counts;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Notification event + send_year_close_reminders
-- ---------------------------------------------------------------------------

insert into public.notification_event_types (code, category, title_template, description)
values (
  'archive.pre_close_summary',
  'team_alert',
  'School year closeout reminder',
  'Outstanding work summary before school year close.'
)
on conflict (code) do nothing;

create or replace function public.send_year_close_reminders(p_school_year text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_preflight jsonb;
  v_recipient record;
  v_body text;
  v_title text := 'School year closeout reminder: ' || p_school_year;
  v_sent integer := 0;
  v_auto jsonb;
  v_manual jsonb;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, null);
  v_auto := v_preflight -> 'auto_handled';
  v_manual := v_preflight -> 'manual';

  v_body :=
    'Auto-handled at close: '
    || coalesce(v_auto ->> 'open_demerit_reports', '0') || ' demerit reports will be pulled; '
    || coalesce(v_auto ->> 'open_appeals', '0') || ' appeals will be rejected; '
    || coalesce(v_auto ->> 'pending_incidents', '0') || ' pending incidents will be closed. '
    || 'Manual attention: '
    || coalesce(v_manual ->> 'open_events', '0') || ' open events; '
    || coalesce(v_manual ->> 'uncleared_rooms', '0') || ' uncleared room assignments; '
    || coalesce(v_manual ->> 'cadets_on_tour', '0') || ' cadets on tour sheet; '
    || coalesce(v_manual ->> 'cadets_on_probation', '0') || ' cadets on probation. '
    || 'Open work orders are not year-scoped and remain active.';

  for v_recipient in
    select distinct p.id as user_id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where coalesce(p.archived, false) = false
      and (
        r.role_name in ('Commandant', 'Deputy Commandant', 'Admin')
        or r.default_role_level >= 90
        or (r.default_role_level >= 65 and r.role_name ilike '%TAC%')
      )
  loop
    perform public.enqueue_in_app_notification(
      v_recipient.user_id,
      'archive.pre_close_summary',
      v_title,
      v_body,
      '/admin/year-close',
      'archive.pre_close:' || p_school_year || ':' || v_recipient.user_id::text,
      v_preflight
    );

    perform public.enqueue_email_notification(
      v_recipient.user_id,
      'archive.pre_close_summary',
      v_title,
      v_body,
      '/admin/year-close',
      'email.archive.pre_close:' || p_school_year || ':' || v_recipient.user_id::text
    );

    v_sent := v_sent + 1;
  end loop;

  return v_sent;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. get_full_roster with include_archived
-- ---------------------------------------------------------------------------

drop function if exists public.get_full_roster();

create or replace function public.get_full_roster(p_include_archived boolean default false)
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
  archived boolean
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_perms record;
  v_current_term record;
begin
  select * into v_perms from public.get_my_roster_permissions();

  if (v_perms.role_level < 50 and v_perms.can_manage_all = false and v_perms.can_manage_own = false) then
    raise exception 'Permission Denied: You are not authorized to view the roster.';
  end if;

  select * into v_current_term
  from public.academic_terms t
  where now() between t.start_date and (t.end_date + interval '1 day')
    and t.archived = false
  limit 1;

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
    coalesce(stats.term_demerits, 0) as term_demerits,
    coalesce(stats.year_demerits, 0) as year_demerits,
    coalesce(cp.cached_tour_balance, 0) as current_tour_balance,
    cp.has_star_tours,
    public.calculate_conduct_status(coalesce(stats.term_demerits, 0), coalesce(stats.year_demerits, 0)) as conduct_status,
    rr.recent_reports,
    coalesce(p.archived, false) as archived
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.companies c on p.company_id = c.id
  left join public.roles r on p.role_id = r.id
  left join lateral (
    select
      sum(case
        when v_current_term.start_date is not null
          and dr.date_of_offense between v_current_term.start_date and (v_current_term.end_date + interval '1 day')
        then dr.demerits_effective else 0
      end) as term_demerits,
      sum(dr.demerits_effective) as year_demerits
    from public.demerit_reports dr
    where dr.subject_cadet_id = p.id and dr.status = 'completed'
  ) stats on true
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
      or (v_perms.can_manage_own = true and p.company_id = v_perms.company_id and coalesce(p.archived, false) = false)
      or (p_include_archived and coalesce(p.archived, false) = true and (v_perms.role_level >= 65 or v_perms.can_manage_all))
    )
  order by p.last_name, p.first_name;
end;
$function$;

-- ---------------------------------------------------------------------------
-- 7. reactivate_cadets
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
        updated_at = now()
      where cp.profile_id = v_cadet_id;

      perform public.sync_cadet_oversight(v_cadet_id, auth.uid());
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. archive_cadet_profile (TAC-scoped mid-year archive)
-- ---------------------------------------------------------------------------

create or replace function public.archive_cadet_profile(p_cadet_id uuid, p_reason text default 'archived')
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

  update public.cadet_profiles cp
  set
    room_number = null,
    cached_tour_balance = 0,
    probation_status = 'None',
    updated_at = now()
  where cp.profile_id = p_cadet_id;

  update public.profiles p
  set archived = true, company_id = null, role_id = null
  where p.id = p_cadet_id;
end;
$$;

grant execute on function public.get_year_close_preflight(text, text) to authenticated;
grant execute on function public.close_school_year(text, text) to authenticated;
grant execute on function public.send_year_close_reminders(text) to authenticated;
grant execute on function public.get_full_roster(boolean) to authenticated;
grant execute on function public.reactivate_cadets(uuid[], uuid, uuid) to authenticated;
grant execute on function public.archive_cadet_profile(uuid, text) to authenticated;
