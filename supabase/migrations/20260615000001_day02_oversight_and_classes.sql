-- Day 02: Big-3 oversight + class schedules (5-term school year model)

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Extend academic_terms for 5-term school years
-- ---------------------------------------------------------------------------

alter table public.academic_terms
  add column if not exists school_year text,
  add column if not exists term_number smallint,
  add column if not exists archived boolean not null default false;

update public.academic_terms
set
  school_year = coalesce(
    school_year,
    to_char(start_date, 'YYYY') || '-' || to_char(
      case when extract(month from end_date) >= 7 then end_date else end_date + interval '1 year' end,
      'YYYY'
    )
  ),
  term_number = coalesce(term_number, 1)
where school_year is null or term_number is null;

alter table public.academic_terms
  alter column school_year set not null,
  alter column term_number set not null;

alter table public.academic_terms
  drop constraint if exists academic_terms_term_number_check;

alter table public.academic_terms
  add constraint academic_terms_term_number_check
  check (term_number between 1 and 5);

create unique index if not exists academic_terms_school_year_term_active_idx
  on public.academic_terms (school_year, term_number)
  where archived = false;

-- ---------------------------------------------------------------------------
-- 2. Class schedule tables
-- ---------------------------------------------------------------------------

create table if not exists public.class_sections (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  school_year text not null,
  term_number smallint,
  seminar_period text,
  course_name text not null,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_sections_term_or_seminar_check check (
    (term_number is not null and seminar_period is null)
    or (term_number is null and seminar_period in ('a', 'b'))
  ),
  constraint class_sections_term_number_check check (
    term_number is null or term_number between 1 and 5
  )
);

create unique index if not exists class_sections_teacher_main_active_idx
  on public.class_sections (teacher_id, school_year, term_number)
  where archived = false and term_number is not null;

create unique index if not exists class_sections_teacher_seminar_active_idx
  on public.class_sections (teacher_id, school_year, seminar_period)
  where archived = false and seminar_period is not null;

create index if not exists idx_class_sections_school_year on public.class_sections (school_year);

create table if not exists public.cadet_class_enrollments (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  class_section_id uuid not null references public.class_sections (id) on delete restrict,
  slot_type text not null,
  school_year text not null,
  assigned_by uuid references public.profiles (id) on delete set null,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cadet_class_enrollments_slot_type_check check (
    slot_type in ('term_1', 'term_2', 'term_3', 'term_4', 'term_5', 'seminar_a', 'seminar_b')
  )
);

create unique index if not exists cadet_class_enrollments_active_slot_idx
  on public.cadet_class_enrollments (cadet_id, school_year, slot_type)
  where archived = false;

create index if not exists idx_cadet_class_enrollments_section
  on public.cadet_class_enrollments (class_section_id)
  where archived = false;

-- ---------------------------------------------------------------------------
-- 3. Oversight tables
-- ---------------------------------------------------------------------------

