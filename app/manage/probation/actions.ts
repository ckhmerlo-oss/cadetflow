'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProbationRecord = {
  id: string
  first_name: string
  last_name: string
  company_name: string | null
  probation_status: string | null
  probation_notes: string | null
  grade_level: string | null
}

// Fetch all cadets currently on probation
export async function getProbationList() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name, probation_status, probation_notes, grade_level,
      company:companies(company_name)
    `)
    .neq('probation_status', 'None') 
    .not('probation_status', 'is', null)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching probation list:', error)
    return []
  }

  return data.map((p: any) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    company_name: p.company?.company_name || 'Unassigned',
    probation_status: p.probation_status,
    probation_notes: p.probation_notes,
    grade_level: p.grade_level
  })) as ProbationRecord[]
}

// *** FIX: Changed filter from .eq 10 to .lt 50 to capture ALL student ranks ***
export async function getAllCadetsForSelection() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, 
      first_name, 
      last_name, 
      company:companies(company_name),
      role:roles!inner(default_role_level)
    `)
    .lt('role.default_role_level', 50) // <--- CHANGED HERE
    .order('last_name')

  if (error) {
      console.error('Error fetching cadet selection list:', error)
      return []
  }
  
  return data.map((p: any) => ({
    id: p.id,
    label: `${p.last_name}, ${p.first_name} (${p.company?.company_name || 'N/A'})`
  }))
}

// Update probation status and notes
export async function updateCadetProbation(cadetId: string, status: string, notes: string) {
  const supabase = createClient()
  
  // 1. Verify Permissions (TAC Officer / Role Level 65+)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: viewer } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
    
  const level = (viewer?.role as any)?.default_role_level || 0
  if (level < 65) return { error: 'Insufficient permissions (Level 65+ required)' }

  // 2. Perform Update
  const { error } = await supabase
    .from('profiles')
    .update({ 
      probation_status: status,
      probation_notes: notes 
    })
    .eq('id', cadetId)

  if (error) return { error: error.message }

  revalidatePath('/manage/probation')
  return { success: true }
}