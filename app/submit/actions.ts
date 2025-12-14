'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type SubmitPayload = {
  cadetId: string
  offenseTypeId: string
  dateOfOffense: string // "YYYY-MM-DD"
  timeOfOffense: string // "HH:MM"
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

  // 2. FETCH APPROVER CHAIN (Double-Hop Logic)
  // Step A: Find the group the User belongs to (e.g., "Alpha TAC")
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role:role_id (approval_group_id)')
    .eq('id', user.id)
    .single()

  const myGroupId = (userProfile?.role as any)?.approval_group_id
  let targetGroupId = null

  // Step B: Find the "Next Approver" for that group (e.g., "Commandant")
  if (myGroupId) {
    const { data: myGroup } = await supabase
        .from('approval_groups')
        .select('next_approver_group_id')
        .eq('id', myGroupId)
        .single()
    
    targetGroupId = myGroup?.next_approver_group_id || null
  }

  // 3. CONSTRUCT TIMESTAMP
  const combinedString = `${payload.dateOfOffense}T${payload.timeOfOffense}:00`

  // 4. INSERT REPORT (And select ID for logging)
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
      status: 'pending_approval',
      current_approver_group_id: targetGroupId // <--- Assigned to Boss, not Self
    })
    .select('id')
    .single()

  if (insertError || !newReport) {
    console.error("Submit Error:", insertError?.message)
    return { error: insertError?.message || "Failed to create report" }
  }

  // 5. INSERT LOG ENTRY (Fixing missing log)
  const { error: logError } = await supabase.from('approval_log').insert({
      report_id: newReport.id,
      actor_id: user.id,
      action: 'submitted',
      comment: 'Report created',
      created_at: new Date().toISOString()
  })

  if (logError) console.error("Log Error:", logError.message)

  revalidatePath('/')
  return { success: true }
}