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

export async function getProbationList() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name,
      company:companies(company_name),
      cadet_profiles!inner (
        probation_status,
        probation_notes,
        grade_level
      )
    `)
    .eq('archived', false)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching probation list:', error)
    return []
  }

  return data
    .map((p: any) => {
      const details = Array.isArray(p.cadet_profiles) ? p.cadet_profiles[0] : p.cadet_profiles
      if (!details || details.probation_status === 'None' || details.probation_status == null) {
        return null
      }
      return {
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        company_name: p.company?.company_name || 'Unassigned',
        probation_status: details.probation_status,
        probation_notes: details.probation_notes,
        grade_level: details.grade_level,
      }
    })
    .filter(Boolean) as ProbationRecord[]
}

export async function getAllCadetsForSelection() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name,
      company:companies(company_name),
      role:roles!inner(default_role_level),
      cadet_profiles!inner (probation_status)
    `)
    .lt('role.default_role_level', 50)
    .eq('archived', false)
    .order('last_name')

  if (error) {
    console.error('Error fetching cadets:', error)
    return []
  }

  return data.map((p: any) => ({
    id: p.id,
    label: `${p.last_name}, ${p.first_name} (${p.company?.company_name || 'Unassigned'})`,
    probation_status: (Array.isArray(p.cadet_profiles) ? p.cadet_profiles[0] : p.cadet_profiles)?.probation_status,
  }))
}

export async function updateCadetProbation(cadetId: string, status: string, notes: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: viewer } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (viewer?.role as any)?.default_role_level || 0
  if (roleLevel < 30) {
    return { error: 'Permission Denied' }
  }

  const { error } = await supabase
    .from('cadet_profiles')
    .update({
      probation_status: status,
      probation_notes: notes,
    })
    .eq('profile_id', cadetId)

  if (error) return { error: error.message }

  revalidatePath('/manage/probation')
  return { success: true }
}
