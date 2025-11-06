set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This version only inserts the required fields
  -- and no longer references the deleted 'role_level' column.
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name
  )
  VALUES (
    NEW.id,
    'New', -- Default first name
    'User'  -- Default last name
  );
  
  -- The user's company_id and role_id are left NULL,
  -- which correctly places them in the "Unassigned" list.
  
  RETURN NEW;
END;
$function$
;


