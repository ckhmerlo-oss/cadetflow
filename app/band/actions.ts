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
  email: string
  band_details: {
    instrument: string | null
    leadership_role: string | null
    travel_notes: string | null
  } | null
}

export async function getBandRoster() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, 
      first_name, 
      last_name, 
      cadet_rank, 
      grade_level,
      room_number,
      cached_tour_balance,
      email,
      company:companies(company_name),
      band_details(instrument, leadership_role, travel_notes),
      role:roles!inner(default_role_level)
    `)
    .eq('is_in_band', true)
    .lt('role.default_role_level', 50) // <--- FILTER: Only Role Level < 50 (Cadets)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching band roster:', error)
    return []
  }

  // Map to ensure clean types
  return data.map((m: any) => ({
    ...m,
    company: Array.isArray(m.company) ? m.company[0] : m.company,
    band_details: Array.isArray(m.band_details) 
      ? (m.band_details[0] || null) 
      : (m.band_details || null)
  })) as BandMember[]
}

export async function updateBandDetails(cadetId: string, details: { instrument: string, leadership_role: string, travel_notes: string }) {
  const supabase = createClient()
  
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