create table if not exists public.cadet_oversight_assignments (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  staff_id uuid not null references public.profiles (id) on delete cascade,
  assignment_type text not null,
  source text not null default 'system',
  source_ref text,
  term_id uuid references public.academic_terms (id) on delete set null,
  class_section_id uuid references public.class_sections (id) on delete set null,
  sport_id uuid references public.sports (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  is_active boolean not null default true,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  self_removed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint cadet_oversight_assignments_type_check check (
    assignment_type in ('teacher', 'coach', 'tac', 'secondary', 'faculty')
  ),
  constraint cadet_oversight_assignments_source_check check (
    source in ('system', 'manual')
  )
);

create unique index if not exists cadet_oversight_assignments_active_idx
  on public.cadet_oversight_assignments (cadet_id, staff_id, assignment_type, source)
  where is_active = true;

create index if not exists idx_oversight_staff_active
  on public.cadet_oversight_assignments (staff_id)
  where is_active = true;

create table if not exists public.cadet_oversight_assignment_log (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  staff_id uuid references public.profiles (id) on delete set null,
  assignment_type text not null,
  action text not null,
  source text,
  actor_id uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint cadet_oversight_assignment_log_action_check check (
    action in ('assigned', 'removed', 'reassigned', 'self_removed')
  )
);

create table if not exists public.oversight_assignment_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  staff_id uuid references public.profiles (id) on delete set null,
  assignment_type text not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cadet_oversight_secondary_opt_outs (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete cascade,
  staff_id uuid not null references public.profiles (id) on delete cascade,
  class_section_id uuid not null references public.class_sections (id) on delete cascade,
  school_year text not null,
  created_at timestamptz not null default now(),
  unique (cadet_id, staff_id, class_section_id, school_year)
);

-- ---------------------------------------------------------------------------
-- 4. Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.get_active_school_year()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select t.school_year
  from public.academic_terms t
  where t.archived = false
  group by t.school_year
  having current_date between min(t.start_date) and max(t.end_date)
  order by min(t.start_date) desc
  limit 1;
$$;

create or replace function public.get_current_academic_term_row()
returns public.academic_terms
language sql
stable
security definer
set search_path = public
as $$
  select t.*
  from public.academic_terms t
  where t.archived = false
    and current_date between t.start_date and t.end_date
  order by t.start_date
  limit 1;
$$;

create or replace function public.get_seminar_period(p_date date default current_date)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_term3 record;
  v_mid date;
begin
  select * into v_term3
  from public.academic_terms t
  where t.archived = false
    and t.term_number = 3
    and t.school_year = public.get_active_school_year()
  limit 1;

  if v_term3.id is null then
    return null;
  end if;

  v_mid := v_term3.start_date + ((v_term3.end_date - v_term3.start_date) / 2);

  if p_date < v_term3.start_date then
    return 'a';
  elsif p_date < v_mid then
    return 'a';
  else
    return 'b';
  end if;
end;
$$;

create or replace function public.slot_type_for_term_number(p_term_number integer)
returns text
language sql
immutable
as $$
  select case p_term_number
    when 1 then 'term_1'
    when 2 then 'term_2'
    when 3 then 'term_3'
    when 4 then 'term_4'
    when 5 then 'term_5'
    else null
  end;
$$;

create or replace function public.get_current_sports_season()
returns text
language sql
stable
as $$
  select case
    when extract(month from current_date) in (8, 9, 10, 11) then 'Fall'
    when extract(month from current_date) in (12, 1, 2) then 'Winter'
    else 'Spring'
  end;
$$;

create or replace function public.can_manage_cadet_schedule(p_cadet_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_perms record;
  v_cadet_company uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  if public.is_site_admin() or public.get_my_role_level() >= 90 then
    return true;
  end if;

  select * into v_perms from public.get_my_roster_permissions();

  if v_perms.role_level < 65 then
    return false;
  end if;

  select company_id into v_cadet_company
  from public.profiles
  where id = p_cadet_id;

  if v_perms.can_manage_all then
    return true;
  end if;

  if v_perms.can_manage_own and v_cadet_company = v_perms.company_id then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.is_teacher_staff(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    left join public.staff_profiles sp on sp.profile_id = p.id
    where p.id = coalesce(p_user_id, auth.uid())
      and coalesce(r.default_role_level, 0) >= 50
  );
$$;

create or replace function public.log_oversight_change(
  p_cadet_id uuid,
  p_staff_id uuid,
  p_assignment_type text,
  p_action text,
  p_source text,
  p_actor_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cadet_oversight_assignment_log (
    cadet_id, staff_id, assignment_type, action, source, actor_id, metadata
  ) values (
    p_cadet_id, p_staff_id, p_assignment_type, p_action, p_source, p_actor_id, p_metadata
  );
end;
$$;

create or replace function public.emit_oversight_event(
  p_event_type text,
  p_cadet_id uuid,
  p_staff_id uuid,
  p_assignment_type text,
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  v_key := p_event_type || ':' || p_cadet_id::text || ':' || coalesce(p_staff_id::text, 'none')
    || ':' || p_assignment_type || ':' || to_char(now(), 'YYYYMMDDHH24MISS');

  insert into public.oversight_assignment_events (
    event_type, cadet_id, staff_id, assignment_type, payload, idempotency_key
  ) values (
    p_event_type, p_cadet_id, p_staff_id, p_assignment_type, p_payload, v_key
  )
  on conflict (idempotency_key) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Oversight sync engine
-- ---------------------------------------------------------------------------

create or replace function public.upsert_oversight_assignment(
  p_cadet_id uuid,
  p_staff_id uuid,
  p_assignment_type text,
  p_source text,
  p_source_ref text default null,
  p_term_id uuid default null,
  p_class_section_id uuid default null,
  p_sport_id uuid default null,
  p_company_id uuid default null,
  p_actor_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
begin
  if p_staff_id is null then
    return;
  end if;

  select id into v_existing
  from public.cadet_oversight_assignments
  where cadet_id = p_cadet_id
    and staff_id = p_staff_id
    and assignment_type = p_assignment_type
    and source = p_source
    and is_active = true
  limit 1;

  if v_existing is not null then
    return;
  end if;

  insert into public.cadet_oversight_assignments (
    cadet_id, staff_id, assignment_type, source, source_ref,
    term_id, class_section_id, sport_id, company_id
  ) values (
    p_cadet_id, p_staff_id, p_assignment_type, p_source, p_source_ref,
    p_term_id, p_class_section_id, p_sport_id, p_company_id
  );

  perform public.log_oversight_change(
    p_cadet_id, p_staff_id, p_assignment_type, 'assigned', p_source, p_actor_id,
    jsonb_build_object('source_ref', p_source_ref)
  );

  perform public.emit_oversight_event(
    'oversight.assigned', p_cadet_id, p_staff_id, p_assignment_type,
    jsonb_build_object('source', p_source, 'source_ref', p_source_ref)
  );
end;
$$;

create or replace function public.close_oversight_assignments(
  p_cadet_id uuid,
  p_assignment_type text,
  p_source text,
  p_actor_id uuid default null,
  p_keep_staff_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  for v_row in
    select id, staff_id
    from public.cadet_oversight_assignments
    where cadet_id = p_cadet_id
      and assignment_type = p_assignment_type
      and source = p_source
      and is_active = true
      and (p_keep_staff_id is null or staff_id is distinct from p_keep_staff_id)
  loop
    update public.cadet_oversight_assignments
    set is_active = false, ended_at = now()
    where id = v_row.id;

    perform public.log_oversight_change(
      p_cadet_id, v_row.staff_id, p_assignment_type, 'removed', p_source, p_actor_id, '{}'::jsonb
    );

    perform public.emit_oversight_event(
      'oversight.removed', p_cadet_id, v_row.staff_id, p_assignment_type, '{}'::jsonb
    );
  end loop;
end;
$$;

create or replace function public.sync_cadet_oversight(p_cadet_id uuid, p_actor_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_company_name text;
  v_tac_group_id uuid;
  v_tac record;
  v_current_term record;
  v_slot text;
  v_enrollment record;
  v_teacher_id uuid;
  v_seminar_period text;
  v_seminar_slot text;
  v_school_year text;
  v_sport_name text;
  v_sport_id uuid;
  v_coach_id uuid;
  v_season text;
begin
  select company_id into v_company_id
  from public.profiles
  where id = p_cadet_id;

  v_school_year := public.get_active_school_year();

  -- TAC
  perform public.close_oversight_assignments(p_cadet_id, 'tac', 'system', p_actor_id, null);

  if v_company_id is not null then
    select company_name into v_company_name
    from public.companies
    where id = v_company_id;

    select id into v_tac_group_id
    from public.approval_groups
    where group_name = v_company_name || ' TAC'
    limit 1;

    for v_tac in
      select p.id as staff_id
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.archived = false
        and (
          (v_tac_group_id is not null and r.approval_group_id = v_tac_group_id)
          or (r.company_id = v_company_id and r.role_name ilike '%TAC Officer%')
        )
    loop
      perform public.upsert_oversight_assignment(
        p_cadet_id, v_tac.staff_id, 'tac', 'system',
        'company:' || v_company_id::text, null, null, null, v_company_id, p_actor_id
      );
    end loop;
  end if;

  -- Coach
  perform public.close_oversight_assignments(p_cadet_id, 'coach', 'system', p_actor_id, null);

  v_season := public.get_current_sports_season();

  select
    case v_season
      when 'Fall' then cp.sport_fall
      when 'Winter' then cp.sport_winter
      else cp.sport_spring
    end
  into v_sport_name
  from public.cadet_profiles cp
  where cp.profile_id = p_cadet_id;

  if v_sport_name is not null and v_sport_name not in ('None', '') then
    select id into v_sport_id
    from public.sports
    where name = v_sport_name and season = v_season
    limit 1;

    if v_sport_id is not null then
      select coach_id into v_coach_id
      from public.sport_coaches
      where sport_id = v_sport_id and role = 'Head Coach'
      limit 1;

      if v_coach_id is null then
        select coach_id into v_coach_id
        from public.sport_coaches
        where sport_id = v_sport_id
        limit 1;
      end if;

      perform public.upsert_oversight_assignment(
        p_cadet_id, v_coach_id, 'coach', 'system',
        'sport:' || v_sport_id::text, null, null, v_sport_id, null, p_actor_id
      );
    end if;
  end if;

  -- Big-3 teacher from current main term class
  select * into v_current_term from public.get_current_academic_term_row();

  perform public.close_oversight_assignments(p_cadet_id, 'teacher', 'system', p_actor_id, null);

  if v_current_term.id is not null then
    v_slot := public.slot_type_for_term_number(v_current_term.term_number);

    select e.*, cs.teacher_id
    into v_enrollment
    from public.cadet_class_enrollments e
    join public.class_sections cs on cs.id = e.class_section_id
    where e.cadet_id = p_cadet_id
      and e.archived = false
      and e.slot_type = v_slot
      and e.school_year = v_current_term.school_year
    limit 1;

    if v_enrollment.class_section_id is not null then
      perform public.upsert_oversight_assignment(
        p_cadet_id, v_enrollment.teacher_id, 'teacher', 'system',
        'class_section:' || v_enrollment.class_section_id::text,
        v_current_term.id, v_enrollment.class_section_id, null, null, p_actor_id
      );
    end if;
  end if;

  -- Secondary seminar teacher
  perform public.close_oversight_assignments(p_cadet_id, 'secondary', 'system', p_actor_id, null);

  v_seminar_period := public.get_seminar_period(current_date);
  v_seminar_slot := case v_seminar_period when 'a' then 'seminar_a' when 'b' then 'seminar_b' else null end;

  if v_seminar_slot is not null and v_school_year is not null then
    select e.*, cs.teacher_id, cs.id as section_id
    into v_enrollment
    from public.cadet_class_enrollments e
    join public.class_sections cs on cs.id = e.class_section_id
    where e.cadet_id = p_cadet_id
      and e.archived = false
      and e.slot_type = v_seminar_slot
      and e.school_year = v_school_year
    limit 1;

    if v_enrollment.section_id is not null then
      if not exists (
        select 1
        from public.cadet_oversight_secondary_opt_outs o
        where o.cadet_id = p_cadet_id
          and o.staff_id = v_enrollment.teacher_id
          and o.class_section_id = v_enrollment.section_id
          and o.school_year = v_school_year
      ) then
        perform public.upsert_oversight_assignment(
          p_cadet_id, v_enrollment.teacher_id, 'secondary', 'system',
          'class_section:' || v_enrollment.section_id::text,
          null, v_enrollment.section_id, null, null, p_actor_id
        );
      end if;
    end if;
  end if;
end;
$$;

create or replace function public.sync_all_cadet_oversight()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cadet uuid;
begin
  if public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  for v_cadet in
    select p.id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    join public.cadet_profiles cp on cp.profile_id = p.id
    where p.archived = false
      and coalesce(r.default_role_level, 0) < 50
  loop
    perform public.sync_cadet_oversight(v_cadet, auth.uid());
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. School year lifecycle RPCs
-- ---------------------------------------------------------------------------

create or replace function public.setup_school_year_terms(
  p_school_year text,
  p_term_names text[],
  p_start_dates date[],
  p_end_dates date[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
  j integer;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if coalesce(array_length(p_term_names, 1), 0) <> 5
    or coalesce(array_length(p_start_dates, 1), 0) <> 5
    or coalesce(array_length(p_end_dates, 1), 0) <> 5 then
    raise exception 'Exactly 5 terms are required';
  end if;

  for i in 1..5 loop
    if p_start_dates[i] >= p_end_dates[i] then
      raise exception 'Term % has invalid date range', i;
    end if;

    for j in 1..5 loop
      if i <> j and p_start_dates[i] <= p_end_dates[j] and p_end_dates[i] >= p_start_dates[j] then
        raise exception 'Term dates overlap within school year';
      end if;
    end loop;
  end loop;

  for i in 1..5 loop
    update public.academic_terms
    set
      term_name = p_term_names[i],
      start_date = p_start_dates[i],
      end_date = p_end_dates[i],
      archived = false
    where school_year = p_school_year
      and term_number = i
      and archived = false;

    if not found then
      insert into public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
      values (p_term_names[i], p_start_dates[i], p_end_dates[i], p_school_year, i, false);
    end if;
  end loop;
end;
$$;

create or replace function public.archive_school_year(p_school_year text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  update public.academic_terms
  set archived = true
  where school_year = p_school_year;

  update public.class_sections
  set archived = true
  where school_year = p_school_year;

  update public.cadet_class_enrollments
  set archived = true
  where school_year = p_school_year;

  update public.cadet_oversight_assignments o
  set is_active = false, ended_at = now()
  from public.class_sections cs
  where o.class_section_id = cs.id
    and cs.school_year = p_school_year
    and o.is_active = true;
end;
$$;

create or replace function public.get_school_year_terms(p_school_year text default null)
returns table (
  id uuid,
  term_name text,
  start_date date,
  end_date date,
  school_year text,
  term_number smallint,
  archived boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select t.id, t.term_name, t.start_date, t.end_date, t.school_year, t.term_number, t.archived
  from public.academic_terms t
  where t.school_year = coalesce(p_school_year, public.get_active_school_year())
  order by t.term_number;
$$;

-- ---------------------------------------------------------------------------
-- 7. Class + schedule RPCs
-- ---------------------------------------------------------------------------

create or replace function public.upsert_teacher_class_section(
  p_section_id uuid,
  p_course_name text,
  p_term_number integer default null,
  p_seminar_period text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_year text;
  v_section_id uuid;
begin
  if not public.is_teacher_staff() then
    raise exception 'Permission denied';
  end if;

  v_school_year := public.get_active_school_year();
  if v_school_year is null then
    raise exception 'No active school year configured';
  end if;

  if p_section_id is null then
    insert into public.class_sections (
      teacher_id, school_year, term_number, seminar_period, course_name
    ) values (
      auth.uid(), v_school_year, p_term_number, p_seminar_period, p_course_name
    )
    returning id into v_section_id;
  else
    update public.class_sections
    set course_name = p_course_name, updated_at = now()
    where id = p_section_id
      and teacher_id = auth.uid()
      and archived = false
    returning id into v_section_id;

    if v_section_id is null then
      raise exception 'Section not found or not owned by you';
    end if;
  end if;

  return v_section_id;
end;
$$;

create or replace function public._validate_section_slot(
  p_section_id uuid,
  p_slot_type text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_section record;
  v_term_num integer;
begin
  select * into v_section
  from public.class_sections
  where id = p_section_id and archived = false;

  if v_section.id is null then
    return false;
  end if;

  if p_slot_type like 'term_%' then
    v_term_num := substring(p_slot_type from 6)::integer;
    return v_section.term_number = v_term_num and v_section.seminar_period is null;
  end if;

  if p_slot_type = 'seminar_a' then
    return v_section.seminar_period = 'a';
  end if;

  if p_slot_type = 'seminar_b' then
    return v_section.seminar_period = 'b';
  end if;

  return false;
end;
$$;

create or replace function public._set_cadet_enrollment(
  p_cadet_id uuid,
  p_section_id uuid,
  p_slot_type text,
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_year text;
  v_existing uuid;
begin
  if not public._validate_section_slot(p_section_id, p_slot_type) then
    raise exception 'Section does not match slot type';
  end if;

  select school_year into v_school_year
  from public.class_sections
  where id = p_section_id;

  update public.cadet_class_enrollments
  set archived = true, updated_at = now()
  where cadet_id = p_cadet_id
    and school_year = v_school_year
    and slot_type = p_slot_type
    and archived = false;

  insert into public.cadet_class_enrollments (
    cadet_id, class_section_id, slot_type, school_year, assigned_by
  ) values (
    p_cadet_id, p_section_id, p_slot_type, v_school_year, p_actor_id
  );

  delete from public.cadet_oversight_secondary_opt_outs o
  using public.class_sections cs
  where o.cadet_id = p_cadet_id
    and o.class_section_id = cs.id
    and cs.id = p_section_id
    and o.school_year = v_school_year;

  perform public.sync_cadet_oversight(p_cadet_id, p_actor_id);
end;
$$;

create or replace function public.add_cadet_to_class_section(
  p_section_id uuid,
  p_cadet_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_section record;
  v_slot text;
begin
  select * into v_section
  from public.class_sections
  where id = p_section_id and archived = false;

  if v_section.id is null then
    raise exception 'Section not found';
  end if;

  if v_section.teacher_id <> auth.uid() and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  if v_section.term_number is not null then
    v_slot := public.slot_type_for_term_number(v_section.term_number);
  else
    v_slot := case v_section.seminar_period when 'a' then 'seminar_a' when 'b' then 'seminar_b' end;
  end if;

  perform public._set_cadet_enrollment(p_cadet_id, p_section_id, v_slot, auth.uid());
end;
$$;

create or replace function public.remove_cadet_from_class_section(
  p_section_id uuid,
  p_cadet_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_section record;
begin
  select * into v_section
  from public.class_sections
  where id = p_section_id and archived = false;

  if v_section.id is null then
    raise exception 'Section not found';
  end if;

  if v_section.teacher_id <> auth.uid() and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  update public.cadet_class_enrollments
  set archived = true, updated_at = now()
  where cadet_id = p_cadet_id
    and class_section_id = p_section_id
    and archived = false;

  perform public.sync_cadet_oversight(p_cadet_id, auth.uid());
end;
$$;

create or replace function public.set_cadet_schedule_slot(
  p_cadet_id uuid,
  p_slot_type text,
  p_section_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_cadet_schedule(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  perform public._set_cadet_enrollment(p_cadet_id, p_section_id, p_slot_type, auth.uid());
end;
$$;

create or replace function public.clear_cadet_schedule_slot(
  p_cadet_id uuid,
  p_slot_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_year text;
begin
  if not public.can_manage_cadet_schedule(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  v_school_year := public.get_active_school_year();

  update public.cadet_class_enrollments
  set archived = true, updated_at = now()
  where cadet_id = p_cadet_id
    and slot_type = p_slot_type
    and school_year = v_school_year
    and archived = false;

  perform public.sync_cadet_oversight(p_cadet_id, auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Manual oversight RPCs
-- ---------------------------------------------------------------------------

create or replace function public.add_manual_oversight(
  p_cadet_id uuid,
  p_staff_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_staff_id = auth.uid() then
    if not public.is_teacher_staff() then
      raise exception 'Permission denied';
    end if;
  elsif not public.can_manage_cadet_schedule(p_cadet_id) and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  perform public.upsert_oversight_assignment(
    p_cadet_id, p_staff_id, 'faculty', 'manual', 'manual:' || auth.uid()::text,
    null, null, null, null, auth.uid()
  );

  select id into v_id
  from public.cadet_oversight_assignments
  where cadet_id = p_cadet_id
    and staff_id = p_staff_id
    and assignment_type = 'faculty'
    and source = 'manual'
    and is_active = true
  limit 1;

  return v_id;
end;
$$;

create or replace function public.remove_manual_oversight(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  select * into v_row
  from public.cadet_oversight_assignments
  where id = p_assignment_id and is_active = true;

  if v_row.id is null then
    raise exception 'Assignment not found';
  end if;

  if v_row.source <> 'manual' or v_row.assignment_type <> 'faculty' then
    raise exception 'Only manual faculty assignments can be removed this way';
  end if;

  if v_row.staff_id <> auth.uid()
    and not public.can_manage_cadet_schedule(v_row.cadet_id)
    and public.get_my_role_level() < 90
    and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  update public.cadet_oversight_assignments
  set is_active = false, ended_at = now()
  where id = p_assignment_id;

  perform public.log_oversight_change(
    v_row.cadet_id, v_row.staff_id, v_row.assignment_type, 'removed', v_row.source, auth.uid(), '{}'::jsonb
  );
end;
$$;

create or replace function public.self_remove_secondary_assignment(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_school_year text;
begin
  select * into v_row
  from public.cadet_oversight_assignments
  where id = p_assignment_id and is_active = true;

  if v_row.id is null then
    raise exception 'Assignment not found';
  end if;

  if v_row.staff_id <> auth.uid() then
    raise exception 'Permission denied';
  end if;

  if v_row.assignment_type <> 'secondary' or v_row.source <> 'system' then
    raise exception 'Only secondary system assignments can be self-removed';
  end if;

  v_school_year := public.get_active_school_year();

  insert into public.cadet_oversight_secondary_opt_outs (
    cadet_id, staff_id, class_section_id, school_year
  ) values (
    v_row.cadet_id, v_row.staff_id, v_row.class_section_id, coalesce(v_school_year, 'unknown')
  )
  on conflict (cadet_id, staff_id, class_section_id, school_year) do nothing;

  update public.cadet_oversight_assignments
  set is_active = false, ended_at = now(), self_removed_at = now()
  where id = p_assignment_id;

  perform public.log_oversight_change(
    v_row.cadet_id, v_row.staff_id, v_row.assignment_type, 'self_removed', v_row.source, auth.uid(), '{}'::jsonb
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Read RPCs
-- ---------------------------------------------------------------------------

create or replace function public.get_cadet_schedule(p_cadet_id uuid)
returns table (
  slot_type text,
  enrollment_id uuid,
  section_id uuid,
  course_name text,
  teacher_id uuid,
  teacher_first_name text,
  teacher_last_name text,
  term_number smallint,
  seminar_period text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_school_year text;
begin
  if p_cadet_id <> auth.uid()
    and public.get_my_role_level() < 50
    and not public.can_manage_cadet_schedule(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  v_school_year := public.get_active_school_year();

  return query
  select
    e.slot_type,
    e.id,
    cs.id,
    cs.course_name,
    cs.teacher_id,
    tp.first_name,
    tp.last_name,
    cs.term_number,
    cs.seminar_period
  from public.cadet_class_enrollments e
  join public.class_sections cs on cs.id = e.class_section_id
  join public.profiles tp on tp.id = cs.teacher_id
  where e.cadet_id = p_cadet_id
    and e.archived = false
    and e.school_year = v_school_year
  order by e.slot_type;
end;
$$;

create or replace function public.get_teacher_classes(p_teacher_id uuid default auth.uid())
returns table (
  section_id uuid,
  course_name text,
  term_number smallint,
  seminar_period text,
  school_year text,
  roster_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_teacher_id <> auth.uid() and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  return query
  select
    cs.id,
    cs.course_name,
    cs.term_number,
    cs.seminar_period,
    cs.school_year,
    count(e.id) filter (where e.archived = false)
  from public.class_sections cs
  left join public.cadet_class_enrollments e on e.class_section_id = cs.id
  where cs.teacher_id = p_teacher_id
    and cs.archived = false
    and cs.school_year = public.get_active_school_year()
  group by cs.id, cs.course_name, cs.term_number, cs.seminar_period, cs.school_year
  order by cs.term_number nulls last, cs.seminar_period;
end;
$$;

create or replace function public.get_class_section_detail(p_section_id uuid)
returns table (
  section_id uuid,
  course_name text,
  term_number smallint,
  seminar_period text,
  teacher_id uuid,
  cadet_id uuid,
  cadet_first_name text,
  cadet_last_name text,
  company_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid;
begin
  select cs.teacher_id into v_teacher_id
  from public.class_sections cs
  where cs.id = p_section_id and cs.archived = false;

  if v_teacher_id is null then
    raise exception 'Section not found';
  end if;

  if v_teacher_id <> auth.uid() and public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied';
  end if;

  return query
  select
    cs.id,
    cs.course_name,
    cs.term_number,
    cs.seminar_period,
    cs.teacher_id,
    p.id,
    p.first_name,
    p.last_name,
    c.company_name
  from public.class_sections cs
  left join public.cadet_class_enrollments e on e.class_section_id = cs.id and e.archived = false
  left join public.profiles p on p.id = e.cadet_id
  left join public.companies c on c.id = p.company_id
  where cs.id = p_section_id;
end;
$$;

create or replace function public.get_cadet_oversight(p_cadet_id uuid)
returns table (
  assignment_id uuid,
  assignment_type text,
  source text,
  staff_id uuid,
  staff_first_name text,
  staff_last_name text,
  course_name text,
  is_self boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_cadet_id <> auth.uid() and public.get_my_role_level() < 50 then
    raise exception 'Permission denied';
  end if;

  return query
  select
    o.id,
    o.assignment_type,
    o.source,
    o.staff_id,
    s.first_name,
    s.last_name,
    cs.course_name,
    o.staff_id = auth.uid()
  from public.cadet_oversight_assignments o
  join public.profiles s on s.id = o.staff_id
  left join public.class_sections cs on cs.id = o.class_section_id
  where o.cadet_id = p_cadet_id
    and o.is_active = true
  order by
    case o.assignment_type
      when 'teacher' then 1
      when 'coach' then 2
      when 'tac' then 3
      when 'secondary' then 4
      else 5
    end,
    s.last_name;
end;
$$;

create or replace function public.get_my_oversight_cadets()
returns table (
  cadet_id uuid,
  first_name text,
  last_name text,
  company_name text,
  assignment_types text[]
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.get_my_role_level() < 50 then
    raise exception 'Permission denied';
  end if;

  return query
  select
    p.id,
    p.first_name,
    p.last_name,
    c.company_name,
    array_agg(distinct o.assignment_type order by o.assignment_type)
  from public.cadet_oversight_assignments o
  join public.profiles p on p.id = o.cadet_id
  left join public.companies c on c.id = p.company_id
  where o.staff_id = auth.uid()
    and o.is_active = true
  group by p.id, p.first_name, p.last_name, c.company_name
  order by p.last_name, p.first_name;
end;
$$;

create or replace function public.get_available_sections_for_slot(p_slot_type text)
returns table (
  section_id uuid,
  course_name text,
  teacher_first_name text,
  teacher_last_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select cs.id, cs.course_name, p.first_name, p.last_name
  from public.class_sections cs
  join public.profiles p on p.id = cs.teacher_id
  where cs.archived = false
    and cs.school_year = public.get_active_school_year()
    and (
      (p_slot_type like 'term_%' and cs.term_number = substring(p_slot_type from 6)::integer)
      or (p_slot_type = 'seminar_a' and cs.seminar_period = 'a')
      or (p_slot_type = 'seminar_b' and cs.seminar_period = 'b')
    )
  order by cs.course_name;
$$;

-- ---------------------------------------------------------------------------
-- 10. Triggers
-- ---------------------------------------------------------------------------

create or replace function public.trg_sync_oversight_on_enrollment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    perform public.sync_cadet_oversight(old.cadet_id, auth.uid());
    return old;
  end if;

  perform public.sync_cadet_oversight(new.cadet_id, auth.uid());
  return new;
end;
$$;

drop trigger if exists trg_oversight_on_enrollment on public.cadet_class_enrollments;
create trigger trg_oversight_on_enrollment
after insert or update or delete on public.cadet_class_enrollments
for each row execute function public.trg_sync_oversight_on_enrollment();

create or replace function public.trg_sync_oversight_on_cadet_company()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  if new.company_id is distinct from old.company_id then
    perform public.sync_cadet_oversight(new.id, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_oversight_on_cadet_company on public.profiles;
create trigger trg_oversight_on_cadet_company
after update of company_id on public.profiles
for each row execute function public.trg_sync_oversight_on_cadet_company();

create or replace function public.trg_sync_oversight_on_cadet_sports()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  if new.sport_fall is distinct from old.sport_fall
    or new.sport_winter is distinct from old.sport_winter
    or new.sport_spring is distinct from old.sport_spring then
    perform public.sync_cadet_oversight(new.profile_id, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_oversight_on_cadet_sports on public.cadet_profiles;
create trigger trg_oversight_on_cadet_sports
after update of sport_fall, sport_winter, sport_spring on public.cadet_profiles
for each row execute function public.trg_sync_oversight_on_cadet_sports();

-- ---------------------------------------------------------------------------
-- 11. RLS
-- ---------------------------------------------------------------------------

alter table public.class_sections enable row level security;
alter table public.cadet_class_enrollments enable row level security;
alter table public.cadet_oversight_assignments enable row level security;
alter table public.cadet_oversight_assignment_log enable row level security;
alter table public.oversight_assignment_events enable row level security;
alter table public.cadet_oversight_secondary_opt_outs enable row level security;

grant select on public.class_sections to authenticated;
grant select on public.cadet_class_enrollments to authenticated;
grant select on public.cadet_oversight_assignments to authenticated;
grant select on public.cadet_oversight_assignment_log to authenticated;

grant all on public.class_sections to service_role;
grant all on public.cadet_class_enrollments to service_role;
grant all on public.cadet_oversight_assignments to service_role;
grant all on public.cadet_oversight_assignment_log to service_role;
grant all on public.oversight_assignment_events to service_role;
grant all on public.cadet_oversight_secondary_opt_outs to service_role;

create policy "Faculty can view class sections"
on public.class_sections for select to authenticated
using (public.get_my_role_level() >= 50 or teacher_id = auth.uid());

create policy "Staff can view enrollments in scope"
on public.cadet_class_enrollments for select to authenticated
using (
  cadet_id = auth.uid()
  or public.get_my_role_level() >= 50
);

create policy "Users can view oversight in scope"
on public.cadet_oversight_assignments for select to authenticated
using (
  cadet_id = auth.uid()
  or staff_id = auth.uid()
  or public.get_my_role_level() >= 50
);

create policy "Staff can view oversight audit in scope"
on public.cadet_oversight_assignment_log for select to authenticated
using (public.get_my_role_level() >= 50 or cadet_id = auth.uid());

-- Update get_all_academic_terms to include new columns
drop function if exists public.get_all_academic_terms();

create or replace function public.get_all_academic_terms()
returns table(
  id uuid,
  term_name text,
  start_date date,
  end_date date,
  school_year text,
  term_number smallint,
  archived boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'You do not have permission to view academic terms.';
  end if;

  return query
  select t.id, t.term_name, t.start_date, t.end_date, t.school_year, t.term_number, t.archived
  from public.academic_terms t
  order by t.school_year desc, t.term_number asc;
end;
$$;
