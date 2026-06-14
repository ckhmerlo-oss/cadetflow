-- Phase 1: Profile extension tables (cadet_profiles + staff_profiles).
-- Moves cadet/staff-specific columns out of profiles while keeping profiles.id as the identity hub.

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Extension tables
-- ---------------------------------------------------------------------------
create table public.cadet_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  cadet_rank text,
  grade_level text,
  room_number text,
  years_attended integer not null default 0,
  probation_status text default 'None',
  probation_notes text,
  sport_fall text default 'None',
  sport_winter text default 'None',
  sport_spring text default 'None',
  is_in_band boolean not null default false,
  extracurriculars jsonb not null default '[]'::jsonb,
  has_star_tours boolean not null default false,
  cached_tour_balance integer not null default 0,
  total_demerits integer not null default 0,
  conduct_status text,
  parent_name text,
  parent_email text,
  parent_phone text,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  staff_title text,
  department text,
  office_location text,
  work_phone text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cadet_profiles_probation_status on public.cadet_profiles (probation_status);
create index idx_cadet_profiles_is_in_band on public.cadet_profiles (is_in_band);
create index idx_cadet_profiles_sports on public.cadet_profiles (sport_fall, sport_winter, sport_spring);

-- ---------------------------------------------------------------------------
-- 2. Backfill from legacy profiles columns
-- ---------------------------------------------------------------------------
insert into public.cadet_profiles (
  profile_id,
  cadet_rank,
  grade_level,
  room_number,
  years_attended,
  probation_status,
  probation_notes,
  sport_fall,
  sport_winter,
  sport_spring,
  is_in_band,
  extracurriculars,
  has_star_tours,
  cached_tour_balance,
  total_demerits,
  conduct_status,
  parent_name,
  parent_email,
  parent_phone,
  phone_number
)
select
  p.id,
  p.cadet_rank,
  p.grade_level,
  p.room_number,
  coalesce(p.years_attended, 0),
  coalesce(p.probation_status, 'None'),
  p.probation_notes,
  coalesce(p.sport_fall, 'None'),
  coalesce(p.sport_winter, 'None'),
  coalesce(p.sport_spring, 'None'),
  coalesce(p.is_in_band, false),
  coalesce(nullif(btrim(p.extracurriculars::text), '')::jsonb, '[]'::jsonb),
  coalesce(p.has_star_tours, false),
  coalesce(p.cached_tour_balance, 0),
  coalesce(p.total_demerits, 0),
  p.conduct_status,
  p.parent_name,
  p.parent_email,
  p.parent_phone,
  p.phone_number
from public.profiles p
left join public.roles r on r.id = p.role_id
where r.default_role_level is null or r.default_role_level < 50
on conflict (profile_id) do nothing;

insert into public.staff_profiles (
  profile_id,
  staff_title,
  department,
  office_location,
  work_phone,
  internal_notes
)
select
  p.id,
  p.cadet_rank,
  null,
  p.room_number,
  p.phone_number,
  null
