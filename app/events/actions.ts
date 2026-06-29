'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IncidentReport } from '@/app/incidents/actions'
import { getIncident, getFacultyList } from '@/app/incidents/actions'
import { getAllowedPolicyCategories } from '@/app/lib/categoryRestrictions.server'
import { filterOffensesByPolicy } from '@/app/lib/categoryRestrictions'
import type { SpecialReport } from '@/app/special-reports/actions'
import { mapReportSubjects } from '@/app/special-reports/lib/subjects'

export type EventStatus = 'open' | 'under_review' | 'closed' | 'carried_forward'

export type DisciplineEvent = {
  id: string
  title: string
  summary: string | null
  status: EventStatus
  school_year: string
  created_by: string
  created_at: string
  updated_at: string
  carried_forward_from_school_year: string | null
  carried_forward_at: string | null
  closed_at: string | null
  closed_by: string | null
  resolution_type?: 'demerits' | 'handled' | 'summary' | null
  creator?: { first_name: string; last_name: string }
}

export type EventDemeritReport = {
  id: string
  subject_cadet_id: string
  status: string
  demerits_effective: number
  notes: string | null
  subject?: { first_name: string; last_name: string }
  offense_type?: { offense_name: string; offense_code?: string | null }
}

export type EventDetail = DisciplineEvent & {
  incidents: (IncidentReport & { event_id?: string | null })[]
  special_reports: SpecialReport[]
  demerit_reports: EventDemeritReport[]
}

export type LinkableIncident = {
  id: string
  description: string
  status: string
  created_at: string
  subject: { first_name: string; last_name: string; company_id?: string | null }
  event_id: string | null
}

export type LinkableSpecialReport = SpecialReport

async function getViewerContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role:roles!inner(default_role_level, can_manage_all_rosters, can_manage_own_company_roster)')
    .eq('id', user.id)
    .single()

  const role = profile?.role as {
    default_role_level?: number
    can_manage_all_rosters?: boolean
    can_manage_own_company_roster?: boolean
  } | null

  return {
    userId: user.id,
    companyId: profile?.company_id ?? null,
    roleLevel: role?.default_role_level ?? 0,
    canManageAll: Boolean(role?.can_manage_all_rosters),
    canManageOwn: Boolean(role?.can_manage_own_company_roster),
  }
}

function filterByCompany<T extends { subject?: { company_id?: string | null }; submitter?: { company_id?: string | null } }>(
  items: T[],
  viewerCompanyId: string | null,
  roleLevel: number
): T[] {
  if (roleLevel >= 90) return items
  if (roleLevel < 65) return []
  return items.filter((item) => {
    const companyId =
      item.submitter?.company_id ??
      item.subject?.company_id ??
      null
    return companyId === viewerCompanyId
  })
}

export async function getEvents(filter: 'open' | 'closed' | 'all' = 'open') {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return []

  let query = supabase
    .from('events')
    .select(`
      *,
      creator:profiles!created_by(first_name, last_name)
    `)
    .order('updated_at', { ascending: false })

  if (filter === 'open') {
    query = query.in('status', ['open', 'under_review', 'carried_forward'])
  } else if (filter === 'closed') {
    query = query.eq('status', 'closed')
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching events:', error.message)
    return []
  }

  let events = (data ?? []) as DisciplineEvent[]
  return events
}

export async function getEvent(id: string): Promise<EventDetail | null> {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return null

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      creator:profiles!created_by(first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error || !event) return null

  const { data: incidents } = await supabase
    .from('incident_reports')
    .select(`
      *,
      reporter:profiles!reporter_id(first_name, last_name),
      subject:profiles!subject_cadet_id(first_name, last_name, company_id, company:companies(company_name)),
      resolver:profiles!resolved_by(first_name, last_name),
      handler:profiles!handled_by_id(first_name, last_name)
    `)
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  const { data: specialReports } = await supabase
    .from('special_reports')
    .select(`
      *,
      submitter:profiles!submitter_cadet_id(first_name, last_name, company_id),
      subject:profiles!subject_cadet_id(first_name, last_name),
      reviewer:profiles!reviewed_by(first_name, last_name),
      event:events(id, title, status),
      subjects:special_report_subjects(
        cadet:profiles!cadet_id(id, first_name, last_name)
      )
    `)
    .eq('event_id', id)
    .order('flagged_for_review', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: demeritReports } = await supabase
    .from('demerit_reports')
    .select(`
      id,
      subject_cadet_id,
      status,
      demerits_effective,
      notes,
      subject:profiles!subject_cadet_id(first_name, last_name),
      offense_type:offense_types(offense_name, offense_code)
    `)
    .eq('linked_event_id', id)
    .order('created_at', { ascending: false })

  let incidentList = (incidents ?? []) as IncidentReport[]
  let reportList = (specialReports ?? []).map((row) =>
    mapReportSubjects(row as Parameters<typeof mapReportSubjects>[0]) as SpecialReport
  )

  if (viewer.roleLevel >= 65 && viewer.roleLevel < 90) {
    incidentList = incidentList.filter((i) => i.subject?.company_id === viewer.companyId)
    reportList = filterByCompany(reportList, viewer.companyId, viewer.roleLevel)
  }

  const demeritList: EventDemeritReport[] = (demeritReports ?? []).map((row) => {
    const subject = Array.isArray(row.subject) ? row.subject[0] : row.subject
    const offense = Array.isArray(row.offense_type) ? row.offense_type[0] : row.offense_type
    return {
      id: row.id,
      subject_cadet_id: row.subject_cadet_id,
      status: row.status,
      demerits_effective: row.demerits_effective,
      notes: row.notes,
      subject: subject ?? undefined,
      offense_type: offense ?? undefined,
    }
  })

  return {
    ...(event as DisciplineEvent),
    incidents: incidentList,
    special_reports: reportList,
    demerit_reports: demeritList,
  }
}

