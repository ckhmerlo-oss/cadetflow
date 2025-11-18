'use server'

import { createClient } from '@/utils/supabase/server'

export type HistoryReport = {
  id: string;
  created_at: string;
  date_of_offense: string;
  status: string;
  notes: string | null;
  demerits_effective: number;
  subject: { first_name: string, last_name: string };
  submitter: { first_name: string, last_name: string };
  offense_type: { offense_name: string; demerits: number };
  // NEW: Fetch appeal status
  appeals: { status: string }[]; 
}

export async function fetchReportHistory(offset: number, limit: number) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data, error } = await supabase
    .from('demerit_reports')
    .select(`
      id,
      created_at,
      date_of_offense,
      status,
      notes,
      demerits_effective,
      subject:subject_cadet_id ( first_name, last_name ),
      submitter:submitted_by ( first_name, last_name ),
      offense_type:offense_type_id ( offense_name, demerits ),
      appeals ( status )
    `)
    .in('status', ['completed', 'rejected', 'pulled'])
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching history:', error.message)
    return { error: error.message }
  }

  return { data: data as unknown as HistoryReport[] }
}