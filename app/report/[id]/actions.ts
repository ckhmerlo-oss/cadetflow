'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. APPROVE ---
export async function approveReportAction(reportId: string) {
  const supabase = createClient()
  
  // 1. Check User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      console.error("DEBUG: No authenticated user found.");
      return { error: 'Unauthorized: No user session.' }
  }

  console.log(`DEBUG: Attempting approval for Report ${reportId} by User ${user.id}`);

  // 2. Fetch User's Role & Group
  // FIX: Changed 'name' to 'role_name' in the select string
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role:roles(id, role_name, approval_group_id)') 
    .eq('id', user.id)
    .eq('archived', false)
    .single()

  if (profileError || !userProfile) {
      console.error("DEBUG: Could not fetch user profile/role", profileError);
      return { error: `Profile Error: ${profileError?.message || 'Profile not found'}` }
  }

  const myGroupId = (userProfile.role as any)?.approval_group_id;
  
  // FIX: Updated the log to read 'role_name'
  console.log(`DEBUG: User's Group ID: ${myGroupId} (Role: ${(userProfile.role as any)?.role_name})`);

  // 3. Fetch Report State (The "Lock" on the RLS Policy)
  const { data: report, error: reportError } = await supabase
    .from('demerit_reports')
    .select('id, current_approver_group_id, status')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
      console.error("DEBUG: Could not fetch report", reportError);
      return { error: `Report Error: ${reportError?.message || 'Report not found'}` }
  }

  console.log(`DEBUG: Report's Current Group ID: ${report.current_approver_group_id}`);
  console.log(`DEBUG: Report Status: ${report.status}`);

  // 4. VERIFY PERMISSION MATCH
  // This is the logic your RLS "USING" clause uses. If this is false, RLS will block you.
  if (report.current_approver_group_id !== myGroupId) {
      const msg = `DEBUG MISMATCH: User Group (${myGroupId}) != Report Group (${report.current_approver_group_id})`;
      console.error(msg);
      return { error: `Permission Denied: You are in group ${myGroupId}, but report is with group ${report.current_approver_group_id}` };
  }

  // 5. Determine Next Step
  const { data: currentGroup } = await supabase
    .from('approval_groups')
    .select('next_approver_group_id')
    .eq('id', report.current_approver_group_id)
    .single()

  const nextGroupId = currentGroup?.next_approver_group_id || null
  const newStatus = nextGroupId ? 'pending_approval' : 'completed'

  console.log(`DEBUG: Advancing to Group: ${nextGroupId} | New Status: ${newStatus}`);

  // 6. Perform Update
  const { error: updateError } = await supabase
    .from('demerit_reports')
    .update({ 
      status: newStatus,
      current_approver_group_id: nextGroupId
    })
    .eq('id', reportId)

  if (updateError) {
      console.error("DEBUG: Update Failed", updateError);
      // Return the raw database error to the UI
      return { error: `DB Update Failed: ${updateError.message} (Code: ${updateError.code})` }
  }

  // 7. Log Success
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
    .eq('archived', false)
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
export async function pullReport(reportId: string, comment: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: report } = await supabase
    .from('demerit_reports')
    .select('submitted_by, status')
    .eq('id', reportId)
    .single()

  if (!report) return { success: false, error: 'Report not found' }
  
  // Get User Role for Override
  const { data: profile } = await supabase
     .from('profiles')
     .select('role:roles(default_role_level)')
     .eq('id', user.id)
     .eq('archived', false)
     .single()
     
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  const isSubmitter = report.submitted_by === user.id
  const isCommandant = roleLevel >= 90

  // Guard Clause
  if (!isSubmitter && !isCommandant) {
      return { success: false, error: 'Permission Denied: You cannot pull this report.' }
  }
  // ---------------------------------------------

  if (report.status === 'pulled') {
      return { success: false, error: 'This report is already pulled.' }
  }

  // 2. Update to 'Pulled', Zero Demerits, Remove from Approval Chain
  const { error } = await supabase
    .from('demerit_reports')
    .update({ 
        status: 'pulled', // <--- Distinct status
        current_approver_group_id: null, 
        demerits_effective: 0, // Ensure no demerits apply
        revision_by_group_id: null // Ensure it doesn't appear in anyone's revision queue
    })
    .eq('id', reportId)

  if (error) {
    console.error('Pull Error:', error)
    return { success: false, error: error.message }
  }

  // 3. Log the action
  await supabase.from('approval_log').insert({
    report_id: reportId,
    actor_id: user.id,
    action: 'pulled',
    comment: comment
  })

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