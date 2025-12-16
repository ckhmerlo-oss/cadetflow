'use server'

import { createClient } from '@/utils/supabase/server'

export type AppOption = {
  id: string
  category: string
  value: string
  group_name?: string | null // <--- Added this
  sort_order: number
}

// 1. Keep this for simple dropdowns (Profile Page) - Returns string[]
export async function getAppOptions(category: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_options')
    .select('value')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  return (data || []).map((o: any) => o.value) as string[]
}

// 2. NEW: Fetch full option objects (Band Page) - Returns AppOption[]
export async function getFullAppOptions(category: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_options')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('group_name', { ascending: true }) // Group first
    .order('sort_order', { ascending: true }) // Then sort order
  
  return (data || []) as AppOption[]
}

// ... (Keep getSportOptions & getProfileDropdowns unchanged) ...
export async function getSportOptions(season: string) {
    const supabase = createClient()
    const { data } = await supabase.from('sports').select('name').eq('season', season).eq('is_active', true).order('name')
    return ['None', ...(data || []).map((s: any) => s.name)]
}

export async function getProfileDropdowns() {
    const [ranks, grades, conduct, probation, extracurriculars, fallSports, winterSports, springSports] = await Promise.all([
      getAppOptions('rank'), getAppOptions('grade'), getAppOptions('conduct'),
      getAppOptions('probation'), getAppOptions('extracurricular'),
      getSportOptions('Fall'), getSportOptions('Winter'), getSportOptions('Spring')
    ])
    return { ranks, grades, conduct, probation, extracurriculars, fallSports, winterSports, springSports }
}