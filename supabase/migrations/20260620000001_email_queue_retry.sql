-- Reset dead-letter / failed queue items so they can be reprocessed after fixing config.

create or replace function public.retry_failed_email_notifications(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(coalesce(p_limit, 100), 1);
  v_count integer;
begin
  with candidates as (
    select id
    from public.notification_queue
    where status in ('dead_letter'::public.email_queue_status, 'failed'::public.email_queue_status)
    order by created_at desc
    limit v_limit
  )
  update public.notification_queue q
  set status = 'pending'::public.email_queue_status,
      attempt_count = 0,
      last_error = null,
      next_retry_at = null
  from candidates c
  where q.id = c.id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.retry_failed_email_notifications(integer) to service_role;
