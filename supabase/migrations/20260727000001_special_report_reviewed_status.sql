-- Special report status simplification: reviewed replaces under_review/acknowledged.
-- Adds mark/unmark/close RPCs and updates event close + year-close checks.

-- 1. Relax status check, migrate data, then enforce new allowed values
alter table public.special_reports
  drop constraint if exists special_reports_status_check;

update public.special_reports
set status = 'reviewed', updated_at = now()
where status in ('under_review', 'acknowledged');

alter table public.special_reports
  add constraint special_reports_status_check
    check (status in ('submitted', 'reviewed', 'closed'));

-- 3. Mark as reviewed
create or replace function public.mark_special_report_reviewed(
  p_report_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public._special_reports_can_read(p_report_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if not exists (
    select 1 from public.special_reports sr
    where sr.id = p_report_id and sr.status = 'submitted'
  ) then
    raise exception 'Only submitted reports can be marked as reviewed.';
  end if;

  update public.special_reports
  set
    status = 'reviewed',
    review_notes = nullif(btrim(p_notes), ''),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = p_report_id;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    p_report_id,
    auth.uid(),
    'marked_reviewed',
    jsonb_build_object('notes', p_notes)
  );
end;
$$;

-- 4. Unmark reviewed (unfiled only)
create or replace function public.unmark_special_report_reviewed(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public._special_reports_can_read(p_report_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if not exists (
    select 1 from public.special_reports sr
    where sr.id = p_report_id
      and sr.status = 'reviewed'
      and sr.event_id is null
  ) then
    raise exception 'Only unfiled reviewed reports can be unmarked.';
  end if;

  update public.special_reports
  set
    status = 'submitted',
    review_notes = null,
    reviewed_by = null,
    reviewed_at = null,
    updated_at = now()
  where id = p_report_id;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    p_report_id,
    auth.uid(),
    'unmarked_reviewed',
    '{}'::jsonb
  );
end;
$$;

-- 5. Close special report (terminal)
create or replace function public.close_special_report(
  p_report_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public._special_reports_can_read(p_report_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if not exists (
    select 1 from public.special_reports sr
    where sr.id = p_report_id and sr.status in ('submitted', 'reviewed')
  ) then
    raise exception 'Report cannot be closed in its current status.';
  end if;

  update public.special_reports
  set
    status = 'closed',
    review_notes = coalesce(nullif(btrim(p_notes), ''), review_notes),
    reviewed_by = coalesce(reviewed_by, auth.uid()),
    reviewed_at = coalesce(reviewed_at, now()),
    updated_at = now()
  where id = p_report_id;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    p_report_id,
    auth.uid(),
    'closed',
    jsonb_build_object('notes', p_notes)
  );
end;
$$;

-- 6. Drop legacy review_special_report (replaced by mark/unmark/close)
drop function if exists public.review_special_report(uuid, text, text, uuid);

-- 7. Event close: only block on submitted special reports
create or replace function public.update_event_status(
  p_event_id uuid,
  p_status text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open_reports integer;
begin
  if not public._events_can_read(p_event_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if p_status not in ('open', 'under_review', 'closed', 'carried_forward') then
    raise exception 'Invalid event status.';
  end if;

  if p_status = 'closed' then
    select count(*) into v_open_reports
    from public.special_reports sr
    where sr.event_id = p_event_id
      and sr.status = 'submitted';

    if v_open_reports > 0 then
      raise exception 'Resolve all linked special reports before closing this event.';
    end if;

    update public.events
    set
      status = p_status,
      closed_at = now(),
      closed_by = auth.uid(),
      updated_at = now(),
      summary = case
        when p_notes is not null and btrim(p_notes) <> '' then
          coalesce(summary, '') || case when summary is null or summary = '' then '' else E'\n\n' end
            || '[Closed] ' || btrim(p_notes)
        else summary
      end
    where id = p_event_id;
  else
    update public.events
    set status = p_status, updated_at = now()
    where id = p_event_id;
  end if;
end;
$$;

-- 8. resolve_event_handled: only block on submitted
create or replace function public.resolve_event_handled(
  p_event_id uuid,
  p_summary text,
  p_close_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open_reports integer;
begin
  if not public._events_can_read(p_event_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if p_summary is null or btrim(p_summary) = '' then
    raise exception 'Resolution summary is required.';
  end if;

  select count(*) into v_open_reports
  from public.special_reports sr
  where sr.event_id = p_event_id
    and sr.status = 'submitted';

  if v_open_reports > 0 then
    raise exception 'Resolve all linked special reports before closing this event.';
  end if;

  update public.events
  set
    status = 'closed',
    resolution_type = 'handled',
    closed_at = now(),
    closed_by = auth.uid(),
    updated_at = now(),
    summary = btrim(p_summary) || case
      when p_close_notes is not null and btrim(p_close_notes) <> '' then E'\n\n' || btrim(p_close_notes)
      else ''
    end
  where id = p_event_id;
end;
$$;

-- 9. resolve_event_with_demerits: auto-mark linked reports as reviewed
create or replace function public.resolve_event_with_demerits(
  p_event_id uuid,
  p_assignments jsonb,
  p_date_of_offense date,
  p_close_notes text default null
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment jsonb;
  v_cadet_id uuid;
  v_offense_id uuid;
  v_notes text;
  v_explanation text;
  v_demerits integer;
  v_policy_category integer;
  v_my_group_id uuid;
  v_next_group_id uuid;
  v_status text;
  v_report_id uuid;
  v_report_ids uuid[] := array[]::uuid[];
  v_open_reports integer;
  v_event_title text;
begin
  if not public._events_can_read(p_event_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if p_assignments is null or jsonb_array_length(p_assignments) = 0 then
    raise exception 'At least one demerit assignment is required.';
  end if;

  if p_date_of_offense is null then
    raise exception 'Date of offense is required.';
  end if;

  if not exists (
    select 1 from public.events e
    where e.id = p_event_id and e.status in ('open', 'under_review')
  ) then
    raise exception 'Event must be open or under review to assign demerits.';
  end if;

  select r.approval_group_id into v_my_group_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  if v_my_group_id is not null then
    select ag.next_approver_group_id into v_next_group_id
    from public.approval_groups ag
    where ag.id = v_my_group_id;
  end if;

  if v_my_group_id is not null and v_next_group_id is null then
    v_status := 'completed';
  else
    v_status := 'pending_approval';
  end if;

  for v_assignment in select * from jsonb_array_elements(p_assignments)
  loop
    v_cadet_id := (v_assignment ->> 'cadet_id')::uuid;
    v_offense_id := (v_assignment ->> 'offense_type_id')::uuid;
    v_notes := nullif(btrim(v_assignment ->> 'notes'), '');
    v_explanation := nullif(btrim(v_assignment ->> 'explanation'), '');

    if v_cadet_id is null or v_offense_id is null then
      raise exception 'Each assignment requires cadet_id and offense_type_id.';
    end if;

    if v_notes is null then
      raise exception 'Green sheet summary (notes) is required for each assignment.';
    end if;

    select ot.demerits, ot.policy_category
    into v_demerits, v_policy_category
    from public.offense_types ot
    where ot.id = v_offense_id;

    if v_demerits is null then
      raise exception 'Invalid offense type.';
    end if;

    insert into public.demerit_reports (
      subject_cadet_id,
      submitted_by,
      offense_type_id,
      date_of_offense,
      notes,
      report_explanation,
      demerits_effective,
      status,
      current_approver_group_id,
      linked_event_id
    ) values (
      v_cadet_id,
      auth.uid(),
      v_offense_id,
      p_date_of_offense,
      v_notes,
      coalesce(v_explanation, ''),
      v_demerits,
      v_status,
      v_next_group_id,
      p_event_id
    )
    returning id into v_report_id;

    v_report_ids := array_append(v_report_ids, v_report_id);

    insert into public.approval_log (report_id, actor_id, action, comment, created_at)
    values (
      v_report_id,
      auth.uid(),
      'submitted',
      'Assigned from event resolution.',
      now()
    );

    if v_status = 'completed' then
      insert into public.approval_log (report_id, actor_id, action, comment, created_at)
      values (
        v_report_id,
        auth.uid(),
        'approved',
        'Auto-approved (Final Authority)',
        now() + interval '1 second'
      );
    end if;
  end loop;

  update public.special_reports sr
  set
    status = 'reviewed',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_notes = coalesce(sr.review_notes, 'Reviewed via event demerit resolution.'),
    updated_at = now()
  where sr.event_id = p_event_id
    and sr.status = 'submitted';

  select e.title into v_event_title
  from public.events e
  where e.id = p_event_id;

  update public.events
  set
    status = 'closed',
    resolution_type = 'demerits',
    closed_at = now(),
    closed_by = auth.uid(),
    updated_at = now(),
    summary = case
      when p_close_notes is not null and btrim(p_close_notes) <> '' then
        coalesce(summary, '') || case when summary is null or summary = '' then '' else E'\n\n' end
          || '[Closed — demerits assigned] ' || btrim(p_close_notes)
      else
        coalesce(summary, '') || case when summary is null or summary = '' then '' else E'\n\n' end
          || '[Closed — demerits assigned]'
    end
  where id = p_event_id;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  select
    sr.id,
    auth.uid(),
    'event_demerit_resolution',
    jsonb_build_object('event_id', p_event_id, 'demerit_report_ids', to_jsonb(v_report_ids))
  from public.special_reports sr
  where sr.event_id = p_event_id;

  return v_report_ids;
end;
$$;

-- 10. Notification trigger: reviewed and closed
create or replace function public.notify_on_special_report_reviewed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link text;
  v_title text;
  v_body text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status not in ('reviewed', 'closed') then
    return new;
  end if;

  if old.status in ('reviewed', 'closed') then
    return new;
  end if;

  v_link := '/special-reports';
  v_title := 'Special report reviewed';
  v_body := 'Your special report was updated to status: ' || new.status || '.';
  if new.review_notes is not null and btrim(new.review_notes) <> '' then
    v_body := v_body || ' Notes: ' || new.review_notes;
  end if;

  perform public.dispatch_notification(
    new.submitter_cadet_id,
    'special_report.reviewed',
    v_title,
    v_body,
    v_link,
    'special_report.reviewed:' || new.id::text || ':' || new.status,
    jsonb_build_object('special_report_id', new.id, 'status', new.status)
  );

  return new;
end;
$$;

-- 11. Year-close preflight: open special reports = submitted only
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
  v_open_events integer;
  v_open_special_reports integer;
  v_uncleared_rooms integer;
  v_tour_sheet integer;
  v_probation integer;
  v_suspended integer;
  v_open_work_orders integer;
  v_items_uncleared jsonb;
  v_items_tour jsonb;
  v_items_probation jsonb;
  v_items_suspended jsonb;
  v_items_open_events jsonb;
  v_items_open_special_reports jsonb;
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

  select count(*) into v_open_events
  from public.events e
  where e.school_year = p_school_year
    and e.status in ('open', 'under_review');

  select count(*) into v_open_special_reports
  from public.special_reports sr
  where sr.school_year = p_school_year
    and sr.status = 'submitted'
    and (
      sr.event_id is null
      or exists (
        select 1 from public.events e
        where e.id = sr.event_id
          and e.status in ('open', 'under_review', 'carried_forward')
      )
    );

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

  select count(*) into v_open_work_orders
  from public.work_orders wo
  where wo.status not in ('completed', 'cancelled');

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
      p.last_name || ', ' || p.first_name || ' — Probation: ' || cp.probation_status as label,
      '/ledger/' || p.id::text as href,
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
      p.last_name || ', ' || p.first_name || ' — Suspended (resolve before close)' as label,
      '/profile/' || p.id::text as href,
      p.company_id
    from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    where coalesce(p.archived, false) = true
      and cp.departure_classification = 'suspended'
    order by p.last_name, p.first_name
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_open_events
  from (
    select
      e.id,
      e.title || ' (' || e.status || ')' as label,
      '/events/' || e.id::text as href,
      public._events_cadet_company_for_event(e.id) as company_id
    from public.events e
    where e.school_year = p_school_year
      and e.status in ('open', 'under_review')
    order by e.created_at desc
  ) t;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.label), '[]'::jsonb)
  into v_items_open_special_reports
  from (
    select
      sr.id,
      public.format_profile_name(sr.submitter_cadet_id) || ' — special report (' || sr.status || ')' as label,
      '/incidents?report=' || sr.id::text as href,
      p.company_id
    from public.special_reports sr
    join public.profiles p on p.id = sr.submitter_cadet_id
    where sr.school_year = p_school_year
      and sr.status = 'submitted'
      and (
        sr.event_id is null
        or exists (
          select 1 from public.events e
          where e.id = sr.event_id
            and e.status in ('open', 'under_review', 'carried_forward')
        )
      )
    order by sr.created_at desc
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
      'open_special_reports', v_open_special_reports,
      'uncleared_rooms', v_uncleared_rooms,
      'summary_drafts', 0,
      'suspended_cadets', v_suspended
    ),
    'informational', jsonb_build_object(
      'open_work_orders', v_open_work_orders
    ),
    'items', jsonb_build_object(
      'uncleared_rooms', v_items_uncleared,
      'open_events', v_items_open_events,
      'open_special_reports', v_items_open_special_reports,
      'summary_drafts', '[]'::jsonb,
      'suspended_cadets', v_items_suspended,
      'tour_sheet_cleared', v_items_tour,
      'probation_reset', v_items_probation
    )
  );
end;
$$;

grant execute on function public.mark_special_report_reviewed(uuid, text) to authenticated;
grant execute on function public.unmark_special_report_reviewed(uuid) to authenticated;
grant execute on function public.close_special_report(uuid, text) to authenticated;
