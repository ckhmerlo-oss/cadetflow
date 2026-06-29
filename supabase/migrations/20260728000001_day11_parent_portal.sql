-- Day 11: Parent portal invites, travel requests, legal acceptances, parent history access

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- 1. Extend parent_invites for portal purpose
-- ---------------------------------------------------------------------------

alter table public.parent_invites
  alter column barracks_room_id drop not null;

alter table public.parent_invites
  alter column locked_bunk drop not null;

alter table public.parent_invites
  alter column locked_desk_side drop not null;

alter table public.parent_invites
  drop constraint if exists parent_invites_purpose_check;

alter table public.parent_invites
  add constraint parent_invites_purpose_check
  check (purpose in ('move_in', 'portal'));

alter table public.parent_invites
  drop constraint if exists parent_invites_move_in_fields_check;

alter table public.parent_invites
  add constraint parent_invites_move_in_fields_check
  check (
    (purpose = 'move_in' and barracks_room_id is not null and locked_bunk is not null and locked_desk_side is not null)
    or (purpose = 'portal' and barracks_room_id is null and locked_bunk is null and locked_desk_side is null)
  );

-- ---------------------------------------------------------------------------
-- 2. Notification event types
-- ---------------------------------------------------------------------------

insert into public.notification_event_types (code, category, title_template, description) values
  ('parent.invite.redeemed', 'new_report', 'Parent invite redeemed', 'A parent accepted an invitation and linked to a cadet.'),
  ('parent.travel.submitted', 'new_report', 'Travel request submitted', 'A parent submitted a travel request for review.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Legal acceptances
-- ---------------------------------------------------------------------------

create table if not exists public.legal_document_versions (
  doc_key text not null,
  version text not null,
  effective_at timestamptz not null default now(),
  primary key (doc_key, version)
);

create table if not exists public.user_legal_acceptances (
  user_id uuid not null references public.profiles (id) on delete cascade,
  doc_key text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, doc_key, version),
  foreign key (doc_key, version) references public.legal_document_versions (doc_key, version)
);

insert into public.legal_document_versions (doc_key, version, effective_at) values
  ('terms_of_service', '2026-06-01', '2026-06-01'::timestamptz),
  ('privacy_policy', '2026-06-01', '2026-06-01'::timestamptz),
  ('parent_portal_agreement', '2026-06-01', '2026-06-01'::timestamptz)
on conflict (doc_key, version) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Parent travel requests
-- ---------------------------------------------------------------------------

create table if not exists public.parent_travel_requests (
  id uuid primary key default gen_random_uuid(),
  cadet_id uuid not null references public.profiles (id) on delete restrict,
  parent_profile_id uuid not null references public.profiles (id) on delete restrict,
  trip_type text not null check (trip_type in ('weekend', 'break', 'other')),
  departure_at timestamptz not null,
  return_at timestamptz not null,
  destination text not null,
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'acknowledged', 'denied', 'cancelled')),
  file_asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parent_travel_requests_return_after_departure check (return_at >= departure_at)
);

create index if not exists idx_parent_travel_requests_cadet
  on public.parent_travel_requests (cadet_id, created_at desc);

