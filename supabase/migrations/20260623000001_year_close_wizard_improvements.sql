-- Day 06: Year close wizard improvements — preflight items, reminder preview, graduated tagging

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. graduated_at on cadet_profiles
-- ---------------------------------------------------------------------------

alter table public.cadet_profiles
  add column if not exists graduated_at timestamptz;

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
  cp.role_history,
  cp.graduated_at
from public.profiles p
join public.cadet_profiles cp on cp.profile_id = p.id;

-- ---------------------------------------------------------------------------
-- 2. mark / unmark graduated
-- ---------------------------------------------------------------------------

create or replace function public.mark_cadets_graduated(p_cadet_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  update public.cadet_profiles cp
  set graduated_at = now(), updated_at = now()
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where cp.profile_id = p.id
    and p.id = any(p_cadet_ids)
    and coalesce(p.archived, false) = false
    and (r.default_role_level is null or r.default_role_level < 50)
    and cp.graduated_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.unmark_cadets_graduated(p_cadet_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  update public.cadet_profiles cp
  set graduated_at = null, updated_at = now()
  where cp.profile_id = any(p_cadet_ids)
    and cp.graduated_at is not null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Active cadet helper predicate (inline in functions)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 4. get_year_close_preflight with item arrays
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
  v_uncleared_rooms integer;
  v_tour_sheet integer;
  v_probation integer;
  v_items_uncleared jsonb;
  v_items_tour jsonb;
  v_items_probation jsonb;
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

  select count(*) into v_uncleared_rooms
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  join public.roles r on r.id = p.role_id
  where coalesce(r.default_role_level, 0) < 50
    and coalesce(p.archived, false) = false
    and nullif(btrim(cp.room_number), '') is not null;

  select count(*) into v_tour_sheet
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  join public.roles r on r.id = p.role_id
  where coalesce(r.default_role_level, 0) < 50
    and coalesce(p.archived, false) = false
    and (coalesce(cp.cached_tour_balance, 0) > 0 or cp.has_star_tours = true);

  select count(*) into v_probation
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  join public.roles r on r.id = p.role_id
  where coalesce(r.default_role_level, 0) < 50
    and coalesce(p.archived, false) = false
    and cp.probation_status is not null
    and cp.probation_status <> 'None';

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_uncleared
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — Room ' || btrim(cp.room_number) as label,
      '/profile/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and nullif(btrim(cp.room_number), '') is not null
    order by p.last_name, p.first_name
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_tour
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — '
        || case
          when coalesce(cp.cached_tour_balance, 0) > 0 then cp.cached_tour_balance::text || ' tour(s)'
          else 'star tours'
        end as label,
      '/ledger/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and (coalesce(cp.cached_tour_balance, 0) > 0 or cp.has_star_tours = true)
    order by p.last_name, p.first_name
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_probation
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — ' || cp.probation_status as label,
      '/profile/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and cp.probation_status is not null
      and cp.probation_status <> 'None'
    order by p.last_name, p.first_name
  ) t;

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
      ),
      'tour_sheet_cleared', v_tour_sheet,
      'probation_reset', v_probation,
      'rooms_cleared_at_execute', v_uncleared_rooms
    ),
    'manual', jsonb_build_object(
      'open_events', v_open_events,
      'open_special_reports', 0,
      'uncleared_rooms', v_uncleared_rooms,
      'summary_drafts', 0
    ),
    'informational', jsonb_build_object(
      'open_work_orders', 0
    ),
    'items', jsonb_build_object(
      'uncleared_rooms', v_items_uncleared,
      'open_events', '[]'::jsonb,
      'open_special_reports', '[]'::jsonb,
      'summary_drafts', '[]'::jsonb,
      'tour_sheet_cleared', v_items_tour,
      'probation_reset', v_items_probation
    )
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Reminder scoping helpers
-- ---------------------------------------------------------------------------

create or replace function public._year_close_is_leadership_recipient(
  p_role_name text,
  p_role_level integer,
  p_is_site_admin boolean
)
returns boolean
language sql
immutable
as $$
  select coalesce(p_is_site_admin, false)
    or coalesce(p_role_level, 0) >= 90
    or p_role_name in ('Commandant', 'Deputy Commandant', 'Admin');
$$;

