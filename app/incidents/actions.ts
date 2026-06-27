'use server'

import { validatePolicyCategoryForRole } from '@/app/lib/categoryRestrictions.server'
import { incidentSubmissionErrorMessage } from '@/app/lib/submissionPermissions'
import { canSubmitIncidents } from '@/app/lib/submissionPermissions.server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... (Existing Types and Fetch functions remain the same) ...

export type IncidentReport = {
  id: string
  created_at: string
  reporter_id: string
  subject_cadet_id: string
  description: string
  location: string
  incident_time: string
  action_taken: string | null
  status: 'pending' | 'handled' | 'converted' | 'closed'
  resolved_at: string | null
  resolved_by: string | null
  resolution_notes: string | null
  handled_by_id: string | null
  // Joins
  reporter: { first_name: string; last_name: string }
  subject: { first_name: string; last_name: string; company?: { company_name: string } }
  resolver?: { first_name: string; last_name: string }
  handler?: { first_name: string; last_name: string }
}

// 1. UPDATED: Get Incidents with Company Filtering
export async function getIncidents(filter: 'pending' | 'resolved' | 'all' = 'pending') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get Viewer Profile
  const { data: viewer } = await supabase
    .from('profiles')
    .select('company_id, role:roles!inner(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (viewer?.role as any)?.default_role_level || 0
  const viewerCompanyId = viewer?.company_id

  // Base Query
  let query = supabase
    .from('incident_reports')
    .select(`
      *,
      reporter:profiles!reporter_id(first_name, last_name),
      subject:profiles!subject_cadet_id(first_name, last_name, company_id, company:companies(company_name)),
      resolver:profiles!resolved_by(first_name, last_name),
      handler:profiles!handled_by_id(first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.eq('status', 'pending')
  else if (filter === 'resolved') query = query.in('status', ['handled', 'converted'])

  const { data, error } = await query
  if (error) {
      console.error('Error fetching incidents:', error.message, error.details, error.hint, error.code)
      return []
  }

  let result = data as any[]

  // FILTER: If TAC (65-89), only show own company
  // Admins (90+) see all. Faculty (50-64) see own submissions (handled by RLS usually, but safe to filter here too).
  if (roleLevel >= 65 && roleLevel < 90) {
      result = result.filter(r => r.subject?.company_id === viewerCompanyId)
  }

  return result as IncidentReport[]
}

// ... (submitIncident, resolveAsHandled, convertToDemerit remain exactly the same) ...
type IncidentPayload = {
    cadetIds: string[]
    description: string
    location: string
    incident_time: string 
    action_taken?: string
}

export async function submitIncident(payload: IncidentPayload) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role:role_id(default_role_level)')
        .eq('id', user.id)
        .eq('archived', false)
        .single()

    const roleLevel =
        (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0

    const allowed = await canSubmitIncidents(roleLevel)
    if (!allowed) return { error: incidentSubmissionErrorMessage() }

    const rows = payload.cadetIds.map(cadetId => ({
        reporter_id: user.id,
        subject_cadet_id: cadetId,
        description: payload.description,
        location: payload.location,
        incident_time: payload.incident_time,
        action_taken: payload.action_taken || null,
        status: 'pending'
    }))

    const { error } = await supabase.from('incident_reports').insert(rows)
    if (error) return { error: error.message }
    
    revalidatePath('/incidents')
    return { success: true }
}

export async function resolveAsHandled(incidentId: string, notes: string, handledById: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Update Incident
    const { data: incident, error: updateError } = await supabase
        .from('incident_reports')
        .update({
            status: 'handled',
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
            resolution_notes: notes,
            handled_by_id: handledById 
        })
        .eq('id', incidentId)
        .select()
        .single()

    if (updateError) return { error: updateError.message }

    // 2. Log to Ledger (0 value history)
    const { error: ledgerError } = await supabase
        .from('tour_ledger')
        .insert({
            cadet_id: incident.subject_cadet_id,
            staff_id: handledById, 
            amount: 0,
            action: 'adjustment',
            comment: `Incident Handled: ${notes}`
        })

    if (ledgerError) console.error("Ledger logging failed:", ledgerError)

    revalidatePath('/incidents')
    return { success: true }
}

// 2. UPDATED: Convert with Submitter Swap
// ... imports

export async function convertToDemerit(incidentId: string, offenseTypeId: string, greenSheetSummary: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: converterProfile } = await supabase
        .from('profiles')
        .select('role:role_id(default_role_level)')
        .eq('id', user.id)
        .eq('archived', false)
        .single()

    const converterRoleLevel =
        (converterProfile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0

    // 1. Get Incident Data
    const { data: incident } = await supabase.from('incident_reports').select('*').eq('id', incidentId).single()
    if (!incident) return { error: "Incident not found" }

    // 2. Get Offense Details
    const { data: offense } = await supabase
        .from('offense_types')
        .select('demerits, policy_category')
        .eq('id', offenseTypeId)
        .single()
    
    if (!offense) return { error: "Offense type not found" }

    const categoryCheck = await validatePolicyCategoryForRole(
        offense.policy_category,
        converterRoleLevel
    )
    if (!categoryCheck.ok) return { error: categoryCheck.error }

    // 3. FETCH APPROVAL CHAIN (Double-Hop)
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('role:role_id (approval_group_id)')
        .eq('id', user.id)
        .single()
    
    const myGroupId = (userProfile?.role as any)?.approval_group_id
    let nextGroupId = null;

    if (myGroupId) {
        const { data: myGroup } = await supabase
            .from('approval_groups')
            .select('next_approver_group_id')
            .eq('id', myGroupId)
            .single()
        nextGroupId = myGroup?.next_approver_group_id || null;
    }

    // --- FIX: FORCE EASTERN TIME DATE STRING ---
    // We create a date object from the incident time
    const incidentDateObj = new Date(incident.incident_time);
    
    // We format it specifically to 'en-CA' (which gives YYYY-MM-DD) 
    // AND force the timeZone to New York. This ensures 8pm EST is still "Today", not "Tomorrow" (UTC).
    const safeDateOfOffense = incidentDateObj.toLocaleDateString('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    // --------------------------------

    // 4. Create Report
    const { data: newReport, error: insertError } = await supabase
        .from('demerit_reports')
        .insert({
            subject_cadet_id: incident.subject_cadet_id,
            offense_type_id: offenseTypeId,
            submitted_by: incident.reporter_id, 
            
            date_of_offense: safeDateOfOffense, // <--- Now reliably '2025-12-14' (or whatever local date is)
            
            notes: greenSheetSummary,                 
            report_explanation: incident.description, 
            demerits_effective: offense.demerits,
            status: 'pending_approval',
            linked_incident_id: incidentId,
            current_approver_group_id: nextGroupId
        })
        .select('id')
        .single()

    if (insertError || !newReport) {
        console.error("Conversion Error:", insertError)
        return { error: "Failed to create report: " + insertError?.message }
    }

    // 5. INSERT LOGS
    // A. "Submitted" Log (Backdated)
    await supabase.from('approval_log').insert({
        report_id: newReport.id,
        actor_id: incident.reporter_id,
        action: 'submitted',
        comment: 'Original Incident Report filed.',
        created_at: incident.created_at
    })

    // B. "Converted" Log (Current Time)
    await supabase.from('approval_log').insert({
        report_id: newReport.id,
        actor_id: user.id,
        action: 'converted',
        comment: `Converted to demerit report. (Explanation moved to private narrative)`,
        created_at: new Date().toISOString()
    })

    // 6. Close Incident
    await supabase
        .from('incident_reports')
        .update({
            status: 'converted',
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
            resolution_notes: "Converted to Demerit Report"
        })
        .eq('id', incidentId)

    revalidatePath('/incidents')
    return { success: true }
}

// 3. UPDATED: Faculty List with Roles
export async function getFacultyList() {
    const supabase = createClient()

    const { data } = await supabase
        .from('profiles')
        .select(`
            id,
            first_name,
            last_name,
            role:roles!inner(default_role_level, role_name),
            staff_profiles!inner (staff_title, department)
        `)
        .gte('role.default_role_level', 50)
        .order('last_name')
        .eq('archived', false)

    return data?.map((p: any) => {
      const staff = Array.isArray(p.staff_profiles) ? p.staff_profiles[0] : p.staff_profiles
      const title = staff?.staff_title || p.role.role_name
      const dept = staff?.department ? ` / ${staff.department}` : ''
      return {
        id: p.id,
        label: `${p.last_name}, ${p.first_name} (${title}${dept})`
      }
    }) || []
}

// NEW: Fetch Single Incident
export async function getIncident(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('incident_reports')
    .select(`
      *,
      reporter:profiles!reporter_id(first_name, last_name),
      subject:profiles!subject_cadet_id(first_name, last_name, company:companies(company_name)),
      resolver:profiles!resolved_by(first_name, last_name),
      handler:profiles!handled_by_id(first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as IncidentReport
}