create index if not exists idx_parent_travel_requests_parent
  on public.parent_travel_requests (parent_profile_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5. Permission helpers
-- ---------------------------------------------------------------------------

create or replace function public._can_tac_manage_cadet(p_cadet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public._work_order_can_tac_manage(
    (select p.company_id from public.profiles p where p.id = p_cadet_id)
  );
$$;

create or replace function public._parent_invite_company_id(p_invite public.parent_invites)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_invite.purpose = 'move_in' then
      (select br.company_id from public.barracks_rooms br where br.id = p_invite.barracks_room_id)
    else
      (select p.company_id from public.profiles p where p.id = p_invite.cadet_id)
  end;
$$;

create or replace function public.parent_can_view_cadet(p_cadet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public._is_parent_linked_to_cadet(p_cadet_id);
$$;

create or replace function public._cadet_is_archived(p_cadet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.archived from public.profiles p where p.id = p_cadet_id),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. can_view_cadet_history — wire parent linked-cadet scope (Day 11)
-- ---------------------------------------------------------------------------

create or replace function public.can_view_cadet_history(p_cadet_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_viewer_id uuid := auth.uid();
  v_perms record;
  v_cadet_company uuid;
  v_archived boolean;
begin
  if v_viewer_id is null then
    return false;
  end if;

  if v_viewer_id = p_cadet_id then
    return true;
  end if;

  select coalesce(p.archived, false), p.company_id
  into v_archived, v_cadet_company
  from public.profiles p
  where p.id = p_cadet_id;

  if not found then
    return false;
  end if;

  if public._is_parent_linked_to_cadet(p_cadet_id) then
    return true;
  end if;

  if v_archived then
    return public.can_view_archived_cadet(p_cadet_id);
  end if;

  if public.is_site_admin() or public.get_my_role_level() >= 90 then
    return true;
  end if;

  select * into v_perms from public.get_my_roster_permissions();

  if v_perms.can_manage_all then
    return true;
  end if;

  if v_perms.can_manage_own and v_cadet_company is not null
     and v_cadet_company = v_perms.company_id then
    return true;
  end if;

  if v_perms.role_level >= 50 and v_cadet_company is null then
    return true;
  end if;

  if exists (
    select 1 from public.cadet_oversight_assignments coa
    where coa.cadet_id = p_cadet_id
      and coa.staff_id = v_viewer_id
      and coa.is_active = true
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Legal acceptance RPCs
-- ---------------------------------------------------------------------------

create or replace function public.record_legal_acceptances(p_acceptances jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_doc_key text;
  v_version text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if p_acceptances is null or jsonb_typeof(p_acceptances) <> 'array' then
    raise exception 'Invalid acceptances payload';
  end if;

  for v_item in select * from jsonb_array_elements(p_acceptances)
  loop
    v_doc_key := v_item ->> 'doc_key';
    v_version := v_item ->> 'version';

    if v_doc_key is null or v_version is null then
      raise exception 'Each acceptance requires doc_key and version';
    end if;

    if not exists (
      select 1 from public.legal_document_versions ldv
      where ldv.doc_key = v_doc_key and ldv.version = v_version
    ) then
      raise exception 'Unknown legal document: % %', v_doc_key, v_version;
    end if;

    insert into public.user_legal_acceptances (user_id, doc_key, version)
    values (auth.uid(), v_doc_key, v_version)
    on conflict (user_id, doc_key, version) do nothing;
  end loop;
end;
$$;

create or replace function public.user_missing_required_legal_acceptances()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_missing jsonb;
begin
  if auth.uid() is null then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'doc_key', ldv.doc_key,
    'version', ldv.version
  )), '[]'::jsonb)
  into v_missing
  from public.legal_document_versions ldv
  where ldv.doc_key in ('terms_of_service', 'privacy_policy', 'parent_portal_agreement')
    and not exists (
      select 1 from public.user_legal_acceptances ula
      where ula.user_id = auth.uid()
        and ula.doc_key = ldv.doc_key
        and ula.version = ldv.version
    );

  return v_missing;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Portal invite RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_portal_invite(
  p_cadet_id uuid,
  p_recipient_email text,
  p_expires_in_days integer default 14,
  p_recipient_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_invite_id uuid;
  v_token text;
  v_token_hash text;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not public._can_tac_manage_cadet(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  if public._cadet_is_archived(p_cadet_id) then
    raise exception 'Cadet not found or archived';
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
    raise exception 'Cadet not found or archived';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');

  insert into public.parent_invites (
    token_hash,
    purpose,
    cadet_id,
    recipient_email,
    recipient_phone,
    expires_at,
    created_by_id
  ) values (
    v_token_hash,
    'portal',
    p_cadet_id,
    v_email,
    nullif(trim(p_recipient_phone), ''),
    now() + make_interval(days => greatest(coalesce(p_expires_in_days, 14), 1)),
    auth.uid()
  )
  returning id into v_invite_id;

  return jsonb_build_object(
    'invite_id', v_invite_id,
    'token', v_token,
    'recipient_email', v_email,
    'cadet_id', p_cadet_id,
    'expires_at', (now() + make_interval(days => greatest(coalesce(p_expires_in_days, 14), 1)))
  );
end;
$$;

create or replace function public.get_portal_invite_public(p_token text)
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
  v_cadet_last text;
begin
  if coalesce(trim(p_token), '') = '' then
    raise exception 'Invalid token';
  end if;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  select * into v_invite
  from public.parent_invites pi
  where pi.token_hash = v_hash
    and pi.purpose = 'portal'
    and pi.revoked_at is null;

  if not found then
    raise exception 'Invite not found';
  end if;

  select p.first_name, p.last_name into v_cadet_first, v_cadet_last
  from public.profiles p
  where p.id = v_invite.cadet_id;

  return jsonb_build_object(
    'invite_id', v_invite.id,
    'purpose', v_invite.purpose,
    'cadet_id', v_invite.cadet_id,
    'cadet_first_name', v_cadet_first,
    'cadet_last_name', v_cadet_last,
    'cadet_first_initial', case
      when coalesce(trim(v_cadet_first), '') = '' then null
      else left(trim(v_cadet_first), 1)
    end,
    'recipient_email', v_invite.recipient_email,
    'expires_at', v_invite.expires_at,
    'revoked_at', v_invite.revoked_at,
    'redeemed_at', v_invite.redeemed_at,
    'is_expired', v_invite.expires_at < now(),
    'is_active', v_invite.revoked_at is null and v_invite.expires_at >= now() and v_invite.redeemed_at is null
  );
end;
$$;

create or replace function public.list_portal_invites_for_cadet(p_cadet_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not public._can_tac_manage_cadet(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'id', pi.id,
        'recipient_email', pi.recipient_email,
        'recipient_phone', pi.recipient_phone,
        'expires_at', pi.expires_at,
        'revoked_at', pi.revoked_at,
        'redeemed_at', pi.redeemed_at,
        'redeemed_by_id', pi.redeemed_by_id,
        'created_at', pi.created_at,
        'can_edit', pi.redeemed_at is null and pi.revoked_at is null
      ) order by pi.created_at desc)
      from public.parent_invites pi
      where pi.cadet_id = p_cadet_id
        and pi.purpose = 'portal'
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.list_cadet_parent_links_for_cadet(p_cadet_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not public._can_tac_manage_cadet(p_cadet_id)
     and not public.can_view_cadet_history(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'id', l.id,
        'parent_profile_id', l.parent_profile_id,
        'parent_name', pp.first_name || ' ' || pp.last_name,
        'parent_email', (select email from auth.users where id = l.parent_profile_id),
        'status', l.status,
        'created_at', l.created_at
      ) order by l.created_at desc)
      from public.cadet_parent_links l
      join public.profiles pp on pp.id = l.parent_profile_id
      where l.cadet_profile_id = p_cadet_id
        and l.status = 'active'
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.list_linked_cadets_for_parent()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'cadet_id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'company_name', c.company_name,
        'room_number', cp.room_number,
        'grade_level', cp.grade_level,
        'conduct_status', cp.conduct_status,
        'archived', coalesce(p.archived, false),
        'link_id', l.id
      ) order by p.last_name, p.first_name)
      from public.cadet_parent_links l
      join public.profiles p on p.id = l.cadet_profile_id
      join public.cadet_profiles cp on cp.profile_id = p.id
      left join public.companies c on c.id = p.company_id
      where l.parent_profile_id = auth.uid()
        and l.status = 'active'
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.get_parent_pending_move_in_forms()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'form_id', f.id,
        'room_number', f.room_number,
        'cadet_id', f.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
        'submission_status', f.submission_status
      ) order by f.created_at desc)
      from public.room_move_in_forms f
      where f.submission_status in ('draft', 'submitted')
        and public._is_parent_linked_to_cadet(f.cadet_id)
        and (
          f.filled_by_id = auth.uid()
          or exists (
            select 1 from public.parent_invites pi
            where pi.move_in_form_id = f.id
              and pi.redeemed_by_id = auth.uid()
          )
        )
    ),
    '[]'::jsonb
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Update redeem + revoke + refresh for both invite purposes
-- ---------------------------------------------------------------------------

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
  v_cadet_name text;
  v_tac_id uuid;
  v_first_redeem boolean;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  perform public._ensure_profile_for_auth_user();

  if coalesce(trim(p_token), '') = '' then
    raise exception 'Invalid token';
  end if;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  select * into v_invite
  from public.parent_invites pi
  where pi.token_hash = v_hash
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;

  v_first_redeem := v_invite.redeemed_at is null;

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

  if v_invite.purpose = 'portal' and v_first_redeem then
    select first_name || ' ' || last_name into v_cadet_name
    from public.profiles where id = v_invite.cadet_id;

    v_tac_id := v_invite.created_by_id;

    perform public.dispatch_notification(
      v_tac_id,
      'parent.invite.redeemed',
      'Parent portal invite redeemed',
      coalesce(v_cadet_name, 'A cadet') || '''s parent linked their account.',
      '/profile/' || v_invite.cadet_id::text,
      'parent.invite.redeemed:' || v_invite.id::text || ':' || auth.uid()::text,
      jsonb_build_object('cadet_id', v_invite.cadet_id, 'invite_id', v_invite.id)
    );
  end if;

  return jsonb_build_object(
    'purpose', v_invite.purpose,
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

  if not public._barracks_can_tac_manage(public._parent_invite_company_id(v_invite)) then
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

  if not public._barracks_can_tac_manage(public._parent_invite_company_id(v_invite)) then
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
    'expires_at', now() + interval '14 days',
    'purpose', v_invite.purpose
  );
end;
$$;

create or replace function public.update_move_in_invite_email(
  p_invite_id uuid,
  p_recipient_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.parent_invites%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_invite from public.parent_invites where id = p_invite_id;
  if not found then
    raise exception 'Invite not found';
  end if;

  if not public._barracks_can_tac_manage(public._parent_invite_company_id(v_invite)) then
    raise exception 'Permission denied';
  end if;

  if v_invite.redeemed_at is not null then
    raise exception 'Invite already redeemed';
  end if;

  v_email := lower(trim(p_recipient_email));
  if v_email = '' or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Invalid email';
  end if;

  update public.parent_invites
  set recipient_email = v_email
  where id = p_invite_id;

  return jsonb_build_object('invite_id', p_invite_id, 'recipient_email', v_email);
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. Travel request RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_parent_travel_request(
  p_cadet_id uuid,
  p_trip_type text,
  p_departure_at timestamptz,
  p_return_at timestamptz,
  p_destination text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_cadet_name text;
  v_tac_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not public._is_parent_linked_to_cadet(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  if public._cadet_is_archived(p_cadet_id) then
    raise exception 'Cadet is archived; travel requests are read-only until reactivation';
  end if;

  if p_trip_type not in ('weekend', 'break', 'other') then
    raise exception 'Invalid trip type';
  end if;

  if p_return_at < p_departure_at then
    raise exception 'Return must be after departure';
  end if;

  if coalesce(trim(p_destination), '') = '' then
    raise exception 'Destination is required';
  end if;

  insert into public.parent_travel_requests (
    cadet_id,
    parent_profile_id,
    trip_type,
    departure_at,
    return_at,
    destination,
    notes
  ) values (
    p_cadet_id,
    auth.uid(),
    p_trip_type,
    p_departure_at,
    p_return_at,
    trim(p_destination),
    nullif(trim(p_notes), '')
  )
  returning id into v_id;

  select first_name || ' ' || last_name into v_cadet_name
  from public.profiles where id = p_cadet_id;

  select p.id into v_tac_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.company_id = (select company_id from public.profiles where id = p_cadet_id)
    and r.can_manage_own_company_roster = true
  order by r.default_role_level desc
  limit 1;

  if v_tac_id is not null then
    perform public.dispatch_notification(
      v_tac_id,
      'parent.travel.submitted',
      'Travel request submitted',
      coalesce(v_cadet_name, 'A cadet') || '''s parent submitted a travel request.',
      '/parent/cadets/' || p_cadet_id::text || '/travel',
      'parent.travel.submitted:' || v_id::text,
      jsonb_build_object('request_id', v_id, 'cadet_id', p_cadet_id)
    );
  end if;

  return v_id;
