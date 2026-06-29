-- Event demerit resolution + multi-subject special reports

-- ---------------------------------------------------------------------------
-- 1. Special report subjects (many cadets per affidavit)
-- ---------------------------------------------------------------------------

create table if not exists public.special_report_subjects (
  special_report_id uuid not null references public.special_reports (id) on delete cascade,
  cadet_id uuid not null references public.profiles (id) on delete restrict,
  primary key (special_report_id, cadet_id)
);

create index if not exists idx_special_report_subjects_cadet
  on public.special_report_subjects (cadet_id);

comment on table public.special_report_subjects is
  'Cadets named as subjects in a special report affidavit (Day 10).';

insert into public.special_report_subjects (special_report_id, cadet_id)
select sr.id, sr.subject_cadet_id
from public.special_reports sr
where sr.subject_cadet_id is not null
on conflict do nothing;

alter table public.special_report_subjects enable row level security;

drop policy if exists "Special report subjects select scoped" on public.special_report_subjects;
create policy "Special report subjects select scoped"
on public.special_report_subjects for select to authenticated
using (
  exists (
    select 1 from public.special_reports sr
    where sr.id = special_report_id
      and public._special_reports_can_read(sr.id)
  )
);

grant select on table public.special_report_subjects to authenticated;
grant all on table public.special_report_subjects to service_role;

-- ---------------------------------------------------------------------------
-- 2. Event resolution + demerit linkage
-- ---------------------------------------------------------------------------

alter table public.demerit_reports
  add column if not exists linked_event_id uuid references public.events (id) on delete set null;

create index if not exists idx_demerit_reports_linked_event
  on public.demerit_reports (linked_event_id)
  where linked_event_id is not null;

comment on column public.demerit_reports.linked_event_id is
  'Event this demerit report was assigned from during event resolution (Day 10).';

alter table public.events
  add column if not exists resolution_type text,
  add constraint events_resolution_type_check
    check (resolution_type is null or resolution_type in ('demerits', 'handled', 'summary'));

comment on column public.events.resolution_type is
  'Terminal outcome when closed: demerits assigned, handled without demerits, or summary only.';

-- ---------------------------------------------------------------------------
-- 3. submit_special_report — accept multiple subject cadets
-- ---------------------------------------------------------------------------

create or replace function public.submit_special_report(
  p_narrative text,
  p_location text,
  p_occurred_at timestamptz,
  p_involvement_type text default 'witness',
  p_subject_cadet_id uuid default null,
  p_subject_cadet_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_subject uuid;
  v_subjects uuid[];
  v_cadet_id uuid;
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

  v_subjects := coalesce(p_subject_cadet_ids, array[]::uuid[]);
  if p_subject_cadet_id is not null then
    v_subjects := array_append(v_subjects, p_subject_cadet_id);
  end if;

  select coalesce(array_agg(distinct x), array[]::uuid[])
  into v_subjects
  from unnest(v_subjects) as x
  where x is not null;

  if coalesce(array_length(v_subjects, 1), 0) = 0 and p_involvement_type = 'participant' then
    v_subjects := array[auth.uid()];
  end if;

  v_subject := case
    when coalesce(array_length(v_subjects, 1), 0) > 0 then v_subjects[1]
    else null
  end;

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

  foreach v_cadet_id in array v_subjects
  loop
    insert into public.special_report_subjects (special_report_id, cadet_id)
    values (v_id, v_cadet_id)
    on conflict do nothing;
  end loop;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    v_id,
    auth.uid(),
    'submitted',
    jsonb_build_object(
      'involvement_type', p_involvement_type,
      'subject_cadet_id', v_subject,
      'subject_cadet_ids', to_jsonb(v_subjects)
    )
  );

  return v_id;
end;
$$;

grant execute on function public.submit_special_report(text, text, timestamptz, text, uuid, uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. resolve_event_with_demerits — assign demerits to parties and close event
-- ---------------------------------------------------------------------------

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
    status = 'acknowledged',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_notes = coalesce(sr.review_notes, 'Acknowledged via event demerit resolution.'),
    updated_at = now()
  where sr.event_id = p_event_id
    and sr.status in ('submitted', 'under_review');

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
    and sr.status in ('submitted', 'under_review');

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

grant execute on function public.resolve_event_with_demerits(uuid, jsonb, date, text) to authenticated;
grant execute on function public.resolve_event_handled(uuid, text, text) to authenticated;
