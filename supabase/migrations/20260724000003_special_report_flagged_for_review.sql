-- Day 10 follow-up: staff flag for review on special reports

alter table public.special_reports
  add column if not exists flagged_for_review boolean not null default false,
  add column if not exists flagged_by uuid references public.profiles (id) on delete set null,
  add column if not exists flagged_at timestamptz;

create index if not exists idx_special_reports_flagged_for_review
  on public.special_reports (flagged_for_review, created_at desc)
  where flagged_for_review = true;

comment on column public.special_reports.flagged_for_review is
  'Staff flag for further review; flagged reports sort first in organizer lists.';

create or replace function public.toggle_special_report_flag(p_report_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_flag boolean;
begin
  if not public._special_reports_can_read(p_report_id) or not public._events_can_manage() then
    raise exception 'Permission denied';
  end if;

  update public.special_reports sr
  set
    flagged_for_review = not sr.flagged_for_review,
    flagged_by = case when not sr.flagged_for_review then auth.uid() else null end,
    flagged_at = case when not sr.flagged_for_review then now() else null end,
    updated_at = now()
  where sr.id = p_report_id
  returning sr.flagged_for_review into v_new_flag;

  if v_new_flag is null then
    raise exception 'Special report not found.';
  end if;

  insert into public.special_report_audit_log (special_report_id, actor_id, action, details)
  values (
    p_report_id,
    auth.uid(),
    case when v_new_flag then 'flagged' else 'unflagged' end,
    jsonb_build_object('flagged_for_review', v_new_flag)
  );

  return v_new_flag;
end;
$$;

grant execute on function public.toggle_special_report_flag(uuid) to authenticated;