end;
$$;

create or replace function public.list_parent_travel_requests_for_cadet(p_cadet_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not public._is_parent_linked_to_cadet(p_cadet_id)
     and not public._can_tac_manage_cadet(p_cadet_id) then
    raise exception 'Permission denied';
  end if;

  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'id', r.id,
        'trip_type', r.trip_type,
        'departure_at', r.departure_at,
        'return_at', r.return_at,
        'destination', r.destination,
        'notes', r.notes,
        'status', r.status,
        'created_at', r.created_at,
        'parent_profile_id', r.parent_profile_id
      ) order by r.created_at desc)
      from public.parent_travel_requests r
      where r.cadet_id = p_cadet_id
        and (
          r.parent_profile_id = auth.uid()
          or public._can_tac_manage_cadet(p_cadet_id)
        )
    ),
    '[]'::jsonb
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 11. RLS
-- ---------------------------------------------------------------------------

alter table public.legal_document_versions enable row level security;
alter table public.user_legal_acceptances enable row level security;
alter table public.parent_travel_requests enable row level security;

revoke all on table public.legal_document_versions from anon;
revoke all on table public.user_legal_acceptances from anon;
revoke all on table public.parent_travel_requests from anon;

grant select on table public.legal_document_versions to authenticated, anon;
grant select, insert on table public.user_legal_acceptances to authenticated;
grant select, insert on table public.parent_travel_requests to authenticated;
grant all on table public.legal_document_versions to service_role;
grant all on table public.user_legal_acceptances to service_role;
grant all on table public.parent_travel_requests to service_role;

