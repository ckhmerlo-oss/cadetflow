-- Archive classification, unassigned filter, email user lookup, year-close suspended blockers

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. departure_classification on cadet_profiles
-- ---------------------------------------------------------------------------

alter table public.cadet_profiles
  add column if not exists departure_classification text;

alter table public.cadet_profiles
  drop constraint if exists cadet_profiles_departure_classification_check;

alter table public.cadet_profiles
  add constraint cadet_profiles_departure_classification_check
  check (
    departure_classification is null
    or departure_classification in ('non_return', 'withdrawn', 'suspended', 'dismissal')
  );

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
  cp.graduated_at,
  cp.departure_classification
from public.profiles p
join public.cadet_profiles cp on cp.profile_id = p.id;

-- ---------------------------------------------------------------------------
-- 2. Auth email lookup for queue processor (by user ids)
-- ---------------------------------------------------------------------------

create or replace function public.get_auth_user_emails(p_user_ids uuid[])
returns table(user_id uuid, email text)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email::text
  from auth.users u
  where u.id = any(p_user_ids)
    and u.email is not null;
$$;

grant execute on function public.get_auth_user_emails(uuid[]) to service_role;

-- ---------------------------------------------------------------------------
-- 3. get_unassigned_users — exclude archived
-- ---------------------------------------------------------------------------

