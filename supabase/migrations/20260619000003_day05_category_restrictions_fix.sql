-- Fix integer aggregation in update_category_restriction_policy validation loop.

create or replace function public.update_category_restriction_policy(p_bands jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old jsonb;
  v_new jsonb;
  band jsonb;
  v_min int;
  v_cats int[];
  v_value text;
  seen_thresholds int[] := array[]::int[];
begin
  if public.get_my_role_level() < 90 and not public.is_site_admin() then
    raise exception 'Permission denied.';
  end if;

  if p_bands is null or jsonb_typeof(p_bands) <> 'array' then
    raise exception 'Policy bands must be a JSON array.';
  end if;

  if jsonb_array_length(p_bands) = 0 then
    raise exception 'At least one policy band is required.';
  end if;

  v_old := public.get_category_restriction_policy();

  for band in select value from jsonb_array_elements(p_bands)
  loop
    v_min := (band ->> 'min_role_level')::int;
    if v_min is null or v_min < 0 then
      raise exception 'Each band requires a non-negative min_role_level.';
    end if;

    if v_min = any(seen_thresholds) then
      raise exception 'Duplicate min_role_level in policy bands.';
    end if;
    seen_thresholds := array_append(seen_thresholds, v_min);

    select coalesce(array_agg(distinct cat::int order by cat::int), array[]::int[])
    into v_cats
    from jsonb_array_elements_text(coalesce(band -> 'allowed_categories', '[]'::jsonb)) as cat_text(cat)
    where cat ~ '^\d+$'
      and cat::int between 1 and 3;

    if coalesce(array_length(v_cats, 1), 0) = 0 then
      raise exception 'Each band requires at least one allowed category (1-3).';
    end if;
  end loop;

  delete from public.app_options
  where category = 'category_restriction';

  for band in
    select value
    from jsonb_array_elements(p_bands)
    order by (value ->> 'min_role_level')::int
  loop
    v_min := (band ->> 'min_role_level')::int;

    select coalesce(array_agg(distinct cat::int order by cat::int), array[]::int[])
    into v_cats
    from jsonb_array_elements_text(band -> 'allowed_categories') as cat_text(cat)
    where cat ~ '^\d+$'
      and cat::int between 1 and 3;

    v_value := array_to_string(v_cats, ',');

    insert into public.app_options (category, value, group_name, sort_order, is_active)
    values ('category_restriction', v_value, v_min::text, v_min, true);
  end loop;

  v_new := public.get_category_restriction_policy();

  insert into public.category_restriction_policy_log (actor_id, action, old_policy, new_policy)
  values (auth.uid(), 'updated', v_old, v_new);

  return v_new;
end;
$$;
