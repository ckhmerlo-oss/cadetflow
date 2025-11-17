// in app/report/[id]/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Server action to pull a completed report.
 * This calls the 'public.pull_report' SQL function.
 */
export async function pullReportAction(reportId: string, comment: string) {
  'use server'
  
  const supabase = createClient()
  
  // Call the 'pull_report' SQL function
  const { error } = await supabase.rpc('pull_report', {
    p_report_id: reportId,
    p_comment: comment
  })

  if (error) {
    console.error('Error pulling report:', error.message)
    // Send a user-friendly error back
    return { error: `Action failed: ${error.message}` }
  }

  // When successful, refresh the data on all affected pages
  revalidatePath(`/report/${reportId}`)
  revalidatePath(`/ledger/[id]`, 'layout') // Refresh all ledgers
  revalidatePath('/manage') // Refresh the roster
  revalidatePath('/') // Refresh the dashboard

  return { success: true }
}