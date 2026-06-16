-- Incident reports workflow table (exists in live DB; missing from local migration lineage).

create table if not exists public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  reporter_id uuid not null references public.profiles (id),
  subject_cadet_id uuid not null references public.profiles (id),
  description text not null,
  location text not null,
  incident_time timestamptz not null,
  action_taken text,
  status text not null default 'pending',
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id),
  resolution_notes text,
  handled_by_id uuid references public.profiles (id),
  constraint incident_reports_status_check
    check (status in ('pending', 'handled', 'converted'))
);

comment on table public.incident_reports is
  'Faculty-filed behavioral incident reports pending TAC triage or demerit conversion.';

alter table public.incident_reports enable row level security;

revoke all on table public.incident_reports from anon;
grant select, insert, update, delete on table public.incident_reports to authenticated;
grant all on table public.incident_reports to service_role;

drop policy if exists "Faculty create incidents" on public.incident_reports;
drop policy if exists "Reporters view own" on public.incident_reports;
drop policy if exists "Staff resolve incidents" on public.incident_reports;
drop policy if exists "Staff view all incidents" on public.incident_reports;

create policy "Faculty create incidents"
on public.incident_reports
for insert
to authenticated
with check (public.get_my_role_level() >= 50);

create policy "Reporters view own"
on public.incident_reports
for select
to authenticated
using (reporter_id = auth.uid());

create policy "Staff view all incidents"
on public.incident_reports
for select
to authenticated
using (public.get_my_role_level() >= 50);

create policy "Staff resolve incidents"
on public.incident_reports
for update
to authenticated
using (public.get_my_role_level() >= 65);

-- Link demerit conversions back to source incidents when that column exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demerit_reports'
      and column_name = 'linked_incident_id'
  ) then
    alter table public.demerit_reports
      drop constraint if exists demerit_reports_linked_incident_id_fkey;

    alter table public.demerit_reports
      add constraint demerit_reports_linked_incident_id_fkey
      foreign key (linked_incident_id) references public.incident_reports (id);
  end if;
end $$;