export async function createEvent(title: string, summary?: string) {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return { error: 'Unauthorized' }

  const { data, error } = await supabase.rpc('create_event', {
    p_title: title,
    p_summary: summary ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/')
  return { success: true, id: data as string }
}

export async function updateEventStatus(
  eventId: string,
  status: EventStatus,
  notes?: string
) {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('update_event_status', {
    p_event_id: eventId,
    p_status: status,
    p_notes: notes ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/')
  return { success: true }
}

export async function updateEventDetails(
  eventId: string,
  title?: string,
  summary?: string
) {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('update_event_details', {
    p_event_id: eventId,
    p_title: title ?? null,
    p_summary: summary ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
  revalidatePath('/incidents')
  return { success: true }
}

export async function linkFilingsToEvent(
  eventId: string,
  incidentIds: string[] = [],
  specialReportIds: string[] = [],
  unlinkIncidentIds: string[] = [],
  unlinkSpecialReportIds: string[] = []
) {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('link_filings_to_event', {
    p_event_id: eventId,
    p_incident_ids: incidentIds,
    p_special_report_ids: specialReportIds,
    p_unlink_incident_ids: unlinkIncidentIds,
    p_unlink_special_report_ids: unlinkSpecialReportIds,
  })

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
  revalidatePath('/incidents')
  return { success: true }
}

export type ResolvedFilingsArchive = {
  incidents: IncidentReport[]
  specialReports: SpecialReport[]
}

export async function getResolvedUnlinkedFilings(): Promise<ResolvedFilingsArchive> {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer) return { incidents: [], specialReports: [] }

  const { roleLevel, userId, companyId } = viewer

  if (roleLevel < 20) {
    return { incidents: [], specialReports: [] }
  }

  if (roleLevel >= 65) {
    const { data: incidents } = await supabase
      .from('incident_reports')
      .select(`
        *,
        reporter:profiles!reporter_id(first_name, last_name),
        subject:profiles!subject_cadet_id(first_name, last_name, company_id, company:companies(company_name)),
        resolver:profiles!resolved_by(first_name, last_name),
        handler:profiles!handled_by_id(first_name, last_name)
      `)
      .is('event_id', null)
      .in('status', ['handled', 'converted'])
      .order('resolved_at', { ascending: false })

    const { data: specialReports } = await supabase
      .from('special_reports')
      .select(`
        *,
        submitter:profiles!submitter_cadet_id(first_name, last_name, company_id),
        subject:profiles!subject_cadet_id(first_name, last_name),
        reviewer:profiles!reviewed_by(first_name, last_name),
        event:events(id, title, status),
        subjects:special_report_subjects(
          cadet:profiles!cadet_id(id, first_name, last_name)
        )
      `)
      .is('event_id', null)
      .in('status', ['reviewed', 'closed'])
      .order('reviewed_at', { ascending: false })

    let incidentList = (incidents ?? []) as IncidentReport[]
    let reportList = (specialReports ?? []).map((row) =>
      mapReportSubjects(row as Parameters<typeof mapReportSubjects>[0]) as SpecialReport
    )

    if (roleLevel >= 65 && roleLevel < 90) {
      incidentList = incidentList.filter((i) => i.subject?.company_id === companyId)
      reportList = filterByCompany(reportList, companyId, roleLevel)
    }

    return { incidents: incidentList, specialReports: reportList }
  }

  // Faculty and cadet leaders: own incident submissions only
  const { data: incidents } = await supabase
    .from('incident_reports')
    .select(`
      *,
      reporter:profiles!reporter_id(first_name, last_name),
      subject:profiles!subject_cadet_id(first_name, last_name, company_id, company:companies(company_name)),
      resolver:profiles!resolved_by(first_name, last_name),
      handler:profiles!handled_by_id(first_name, last_name)
    `)
    .eq('reporter_id', userId)
    .is('event_id', null)
    .in('status', ['handled', 'converted'])
    .order('resolved_at', { ascending: false })

  return {
    incidents: (incidents ?? []) as IncidentReport[],
    specialReports: [],
  }
}

export async function carryForwardEvent(eventId: string, nextSchoolYear: string) {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 90) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('carry_forward_event', {
    p_event_id: eventId,
    p_next_school_year: nextSchoolYear,
  })

  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/admin/year-close')
  return { success: true }
}

export async function getLinkableFilings() {
  const supabase = await createClient()
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) {
    return { incidents: [] as LinkableIncident[], specialReports: [] as LinkableSpecialReport[] }
  }

  const { data: incidents } = await supabase
    .from('incident_reports')
    .select(`
      id, description, status, created_at, event_id,
      subject:profiles!subject_cadet_id(first_name, last_name, company_id)
    `)
    .is('event_id', null)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: specialReports } = await supabase
    .from('special_reports')
    .select(`
      *,
      submitter:profiles!submitter_cadet_id(first_name, last_name, company_id),
      subject:profiles!subject_cadet_id(first_name, last_name)
    `)
    .is('event_id', null)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false })

  let incidentList = (incidents ?? []) as unknown as LinkableIncident[]
  let reportList = (specialReports ?? []) as LinkableSpecialReport[]

  if (viewer.roleLevel >= 65 && viewer.roleLevel < 90) {
    incidentList = incidentList.filter((i) => i.subject?.company_id === viewer.companyId)
    reportList = filterByCompany(reportList, viewer.companyId, viewer.roleLevel)
  }

  return { incidents: incidentList, specialReports: reportList }
}

