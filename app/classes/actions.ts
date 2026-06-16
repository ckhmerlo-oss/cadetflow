'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ClassSection, ClassSectionDetail, ScheduleSlotOption } from './types'

export async function getTeacherClasses(): Promise<ClassSection[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_teacher_classes')
  if (error) {
    console.error('get_teacher_classes:', error.message)
    return []
  }
  return (data ?? []) as ClassSection[]
}

export async function getClassSectionDetail(sectionId: string): Promise<ClassSectionDetail | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_class_section_detail', { p_section_id: sectionId })
  if (error || !data?.length) return null

  const rows = data as Array<{
    section_id: string
    course_name: string
    term_number: number | null
    seminar_period: string | null
    teacher_id: string
    cadet_id: string | null
    cadet_first_name: string | null
    cadet_last_name: string | null
    company_name: string | null
  }>

  const first = rows[0]
  return {
    section_id: first.section_id,
    course_name: first.course_name,
    term_number: first.term_number,
    seminar_period: first.seminar_period,
    teacher_id: first.teacher_id,
    roster: rows
      .filter((r) => r.cadet_id)
      .map((r) => ({
        cadet_id: r.cadet_id!,
        first_name: r.cadet_first_name ?? '',
        last_name: r.cadet_last_name ?? '',
        company_name: r.company_name,
      })),
  }
}

export async function createClassSection(
  courseName: string,
  termNumber?: number | null,
  seminarPeriod?: 'a' | 'b' | null
) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('upsert_teacher_class_section', {
    p_section_id: null,
    p_course_name: courseName,
    p_term_number: termNumber ?? null,
    p_seminar_period: seminarPeriod ?? null,
  })
  if (error) return { error: error.message }
  revalidatePath('/classes')
  return { sectionId: data as string }
}

export async function updateClassSectionName(sectionId: string, courseName: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('upsert_teacher_class_section', {
    p_section_id: sectionId,
    p_course_name: courseName,
    p_term_number: null,
    p_seminar_period: null,
  })
  if (error) return { error: error.message }
  revalidatePath('/classes')
  revalidatePath(`/classes/${sectionId}`)
  return { success: true }
}

export async function addCadetToSection(sectionId: string, cadetId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('add_cadet_to_class_section', {
    p_section_id: sectionId,
    p_cadet_id: cadetId,
  })
  if (error) return { error: error.message }
  revalidatePath('/classes')
  revalidatePath(`/classes/${sectionId}`)
  revalidatePath(`/profile/${cadetId}`)
  return { success: true }
}

export async function removeCadetFromSection(sectionId: string, cadetId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('remove_cadet_from_class_section', {
    p_section_id: sectionId,
    p_cadet_id: cadetId,
  })
  if (error) return { error: error.message }
  revalidatePath('/classes')
  revalidatePath(`/classes/${sectionId}`)
  revalidatePath(`/profile/${cadetId}`)
  return { success: true }
}

export async function searchCadetsForClass(query: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role:roles!inner(default_role_level)')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .lt('role.default_role_level', 50)
    .eq('archived', false)
    .limit(20)

  return (data ?? []).map((p: { id: string; first_name: string; last_name: string }) => ({
    id: p.id,
    label: `${p.last_name}, ${p.first_name}`,
  }))
}

export async function getAvailableSectionsForSlot(slotType: string): Promise<ScheduleSlotOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_available_sections_for_slot', {
    p_slot_type: slotType,
  })
  if (error) return []
  return (data ?? []) as ScheduleSlotOption[]
}

export async function setCadetScheduleSlot(cadetId: string, slotType: string, sectionId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('set_cadet_schedule_slot', {
    p_cadet_id: cadetId,
    p_slot_type: slotType,
    p_section_id: sectionId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  revalidatePath('/oversight')
  return { success: true }
}

export async function clearCadetScheduleSlot(cadetId: string, slotType: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('clear_cadet_schedule_slot', {
    p_cadet_id: cadetId,
    p_slot_type: slotType,
  })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  revalidatePath('/oversight')
  return { success: true }
}

export async function getCadetSchedule(cadetId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_cadet_schedule', { p_cadet_id: cadetId })
  if (error) return []
  return data ?? []
}
