'use server'

import { createClient } from '@/utils/supabase/server'

// Unified Type Definition
export type HistoryReport = {
  id: string;
  created_at: string;
  date_of_offense: string;
  status: string;
  notes: string | null;
  demerits_effective: number;
  subject: { first_name: string, last_name: string } | null;
  submitter: { first_name: string, last_name: string } | null;
  offense_type: { offense_name: string; demerits: number };
  
  // NEW: Full history relations
  appeals: { 
    status: string;
    justification: string | null;
    final_comment: string | null;
    created_at: string;
  }[];
  
  approval_log: {
    action: string;
    comment: string | null;
    created_at: string;
    actor: { first_name: string, last_name: string } | null;
  }[];
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
      appeals ( status, justification, final_comment, created_at ),
      approval_log (
        action,
        comment,
        created_at,
        actor:actor_id ( first_name, last_name )
      )
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