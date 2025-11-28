'use server'

import { createClient } from '@/utils/supabase/server'

export type PendingReport = {
  id: string;
  created_at: string;
  date_of_offense: string;
  status: string;
  notes: string | null;
  demerits_effective: number;
  subject: { first_name: string, last_name: string } | null;
  submitter: { first_name: string, last_name: string } | null;
  offense_type: { offense_name: string; demerits: number };
  // NEW: Fetch the name of the group it's waiting on
  current_approver_group: { group_name: string } | null;
  approval_log: { 
    action: string; 
    comment: string | null; 
    created_at: string; 
    actor: { first_name: string, last_name: string } | null 
  }[];
}

export async function fetchPendingReports(offset: number, limit: number) {
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
      current_approver_group:current_approver_group_id ( group_name ),
      approval_log (
        action,
        comment,
        created_at,
        actor:actor_id ( first_name, last_name )
      )
    `)
    // *** FIX: Include 'needs_revision' ***
    .in('status', ['pending_approval', 'needs_revision'])
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching pending:', error.message)
    return { error: error.message }
  }

  return { data: data as unknown as PendingReport[] }
}