'use server'

import { createClient } from '@/utils/supabase/server'
export type {
  CadetPeriodStats,
  AcademicTermRow,
  PeriodSelection,
  LedgerAuditEvent,
  ConductReportRow,
  AcademicHistoryRow,
} from '@/app/lib/period-types'

import type {
  CadetPeriodStats,
  AcademicTermRow,
  LedgerAuditEvent,
  ConductReportRow,
  AcademicHistoryRow,
} from '@/app/lib/period-types'

import {
  filterConfiguredYears,
  selectableTerms,
  selectableYears,
} from '@/app/lib/period-utils'

export async function listCadetHistoricalYears(cadetId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_cadet_historical_years', { p_cadet_id: cadetId })
  if (error) throw new Error(error.message)
  const years = (data as { school_year: string }[] | null)?.map((r) => r.school_year) ?? []
  return filterConfiguredYears(years)
}

export async function getAcademicTermsForYears(schoolYears: string[]): Promise<AcademicTermRow[]> {
  const years = filterConfiguredYears(schoolYears)
  if (years.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('academic_terms')
    .select('id, term_name, school_year, term_number, start_date, end_date, archived')
    .in('school_year', years)
    .order('start_date', { ascending: false })
  if (error) throw new Error(error.message)
  return selectableTerms((data ?? []) as AcademicTermRow[])
}

export async function getCadetPeriodStats(
  cadetId: string,
  schoolYear: string | null,
  termNumber: number | null
): Promise<CadetPeriodStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('get_cadet_period_stats', {
      p_cadet_id: cadetId,
      p_school_year: schoolYear,
      p_term_number: termNumber,
    })
    .single()
  if (error) {
    if (error.message.includes('not found')) return null
    throw new Error(error.message)
  }
  return data as CadetPeriodStats
}

export async function getCadetLedgerForPeriod(
  cadetId: string,
  startIso: string,
  endIso: string
): Promise<LedgerAuditEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_cadet_ledger_for_period', {
    p_cadet_id: cadetId,
    p_start: startIso,
    p_end: endIso,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as LedgerAuditEvent[]
}

export async function getCadetAcademicHistory(
  cadetId: string,
  schoolYear?: string | null,
  termNumber?: number | null
): Promise<AcademicHistoryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_cadet_academic_history', {
    p_cadet_id: cadetId,
    p_school_year: schoolYear ?? null,
    p_term_number: termNumber ?? null,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as AcademicHistoryRow[]
}

export async function listCadetsByConduct(
  schoolYear: string,
  termNumber: number,
  conductLevel: string,
  includeArchived = false
): Promise<ConductReportRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_cadets_by_conduct', {
    p_school_year: schoolYear,
    p_term_number: termNumber,
    p_conduct_level: conductLevel,
    p_company_id: null,
    p_include_archived: includeArchived,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as ConductReportRow[]
}

export type RosterPeriodRow = {
  id: string
  first_name: string
  last_name: string
  cadet_rank: string | null
  company_name: string | null
  role_name: string | null
  grade_level: string | null
  room_number: string | null
  term_demerits: number
  year_demerits: number
  current_tour_balance: number
  has_star_tours: boolean
  conduct_status: string
  recent_reports: unknown
  archived: boolean
  graduated_at: string | null
  departure_classification: string | null
  archived_as_of_period: boolean
}

export async function getRosterForPeriod(
  schoolYear: string | null,
  termNumber: number | null,
  includeArchived: boolean
): Promise<RosterPeriodRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_roster_for_period', {
    p_school_year: schoolYear,
    p_term_number: termNumber,
    p_include_archived: includeArchived,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as RosterPeriodRow[]
}
