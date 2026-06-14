set check_function_bodies = off;

-- Day 01 RLS hardening baseline.
-- This migration enables RLS on exposed tables and replaces permissive policies
-- with explicit, role-aware policy logic aligned to application workflows.

-- ---------------------------------------------------------------------------
-- Helper: centralize Band manager authorization logic for policies.
-- ---------------------------------------------------------------------------
create or replace function public.is_band_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $function$
  select exists (
    select 1
    from public.profiles p
    left join public.roles r on r.id = p.role_id
    left join public.band_details bd on bd.cadet_id = p.id
    where p.id = auth.uid()
      and (
        p.is_site_admin = true
        or coalesce(r.default_role_level, 0) >= 50
        or coalesce(r.role_name, '') = 'Band Director'
        or coalesce(bd.leadership_role, '') in (
          'Band Commander',
          'Drum Major',
          'Executive Officer',
          'Brass Captain',
          'Woodwind Captain',
          'Drum Captain'
        )
      )
  );
$function$;

-- ---------------------------------------------------------------------------
-- RLS enablement for critical tables currently exposed.
-- ---------------------------------------------------------------------------
alter table public.demerit_reports enable row level security;
do $$
begin
  if to_regclass('public.app_options') is not null then
    execute 'alter table public.app_options enable row level security';
  end if;
end
$$;

do $$
begin
  if to_regclass('public.band_details') is not null then
    execute 'alter table public.band_details enable row level security';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Tighten grants (remove anon access to hardened tables).
-- ---------------------------------------------------------------------------
revoke all on table public.demerit_reports from anon;
grant select, insert, update, delete on table public.demerit_reports to authenticated;
grant all on table public.demerit_reports to service_role;

do $$
begin
  if to_regclass('public.app_options') is not null then
    execute 'revoke all on table public.app_options from anon';
    execute 'grant select, insert, update, delete on table public.app_options to authenticated';
    execute 'grant all on table public.app_options to service_role';
  end if;
end
$$;

do $$
begin
  if to_regclass('public.band_details') is not null then
    execute 'revoke all on table public.band_details from anon';
    execute 'grant select, insert, update, delete on table public.band_details to authenticated';
    execute 'grant all on table public.band_details to service_role';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- profiles: remove globally permissive authenticated read policy.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can see all profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Managers can update profiles" on public.profiles;
drop policy if exists "Managers can update cadets in their scope" on public.profiles;

create policy "Managers can update cadets in their scope"
on public.profiles
for update
to authenticated
using (
  public.get_my_role_level() >= 50
  and exists (
    select 1
    from public.get_my_roster_permissions() perms(role_level, company_id, can_manage_all, can_manage_own)
    where
      perms.can_manage_all = true
      or (
        perms.can_manage_own = true
        and (
          public.profiles.company_id = perms.company_id
          or public.profiles.company_id is null
        )
      )
  )
)
with check (
  public.get_my_role_level() >= 50
  and exists (
    select 1
    from public.get_my_roster_permissions() perms(role_level, company_id, can_manage_all, can_manage_own)
    where
      perms.can_manage_all = true
      or (
        perms.can_manage_own = true
        and public.profiles.company_id = perms.company_id
      )
  )
);

-- ---------------------------------------------------------------------------
-- app_options policies.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.app_options') is not null then
    execute 'drop policy if exists "Band Director can manage band options" on public.app_options';
    execute 'drop policy if exists "Authenticated users can read active app options" on public.app_options';
    execute 'drop policy if exists "Admins can manage app options" on public.app_options';
    execute 'drop policy if exists "Band managers can manage band app options" on public.app_options';

    execute $sql$
      create policy "Authenticated users can read active app options"
      on public.app_options
      for select
      to authenticated
      using (is_active = true)
    $sql$;

    execute $sql$
      create policy "Admins can manage app options"
      on public.app_options
      for all
      to authenticated
      using (public.get_my_role_level() >= 90)
      with check (public.get_my_role_level() >= 90)
    $sql$;

    execute $sql$
      create policy "Band managers can manage band app options"
      on public.app_options
      for all
      to authenticated
      using (
        category in ('instrument', 'band_role')
        and public.is_band_manager()
      )
      with check (
        category in ('instrument', 'band_role')
        and public.is_band_manager()
      )
    $sql$;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- band_details policies.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.band_details') is not null then
    execute 'drop policy if exists "Band members can view own details" on public.band_details';
    execute 'drop policy if exists "Band-affiliated users can view band details" on public.band_details';
    execute 'drop policy if exists "Band managers can edit band details" on public.band_details';

    execute $sql$
      create policy "Band-affiliated users can view band details"
      on public.band_details
      for select
      to authenticated
      using (
        cadet_id = auth.uid()
        or public.is_band_manager()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.is_in_band = true
        )
      )
    $sql$;

    execute $sql$
      create policy "Band managers can insert band details"
      on public.band_details
      for insert
      to authenticated
      with check (public.is_band_manager())
    $sql$;

    execute $sql$
      create policy "Band managers can update band details"
      on public.band_details
      for update
      to authenticated
      using (public.is_band_manager())
      with check (public.is_band_manager())
    $sql$;

    execute $sql$
      create policy "Band managers can delete band details"
      on public.band_details
      for delete
      to authenticated
      using (public.is_band_manager())
    $sql$;
  end if;
end
$$;
