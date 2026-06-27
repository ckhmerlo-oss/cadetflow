-- Barracks roster accountability marks + sport short codes

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Sport short codes for roster tags
-- ---------------------------------------------------------------------------

alter table public.sports add column if not exists short_code text;

update public.sports set short_code = case name
  when 'JV Football' then 'JVF'
  when 'Varsity Football' then 'FB'
  when 'JV Soccer' then 'JVS'
  when 'Varsity Soccer' then 'SOC'
  when 'Cross Country' then 'XC'
  when 'Swimming (Off Season)' then 'SWM'
  when 'PG Lacrosse' then 'PGL'
  when 'PG Basketball' then 'PGB'
  when 'PG Football' then 'PGF'
  when 'PT' then 'PT'
  when 'JV Basketball' then 'JVB'
  when 'Varsity Basketball' then 'BKB'
  when 'Wrestling' then 'WRE'
  when 'Swimming' then 'SWM'
  when 'Indoor Track' then 'ITK'
  when 'Baseball' then 'BSB'
  when 'Varsity Lacrosse' then 'LAX'
  when 'Track & Field' then 'TRK'
  when 'Tennis' then 'TEN'
  when 'Golf' then 'GLF'
  else upper(left(replace(name, ' ', ''), 3))
end
where short_code is null;

create unique index if not exists idx_sports_short_code_season
  on public.sports (short_code, season)
  where short_code is not null;

-- ---------------------------------------------------------------------------
-- 2. Tag definitions
-- ---------------------------------------------------------------------------

create table if not exists public.barracks_roster_tag_definitions (
  code text primary key check (char_length(code) <= 3),
  label text not null,
  source_type text not null default 'manual' check (source_type in ('manual', 'auto')),
  sort_order integer not null default 0
);

insert into public.barracks_roster_tag_definitions (code, label, source_type, sort_order) values
  ('LV', 'Leave', 'manual', 1),
  ('MED', 'Medical', 'manual', 2),
  ('SUS', 'Suspended', 'manual', 3),
  ('CLB', 'Club', 'manual', 4),
  ('BND', 'Band', 'auto', 10),
  ('PRB', 'Probation', 'auto', 11)
on conflict (code) do update set
  label = excluded.label,
  source_type = excluded.source_type,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 3. Manual marks
-- ---------------------------------------------------------------------------

create table if not exists public.barracks_roster_marks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  company_letter text not null check (company_letter ~ '^[A-E]$'),
  tag_code text not null references public.barracks_roster_tag_definitions (code) on delete restrict,
  note text,
  marked_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (profile_id, company_letter, tag_code)
);

create index if not exists idx_barracks_roster_marks_company
  on public.barracks_roster_marks (company_letter);

create index if not exists idx_barracks_roster_marks_profile
  on public.barracks_roster_marks (profile_id);

alter table public.barracks_roster_tag_definitions enable row level security;
alter table public.barracks_roster_marks enable row level security;

-- ---------------------------------------------------------------------------
-- 4. Helpers
-- ---------------------------------------------------------------------------

create or replace function public._barracks_company_id_from_letter(p_company_letter text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select br.company_id
  from public.barracks_rooms br
  where br.company_letter = p_company_letter
  limit 1;
$$;

create or replace function public._barracks_current_season()
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  v_month int := extract(month from current_date)::int;
begin
  if v_month in (8, 9, 10, 11) then
    return 'Fall';
  elsif v_month in (12, 1, 2) then
    return 'Winter';
  else
    return 'Spring';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. RPCs
-- ---------------------------------------------------------------------------

create or replace function public.list_barracks_roster_marks(p_company_letter text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_company_id := public._barracks_company_id_from_letter(p_company_letter);
  if v_company_id is null then
    raise exception 'Company not found';
  end if;

  if not public._barracks_can_read_room(v_company_id) then
    raise exception 'Permission denied';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'profile_id', m.profile_id,
      'tag_code', m.tag_code,
      'note', m.note,
      'marked_by', m.marked_by,
      'created_at', m.created_at
    ) order by m.profile_id, m.tag_code)
    from public.barracks_roster_marks m
    where m.company_letter = p_company_letter
  ), '[]'::jsonb);
