-- pgcrypto (gen_random_bytes, digest) lives in extensions schema on Supabase.
-- Invite RPCs need extensions on search_path.

alter function public.create_move_in_invite(uuid, uuid, text, text, text, integer, text)
  set search_path = public, extensions;

alter function public.get_move_in_invite_public(text)
  set search_path = public, extensions;

alter function public.redeem_parent_invite(text)
  set search_path = public, extensions;

alter function public.refresh_move_in_invite_token(uuid)
  set search_path = public, extensions;
