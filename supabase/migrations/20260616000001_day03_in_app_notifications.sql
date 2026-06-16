-- Day 03: In-app notifications foundation

-- ---------------------------------------------------------------------------
-- 1. Event taxonomy registry
-- ---------------------------------------------------------------------------

create table if not exists public.notification_event_types (
  code text primary key,
  category text not null,
  title_template text,
  description text
);

insert into public.notification_event_types (code, category, title_template, description) values
  ('report.submitted', 'new_report', 'New report filed', 'A report was submitted against you.'),
  ('report.final_approved', 'status_change', 'Report approved', 'A report was final-approved.'),
  ('report.rejected', 'status_change', 'Report rejected', 'A report you submitted was rejected.'),
  ('report.kickback', 'status_change', 'Report returned', 'A report you submitted was returned for revision.'),
  ('appeal.final_approved', 'status_change', 'Appeal granted', 'Your appeal was approved.'),
  ('appeal.rejected', 'status_change', 'Appeal denied', 'Your appeal was rejected.'),
  ('tour.added', 'tour_change', 'Added to ED Tour Sheet', 'You were added to the ED Tour Sheet.'),
  ('tour.removed', 'tour_change', 'Removed from ED Tour Sheet', 'You were removed from the ED Tour Sheet.'),
  ('conduct.changed', 'conduct_change', 'Conduct status changed', 'Your conduct level changed.'),
  ('probation.changed', 'conduct_change', 'Probation status changed', 'Your probation status changed.'),
  ('oversight.report_submitted', 'new_report', 'Cadet report filed', 'A cadet under your oversight received a new report.'),
  ('oversight.tour_changed', 'tour_change', 'Cadet tour sheet change', 'A cadet under your oversight had a tour sheet change.'),
  ('oversight.conduct_changed', 'conduct_change', 'Cadet conduct change', 'A cadet under your oversight had a conduct or probation change.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 2. In-app storage
-- ---------------------------------------------------------------------------

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null references public.notification_event_types (code),
  title text not null,
  body text not null,
  link_url text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notifications_feed
  on public.user_notifications (user_id, created_at desc);

create index if not exists idx_user_notifications_unread
  on public.user_notifications (user_id)
  where read_at is null;

create table if not exists public.in_app_notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null references public.notification_event_types (code),
  title text not null,
  body text not null,
  link_url text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_in_app_notification_queue_pending
  on public.in_app_notification_queue (user_id, created_at)
  where processed_at is null;

-- Extend notification_queue for idempotent email enqueue
alter table public.notification_queue
  add column if not exists idempotency_key text unique;

-- ---------------------------------------------------------------------------
-- 3. User preferences extensions
-- ---------------------------------------------------------------------------

alter table public.user_preferences
  add column if not exists digest_frequency text not null default 'daily',
  add column if not exists digest_time text not null default '06:00',
  add column if not exists in_app_new_report public.notification_frequency not null default 'immediate',
  add column if not exists in_app_status_change public.notification_frequency not null default 'immediate',
  add column if not exists in_app_tour_change public.notification_frequency not null default 'immediate',
  add column if not exists in_app_conduct_change public.notification_frequency not null default 'immediate',
  add column if not exists in_app_team_alert public.notification_frequency not null default 'immediate',
  add column if not exists email_tour_change public.notification_frequency not null default 'immediate',
  add column if not exists email_conduct_change public.notification_frequency not null default 'immediate';

-- ---------------------------------------------------------------------------
-- 4. Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.get_notification_preference_category(p_event_type text)
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select category from public.notification_event_types where code = p_event_type;
$$;

create or replace function public.resolve_in_app_frequency(
  p_user_id uuid,
  p_event_type text
)
returns public.notification_frequency
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_category text;
  v_prefs public.user_preferences;
begin
  select * into v_prefs
  from public.get_or_create_preferences(p_user_id)
  limit 1;

  v_category := public.get_notification_preference_category(p_event_type);
  if v_category is null and p_event_type = 'team_alert' then
    v_category := 'team_alert';
  end if;

  case v_category
    when 'new_report' then return v_prefs.in_app_new_report;
    when 'status_change' then return v_prefs.in_app_status_change;
    when 'tour_change' then return v_prefs.in_app_tour_change;
    when 'conduct_change' then return v_prefs.in_app_conduct_change;
    when 'team_alert' then return v_prefs.in_app_team_alert;
    else return 'off'::public.notification_frequency;
  end case;
end;
$$;

create or replace function public.resolve_email_frequency(
  p_user_id uuid,
  p_event_type text
)
returns public.notification_frequency
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_category text;
  v_prefs public.user_preferences;
begin
  select * into v_prefs
  from public.get_or_create_preferences(p_user_id)
  limit 1;

  v_category := public.get_notification_preference_category(p_event_type);
  if v_category is null and p_event_type = 'team_alert' then
    v_category := 'team_alert';
  end if;

  case v_category
    when 'new_report' then return v_prefs.email_new_report;
    when 'status_change' then return v_prefs.email_status_change;
    when 'tour_change' then return coalesce(v_prefs.email_tour_change,
      case when v_prefs.email_tour_reminder then 'immediate'::public.notification_frequency
           else 'off'::public.notification_frequency end);
    when 'conduct_change' then return v_prefs.email_conduct_change;
    when 'team_alert' then return v_prefs.email_team_alert;
    else return 'off'::public.notification_frequency;
  end case;
end;
$$;

create or replace function public.get_oversight_staff_ids(p_cadet_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct staff_id
  from public.cadet_oversight_assignments
  where cadet_id = p_cadet_id
    and is_active = true
    and staff_id is not null;
$$;

create or replace function public.format_profile_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(p.first_name || ' ' || p.last_name, 'Unknown')
  from public.profiles p
  where p.id = p_user_id;
$$;

create or replace function public.get_latest_report_action_comment(p_report_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select al.comment
  from public.approval_log al
  where al.report_id = p_report_id
  order by al.created_at desc nulls last
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- 5. Dispatchers
-- ---------------------------------------------------------------------------

create or replace function public.dispatch_notification(
  p_user_id uuid,
  p_event_type text,
  p_title text,
  p_body text,
  p_link_url text,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_frequency public.notification_frequency;
  v_archived boolean;
begin
  if p_user_id is null then
    return;
  end if;

  if not exists (select 1 from public.notification_event_types where code = p_event_type) then
    raise exception 'Unknown notification event type: %', p_event_type;
  end if;

  select coalesce(p.archived, false) into v_archived
  from public.profiles p
  where p.id = p_user_id;

  if v_archived then
    return;
  end if;

  v_frequency := public.resolve_in_app_frequency(p_user_id, p_event_type);

  if v_frequency = 'off'::public.notification_frequency then
    return;
  elsif v_frequency = 'immediate'::public.notification_frequency then
    insert into public.user_notifications (
      user_id, event_type, title, body, link_url, metadata, idempotency_key
    ) values (
      p_user_id, p_event_type, p_title, p_body, p_link_url, coalesce(p_metadata, '{}'::jsonb), p_idempotency_key
    )
    on conflict (idempotency_key) do nothing;
  elsif v_frequency = 'digest'::public.notification_frequency then
    insert into public.in_app_notification_queue (
      user_id, event_type, title, body, link_url, metadata, idempotency_key
    ) values (
      p_user_id, p_event_type, p_title, p_body, p_link_url, coalesce(p_metadata, '{}'::jsonb), p_idempotency_key
    )
    on conflict (idempotency_key) do nothing;
  end if;
end;
$$;

create or replace function public.enqueue_email_notification(
  p_user_id uuid,
  p_event_type text,
  p_subject text,
  p_message text,
  p_link_url text default null,
  p_idempotency_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_frequency public.notification_frequency;
  v_archived boolean;
  v_key text;
begin
  if p_user_id is null then
    return;
  end if;

  v_key := coalesce(
    p_idempotency_key,
    'email:' || p_event_type || ':' || p_user_id::text || ':' || md5(p_subject || coalesce(p_message, '') || coalesce(p_link_url, ''))
  );

  select coalesce(p.archived, false) into v_archived
  from public.profiles p
  where p.id = p_user_id;

  if v_archived then
    return;
  end if;

  if p_event_type in (select code from public.notification_event_types) then
    v_frequency := public.resolve_email_frequency(p_user_id, p_event_type);
  else
    -- Legacy event types (e.g. team_alert) map to team_alert category
    v_frequency := public.resolve_email_frequency(p_user_id, 'team_alert');
  end if;

  if v_frequency = 'off'::public.notification_frequency then
    return;
  elsif v_frequency = 'immediate'::public.notification_frequency then
    -- Immediate email delivery is handled by app layer; queue with null processed_at
    insert into public.notification_queue (user_id, event_type, subject, message, link_url, idempotency_key)
    values (p_user_id, p_event_type, p_subject, p_message, p_link_url, v_key)
    on conflict (idempotency_key) do nothing;
  elsif v_frequency = 'digest'::public.notification_frequency then
    insert into public.notification_queue (user_id, event_type, subject, message, link_url, idempotency_key)
    values (p_user_id, p_event_type, p_subject, p_message, p_link_url, v_key)
    on conflict (idempotency_key) do nothing;
  end if;
end;
$$;

create or replace function public.fan_out_oversight_notifications(
  p_cadet_id uuid,
  p_event_type text,
  p_title text,
  p_body text,
  p_link_url text,
  p_idempotency_prefix text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff_id uuid;
begin
  for v_staff_id in select public.get_oversight_staff_ids(p_cadet_id)
  loop
    perform public.dispatch_notification(
      v_staff_id,
      p_event_type,
      p_title,
      p_body,
      p_link_url,
      p_idempotency_prefix || ':' || v_staff_id::text,
      p_metadata
    );
  end loop;
end;
$$;

create or replace function public.process_in_app_notification_digest()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_processed integer := 0;
  v_now timestamptz := now();
  v_current_time text;
begin
  v_current_time := to_char(v_now at time zone 'UTC', 'HH24:MI');

  for v_row in
    select q.*, up.digest_frequency, up.digest_time
    from public.in_app_notification_queue q
    join public.user_preferences up on up.user_id = q.user_id
    where q.processed_at is null
  loop
    if v_row.digest_frequency = 'hourly'
       and v_row.created_at <= v_now - interval '1 hour' then
      null;
    elsif v_row.digest_frequency = '30min'
       and v_row.created_at <= v_now - interval '30 minutes' then
      null;
    elsif v_row.digest_frequency = 'daily'
       and (
         v_current_time = v_row.digest_time
         or v_row.created_at <= date_trunc('day', v_now)
       ) then
      null;
    else
      continue;
    end if;

    insert into public.user_notifications (
      user_id, event_type, title, body, link_url, metadata, idempotency_key
    ) values (
      v_row.user_id,
      v_row.event_type,
      v_row.title,
      v_row.body,
      v_row.link_url,
      v_row.metadata,
      'digest:' || v_row.idempotency_key
    )
    on conflict (idempotency_key) do nothing;

    update public.in_app_notification_queue
    set processed_at = v_now
    where id = v_row.id;

    v_processed := v_processed + 1;
  end loop;

  return v_processed;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Feed RPCs
-- ---------------------------------------------------------------------------

create or replace function public.list_user_notifications(
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  event_type text,
  title text,
  body text,
  link_url text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.id,
    n.event_type,
    n.title,
    n.body,
    n.link_url,
    n.metadata,
    n.read_at,
    n.created_at
  from public.user_notifications n
  where n.user_id = auth.uid()
  order by n.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

create or replace function public.get_unread_notification_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.user_notifications n
  where n.user_id = auth.uid()
    and n.read_at is null;
$$;

create or replace function public.mark_notification_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_notifications
  set read_at = now()
  where id = p_id
    and user_id = auth.uid()
    and read_at is null;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_notifications
  set read_at = now()
  where user_id = auth.uid()
    and read_at is null;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Domain producers
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_report_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject_name text;
  v_title text;
  v_body text;
  v_link text;
begin
  v_subject_name := public.format_profile_name(new.subject_cadet_id);
  v_link := '/report/' || new.id::text;
  v_title := 'New report filed';
  v_body := 'A misconduct report was submitted against you.';

  perform public.dispatch_notification(
    new.subject_cadet_id,
    'report.submitted',
    v_title,
    v_body,
    v_link,
    'report.submitted:' || new.id::text || ':subject:' || new.subject_cadet_id::text,
    jsonb_build_object('report_id', new.id, 'cadet_id', new.subject_cadet_id)
  );

  v_title := 'Cadet report filed';
  v_body := v_subject_name || ' received a new misconduct report.';

  perform public.fan_out_oversight_notifications(
    new.subject_cadet_id,
    'oversight.report_submitted',
    v_title,
    v_body,
    v_link,
    'oversight.report_submitted:' || new.id::text,
    jsonb_build_object('report_id', new.id, 'cadet_id', new.subject_cadet_id)
  );

  return new;
end;
$$;

create or replace function public.notify_on_report_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comment text;
  v_link text;
  v_subject_name text;
  v_event_type text;
  v_title text;
  v_body text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  v_link := '/report/' || new.id::text;
  v_subject_name := public.format_profile_name(new.subject_cadet_id);
  v_comment := public.get_latest_report_action_comment(new.id);

  if new.status = 'completed' then
    v_event_type := 'report.final_approved';
    v_title := 'Report approved';
    v_body := 'A report involving ' || v_subject_name || ' was final-approved.';
    if v_comment is not null and v_comment <> '' then
      v_body := v_body || ' Comment: ' || v_comment;
    end if;

    perform public.dispatch_notification(
      new.submitted_by,
      v_event_type,
      v_title,
      v_body,
      v_link,
      v_event_type || ':' || new.id::text || ':submitter:' || new.submitted_by::text,
      jsonb_build_object('report_id', new.id)
    );

    if new.subject_cadet_id <> new.submitted_by then
      perform public.dispatch_notification(
        new.subject_cadet_id,
        v_event_type,
        v_title,
        'A report against you was final-approved.',
        v_link,
        v_event_type || ':' || new.id::text || ':subject:' || new.subject_cadet_id::text,
        jsonb_build_object('report_id', new.id)
      );
    end if;

  elsif new.status = 'rejected' then
    v_event_type := 'report.rejected';
    v_title := 'Report rejected';
    v_body := 'A report you submitted was rejected.';
    if v_comment is not null and v_comment <> '' then
      v_body := v_body || ' Reason: ' || v_comment;
    end if;

    perform public.dispatch_notification(
      new.submitted_by,
      v_event_type,
      v_title,
      v_body,
      v_link,
      v_event_type || ':' || new.id::text || ':submitter:' || new.submitted_by::text,
      jsonb_build_object('report_id', new.id)
    );

  elsif new.status = 'needs_revision' then
    v_event_type := 'report.kickback';
    v_title := 'Report returned for revision';
    v_body := 'A report you submitted was returned for revision.';
    if v_comment is not null and v_comment <> '' then
      v_body := v_body || ' Reason: ' || v_comment;
    end if;

    perform public.dispatch_notification(
      new.submitted_by,
      v_event_type,
      v_title,
      v_body,
      v_link,
      v_event_type || ':' || new.id::text || ':submitter:' || new.submitted_by::text,
      jsonb_build_object('report_id', new.id)
    );
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_appeal_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_type text;
  v_title text;
  v_body text;
  v_link text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  v_link := '/report/' || new.report_id::text;

  if new.status = 'approved' then
    v_event_type := 'appeal.final_approved';
    v_title := 'Appeal granted';
    v_body := 'Your appeal was approved.';
    if new.final_comment is not null and new.final_comment <> '' then
      v_body := v_body || ' Comment: ' || new.final_comment;
    end if;
  elsif new.status in ('rejected_final', 'rejected_by_issuer', 'rejected_by_chain') then
    v_event_type := 'appeal.rejected';
    v_title := 'Appeal denied';
    v_body := 'Your appeal was rejected.';
    if coalesce(new.final_comment, new.chain_comment, new.issuer_comment) is not null then
      v_body := v_body || ' Comment: ' || coalesce(new.final_comment, new.chain_comment, new.issuer_comment);
    end if;
  else
    return new;
  end if;

  perform public.dispatch_notification(
    new.appealing_cadet_id,
    v_event_type,
    v_title,
    v_body,
    v_link,
    v_event_type || ':' || new.id::text || ':' || new.appealing_cadet_id::text,
    jsonb_build_object('appeal_id', new.id, 'report_id', new.report_id)
  );

  return new;
end;
$$;

create or replace function public.notify_on_cadet_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cadet_name text;
  v_link text;
  v_title text;
  v_body text;
begin
  v_cadet_name := public.format_profile_name(new.profile_id);
  v_link := '/profile/' || new.profile_id::text;

  if old.cached_tour_balance is distinct from new.cached_tour_balance then
    if coalesce(old.cached_tour_balance, 0) = 0 and coalesce(new.cached_tour_balance, 0) > 0 then
      v_title := 'Added to ED Tour Sheet';
      v_body := 'You were added to the ED Tour Sheet with ' || new.cached_tour_balance::text || ' tour(s).';

      perform public.dispatch_notification(
        new.profile_id,
        'tour.added',
        v_title,
        v_body,
        v_link,
        'tour.added:' || new.profile_id::text || ':' || new.cached_tour_balance::text,
        jsonb_build_object('cadet_id', new.profile_id, 'tour_balance', new.cached_tour_balance)
      );

      perform public.fan_out_oversight_notifications(
        new.profile_id,
        'oversight.tour_changed',
        'Cadet added to tour sheet',
        v_cadet_name || ' was added to the ED Tour Sheet (' || new.cached_tour_balance::text || ' tour(s)).',
        v_link,
        'oversight.tour.added:' || new.profile_id::text || ':' || new.cached_tour_balance::text,
        jsonb_build_object('cadet_id', new.profile_id, 'tour_balance', new.cached_tour_balance)
      );

    elsif coalesce(old.cached_tour_balance, 0) > 0 and coalesce(new.cached_tour_balance, 0) = 0 then
      v_title := 'Removed from ED Tour Sheet';
      v_body := 'You were removed from the ED Tour Sheet.';

      perform public.dispatch_notification(
        new.profile_id,
        'tour.removed',
        v_title,
        v_body,
        v_link,
        'tour.removed:' || new.profile_id::text || ':0',
        jsonb_build_object('cadet_id', new.profile_id, 'previous_balance', old.cached_tour_balance)
      );

      perform public.fan_out_oversight_notifications(
        new.profile_id,
        'oversight.tour_changed',
        'Cadet removed from tour sheet',
        v_cadet_name || ' was removed from the ED Tour Sheet.',
        v_link,
        'oversight.tour.removed:' || new.profile_id::text || ':0',
        jsonb_build_object('cadet_id', new.profile_id, 'previous_balance', old.cached_tour_balance)
      );
    end if;
  end if;

  if old.conduct_status is distinct from new.conduct_status then
    perform public.dispatch_notification(
      new.profile_id,
      'conduct.changed',
      'Conduct status changed',
      'Your conduct status changed to ' || coalesce(new.conduct_status, 'Unknown') || '.',
      v_link,
      'conduct.changed:' || new.profile_id::text || ':' || coalesce(new.conduct_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'conduct_status', new.conduct_status)
    );

    perform public.fan_out_oversight_notifications(
      new.profile_id,
      'oversight.conduct_changed',
      'Cadet conduct changed',
      v_cadet_name || '''s conduct status changed to ' || coalesce(new.conduct_status, 'Unknown') || '.',
      v_link,
      'oversight.conduct.changed:' || new.profile_id::text || ':' || coalesce(new.conduct_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'conduct_status', new.conduct_status)
    );
  end if;

  if old.probation_status is distinct from new.probation_status then
    perform public.dispatch_notification(
      new.profile_id,
      'probation.changed',
      'Probation status changed',
      'Your probation status changed to ' || coalesce(new.probation_status, 'None') || '.',
      v_link,
      'probation.changed:' || new.profile_id::text || ':' || coalesce(new.probation_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'probation_status', new.probation_status)
    );

    perform public.fan_out_oversight_notifications(
      new.profile_id,
      'oversight.conduct_changed',
      'Cadet probation changed',
      v_cadet_name || '''s probation status changed to ' || coalesce(new.probation_status, 'None') || '.',
      v_link,
      'oversight.probation.changed:' || new.profile_id::text || ':' || coalesce(new.probation_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'probation_status', new.probation_status)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_report_insert on public.demerit_reports;
create trigger trg_notify_on_report_insert
after insert on public.demerit_reports
for each row execute function public.notify_on_report_insert();

drop trigger if exists trg_notify_on_report_status_change on public.demerit_reports;
create trigger trg_notify_on_report_status_change
after update of status on public.demerit_reports
for each row execute function public.notify_on_report_status_change();

drop trigger if exists trg_notify_on_appeal_status_change on public.appeals;
create trigger trg_notify_on_appeal_status_change
after update of status on public.appeals
for each row execute function public.notify_on_appeal_status_change();

drop trigger if exists trg_notify_on_cadet_profile_change on public.cadet_profiles;
create trigger trg_notify_on_cadet_profile_change
after update of cached_tour_balance, conduct_status, probation_status on public.cadet_profiles
for each row execute function public.notify_on_cadet_profile_change();

-- Coach email notifications via privileged enqueue
create or replace function public.notify_coaches_on_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_cadet record;
  v_sport_id uuid;
  v_coach record;
begin
  select p.first_name, p.last_name, cp.sport_fall, cp.sport_winter, cp.sport_spring
  into v_cadet
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  where p.id = new.subject_cadet_id;

  if not found then
    return new;
  end if;

  if v_cadet.sport_fall is not null and v_cadet.sport_fall != 'None' then
    select id into v_sport_id from public.sports where name = v_cadet.sport_fall and season = 'Fall';
    if v_sport_id is not null then
      for v_coach in select coach_id from public.sport_coaches where sport_id = v_sport_id loop
        perform public.enqueue_email_notification(
          v_coach.coach_id,
          'team_alert',
          'Misconduct Report: ' || v_cadet.last_name,
          'A report has been filed against ' || v_cadet.first_name || ' ' || v_cadet.last_name || ' (' || v_cadet.sport_fall || ').',
          '/report/' || new.id,
          'email.team_alert:' || new.id::text || ':' || v_coach.coach_id::text
        );
      end loop;
    end if;
  end if;

  return new;
end;
$function$;

-- ---------------------------------------------------------------------------
-- 8. RLS
-- ---------------------------------------------------------------------------

alter table public.notification_event_types enable row level security;
alter table public.user_notifications enable row level security;
alter table public.in_app_notification_queue enable row level security;

grant select on public.notification_event_types to authenticated;
grant select, update on public.user_notifications to authenticated;
grant select on public.in_app_notification_queue to authenticated;
grant all on public.notification_event_types to service_role;
grant all on public.user_notifications to service_role;
grant all on public.in_app_notification_queue to service_role;

create policy "Authenticated users can read event types"
on public.notification_event_types
for select
to authenticated
using (true);

create policy "Users can view own notifications"
on public.user_notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can mark own notifications read"
on public.user_notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can view own in-app digest queue"
on public.in_app_notification_queue
for select
to authenticated
using (user_id = (select auth.uid()));

grant execute on function public.list_user_notifications(integer, integer) to authenticated;
grant execute on function public.get_unread_notification_count() to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.enqueue_email_notification(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.process_in_app_notification_digest() to service_role;
