-- Day 06 follow-up: TAC-only room closeout items, force-archive (role > 100), move-out semantics

-- ---------------------------------------------------------------------------
-- 1. Helpers: company TAC, move-out pending, force-close permission
-- ---------------------------------------------------------------------------

create or replace function public._year_close_is_company_tac(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = p_user_id
      and coalesce(p.archived, false) = false
      and coalesce(r.can_manage_own_company_roster, false) = true
      and coalesce(r.default_role_level, 0) >= 65
      and r.role_name ilike '%TAC%'
      and p.company_id is not null
      and r.company_id is not distinct from p.company_id
  );
$$;

create or replace function public.can_force_close_school_year()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role_level() > 100;
$$;

-- Cadets with active room occupancy lacking a completed move-out form (Day 09).
-- Until move-out forms exist, room_number on an active cadet implies move-out pending.
create or replace function public._year_close_cadet_needs_move_out(p_profile_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_room text;
begin
  select nullif(btrim(cp.room_number), '')
  into v_room
  from public.cadet_profiles cp
  where cp.profile_id = p_profile_id;

  if v_room is null then
    return false;
  end if;

  if to_regclass('public.room_move_out_forms') is not null then
    return not exists (
      select 1
      from public.room_move_out_forms rm
      where rm.cadet_id = p_profile_id
        and btrim(rm.room_number) = v_room
        and rm.completed_at is not null
    );
  end if;

  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. get_year_close_preflight — move-out pending labels
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
    and public._year_close_cadet_needs_move_out(p.id);

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
      p.last_name || ', ' || p.first_name || ' — Room ' || btrim(cp.room_number)
        || ' (move-out pending)' as label,
      '/profile/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    join public.roles r on r.id = p.role_id
    where coalesce(r.default_role_level, 0) < 50
      and coalesce(p.archived, false) = false
      and public._year_close_cadet_needs_move_out(p.id)
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
-- 3. Reminder scoping — leadership excludes room items; TAC company-assigned only
-- ---------------------------------------------------------------------------

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
  v_leadership_categories text[] := array['open_events', 'open_special_reports', 'summary_drafts'];
  v_cat text;
begin
  select r.role_name, r.default_role_level, coalesce(p.is_site_admin, false), p.company_id
  into v_role_name, v_role_level, v_is_admin, v_company_id
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where p.id = p_user_id;

  if public._year_close_is_leadership_recipient(v_role_name, v_role_level, v_is_admin) then
    foreach v_cat in array v_leadership_categories loop
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
  elsif public._year_close_is_company_tac(p_user_id) then
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
        or public._year_close_is_company_tac(p.id)
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
        or public._year_close_is_company_tac(p.id)
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
-- 4. close_school_year — optional force archive (role level > 100)
-- ---------------------------------------------------------------------------

drop function if exists public.close_school_year(text, text);

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
  v_snapshots integer := 0;
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

  if p_force then
    v_force_bypassed := v_preflight -> 'manual';
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

grant execute on function public.close_school_year(text, text, boolean) to authenticated;
grant execute on function public.can_force_close_school_year() to authenticated;
grant execute on function public._year_close_is_company_tac(uuid) to authenticated;
