'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Sport = {
  id: string
  name: string
  season: 'Fall' | 'Winter' | 'Spring'
  coach_count: number
  athlete_count: number
}

export type SportDetail = Sport & {
  coaches: { id: string, name: string, role: string, user_id: string }[]
  events: { id: string, title: string, date: string, location: string, notes: string, is_home: boolean }[]
  roster: { 
      id: string, 
      first_name: string, 
      last_name: string, 
      company: string, 
      rank: string, 
      grade_level: string,
      current_tours: number
      // term_demerits removed from fetch to prevent crash
  }[]
}

export type GlobalEvent = {
    id: string
    sport_name: string
    title: string
    date: string
    is_home: boolean
}

// --- DATA FETCHING ---

export async function getSportsList(season?: string) {
  const supabase = await createClient()
  let query = supabase.from('sports').select('id, name, season, is_active').order('name')
  
  if (season) query = query.eq('season', season)
  
  const { data: sports, error } = await query
  if (error) return []

  return sports.map((s: any) => ({ ...s, coach_count: 0, athlete_count: 0 })) as Sport[]
}

export async function getGlobalUpcomingEvents() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('sport_events')
        .select('id, title, event_date, is_home, sport:sports(name)')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(6)
    
    return data?.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.event_date,
        is_home: e.is_home,
        sport_name: e.sport?.name
    })) as GlobalEvent[] || []
}

