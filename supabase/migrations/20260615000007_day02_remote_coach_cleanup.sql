-- Prefer Day 02 test coaches over legacy sport_coaches rows for Spring lacrosse/track.
DELETE FROM public.sport_coaches sc
USING public.sports s
WHERE sc.sport_id = s.id
  AND s.season = 'Spring'
  AND s.name IN ('Varsity Lacrosse', 'Track & Field')
  AND sc.coach_id NOT IN (
    'd1020000-0000-0000-0000-000000000003',
    'd1020000-0000-0000-0000-000000000004'
  );

INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'd1020000-0000-0000-0000-000000000003'::uuid, 'Head Coach'
FROM public.sports s
WHERE s.name = 'Varsity Lacrosse' AND s.season = 'Spring'
ON CONFLICT (sport_id, coach_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO public.sport_coaches (sport_id, coach_id, role)
SELECT s.id, 'd1020000-0000-0000-0000-000000000004'::uuid, 'Head Coach'
FROM public.sports s
WHERE s.name = 'Track & Field' AND s.season = 'Spring'
ON CONFLICT (sport_id, coach_id) DO UPDATE SET role = EXCLUDED.role;

SELECT public.sync_cadet_oversight(u.id, NULL)
FROM auth.users u
WHERE u.email IN ('cadet1@test.email', 'cadet2@test.email');
