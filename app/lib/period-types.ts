export type CadetPeriodStats = {
  school_year: string
  term_number: number | null
  term_demerits: number
  year_demerits: number
  conduct_status: string
  total_tours_marched: number
  current_tour_balance: number | null
  is_current_period: boolean
}

export type AcademicTermRow = {
  id: string
  term_name: string
  school_year: string
  term_number: number | null
  start_date: string
  end_date: string
  archived: boolean
}

export type PeriodSelection = {
  schoolYear: string
  termNumber: number | null
}

export type LedgerAuditEvent = {
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
  appeal_note: string | null
  date_of_offense: string | null
  policy_category?: number | null
}

export type ConductReportRow = {
  cadet_id: string
  first_name: string
  last_name: string
  company_name: string | null
  term_demerits: number
  year_demerits: number
  conduct_status: string
  archived: boolean
}

export type AcademicHistoryRow = {
  school_year: string
  term_number: number | null
  seminar_period: string | null
  course_name: string
  slot_type: string
  teacher_name: string | null
}
