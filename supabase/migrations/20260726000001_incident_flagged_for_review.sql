-- Day 10 follow-up: staff flag for review on incident reports

alter table public.incident_reports
  add column if not exists flagged_for_review boolean not null default false,
  add column if not exists flagged_by uuid references public.profiles (id) on delete set null,
  add column if not exists flagged_at timestamptz;

create index if not exists idx_incident_reports_flagged_for_review
  on public.incident_reports (flagged_for_review, created_at desc)
  where flagged_for_review = true;

comment on column public.incident_reports.flagged_for_review is
  'Staff flag for further review; flagged reports sort first in organizer lists.';

create or replace function public.toggle_incident_flag(p_incident_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_flag boolean;
begin
  if not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  if not exists (select 1 from public.incident_reports ir where ir.id = p_incident_id) then
    raise exception 'Incident report not found.';
  end if;

  update public.incident_reports ir
  set
    flagged_for_review = not ir.flagged_for_review,
    flagged_by = case when not ir.flagged_for_review then auth.uid() else null end,
    flagged_at = case when not ir.flagged_for_review then now() else null end
  where ir.id = p_incident_id
  returning ir.flagged_for_review into v_new_flag;

  return v_new_flag;
end;
$$;

grant execute on function public.toggle_incident_flag(uuid) to authenticated;
