-- Allow parents to adopt the Parent role when redeeming a move-in invite.
-- Also return cadet last name + first initial on the public invite payload.

set check_function_bodies = off;

create or replace function public.protect_critical_profile_fields()
 returns trigger
 language plpgsql
 security definer
as $function$
declare
  v_modifier_perms record;
begin
  select
    p.is_site_admin,
    p.company_id,
    r.default_role_level,
    r.can_manage_all_rosters,
    r.can_manage_own_company_roster
  into v_modifier_perms
  from public.profiles p
  left join public.roles r on p.role_id = r.id
  where p.id = auth.uid();

  if (auth.uid() is null) or (v_modifier_perms.is_site_admin = true) then
    return new;
  end if;

  if new.is_site_admin is distinct from old.is_site_admin then
    raise exception 'Permission Denied: Only Site Admins can grant admin privileges.';
  end if;

  if new.role_id is distinct from old.role_id then
    -- Move-in invite redemption: users may assign the Parent role to themselves only.
    if auth.uid() = new.id and new.role_id = public._parent_role_id() then
      return new;
    end if;

    if v_modifier_perms.can_manage_all_rosters then
      return new;
    end if;

    if v_modifier_perms.can_manage_own_company_roster then
      if (old.company_id is null or old.company_id = v_modifier_perms.company_id) then
        return new;
      end if;
    end if;

    raise exception 'Permission Denied: You do not have permission to change this user''s role.';
  end if;

  return new;
end;
$function$;

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
  v_cadet_last text;
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

  select p.first_name, p.last_name into v_cadet_first, v_cadet_last
  from public.profiles p
  where p.id = v_invite.cadet_id;

  select br.room_number into v_room_number
  from public.barracks_rooms br
  where br.id = v_invite.barracks_room_id;

  return jsonb_build_object(
    'invite_id', v_invite.id,
    'form_id', v_invite.move_in_form_id,
    'cadet_first_name', v_cadet_first,
    'cadet_last_name', v_cadet_last,
    'cadet_first_initial', case
      when coalesce(trim(v_cadet_first), '') = '' then null
      else left(trim(v_cadet_first), 1)
    end,
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
