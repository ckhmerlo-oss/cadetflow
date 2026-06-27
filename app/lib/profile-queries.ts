import type { SupabaseClient } from '@supabase/supabase-js'

export const CADET_PROFILE_SELECT = `
  id,
  first_name,
  last_name,
  role_id,
  company_id,
  is_site_admin,
  archived,
  has_seen_tour,
  company:companies(id, company_name),
  role:roles(id, role_name, default_role_level, can_manage_all_rosters, can_manage_own_company_roster),
  cadet_profiles!inner (
    profile_id,
    cadet_rank,
    grade_level,
    room_number,
    years_attended,
    probation_status,
    probation_notes,
    sport_fall,
    sport_winter,
    sport_spring,
    is_in_band,
    extracurriculars,
    has_star_tours,
    cached_tour_balance,
    total_demerits,
    conduct_status,
    parent_name,
    parent_email,
    parent_phone,
    phone_number,
    graduated_at,
    departure_classification
  )
`

export const STAFF_PROFILE_SELECT = `
  id,
  first_name,
  last_name,
  role_id,
  company_id,
  is_site_admin,
  archived,
  has_seen_tour,
  company:companies(id, company_name),
  role:roles(id, role_name, default_role_level, can_manage_all_rosters, can_manage_own_company_roster),
  staff_profiles!inner (
    profile_id,
    staff_title,
    department,
    office_location,
    work_phone,
    internal_notes
  )
`

export const IDENTITY_PROFILE_SELECT = `
  id,
  first_name,
  last_name,
  role_id,
  company_id,
  is_site_admin,
  archived,
  has_seen_tour,
  role:roles(id, role_name, default_role_level, can_manage_all_rosters, can_manage_own_company_roster),
  company:companies(id, company_name),
  cadet_profiles (
    is_in_band,
    cached_tour_balance
  )
`

export type CadetProfileRow = {
  id: string
  first_name: string
  last_name: string
  role_id: string | null
  company_id: string | null
  is_site_admin: boolean
  archived: boolean
  has_seen_tour: boolean
  company?: { id: string; company_name: string } | { id: string; company_name: string }[] | null
  role?: {
    id: string
    role_name: string
    default_role_level: number
    can_manage_all_rosters?: boolean
    can_manage_own_company_roster?: boolean
  } | null
  cadet_profiles: CadetDetails | CadetDetails[] | null
}

export type CadetDetails = {
  profile_id: string
  cadet_rank: string | null
  grade_level: string | null
  room_number: string | null
  years_attended: number
  probation_status: string | null
  probation_notes: string | null
  sport_fall: string | null
  sport_winter: string | null
  sport_spring: string | null
  is_in_band: boolean
  extracurriculars: string[] | null
  has_star_tours: boolean
  cached_tour_balance: number
  total_demerits: number
  conduct_status: string | null
  parent_name: string | null
  parent_email: string | null
  parent_phone: string | null
  phone_number: string | null
  graduated_at: string | null
  departure_classification: string | null
}

export type StaffProfileRow = {
  id: string
  first_name: string
  last_name: string
  role_id: string | null
  company_id: string | null
  is_site_admin: boolean
  archived: boolean
  has_seen_tour: boolean
  company?: { id: string; company_name: string } | { id: string; company_name: string }[] | null
  role?: {
    id: string
    role_name: string
    default_role_level: number
    can_manage_all_rosters?: boolean
    can_manage_own_company_roster?: boolean
  } | null
  staff_profiles: StaffDetails | StaffDetails[] | null
}

export type StaffDetails = {
  profile_id: string
  staff_title: string | null
  department: string | null
  office_location: string | null
  work_phone: string | null
  internal_notes: string | null
}

export type FlatCadetProfile = {
  id: string
  first_name: string
  last_name: string
  role_id: string | null
  company_id: string | null
  is_site_admin: boolean
  archived: boolean
  has_seen_tour: boolean
  company?: { id: string; company_name: string } | null
  role?: CadetProfileRow['role']
  cadet_rank: string | null
  grade_level: string | null
  room_number: string | null
  years_attended: number
  probation_status: string | null
  probation_notes: string | null
  sport_fall: string | null
  sport_winter: string | null
  sport_spring: string | null
  is_in_band: boolean
  extracurriculars: string[] | null
  has_star_tours: boolean
  cached_tour_balance: number
  total_demerits: number
  conduct_status: string | null
  parent_name: string | null
  parent_email: string | null
  parent_phone: string | null
  phone_number: string | null
  graduated_at: string | null
  departure_classification: string | null
}

