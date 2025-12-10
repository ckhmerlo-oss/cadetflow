'use server'

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
  status: 'pending' | 'handled' | 'converted'
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
      console.error('Error fetching incidents:', error)
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

// 2. UPDATED: Convert to Demerit
export async function convertToDemerit(incidentId: string, offenseTypeId: string, notes: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Incident
    const { data: incident } = await supabase.from('incident_reports').select('*').eq('id', incidentId).single()
    if (!incident) return { error: "Incident not found" }

    // 2. Prepare Timestamps (Safe Handling)
    const incidentTime = new Date(incident.incident_time).getTime()
    const nowTime = new Date().getTime()
    const safeTimestamp = (incidentTime > nowTime) ? new Date().toISOString() : incident.incident_time;

    // 3. Create Report (Initially owned by TAC)
    const { error: rpcError } = await supabase.rpc('create_new_report', {
        p_subject_cadet_id: incident.subject_cadet_id,
        p_offense_type_id: offenseTypeId,
        p_notes: notes, 
        p_offense_timestamp: safeTimestamp
    })

    if (rpcError) {
        console.error("RPC Error:", rpcError);
        return { error: "Failed to create report: " + rpcError.message }
    }

    // 4. Find the report we just created
    // We assume the most recent report by this TAC for this Student is the one.
    const { data: newReport } = await supabase
        .from('demerit_reports')
        .select('id')
        .eq('submitted_by', user.id)
        .eq('subject_cadet_id', incident.subject_cadet_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (newReport) {
        // 5. CRITICAL: Swap Submitter to Original Reporter
        // Note: The TAC must have UPDATE permission on 'demerit_reports' for this to work.
        const { error: updateError } = await supabase
            .from('demerit_reports')
            .update({ 
                linked_incident_id: incidentId,
                submitted_by: incident.reporter_id // <--- The Teacher's ID
            })
            .eq('id', newReport.id)
        
        if (updateError) {
            console.error("Failed to swap submitter:", updateError);
            // We don't abort, but we log it. The report exists, just attributed to TAC.
        }
    } else {
        console.error("Could not find the newly created report to link.");
    }

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
    
    // Fetch everyone level 50+ (Faculty, TACs, Admin)
    const { data } = await supabase
        .from('profiles')
        .select(`
            id, 
            first_name, 
            last_name, 
            role:roles!inner(default_role_level, role_name)
        `)
        .gte('role.default_role_level', 50)
        .order('last_name')
    
    return data?.map((p: any) => ({
        id: p.id,
        // Label includes role to verify who is who
        label: `${p.last_name}, ${p.first_name} (${p.role.role_name})` 
    })) || []
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