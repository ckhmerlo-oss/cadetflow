// in app/report/[id]/page.tsx
// NO 'use client' - This is now a Server Component

import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ReportDetailsClient from './ReportDetailsClient'
import { User } from '@supabase/supabase-js'

// ... Types (Report, Log, OffenseType, Appeal) remain identical ...
type Report = {
  id: string;
  status: string;
  notes: string | null;
  submitted_by: string;
  subject_cadet_id: string;
  current_approver_group_id: string | null; 
  date_of_offense: string;
  offense_type_id: string;
  demerits_effective: number;
  subject: { first_name: string, last_name: string }; 
  submitter: { first_name: string, last_name: string };
  offense_type: {
    offense_name: string;
    offense_code: string;
    demerits: number;
    policy_category: number;
  }
};

type Log = {
  id: string;
  action: string;
  comment: string;
  created_at: string;
  actor: { first_name: string, last_name: string } | null; 
};

type OffenseType = {
  id: string;
  offense_group: string;
  offense_name: string;
  demerits: number;
}

type Appeal = {
  id: string;
  status: string;
  justification: string;
  current_assignee_id: string | null;
  current_group_id: string | null;
  issuer_comment: string | null;
  chain_comment: string | null;
  final_comment: string | null;
}

async function getReportData(reportId: string, user: User) {
  const supabase = createClient()

  // 1. Fetch main report, logs, and appeal in parallel
  const [reportResult, logResult, appealResult] = await Promise.all([
    supabase
      .from('demerit_reports') 
      .select(`*, subject:subject_cadet_id ( first_name, last_name ), submitter:submitted_by ( first_name, last_name ), offense_type:offense_type_id ( * )`)
      .eq('id', reportId)
      .single(),
    supabase
      .from('approval_log')
      .select('*, actor:actor_id(first_name, last_name)')
      .eq('report_id', reportId)
      // *** FIX: Changed to ascending: true for chronological order (Oldest -> Newest) ***
      .order('created_at', { ascending: true }),
    supabase
      .from('appeals')
      .select('id, status, justification, current_assignee_id, current_group_id, issuer_comment, chain_comment, final_comment')
      .eq('report_id', reportId)
      .maybeSingle()
  ])

  // --- Error Handling ---
  if (reportResult.error) {
    console.error('Report fetch error:', reportResult.error.message)
    return notFound()
  }

  const report = reportResult.data as unknown as Report
  const logs = (logResult.data || []) as Log[]
  const appeal = (appealResult.data || null) as Appeal | null

  // 2. Conditionally fetch data needed for interactions
  let offenses: OffenseType[] = []
  if (report.submitted_by === user.id && report.status === 'needs_revision') {
    const { data } = await supabase.from('offense_types').select('*').order('offense_group').order('offense_name')
    if (data) offenses = data as OffenseType[]
  }

  let escalationTarget: string | null = null
  if (appeal && ['rejected_by_issuer', 'rejected_by_chain'].includes(appeal.status)) {
     const { data } = await supabase.rpc('get_next_escalation_target', { p_appeal_id: appeal.id });
     if (data) escalationTarget = data as string
  }

  // 3. Check all user permissions in parallel
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level)')
    .eq('id', user.id)
    .single()
  
  const viewerRoleLevel = (viewerProfile?.role as any)?.default_role_level || 0
  const isCommandantStaff = viewerRoleLevel >= 90

  let isApprover = false
  if (report.current_approver_group_id) {
    const { data: isMember } = await supabase.rpc('is_member_of_approver_group', {
      p_group_id: report.current_approver_group_id
    })
    isApprover = !!isMember
  }

  let canActOnAppeal = false
  if (appeal && user) {
      if (appeal.status === 'pending_issuer' && appeal.current_assignee_id === user.id) {
          canActOnAppeal = true;
      } else if (['pending_chain', 'pending_commandant'].includes(appeal.status)) {
           if (appeal.status === 'pending_commandant' && isCommandantStaff) {
               canActOnAppeal = true;
           } else if (appeal.current_group_id) {
               const { data: hasPerm } = await supabase.rpc('is_member_of_approver_group', { p_group_id: appeal.current_group_id });
               if (hasPerm) canActOnAppeal = true;
           }
      }
  }

  const isSubmitter = report.submitted_by === user.id
  const isCompleted = report.status === 'completed'
  const isPending = report.status === 'pending_approval'
  
  const canPull = (isSubmitter || isCommandantStaff) && (isCompleted || isPending)

  return {
    report,
    logs,
    appeal,
    offenses,
    escalationTarget,
    permissions: {
      isSubmitter: isSubmitter,
      isSubject: report.subject_cadet_id === user.id,
      isApprover,
      canActOnAppeal,
      canPull: !!canPull, 
    }
  }
}

export default async function ReportDetailsPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise; 
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  if (!params.id || params.id === 'undefined' || params.id === 'null') return notFound()

  const data = await getReportData(params.id, user)
  
  return (
    <ReportDetailsClient
      user={user}
      initialReport={data.report}
      initialLogs={data.logs}
      initialAppeal={data.appeal}
      offenses={data.offenses}
      escalationTarget={data.escalationTarget}
      permissions={data.permissions}
    />
  )
}