-- Day 04: Email expansion, per-cadet preferences, delivery tracking, dual-channel dispatch

-- ---------------------------------------------------------------------------
-- 1. Enums and schema extensions
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.email_queue_status as enum ('pending', 'sent', 'failed', 'dead_letter');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.email_delivery_mode as enum ('normal', 'development_redirect');
exception when duplicate_object then null;
end $$;

alter table public.notification_queue
  add column if not exists status public.email_queue_status not null default 'pending',
  add column if not exists attempt_count integer not null default 0,
  add column if not exists last_error text,
  add column if not exists resend_id text,
  add column if not exists intended_email text,
  add column if not exists next_retry_at timestamptz,
  add column if not exists delivery_mode public.email_delivery_mode,
  add column if not exists delivery_frequency public.notification_frequency;

create index if not exists idx_notification_queue_pending
  on public.notification_queue (created_at)
  where status = 'pending';

-- Backfill delivery_frequency for existing rows
update public.notification_queue
set delivery_frequency = 'immediate'::public.notification_frequency
where delivery_frequency is null;

-- Per-cadet oversight preference overrides
create table if not exists public.cadet_notification_preferences (
  staff_id uuid not null references public.profiles (id) on delete cascade,
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in (
    'new_report', 'status_change', 'tour_change', 'conduct_change', 'team_alert'
  )),
  email_frequency public.notification_frequency,
  in_app_frequency public.notification_frequency,
  updated_at timestamptz not null default now(),
  primary key (staff_id, cadet_id, category)
);

create index if not exists idx_cadet_notification_prefs_staff
  on public.cadet_notification_preferences (staff_id);

