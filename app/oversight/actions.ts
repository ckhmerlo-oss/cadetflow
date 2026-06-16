'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function archiveSchoolYear(schoolYear: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('archive_school_year', { p_school_year: schoolYear })
  if (error) return { error: error.message }
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
