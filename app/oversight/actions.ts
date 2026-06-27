'use server'

import { formatRpcError, logRpcFailure } from '@/app/lib/rpcDiagnostics'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { drainEmailQueue } from '@/app/lib/server'
import type { OversightCadet, OversightEntry } from './types'

export async function getCadetOversight(cadetId: string): Promise<OversightEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_cadet_oversight', { p_cadet_id: cadetId })
  if (error) {
    console.error('get_cadet_oversight:', error.message)
    return []
  }
  return (data ?? []) as OversightEntry[]
}

export async function getMyOversightCadets(): Promise<OversightCadet[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_oversight_cadets')
  if (error) {
    console.error('get_my_oversight_cadets:', error.message)
    return []
  }
  return (data ?? []) as OversightCadet[]
}

export async function addManualFacultyAssignment(cadetId: string, staffId?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.rpc('add_manual_oversight', {
    p_cadet_id: cadetId,
    p_staff_id: staffId ?? user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  revalidatePath('/oversight')
  return { assignmentId: data as string }
}

export async function removeManualFacultyAssignment(assignmentId: string, cadetId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('remove_manual_oversight', { p_assignment_id: assignmentId })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  revalidatePath('/oversight')
  return { success: true }
}

export async function selfRemoveSecondaryAssignment(assignmentId: string, cadetId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('self_remove_secondary_assignment', {
    p_assignment_id: assignmentId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  revalidatePath('/oversight')
  return { success: true }
}

export async function setupSchoolYearTerms(
  schoolYear: string,
  terms: { name: string; start: string; end: string }[]
) {
  const supabase = createClient()
  const { error } = await supabase.rpc('setup_school_year_terms', {
    p_school_year: schoolYear,
    p_term_names: terms.map((t) => t.name),
    p_start_dates: terms.map((t) => t.start),
    p_end_dates: terms.map((t) => t.end),
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function getGraduationRoster() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_full_roster', { p_include_archived: false })
  if (error) return { error: error.message, data: [] as GraduationRosterCadet[] }
  const cadets = (data ?? []) as GraduationRosterCadet[]
  return { data: cadets, error: null }
}

export async function markCadetsGraduated(cadetIds: string[]) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('mark_cadets_graduated', {
    p_cadet_ids: cadetIds,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/year-close')
  revalidatePath('/manage')
  return { success: true, count: data as number }
}

export async function unmarkCadetsGraduated(cadetIds: string[]) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('unmark_cadets_graduated', {
    p_cadet_ids: cadetIds,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/year-close')
  revalidatePath('/manage')
  return { success: true, count: data as number }
}

export async function setupSchoolYearTermsForClose(
  schoolYear: string,
  terms: { name: string; start: string; end: string }[]
) {
  const result = await setupSchoolYearTerms(schoolYear, terms)
  if (!result.error) {
    revalidatePath('/admin/year-close')
    revalidatePath('/admin')
  }
  return result
}

export async function archiveSchoolYear(schoolYear: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('archive_school_year', { p_school_year: schoolYear })
  if (error) return { error: error.message }
  return { success: true }
}

export type YearClosePreflightItem = {
  id: string
  label: string
  href: string
  company_id?: string | null
}

export type YearClosePreflight = {
  school_year: string
  next_school_year: string | null
  next_year_terms_configured: boolean
  already_closed: boolean
  auto_handled: {
    open_demerit_reports: number
    open_appeals: number
    pending_incidents: number
    tour_sheet_cleared?: number
    probation_reset?: number
    rooms_cleared_at_execute?: number
  }
  manual: Record<string, number>
  informational: Record<string, number>
  items?: Record<string, YearClosePreflightItem[]>
}

export type YearCloseReminderRecipient = {
  user_id: string
  name: string
  role_name: string
  company_name: string | null
  auto_summary: YearClosePreflight['auto_handled']
  manual_items: (YearClosePreflightItem & { category?: string })[]
  informational?: Record<string, number>
  body_preview?: string
}

export type YearCloseReminderPreview = {
  school_year: string
  recipient_count: number
  recipients: YearCloseReminderRecipient[]
}

export type GraduationRosterCadet = {
  id: string
  first_name: string
  last_name: string
  company_name: string | null
  room_number: string | null
  grade_level: string | null
  graduated_at: string | null
}

export async function getYearClosePreflight(schoolYear: string, nextSchoolYear?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_year_close_preflight', {
    p_school_year: schoolYear,
    p_next_school_year: nextSchoolYear ?? null,
  })
  if (error) return { error: formatRpcError('get_year_close_preflight', error), data: null as YearClosePreflight | null }
  return { data: data as YearClosePreflight, error: null }
}

export async function getYearCloseReminderPreview(schoolYear: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_year_close_reminder_preview', {
    p_school_year: schoolYear,
  })
  if (error) return { error: formatRpcError('get_year_close_reminder_preview', error), data: null as YearCloseReminderPreview | null }
  return { data: data as YearCloseReminderPreview, error: null }
}

export async function sendYearCloseReminders(schoolYear: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('send_year_close_reminders', {
    p_school_year: schoolYear,
  })
  if (error) return { error: formatRpcError('send_year_close_reminders', error) }

  const summary = data as { recipients?: number; enqueued?: number; skipped?: number }
  const queueResult = await drainEmailQueue(10)

  return {
    success: true,
    recipients: summary?.recipients ?? 0,
    enqueued: summary?.enqueued ?? 0,
    skipped: summary?.skipped ?? 0,
    emailProcessed: queueResult.processed ?? 0,
    emailSent: queueResult.sent ?? 0,
    emailFailed: queueResult.failed ?? 0,
    emailError: queueResult.success ? undefined : queueResult.error,
  }
}

export async function setDepartureClassification(cadetId: string, classification: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('set_departure_classification', {
    p_cadet_id: cadetId,
    p_classification: classification,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/year-close')
  revalidatePath('/admin')
  revalidatePath(`/profile/${cadetId}`)
  return { success: true }
}

export async function closeSchoolYear(
  schoolYear: string,
  nextSchoolYear: string,
  force = false,
) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('close_school_year', {
    p_school_year: schoolYear,
    p_next_school_year: nextSchoolYear,
    p_force: force,
  })
  if (error) return { error: formatRpcError('close_school_year', error) }
  revalidatePath('/admin')
  revalidatePath('/admin/year-close')
  revalidatePath('/manage')
  return { success: true, counts: data }
}

export async function reactivateCadets(cadetIds: string[], companyId: string, roleId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('reactivate_cadets', {
    p_cadet_ids: cadetIds,
    p_company_id: companyId,
    p_role_id: roleId,
  })
  if (error) return { error: formatRpcError('reactivate_cadets', error) }
  const count = data as number
  if (count === 0) {
    return { error: 'No cadets were reactivated. Verify the cadet is archived and you have permission for their company.' }
  }
  revalidatePath('/admin')
  revalidatePath('/manage')
  return { success: true, count }
}

export type DepartureClassification = 'non_return' | 'withdrawn' | 'suspended' | 'dismissal'

export async function archiveCadetProfile(
  cadetId: string,
  departureClassification: DepartureClassification,
  reason = 'archived',
) {
  const supabase = createClient()
  const { error } = await supabase.rpc('archive_cadet_profile', {
    p_cadet_id: cadetId,
    p_reason: reason,
    p_departure_classification: departureClassification,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/manage')
  revalidatePath(`/profile/${cadetId}`)
  return { success: true }
}

export async function getSchoolYearTerms(schoolYear?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_school_year_terms', {
    p_school_year: schoolYear ?? null,
  })
  if (error) return []
  return data ?? []
}