drop policy if exists "Anyone can read legal document versions" on public.legal_document_versions;
create policy "Anyone can read legal document versions"
on public.legal_document_versions for select
using (true);

drop policy if exists "Users read own legal acceptances" on public.user_legal_acceptances;
create policy "Users read own legal acceptances"
on public.user_legal_acceptances for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users insert own legal acceptances" on public.user_legal_acceptances;
create policy "Users insert own legal acceptances"
on public.user_legal_acceptances for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Parent reads own travel requests" on public.parent_travel_requests;
create policy "Parent reads own travel requests"
on public.parent_travel_requests for select to authenticated
using (
  parent_profile_id = auth.uid()
  or public._can_tac_manage_cadet(cadet_id)
);

drop policy if exists "Parent inserts own travel requests" on public.parent_travel_requests;
create policy "Parent inserts own travel requests"
on public.parent_travel_requests for insert to authenticated
with check (
  parent_profile_id = auth.uid()
  and public._is_parent_linked_to_cadet(cadet_id)
  and not public._cadet_is_archived(cadet_id)
);

drop policy if exists "TAC reads parent invites" on public.parent_invites;
create policy "TAC reads parent invites"
on public.parent_invites for select to authenticated
using (
  public._barracks_can_tac_manage(public._parent_invite_company_id(parent_invites))
);

-- ---------------------------------------------------------------------------
-- 12. Grants
-- ---------------------------------------------------------------------------

grant execute on function public._can_tac_manage_cadet(uuid) to authenticated;
grant execute on function public.parent_can_view_cadet(uuid) to authenticated;
grant execute on function public.create_portal_invite(uuid, text, integer, text) to authenticated;
grant execute on function public.get_portal_invite_public(text) to anon, authenticated;
grant execute on function public.list_portal_invites_for_cadet(uuid) to authenticated;
grant execute on function public.list_cadet_parent_links_for_cadet(uuid) to authenticated;
grant execute on function public.list_linked_cadets_for_parent() to authenticated;
grant execute on function public.get_parent_pending_move_in_forms() to authenticated;
grant execute on function public.record_legal_acceptances(jsonb) to authenticated;
grant execute on function public.user_missing_required_legal_acceptances() to authenticated;
grant execute on function public.create_parent_travel_request(uuid, text, timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.list_parent_travel_requests_for_cadet(uuid) to authenticated;
