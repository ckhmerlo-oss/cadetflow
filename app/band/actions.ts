'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type BandMember = {
  id: string
  first_name: string
  last_name: string
  cadet_rank: string | null
  grade_level: string | null
  room_number: string | null
  cached_tour_balance: number
  company: { company_name: string } | null
  parent_email: string | null
  phone_number: string | null
  band_details: {
    instrument: string | null
    leadership_role: string | null
    travel_notes: string | null
  } | null
}

export async function getBandRoster() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      company:companies(company_name),
      role:roles!inner(default_role_level),
      cadet_profiles!inner (
        cadet_rank,
        grade_level,
        room_number,
        cached_tour_balance,
        is_in_band,
        parent_email,
        phone_number,
        band_details(instrument, leadership_role, travel_notes)
      )
    `)
    .eq('cadet_profiles.is_in_band', true)
    .eq('archived', false)
    .lt('role.default_role_level', 50)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching band roster:', error.message, error.details, error.hint, error.code)
    return []
  }

  return data.map((m: any) => {
    const details = Array.isArray(m.cadet_profiles) ? m.cadet_profiles[0] : m.cadet_profiles
    const bandDetailsRaw = details?.band_details
    const bandDetails = Array.isArray(bandDetailsRaw)
      ? (bandDetailsRaw[0] || null)
      : (bandDetailsRaw || null)
    return {
      id: m.id,
      first_name: m.first_name,
      last_name: m.last_name,
      cadet_rank: details?.cadet_rank ?? null,
      grade_level: details?.grade_level ?? null,
      room_number: details?.room_number ?? null,
      cached_tour_balance: details?.cached_tour_balance ?? 0,
      parent_email: details?.parent_email ?? null,
      phone_number: details?.phone_number ?? null,
      company: Array.isArray(m.company) ? m.company[0] : m.company,
      band_details: bandDetails,
    }
  }) as BandMember[]
}

export async function updateBandDetails(cadetId: string, details: { instrument: string, leadership_role: string, travel_notes: string }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('band_details')
    .upsert({
      cadet_id: cadetId,
      instrument: details.instrument,
      leadership_role: details.leadership_role,
      travel_notes: details.travel_notes
    }, { onConflict: 'cadet_id' })

  if (error) return { success: false, error: error.message }
  revalidatePath('/band')
  return { success: true }
}

export async function searchCadetCandidates(query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name,
      company:companies(company_name),
      role:roles!inner(default_role_level),
      cadet_profiles!inner (cadet_rank, is_in_band)
    `)
    .eq('cadet_profiles.is_in_band', false)
    .eq('archived', false)
    .lt('role.default_role_level', 50)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)

  if (error) return []

  return data.map((p: any) => {
    const details = Array.isArray(p.cadet_profiles) ? p.cadet_profiles[0] : p.cadet_profiles
    return {
      id: p.id,
      name: `${p.last_name}, ${p.first_name}`,
      rank: details?.cadet_rank,
      company: Array.isArray(p.company) ? p.company[0]?.company_name : p.company?.company_name
    }
  })
}

export async function setBandMembership(cadetId: string, isInBand: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cadet_profiles')
    .update({ is_in_band: isInBand })
    .eq('profile_id', cadetId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/band')
  return { success: true }
}
