'use server'

import { createClient } from '@/utils/supabase/server'

export type TourLogEntry = {
  id: string
  created_at: string
  amount: number
  comment: string | null
  action: string
  cadet: { first_name: string; last_name: string } | null
  staff: { first_name: string; last_name: string } | null
}

export async function getAllTourLogs() {
  const supabase = createClient()
  
  // Fetch all ledger entries
  const { data, error } = await supabase
    .from('tour_ledger')
    .select(`
      id,
      created_at,
      amount,
      comment,
      action,
      cadet:profiles!cadet_id (first_name, last_name),
      staff:profiles!staff_id (first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error fetching tour logs:', error)
    return []
  }

  // FIX: Map the raw data to handle Supabase returning arrays for relations
  // We cast 'data' to 'any[]' first to stop TypeScript from complaining about the mismatch
  // between the raw array response and our desired TourLogEntry type.
  const formattedData = (data as any[]).map((entry) => ({
    id: entry.id,
    created_at: entry.created_at,
    amount: entry.amount,
    comment: entry.comment,
    action: entry.action,
    // Check if it's an array and grab the first item, otherwise use it as is
    cadet: Array.isArray(entry.cadet) ? entry.cadet[0] : entry.cadet,
    staff: Array.isArray(entry.staff) ? entry.staff[0] : entry.staff
  }))

  return formattedData as TourLogEntry[]
}