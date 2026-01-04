'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. APPROVE ---
export async function approveReportAction(reportId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Fetch current report state to find next approver
  const { data: report } = await supabase
    .from('demerit_reports')
    .select('current_approver_group_id')
    .eq('id', reportId)
    .single()

  if (!report) return { error: 'Report not found' }

  // Find the next group in the chain
  const { data: currentGroup } = await supabase
    .from('approval_groups')
    .select('next_approver_group_id')
    .eq('id', report.current_approver_group_id)
    .single()

  const nextGroupId = currentGroup?.next_approver_group_id || null
  const newStatus = nextGroupId ? 'pending_approval' : 'completed'

  const { error } = await supabase
    .from('demerit_reports')
    .update({ 
      status: newStatus,
      current_approver_group_id: nextGroupId
    })
    .eq('id', reportId)

  if (error) return { error: error.message }

  // Log it
  await supabase.from('approval_log').insert({
    report_id: reportId,
    actor_id: user.id,
    action: 'approved',
    comment: 'Approved'
  })

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 2. REJECT ---
export async function rejectReportAction(reportId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('demerit_reports')
    .update({ status: 'rejected', current_approver_group_id: null })
    .eq('id', reportId)

  if (error) return { error: error.message }

  await supabase.from('approval_log').insert({
    report_id: reportId,
    actor_id: user.id,
    action: 'rejected',
    comment: 'Rejected by approver'
  })

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 3. KICK BACK ---
export async function kickBackReportAction(reportId: string, reason: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get user's group to mark who kicked it back
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(approval_group_id)')
    .eq('id', user.id)
    .single()
    
  const myGroupId = (profile?.role as any)?.approval_group_id

  const { error } = await supabase
    .from('demerit_reports')
    .update({ 
      status: 'needs_revision', 
      revision_by_group_id: myGroupId 
    })
    .eq('id', reportId)

  if (error) return { error: error.message }

  await supabase.from('approval_log').insert({
    report_id: reportId,
    actor_id: user.id,
    action: 'Kicked Back for Revision',
    comment: reason
  })

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 4. PULL (By Submitter) ---
export async function pullReportAction(reportId: string, comment: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('demerit_reports')
    .update({ status: 'pulled', current_approver_group_id: null })
    .eq('id', reportId)
    
  if (error) return { error: error.message }

  await supabase.from('approval_log').insert({
    report_id: reportId,
    actor_id: user?.id,
    action: 'pulled',
    comment: comment
  })

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 5. RESUBMIT (Standard) ---
export async function resubmitReport(reportId: string, payload: {
    offenseTypeId: string,
    notes: string,
    reportExplanation: string,
    dateOfOffense: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Unauthorized' }

    // Recalculate Approver Chain
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('role:roles(approval_group_id)')
        .eq('id', user.id)
        .single()

    const myGroupId = (userProfile?.role as any)?.approval_group_id
    let targetGroupId = null

    if (myGroupId) {
        const { data: myGroup } = await supabase
            .from('approval_groups')
            .select('next_approver_group_id')
            .eq('id', myGroupId)
            .single()
        targetGroupId = myGroup?.next_approver_group_id || null
    }

    let status = 'pending_approval'
    if (myGroupId && !targetGroupId) {
        status = 'completed'
    }

    const { error: updateError } = await supabase
        .from('demerit_reports')
        .update({
            offense_type_id: payload.offenseTypeId,
            notes: payload.notes,
            report_explanation: payload.reportExplanation,
            date_of_offense: payload.dateOfOffense,
            status: status,
            current_approver_group_id: targetGroupId, 
            revision_by_group_id: null 
        })
        .eq('id', reportId)

    if (updateError) return { error: updateError.message }

    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'resubmitted',
        comment: 'Report revised and resubmitted'
    })

    revalidatePath(`/report/${reportId}`)
    return { success: true }
}

// --- 6. EDIT & APPROVE (Command Override) ---
export async function editAndApproveReport(reportId: string, payload: {
    offenseTypeId: string,
    notes: string,
    reportExplanation: string,
    dateOfOffense: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Unauthorized' }

    // Verify Permission
    const { data: profile } = await supabase
        .from('profiles')
        .select('role:roles(default_role_level)')
        .eq('id', user.id)
        .single()
    
    const roleLevel = (profile?.role as any)?.default_role_level || 0
    if (roleLevel < 90) return { error: 'Insufficient permissions' }

    // Force Complete
    const { error: updateError } = await supabase
        .from('demerit_reports')
        .update({
            offense_type_id: payload.offenseTypeId,
            notes: payload.notes,
            report_explanation: payload.reportExplanation,
            date_of_offense: payload.dateOfOffense,
            status: 'completed', 
            current_approver_group_id: null,
            revision_by_group_id: null
        })
        .eq('id', reportId)

    if (updateError) return { error: updateError.message }

    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'edited_and_approved',
        comment: 'Report edited and immediately approved by authority'
    })

    revalidatePath(`/report/${reportId}`)
    return { success: true }
}