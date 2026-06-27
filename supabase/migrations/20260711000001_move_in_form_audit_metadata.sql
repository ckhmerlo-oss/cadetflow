-- Move-in form audit metadata, invite email edit, richer query surfaces

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Update invite email (before redemption)
-- ---------------------------------------------------------------------------

create or replace function public.update_move_in_invite_email(
  p_invite_id uuid,
  p_recipient_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_invite public.parent_invites%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  v_email := lower(trim(p_recipient_email));
  if v_email = '' or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Invalid email';
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

  if v_invite.redeemed_at is not null then
    raise exception 'Invite already redeemed — email cannot be changed';
  end if;

  if v_invite.expires_at < now() then
    raise exception 'Invite expired — resend to generate a new link';
  end if;

  update public.parent_invites
  set recipient_email = v_email
  where id = p_invite_id;

  return jsonb_build_object(
    'invite_id', p_invite_id,
    'recipient_email', v_email,
    'form_id', v_invite.move_in_form_id
  );
end;
$$;

grant execute on function public.update_move_in_invite_email(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Richer invite list
-- ---------------------------------------------------------------------------

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
        'sent_by_id', pi.created_by_id,
        'sent_by_name', (select first_name || ' ' || last_name from public.profiles where id = pi.created_by_id),
        'form_submission_status', (
          select f.submission_status from public.room_move_in_forms f where f.id = pi.move_in_form_id
        ),
        'can_edit', (
          pi.revoked_at is null
          and pi.redeemed_at is null
          and pi.expires_at >= now()
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
-- Room detail: move-in forms with audit fields
-- ---------------------------------------------------------------------------

create or replace function public.get_barracks_room_detail(p_room_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_room public.barracks_rooms%rowtype;
  v_company_name text;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_room from public.barracks_rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public._barracks_can_read_room(v_room.company_id) then
    raise exception 'Permission denied';
  end if;

  select c.company_name into v_company_name
  from public.companies c where c.id = v_room.company_id;

  v_result := jsonb_build_object(
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_number', v_room.room_number,
      'company_letter', v_room.company_letter,
      'floor', v_room.floor,
      'room_index', v_room.room_index,
      'company_id', v_room.company_id,
      'company_name', v_company_name,
      'latest_move_in_form_id', v_room.latest_move_in_form_id,
      'latest_move_out_form_id', v_room.latest_move_out_form_id,
      'occupant_top', (
        select jsonb_build_object(
          'id', p.id, 'first_name', p.first_name, 'last_name', p.last_name,
          'cadet_rank', coalesce(cp.cadet_rank, ''), 'archived', coalesce(p.archived, false)
        )
        from public.profiles p
        left join public.cadet_profiles cp on cp.profile_id = p.id
        where p.id = v_room.occupant_top_bunk_id
      ),
      'occupant_bottom', (
        select jsonb_build_object(
          'id', p.id, 'first_name', p.first_name, 'last_name', p.last_name,
          'cadet_rank', coalesce(cp.cadet_rank, ''), 'archived', coalesce(p.archived, false)
        )
        from public.profiles p
        left join public.cadet_profiles cp on cp.profile_id = p.id
        where p.id = v_room.occupant_bottom_bunk_id
      )
    ),
    'move_in_forms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'cadet_id', f.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
        'submission_status', f.submission_status,
        'completed_at', f.completed_at,
        'created_at', f.created_at,
        'validated_by_id', f.validated_by_id,
        'validated_by_name', (
          select first_name || ' ' || last_name from public.profiles where id = f.validated_by_id
        ),
        'filled_by_id', f.filled_by_id,
        'filled_by_name', (
          select first_name || ' ' || last_name from public.profiles where id = f.filled_by_id
        ),
        'invite_id', f.invite_id,
        'sent_at', pi.created_at,
        'sent_by_id', pi.created_by_id,
        'sent_by_name', (
          select first_name || ' ' || last_name from public.profiles where id = pi.created_by_id
        ),
        'recipient_email', pi.recipient_email,
        'invite_revoked_at', pi.revoked_at,
        'invite_redeemed_at', pi.redeemed_at,
        'invite_expires_at', pi.expires_at,
        'invite_can_edit', (
          pi.id is not null
          and pi.revoked_at is null
          and pi.redeemed_at is null
          and pi.expires_at >= now()
        ),
        'locked_bunk', f.locked_bunk,
        'locked_desk_side', f.locked_desk_side
      ) order by f.created_at desc)
      from public.room_move_in_forms f
      left join public.parent_invites pi on pi.id = f.invite_id
      where f.barracks_room_id = p_room_id
    ), '[]'::jsonb),
    'move_out_forms', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'cadet_id', f.cadet_id,
        'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
        'completed_at', f.completed_at,
        'created_at', f.created_at
      ) order by f.created_at desc)
      from public.room_move_out_forms f
      where f.barracks_room_id = p_room_id
    ), '[]'::jsonb),
    'work_orders', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', wo.id,
        'status', wo.status,
        'priority', wo.priority,
        'description', wo.description,
        'issue_presets', wo.issue_presets,
        'created_at', wo.created_at,
        'source_inspection_item_id', wo.source_inspection_item_id,
        'source_inspection_form_id', wo.source_inspection_form_id
      ) order by wo.created_at desc)
      from public.work_orders wo
      where wo.barracks_room_id = p_room_id
    ), '[]'::jsonb)
  );

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Inspection form detail with audit + invite metadata
-- ---------------------------------------------------------------------------

create or replace function public.get_room_inspection_form(p_form_id uuid, p_form_type text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
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
      'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
      'filled_by_id', f.filled_by_id,
      'filled_by_name', (select first_name || ' ' || last_name from public.profiles where id = f.filled_by_id),
      'validated_by_id', f.validated_by_id,
      'validated_by_name', (select first_name || ' ' || last_name from public.profiles where id = f.validated_by_id),
      'completed_at', f.completed_at,
      'notes', f.notes,
      'created_at', f.created_at,
      'submission_status', f.submission_status,
      'locked_bunk', f.locked_bunk,
      'locked_desk_side', f.locked_desk_side,
      'invite_id', f.invite_id,
      'sent_at', pi.created_at,
      'sent_by_id', pi.created_by_id,
      'sent_by_name', (select first_name || ' ' || last_name from public.profiles where id = pi.created_by_id),
      'recipient_email', pi.recipient_email,
      'invite_revoked_at', pi.revoked_at,
      'invite_redeemed_at', pi.redeemed_at,
      'invite_expires_at', pi.expires_at,
      'invite_can_edit', (
        pi.id is not null
        and pi.revoked_at is null
        and pi.redeemed_at is null
        and pi.expires_at >= now()
      )
    ) into v_form
    from public.room_move_in_forms f
    left join public.parent_invites pi on pi.id = f.invite_id
    where f.id = p_form_id;

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
      'cadet_name', (select first_name || ' ' || last_name from public.profiles where id = f.cadet_id),
      'filled_by_id', f.filled_by_id,
      'filled_by_name', (select first_name || ' ' || last_name from public.profiles where id = f.filled_by_id),
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
