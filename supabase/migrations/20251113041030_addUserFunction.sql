set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert a new row into public.profiles
  -- Use the names from the metadata if available, otherwise default to 'New' 'User'
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
  );
  
  RETURN NEW;
END;
$function$
;


