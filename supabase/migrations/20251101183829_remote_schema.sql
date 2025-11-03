-- Drop the old, permissive update policy
DROP POLICY IF EXISTS "Involved parties can edit report" ON "public"."demerit_reports";

-- Create the new, correct policy that blocks edits on "completed" reports
CREATE POLICY "Involved parties can edit report"
ON "public"."demerit_reports"
AS permissive
FOR UPDATE
TO authenticated
USING (
  -- NEW: This check now blocks all edits if the report is completed
  (status != 'completed'::text) AND 
  (
    (auth.uid() = submitted_by) OR 
    public.is_member_of_approver_group(current_approver_group_id) OR 
    public.user_acted_on_report(id)
  )
)
WITH CHECK (
  -- NEW: Also add the check here for consistency
  (status != 'completed'::text) AND 
  (
    (auth.uid() = submitted_by) OR 
    public.is_member_of_approver_group(current_approver_group_id)
  )
);
