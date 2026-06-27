import type { AcademicTermRow, PeriodSelection } from '@/app/lib/period-types'

/** School years used in local seed / production config (excludes pgTAP fixture years). */
export function isConfiguredSchoolYear(schoolYear: string): boolean {
  const match = schoolYear.match(/^(\d{4})-(\d{4})$/)
  if (!match) return false
  const start = Number(match[1])
  const end = Number(match[2])
  return end === start + 1 && start >= 2024 && start <= 2027
}

export function filterConfiguredTerms(terms: AcademicTermRow[]): AcademicTermRow[] {
  return terms.filter((t) => isConfiguredSchoolYear(t.school_year))
}

export function filterConfiguredYears(years: string[]): string[] {
  return years.filter(isConfiguredSchoolYear)
}

function todayDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** Terms whose start_date is on or before today. */
export function filterStartedTerms(terms: AcademicTermRow[], now = new Date()): AcademicTermRow[] {
  const today = todayDateString(now)
  return terms.filter((t) => t.start_date <= today)
}

/** Distinct school years that have at least one started term, newest first. */
export function startedSchoolYears(terms: AcademicTermRow[]): string[] {
  const years = [...new Set(filterStartedTerms(terms).map((t) => t.school_year))]
  return years.sort().reverse()
}

/** Terms usable in period selectors (configured + started). */
export function selectableTerms(terms: AcademicTermRow[], now = new Date()): AcademicTermRow[] {
  return filterStartedTerms(filterConfiguredTerms(terms), now)
}

/** Years usable in period selectors (configured + started). */
export function selectableYears(terms: AcademicTermRow[], years?: string[], now = new Date()): string[] {
  const started = startedSchoolYears(filterConfiguredTerms(terms))
  if (!years) return started
  const configured = filterConfiguredYears(years).filter((y) => started.includes(y))
  return configured.length > 0 ? configured : started
}

export function periodBoundsFromTerms(
  terms: AcademicTermRow[],
  selection: PeriodSelection
): { start: string; end: string } | null {
  const yearTerms = terms.filter((t) => t.school_year === selection.schoolYear)
  if (yearTerms.length === 0) return null

  if (selection.termNumber != null) {
    const term = yearTerms.find((t) => t.term_number === selection.termNumber)
    if (!term) return null
    return {
      start: `${term.start_date}T00:00:00.000Z`,
      end: `${term.end_date}T23:59:59.999Z`,
    }
  }

  const starts = yearTerms.map((t) => t.start_date).sort()
  const ends = yearTerms.map((t) => t.end_date).sort()
  return {
    start: `${starts[0]}T00:00:00.000Z`,
    end: `${ends[ends.length - 1]}T23:59:59.999Z`,
  }
}

export function buildDefaultPeriodSelection(
  years: string[],
  terms: AcademicTermRow[]
): PeriodSelection | null {
  const configuredTerms = selectableTerms(terms)
  const configuredYears = selectableYears(terms, years).filter((y) =>
    configuredTerms.some((t) => t.school_year === y)
  )

  if (configuredTerms.length === 0) return null

  const now = new Date()
  const currentTerm = configuredTerms.find(
    (t) => !t.archived && new Date(t.start_date) <= now && new Date(t.end_date) >= now
  )
  if (currentTerm?.school_year) {
    return {
      schoolYear: currentTerm.school_year,
      termNumber: currentTerm.term_number,
    }
  }

  const fallbackYear = configuredYears[0] ?? configuredTerms[0]?.school_year
  if (!fallbackYear) return null

  const firstTerm = configuredTerms
    .filter((t) => t.school_year === fallbackYear && t.term_number != null)
    .sort((a, b) => (a.term_number ?? 0) - (b.term_number ?? 0))[0]

  return {
    schoolYear: fallbackYear,
    termNumber: firstTerm?.term_number ?? null,
  }
}

export function isHistoricalPeriod(
  selection: PeriodSelection,
  terms: AcademicTermRow[]
): boolean {
  const configuredTerms = selectableTerms(terms)
  const now = new Date()
  const currentTerm = configuredTerms.find(
    (t) => !t.archived && new Date(t.start_date) <= now && new Date(t.end_date) >= now
  )
  if (!currentTerm) return true
  if (selection.schoolYear !== currentTerm.school_year) return true
  if (selection.termNumber == null) return false
  return selection.termNumber !== currentTerm.term_number
}

export const CONDUCT_LEVELS = [
  'Exemplary',
  'Commendable',
  'Satisfactory',
  'Deficient',
  'Unsatisfactory',
] as const
