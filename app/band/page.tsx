import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getBandRoster } from './actions'
import BandDashboardClient from './BandDashboardClient'
import { getFullAppOptions, getAppOptions } from '@/app/lib/options'

export default async function BandPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch User Profile & Band Details for Permissions
  const { data: userProfile } = await supabase
    .from('profiles')
    .select(`
        is_site_admin,
        role:roles(role_name, default_role_level),
        cadet_profiles(is_in_band)
    `)
    .eq('id', user.id)
    .single()

  // Fetch Band Details specifically to check for leadership role
  const { data: bandDetails } = await supabase
    .from('band_details')
    .select('leadership_role')
    .eq('cadet_id', user.id)
    .single()

  const roleName = (userProfile?.role as any)?.role_name
  const roleLevel = (userProfile?.role as any)?.default_role_level || 0
  const isSiteAdmin = userProfile?.is_site_admin || false
  const cadetDetails = Array.isArray((userProfile as any)?.cadet_profiles)
    ? (userProfile as any).cadet_profiles[0]
    : (userProfile as any)?.cadet_profiles
  const isInBand = cadetDetails?.is_in_band || false
  
  // SECURITY CHECK: Access Page
  if (!isInBand && roleLevel < 50 && !isSiteAdmin) {
      redirect('/')
  }

  // DEFINITION: Senior Leadership Roles
  // These roles (plus Band Director/Admin) can ADD/REMOVE cadets
  const seniorLeadershipRoles = [
      'Band Commander', 
      'Drum Major', 
      'Executive Officer', 
      'Brass Captain', 
      'Woodwind Captain', 
      'Drum Captain'
  ]

  const userLeadershipRole = bandDetails?.leadership_role || ''
  
  const canManageOptions = roleName === 'Band Director' || isSiteAdmin
  
  const canManageRoster = 
      canManageOptions || // Directors/Admins
      seniorLeadershipRoles.includes(userLeadershipRole) // Senior Cadets

  // 2. Fetch Data
  const [bandMembers, instruments, roles] = await Promise.all([
    getBandRoster(),
    getFullAppOptions('instrument'),
    getAppOptions('band_role')
  ])

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            Band
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage roster, instruments, and travel details.
          </p>
        </div>
        <div className="flex gap-4">
            <div className="bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
                <div className="text-2xl font-bold text-foreground text-center">{bandMembers.length}</div>
            </div>
        </div>
      </div>
      
      <BandDashboardClient 
        initialMembers={bandMembers} 
        instrumentOptions={instruments} 
        roleOptions={roles}
        canManageOptions={canManageOptions} // Only Director can change Dropdowns
        canManageRoster={canManageRoster}   // Director + Senior Cadets can change Roster
      />
    </div>
  )
}