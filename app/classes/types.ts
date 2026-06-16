export type ClassSection = {
  section_id: string
  course_name: string
  term_number: number | null
  seminar_period: string | null
  school_year: string
  roster_count: number
}

export type ClassSectionDetail = {
  section_id: string
  course_name: string
  term_number: number | null
  seminar_period: string | null
  teacher_id: string
  roster: {
    cadet_id: string
    first_name: string
    last_name: string
    company_name: string | null
  }[]
}

export type ScheduleSlotOption = {
  section_id: string
  course_name: string
  teacher_first_name: string
  teacher_last_name: string
}
