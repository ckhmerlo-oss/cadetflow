'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type SubmitPayload = {
  cadetId: string
  offenseTypeId: string
  dateOfOffense: string
  timeOfOffense: string
  notes: string       
  explanation: string 
}

export async function submitReport(payload: SubmitPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Fetch Offense Details
  const { data: offense } = await supabase
    .from('offense_types')
    .select('demerits')
    .eq('id', payload.offenseTypeId)
    .single()

  if (!offense) return { error: "Invalid Offense Type." }

  // 2. FETCH APPROVER CHAIN
  // Step A: Find the group the User belongs to
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role:role_id (approval_group_id)')
    .eq('id', user.id)
    .single()

  const myGroupId = (userProfile?.role as any)?.approval_group_id
  let targetGroupId = null

  // Step B: Find the "Next Approver"
  if (myGroupId) {
    const { data: myGroup } = await supabase
        .from('approval_groups')
        .select('next_approver_group_id')
        .eq('id', myGroupId)
        .single()
    
    targetGroupId = myGroup?.next_approver_group_id || null
  }

  // 3. DETERMINE STATUS (Fix for Issue #1)
  // If the user has a group, but there is NO next group, they are the Final Approver (Commandant).
  // We auto-approve the report.
  let status = 'pending_approval'
  let isAutoApproved = false

  if (myGroupId && !targetGroupId) {
      status = 'completed'
      isAutoApproved = true
  }

  // 4. INSERT REPORT
  const combinedString = `${payload.dateOfOffense}T${payload.timeOfOffense}:00`

  const { data: newReport, error: insertError } = await supabase
    .from('demerit_reports')
    .insert({
      subject_cadet_id: payload.cadetId,
      submitted_by: user.id,
      offense_type_id: payload.offenseTypeId,
      date_of_offense: combinedString,
      notes: payload.notes,                    
      report_explanation: payload.explanation, 
      demerits_effective: offense.demerits,
      status: status,
      current_approver_group_id: targetGroupId 
    })
    .select('id')
    .single()

  if (insertError || !newReport) {
    return { error: insertError?.message || "Failed to create report" }
  }

  // 5. LOGGING
  // Initial Submission Log
  await supabase.from('approval_log').insert({
      report_id: newReport.id,
      actor_id: user.id,
      action: 'submitted',
      comment: 'Report created',
      created_at: new Date().toISOString()
  })

  // If auto-approved, add a second log entry
  if (isAutoApproved) {
      await supabase.from('approval_log').insert({
          report_id: newReport.id,
          actor_id: user.id,
          action: 'approved',
          comment: 'Auto-approved (Final Authority)',
          created_at: new Date(Date.now() + 1000).toISOString() // +1 sec to ensure order
      })
  }

  revalidatePath('/')
  return { success: true }
}