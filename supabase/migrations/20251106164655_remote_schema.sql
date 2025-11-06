set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_profile_company_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Trigger 1: If the user's company is changing...
  IF (TG_OP = 'UPDATE' AND OLD.company_id IS DISTINCT FROM NEW.company_id) THEN
      -- ...set their role to NULL, as their old role is no longer valid.
      NEW.role_id := NULL;
      -- *** The line setting 'NEW.role_level = 10' has been removed. ***
  END IF;

  -- Trigger 2: If the user's role is changing...
  IF (NEW.role_id IS NOT NULL) AND
     (TG_OP = 'INSERT' OR OLD.role_id IS DISTINCT FROM NEW.role_id) THEN
      
      -- ...check if the new role belongs to the user's assigned company.
      IF NOT EXISTS (
        SELECT 1 FROM public.roles r
        WHERE r.id = NEW.role_id AND r.company_id = NEW.company_id
      ) THEN
        RAISE EXCEPTION 'Role assignment failed: The selected role does not belong to the user''s assigned company.';
      END IF;
  END IF;

  RETURN NEW;
END;
$function$
;


