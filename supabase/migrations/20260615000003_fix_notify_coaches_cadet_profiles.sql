-- Re-apply coach notification trigger to read sports from cadet_profiles (not profiles)
create or replace function public.notify_coaches_on_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_cadet record;
  v_sport_id uuid;
  v_coach record;
begin
  select p.first_name, p.last_name, cp.sport_fall, cp.sport_winter, cp.sport_spring
  into v_cadet
  from public.profiles p
  join public.cadet_profiles cp on cp.profile_id = p.id
  where p.id = new.subject_cadet_id;

  if not found then
    return new;
  end if;

  if v_cadet.sport_fall is not null and v_cadet.sport_fall != 'None' then
    select id into v_sport_id from public.sports where name = v_cadet.sport_fall and season = 'Fall';
    if v_sport_id is not null then
      for v_coach in select coach_id from public.sport_coaches where sport_id = v_sport_id loop
        insert into public.notification_queue (user_id, event_type, subject, message, link_url)
        values (
          v_coach.coach_id,
          'team_alert',
          'Misconduct Report: ' || v_cadet.last_name,
          'A report has been filed against ' || v_cadet.first_name || ' ' || v_cadet.last_name || ' (' || v_cadet.sport_fall || ').',
          '/report/' || new.id
        );
      end loop;
    end if;
  end if;

  return new;
end;
$function$;
