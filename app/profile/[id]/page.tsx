import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { EDIT_AUTHORIZED_ROLES, STAR_TOUR_AUTHORIZED_ROLES } from '../constants'

type LedgerStats = {
  term_demerits: number;
  year_demerits: number;
  total_tours_marched: number;
  current_tour_balance: number;
}

function getCurrentSport(profile: any) {
  const month = new Date().getMonth() 
  if (month >= 7 && month <= 10) return { season: 'Fall Sport', sport: profile.sport_fall }
  else if (month === 11 || month <= 2) return { season: 'Winter Sport', sport: profile.sport_winter }
  else return { season: 'Spring Sport', sport: profile.sport_spring }
}

function calculateConductStatus(termDemerits: number, yearDemerits: number): string {
    if (termDemerits >= 43 || yearDemerits >= 211) return 'Unsatisfactory';
    if (termDemerits >= 31 || yearDemerits >= 151) return 'Deficient';
    if (termDemerits >= 19 || yearDemerits >= 91)  return 'Satisfactory';
    if (termDemerits >= 7  || yearDemerits >= 31)  return 'Commendable';
    return 'Exemplary';
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select('id, role:role_id (role_name, default_role_level)')
    .eq('id', user.id)
    .single()

  if (!viewerProfile) return redirect('/login')

  const viewerRoleLevel = (viewerProfile.role as any)?.default_role_level || 0
  const viewerRoleName = (viewerProfile.role as any)?.role_name || ''

  const [profileRes, statsRes] = await Promise.all([
      supabase.from('profiles').select(`*, company:company_id (company_name), role:role_id (role_name, default_role_level)`).eq('id', id).single(),
      supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: id }).single()
  ])

  const profile = profileRes.data
  const stats = statsRes.data as LedgerStats | null

  if (profileRes.error || !profile) return notFound()

  const targetRoleLevel = (profile.role as any)?.default_role_level || 0
  const isSelf = user.id === id
  const isAdmin = viewerRoleName === 'Admin'

  if (!isSelf && !isAdmin && (viewerRoleLevel < targetRoleLevel)) {
    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h2>
            <p className="text-gray-600 dark:text-gray-300">You do not have sufficient rank to view this profile.</p>
        </div>
    )
  }

  const canEdit = EDIT_AUTHORIZED_ROLES.includes(viewerRoleName) || viewerRoleName.includes('TAC') || isAdmin
  const canManageStarTours = STAR_TOUR_AUTHORIZED_ROLES.includes(viewerRoleName)

  const currentSportData = getCurrentSport(profile)
  const calculatedConduct = calculateConductStatus(stats?.term_demerits || 0, stats?.year_demerits || 0)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
       <ProfileClient 
            profile={profile}
            stats={stats}
            canEdit={canEdit}
            canManageStarTours={canManageStarTours}
            currentSportData={currentSportData}
            calculatedConduct={calculatedConduct}
       />
    </div>
  )
}