BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(3);

SELECT lives_ok(
  $$SELECT public.acquire_email_send_slot()$$,
  'acquire_email_send_slot executes without error'
);

SELECT lives_ok(
  $$SELECT public.acquire_email_send_slot(); SELECT public.acquire_email_send_slot()$$,
  'acquire_email_send_slot can be called sequentially'
);

SELECT ok(
  (SELECT last_send_at > '1970-01-01'::timestamptz FROM public.email_rate_limit_state WHERE id = 1),
  'rate limit state last_send_at is updated'
);

SELECT * FROM finish();
ROLLBACK;