export type FlatStaffProfile = {
  id: string
  first_name: string
  last_name: string
  role_id: string | null
  company_id: string | null
  is_site_admin: boolean
  archived: boolean
  has_seen_tour: boolean
  company?: { id: string; company_name: string } | null
  role?: StaffProfileRow['role']
  staff_title: string | null
  department: string | null
  office_location: string | null
  work_phone: string | null
  internal_notes: string | null
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export function flattenCadetProfile(row: CadetProfileRow): FlatCadetProfile {
  const details = unwrapOne(row.cadet_profiles)
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    role_id: row.role_id,
    company_id: row.company_id,
    is_site_admin: row.is_site_admin,
    archived: row.archived,
    has_seen_tour: row.has_seen_tour,
    company: unwrapOne(row.company),
    role: unwrapOne(row.role),
    cadet_rank: details?.cadet_rank ?? null,
    grade_level: details?.grade_level ?? null,
    room_number: details?.room_number ?? null,
    years_attended: details?.years_attended ?? 0,
    probation_status: details?.probation_status ?? null,
    probation_notes: details?.probation_notes ?? null,
    sport_fall: details?.sport_fall ?? null,
    sport_winter: details?.sport_winter ?? null,
    sport_spring: details?.sport_spring ?? null,
    is_in_band: details?.is_in_band ?? false,
    extracurriculars: details?.extracurriculars ?? [],
    has_star_tours: details?.has_star_tours ?? false,
    cached_tour_balance: details?.cached_tour_balance ?? 0,
    total_demerits: details?.total_demerits ?? 0,
    conduct_status: details?.conduct_status ?? null,
    parent_name: details?.parent_name ?? null,
    parent_email: details?.parent_email ?? null,
    parent_phone: details?.parent_phone ?? null,
    phone_number: details?.phone_number ?? null,
    graduated_at: details?.graduated_at ?? null,
    departure_classification: details?.departure_classification ?? null,
  }
}

export function flattenStaffProfile(row: StaffProfileRow): FlatStaffProfile {
  const details = unwrapOne(row.staff_profiles)
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    role_id: row.role_id,
    company_id: row.company_id,
    is_site_admin: row.is_site_admin,
    archived: row.archived,
    has_seen_tour: row.has_seen_tour,
    company: unwrapOne(row.company),
    role: unwrapOne(row.role),
    staff_title: details?.staff_title ?? null,
    department: details?.department ?? null,
    office_location: details?.office_location ?? null,
    work_phone: details?.work_phone ?? null,
    internal_notes: details?.internal_notes ?? null,
  }
}

export function isStaffRoleLevel(level: number | null | undefined): boolean {
  return (level ?? 0) >= 50
}

export async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data: base, error: baseError } = await supabase
    .from('profiles')
    .select('id, archived, role:roles(default_role_level)')
    .eq('id', id)
    .single()

  if (baseError || !base) return { data: null, error: baseError }

  const isArchived = (base as { archived?: boolean }).archived === true
  if (isArchived) {
    const { data: canView } = await supabase.rpc('can_view_archived_cadet', { p_cadet_id: id })
    if (!canView) return { data: null, error: { message: 'Not found' } as any, kind: 'cadet' as const }
  } else {
    // Active profiles only in default path — archived handled above
  }

  const roleLevel = unwrapOne((base as any).role)?.default_role_level ?? 0

  if (isStaffRoleLevel(roleLevel)) {
    const q = supabase.from('profiles').select(STAFF_PROFILE_SELECT).eq('id', id)
    if (!isArchived) q.eq('archived', false)
    const { data, error } = await q.single()
    return { data: data ? flattenStaffProfile(data as unknown as StaffProfileRow) : null, error, kind: 'staff' as const }
  }

  const q = supabase.from('profiles').select(CADET_PROFILE_SELECT).eq('id', id)
  if (!isArchived) q.eq('archived', false)
  const { data, error } = await q.single()

  return { data: data ? flattenCadetProfile(data as unknown as CadetProfileRow) : null, error, kind: 'cadet' as const }
}

export async function updateCadetDetails(
  supabase: SupabaseClient,
  profileId: string,
  patch: Partial<Omit<CadetDetails, 'profile_id'>>
) {
  return supabase
    .from('cadet_profiles')
    .update(patch)
    .eq('profile_id', profileId)
}

export async function updateStaffDetails(
  supabase: SupabaseClient,
  profileId: string,
  patch: Partial<Omit<StaffDetails, 'profile_id'>>
) {
  return supabase
    .from('staff_profiles')
    .update(patch)
    .eq('profile_id', profileId)
}

export async function ensureCadetDetailsRow(supabase: SupabaseClient, profileId: string) {
  return supabase
    .from('cadet_profiles')
    .upsert({ profile_id: profileId }, { onConflict: 'profile_id' })
}