create or replace function public.get_unassigned_users()
returns table(
  user_id uuid,
  first_name text,
  last_name text,
  created_at timestamptz,
  company_id uuid,
  company_name text,
  role_id uuid,
  role_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_my_role_level() < 15 then
    raise exception 'You do not have permission to view unassigned users.';
  end if;

  return query
  select
    p.id as user_id,
    p.first_name,
    p.last_name,
    u.created_at,
    c.id as company_id,
    c.company_name,
    r.id as role_id,
    r.role_name
  from public.profiles p
  join auth.users u on p.id = u.id
  left join public.companies c on p.company_id = c.id
  left join public.roles r on p.role_id = r.id
  where (p.role_id is null or p.company_id is null)
    and coalesce(p.archived, false) = false
    and coalesce(p.is_site_admin, false) = false
  order by u.created_at desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. set_departure_classification (suspended resolution + admin updates)
-- ---------------------------------------------------------------------------

create or replace function public.set_departure_classification(
  p_cadet_id uuid,
  p_classification text
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
  if p_classification not in ('non_return', 'withdrawn', 'suspended', 'dismissal') then
    raise exception 'Invalid departure classification';
  end if;

  select p.id, p.archived, p.company_id, cp.departure_classification
  into v_cadet
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  where p.id = p_cadet_id;

  if not found then
    raise exception 'Cadet not found';
  end if;

  select company_id into v_viewer_company from public.profiles where id = auth.uid();

  if public.is_site_admin() or v_level >= 90 then
    null;
  elsif public._year_close_is_company_tac(auth.uid()) then
    if v_cadet.departure_classification is distinct from 'suspended' then
      raise exception 'Company TAC may only resolve suspended cadets';
    end if;
    if not exists (
      select 1
      from public.cadet_profiles cp2,
        lateral (
          select (elem ->> 'company_id')::uuid as hist_company_id
          from jsonb_array_elements(coalesce(cp2.role_history, '[]'::jsonb)) with ordinality as t(elem, ord)
          order by ord desc
          limit 1
        ) last_co
      where cp2.profile_id = p_cadet_id
        and last_co.hist_company_id is not distinct from v_viewer_company
    ) then
      raise exception 'Permission denied';
    end if;
    if p_classification not in ('non_return', 'dismissal') then
      raise exception 'Suspended cadets must be resolved to non_return or dismissal';
    end if;
  else
    raise exception 'Permission denied';
  end if;

  update public.cadet_profiles cp
  set departure_classification = p_classification, updated_at = now()
  where cp.profile_id = p_cadet_id;
end;
$$;

grant execute on function public.set_departure_classification(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. archive_cadet_profile — require classification; deactivate oversight
-- ---------------------------------------------------------------------------

drop function if exists public.archive_cadet_profile(uuid, text);

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
end;
$$;

grant execute on function public.archive_cadet_profile(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. add_manual_oversight — reject archived cadets
-- ---------------------------------------------------------------------------

create or replace function public.add_manual_oversight(
  p_cadet_id uuid,
  p_staff_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce((select archived from public.profiles where id = p_cadet_id), false) then
    raise exception 'Cannot assign oversight to an archived cadet';
  end if;

  if p_staff_id = auth.uid() then
    if not public.is_teacher_staff() then
      raise exception 'Permission denied';
    end if;
  elsif not public.can_manage_cadet_schedule(p_cadet_id) and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  perform public.upsert_oversight_assignment(
    p_cadet_id, p_staff_id, 'faculty', 'manual', 'manual:' || auth.uid()::text,
    null, null, null, null, auth.uid()
  );

  select id into v_id
  from public.cadet_oversight_assignments
  where cadet_id = p_cadet_id
    and staff_id = p_staff_id
    and assignment_type = 'faculty'
    and source = 'manual'
    and is_active = true
  limit 1;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. reactivate_cadets — clear departure_classification
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

-- ---------------------------------------------------------------------------
-- 8. get_year_close_preflight — suspended archived cadets
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
  v_suspended integer;
  v_items_uncleared jsonb;
  v_items_tour jsonb;
  v_items_probation jsonb;
  v_items_suspended jsonb;
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

  select count(*) into v_suspended
  from public.cadet_profiles cp
  join public.profiles p on p.id = cp.profile_id
  where coalesce(p.archived, false) = true
    and cp.departure_classification = 'suspended';

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

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_suspended
  from (
    select
      p.id,
      p.last_name || ', ' || p.first_name || ' — suspended (resolve before close)' as label,
      '/profile/' || p.id::text as href,
      coalesce(
        (select (elem ->> 'company_id')::uuid
         from jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) with ordinality as t(elem, ord)
         where elem ->> 'company_id' is not null
         order by ord desc
         limit 1),
        p.company_id
      ) as company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    where coalesce(p.archived, false) = true
      and cp.departure_classification = 'suspended'
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
      'summary_drafts', 0,
      'suspended_cadets', v_suspended
    ),
    'informational', jsonb_build_object(
      'open_work_orders', 0
    ),
    'items', jsonb_build_object(
      'uncleared_rooms', v_items_uncleared,
      'open_events', '[]'::jsonb,
      'open_special_reports', '[]'::jsonb,
      'summary_drafts', '[]'::jsonb,
      'suspended_cadets', v_items_suspended,
      'tour_sheet_cleared', v_items_tour,
      'probation_reset', v_items_probation
    )
  );
end;
$$;

-- Leadership gets suspended items in reminder scoping
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
  v_leadership_categories text[] := array['open_events', 'open_special_reports', 'summary_drafts', 'suspended_cadets'];
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
    foreach v_cat in array array['uncleared_rooms', 'suspended_cadets'] loop
      v_all_items := coalesce(p_preflight -> 'items' -> v_cat, '[]'::jsonb);
      for v_item in select * from jsonb_array_elements(v_all_items) loop
        if (v_item ->> 'company_id')::uuid is not distinct from v_company_id then
          v_result := v_result || jsonb_build_array(jsonb_build_object(
            'category', v_cat,
            'id', v_item -> 'id',
            'label', v_item -> 'label',
            'href', v_item -> 'href',
            'company_id', v_item -> 'company_id'
          ));
        end if;
      end loop;
    end loop;
  end if;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. send_year_close_reminders — return enqueued counts
-- ---------------------------------------------------------------------------

drop function if exists public.send_year_close_reminders(text);

create or replace function public.send_year_close_reminders(p_school_year text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_preflight jsonb;
  v_recipient record;
  v_body text;
  v_title text := 'School year closeout reminder: ' || p_school_year;
  v_recipients integer := 0;
  v_enqueued integer := 0;
  v_manual_items jsonb;
  v_is_maintenance boolean;
  v_key text;
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
    v_recipients := v_recipients + 1;
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

    v_key := 'email.archive.pre_close:' || p_school_year || ':' || v_recipient.user_id::text;
    if exists (
      select 1 from public.notification_queue nq where nq.idempotency_key = v_key
    ) then
      v_enqueued := v_enqueued + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'recipients', v_recipients,
    'enqueued', v_enqueued,
    'skipped', v_recipients - v_enqueued
  );
end;
$$;

grant execute on function public.send_year_close_reminders(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 10. close_school_year — suspended blocker + non_return on batch archive
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

  if not p_force and coalesce((v_preflight -> 'manual' ->> 'suspended_cadets')::integer, 0) > 0 then
    raise exception 'Archived cadets marked suspended must be resolved to non_return or dismissal before year close';
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
