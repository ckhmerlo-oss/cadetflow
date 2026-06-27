-- On-demand cadet school history report (no persistence)

create or replace function public.get_cadet_history_report(
  p_cadet_id uuid,
  p_school_year text default null,
  p_term_number smallint default null,
  p_full_career boolean default false
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_bounds record;
  v_scope_start date;
  v_scope_end date;
  v_scope_start_ts timestamptz;
  v_scope_end_ts timestamptz;
  v_scope_label text;
  v_cadet jsonb;
  v_archive jsonb := '[]'::jsonb;
  v_roles jsonb := '[]'::jsonb;
  v_conduct jsonb := '[]'::jsonb;
  v_discipline jsonb := '[]'::jsonb;
  v_classes jsonb := '[]'::jsonb;
  v_activities jsonb := null;
  v_archived_as_of boolean;
  v_departure text;
  v_term record;
  v_stats record;
  v_is_current_scope boolean := false;
  v_current_year text;
begin
  if not public.can_view_cadet_history(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  if p_full_career then
    select min(t.start_date), max(t.end_date)
    into v_scope_start, v_scope_end
    from public.list_cadet_historical_years(p_cadet_id) hy
    join public.academic_terms t
      on t.school_year = hy.school_year
      and t.start_date <= current_date;

    if v_scope_start is null then
      raise exception 'No historical school years found for this cadet';
    end if;

    v_scope_label := 'Full career';
  else
    if p_school_year is null then
      raise exception 'School year is required unless full career is requested';
    end if;

    select * into v_bounds
    from public.resolve_period_bounds(p_school_year, p_term_number)
    limit 1;

    v_scope_start := v_bounds.term_start;
    v_scope_end := v_bounds.term_end;

    if p_term_number is not null then
      select t.term_name into v_scope_label
      from public.academic_terms t
      where t.school_year = p_school_year
        and t.term_number = p_term_number
      limit 1;
      v_scope_label := coalesce(v_scope_label, 'Term ' || p_term_number::text) || ' · ' || p_school_year;
    else
      v_scope_label := p_school_year || ' · Full school year';
    end if;
  end if;

  v_scope_start_ts := v_scope_start::timestamptz;
  v_scope_end_ts := (v_scope_end + interval '1 day')::timestamptz - interval '1 microsecond';

  select jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'years_attended', coalesce(cp.years_attended, 0),
    'account_created_at', u.created_at,
    'archived', coalesce(p.archived, false)
  )
  into v_cadet
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join auth.users u on u.id = p.id
  where p.id = p_cadet_id;

  if v_cadet is null then
    raise exception 'Cadet not found';
  end if;

  select t.school_year into v_current_year
  from public.academic_terms t
  where now() between t.start_date and (t.end_date + interval '1 day')
    and t.archived = false
  order by t.start_date desc
  limit 1;

  v_is_current_scope := v_current_year is not null
    and coalesce((v_cadet ->> 'archived')::boolean, false) = false
    and (
      p_full_career
      or p_school_year = v_current_year
    );

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'started_at', i.started_at,
      'ended_at', i.ended_at,
      'reason', i.reason,
      'departure_classification', i.departure_classification
    )
    order by i.started_at
  ), '[]'::jsonb)
  into v_archive
  from public.cadet_archive_intervals i
  where i.cadet_id = p_cadet_id
    and i.started_at <= v_scope_end_ts
    and (i.ended_at is null or i.ended_at >= v_scope_start_ts);

  select coalesce(jsonb_agg(evt order by (evt ->> 'ended_at')), '[]'::jsonb)
  into v_roles
  from (
    select jsonb_build_object(
      'role_name', elem ->> 'role_name',
      'company_name', elem ->> 'company_name',
      'school_year', elem ->> 'school_year',
      'ended_at', elem ->> 'ended_at',
      'reason', elem ->> 'reason'
    ) as evt
    from public.cadet_profiles cp,
      jsonb_array_elements(coalesce(cp.role_history, '[]'::jsonb)) as elem
    where cp.profile_id = p_cadet_id
      and nullif(elem ->> 'ended_at', '') is not null
      and (elem ->> 'ended_at')::timestamptz <= v_scope_end_ts
      and (elem ->> 'ended_at')::timestamptz >= v_scope_start_ts
  ) sub;

  for v_term in
    select t.school_year, t.term_number, t.term_name, t.start_date, t.end_date
    from public.academic_terms t
    where t.start_date <= current_date
      and t.start_date <= v_scope_end
      and t.end_date >= v_scope_start
      and (
        p_full_career
        or (t.school_year = p_school_year and (p_term_number is null or t.term_number = p_term_number))
      )
      and (
        p_full_career = false
        or exists (
          select 1 from public.list_cadet_historical_years(p_cadet_id) hy
          where hy.school_year = t.school_year
        )
      )
      and public.cadet_present_in_period(p_cadet_id, t.school_year, t.term_number)
    order by t.start_date
  loop
    select * into v_stats
    from public._get_cadet_period_stats_core(p_cadet_id, v_term.school_year, v_term.term_number)
    limit 1;

    v_conduct := v_conduct || jsonb_build_array(jsonb_build_object(
      'school_year', v_term.school_year,
      'term_number', v_term.term_number,
      'term_name', v_term.term_name,
      'term_demerits', v_stats.term_demerits,
      'year_demerits', v_stats.year_demerits,
      'conduct_status', v_stats.conduct_status
    ));
  end loop;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'event_date', e.event_date,
      'event_type', e.event_type,
      'title', e.title,
      'details', e.details,
      'demerits_issued', e.demerits_issued,
      'tour_change', e.tour_change,
      'actor_name', e.actor_name,
      'status', e.status,
      'report_id', e.report_id,
      'appeal_status', e.appeal_status,
      'date_of_offense', e.date_of_offense
    )
    order by e.event_date desc
  ), '[]'::jsonb)
  into v_discipline
  from public.get_cadet_ledger_for_period(p_cadet_id, v_scope_start_ts, v_scope_end_ts) e;

  if p_full_career then
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'school_year', h.school_year,
        'term_number', h.term_number,
        'seminar_period', h.seminar_period,
        'course_name', h.course_name,
        'slot_type', h.slot_type,
        'teacher_name', h.teacher_name
      )
      order by h.school_year desc, h.term_number nulls last
    ), '[]'::jsonb)
    into v_classes
    from public.get_cadet_academic_history(p_cadet_id, null, null) h
    where exists (
      select 1 from public.academic_terms t
      where t.school_year = h.school_year
        and t.start_date <= v_scope_end
        and t.end_date >= v_scope_start
        and t.start_date <= current_date
    );
  else
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'school_year', h.school_year,
        'term_number', h.term_number,
        'seminar_period', h.seminar_period,
        'course_name', h.course_name,
        'slot_type', h.slot_type,
        'teacher_name', h.teacher_name
      )
      order by h.school_year desc, h.term_number nulls last
    ), '[]'::jsonb)
    into v_classes
    from public.get_cadet_academic_history(p_cadet_id, p_school_year, p_term_number) h;
  end if;

  v_archived_as_of := public.cadet_was_archived_at(p_cadet_id, v_scope_end_ts);
  select a.departure_classification into v_departure
  from public.cadet_archive_as_of(p_cadet_id, v_scope_end_ts) a;

  if v_is_current_scope then
    select jsonb_build_object(
      'sport_fall', cp.sport_fall,
      'sport_winter', cp.sport_winter,
      'sport_spring', cp.sport_spring,
      'extracurriculars', coalesce(cp.extracurriculars, '[]'::jsonb),
      'is_in_band', coalesce(cp.is_in_band, false)
    )
    into v_activities
    from public.cadet_profiles cp
    where cp.profile_id = p_cadet_id;
  end if;

  return jsonb_build_object(
    'scope', jsonb_build_object(
      'school_year', case when p_full_career then null else p_school_year end,
      'term_number', case when p_full_career then null else p_term_number end,
      'full_career', p_full_career,
      'term_start', v_scope_start,
      'term_end', v_scope_end,
      'label', v_scope_label
    ),
    'cadet', v_cadet,
    'archived_as_of_period', v_archived_as_of,
    'departure_classification_as_of', v_departure,
    'archive_intervals', v_archive,
    'role_events', v_roles,
    'conduct_by_term', v_conduct,
    'discipline_events', v_discipline,
    'classes', v_classes,
    'activities_current', v_activities,
    'generated_at', now()
  );
end;
$$;

grant execute on function public.get_cadet_history_report(uuid, text, smallint, boolean) to authenticated;
