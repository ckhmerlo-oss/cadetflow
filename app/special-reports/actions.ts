'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { mapReportSubjects } from './lib/subjects'

export type SpecialReportStatus = 'submitted' | 'reviewed' | 'closed'
export type InvolvementType = 'witness' | 'participant' | 'other'

export type SpecialReport = {
  id: string
  submitter_cadet_id: string
  subject_cadet_id: string | null
  narrative: string
  location: string
  occurred_at: string
  involvement_type: InvolvementType
  status: SpecialReportStatus
  event_id: string | null
  school_year: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  flagged_for_review: boolean
  flagged_by: string | null
  flagged_at: string | null
  created_at: string
  updated_at: string
  submitter?: { first_name: string; last_name: string; company_id?: string | null }
  subject?: { first_name: string; last_name: string; company_id?: string | null }
  subjects?: { id: string; first_name: string; last_name: string }[]
  event?: { id: string; title: string; status: string } | null
  reviewer?: { first_name: string; last_name: string }
}

const SUBJECTS_SELECT = `
  subjects:special_report_subjects(
    cadet:profiles!cadet_id(id, first_name, last_name)
  )
`

const REPORT_SELECT = `
  *,
  submitter:profiles!submitter_cadet_id(first_name, last_name, company_id),
  subject:profiles!subject_cadet_id(first_name, last_name),
  reviewer:profiles!reviewed_by(first_name, last_name),
  event:events(id, title, status),
  ${SUBJECTS_SELECT}
`

type SubmitPayload = {
  narrative: string
  location: string
  occurred_at: string
  involvement_type: InvolvementType
  subject_cadet_id?: string | null
  subject_cadet_ids?: string[]
}

export async function submitSpecialReport(payload: SubmitPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.rpc('submit_special_report', {
    p_narrative: payload.narrative,
    p_location: payload.location,
    p_occurred_at: payload.occurred_at,
    p_involvement_type: payload.involvement_type,
    p_subject_cadet_id: payload.subject_cadet_id ?? null,
    p_subject_cadet_ids:
      payload.subject_cadet_ids && payload.subject_cadet_ids.length > 0
        ? payload.subject_cadet_ids
        : null,
  })

  if (error) return { error: error.message }

  revalidatePath('/submit')
  revalidatePath('/special-reports')
  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/')
  return { success: true, id: data as string }
}

export async function getMySpecialReports() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('special_reports')
    .select(`
      *,
      subject:profiles!subject_cadet_id(first_name, last_name),
      event:events(id, title, status),
      ${SUBJECTS_SELECT}
    `)
    .eq('submitter_cadet_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching special reports:', error.message)
    return []
  }

  return (data ?? []).map(
    (row) => mapReportSubjects(row as Parameters<typeof mapReportSubjects>[0]) as SpecialReport
  )
}

export async function getSpecialReportsForReview(filter: 'pending' | 'all' = 'pending') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: viewer } = await supabase
    .from('profiles')
    .select('company_id, role:roles!inner(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (viewer?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (roleLevel < 65) return []

  let query = supabase
    .from('special_reports')
    .select(REPORT_SELECT)
    .order('flagged_for_review', { ascending: false })
    .order('created_at', { ascending: false })

  if (filter === 'pending') {
    query = query.eq('status', 'submitted')
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching special reports for review:', error.message)
    return []
  }

  let result = (data ?? []).map(
    (row) => mapReportSubjects(row as Parameters<typeof mapReportSubjects>[0]) as SpecialReport
  )

  if (roleLevel >= 65 && roleLevel < 90) {
    const viewerCompanyId = viewer?.company_id
    result = result.filter(
      (r) => (r.submitter as { company_id?: string | null } | undefined)?.company_id === viewerCompanyId
    )
  }

  return result
}

export async function getSpecialReport(id: string): Promise<SpecialReport | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: viewer } = await supabase
    .from('profiles')
    .select('company_id, role:roles!inner(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (viewer?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (roleLevel < 65) return null

  const { data, error } = await supabase
    .from('special_reports')
    .select(REPORT_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const report = mapReportSubjects(
    data as Parameters<typeof mapReportSubjects>[0]
  ) as SpecialReport
  if (roleLevel >= 65 && roleLevel < 90) {
    const viewerCompanyId = viewer?.company_id
    if ((report.submitter as { company_id?: string | null } | undefined)?.company_id !== viewerCompanyId) {
      return null
    }
  }

  return report
}

export async function getUnlinkedSpecialReports() {
  const reports = await getSpecialReportsForReview('pending')
  return reports.filter((r) => !r.event_id)
}

export async function toggleSpecialReportFlag(reportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.rpc('toggle_special_report_flag', {
    p_report_id: reportId,
  })

  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/')
  return { success: true, flagged: data as boolean }
}

function revalidateSpecialReportPaths() {
  revalidatePath('/events')
  revalidatePath('/incidents')
  revalidatePath('/special-reports')
  revalidatePath('/')
}

export async function markSpecialReportReviewed(reportId: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('mark_special_report_reviewed', {
    p_report_id: reportId,
    p_notes: notes ?? null,
  })

  if (error) return { error: error.message }

  revalidateSpecialReportPaths()
  return { success: true }
}

export async function unmarkSpecialReportReviewed(reportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('unmark_special_report_reviewed', {
    p_report_id: reportId,
  })

  if (error) return { error: error.message }

  revalidateSpecialReportPaths()
  return { success: true }
}

export async function closeSpecialReport(reportId: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.rpc('close_special_report', {
    p_report_id: reportId,
    p_notes: notes ?? null,
  })

  if (error) return { error: error.message }

  revalidateSpecialReportPaths()
  return { success: true }
}
