'use server'

import { validatePolicyCategoryForRole } from '@/app/lib/categoryRestrictions.server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. APPROVE ---
export async function approveReportAction(reportId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized: No user session.' }

  const { error } = await supabase.rpc('handle_approval', {
    report_id_to_approve: reportId,
    approval_comment: 'Approved'
  })
  if (error) return { error: error.message }

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 2. REJECT ---
export async function rejectReportAction(reportId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('handle_rejection', {
    p_report_id: reportId,
    p_comment: 'Rejected by approver'
  })

  if (error) return { error: error.message }

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 3. KICK BACK ---
export async function kickBackReportAction(reportId: string, reason: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  if (!reason?.trim()) return { error: 'A comment is required.' }

  const { error } = await supabase.rpc('handle_kickback', {
    p_report_id: reportId,
    p_comment: reason.trim()
  })

  if (error) return { error: error.message }

  revalidatePath(`/report/${reportId}`)
  return { success: true }
}

// --- 4. PULL (By Submitter) ---
export async function pullReport(reportId: string, comment: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  if (!comment?.trim()) return { success: false, error: 'A comment is required.' }

  const { error } = await supabase.rpc('pull_report', {
    p_report_id: reportId,
    p_comment: comment.trim()
  })
  if (error) return { success: false, error: error.message }

  revalidatePath(`/report/${reportId}`)
  revalidatePath('/reports/submitted')
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('role:roles(default_role_level)')
        .eq('id', user.id)
        .eq('archived', false)
        .single()

    const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0

    const { data: offense } = await supabase
        .from('offense_types')
        .select('policy_category')
        .eq('id', payload.offenseTypeId)
        .single()

    if (!offense) return { error: 'Invalid Offense Type.' }

    const categoryCheck = await validatePolicyCategoryForRole(offense.policy_category, roleLevel)
    if (!categoryCheck.ok) return { error: categoryCheck.error }

    // Recalculate Approver Chain
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('role:roles(approval_group_id)')
        .eq('id', user.id)
        .eq('archived', false)
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
        .eq('archived', false)
        .single()
    
    const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
    if (roleLevel < 90) return { error: 'Insufficient permissions' }

    // Commandant override: category restrictions bypassed at role >= 90 (DB trigger also skips)

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