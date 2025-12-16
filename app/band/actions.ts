'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// UPDATED TYPE DEFINITION
export type BandMember = {
  id: string
  first_name: string
  last_name: string
  cadet_rank: string | null
  grade_level: string | null
  room_number: string | null // <-- Added
  cached_tour_balance: number // <-- Added
  company: { company_name: string } | null
  email: string
  // New Relation
  band_details: {
    instrument: string | null
    leadership_role: string | null
    travel_notes: string | null
  } | null
}

export async function getBandRoster() {
  const supabase = createClient()
  
  // Updated Query to fetch band_details and room/tours
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
      band_details(instrument, leadership_role, travel_notes)
    `)
    .eq('is_in_band', true)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching band roster:', error)
    return []
  }

  // Map to ensure clean types (Supabase returns arrays for 1:1 sometimes)
  return data.map((m: any) => ({
    ...m,
    company: Array.isArray(m.company) ? m.company[0] : m.company,
    // Handle the 1:1 relation returning as an array or object
    band_details: Array.isArray(m.band_details) 
      ? (m.band_details[0] || null) 
      : (m.band_details || null)
  })) as BandMember[]
}

// NEW ACTION: Update Band Details
export async function updateBandDetails(cadetId: string, details: { instrument: string, leadership_role: string, travel_notes: string }) {
  const supabase = createClient()
  
  // We use UPSERT to handle both Insert (first time) and Update
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