-- Fix overlap validation to compare all term pairs
create or replace function public.setup_school_year_terms(
  p_school_year text,
  p_term_names text[],
  p_start_dates date[],
  p_end_dates date[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
  j integer;
begin
  if not public.is_site_admin() and public.get_my_role_level() < 90 then
    raise exception 'Permission denied';
  end if;

  if coalesce(array_length(p_term_names, 1), 0) <> 5
    or coalesce(array_length(p_start_dates, 1), 0) <> 5
    or coalesce(array_length(p_end_dates, 1), 0) <> 5 then
    raise exception 'Exactly 5 terms are required';
  end if;

  for i in 1..5 loop
    if p_start_dates[i] >= p_end_dates[i] then
      raise exception 'Term % has invalid date range', i;
    end if;

    for j in 1..5 loop
      if i <> j and p_start_dates[i] <= p_end_dates[j] and p_end_dates[i] >= p_start_dates[j] then
        raise exception 'Term dates overlap within school year';
      end if;
    end loop;
  end loop;

  for i in 1..5 loop
    update public.academic_terms
    set
      term_name = p_term_names[i],
      start_date = p_start_dates[i],
      end_date = p_end_dates[i],
      archived = false
    where school_year = p_school_year
      and term_number = i
      and archived = false;

    if not found then
      insert into public.academic_terms (term_name, start_date, end_date, school_year, term_number, archived)
      values (p_term_names[i], p_start_dates[i], p_end_dates[i], p_school_year, i, false);
    end if;
  end loop;
end;
$$;
