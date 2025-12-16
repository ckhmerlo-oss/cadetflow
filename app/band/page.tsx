import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getBandRoster } from './actions'
import BandDashboardClient from './BandDashboardClient'
import { getFullAppOptions, getAppOptions } from '@/app/lib/options'

export default async function BandPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch User's Profile for Permissions
  const { data: userProfile } = await supabase
    .from('profiles')
    .select(`
        is_site_admin, 
        is_in_band, 
        role:roles(role_name, default_role_level)
    `)
    .eq('id', user.id)
    .single()

  const roleName = (userProfile?.role as any)?.role_name
  const roleLevel = (userProfile?.role as any)?.default_role_level || 0
  const isSiteAdmin = userProfile?.is_site_admin || false
  const isInBand = userProfile?.is_in_band || false
  
  if (!isInBand && roleLevel < 50 && !isSiteAdmin) {
      redirect('/')
  }

  const canManageOptions = roleName === 'Band Director' || isSiteAdmin

  const [bandMembers, instruments, roles] = await Promise.all([
    getBandRoster(),
    getFullAppOptions('instrument'),
    getAppOptions('band_role')
  ])

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none">
      {/* HEADER - Hidden in Print */}
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
        canManageOptions={canManageOptions} 
      />
    </div>
  )
}