create or replace function public._year_close_build_recipient_manual_items(
  p_user_id uuid,
  p_preflight jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role_name text;
  v_role_level integer;
  v_is_admin boolean;
  v_company_id uuid;
  v_all_items jsonb;
  v_result jsonb := '[]'::jsonb;
  v_item jsonb;
  v_categories text[] := array['uncleared_rooms', 'open_events', 'open_special_reports', 'summary_drafts'];
  v_cat text;
begin
  select r.role_name, r.default_role_level, coalesce(p.is_site_admin, false), p.company_id
  into v_role_name, v_role_level, v_is_admin, v_company_id
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where p.id = p_user_id;

  if public._year_close_is_leadership_recipient(v_role_name, v_role_level, v_is_admin) then
    foreach v_cat in array v_categories loop
      v_all_items := coalesce(p_preflight -> 'items' -> v_cat, '[]'::jsonb);
      if jsonb_array_length(v_all_items) > 0 then
        v_result := v_result || (
          select coalesce(jsonb_agg(
            jsonb_build_object(
              'category', v_cat,
              'id', elem -> 'id',
              'label', elem -> 'label',
              'href', elem -> 'href',
              'company_id', elem -> 'company_id'
            )
          ), '[]'::jsonb)
          from jsonb_array_elements(v_all_items) elem
        );
      end if;
    end loop;
  elsif coalesce(v_role_level, 0) >= 65 and v_role_name ilike '%TAC%' then
    v_all_items := coalesce(p_preflight -> 'items' -> 'uncleared_rooms', '[]'::jsonb);
    for v_item in select * from jsonb_array_elements(v_all_items) loop
      if (v_item ->> 'company_id')::uuid is not distinct from v_company_id then
        v_result := v_result || jsonb_build_array(jsonb_build_object(
          'category', 'uncleared_rooms',
          'id', v_item -> 'id',
          'label', v_item -> 'label',
          'href', v_item -> 'href',
          'company_id', v_item -> 'company_id'
        ));
      end if;
    end loop;
  end if;

  return v_result;
end;
$$;

create or replace function public._year_close_build_reminder_body(
  p_preflight jsonb,
  p_manual_items jsonb,
  p_is_leadership boolean default false,
  p_include_informational boolean default false
)
returns text
language plpgsql
immutable
as $$
declare
  v_auto jsonb := p_preflight -> 'auto_handled';
  v_manual jsonb := p_preflight -> 'manual';
  v_body text;
  v_item jsonb;
begin
  v_body :=
    'Auto-handled at close: '
    || coalesce(v_auto ->> 'open_demerit_reports', '0') || ' demerit reports will be pulled; '
    || coalesce(v_auto ->> 'open_appeals', '0') || ' appeals will be rejected; '
    || coalesce(v_auto ->> 'pending_incidents', '0') || ' pending incidents will be closed. '
    || 'Operational cleanup at close: '
    || coalesce(v_auto ->> 'tour_sheet_cleared', '0') || ' tour sheet entries cleared; '
    || coalesce(v_auto ->> 'probation_reset', '0') || ' probation statuses reset; '
    || coalesce(v_auto ->> 'rooms_cleared_at_execute', '0') || ' room assignments cleared.';

  if jsonb_array_length(p_manual_items) > 0 then
    v_body := v_body || ' Manual attention for you:';
    for v_item in select * from jsonb_array_elements(p_manual_items) loop
      v_body := v_body || ' ' || (v_item ->> 'label') || ' (' || (v_item ->> 'href') || ');';
    end loop;
  elsif p_is_leadership then
    v_body := v_body || ' Manual attention (all): '
      || coalesce(v_manual ->> 'open_events', '0') || ' open events; '
      || coalesce(v_manual ->> 'open_special_reports', '0') || ' open special reports; '
      || coalesce(v_manual ->> 'uncleared_rooms', '0') || ' uncleared room assignments; '
      || coalesce(v_manual ->> 'summary_drafts', '0') || ' summary drafts.';
  end if;

  if p_include_informational then
    v_body := v_body || ' Open work orders (informational): '
      || coalesce(p_preflight -> 'informational' ->> 'open_work_orders', '0') || '.';
  else
    v_body := v_body || ' Open work orders are not year-scoped and remain active.';
  end if;

  return v_body;
end;
$$;

create or replace function public.get_year_close_reminder_preview(p_school_year text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_preflight jsonb;
  v_recipients jsonb := '[]'::jsonb;
  v_rec record;
  v_manual_items jsonb;
  v_is_maintenance boolean;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, null);

  for v_rec in
    select distinct
      p.id as user_id,
      p.first_name,
      p.last_name,
      r.role_name,
      c.company_name,
      r.default_role_level,
      coalesce(p.is_site_admin, false) as is_site_admin
    from public.profiles p
    join public.roles r on r.id = p.role_id
    left join public.companies c on c.id = p.company_id
    where coalesce(p.archived, false) = false
      and (
        public._year_close_is_leadership_recipient(r.role_name, r.default_role_level, p.is_site_admin)
        or (r.default_role_level >= 65 and r.role_name ilike '%TAC%')
        or r.role_name ilike '%maintenance%'
      )
    order by p.last_name, p.first_name
  loop
    v_is_maintenance := v_rec.role_name ilike '%maintenance%';
    v_manual_items := case
      when v_is_maintenance then '[]'::jsonb
      else public._year_close_build_recipient_manual_items(v_rec.user_id, v_preflight)
    end;

    v_recipients := v_recipients || jsonb_build_array(jsonb_build_object(
      'user_id', v_rec.user_id,
      'name', v_rec.first_name || ' ' || v_rec.last_name,
      'role_name', v_rec.role_name,
      'company_name', v_rec.company_name,
      'auto_summary', v_preflight -> 'auto_handled',
      'manual_items', v_manual_items,
      'informational', case when v_is_maintenance then v_preflight -> 'informational' else '{}'::jsonb end,
      'body_preview', public._year_close_build_reminder_body(
        v_preflight,
        v_manual_items,
        public._year_close_is_leadership_recipient(v_rec.role_name, v_rec.default_role_level, v_rec.is_site_admin),
        v_is_maintenance
      )
    ));
  end loop;

  return jsonb_build_object(
    'school_year', p_school_year,
    'recipient_count', jsonb_array_length(v_recipients),
    'recipients', v_recipients
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. send_year_close_reminders (personalized)
-- ---------------------------------------------------------------------------

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
  v_manual_items jsonb;
  v_is_maintenance boolean;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  v_preflight := public.get_year_close_preflight(p_school_year, null);

  for v_recipient in
    select distinct
      p.id as user_id,
      r.role_name,
      r.default_role_level,
      coalesce(p.is_site_admin, false) as is_site_admin
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where coalesce(p.archived, false) = false
      and (
        public._year_close_is_leadership_recipient(r.role_name, r.default_role_level, p.is_site_admin)
        or (r.default_role_level >= 65 and r.role_name ilike '%TAC%')
        or r.role_name ilike '%maintenance%'
      )
  loop
    v_is_maintenance := v_recipient.role_name ilike '%maintenance%';
    v_manual_items := case
      when v_is_maintenance then '[]'::jsonb
      else public._year_close_build_recipient_manual_items(v_recipient.user_id, v_preflight)
    end;

    v_body := public._year_close_build_reminder_body(
      v_preflight,
      v_manual_items,
      public._year_close_is_leadership_recipient(
        v_recipient.role_name,
        v_recipient.default_role_level,
        v_recipient.is_site_admin
      ),
      v_is_maintenance
    );

    perform public.dispatch_notification(
      v_recipient.user_id,
      'archive.pre_close_summary',
      v_title,
      v_body,
      '/admin/year-close',
      'archive.pre_close:' || p_school_year || ':' || v_recipient.user_id::text,
      jsonb_build_object(
        'school_year', p_school_year,
        'manual_items', v_manual_items,
        'auto_summary', v_preflight -> 'auto_handled'
      )
    );

    perform public.enqueue_email_notification(
      v_recipient.user_id,
      'archive.pre_close_summary'::text,
      v_title::text,
      v_body::text,
      '/admin/year-close'::text,
      ('email.archive.pre_close:' || p_school_year || ':' || v_recipient.user_id::text)::text,
      null::uuid
    );

    v_sent := v_sent + 1;
  end loop;

  return v_sent;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. close_school_year — explicit operational cleanup batch
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

  v_snapshots := public.generate_year_conduct_snapshots(p_school_year);

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

  -- Operational cleanup batch (tours + probation) before archive
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
-- 8. get_full_roster + graduated_at; reactivate clears graduated_at
-- ---------------------------------------------------------------------------

drop function if exists public.get_full_roster(boolean);

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
  archived boolean,
  graduated_at timestamptz
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
    coalesce(p.archived, false) as archived,
    cp.graduated_at
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
        graduated_at = null,
        updated_at = now()
      where cp.profile_id = v_cadet_id;

      perform public.sync_cadet_oversight(v_cadet_id, auth.uid());
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.mark_cadets_graduated(uuid[]) to authenticated;
grant execute on function public.unmark_cadets_graduated(uuid[]) to authenticated;
grant execute on function public.get_year_close_reminder_preview(text) to authenticated;
grant execute on function public.get_year_close_preflight(text, text) to authenticated;
grant execute on function public.close_school_year(text, text) to authenticated;
grant execute on function public.send_year_close_reminders(text) to authenticated;
grant execute on function public.get_full_roster(boolean) to authenticated;
grant execute on function public.reactivate_cadets(uuid[], uuid, uuid) to authenticated;
