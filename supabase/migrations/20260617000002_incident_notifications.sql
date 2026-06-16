-- In-app notifications for incident reports (TAC review queue + reporter outcomes)

insert into public.notification_event_types (code, category, title_template, description) values
  ('incident.pending_review', 'new_report', 'Incident pending review', 'A faculty incident report needs TAC review.'),
  ('incident.actioned', 'status_change', 'Incident report actioned', 'An incident report you filed was actioned by TAC.')
on conflict (code) do nothing;

create or replace function public.get_incident_tac_recipient_ids(p_cadet_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  join public.profiles cadet on cadet.id = p_cadet_id
  where coalesce(p.archived, false) = false
    and r.default_role_level >= 65
    and (
      r.can_manage_all_rosters = true
      or (
        r.can_manage_own_company_roster = true
        and p.company_id is not distinct from cadet.company_id
      )
    );
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
  if new.status <> 'pending' then
    return new;
  end if;

  v_subject_name := public.format_profile_name(new.subject_cadet_id);
  v_reporter_name := public.format_profile_name(new.reporter_id);
  v_link := '/incidents/' || new.id::text;
  v_title := 'Incident pending review';
  v_body := v_reporter_name || ' filed an incident report regarding ' || v_subject_name || '.';

  for v_tac_id in
    select public.get_incident_tac_recipient_ids(new.subject_cadet_id)
  loop
    if v_tac_id = new.reporter_id then
      continue;
    end if;

    perform public.dispatch_notification(
      v_tac_id,
      'incident.pending_review',
      v_title,
      v_body,
      v_link,
      'incident.pending_review:' || new.id::text || ':' || v_tac_id::text,
      jsonb_build_object(
        'incident_id', new.id,
        'reporter_id', new.reporter_id,
        'subject_cadet_id', new.subject_cadet_id
      )
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
  if old.status is not distinct from new.status then
    return new;
  end if;

  if new.status not in ('handled', 'converted') then
    return new;
  end if;

  if old.status in ('handled', 'converted') then
    return new;
  end if;

  v_subject_name := public.format_profile_name(new.subject_cadet_id);
  v_link := '/incidents/' || new.id::text;
  v_title := 'Incident report actioned';

  if new.status = 'handled' then
    v_status_label := 'marked as handled';
  else
    v_status_label := 'converted to a demerit report';
  end if;

  v_body := 'Your incident report regarding ' || v_subject_name || ' was ' || v_status_label || '.';
  if new.resolution_notes is not null and btrim(new.resolution_notes) <> '' then
    v_body := v_body || ' Notes: ' || new.resolution_notes;
  end if;

  perform public.dispatch_notification(
    new.reporter_id,
    'incident.actioned',
    v_title,
    v_body,
    v_link,
    'incident.actioned:' || new.id::text || ':' || new.reporter_id::text || ':' || new.status,
    jsonb_build_object(
      'incident_id', new.id,
      'status', new.status,
      'resolved_by', new.resolved_by
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_on_incident_insert on public.incident_reports;
create trigger trg_notify_on_incident_insert
after insert on public.incident_reports
for each row execute function public.notify_on_incident_insert();

drop trigger if exists trg_notify_on_incident_status_change on public.incident_reports;
create trigger trg_notify_on_incident_status_change
after update of status on public.incident_reports
for each row execute function public.notify_on_incident_status_change();
