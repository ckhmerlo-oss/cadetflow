-- Optional one-time repair when auth.users is stuck on a legacy schema.
-- Run as supabase_admin after `supabase start`:
--   psql "postgresql://supabase_admin:postgres@127.0.0.1:56322/postgres" -f scripts/repair-local-auth.sql

alter table auth.users add column if not exists email_confirmed_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'confirmed_at'
      and is_generated = 'NEVER'
  ) then
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, confirmed_at)
    where email_confirmed_at is null
      and confirmed_at is not null;

    alter table auth.users drop column confirmed_at;
  end if;
end $$;

alter table auth.users add column if not exists phone text;
alter table auth.users add column if not exists phone_confirmed_at timestamptz;
alter table auth.users add column if not exists phone_change text default '';
alter table auth.users add column if not exists phone_change_token varchar(255) default '';
alter table auth.users add column if not exists phone_change_sent_at timestamptz;
alter table auth.users add column if not exists email_change_token_new varchar(255);
alter table auth.users add column if not exists email_change_token_current varchar(255) default '';
alter table auth.users add column if not exists email_change_confirm_status smallint default 0;
alter table auth.users add column if not exists banned_until timestamptz;
alter table auth.users add column if not exists reauthentication_token varchar(255) default '';
alter table auth.users add column if not exists reauthentication_sent_at timestamptz;
alter table auth.users add column if not exists is_sso_user boolean not null default false;
alter table auth.users add column if not exists deleted_at timestamptz;
alter table auth.users add column if not exists is_anonymous boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'confirmed_at'
  ) then
    alter table auth.users
      add column confirmed_at timestamptz
      generated always as (least(email_confirmed_at, phone_confirmed_at)) stored;
  end if;
end $$;

-- GoTrue requires non-null token columns on every auth.users row (password login breaks otherwise).
update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, ''),
  phone_change = coalesce(phone_change, ''),
  is_sso_user = coalesce(is_sso_user, false),
  is_anonymous = coalesce(is_anonymous, false)
where
  confirmation_token is null
  or recovery_token is null
  or email_change_token_new is null
  or email_change is null
  or email_change_token_current is null
  or phone_change_token is null
  or reauthentication_token is null
  or phone_change is null
  or is_sso_user is null
  or is_anonymous is null;
