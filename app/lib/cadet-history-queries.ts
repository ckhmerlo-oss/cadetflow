'use server'

import { createClient } from '@/utils/supabase/server'
import type { PeriodSelection } from '@/app/lib/period-types'

export type CadetHistoryScope = {
  school_year: string | null
  term_number: number | null
  full_career: boolean
  term_start: string
  term_end: string
  label: string
}

export type CadetHistoryCadet = {
  id: string
  first_name: string
  last_name: string
  years_attended: number
  account_created_at: string | null
  archived: boolean
}

export type CadetHistoryArchiveInterval = {
  id: string
  started_at: string
  ended_at: string | null
  reason: string | null
  departure_classification: string | null
}

export type CadetHistoryRoleEvent = {
  role_name: string | null
  company_name: string | null
  school_year: string | null
  ended_at: string
  reason: string | null
}

export type CadetHistoryConductTerm = {
  school_year: string
  term_number: number
  term_name: string
  term_demerits: number
  year_demerits: number
  conduct_status: string
}

export type CadetHistoryDisciplineEvent = {
  event_date: string
  event_type: string
  title: string
  details: string | null
  demerits_issued: number
  tour_change: number | null
  actor_name: string
  status: string
  report_id: string | null
  appeal_status: string | null
  date_of_offense: string | null
}

export type CadetHistoryClassRow = {
  school_year: string
  term_number: number | null
  seminar_period: string | null
  course_name: string
  slot_type: string | null
  teacher_name: string | null
}

export type CadetHistoryActivities = {
  sport_fall: string | null
  sport_winter: string | null
  sport_spring: string | null
  extracurriculars: string[]
  is_in_band: boolean
}

export type CadetHistoryReport = {
  scope: CadetHistoryScope
  cadet: CadetHistoryCadet
  archived_as_of_period: boolean
  departure_classification_as_of: string | null
  archive_intervals: CadetHistoryArchiveInterval[]
  role_events: CadetHistoryRoleEvent[]
  conduct_by_term: CadetHistoryConductTerm[]
  discipline_events: CadetHistoryDisciplineEvent[]
  classes: CadetHistoryClassRow[]
  activities_current: CadetHistoryActivities | null
  generated_at: string
}

export async function canViewCadetHistory(cadetId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('can_view_cadet_history', { p_cadet_id: cadetId })
  if (error) return false
  return data === true
}

export async function getCadetHistoryReport(
  cadetId: string,
  period: PeriodSelection | null,
  fullCareer = false
): Promise<CadetHistoryReport> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_cadet_history_report', {
    p_cadet_id: cadetId,
    p_school_year: fullCareer ? null : period?.schoolYear ?? null,
    p_term_number: fullCareer ? null : period?.termNumber ?? null,
    p_full_career: fullCareer,
  })
  if (error) throw new Error(error.message)
  return data as CadetHistoryReport
}
