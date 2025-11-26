set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.mark_green_sheet_as_posted(p_report_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This check is correct per your request.
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
      AND r.role_name IN ('Commandant', 'Deputy Commandant', 'Admin')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action.';
  END IF;

  UPDATE public.demerit_reports
  SET is_posted = true
  WHERE id = ANY(p_report_ids);
END;
$function$
;


