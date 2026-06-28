-- Parent invite redemption writes redeemed_by_id and cadet_parent_links against
-- public.profiles. Auth users created outside the normal trigger path may lack a row.

set check_function_bodies = off;

create or replace function public._ensure_profile_for_auth_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.profiles (id, first_name, last_name)
  select
    u.id,
    coalesce(nullif(trim(u.raw_user_meta_data->>'first_name'), ''), 'New'),
    coalesce(nullif(trim(u.raw_user_meta_data->>'last_name'), ''), 'User')
  from auth.users u
  where u.id = auth.uid()
  on conflict (id) do nothing;
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

  perform public._ensure_profile_for_auth_user();

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
