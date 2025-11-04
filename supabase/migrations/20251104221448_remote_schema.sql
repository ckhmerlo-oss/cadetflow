set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert a new row into public.profiles
  -- for the new user from auth.users
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role_level
  )
  VALUES (
    NEW.id,
    'New', -- Default first name
    'User', -- Default last name
    10      -- Default 'Cadet' role_level
  );
  
  -- company_id and role_id are left NULL by default,
  -- which correctly places them in the "Unassigned" list.
  
  RETURN NEW;
END;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