export async function getSportDetail(sportId: string): Promise<SportDetail | null> {
  const supabase = await createClient()
  
  const { data: sport } = await supabase.from('sports').select('*').eq('id', sportId).single()
  if (!sport) return null

  const { data: coaches } = await supabase
    .from('sport_coaches')
    .select('id, role, profile:coach_id(id, first_name, last_name)')
    .eq('sport_id', sportId)
  
  const { data: events } = await supabase
    .from('sport_events')
    .select('*')
    .eq('sport_id', sportId)
    .order('event_date', { ascending: true })

  // --- ROSTER QUERY ---
  const colMap = { 'Fall': 'sport_fall', 'Winter': 'sport_winter', 'Spring': 'sport_spring' }
  const targetCol = colMap[sport.season as keyof typeof colMap]
  
  // FIXED: 
  // 1. Used 'cached_tour_balance' (correct column name)
  // 2. Removed 'term_demerits' (does not exist on profiles table)
  const { data: roster, error: rosterError } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name,
      company:companies(company_name),
      cadet_profiles!inner (cadet_rank, grade_level, cached_tour_balance, sport_fall, sport_winter, sport_spring)
    `)
    .eq(`cadet_profiles.${targetCol}`, sport.name)
    .eq('archived', false)
    .order('last_name')

  if (rosterError) {
      console.error("Roster fetch error:", rosterError)
  }

  return {
    ...sport,
    coach_count: coaches?.length || 0,
    athlete_count: roster?.length || 0,
    coaches: coaches?.map((c: any) => ({ 
        id: c.id, 
        user_id: c.profile.id,
        name: `${c.profile.last_name}, ${c.profile.first_name}`, 
        role: c.role 
    })) || [],
    events: events?.map((e: any) => ({...e, date: e.event_date})) || [],
    roster: roster?.map((r: any) => {
      const details = Array.isArray(r.cadet_profiles) ? r.cadet_profiles[0] : r.cadet_profiles
      return {
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        rank: details?.cadet_rank || '',
        company: r.company?.company_name || 'Unassigned',
        grade_level: details?.grade_level || '-',
        current_tours: details?.cached_tour_balance || 0
      }
    }) || []
  }
}

// ... (Search functions unchanged) ...
export async function searchCadets(query: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, company:companies(company_name), role:roles!inner(default_role_level)')
        .ilike('last_name', `${query}%`)
        .lt('role.default_role_level', 50) 
        .eq('archived', false)
        //.limit(10)
    
    return data?.map((p: any) => ({
        id: p.id,
        label: `${p.last_name}, ${p.first_name} (${p.company?.company_name || 'N/A'})`
    })) || []
}

export async function searchFaculty(query: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role:roles!inner(default_role_level)')
        .ilike('last_name', `${query}%`)
        .gte('role.default_role_level', 50)
        .eq('archived', false)
        //.limit(10)

    return data?.map((p: any) => ({
        id: p.id,
        label: `${p.last_name}, ${p.first_name} (Faculty)`
    })) || []
}

// ... (Other mutations unchanged) ...
export async function claimHeadCoach(sportId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    const { count } = await supabase.from('sport_coaches').select('*', { count: 'exact', head: true }).eq('sport_id', sportId)
    if (count && count > 0) return { error: "This sport already has a coach." }
    const { error } = await supabase.from('sport_coaches').insert({ sport_id: sportId, coach_id: user.id, role: 'Head Coach' })
    if (!error) revalidatePath(`/sports/${sportId}`)
    return { error: error?.message }
}

export async function addAssistantCoach(sportId: string, userId: string, role: string = 'Assistant Coach') {
    const supabase = await createClient()
    const { error } = await supabase.from('sport_coaches').insert({ sport_id: sportId, coach_id: userId, role: role })
    if (!error) revalidatePath(`/sports/${sportId}`)
    return { error: error?.message }
}

export async function removeCoach(recordId: string, sportId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('sport_coaches').delete().eq('id', recordId)
    if (!error) revalidatePath(`/sports/${sportId}`)
    return { error: error?.message }
}

export async function addToRoster(cadetId: string, sportName: string, season: string) {
    const supabase = await createClient()
    const colMap = { 'Fall': 'sport_fall', 'Winter': 'sport_winter', 'Spring': 'sport_spring' }
    const targetCol = colMap[season as keyof typeof colMap]
    const { error } = await supabase.from('cadet_profiles').update({ [targetCol]: sportName }).eq('profile_id', cadetId)
    if (!error) revalidatePath(`/sports`) 
    return { error: error?.message }
}

export async function removeFromRoster(cadetId: string, season: string) {
    const supabase = await createClient()
    const colMap = { 'Fall': 'sport_fall', 'Winter': 'sport_winter', 'Spring': 'sport_spring' }
    const targetCol = colMap[season as keyof typeof colMap]
    const { error } = await supabase.from('cadet_profiles').update({ [targetCol]: 'None' }).eq('profile_id', cadetId)
    if (!error) revalidatePath(`/sports`)
    return { error: error?.message }
}

export async function addEvent(sportId: string, event: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('sport_events').insert({
        sport_id: sportId,
        title: event.title,
        event_date: event.event_date,
        location: event.location,
        notes: event.notes,
        is_home: event.is_home
    })
    if (!error) revalidatePath(`/sports/${sportId}`)
    return { error: error?.message }
}

export async function removeEvent(eventId: string, sportId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('sport_events').delete().eq('id', eventId)
    if (!error) revalidatePath(`/sports/${sportId}`)
    return { error: error?.message }
}

export async function getUnassignedCadets(season: string) {
    const supabase = await createClient()
    const colMap = { 'Fall': 'sport_fall', 'Winter': 'sport_winter', 'Spring': 'sport_spring' }
    const targetCol = colMap[season as keyof typeof colMap]

    const { data } = await supabase
        .from('profiles')
        .select(`
          id, first_name, last_name,
          company:companies(company_name),
          role:roles!inner(default_role_level),
          cadet_profiles!inner (cadet_rank, sport_fall, sport_winter, sport_spring)
        `)
        .or(`cadet_profiles.${targetCol}.is.null,cadet_profiles.${targetCol}.eq.None`)
        .lt('role.default_role_level', 50)
        .eq('archived', false)
        .order('last_name')
    
    return data?.map((p: any) => {
      const details = Array.isArray(p.cadet_profiles) ? p.cadet_profiles[0] : p.cadet_profiles
      return {
        ...p,
        cadet_rank: details?.cadet_rank,
      }
    }) || []
}