end;
$$;

create or replace function public.apply_barracks_roster_marks(
  p_company_letter text,
  p_profile_ids uuid[],
  p_tag_codes text[],
  p_note text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_count integer := 0;
  v_pid uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_company_id := public._barracks_company_id_from_letter(p_company_letter);
  if v_company_id is null then
    raise exception 'Company not found';
  end if;

  if not public._barracks_can_tac_manage(v_company_id) then
    raise exception 'Permission denied';
  end if;

  if p_profile_ids is null or array_length(p_profile_ids, 1) is null then
    return 0;
  end if;

  if p_tag_codes is null or array_length(p_tag_codes, 1) is null then
    return 0;
  end if;

  foreach v_pid in array p_profile_ids loop
    foreach v_code in array p_tag_codes loop
      insert into public.barracks_roster_marks (
        profile_id, company_letter, tag_code, note, marked_by
      ) values (
        v_pid, p_company_letter, upper(v_code), nullif(btrim(p_note), ''), auth.uid()
      )
      on conflict (profile_id, company_letter, tag_code)
      do update set
        note = coalesce(excluded.note, public.barracks_roster_marks.note),
        marked_by = auth.uid(),
        created_at = now();
      v_count := v_count + 1;
    end loop;
  end loop;

  return v_count;
end;
$$;

create or replace function public.remove_barracks_roster_marks(
  p_company_letter text,
  p_profile_ids uuid[],
  p_tag_codes text[] default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_deleted integer;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_company_id := public._barracks_company_id_from_letter(p_company_letter);
  if v_company_id is null then
    raise exception 'Company not found';
  end if;

  if not public._barracks_can_tac_manage(v_company_id) then
    raise exception 'Permission denied';
  end if;

  delete from public.barracks_roster_marks m
  where m.company_letter = p_company_letter
    and m.profile_id = any(p_profile_ids)
    and (p_tag_codes is null or m.tag_code = any(
      array(select upper(unnest(p_tag_codes)))
    ));

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function public.clear_barracks_roster_marks(
  p_company_letter text,
  p_tag_code text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_deleted integer;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_company_id := public._barracks_company_id_from_letter(p_company_letter);
  if v_company_id is null then
    raise exception 'Company not found';
  end if;

  if not public._barracks_can_tac_manage(v_company_id) then
    raise exception 'Permission denied';
  end if;

  delete from public.barracks_roster_marks m
  where m.company_letter = p_company_letter
    and (p_tag_code is null or m.tag_code = upper(p_tag_code));

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------

create policy barracks_roster_tag_definitions_select on public.barracks_roster_tag_definitions
  for select to authenticated using (true);

create policy barracks_roster_marks_select on public.barracks_roster_marks
  for select to authenticated
  using (
    public._barracks_can_read_room(public._barracks_company_id_from_letter(company_letter))
  );

create policy barracks_roster_marks_insert on public.barracks_roster_marks
  for insert to authenticated
  with check (
    public._barracks_can_tac_manage(public._barracks_company_id_from_letter(company_letter))
  );

create policy barracks_roster_marks_update on public.barracks_roster_marks
  for update to authenticated
  using (
    public._barracks_can_tac_manage(public._barracks_company_id_from_letter(company_letter))
  );

create policy barracks_roster_marks_delete on public.barracks_roster_marks
  for delete to authenticated
  using (
    public._barracks_can_tac_manage(public._barracks_company_id_from_letter(company_letter))
  );

grant select on public.barracks_roster_tag_definitions to authenticated;
grant select, insert, update, delete on public.barracks_roster_marks to authenticated;

grant execute on function public.list_barracks_roster_marks(text) to authenticated;
grant execute on function public.apply_barracks_roster_marks(text, uuid[], text[], text) to authenticated;
grant execute on function public.remove_barracks_roster_marks(text, uuid[], text[]) to authenticated;
grant execute on function public.clear_barracks_roster_marks(text, text) to authenticated;
