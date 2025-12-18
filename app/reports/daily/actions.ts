'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Enhanced Type to match your existing UI needs
export type GreenSheetItem = {
  report_id: string
  subject_name: string
  company_name: string | null
  offense_name: string
  policy_category: number
  demerits: number
  submitter_name: string
  date_of_offense: string
  notes: string | null
  posted_at: string | null
}

export async function getGreenSheetData(dateStr?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('demerit_reports')
    .select(`
      id,
      date_of_offense,
      demerits_effective,
      notes,
      posted_at,
      subject:subject_cadet_id (first_name, last_name, cadet_rank, company:companies(company_name)),
      offense_type:offense_type_id (offense_name, policy_category),
      submitter:submitted_by (first_name, last_name)
    `)
    .eq('status', 'completed')
    .order('subject(last_name)', { ascending: true })

  if (dateStr) {
    // HISTORY MODE: Fetch items posted on this specific day
    const start = `${dateStr}T00:00:00.000Z`
    const end = `${dateStr}T23:59:59.999Z`
    query = query.gte('posted_at', start).lte('posted_at', end)
  } else {
    // PENDING MODE: Not yet posted
    query = query.is('posted_at', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching green sheet:', error)
    return []
  }

  // Flatten to match your existing GreenSheetReport type
  return data.map((r: any) => {
    const sub = Array.isArray(r.subject) ? r.subject[0] : r.subject
    const off = Array.isArray(r.offense_type) ? r.offense_type[0] : r.offense_type
    const submitter = Array.isArray(r.submitter) ? r.submitter[0] : r.submitter
    const comp = sub?.company ? (Array.isArray(sub.company) ? sub.company[0] : sub.company) : null

    return {
        report_id: r.id,
        subject_name: `${sub?.last_name || 'Unknown'}, ${sub?.first_name || ''}`,
        company_name: comp?.company_name || null,
        offense_name: off?.offense_name || 'Unknown',
        policy_category: off?.policy_category || 0,
        demerits: r.demerits_effective,
        submitter_name: `${submitter?.last_name || 'System'}, ${submitter?.first_name ? submitter.first_name[0] + '.' : ''}`,
        date_of_offense: r.date_of_offense,
        notes: r.notes,
        posted_at: r.posted_at
    }
  }) as GreenSheetItem[]
}

export async function publishGreenSheet(reportIds: string[]) {
    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase.from('demerit_reports').update({ posted_at: now }).in('id', reportIds)
    if (error) return { success: false, error: error.message }
    revalidatePath('/reports/daily')
    return { success: true }
}

export async function markReportAsPosted(reportId: string) {
    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase.from('demerit_reports').update({ posted_at: now }).eq('id', reportId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/reports/daily')
    return { success: true }
}

export async function unpostReport(reportId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('demerit_reports').update({ posted_at: null }).eq('id', reportId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/reports/daily')
    return { success: true }
}