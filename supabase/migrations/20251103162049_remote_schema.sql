alter table "public"."profiles" drop column "full_name";

alter table "public"."profiles" add column "first_name" text not null;

alter table "public"."profiles" add column "last_name" text not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_subordinates()
 RETURNS TABLE(id uuid, first_name text, last_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    my_level INTEGER;
BEGIN
    -- *** FIX: Added alias 'p' to disambiguate 'p.id' ***
    SELECT p.role_level 
    INTO my_level 
    FROM public.profiles p 
    WHERE p.id = auth.uid();
    
    -- This query was already correct
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name
    FROM public.profiles p
    WHERE p.role_level < my_level;
END;
$function$
;


