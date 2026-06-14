-- Columns used by report submission, incident conversion, and green sheet posting.
alter table public.demerit_reports
  add column if not exists report_explanation text,
  add column if not exists linked_incident_id uuid,
  add column if not exists posted_at timestamp with time zone;

comment on column public.demerit_reports.report_explanation is
  'Detailed narrative of the offense; separate from the brief green sheet notes.';

comment on column public.demerit_reports.linked_incident_id is
  'Optional link back to the incident report this demerit was converted from.';

comment on column public.demerit_reports.posted_at is
  'When the report was published to the green sheet; null means pending post.';

-- Backfill posted_at from legacy is_posted where that column still exists locally.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demerit_reports'
      and column_name = 'is_posted'
  ) then
    update public.demerit_reports
    set posted_at = coalesce(posted_at, now())
    where is_posted = true
      and posted_at is null;
  end if;
end $$;
