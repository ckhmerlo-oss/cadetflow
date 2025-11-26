drop function if exists "public"."get_tour_sheet"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tour_sheet()
 RETURNS TABLE(cadet_id uuid, last_name text, first_name text, company_name text, total_tours integer, has_star_tours boolean, tours_logged_today boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query
  select
    p.id as cadet_id,
    p.last_name,
    p.first_name,
    c.company_name,
    coalesce(p.cached_tour_balance, 0) as total_tours,
    coalesce(p.has_star_tours, false) as has_star_tours,
    -- Check for any 'served' ledger entry created today
    exists (
        select 1 from public.tour_ledger tl
        where tl.cadet_id = p.id
          and tl.action = 'served'
          and tl.created_at >= current_date
    ) as tours_logged_today
  from
    public.profiles p
  left join
    public.companies c on p.company_id = c.id
  where
    (coalesce(p.cached_tour_balance, 0) > 0 or p.has_star_tours = true)
  order by
    p.last_name, p.first_name;
end;
$function$
;


