import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EDIT_AUTHORIZED_ROLES } from '@/app/profile/constants'
import RosterClient from './RosterClient'

// Define the shape of the data from our new SQL function
export type RosterCadet = {
  id: string;
  first_name: string;
  last_name: string;
  cadet_rank: string | null;
  company_name: string | null;
  grade_level: string | null;
  term_demerits: number;
  year_demerits: number;
  current_tour_balance: number;
  has_star_tours: boolean;
  conduct_status: string;
  recent_reports: {
    id: string;
    offense_name: string;
    status: string;
    created_at: string;
  }[] | null;
}

async function getRosterData() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_full_roster')
  if (error) {
    console.error('Error fetching roster:', error.message)
    return { rosterData: [], error: error.message }
  }
  return { rosterData: data as RosterCadet[], error: null }
}

export default async function RosterPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Get viewer's permissions
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select('role:role_id (role_name)')
    .eq('id', user.id)
    .single()

  const viewerRoleName = (viewerProfile?.role as any)?.role_name || ''
  const isAdmin = viewerRoleName === 'Admin'
  const canEditProfiles = EDIT_AUTHORIZED_ROLES.includes(viewerRoleName) || viewerRoleName.includes('TAC') || isAdmin
  
  const { rosterData, error } = await getRosterData()

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cadet Roster</h1>
        <div className="p-4 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="font-medium">Error loading roster:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cadet Roster</h1>
      <RosterClient initialData={rosterData} canEditProfiles={canEditProfiles} />
    </div>
  )
}