-- Day 10: Special Reports, Events, and affidavit workflow

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  status text not null default 'open',
  school_year text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  carried_forward_from_school_year text,
  carried_forward_at timestamptz,
  closed_at timestamptz,
  closed_by uuid references public.profiles (id) on delete set null,
  attachment_manifest jsonb not null default '[]'::jsonb,
  constraint events_status_check
    check (status in ('open', 'under_review', 'closed', 'carried_forward'))
);

comment on table public.events is
  'Organizational containers grouping incident reports and special reports (Day 10).';
comment on column public.events.attachment_manifest is
  'Scaffold for Day 12.2 file_assets; superseded when storage foundation lands.';

create index if not exists idx_events_school_year_status
  on public.events (school_year, status);

create table if not exists public.special_reports (
  id uuid primary key default gen_random_uuid(),
  submitter_cadet_id uuid not null references public.profiles (id) on delete restrict,
  subject_cadet_id uuid references public.profiles (id) on delete set null,
  narrative text not null,
  location text not null,
  occurred_at timestamptz not null,
  involvement_type text not null default 'witness',
  status text not null default 'submitted',
  event_id uuid references public.events (id) on delete set null,
  school_year text not null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  attachment_manifest jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint special_reports_status_check
    check (status in ('submitted', 'under_review', 'acknowledged', 'closed')),
  constraint special_reports_involvement_check
    check (involvement_type in ('witness', 'participant', 'other'))
);

comment on table public.special_reports is
  'Cadet-filed affidavits / narrative special reports linked to events (Day 10).';

create index if not exists idx_special_reports_submitter
  on public.special_reports (submitter_cadet_id, created_at desc);
create index if not exists idx_special_reports_event
  on public.special_reports (event_id);
create index if not exists idx_special_reports_school_year_status
  on public.special_reports (school_year, status);

