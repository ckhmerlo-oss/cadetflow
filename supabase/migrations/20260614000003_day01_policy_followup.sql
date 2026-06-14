-- Day-01 follow-up: apply band_details and app_options policies that were skipped
-- because those tables did not exist when 20260613201000 ran.

-- ---------------------------------------------------------------------------
-- app_options policies (if table exists).
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
-- band_details write policies (table exists after profile_schema_baseline).
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.band_details') is not null then
    execute 'drop policy if exists "Band managers can insert band details" on public.band_details';
    execute 'drop policy if exists "Band managers can update band details" on public.band_details';
    execute 'drop policy if exists "Band managers can delete band details" on public.band_details';

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
