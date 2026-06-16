-- Global outbound email rate limiter (coordinates across edge function invocations)

create table if not exists public.email_rate_limit_state (
  id int primary key default 1 check (id = 1),
  last_send_at timestamptz not null default '1970-01-01'::timestamptz
);

insert into public.email_rate_limit_state (id, last_send_at)
values (1, '1970-01-01'::timestamptz)
on conflict (id) do nothing;

-- Resend allows 5 emails/second; we target 4/sec (250ms minimum gap) for headroom.
create or replace function public.acquire_email_send_slot()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_elapsed_ms numeric;
  v_min_gap_ms constant numeric := 250;
begin
  insert into public.email_rate_limit_state (id, last_send_at)
  values (1, '1970-01-01'::timestamptz)
  on conflict (id) do nothing;

  select last_send_at into v_last
  from public.email_rate_limit_state
  where id = 1
  for update;

  v_elapsed_ms := extract(epoch from (clock_timestamp() - v_last)) * 1000;

  if v_elapsed_ms < v_min_gap_ms then
    perform pg_sleep((v_min_gap_ms - v_elapsed_ms) / 1000.0);
  end if;

  update public.email_rate_limit_state
  set last_send_at = clock_timestamp()
  where id = 1;
end;
$$;

grant execute on function public.acquire_email_send_slot() to service_role;

alter table public.email_rate_limit_state enable row level security;

grant select, update on public.email_rate_limit_state to service_role;
