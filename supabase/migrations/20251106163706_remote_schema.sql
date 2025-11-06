set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This creates the initial row.
  -- The onboarding page then updates this row.
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
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_my_onboarding_profile(p_first_name text, p_last_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the user's profile with the name they entered
  UPDATE public.profiles
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    company_id = NULL, -- User remains unassigned
    role_id = NULL
  WHERE id = auth.uid();
END;
$function$
;


