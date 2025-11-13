set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_academic_term(p_term_name text, p_start_date date, p_end_date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- The RLS policy 'Admins can manage academic terms' will block this
  -- if the user is not an admin, so no need for an explicit check here.
  INSERT INTO public.academic_terms (term_name, start_date, end_date)
  VALUES (p_term_name, p_start_date, p_end_date);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_academic_term(p_term_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.academic_terms
  WHERE id = p_term_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_academic_terms()
 RETURNS TABLE(id uuid, term_name text, start_date date, end_date date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_site_admin() THEN
    RAISE EXCEPTION 'You do not have permission to view academic terms.';
  END IF;

  RETURN QUERY
  SELECT t.id, t.term_name, t.start_date, t.end_date
  FROM public.academic_terms t
  ORDER BY t.start_date DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_site_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.can_manage_all_rosters = true
  );
$function$
;


  create policy "Admins can manage academic terms"
  on "public"."academic_terms"
  as permissive
  for all
  to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());



  create policy "Authenticated users can read terms"
  on "public"."academic_terms"
  as permissive
  for select
  to authenticated
using (true);



