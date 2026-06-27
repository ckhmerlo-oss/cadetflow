-- Admin role at level 105 (force-archive tier; Commandant remains 90)

UPDATE public.roles
SET
  default_role_level = 105,
  can_manage_all_rosters = true,
  can_manage_own_company_roster = true
WHERE role_name = 'Admin';

INSERT INTO public.roles (
  id,
  role_name,
  can_manage_all_rosters,
  can_manage_own_company_roster,
  company_id,
  default_role_level,
  approval_group_id
)
SELECT
  'a0000000-0000-0000-0000-000000000005',
  'Admin',
  true,
  true,
  c.id,
  105,
  g.id
FROM public.companies c
CROSS JOIN public.approval_groups g
WHERE c.company_name = 'Battalion Staff'
  AND g.group_name = 'Commandant''s Office'
  AND NOT EXISTS (
    SELECT 1 FROM public.roles WHERE role_name = 'Admin'
  );

CREATE OR REPLACE FUNCTION public.create_new_role(
  p_role_name text,
  p_company_id uuid,
  p_approval_group_id uuid,
  p_default_role_level integer,
  p_can_manage_all_rosters boolean,
  p_can_manage_own_company_roster boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.get_my_role_level() < 90 THEN
    RAISE EXCEPTION 'You do not have permission to create new roles.';
  END IF;

  IF p_default_role_level < 0 OR p_default_role_level > 110 THEN
    RAISE EXCEPTION 'Role level must be between 0 and 110.';
  END IF;

  INSERT INTO public.roles (
    role_name,
    company_id,
    approval_group_id,
    default_role_level,
    can_manage_all_rosters,
    can_manage_own_company_roster
  ) VALUES (
    p_role_name,
    p_company_id,
    p_approval_group_id,
    p_default_role_level,
    p_can_manage_all_rosters,
    p_can_manage_own_company_roster
  );
END;
$function$;
