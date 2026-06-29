'use server'

import { createClient } from '@/utils/supabase/server'

export type TourLogEntry = {
  id: string
  created_at: string
  amount: number
  comment: string | null
  action: string
  cadet_id: string // <--- Added
  cadet: { first_name: string; last_name: string } | null
  staff: { first_name: string; last_name: string } | null
}

export async function getAllTourLogs() {
  const supabase = await createClient()
  
  // Fetch all ledger entries
  const { data, error } = await supabase
    .from('tour_ledger')
    .select(`
      id,
      created_at,
      amount,
      comment,
      action,
      cadet_id, 
      cadet:profiles!cadet_id (first_name, last_name),
      staff:profiles!staff_id (first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error fetching tour logs:', error)
    return []
  }

  // Flatten the response
  const formattedData = (data as any[]).map((entry) => ({
    id: entry.id,
    created_at: entry.created_at,
    amount: entry.amount,
    comment: entry.comment,
    action: entry.action,
    cadet_id: entry.cadet_id, // <--- Map it
    cadet: Array.isArray(entry.cadet) ? entry.cadet[0] : entry.cadet,
    staff: Array.isArray(entry.staff) ? entry.staff[0] : entry.staff
  }))

  return formattedData as TourLogEntry[]
}