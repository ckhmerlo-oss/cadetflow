'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... (Keep existing pullReportAction) ...
export async function pullReportAction(reportId: string, comment: string) {
  // ... (existing code) ...
  const supabase = createClient()
  const { error } = await supabase.rpc('pull_report', { p_report_id: reportId, p_comment: comment })
  if (error) return { error: `Action failed: ${error.message}` }
  revalidatePath(`/report/${reportId}`)
  revalidatePath(`/ledger/[id]`, 'layout')
  revalidatePath('/manage')
  revalidatePath('/')
  return { success: true }
}

// --- NEW ACTION: Resubmit Report ---
export async function resubmitReport(reportId: string, payload: {
    offenseTypeId: string,
    notes: string,
    reportExplanation: string,
    dateOfOffense: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Unauthorized' }

    // 1. Recalculate Approver Chain (Same logic as Submit)
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('role:role_id (approval_group_id)')
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

    // 2. Check for Auto-Approval
    let status = 'pending_approval'
    let isAutoApproved = false
    if (myGroupId && !targetGroupId) {
        status = 'completed'
        isAutoApproved = true
    }

    // 3. Update Report
    const { error: updateError } = await supabase
        .from('demerit_reports')
        .update({
            offense_type_id: payload.offenseTypeId,
            notes: payload.notes,
            report_explanation: payload.reportExplanation,
            date_of_offense: payload.dateOfOffense,
            status: status,
            current_approver_group_id: targetGroupId, // <--- IMPORTANT: Re-assigns to boss
            revision_by_group_id: null // Clear the revision flag
        })
        .eq('id', reportId)

    if (updateError) return { error: updateError.message }

    // 4. Log
    await supabase.from('approval_log').insert({
        report_id: reportId,
        actor_id: user.id,
        action: 'resubmitted',
        comment: 'Report revised and resubmitted'
    })

    if (isAutoApproved) {
        await supabase.from('approval_log').insert({
            report_id: reportId,
            actor_id: user.id,
            action: 'approved',
            comment: 'Auto-approved (Final Authority)'
        })
    }

    revalidatePath('/')
    revalidatePath(`/report/${reportId}`)
    return { success: true }
}