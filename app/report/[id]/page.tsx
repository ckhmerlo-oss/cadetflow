import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ReportDetailsClient from './ReportDetailsClient'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch User Profile
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select(`
      id,
      role:roles(
        role_name,
        default_role_level,
        approval_group_id
      )
    `)
    .eq('id', user.id)
    .eq('archived', false)
    .single()

  if (!rawProfile) redirect('/login')

  // Flatten the role array if Supabase returns it as one
  const userProfile = {
    id: rawProfile.id,
    role: Array.isArray(rawProfile.role) ? rawProfile.role[0] : rawProfile.role
  }

  // 2. Fetch Report
  const { data: report, error } = await supabase
    .from('demerit_reports')
    .select(`
      *,
      offense_type:offense_types(id, offense_name, demerits, offense_code, policy_category),
      subject:subject_cadet_id(id, first_name, last_name, cadet_profiles(cadet_rank)),
      submitter:submitted_by(id, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error || !report) notFound()

  // 3. Fetch Logs
  const { data: logs } = await supabase
    .from('approval_log')
    .select('*, actor:actor_id(first_name, last_name)')
    .eq('report_id', id)
    .order('created_at', { ascending: false })

  // 4. Fetch Appeal
  const { data: appeal } = await supabase
    .from('appeals')
    .select('*')
    .eq('report_id', id)
    .single()

  // 5. Fetch Offense Types
  const { data: offenses } = await supabase
    .from('offense_types')
    .select('*')
    .eq('is_active', true)
    .order('policy_category')
    .order('demerits')

  // Calculate Permissions
  const roleLevel = userProfile.role?.default_role_level || 0
  const isSubmitter = user.id === report.submitted_by
  const isSubject = user.id === report.subject_cadet_id
  const myGroupId = userProfile.role?.approval_group_id
  const isApprover = (report.status === 'pending_approval' && report.current_approver_group_id === myGroupId)

  let canActOnAppeal = false;
  if (appeal) {
      // 1. Direct Assignment Check (Fixes your issue)
      if (appeal.current_assignee_id === user.id) {
          canActOnAppeal = true;
      } 
      // 2. Group Assignment Check
      else if (appeal.current_group_id && appeal.current_group_id === myGroupId) {
          canActOnAppeal = true;
      }
      // 3. Fallback to Role/Status Based Checks
      else if (roleLevel >= 50) { 
          if (appeal.status === 'pending_issuer' && isSubmitter) canActOnAppeal = true;
          else if (appeal.status === 'pending_chain' && !isSubmitter && roleLevel >= 60) canActOnAppeal = true;
          else if (appeal.status === 'pending_commandant' && roleLevel >= 90) canActOnAppeal = true;
      }
  }

  const canPull = isSubmitter || roleLevel >= 90;

  const permissions = {
      isSubmitter,
      isSubject,
      isApprover,
      canActOnAppeal,
      canPull
  }

  return (
    <ReportDetailsClient 
      user={user}
      initialReport={report}
      initialLogs={logs || []}
      initialAppeal={appeal}
      offenses={offenses || []}
      escalationTarget={null} 
      permissions={permissions}
      userProfile={userProfile}
    />
  )
}