from public.profiles p
join public.roles r on r.id = p.role_id
where r.default_role_level >= 50
on conflict (profile_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Integrity helpers and sync triggers
-- ---------------------------------------------------------------------------
create or replace function public.profile_role_level(p_profile_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(r.default_role_level, 0)
  from public.profiles p
  left join public.roles r on r.id = p.role_id
  where p.id = p_profile_id;
$$;

create or replace function public.is_cadet(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.profile_role_level(p_profile_id) < 50;
$$;

create or replace function public.is_staff(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.profile_role_level(p_profile_id) >= 50;
$$;

create or replace function public.ensure_cadet_profile(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.staff_profiles where profile_id = p_profile_id;
  insert into public.cadet_profiles (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;
end;
$$;

create or replace function public.ensure_staff_profile(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.cadet_profiles where profile_id = p_profile_id;
  insert into public.staff_profiles (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;
end;
$$;

create or replace function public.validate_cadet_profile_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_cadet(new.profile_id) then
    raise exception 'cadet_profiles row requires a cadet-capable profile (role level < 50 or unassigned)';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.validate_staff_profile_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff(new.profile_id) then
    raise exception 'staff_profiles row requires a staff profile (role level >= 50)';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger tr_validate_cadet_profile_row
before insert or update on public.cadet_profiles
for each row execute function public.validate_cadet_profile_row();

create trigger tr_validate_staff_profile_row
before insert or update on public.staff_profiles
for each row execute function public.validate_staff_profile_row();

create or replace function public.sync_profile_extensions_on_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_level integer;
  v_new_level integer;
  v_staff_title text;
begin
  if tg_op = 'INSERT' then
    v_new_level := public.profile_role_level(new.id);
    if v_new_level >= 50 then
      perform public.ensure_staff_profile(new.id);
    else
      perform public.ensure_cadet_profile(new.id);
    end if;
    return new;
  end if;

  if new.role_id is not distinct from old.role_id then
    return new;
  end if;

  v_old_level := public.profile_role_level(old.id);
  v_new_level := public.profile_role_level(new.id);

  if v_old_level < 50 and v_new_level >= 50 then
    select cadet_rank into v_staff_title
    from public.cadet_profiles
    where profile_id = new.id;

    delete from public.cadet_profiles where profile_id = new.id;
    insert into public.staff_profiles (profile_id, staff_title)
    values (new.id, v_staff_title)
    on conflict (profile_id) do update
      set staff_title = coalesce(public.staff_profiles.staff_title, excluded.staff_title);
  elsif v_old_level >= 50 and v_new_level < 50 then
    select staff_title into v_staff_title
    from public.staff_profiles
    where profile_id = new.id;

    delete from public.staff_profiles where profile_id = new.id;
    insert into public.cadet_profiles (profile_id, cadet_rank)
    values (new.id, v_staff_title)
    on conflict (profile_id) do update
      set cadet_rank = coalesce(public.cadet_profiles.cadet_rank, excluded.cadet_rank);
  end if;

  return new;
end;
$$;

create trigger tr_sync_profile_extensions_on_role_change
after insert or update of role_id on public.profiles
for each row execute function public.sync_profile_extensions_on_role_change();

-- ---------------------------------------------------------------------------
-- 4. RLS on extension tables
-- ---------------------------------------------------------------------------
alter table public.cadet_profiles enable row level security;
alter table public.staff_profiles enable row level security;

grant select, insert, update, delete on table public.cadet_profiles to authenticated;
grant select, insert, update, delete on table public.staff_profiles to authenticated;
grant all on table public.cadet_profiles to service_role;
grant all on table public.staff_profiles to service_role;

create policy "Users can view cadet profiles in scope"
on public.cadet_profiles
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.get_my_role_level() >= public.get_role_level_for_user(profile_id)
);

create policy "Managers can update cadet profiles in scope"
on public.cadet_profiles
for update
to authenticated
using (
  public.get_my_role_level() >= 50
  and exists (
    select 1
    from public.get_my_roster_permissions() perms(role_level, company_id, can_manage_all, can_manage_own)
    join public.profiles p on p.id = cadet_profiles.profile_id
    where
      perms.can_manage_all = true
      or (
        perms.can_manage_own = true
        and p.company_id = perms.company_id
      )
  )
)
with check (
  public.get_my_role_level() >= 50
  and exists (
    select 1
    from public.get_my_roster_permissions() perms(role_level, company_id, can_manage_all, can_manage_own)
    join public.profiles p on p.id = cadet_profiles.profile_id
    where
      perms.can_manage_all = true
      or (
        perms.can_manage_own = true
        and p.company_id = perms.company_id
      )
  )
);

create policy "Managers can insert cadet profiles in scope"
on public.cadet_profiles
for insert
to authenticated
with check (
  public.get_my_role_level() >= 50
);

create policy "Admins can view staff profiles"
on public.staff_profiles
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.get_my_role_level() >= 50
);

create policy "Admins can manage staff profiles"
on public.staff_profiles
for all
to authenticated
using (public.get_my_role_level() >= 90)
with check (public.get_my_role_level() >= 90);

-- ---------------------------------------------------------------------------
-- 5. Update band_details FK to cadet_profiles (optional enforcement)
-- ---------------------------------------------------------------------------
alter table public.band_details
  drop constraint if exists band_details_cadet_id_fkey;

alter table public.band_details
  add constraint band_details_cadet_id_fkey
  foreign key (cadet_id) references public.cadet_profiles (profile_id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 6. Rewrite tour / roster / notification functions
-- ---------------------------------------------------------------------------
create or replace function public.refresh_cadet_tour_cache(p_cadet_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_new_balance integer;
begin
  v_new_balance := public.get_cadet_tour_balance(p_cadet_id);

  update public.cadet_profiles
  set cached_tour_balance = v_new_balance
  where profile_id = p_cadet_id;
end;
$function$;

create or replace function public.get_cadet_tour_balance(p_cadet_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_total_tours_earned integer := 0;
  v_ledger_impact integer := 0;
  v_term record;
  v_report record;
  v_term_credits_remaining integer;
  v_term_cat3_received boolean;
  v_tours_to_add integer;
  v_has_star_tours boolean;
begin
  select coalesce(cp.has_star_tours, false)
  into v_has_star_tours
  from public.cadet_profiles cp
  where cp.profile_id = p_cadet_id;

  for v_term in select * from public.academic_terms order by start_date asc loop
    v_term_credits_remaining := 15;
    v_term_cat3_received := false;

    for v_report in
      select r.demerits_effective, coalesce(ot.policy_category, 1) as policy_category
      from public.demerit_reports r
      left join public.offense_types ot on r.offense_type_id = ot.id
      where r.subject_cadet_id = p_cadet_id
        and r.status = 'completed'
        and r.date_of_offense between v_term.start_date and v_term.end_date
        and r.demerits_effective > 0
      order by r.date_of_offense asc, r.created_at asc
    loop
      if v_report.policy_category = 3 then
        v_term_cat3_received := true;
        v_term_credits_remaining := 0;
      end if;

      if v_term_cat3_received then
        v_total_tours_earned := v_total_tours_earned + v_report.demerits_effective;
      else
        if v_report.demerits_effective <= v_term_credits_remaining then
          v_term_credits_remaining := v_term_credits_remaining - v_report.demerits_effective;
        else
          v_tours_to_add := v_report.demerits_effective - v_term_credits_remaining;
          v_total_tours_earned := v_total_tours_earned + v_tours_to_add;
          v_term_credits_remaining := 0;
        end if;
      end if;
    end loop;
  end loop;

  select coalesce(sum(
    case
      when amount > 0 then amount
      when amount < 0 and v_has_star_tours = false then amount
      else 0
    end
  ), 0)
  into v_ledger_impact
  from public.tour_ledger
  where cadet_id = p_cadet_id;

  return v_total_tours_earned + v_ledger_impact;
end;
$function$;

create or replace function public.log_served_tours(p_cadet_id uuid, p_tours_served integer, p_comment text)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_has_star_tours boolean;
begin
  select cp.has_star_tours
  into v_has_star_tours
  from public.cadet_profiles cp
  where cp.profile_id = p_cadet_id;

  if v_has_star_tours then
    raise exception 'Cannot log served time. This cadet is on * (Star) Tours.';
  end if;

  insert into public.tour_ledger (cadet_id, report_id, term_id, action, amount, comment, staff_id)
  values (p_cadet_id, null, null, 'served', -abs(p_tours_served), p_comment, auth.uid());
end;
$function$;

create or replace function public.set_tour_balance(p_cadet_id uuid, p_new_balance integer, p_comment text)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_current_balance integer;
begin
  if public.get_my_role_level() < 90 then
    raise exception 'Permission Denied: Only Commandant Staff can manually set tour balances.';
  end if;

  select coalesce(cp.cached_tour_balance, 0)
  into v_current_balance
  from public.cadet_profiles cp
  where cp.profile_id = p_cadet_id;

  insert into public.tour_ledger (cadet_id, staff_id, amount, action, comment)
  values (
    p_cadet_id,
    auth.uid(),
    p_new_balance - coalesce(v_current_balance, 0),
    'adjustment',
    coalesce(p_comment, 'Manual balance set')
  );
end;
$function$;

create or replace function public.get_cadet_ledger_stats(p_cadet_id uuid)
returns table(term_demerits bigint, year_demerits bigint, total_tours_marched bigint, current_tour_balance integer)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_current_term record;
begin
  select * into v_current_term
  from public.academic_terms
  where now() between start_date and (end_date + interval '1 day')
  limit 1;

  return query
  select
    coalesce(sum(case
      when dr.date_of_offense between v_current_term.start_date and v_current_term.end_date
      then dr.demerits_effective else 0
    end), 0) as term_demerits,
    coalesce(sum(dr.demerits_effective), 0) as year_demerits,
    (
      select coalesce(abs(sum(amount)), 0)
      from public.tour_ledger
      where cadet_id = p_cadet_id and action = 'served'
    ) as total_tours_marched,
    coalesce(cp.cached_tour_balance, 0) as current_tour_balance
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.demerit_reports dr on p.id = dr.subject_cadet_id and dr.status = 'completed'
  where p.id = p_cadet_id
  group by p.id, cp.cached_tour_balance;
end;
$function$;

create or replace function public.get_tour_sheet()
returns table(cadet_id uuid, last_name text, first_name text, company_name text, total_tours integer, has_star_tours boolean, tours_logged_today boolean)
language plpgsql
security definer
set search_path = public
as $function$
begin
  return query
  select
    p.id as cadet_id,
    p.last_name,
    p.first_name,
    c.company_name,
    coalesce(cp.cached_tour_balance, 0) as total_tours,
    coalesce(cp.has_star_tours, false) as has_star_tours,
    exists (
      select 1 from public.tour_ledger tl
      where tl.cadet_id = p.id
        and tl.action = 'served'
        and tl.created_at >= current_date
    ) as tours_logged_today
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.companies c on p.company_id = c.id
  where coalesce(cp.cached_tour_balance, 0) > 0 or cp.has_star_tours = true
  order by p.last_name, p.first_name;
end;
$function$;

create or replace function public.get_tour_sheet_debtors()
returns table(id uuid, balance integer)
language sql
security definer
set search_path = public
as $function$
  select cp.profile_id as id, cp.cached_tour_balance as balance
  from public.cadet_profiles cp
  where cp.cached_tour_balance > 0;
$function$;

create or replace function public.get_full_roster()
returns table(id uuid, first_name text, last_name text, cadet_rank text, company_name text, role_name text, grade_level text, room_number text, term_demerits bigint, year_demerits bigint, current_tour_balance integer, has_star_tours boolean, conduct_status text, recent_reports json)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_perms record;
  v_current_term record;
begin
  select * into v_perms from public.get_my_roster_permissions();

  if (v_perms.role_level < 50 and v_perms.can_manage_all = false and v_perms.can_manage_own = false) then
    raise exception 'Permission Denied: You are not authorized to view the roster.';
  end if;

  select * into v_current_term
  from public.academic_terms
  where now() between start_date and (end_date + interval '1 day')
  limit 1;

  return query
  select
    p.id,
    p.first_name,
    p.last_name,
    cp.cadet_rank,
    c.company_name,
    r.role_name,
    cp.grade_level,
    cp.room_number,
    coalesce(stats.term_demerits, 0) as term_demerits,
    coalesce(stats.year_demerits, 0) as year_demerits,
    coalesce(cp.cached_tour_balance, 0) as current_tour_balance,
    cp.has_star_tours,
    public.calculate_conduct_status(coalesce(stats.term_demerits, 0), coalesce(stats.year_demerits, 0)) as conduct_status,
    rr.recent_reports
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  left join public.companies c on p.company_id = c.id
  left join public.roles r on p.role_id = r.id
  left join lateral (
    select
      sum(case
        when dr.date_of_offense between v_current_term.start_date and (v_current_term.end_date + interval '1 day')
        then dr.demerits_effective else 0
      end) as term_demerits,
      sum(dr.demerits_effective) as year_demerits
    from public.demerit_reports dr
    where dr.subject_cadet_id = p.id and dr.status = 'completed'
  ) stats on true
  left join lateral (
    select json_agg(json_build_object(
      'id', rpt.id,
      'offense_name', ot.offense_name,
      'status', rpt.status,
      'created_at', rpt.created_at,
      'appeal_status', a.status
    )) as recent_reports
    from (
      select * from public.demerit_reports
      where subject_cadet_id = p.id
      order by created_at desc
      limit 3
    ) rpt
    left join public.offense_types ot on rpt.offense_type_id = ot.id
    left join public.appeals a on rpt.id = a.report_id
  ) rr on true
  where
    (r.default_role_level < 50 or r.default_role_level is null)
    and (
      v_perms.can_manage_all = true
      or v_perms.role_level >= 50
      or (v_perms.can_manage_own = true and p.company_id = v_perms.company_id)
    )
  order by p.last_name, p.first_name;
end;
$function$;

drop function if exists public.get_faculty_roster();

create or replace function public.get_faculty_roster()
returns table(id uuid, first_name text, last_name text, staff_title text, department text, office_location text, work_phone text, company_name text, role_name text, email text, role_level integer)
language plpgsql
security definer
set search_path = public
as $function$
begin
  if public.get_my_role_level() < 90 then
    raise exception 'Permission denied: You must be an administrator to view faculty records.';
  end if;

  return query
  select
    p.id,
    p.first_name,
    p.last_name,
    sp.staff_title,
    sp.department,
    sp.office_location,
    sp.work_phone,
    c.company_name,
    r.role_name,
    u.email::text,
    r.default_role_level
  from public.profiles p
  join public.staff_profiles sp on sp.profile_id = p.id
  join public.roles r on p.role_id = r.id
  join auth.users u on p.id = u.id
  left join public.companies c on p.company_id = c.id
  where r.default_role_level >= 50
  order by p.last_name, p.first_name;
end;
$function$;

create or replace function public.is_band_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $function$
  select exists (
    select 1
    from public.profiles p
    left join public.roles r on r.id = p.role_id
    left join public.cadet_profiles cp on cp.profile_id = p.id
    left join public.band_details bd on bd.cadet_id = p.id
    where p.id = auth.uid()
      and (
        p.is_site_admin = true
        or coalesce(r.default_role_level, 0) >= 50
        or coalesce(r.role_name, '') = 'Band Director'
        or coalesce(bd.leadership_role, '') in (
          'Band Commander',
          'Drum Major',
          'Executive Officer',
          'Brass Captain',
          'Woodwind Captain',
          'Drum Captain'
        )
      )
  );
$function$;

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
begin
  select p.first_name, p.last_name, cp.sport_fall, cp.sport_winter, cp.sport_spring
  into v_cadet
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  where p.id = new.subject_cadet_id;

  if v_cadet.sport_fall is not null and v_cadet.sport_fall != 'None' then
    select id into v_sport_id from public.sports where name = v_cadet.sport_fall and season = 'Fall';
    if v_sport_id is not null then
      for v_coach in select coach_id from public.sport_coaches where sport_id = v_sport_id loop
        insert into public.notification_queue (user_id, event_type, subject, message, link_url)
        values (
          v_coach.coach_id,
          'team_alert',
          'Misconduct Report: ' || v_cadet.last_name,
          'A report has been filed against ' || v_cadet.first_name || ' ' || v_cadet.last_name || ' (' || v_cadet.sport_fall || ').',
          '/report/' || new.id
        );
      end loop;
    end if;
  end if;

  return new;
end;
$function$;

-- Update band_details RLS to use cadet_profiles.is_in_band
drop policy if exists "Band-affiliated users can view band details" on public.band_details;

create policy "Band-affiliated users can view band details"
on public.band_details
for select
to authenticated
using (
  cadet_id = auth.uid()
  or public.is_band_manager()
  or exists (
    select 1
    from public.cadet_profiles cp
    where cp.profile_id = auth.uid()
      and cp.is_in_band = true
  )
);

-- ---------------------------------------------------------------------------
-- 7. Drop legacy columns from profiles
-- ---------------------------------------------------------------------------
alter table public.profiles drop column if exists total_demerits;
alter table public.profiles drop column if exists cadet_rank;
alter table public.profiles drop column if exists conduct_status;
alter table public.profiles drop column if exists grade_level;
alter table public.profiles drop column if exists probation_status;
alter table public.profiles drop column if exists probation_notes;
alter table public.profiles drop column if exists room_number;
alter table public.profiles drop column if exists sport_fall;
alter table public.profiles drop column if exists sport_winter;
alter table public.profiles drop column if exists sport_spring;
alter table public.profiles drop column if exists years_attended;
alter table public.profiles drop column if exists has_star_tours;
alter table public.profiles drop column if exists cached_tour_balance;
alter table public.profiles drop column if exists is_in_band;
alter table public.profiles drop column if exists extracurriculars;
alter table public.profiles drop column if exists parent_name;
alter table public.profiles drop column if exists parent_email;
alter table public.profiles drop column if exists parent_phone;
alter table public.profiles drop column if exists phone_number;

-- Compatibility view for cadet-centric reads during rollout
create or replace view public.cadet_profile_view as
select
  p.id,
  p.first_name,
  p.last_name,
  p.role_id,
  p.company_id,
  p.is_site_admin,
  p.archived,
  p.has_seen_tour,
  cp.cadet_rank,
  cp.grade_level,
  cp.room_number,
  cp.years_attended,
  cp.probation_status,
  cp.probation_notes,
  cp.sport_fall,
  cp.sport_winter,
  cp.sport_spring,
  cp.is_in_band,
  cp.extracurriculars,
  cp.has_star_tours,
  cp.cached_tour_balance,
  cp.total_demerits,
  cp.conduct_status,
  cp.parent_name,
  cp.parent_email,
  cp.parent_phone,
  cp.phone_number
from public.profiles p
join public.cadet_profiles cp on cp.profile_id = p.id;

grant select on public.cadet_profile_view to authenticated;
grant select on public.cadet_profile_view to service_role;