-- Email delivery audit log
create table if not exists public.email_delivery_log (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references public.notification_queue (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  intended_email text,
  actual_email text,
  profile_name text,
  subject text,
  status text not null,
  resend_id text,
  error_message text,
  delivery_mode public.email_delivery_mode,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_delivery_log_created
  on public.email_delivery_log (created_at desc);

-- sport_coaches alert toggle (referenced by preferences UI)
alter table public.sport_coaches
  add column if not exists enable_alerts boolean not null default true;

-- Development mode settings
insert into public.system_settings (key, value, description) values
  ('email_development_mode', false, 'When enabled, all outbound emails redirect to the address in email_development_forward_to'),
  ('email_development_forward_to', false, '')
on conflict (key) do nothing;

-- Future event stubs (Days 08, 11–12)
insert into public.notification_event_types (code, category, title_template, description) values
  ('team_alert', 'team_alert', 'Sports team alert', 'Alert regarding an athlete on a team you coach.'),
  ('workorder.submitted', 'new_report', 'Work order submitted', 'A maintenance work order was submitted.'),
  ('workorder.forwarded', 'status_change', 'Work order forwarded', 'A work order was forwarded to maintenance.'),
  ('parent.invite', 'new_report', 'Parent portal invite', 'Invitation to access the parent portal.'),
  ('parent.summary_forwarded', 'status_change', 'Summary forwarded', 'A cadet summary was forwarded to parents.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Preference resolution with per-cadet hierarchy
-- ---------------------------------------------------------------------------

drop function if exists public.resolve_in_app_frequency(uuid, text);
drop function if exists public.resolve_email_frequency(uuid, text);

create or replace function public.resolve_in_app_frequency(
  p_user_id uuid,
  p_event_type text,
  p_cadet_id uuid default null
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
  v_override public.notification_frequency;
begin
  select * into v_prefs
  from public.get_or_create_preferences(p_user_id)
  limit 1;

  v_category := public.get_notification_preference_category(p_event_type);
  if v_category is null and p_event_type = 'team_alert' then
    v_category := 'team_alert';
  end if;

  if p_cadet_id is not null
     and v_category is not null
     and p_event_type like 'oversight.%' then
    select cnp.in_app_frequency into v_override
    from public.cadet_notification_preferences cnp
    where cnp.staff_id = p_user_id
      and cnp.cadet_id = p_cadet_id
      and cnp.category = v_category
      and cnp.in_app_frequency is not null;

    if v_override is not null then
      return v_override;
    end if;
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
  p_event_type text,
  p_cadet_id uuid default null
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
  v_override public.notification_frequency;
begin
  select * into v_prefs
  from public.get_or_create_preferences(p_user_id)
  limit 1;

  v_category := public.get_notification_preference_category(p_event_type);
  if v_category is null and p_event_type = 'team_alert' then
    v_category := 'team_alert';
  end if;

  if p_cadet_id is not null
     and v_category is not null
     and p_event_type like 'oversight.%' then
    select cnp.email_frequency into v_override
    from public.cadet_notification_preferences cnp
    where cnp.staff_id = p_user_id
      and cnp.cadet_id = p_cadet_id
      and cnp.category = v_category
      and cnp.email_frequency is not null;

    if v_override is not null then
      return v_override;
    end if;
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

create or replace function public.filter_users_by_email_preference(
  p_user_ids uuid[],
  p_category text
)
returns uuid[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result uuid[] := '{}';
  v_uid uuid;
  v_event text;
  v_freq public.notification_frequency;
begin
  v_event := case p_category
    when 'new_report' then 'report.submitted'
    when 'status_change' then 'report.final_approved'
    when 'tour_change' then 'tour.added'
    when 'conduct_change' then 'conduct.changed'
    when 'team_alert' then 'team_alert'
    when 'green_sheet' then 'report.submitted'
    else null
  end;

  if v_event is null and p_category <> 'green_sheet' then
    return p_user_ids;
  end if;

  foreach v_uid in array p_user_ids
  loop
    if p_category = 'green_sheet' then
      if exists (
        select 1 from public.user_preferences up
        where up.user_id = v_uid and up.email_green_sheet = true
      ) then
        v_result := array_append(v_result, v_uid);
      end if;
    else
      v_freq := public.resolve_email_frequency(v_uid, v_event);
      if v_freq in ('immediate'::public.notification_frequency, 'digest'::public.notification_frequency) then
        v_result := array_append(v_result, v_uid);
      end if;
    end if;
  end loop;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Dual-channel dispatchers
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
  v_cadet_id uuid;
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

  v_cadet_id := nullif(p_metadata->>'cadet_id', '')::uuid;
  v_frequency := public.resolve_in_app_frequency(p_user_id, p_event_type, v_cadet_id);

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
  p_idempotency_key text default null,
  p_cadet_id uuid default null
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
    v_frequency := public.resolve_email_frequency(p_user_id, p_event_type, p_cadet_id);
  else
    v_frequency := public.resolve_email_frequency(p_user_id, 'team_alert', p_cadet_id);
  end if;

  if v_frequency = 'off'::public.notification_frequency then
    return;
  end if;

  insert into public.notification_queue (
    user_id, event_type, subject, message, link_url, idempotency_key, delivery_frequency, status
  ) values (
    p_user_id, p_event_type, p_subject, p_message, p_link_url, v_key, v_frequency, 'pending'::public.email_queue_status
  )
  on conflict (idempotency_key) do nothing;
end;
$$;

create or replace function public.dispatch_user_notification(
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
  v_cadet_id uuid;
begin
  v_cadet_id := nullif(p_metadata->>'cadet_id', '')::uuid;

  perform public.dispatch_notification(
    p_user_id, p_event_type, p_title, p_body, p_link_url, p_idempotency_key, p_metadata
  );

  perform public.enqueue_email_notification(
    p_user_id,
    p_event_type,
    p_title,
    p_body,
    p_link_url,
    'email:' || p_idempotency_key,
    v_cadet_id
  );
end;
$$;

create or replace function public.fan_out_oversight_user_notifications(
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
  v_meta jsonb;
begin
  v_meta := coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('cadet_id', p_cadet_id);

  for v_staff_id in select public.get_oversight_staff_ids(p_cadet_id)
  loop
    perform public.dispatch_user_notification(
      v_staff_id,
      p_event_type,
      p_title,
      p_body,
      p_link_url,
      p_idempotency_prefix || ':' || v_staff_id::text,
      v_meta
    );
  end loop;
end;
$$;

create or replace function public.fan_out_approver_user_notifications(
  p_report_id uuid,
  p_group_id uuid,
  p_subject_cadet_id uuid,
  p_idempotency_prefix text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject_name text;
  v_title text;
  v_body text;
  v_link text;
  v_staff_id uuid;
begin
  if p_group_id is null then
    return;
  end if;

  v_subject_name := public.format_profile_name(p_subject_cadet_id);
  v_link := '/report/' || p_report_id::text;
  v_title := 'Report pending approval';
  v_body := 'A report against ' || v_subject_name || ' is waiting for your approval.';

  for v_staff_id in
    select p.id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where r.approval_group_id = p_group_id
      and coalesce(p.archived, false) = false
  loop
    perform public.dispatch_user_notification(
      v_staff_id,
      'report.pending_approval',
      v_title,
      v_body,
      v_link,
      p_idempotency_prefix || ':' || p_group_id::text || ':' || v_staff_id::text,
      jsonb_build_object('report_id', p_report_id, 'approver_group_id', p_group_id)
    );
  end loop;
end;
$$;

-- Keep legacy fan_out names as aliases
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
begin
  perform public.fan_out_oversight_user_notifications(
    p_cadet_id, p_event_type, p_title, p_body, p_link_url, p_idempotency_prefix, p_metadata
  );
end;
$$;

create or replace function public.fan_out_approver_notifications(
  p_report_id uuid,
  p_group_id uuid,
  p_subject_cadet_id uuid,
  p_idempotency_prefix text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.fan_out_approver_user_notifications(
    p_report_id, p_group_id, p_subject_cadet_id, p_idempotency_prefix
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Email queue processor RPCs
-- ---------------------------------------------------------------------------

create or replace function public.is_email_digest_ready(
  p_created_at timestamptz,
  p_digest_frequency text,
  p_digest_time text,
  p_now timestamptz default now()
)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  v_current_time text;
begin
  v_current_time := to_char(p_now at time zone 'UTC', 'HH24:MI');

  if p_digest_frequency = 'hourly' and p_created_at <= p_now - interval '1 hour' then
    return true;
  elsif p_digest_frequency = '30min' and p_created_at <= p_now - interval '30 minutes' then
    return true;
  elsif p_digest_frequency = 'daily' and (
    v_current_time = p_digest_time
    or p_created_at <= date_trunc('day', p_now)
  ) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.list_pending_email_notifications(p_batch_size integer default 50)
returns table (
  queue_id uuid,
  user_id uuid,
  event_type text,
  subject text,
  message text,
  link_url text,
  idempotency_key text,
  delivery_frequency public.notification_frequency,
  profile_name text,
  is_digest_batch boolean,
  digest_item_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row record;
  v_digest_ids uuid[];
  v_limit integer := greatest(coalesce(p_batch_size, 50), 1);
  v_count integer := 0;
begin
  -- Immediate notifications
  for v_row in
    select q.id, q.user_id, q.event_type, q.subject, q.message, q.link_url,
           q.idempotency_key, q.delivery_frequency
    from public.notification_queue q
    where q.status = 'pending'::public.email_queue_status
      and q.delivery_frequency = 'immediate'::public.notification_frequency
      and (q.next_retry_at is null or q.next_retry_at <= v_now)
    order by q.created_at
    limit v_limit
  loop
    queue_id := v_row.id;
    user_id := v_row.user_id;
    event_type := v_row.event_type;
    subject := v_row.subject;
    message := v_row.message;
    link_url := v_row.link_url;
    idempotency_key := v_row.idempotency_key;
    delivery_frequency := v_row.delivery_frequency;
    profile_name := public.format_profile_name(v_row.user_id);
    is_digest_batch := false;
    digest_item_ids := null;
    return next;
    v_count := v_count + 1;
    exit when v_count >= v_limit;
  end loop;

  if v_count >= v_limit then
    return;
  end if;

  -- Digest batches (one row per user)
  for v_row in
    select q.user_id,
           array_agg(q.id order by q.created_at) as item_ids,
           count(*)::integer as item_count
    from public.notification_queue q
    join public.user_preferences up on up.user_id = q.user_id
    where q.status = 'pending'::public.email_queue_status
      and q.delivery_frequency = 'digest'::public.notification_frequency
      and (q.next_retry_at is null or q.next_retry_at <= v_now)
      and public.is_email_digest_ready(q.created_at, up.digest_frequency, up.digest_time, v_now)
    group by q.user_id
    order by min(q.created_at)
    limit greatest(v_limit - v_count, 1)
  loop
    queue_id := v_row.item_ids[1];
    user_id := v_row.user_id;
    event_type := 'digest';
    subject := 'CadetFlow Digest (' || v_row.item_count::text || ' notification' ||
      case when v_row.item_count = 1 then '' else 's' end || ')';
    message := (
      select string_agg(
        '• ' || q2.subject || ': ' || q2.message ||
        case when q2.link_url is not null then ' [' || q2.link_url || ']' else '' end,
        E'\n' order by q2.created_at
      )
      from public.notification_queue q2
      where q2.id = any(v_row.item_ids)
    );
    link_url := null;
    idempotency_key := 'digest:' || v_row.user_id::text || ':' || md5(array_to_string(v_row.item_ids::text[], ','));
    delivery_frequency := 'digest'::public.notification_frequency;
    profile_name := public.format_profile_name(v_row.user_id);
    is_digest_batch := true;
    digest_item_ids := v_row.item_ids;
    return next;
  end loop;
end;
$$;

create or replace function public.mark_email_notification_sent(
  p_queue_ids uuid[],
  p_resend_id text,
  p_intended_email text,
  p_actual_email text,
  p_delivery_mode public.email_delivery_mode default 'normal',
  p_user_id uuid default null,
  p_profile_name text default null,
  p_subject text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  foreach v_id in array p_queue_ids
  loop
    update public.notification_queue
    set status = 'sent'::public.email_queue_status,
        processed_at = now(),
        resend_id = p_resend_id,
        intended_email = p_intended_email,
        delivery_mode = p_delivery_mode
    where id = v_id;
  end loop;

  insert into public.email_delivery_log (
    queue_id, user_id, intended_email, actual_email, profile_name,
    subject, status, resend_id, delivery_mode
  ) values (
    p_queue_ids[1], p_user_id, p_intended_email, p_actual_email, p_profile_name,
    p_subject, 'sent', p_resend_id, p_delivery_mode
  );
end;
$$;

create or replace function public.mark_email_notification_failed(
  p_queue_ids uuid[],
  p_error text,
  p_retriable boolean default true,
  p_intended_email text default null,
  p_user_id uuid default null,
  p_profile_name text default null,
  p_subject text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_attempts integer;
  v_max_attempts integer := 5;
  v_new_status public.email_queue_status;
  v_next_retry timestamptz;
begin
  foreach v_id in array p_queue_ids
  loop
    select attempt_count into v_attempts
    from public.notification_queue where id = v_id;

    v_attempts := coalesce(v_attempts, 0) + 1;

    if not p_retriable or v_attempts >= v_max_attempts then
      v_new_status := 'dead_letter'::public.email_queue_status;
      v_next_retry := null;
    else
      v_new_status := 'pending'::public.email_queue_status;
      v_next_retry := now() + (power(2, v_attempts) || ' minutes')::interval;
    end if;

    update public.notification_queue
    set status = v_new_status,
        attempt_count = v_attempts,
        last_error = p_error,
        next_retry_at = v_next_retry,
        intended_email = coalesce(p_intended_email, intended_email)
    where id = v_id;
  end loop;

  insert into public.email_delivery_log (
    queue_id, user_id, intended_email, actual_email, profile_name,
    subject, status, error_message
  ) values (
    p_queue_ids[1], p_user_id, p_intended_email, null, p_profile_name,
    p_subject, case when p_retriable then 'failed' else 'dead_letter' end, p_error
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Refactor domain producers to dual-channel
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

  perform public.dispatch_user_notification(
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

  perform public.fan_out_oversight_user_notifications(
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

  perform public.dispatch_user_notification(
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

      perform public.dispatch_user_notification(
        new.profile_id, 'tour.added', v_title, v_body, v_link,
        'tour.added:' || new.profile_id::text || ':' || new.cached_tour_balance::text,
        jsonb_build_object('cadet_id', new.profile_id, 'tour_balance', new.cached_tour_balance)
      );

      perform public.fan_out_oversight_user_notifications(
        new.profile_id, 'oversight.tour_changed',
        'Cadet added to tour sheet',
        v_cadet_name || ' was added to the ED Tour Sheet (' || new.cached_tour_balance::text || ' tour(s)).',
        v_link, 'oversight.tour.added:' || new.profile_id::text || ':' || new.cached_tour_balance::text,
        jsonb_build_object('cadet_id', new.profile_id, 'tour_balance', new.cached_tour_balance)
      );

    elsif coalesce(old.cached_tour_balance, 0) > 0 and coalesce(new.cached_tour_balance, 0) = 0 then
      v_title := 'Removed from ED Tour Sheet';
      v_body := 'You were removed from the ED Tour Sheet.';

      perform public.dispatch_user_notification(
        new.profile_id, 'tour.removed', v_title, v_body, v_link,
        'tour.removed:' || new.profile_id::text || ':0',
        jsonb_build_object('cadet_id', new.profile_id, 'previous_balance', old.cached_tour_balance)
      );

      perform public.fan_out_oversight_user_notifications(
        new.profile_id, 'oversight.tour_changed',
        'Cadet removed from tour sheet',
        v_cadet_name || ' was removed from the ED Tour Sheet.',
        v_link, 'oversight.tour.removed:' || new.profile_id::text || ':0',
        jsonb_build_object('cadet_id', new.profile_id, 'previous_balance', old.cached_tour_balance)
      );
    end if;
  end if;

  if old.conduct_status is distinct from new.conduct_status then
    perform public.dispatch_user_notification(
      new.profile_id, 'conduct.changed',
      'Conduct status changed',
      'Your conduct status changed to ' || coalesce(new.conduct_status, 'Unknown') || '.',
      v_link, 'conduct.changed:' || new.profile_id::text || ':' || coalesce(new.conduct_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'conduct_status', new.conduct_status)
    );

    perform public.fan_out_oversight_user_notifications(
      new.profile_id, 'oversight.conduct_changed',
      'Cadet conduct changed',
      v_cadet_name || '''s conduct status changed to ' || coalesce(new.conduct_status, 'Unknown') || '.',
      v_link, 'oversight.conduct.changed:' || new.profile_id::text || ':' || coalesce(new.conduct_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'conduct_status', new.conduct_status)
    );
  end if;

  if old.probation_status is distinct from new.probation_status then
    perform public.dispatch_user_notification(
      new.profile_id, 'probation.changed',
      'Probation status changed',
      'Your probation status changed to ' || coalesce(new.probation_status, 'None') || '.',
      v_link, 'probation.changed:' || new.profile_id::text || ':' || coalesce(new.probation_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'probation_status', new.probation_status)
    );

    perform public.fan_out_oversight_user_notifications(
      new.profile_id, 'oversight.conduct_changed',
      'Cadet probation changed',
      v_cadet_name || '''s probation status changed to ' || coalesce(new.probation_status, 'None') || '.',
      v_link, 'oversight.probation.changed:' || new.profile_id::text || ':' || coalesce(new.probation_status, 'null'),
      jsonb_build_object('cadet_id', new.profile_id, 'probation_status', new.probation_status)
    );
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_approval_log_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report record;
  v_link text;
  v_subject_name text;
  v_event_type text;
  v_title text;
  v_body text;
  v_action text;
begin
  v_action := lower(trim(new.action));

  select * into v_report from public.demerit_reports dr where dr.id = new.report_id;
  if not found then return new; end if;

  v_link := '/report/' || v_report.id::text;
  v_subject_name := public.format_profile_name(v_report.subject_cadet_id);

  if v_action in ('rejected') then
    v_event_type := 'report.rejected';
    v_title := 'Report rejected';
    v_body := 'A report you submitted was rejected.';
    if new.comment is not null and btrim(new.comment) <> '' then
      v_body := v_body || ' Reason: ' || new.comment;
    end if;

    perform public.dispatch_user_notification(
      v_report.submitted_by, v_event_type, v_title, v_body, v_link,
      v_event_type || ':' || v_report.id::text || ':submitter:' || v_report.submitted_by::text || ':log:' || new.id::text,
      jsonb_build_object('report_id', v_report.id, 'approval_log_id', new.id)
    );

  elsif v_action in ('needs_revision', 'kickback', 'kicked back for revision') then
    v_event_type := 'report.kickback';
    v_title := 'Report returned for revision';
    v_body := 'A report you submitted was returned for revision.';
    if new.comment is not null and btrim(new.comment) <> '' then
      v_body := v_body || ' Reason: ' || new.comment;
    end if;

    perform public.dispatch_user_notification(
      v_report.submitted_by, v_event_type, v_title, v_body, v_link,
      v_event_type || ':' || v_report.id::text || ':submitter:' || v_report.submitted_by::text || ':log:' || new.id::text,
      jsonb_build_object('report_id', v_report.id, 'approval_log_id', new.id)
    );

  elsif v_action = 'approved' and v_report.status = 'completed' then
    v_event_type := 'report.final_approved';
    v_title := 'Report approved';
    v_body := 'A report involving ' || v_subject_name || ' was final-approved.';
    if new.comment is not null and btrim(new.comment) <> '' then
      v_body := v_body || ' Comment: ' || new.comment;
    end if;

    perform public.dispatch_user_notification(
      v_report.submitted_by, v_event_type, v_title, v_body, v_link,
      v_event_type || ':' || v_report.id::text || ':submitter:' || v_report.submitted_by::text || ':log:' || new.id::text,
      jsonb_build_object('report_id', v_report.id, 'approval_log_id', new.id)
    );

    if v_report.subject_cadet_id <> v_report.submitted_by then
      perform public.dispatch_user_notification(
        v_report.subject_cadet_id, v_event_type, v_title,
        'A report against you was final-approved.', v_link,
        v_event_type || ':' || v_report.id::text || ':subject:' || v_report.subject_cadet_id::text || ':log:' || new.id::text,
        jsonb_build_object('report_id', v_report.id, 'approval_log_id', new.id)
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.notify_on_incident_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tac_id uuid;
  v_subject_name text;
  v_reporter_name text;
  v_link text;
  v_title text;
  v_body text;
begin
  if new.status <> 'pending' then return new; end if;

  v_subject_name := public.format_profile_name(new.subject_cadet_id);
  v_reporter_name := public.format_profile_name(new.reporter_id);
  v_link := '/incidents/' || new.id::text;
  v_title := 'Incident pending review';
  v_body := v_reporter_name || ' filed an incident report regarding ' || v_subject_name || '.';

  for v_tac_id in select public.get_incident_tac_recipient_ids(new.subject_cadet_id)
  loop
    if v_tac_id = new.reporter_id then continue; end if;

    perform public.dispatch_user_notification(
      v_tac_id, 'incident.pending_review', v_title, v_body, v_link,
      'incident.pending_review:' || new.id::text || ':' || v_tac_id::text,
      jsonb_build_object('incident_id', new.id, 'reporter_id', new.reporter_id, 'subject_cadet_id', new.subject_cadet_id)
    );
  end loop;

  return new;
end;
$$;

create or replace function public.notify_on_incident_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject_name text;
  v_link text;
  v_title text;
  v_body text;
  v_status_label text;
begin
  if old.status is not distinct from new.status then return new; end if;
  if new.status not in ('handled', 'converted') then return new; end if;
  if old.status in ('handled', 'converted') then return new; end if;

  v_subject_name := public.format_profile_name(new.subject_cadet_id);
  v_link := '/incidents/' || new.id::text;
  v_title := 'Incident report actioned';
  v_status_label := case when new.status = 'handled' then 'marked as handled' else 'converted to a demerit report' end;
  v_body := 'Your incident report regarding ' || v_subject_name || ' was ' || v_status_label || '.';
  if new.resolution_notes is not null and btrim(new.resolution_notes) <> '' then
    v_body := v_body || ' Notes: ' || new.resolution_notes;
  end if;

  perform public.dispatch_user_notification(
    new.reporter_id, 'incident.actioned', v_title, v_body, v_link,
    'incident.actioned:' || new.id::text || ':' || new.reporter_id::text || ':' || new.status,
    jsonb_build_object('incident_id', new.id, 'status', new.status, 'resolved_by', new.resolved_by)
  );

  return new;
end;
$$;

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
  v_title text;
  v_body text;
  v_link text;
  v_seasons text[] := array['Fall', 'Winter', 'Spring'];
  v_season text;
  v_sport_name text;
begin
  select p.first_name, p.last_name, cp.sport_fall, cp.sport_winter, cp.sport_spring
  into v_cadet
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  where p.id = new.subject_cadet_id;

  if not found then return new; end if;

  v_link := '/report/' || new.id::text;

  foreach v_season in array v_seasons
  loop
    v_sport_name := case v_season
      when 'Fall' then v_cadet.sport_fall
      when 'Winter' then v_cadet.sport_winter
      else v_cadet.sport_spring
    end;

    if v_sport_name is null or v_sport_name = 'None' then continue; end if;

    select id into v_sport_id from public.sports where name = v_sport_name and season = v_season;
    if v_sport_id is null then continue; end if;

    v_title := 'Misconduct Report: ' || v_cadet.last_name;
    v_body := 'A report has been filed against ' || v_cadet.first_name || ' ' || v_cadet.last_name || ' (' || v_sport_name || ').';

    for v_coach in
      select sc.coach_id
      from public.sport_coaches sc
      where sc.sport_id = v_sport_id
        and sc.enable_alerts = true
    loop
      perform public.dispatch_user_notification(
        v_coach.coach_id,
        'team_alert',
        v_title,
        v_body,
        v_link,
        'team_alert:' || new.id::text || ':' || v_coach.coach_id::text || ':' || v_season,
        jsonb_build_object('report_id', new.id, 'cadet_id', new.subject_cadet_id, 'sport', v_sport_name)
      );
    end loop;
  end loop;

  return new;
end;
$function$;

-- ---------------------------------------------------------------------------
-- 6. RLS for new tables
-- ---------------------------------------------------------------------------

alter table public.cadet_notification_preferences enable row level security;
alter table public.email_delivery_log enable row level security;

grant select, insert, update, delete on public.cadet_notification_preferences to authenticated;
grant select on public.email_delivery_log to authenticated;
grant all on public.cadet_notification_preferences to service_role;
grant all on public.email_delivery_log to service_role;

create policy "Staff manage own cadet notification prefs"
on public.cadet_notification_preferences
for all
to authenticated
using (
  staff_id = (select auth.uid())
  and exists (
    select 1 from public.cadet_oversight_assignments coa
    where coa.staff_id = (select auth.uid())
      and coa.cadet_id = cadet_notification_preferences.cadet_id
      and coa.is_active = true
  )
)
with check (
  staff_id = (select auth.uid())
  and exists (
    select 1 from public.cadet_oversight_assignments coa
    where coa.staff_id = (select auth.uid())
      and coa.cadet_id = cadet_notification_preferences.cadet_id
      and coa.is_active = true
  )
);

create policy "Admins view email delivery log"
on public.email_delivery_log
for select
to authenticated
using (public.get_my_role_level() >= 90 or public.is_site_admin());

-- ---------------------------------------------------------------------------
-- 7. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.dispatch_user_notification(uuid, text, text, text, text, text, jsonb) to authenticated;
grant execute on function public.filter_users_by_email_preference(uuid[], text) to authenticated;
grant execute on function public.enqueue_email_notification(uuid, text, text, text, text, text, uuid) to authenticated;
grant execute on function public.list_pending_email_notifications(integer) to service_role;
grant execute on function public.mark_email_notification_sent(uuid[], text, text, text, public.email_delivery_mode, uuid, text, text) to service_role;
grant execute on function public.mark_email_notification_failed(uuid[], text, boolean, text, uuid, text, text) to service_role;