create table if not exists public.special_report_audit_log (
  id uuid primary key default gen_random_uuid(),
  special_report_id uuid not null references public.special_reports (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_special_report_audit_log_report
  on public.special_report_audit_log (special_report_id, created_at desc);

alter table public.incident_reports
  add column if not exists event_id uuid references public.events (id) on delete set null;

create index if not exists idx_incident_reports_event
  on public.incident_reports (event_id);

-- ---------------------------------------------------------------------------
-- 2. Permission helpers
-- ---------------------------------------------------------------------------

create or replace function public._events_can_manage()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_can_all boolean;
  v_can_own boolean;
begin
  if public.is_site_admin() then
    return true;
  end if;

  select
    r.default_role_level,
    coalesce(r.can_manage_all_rosters, false),
    coalesce(r.can_manage_own_company_roster, false)
  into v_level, v_can_all, v_can_own
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if v_level is null then
    return false;
  end if;

  if v_level >= 90 or v_can_all then
    return true;
  end if;

  if v_level >= 65 and v_can_own then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public._events_cadet_company_for_event(p_event_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.company_id
      from public.special_reports sr
      join public.profiles p on p.id = sr.submitter_cadet_id
      where sr.event_id = p_event_id
      order by sr.created_at
      limit 1
    ),
    (
      select p.company_id
      from public.incident_reports ir
      join public.profiles p on p.id = ir.subject_cadet_id
      where ir.event_id = p_event_id
      order by ir.created_at
      limit 1
    ),
    (
      select p.company_id
      from public.events e
      join public.profiles p on p.id = e.created_by
      where e.id = p_event_id
    )
  );
$$;

create or replace function public._events_can_read(p_event_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_company_id uuid;
  v_event_company uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  if public.is_site_admin() then
    return true;
  end if;

  select r.default_role_level, p.company_id
  into v_level, v_company_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if v_level is null then
    return false;
  end if;

  if v_level >= 90 then
    return true;
  end if;

  if exists (
    select 1 from public.special_reports sr
    where sr.event_id = p_event_id and sr.submitter_cadet_id = auth.uid()
  ) then
    return true;
  end if;

  if exists (
    select 1 from public.incident_reports ir
    where ir.event_id = p_event_id and ir.reporter_id = auth.uid()
  ) then
    return true;
  end if;

  if v_level >= 65 then
    v_event_company := public._events_cadet_company_for_event(p_event_id);
    if v_event_company is null then
      return public._events_can_manage();
    end if;
    return public._work_order_can_tac_manage(v_event_company);
  end if;

  return false;
end;
$$;

create or replace function public._special_reports_can_submit()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_archived boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  select r.default_role_level, coalesce(p.archived, false)
  into v_level, v_archived
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  if v_archived then
    return false;
  end if;

  return coalesce(v_level, 0) < 50;
end;
$$;

create or replace function public._special_reports_can_read(p_report_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_viewer_company uuid;
  v_submitter_company uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  if exists (
    select 1 from public.special_reports sr
    where sr.id = p_report_id and sr.submitter_cadet_id = auth.uid()
  ) then
    return true;
  end if;

  if public.is_site_admin() then
    return true;
  end if;

  select r.default_role_level, p.company_id
  into v_level, v_viewer_company
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and coalesce(p.archived, false) = false;

  if coalesce(v_level, 0) >= 90 then
    return true;
  end if;

  if coalesce(v_level, 0) < 65 then
    return false;
  end if;

  select p.company_id into v_submitter_company
  from public.special_reports sr
  join public.profiles p on p.id = sr.submitter_cadet_id
  where sr.id = p_report_id;

  return public._work_order_can_tac_manage(v_submitter_company);
end;
$$;

create or replace function public.get_special_report_action_recipient_ids(p_cadet_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct recipient_id
  from (
    select p.id as recipient_id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where coalesce(p.archived, false) = false
      and (
        r.default_role_level >= 90
        or coalesce(r.can_manage_all_rosters, false) = true
        or r.role_name ilike '%deputy%commandant%'
      )
    union
    select public.get_incident_tac_recipient_ids(p_cadet_id)
  ) recipients
  where recipient_id is not null;
$$;

-- ---------------------------------------------------------------------------
-- 3. RPCs
-- ---------------------------------------------------------------------------

create or replace function public.submit_special_report(
  p_narrative text,
  p_location text,
  p_occurred_at timestamptz,
  p_involvement_type text default 'witness',
  p_subject_cadet_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_subject uuid;
  v_school_year text;
begin
  if not public._special_reports_can_submit() then
    raise exception 'Permission denied — only active cadets may submit special reports.';
  end if;

  if p_narrative is null or btrim(p_narrative) = '' then
    raise exception 'Narrative is required.';
  end if;

  if p_location is null or btrim(p_location) = '' then
    raise exception 'Location is required.';
  end if;

  if p_involvement_type not in ('witness', 'participant', 'other') then
    raise exception 'Invalid involvement type.';
  end if;

  v_subject := coalesce(p_subject_cadet_id, auth.uid());
  v_school_year := coalesce(public.get_active_school_year(), 'unknown');

  insert into public.special_reports (
    submitter_cadet_id,
    subject_cadet_id,
    narrative,
    location,
    occurred_at,
    involvement_type,
    status,
    school_year
  ) values (
    auth.uid(),
    v_subject,
    btrim(p_narrative),
    btrim(p_location),
    p_occurred_at,
    p_involvement_type,
    'submitted',
    v_school_year
  )
  returning id into v_id;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    v_id,
    auth.uid(),
    'submitted',
    jsonb_build_object('involvement_type', p_involvement_type, 'subject_cadet_id', v_subject)
  );

  return v_id;
end;
$$;

create or replace function public.create_event(
  p_title text,
  p_summary text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_school_year text;
begin
  if not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if p_title is null or btrim(p_title) = '' then
    raise exception 'Title is required.';
  end if;

  v_school_year := coalesce(public.get_active_school_year(), 'unknown');

  insert into public.events (title, summary, status, school_year, created_by)
  values (btrim(p_title), nullif(btrim(p_summary), ''), 'open', v_school_year, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

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
      and sr.status in ('submitted', 'under_review');

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

create or replace function public.link_filings_to_event(
  p_event_id uuid,
  p_incident_ids uuid[] default '{}',
  p_special_report_ids uuid[] default '{}',
  p_unlink_incident_ids uuid[] default '{}',
  p_unlink_special_report_ids uuid[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_incident_id uuid;
  v_report_id uuid;
begin
  if not public._events_can_read(p_event_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if not exists (select 1 from public.events e where e.id = p_event_id) then
    raise exception 'Event not found.';
  end if;

  foreach v_incident_id in array coalesce(p_unlink_incident_ids, '{}')
  loop
    update public.incident_reports
    set event_id = null
    where id = v_incident_id and event_id = p_event_id;
  end loop;

  foreach v_report_id in array coalesce(p_unlink_special_report_ids, '{}')
  loop
    update public.special_reports
    set event_id = null, updated_at = now()
    where id = v_report_id and event_id = p_event_id;
  end loop;

  foreach v_incident_id in array coalesce(p_incident_ids, '{}')
  loop
    update public.incident_reports
    set event_id = p_event_id
    where id = v_incident_id
      and (event_id is null or event_id = p_event_id);
  end loop;

  foreach v_report_id in array coalesce(p_special_report_ids, '{}')
  loop
    update public.special_reports
    set event_id = p_event_id, updated_at = now()
    where id = v_report_id
      and (event_id is null or event_id = p_event_id);
  end loop;

  update public.events set updated_at = now() where id = p_event_id;
end;
$$;

create or replace function public.review_special_report(
  p_report_id uuid,
  p_status text,
  p_notes text default null,
  p_event_id uuid default null
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

  if p_status not in ('under_review', 'acknowledged', 'closed') then
    raise exception 'Invalid review status.';
  end if;

  if p_event_id is not null and not exists (select 1 from public.events e where e.id = p_event_id) then
    raise exception 'Event not found.';
  end if;

  update public.special_reports
  set
    status = p_status,
    review_notes = nullif(btrim(p_notes), ''),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    event_id = coalesce(p_event_id, event_id),
    updated_at = now()
  where id = p_report_id;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    p_report_id,
    auth.uid(),
    'reviewed',
    jsonb_build_object('status', p_status, 'event_id', p_event_id, 'notes', p_notes)
  );
end;
$$;

create or replace function public.carry_forward_event(
  p_event_id uuid,
  p_next_school_year text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_year text;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if p_next_school_year is null or btrim(p_next_school_year) = '' then
    raise exception 'Next school year is required.';
  end if;

  select e.school_year into v_current_year
  from public.events e
  where e.id = p_event_id;

  if v_current_year is null then
    raise exception 'Event not found.';
  end if;

  update public.events
  set
    status = 'carried_forward',
    school_year = p_next_school_year,
    carried_forward_from_school_year = v_current_year,
    carried_forward_at = now(),
    updated_at = now()
  where id = p_event_id
    and status in ('open', 'under_review', 'carried_forward');

  update public.special_reports sr
  set school_year = p_next_school_year, updated_at = now()
  where sr.event_id = p_event_id
    and sr.status not in ('closed');
end;
$$;

create or replace function public.update_event_details(
  p_event_id uuid,
  p_title text default null,
  p_summary text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public._events_can_read(p_event_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  update public.events
  set
    title = coalesce(nullif(btrim(p_title), ''), title),
    summary = case when p_summary is not null then nullif(btrim(p_summary), '') else summary end,
    updated_at = now()
  where id = p_event_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;
alter table public.special_reports enable row level security;
alter table public.special_report_audit_log enable row level security;

revoke all on table public.events from anon;
revoke all on table public.special_reports from anon;
revoke all on table public.special_report_audit_log from anon;

grant select on table public.events to authenticated;
grant select on table public.special_reports to authenticated;
grant select on table public.special_report_audit_log to authenticated;
grant all on table public.events to service_role;
grant all on table public.special_reports to service_role;
grant all on table public.special_report_audit_log to service_role;

drop policy if exists "Events select scoped" on public.events;
create policy "Events select scoped"
on public.events for select to authenticated
using (public._events_can_read(id));

drop policy if exists "Special reports select scoped" on public.special_reports;
create policy "Special reports select scoped"
on public.special_reports for select to authenticated
using (public._special_reports_can_read(id));

drop policy if exists "Special report audit select scoped" on public.special_report_audit_log;
create policy "Special report audit select scoped"
on public.special_report_audit_log for select to authenticated
using (
  exists (
    select 1 from public.special_reports sr
    where sr.id = special_report_audit_log.special_report_id
      and public._special_reports_can_read(sr.id)
  )
);

-- ---------------------------------------------------------------------------
-- 5. Notifications
-- ---------------------------------------------------------------------------

insert into public.notification_event_types (code, category, title_template, description) values
  ('special_report.action_required', 'new_report', 'Special report submitted', 'A cadet special report requires leadership review.'),
  ('event.action_required', 'new_report', 'Event requires review', 'An event has been created or escalated and requires review.'),
  ('special_report.reviewed', 'status_change', 'Special report reviewed', 'Your special report was reviewed by staff.'),
  ('event.status_changed', 'status_change', 'Event status changed', 'An event you are involved with had a status change.')
on conflict (code) do nothing;

create or replace function public.notify_on_special_report_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient_id uuid;
  v_submitter_name text;
  v_link text;
  v_title text;
  v_body text;
begin
  if new.status <> 'submitted' then
    return new;
  end if;

  v_submitter_name := public.format_profile_name(new.submitter_cadet_id);
  v_link := '/events?report=' || new.id::text;
  v_title := 'Special report submitted';
  v_body := v_submitter_name || ' submitted a special report affidavit.';

  for v_recipient_id in
    select public.get_special_report_action_recipient_ids(new.submitter_cadet_id)
  loop
    if v_recipient_id = new.submitter_cadet_id then
      continue;
    end if;

    perform public.dispatch_notification(
      v_recipient_id,
      'special_report.action_required',
      v_title,
      v_body,
      v_link,
      'special_report.action_required:' || new.id::text || ':' || v_recipient_id::text,
      jsonb_build_object(
        'special_report_id', new.id,
        'submitter_cadet_id', new.submitter_cadet_id
      )
    );
  end loop;

  return new;
end;
$$;

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

  if new.status not in ('under_review', 'acknowledged', 'closed') then
    return new;
  end if;

  if old.status in ('acknowledged', 'closed') then
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

create or replace function public._event_notification_cadet_id(p_event_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select sr.submitter_cadet_id
      from public.special_reports sr
      where sr.event_id = p_event_id
      order by sr.created_at
      limit 1
    ),
    (
      select ir.subject_cadet_id
      from public.incident_reports ir
      where ir.event_id = p_event_id
      order by ir.created_at
      limit 1
    )
  );
$$;

create or replace function public.notify_on_event_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient_id uuid;
  v_cadet_id uuid;
  v_creator_company uuid;
  v_link text;
begin
  v_link := '/events/' || new.id::text;
  v_cadet_id := public._event_notification_cadet_id(new.id);

  if v_cadet_id is not null then
    for v_recipient_id in
      select public.get_special_report_action_recipient_ids(v_cadet_id)
    loop
      perform public.dispatch_notification(
        v_recipient_id,
        'event.action_required',
        'New event: ' || new.title,
        coalesce(new.summary, 'A new event requires review.'),
        v_link,
        'event.action_required:insert:' || new.id::text || ':' || v_recipient_id::text,
        jsonb_build_object('event_id', new.id)
      );
    end loop;
  else
    select p.company_id into v_creator_company
    from public.profiles p where p.id = new.created_by;

    for v_recipient_id in
      select distinct p.id
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where coalesce(p.archived, false) = false
        and (
          r.default_role_level >= 90
          or coalesce(r.can_manage_all_rosters, false)
        )
    loop
      perform public.dispatch_notification(
        v_recipient_id,
        'event.action_required',
        'New event: ' || new.title,
        coalesce(new.summary, 'A new event requires review.'),
        v_link,
        'event.action_required:insert:' || new.id::text || ':' || v_recipient_id::text,
        jsonb_build_object('event_id', new.id)
      );
    end loop;
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_event_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient_id uuid;
  v_cadet_id uuid;
  v_link text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status <> 'under_review' then
    return new;
  end if;

  v_link := '/events/' || new.id::text;
  v_cadet_id := public._event_notification_cadet_id(new.id);

  if v_cadet_id is null then
    select p.company_id into v_cadet_id
    from public.profiles p where p.id = new.created_by;
  end if;

  for v_recipient_id in
    select public.get_special_report_action_recipient_ids(
      coalesce(public._event_notification_cadet_id(new.id), new.created_by)
    )
  loop
    perform public.dispatch_notification(
      v_recipient_id,
      'event.action_required',
      'Event escalated: ' || new.title,
      'Event status changed to under review.',
      v_link,
      'event.action_required:status:' || new.id::text || ':' || v_recipient_id::text,
      jsonb_build_object('event_id', new.id, 'status', new.status)
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_special_report_insert on public.special_reports;
create trigger trg_notify_on_special_report_insert
after insert on public.special_reports
for each row execute function public.notify_on_special_report_insert();

drop trigger if exists trg_notify_on_special_report_reviewed on public.special_reports;
create trigger trg_notify_on_special_report_reviewed
after update of status on public.special_reports
for each row execute function public.notify_on_special_report_reviewed();

drop trigger if exists trg_notify_on_event_insert on public.events;
create trigger trg_notify_on_event_insert
after insert on public.events
for each row execute function public.notify_on_event_insert();

drop trigger if exists trg_notify_on_event_status_change on public.events;
create trigger trg_notify_on_event_status_change
after update of status on public.events
for each row execute function public.notify_on_event_status_change();

-- ---------------------------------------------------------------------------
-- 6. Year-close preflight — real open events / special reports
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
    and sr.status in ('submitted', 'under_review')
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
      '/events?report=' || sr.id::text as href,
      p.company_id
    from public.special_reports sr
    join public.profiles p on p.id = sr.submitter_cadet_id
    where sr.school_year = p_school_year
      and sr.status in ('submitted', 'under_review')
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

-- ---------------------------------------------------------------------------
-- 7. Grants
-- ---------------------------------------------------------------------------

grant execute on function public._events_can_manage() to authenticated;
grant execute on function public._events_can_read(uuid) to authenticated;
grant execute on function public._special_reports_can_submit() to authenticated;
grant execute on function public._special_reports_can_read(uuid) to authenticated;
grant execute on function public.get_special_report_action_recipient_ids(uuid) to authenticated;
grant execute on function public.submit_special_report(text, text, timestamptz, text, uuid) to authenticated;
grant execute on function public.create_event(text, text) to authenticated;
grant execute on function public.update_event_status(uuid, text, text) to authenticated;
grant execute on function public.update_event_details(uuid, text, text) to authenticated;
grant execute on function public.link_filings_to_event(uuid, uuid[], uuid[], uuid[], uuid[]) to authenticated;
grant execute on function public.review_special_report(uuid, text, text, uuid) to authenticated;
grant execute on function public.carry_forward_event(uuid, text) to authenticated;
