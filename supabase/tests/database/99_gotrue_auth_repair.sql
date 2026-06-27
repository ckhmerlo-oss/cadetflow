-- Runs last (99_*): repair GoTrue-required token columns after tests that COMMIT
-- incomplete auth.users rows. Without this, seeded password login returns 500.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(1);

UPDATE auth.users
SET
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

SELECT ok(true, 'GoTrue auth token columns repaired after test suite');

SELECT * FROM finish();
COMMIT;
