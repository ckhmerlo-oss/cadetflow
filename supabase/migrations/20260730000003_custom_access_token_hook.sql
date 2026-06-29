-- Supabase Auth custom access token hook (Auth → Hooks → Custom access token).
-- Demo project had the hook enabled in dashboard but no function in Postgres, which
-- blocked all sign-ins with: Error running hook URI pg-functions://postgres/public/custom_access_token_hook

set check_function_bodies = off;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Passthrough: return claims unchanged. Extend here if custom JWT claims are needed.
  return jsonb_build_object('claims', event->'claims');
end;
$$;

revoke all on function public.custom_access_token_hook(jsonb) from public;
revoke all on function public.custom_access_token_hook(jsonb) from anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
