-- Notification fixes: pending approval alerts, correct reject/kickback reasons, clear-all RPC

-- ---------------------------------------------------------------------------
-- 1. Event type for approver queue
-- ---------------------------------------------------------------------------

insert into public.notification_event_types (code, category, title_template, description) values
  ('report.pending_approval', 'new_report', 'Report pending approval', 'A report is waiting for your approval.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Approver fan-out helper
-- ---------------------------------------------------------------------------

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
    perform public.dispatch_notification(
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

-- ---------------------------------------------------------------------------
-- 3. Pending approval producer (group / status changes)
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_report_pending_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending_approval'
     and new.current_approver_group_id is not null
     and (
       tg_op = 'INSERT'
       or old.current_approver_group_id is distinct from new.current_approver_group_id
       or old.status is distinct from new.status
     ) then
    perform public.fan_out_approver_notifications(
      new.id,
      new.current_approver_group_id,
      new.subject_cadet_id,
      'report.pending_approval:' || new.id::text || ':group'
    );
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Outcome notifications from approval_log (correct comment timing)
-- ---------------------------------------------------------------------------

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

  select *
  into v_report
  from public.demerit_reports dr
  where dr.id = new.report_id;

  if not found then
    return new;
  end if;

  v_link := '/report/' || v_report.id::text;
  v_subject_name := public.format_profile_name(v_report.subject_cadet_id);

  if v_action in ('rejected') then
    v_event_type := 'report.rejected';
    v_title := 'Report rejected';
    v_body := 'A report you submitted was rejected.';
    if new.comment is not null and btrim(new.comment) <> '' then
      v_body := v_body || ' Reason: ' || new.comment;
    end if;

    perform public.dispatch_notification(
      v_report.submitted_by,
      v_event_type,
      v_title,
      v_body,
      v_link,
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

    perform public.dispatch_notification(
      v_report.submitted_by,
      v_event_type,
      v_title,
      v_body,
      v_link,
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

    perform public.dispatch_notification(
      v_report.submitted_by,
      v_event_type,
      v_title,
      v_body,
      v_link,
      v_event_type || ':' || v_report.id::text || ':submitter:' || v_report.submitted_by::text || ':log:' || new.id::text,
      jsonb_build_object('report_id', v_report.id, 'approval_log_id', new.id)
    );

    if v_report.subject_cadet_id <> v_report.submitted_by then
      perform public.dispatch_notification(
        v_report.subject_cadet_id,
        v_event_type,
        v_title,
        'A report against you was final-approved.',
        v_link,
        v_event_type || ':' || v_report.id::text || ':subject:' || v_report.subject_cadet_id::text || ':log:' || new.id::text,
        jsonb_build_object('report_id', v_report.id, 'approval_log_id', new.id)
      );
    end if;
  end if;

  return new;
end;
$$;

-- Status-change trigger: only route pending-approval queue updates (not outcomes).
create or replace function public.notify_on_report_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending_approval'
     and new.current_approver_group_id is not null
     and (
       old.current_approver_group_id is distinct from new.current_approver_group_id
       or old.status is distinct from new.status
     ) then
    perform public.fan_out_approver_notifications(
      new.id,
      new.current_approver_group_id,
      new.subject_cadet_id,
      'report.pending_approval:' || new.id::text || ':group'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_report_status_change on public.demerit_reports;
create trigger trg_notify_on_report_status_change
after update of status, current_approver_group_id on public.demerit_reports
for each row execute function public.notify_on_report_status_change();

drop trigger if exists trg_notify_on_report_pending_approval on public.demerit_reports;
create trigger trg_notify_on_report_pending_approval
after insert on public.demerit_reports
for each row execute function public.notify_on_report_pending_approval();

drop trigger if exists trg_notify_on_approval_log_insert on public.approval_log;
create trigger trg_notify_on_approval_log_insert
after insert on public.approval_log
for each row execute function public.notify_on_approval_log_insert();

-- ---------------------------------------------------------------------------
-- 5. Clear-all RPC (delete notifications for current user)
-- ---------------------------------------------------------------------------

create or replace function public.clear_all_notifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.in_app_notification_queue
  where user_id = auth.uid();

  delete from public.user_notifications
  where user_id = auth.uid();
end;
$$;

grant execute on function public.clear_all_notifications() to authenticated;
