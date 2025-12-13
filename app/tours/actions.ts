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
  
  // Fetch all ledger entries, ordered by newest first
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
    // Optional: Limit to recent 500 entries to prevent massive page loads
    .limit(500)

  if (error) {
    console.error('Error fetching tour logs:', error)
    return []
  }

  return data as TourLogEntry[]
}