export async function getPendingEventsCount() {
  const events = await getEvents('open')
  return events.length
}

export type IncidentPreviewContext = {
  incident: IncidentReport
  facultyList: { id: string; label: string }[]
  offenseTypes: { id: string; label: string; demerits: number; group: string }[]
}

export async function getIncidentPreviewContext(
  incidentId: string
): Promise<IncidentPreviewContext | null> {
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return null

  const incident = await getIncident(incidentId)
  if (!incident) return null

  let facultyList: { id: string; label: string }[] = []
  let offenseTypes: IncidentPreviewContext['offenseTypes'] = []

  if (incident.status === 'pending') {
    facultyList = await getFacultyList()

    const supabase = await createClient()
    const { data: offenses } = await supabase
      .from('offense_types')
      .select('id, offense_name, demerits, offense_group, policy_category')
      .order('offense_group')

    const { categories: allowedCategories } = await getAllowedPolicyCategories(viewer.roleLevel)
    offenseTypes = filterOffensesByPolicy(offenses ?? [], allowedCategories).map((o) => ({
      id: o.id,
      label: o.offense_name,
      demerits: o.demerits,
      group: o.offense_group,
    }))
  }

  return { incident, facultyList, offenseTypes }
}

export type EventResolutionOffense = {
  id: string
  label: string
  demerits: number
  group: string
  offense_code?: string
  policy_category: number
}

export async function getEventResolutionOffenses(
  roleLevel: number
): Promise<EventResolutionOffense[]> {
  const supabase = await createClient()
  const { data: offenses } = await supabase
    .from('offense_types')
    .select('id, offense_name, demerits, offense_group, offense_code, policy_category')
    .order('offense_group')

  const { categories: allowedCategories } = await getAllowedPolicyCategories(roleLevel)
  return filterOffensesByPolicy(offenses ?? [], allowedCategories).map((o) => ({
    id: o.id,
    label: o.offense_name,
    demerits: o.demerits,
    group: o.offense_group,
    offense_code: o.offense_code,
    policy_category: o.policy_category,
  }))
}

export type EventDemeritAssignment = {
  cadet_id: string
  offense_type_id: string
  notes: string
  explanation?: string
}

export async function resolveEventWithDemerits(
  eventId: string,
  assignments: EventDemeritAssignment[],
  dateOfOffense: string,
  closeNotes?: string
) {
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('resolve_event_with_demerits', {
    p_event_id: eventId,
    p_assignments: assignments,
    p_date_of_offense: dateOfOffense,
    p_close_notes: closeNotes ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/')
  revalidatePath('/reports/pending')
  return { success: true, reportIds: (data ?? []) as string[] }
}

export async function resolveEventHandled(
  eventId: string,
  summary: string,
  closeNotes?: string
) {
  const viewer = await getViewerContext()
  if (!viewer || viewer.roleLevel < 65) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('resolve_event_handled', {
    p_event_id: eventId,
    p_summary: summary,
    p_close_notes: closeNotes ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/')
  return { success: true }
}
