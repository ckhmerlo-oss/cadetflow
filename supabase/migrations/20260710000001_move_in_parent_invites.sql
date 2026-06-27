-- Move-in parent invites, cadet-parent links, external form submit + TAC validation

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Parent role (global, Day 11 baseline)
-- ---------------------------------------------------------------------------

insert into public.roles (
  id,
  role_name,
  default_role_level,
  company_id,
  can_manage_own_company_roster,
  can_manage_all_rosters
) values (
  'e7110000-0000-0000-0000-000000000001',
  'Parent',
  15,
  null,
  false,
  false
) on conflict (id) do update set
  role_name = excluded.role_name,
  default_role_level = excluded.default_role_level;

-- ---------------------------------------------------------------------------
-- 2. Cadet-parent links
-- ---------------------------------------------------------------------------

create table if not exists public.cadet_parent_links (
  id uuid primary key default gen_random_uuid(),
  cadet_profile_id uuid not null references public.cadet_profiles (profile_id) on delete cascade,
  parent_profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_by_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint cadet_parent_links_unique_pair unique (cadet_profile_id, parent_profile_id)
);

create index if not exists idx_cadet_parent_links_parent
  on public.cadet_parent_links (parent_profile_id)
  where status = 'active';

create index if not exists idx_cadet_parent_links_cadet
  on public.cadet_parent_links (cadet_profile_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- 3. Parent invites (move_in purpose for now; Day 11 extends)
-- ---------------------------------------------------------------------------

create table if not exists public.parent_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null,
  purpose text not null default 'move_in' check (purpose in ('move_in')),
  cadet_id uuid not null references public.profiles (id) on delete restrict,
  barracks_room_id uuid not null references public.barracks_rooms (id) on delete restrict,
  move_in_form_id uuid references public.room_move_in_forms (id) on delete set null,
  recipient_email text not null,
  recipient_phone text,
  locked_bunk text not null check (locked_bunk in ('top', 'bottom')),
  locked_desk_side text not null check (locked_desk_side in ('left', 'right')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_id uuid references public.profiles (id) on delete set null,
  created_by_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_parent_invites_token_hash
  on public.parent_invites (token_hash)
  where revoked_at is null;

create index if not exists idx_parent_invites_room
  on public.parent_invites (barracks_room_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Extend room_move_in_forms
-- ---------------------------------------------------------------------------

alter table public.room_move_in_forms
  add column if not exists submission_status text not null default 'validated';

alter table public.room_move_in_forms
  add column if not exists locked_bunk text;

alter table public.room_move_in_forms
  add column if not exists locked_desk_side text;

alter table public.room_move_in_forms
  add column if not exists invite_id uuid;

alter table public.room_move_in_forms
  drop constraint if exists room_move_in_forms_submission_status_check;

alter table public.room_move_in_forms
  add constraint room_move_in_forms_submission_status_check
  check (submission_status in ('draft', 'submitted', 'validated'));

alter table public.room_move_in_forms
  drop constraint if exists room_move_in_forms_locked_bunk_check;

alter table public.room_move_in_forms
  add constraint room_move_in_forms_locked_bunk_check
  check (locked_bunk is null or locked_bunk in ('top', 'bottom'));

alter table public.room_move_in_forms
  drop constraint if exists room_move_in_forms_locked_desk_side_check;

alter table public.room_move_in_forms
  add constraint room_move_in_forms_locked_desk_side_check
  check (locked_desk_side is null or locked_desk_side in ('left', 'right'));

-- Backfill legacy TAC-completed forms
update public.room_move_in_forms
set submission_status = 'validated'
where submission_status is distinct from 'validated'
  and validated_by_id is not null
  and completed_at is not null;

update public.room_move_in_forms
set submission_status = 'validated'
where submission_status = 'draft'
  and completed_at is not null
  and validated_by_id is not null;

alter table public.room_move_in_forms
  drop constraint if exists room_move_in_forms_invite_id_fkey;

alter table public.room_move_in_forms
  add constraint room_move_in_forms_invite_id_fkey
  foreign key (invite_id) references public.parent_invites (id) on delete set null;

alter table public.parent_invites
  drop constraint if exists parent_invites_move_in_form_id_fkey;

alter table public.parent_invites
  add constraint parent_invites_move_in_form_id_fkey
  foreign key (move_in_form_id) references public.room_move_in_forms (id) on delete set null;

-- Notification event for TAC review queue
insert into public.notification_event_types (code, category, title_template, description) values
  ('move_in.submitted', 'new_report', 'Move-in form submitted', 'A move-in inspection form was submitted for TAC review.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Permission helpers
-- ---------------------------------------------------------------------------

create or replace function public._parent_role_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.roles where role_name = 'Parent' limit 1;
$$;

create or replace function public._is_parent_linked_to_cadet(p_cadet_id uuid, p_parent_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cadet_parent_links l
    where l.cadet_profile_id = p_cadet_id
      and l.parent_profile_id = coalesce(p_parent_id, auth.uid())
      and l.status = 'active'
  );
$$;

create or replace function public._can_access_move_in_form(p_form_id uuid, p_user_id uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_form public.room_move_in_forms%rowtype;
  v_company_id uuid;
begin
  if p_user_id is null then
    return false;
  end if;

  select * into v_form from public.room_move_in_forms where id = p_form_id;
  if not found then
    return false;
  end if;

  if v_form.cadet_id = p_user_id then
    return true;
  end if;

  if public._is_parent_linked_to_cadet(v_form.cadet_id, p_user_id) then
    return true;
  end if;

  select br.company_id into v_company_id
  from public.barracks_rooms br
  where br.id = v_form.barracks_room_id;

  return public._barracks_can_read_room(v_company_id);
end;
$$;

create or replace function public._subsection_allowed_for_external_item(
  p_section_key text,
  p_subsection text,
  p_locked_bunk text,
  p_locked_desk_side text
)
returns boolean
language plpgsql
immutable
as $$
begin
  if p_subsection is null then
    return true;
  end if;

  if p_section_key in ('mattress', 'bed_locker') then
    return p_subsection = p_locked_bunk;
  end if;

  if p_section_key in ('desk', 'chair') then
    return p_subsection = p_locked_desk_side;
  end if;

  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Invite RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_move_in_invite(
  p_room_id uuid,
  p_cadet_id uuid,
  p_recipient_email text,
  p_locked_bunk text,
  p_locked_desk_side text,
  p_expires_in_days integer default 14,
  p_recipient_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_form_id uuid;
  v_invite_id uuid;
  v_token text;
  v_token_hash text;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  if p_locked_bunk not in ('top', 'bottom') then
    raise exception 'Invalid bunk';
  end if;

  if p_locked_desk_side not in ('left', 'right') then
    raise exception 'Invalid desk side';
  end if;

  v_email := lower(trim(p_recipient_email));
  if v_email = '' or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Invalid email';
  end if;

  if not exists (
    select 1 from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
    where p.id = p_cadet_id
      and coalesce(p.archived, false) = false
  ) then
    raise exception 'Cadet not found';
  end if;

  insert into public.room_move_in_forms (
    barracks_room_id,
    cadet_id,
    room_number,
    filled_by_id,
    submission_status,
    locked_bunk,
    locked_desk_side,
    completed_at
  ) values (
    p_room_id,
    p_cadet_id,
    v_room.room_number,
    auth.uid(),
    'draft',
    p_locked_bunk,
    p_locked_desk_side,
    null
  )
  returning id into v_form_id;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');

  insert into public.parent_invites (
    token_hash,
    purpose,
    cadet_id,
    barracks_room_id,
    move_in_form_id,
    recipient_email,
    recipient_phone,
    locked_bunk,
    locked_desk_side,
    expires_at,
    created_by_id
  ) values (
    v_token_hash,
    'move_in',
    p_cadet_id,
    p_room_id,
    v_form_id,
    v_email,
    nullif(trim(p_recipient_phone), ''),
    p_locked_bunk,
    p_locked_desk_side,
    now() + make_interval(days => greatest(coalesce(p_expires_in_days, 14), 1)),
    auth.uid()
  )
  returning id into v_invite_id;

  update public.room_move_in_forms
  set invite_id = v_invite_id
  where id = v_form_id;

  return jsonb_build_object(
    'invite_id', v_invite_id,
    'form_id', v_form_id,
    'token', v_token,
    'recipient_email', v_email,
    'expires_at', (now() + make_interval(days => greatest(coalesce(p_expires_in_days, 14), 1)))
  );
end;
$$;

create or replace function public.get_move_in_invite_public(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_invite public.parent_invites%rowtype;
  v_cadet_first text;
  v_room_number text;
begin
  if coalesce(trim(p_token), '') = '' then
    raise exception 'Invalid token';
  end if;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  select * into v_invite
  from public.parent_invites pi
  where pi.token_hash = v_hash
    and pi.purpose = 'move_in'
    and pi.revoked_at is null;

  if not found then
    raise exception 'Invite not found';
  end if;

  select p.first_name into v_cadet_first
  from public.profiles p
  where p.id = v_invite.cadet_id;

  select br.room_number into v_room_number
  from public.barracks_rooms br
  where br.id = v_invite.barracks_room_id;

  return jsonb_build_object(
    'invite_id', v_invite.id,
    'form_id', v_invite.move_in_form_id,
    'cadet_first_name', v_cadet_first,
    'room_number', v_room_number,
    'recipient_email', v_invite.recipient_email,
    'locked_bunk', v_invite.locked_bunk,
    'locked_desk_side', v_invite.locked_desk_side,
    'expires_at', v_invite.expires_at,
    'revoked_at', v_invite.revoked_at,
    'redeemed_at', v_invite.redeemed_at,
    'is_expired', v_invite.expires_at < now(),
    'is_active', v_invite.revoked_at is null and v_invite.expires_at >= now() and v_invite.redeemed_at is null
  );
end;
$$;

create or replace function public.redeem_parent_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_invite public.parent_invites%rowtype;
  v_parent_role_id uuid;
  v_user_email text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if coalesce(trim(p_token), '') = '' then
    raise exception 'Invalid token';
  end if;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  select * into v_invite
  from public.parent_invites pi
  where pi.token_hash = v_hash
    and pi.purpose = 'move_in'
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;

  if v_invite.revoked_at is not null then
    raise exception 'Invite revoked';
  end if;

  if v_invite.expires_at < now() then
    raise exception 'Invite expired';
  end if;

  select lower(email) into v_user_email
  from auth.users
  where id = auth.uid();

  if v_user_email is distinct from lower(v_invite.recipient_email) then
    raise exception 'This invite was sent to %', v_invite.recipient_email;
  end if;

  if v_invite.redeemed_at is null then
    update public.parent_invites
    set redeemed_at = now(),
        redeemed_by_id = auth.uid()
    where id = v_invite.id;
  elsif v_invite.redeemed_by_id is distinct from auth.uid() then
    raise exception 'Invite already redeemed by another account';
  end if;

  insert into public.cadet_parent_links (
    cadet_profile_id,
    parent_profile_id,
    status,
    created_by_id
  ) values (
    v_invite.cadet_id,
    auth.uid(),
    'active',
    v_invite.created_by_id
  )
  on conflict (cadet_profile_id, parent_profile_id) do update
  set status = 'active';

  update public.cadet_profiles
  set parent_email = v_invite.recipient_email
  where profile_id = v_invite.cadet_id;

  v_parent_role_id := public._parent_role_id();

  if v_parent_role_id is not null then
    update public.profiles p
    set role_id = v_parent_role_id,
        company_id = null
    where p.id = auth.uid()
      and (
        p.role_id is null
        or exists (
          select 1 from public.roles r
          where r.id = p.role_id
            and r.default_role_level <= 15
        )
      );
  end if;

  return jsonb_build_object(
    'form_id', v_invite.move_in_form_id,
    'cadet_id', v_invite.cadet_id,
    'room_id', v_invite.barracks_room_id
  );
end;
$$;

create or replace function public.revoke_parent_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.parent_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_invite from public.parent_invites where id = p_invite_id;
  if not found then
    raise exception 'Invite not found';
  end if;

  if not public._barracks_can_tac_manage(
    (select company_id from public.barracks_rooms where id = v_invite.barracks_room_id)
  ) then
    raise exception 'Permission denied';
  end if;

  update public.parent_invites
  set revoked_at = coalesce(revoked_at, now())
  where id = p_invite_id;
end;
$$;

create or replace function public.refresh_move_in_invite_token(p_invite_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_invite public.parent_invites%rowtype;
  v_token text;
  v_token_hash text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_invite from public.parent_invites where id = p_invite_id;
  if not found then
    raise exception 'Invite not found';
  end if;

  if not public._barracks_can_tac_manage(
    (select company_id from public.barracks_rooms where id = v_invite.barracks_room_id)
  ) then
    raise exception 'Permission denied';
  end if;

  if v_invite.revoked_at is not null then
    raise exception 'Invite revoked';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');

  update public.parent_invites
  set token_hash = v_token_hash,
      expires_at = now() + interval '14 days',
      redeemed_at = null,
      redeemed_by_id = null
  where id = p_invite_id;

  return jsonb_build_object(
    'invite_id', p_invite_id,
    'token', v_token,
    'recipient_email', v_invite.recipient_email,
    'expires_at', now() + interval '14 days'
  );
end;
$$;

create or replace function public.list_move_in_invites_for_room(p_room_id uuid)
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

  select company_id into v_company_id from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_tac_manage(v_company_id) then
    raise exception 'Permission denied';
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'id', pi.id,
        'cadet_id', pi.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = pi.cadet_id),
        'recipient_email', pi.recipient_email,
        'locked_bunk', pi.locked_bunk,
        'locked_desk_side', pi.locked_desk_side,
        'move_in_form_id', pi.move_in_form_id,
        'expires_at', pi.expires_at,
        'revoked_at', pi.revoked_at,
        'redeemed_at', pi.redeemed_at,
        'created_at', pi.created_at,
        'form_submission_status', (
          select f.submission_status from public.room_move_in_forms f where f.id = pi.move_in_form_id
        )
      ) order by pi.created_at desc)
      from public.parent_invites pi
      where pi.barracks_room_id = p_room_id
        and pi.purpose = 'move_in'
    ),
    '[]'::jsonb
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. External save + TAC validate
-- ---------------------------------------------------------------------------

create or replace function public.save_move_in_form_external(
  p_form_id uuid,
  p_items jsonb default '[]'::jsonb,
  p_notes text default null,
  p_mark_submit boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form public.room_move_in_forms%rowtype;
  v_item jsonb;
  v_item_id uuid;
  v_status text;
  v_template record;
  v_tac_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_form from public.room_move_in_forms where id = p_form_id for update;
  if not found then
    raise exception 'Form not found';
  end if;

  if not public._can_access_move_in_form(p_form_id) then
    raise exception 'Permission denied';
  end if;

  if v_form.cadet_id <> auth.uid()
     and not public._is_parent_linked_to_cadet(v_form.cadet_id) then
    raise exception 'Permission denied';
  end if;

  if v_form.submission_status = 'validated' then
    raise exception 'Form already validated';
  end if;

  if v_form.submission_status = 'submitted' and not p_mark_submit then
    raise exception 'Form already submitted';
  end if;

  if v_form.locked_bunk is null or v_form.locked_desk_side is null then
    raise exception 'Form missing subsection locks';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select t.section_key, t.subsection
    into v_template
    from public.room_inspection_item_templates t
    where t.item_key = v_item ->> 'item_key'
      and t.active = true;

    if not found then
      raise exception 'Invalid item key: %', v_item ->> 'item_key';
    end if;

    if not public._subsection_allowed_for_external_item(
      v_template.section_key,
      v_template.subsection,
      v_form.locked_bunk,
      v_form.locked_desk_side
    ) then
      raise exception 'Item not allowed for locked subsections: %', v_item ->> 'item_key';
    end if;

    v_item_id := nullif(v_item ->> 'id', '')::uuid;
    v_status := coalesce(v_item ->> 'status', 'N/A');

    if v_item_id is not null then
      update public.room_inspection_items
      set status = v_status,
          notes = nullif(v_item ->> 'notes', ''),
          updated_at = now()
      where id = v_item_id and move_in_form_id = p_form_id;
    else
      insert into public.room_inspection_items (
        move_in_form_id, item_key, item_label, sort_order, status, notes
      ) values (
        p_form_id,
        v_item ->> 'item_key',
        v_item ->> 'item_label',
        coalesce((v_item ->> 'sort_order')::int, 0),
        v_status,
        nullif(v_item ->> 'notes', '')
      );
    end if;
  end loop;

  update public.room_move_in_forms
  set
    filled_by_id = auth.uid(),
    notes = coalesce(p_notes, notes),
    submission_status = case when p_mark_submit then 'submitted' else submission_status end,
    completed_at = case when p_mark_submit then coalesce(completed_at, now()) else completed_at end,
    updated_at = now()
  where id = p_form_id;

  if p_mark_submit then
    select pi.created_by_id into v_tac_id
    from public.parent_invites pi
    where pi.move_in_form_id = p_form_id
    limit 1;

    if v_tac_id is null then
      v_tac_id := v_form.filled_by_id;
    end if;

    perform public.dispatch_notification(
      v_tac_id,
      'move_in.submitted',
      'Move-in form submitted',
      'Room ' || v_form.room_number || ' move-in form is ready for TAC review.',
      '/barracks/forms/' || p_form_id::text || '?type=move_in',
      'move_in.submitted:' || p_form_id::text || ':' || v_tac_id::text,
      jsonb_build_object('form_id', p_form_id, 'room_number', v_form.room_number)
    );
  end if;

  return p_form_id;
end;
$$;

create or replace function public.validate_move_in_form(p_form_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form public.room_move_in_forms%rowtype;
  v_item record;
  v_deficiency_codes text[] := array['DAM', 'CLN', 'FIX', 'REP', 'MIS'];
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_form from public.room_move_in_forms where id = p_form_id for update;
  if not found then
    raise exception 'Form not found';
  end if;

  if not public._barracks_can_tac_manage(
    (select company_id from public.barracks_rooms where id = v_form.barracks_room_id)
  ) then
    raise exception 'Permission denied';
  end if;

  if v_form.submission_status not in ('submitted', 'draft') then
    if v_form.submission_status = 'validated' then
      return p_form_id;
    end if;
    raise exception 'Form cannot be validated in current status';
  end if;

  for v_item in
    select i.id, i.status, i.item_label
    from public.room_inspection_items i
    where i.move_in_form_id = p_form_id
  loop
    if v_item.status = any(v_deficiency_codes) then
      perform public.create_work_order_from_inspection_item(
        p_form_id,
        v_item.id,
        v_form.barracks_room_id,
        v_item.status,
        v_item.item_label,
        v_form.cadet_id
      );
    end if;
  end loop;

  update public.room_move_in_forms
  set
    validated_by_id = auth.uid(),
    submission_status = 'validated',
    completed_at = coalesce(completed_at, now()),
    updated_at = now()
  where id = p_form_id;

  update public.barracks_rooms
  set latest_move_in_form_id = p_form_id
  where id = v_form.barracks_room_id;

  return p_form_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Update get_room_inspection_form for parents + new fields
-- ---------------------------------------------------------------------------

create or replace function public.get_room_inspection_form(p_form_id uuid, p_form_type text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_form jsonb;
  v_items jsonb;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if p_form_type = 'move_in' then
    if not public._can_access_move_in_form(p_form_id) then
      raise exception 'Permission denied';
    end if;

    select f.barracks_room_id into v_room_id
    from public.room_move_in_forms f where f.id = p_form_id;
    if not found then raise exception 'Form not found'; end if;

    select jsonb_build_object(
      'id', f.id,
      'form_type', 'move_in',
      'barracks_room_id', f.barracks_room_id,
      'room_number', f.room_number,
      'cadet_id', f.cadet_id,
      'filled_by_id', f.filled_by_id,
      'validated_by_id', f.validated_by_id,
      'completed_at', f.completed_at,
      'notes', f.notes,
      'created_at', f.created_at,
      'submission_status', f.submission_status,
      'locked_bunk', f.locked_bunk,
      'locked_desk_side', f.locked_desk_side,
      'invite_id', f.invite_id
    ) into v_form
    from public.room_move_in_forms f where f.id = p_form_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'item_key', i.item_key, 'item_label', i.item_label,
      'sort_order', i.sort_order, 'status', i.status, 'notes', i.notes
    ) order by i.sort_order), '[]'::jsonb)
    into v_items
    from public.room_inspection_items i
    where i.move_in_form_id = p_form_id;

  elsif p_form_type = 'move_out' then
    select f.barracks_room_id into v_room_id
    from public.room_move_out_forms f where f.id = p_form_id;
    if not found then raise exception 'Form not found'; end if;

    if not public._barracks_can_read_room(
      (select company_id from public.barracks_rooms where id = v_room_id)
    ) then
      raise exception 'Permission denied';
    end if;

    select jsonb_build_object(
      'id', f.id,
      'form_type', 'move_out',
      'barracks_room_id', f.barracks_room_id,
      'room_number', f.room_number,
      'cadet_id', f.cadet_id,
      'filled_by_id', f.filled_by_id,
      'completed_at', f.completed_at,
      'notes', f.notes,
      'created_at', f.created_at
    ) into v_form
    from public.room_move_out_forms f where f.id = p_form_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'item_key', i.item_key, 'item_label', i.item_label,
      'sort_order', i.sort_order, 'status', i.status, 'notes', i.notes
    ) order by i.sort_order), '[]'::jsonb)
    into v_items
    from public.room_inspection_items i
    where i.move_out_form_id = p_form_id;
  else
    raise exception 'Invalid form type';
  end if;

  return jsonb_build_object('form', v_form, 'items', v_items);
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. RLS
-- ---------------------------------------------------------------------------

alter table public.cadet_parent_links enable row level security;
alter table public.parent_invites enable row level security;

revoke all on table public.cadet_parent_links from anon;
revoke all on table public.parent_invites from anon;

grant select on table public.cadet_parent_links to authenticated;
grant select on table public.parent_invites to authenticated;
grant all on table public.cadet_parent_links to service_role;
grant all on table public.parent_invites to service_role;

drop policy if exists "Parent reads own cadet links" on public.cadet_parent_links;
create policy "Parent reads own cadet links"
on public.cadet_parent_links for select to authenticated
using (parent_profile_id = auth.uid());

drop policy if exists "TAC reads cadet parent links" on public.cadet_parent_links;
create policy "TAC reads cadet parent links"
on public.cadet_parent_links for select to authenticated
using (
  exists (
    select 1 from public.cadet_profiles cp
    join public.profiles p on p.id = cp.profile_id
    where cp.profile_id = cadet_parent_links.cadet_profile_id
      and public._barracks_can_read_room(p.company_id)
  )
);

drop policy if exists "TAC reads parent invites" on public.parent_invites;
create policy "TAC reads parent invites"
on public.parent_invites for select to authenticated
using (
  public._barracks_can_tac_manage(
    (select company_id from public.barracks_rooms where id = barracks_room_id)
  )
);

drop policy if exists "Scoped read move in forms" on public.room_move_in_forms;
create policy "Scoped read move in forms"
on public.room_move_in_forms for select to authenticated
using (
  exists (
    select 1 from public.barracks_rooms br
    where br.id = barracks_room_id
      and public._barracks_can_read_room(br.company_id)
  )
  or cadet_id = auth.uid()
  or public._is_parent_linked_to_cadet(cadet_id)
);

drop policy if exists "Scoped read inspection items" on public.room_inspection_items;
create policy "Scoped read inspection items"
on public.room_inspection_items for select to authenticated
using (
  (move_in_form_id is not null and public._can_access_move_in_form(move_in_form_id))
  or (move_out_form_id is not null and exists (
    select 1 from public.room_move_out_forms f
    join public.barracks_rooms br on br.id = f.barracks_room_id
    where f.id = move_out_form_id
      and (public._barracks_can_read_room(br.company_id) or f.cadet_id = auth.uid())
  ))
);

-- ---------------------------------------------------------------------------
-- 10. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.create_move_in_invite(uuid, uuid, text, text, text, integer, text) to authenticated;
grant execute on function public.get_move_in_invite_public(text) to anon, authenticated;
grant execute on function public.redeem_parent_invite(text) to authenticated;
grant execute on function public.revoke_parent_invite(uuid) to authenticated;
grant execute on function public.refresh_move_in_invite_token(uuid) to authenticated;
grant execute on function public.list_move_in_invites_for_room(uuid) to authenticated;
grant execute on function public.save_move_in_form_external(uuid, jsonb, text, boolean) to authenticated;
grant execute on function public.validate_move_in_form(uuid) to authenticated;
grant execute on function public._is_parent_linked_to_cadet(uuid, uuid) to authenticated;
grant execute on function public._can_access_move_in_form(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 11. TAC direct save: mark submission_status validated on complete
-- ---------------------------------------------------------------------------

create or replace function public.save_room_inspection_form(
  p_form_type text,
  p_room_id uuid,
  p_cadet_id uuid,
  p_form_id uuid default null,
  p_items jsonb default '[]'::jsonb,
  p_notes text default null,
  p_validated_by_id uuid default null,
  p_mark_complete boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_form_id uuid;
  v_item jsonb;
  v_item_id uuid;
  v_status text;
  v_deficiency_codes text[] := array['DAM', 'CLN', 'FIX', 'REP', 'MIS'];
  v_role_level integer;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then raise exception 'Room not found'; end if;

  if not public._barracks_can_tac_manage(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  select r.default_role_level into v_role_level
  from public.profiles p join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  if p_form_type = 'move_out' and coalesce(v_role_level, 0) < 65 then
    raise exception 'Move-out forms require TAC';
  end if;

  if p_form_type = 'move_in' then
    if p_form_id is null then
      insert into public.room_move_in_forms (
        barracks_room_id, cadet_id, room_number, filled_by_id, validated_by_id, notes, completed_at,
        submission_status
      ) values (
        p_room_id, p_cadet_id, v_room.room_number, auth.uid(), p_validated_by_id, p_notes,
        case when p_mark_complete then now() else null end,
        case when p_mark_complete then 'validated' else 'draft' end
      )
      returning id into v_form_id;
    else
      v_form_id := p_form_id;
      update public.room_move_in_forms
      set
        validated_by_id = coalesce(p_validated_by_id, validated_by_id),
        notes = coalesce(p_notes, notes),
        completed_at = case when p_mark_complete then coalesce(completed_at, now()) else completed_at end,
        submission_status = case when p_mark_complete then 'validated' else submission_status end,
        updated_at = now()
      where id = v_form_id and barracks_room_id = p_room_id;
    end if;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_item_id := nullif(v_item ->> 'id', '')::uuid;
      v_status := coalesce(v_item ->> 'status', 'N/A');

      if v_item_id is not null then
        update public.room_inspection_items
        set status = v_status,
            notes = nullif(v_item ->> 'notes', ''),
            updated_at = now()
        where id = v_item_id and move_in_form_id = v_form_id;
      else
        insert into public.room_inspection_items (
          move_in_form_id, item_key, item_label, sort_order, status, notes
        ) values (
          v_form_id,
          v_item ->> 'item_key',
          v_item ->> 'item_label',
          coalesce((v_item ->> 'sort_order')::int, 0),
          v_status,
          nullif(v_item ->> 'notes', '')
        )
        returning id into v_item_id;
      end if;

      if v_status = any(v_deficiency_codes) then
        perform public.create_work_order_from_inspection_item(
          v_form_id,
          v_item_id,
          p_room_id,
          v_status,
          v_item ->> 'item_label',
          p_cadet_id
        );
      end if;
    end loop;

    if p_mark_complete then
      update public.barracks_rooms
      set latest_move_in_form_id = v_form_id
      where id = p_room_id;
    end if;

  elsif p_form_type = 'move_out' then
    if p_form_id is null then
      insert into public.room_move_out_forms (
        barracks_room_id, cadet_id, room_number, filled_by_id, notes, completed_at
      ) values (
        p_room_id, p_cadet_id, v_room.room_number, auth.uid(), p_notes,
        case when p_mark_complete then now() else null end
      )
      returning id into v_form_id;
    else
      v_form_id := p_form_id;
      update public.room_move_out_forms
      set
        notes = coalesce(p_notes, notes),
        completed_at = case when p_mark_complete then coalesce(completed_at, now()) else completed_at end,
        updated_at = now()
      where id = v_form_id and barracks_room_id = p_room_id;
    end if;

    for v_item in select * from jsonb_array_elements(p_items)
    loop
      v_item_id := nullif(v_item ->> 'id', '')::uuid;
      v_status := coalesce(v_item ->> 'status', 'N/A');

      if v_item_id is not null then
        update public.room_inspection_items
        set status = v_status,
            notes = nullif(v_item ->> 'notes', ''),
            updated_at = now()
        where id = v_item_id and move_out_form_id = v_form_id;
      else
        insert into public.room_inspection_items (
          move_out_form_id, item_key, item_label, sort_order, status, notes
        ) values (
          v_form_id,
          v_item ->> 'item_key',
          v_item ->> 'item_label',
          coalesce((v_item ->> 'sort_order')::int, 0),
          v_status,
          nullif(v_item ->> 'notes', '')
        )
        returning id into v_item_id;
      end if;

      if v_status = any(v_deficiency_codes) then
        perform public.create_work_order_from_inspection_item(
          v_form_id,
          v_item_id,
          p_room_id,
          v_status,
          v_item ->> 'item_label',
          p_cadet_id
        );
      end if;
    end loop;

    if p_mark_complete then
      update public.barracks_rooms
      set latest_move_out_form_id = v_form_id
      where id = p_room_id;
    end if;
  else
    raise exception 'Invalid form type';
  end if;

  return v_form_id;
end;
$$;
