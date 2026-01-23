'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... (Keep existing types like BandMember) ...
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
  // ... (Keep existing implementation) ...
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
    .eq('archived', false)
    .lt('role.default_role_level', 50) 
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching band roster:', error)
    return []
  }

  return data.map((m: any) => ({
    ...m,
    company: Array.isArray(m.company) ? m.company[0] : m.company,
    band_details: Array.isArray(m.band_details) 
      ? (m.band_details[0] || null) 
      : (m.band_details || null)
  })) as BandMember[]
}

// ... (Keep updateBandDetails) ...
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

// --- NEW ACTIONS ---

export async function searchCadetCandidates(query: string) {
  const supabase = createClient()
  
  // Find cadets NOT in band, matching name
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name, cadet_rank, email,
      company:companies(company_name),
      role:roles!inner(default_role_level)
    `)
    .eq('is_in_band', false) // Must NOT be in band
    .eq('archived', false)
    .lt('role.default_role_level', 50) // Must be cadet
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .eq('archived', false)

  if (error) return []
  
  return data.map((p: any) => ({
    id: p.id,
    name: `${p.last_name}, ${p.first_name}`,
    rank: p.cadet_rank,
    company: Array.isArray(p.company) ? p.company[0]?.company_name : p.company?.company_name
  }))
}

export async function setBandMembership(cadetId: string, isInBand: boolean) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_in_band: isInBand })
    .eq('id', cadetId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/band')
  return { success: true }
}

export async function toggleUserArchiveStatus(targetUserId: string, setArchived: boolean) {
  const supabase = createClient()
  
  // 1. Auth & Permission Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) return { error: "Permission Denied: Admins only." }

  // 2. Prepare Updates
  const updates: any = { archived: setArchived }
  
  // IF ARCHIVING: Unassign Company and Role so they don't block slots
  if (setArchived) {
      updates.company_id = null
      updates.role_id = null
  }

  // 3. Execute Update
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  // 4. Revalidate
  revalidatePath('/admin')
  revalidatePath('/roster') // Ensure public roster updates
  
  return { success: true }
}