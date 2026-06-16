export type OversightEntry = {
  assignment_id: string
  assignment_type: string
  source: string
  staff_id: string
  staff_first_name: string
  staff_last_name: string
  course_name: string | null
  is_self: boolean
}

export type OversightCadet = {
  cadet_id: string
  first_name: string
  last_name: string
  company_name: string | null
  assignment_types: string[]
}
