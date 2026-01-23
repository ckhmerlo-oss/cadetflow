import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { getProfileDropdowns } from '@/app/lib/options' // Ensure this file exists from previous step!

// Define the shape of your Audit Log RPC response
type AuditLogEntry = {
  event_date: string
  event_type: string
  title: string
  details: string
  demerits_issued: number
  tour_change: number
  actor_name: string
  status: string
  report_id: string | null
}

type CadetStats = {
  term_demerits: number
  year_demerits: number
  current_tour_balance: number
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient()
  const resolvedParams = await params
  const { id } = resolvedParams

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. FETCH DROPDOWNS (This was missing/failing)
  const dropdowns = await getProfileDropdowns()

  // 2. Fetch Viewer Profile
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select(`id, company_id, is_site_admin, role:role_id (default_role_level, can_manage_all_rosters, can_manage_own_company_roster)`)
    .eq('id', user.id)
    .eq('archived', false)
    .single()

  // 3. Fetch Target Profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`*, company:companies(id, company_name), role:roles(id, role_name, default_role_level)`)
    .eq('id', id)
    .eq('archived', false)
    .single()

  if (error || !profile) notFound()

  // --- NEW: ARCHIVE SECURITY CHECK ---
  if (profile.archived) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // If not logged in, they definitely can't see it
    if (!user) notFound() 

    // Fetch Viewer's permissions
    const { data: viewer } = await supabase
      .from('profiles')
      .select('role:roles(default_role_level)')
      .eq('id', user.id)
      .single()
    
    const viewerLevel = (viewer?.role as any)?.default_role_level || 0
    
    // RESTRICTION: Only Level 90+ (Admin/Commandant) can view archived profiles
    if (viewerLevel < 90) {
      // You can either return notFound() to pretend it doesn't exist
      // OR return a specific "Archived" message. 
      // notFound() is safer for privacy.
      notFound()
    }
  }
  // ------------------------------------

  // 4. Calculate Stats
  const { data: rawStats } = await supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: profile.id }).single()
  const stats = rawStats as CadetStats;
  
  const fullProfile = {
      ...profile,
      term_demerits: stats?.term_demerits || 0,
      year_demerits: stats?.year_demerits || 0,
      current_tour_balance: profile.cached_tour_balance, 
      is_on_probation: profile.probation_status !== 'None' && profile.probation_status !== null,
      conduct_status: (stats?.term_demerits || 0) >= 100 ? 'Unsatisfactory' : (stats?.term_demerits || 0) >= 60 ? 'Deficient' : 'Satisfactory'
  }

  // 5. Permissions
  const viewerRole = viewerProfile?.role as any
  const canManageAll = viewerRole?.can_manage_all_rosters || false
  const canManageOwn = viewerRole?.can_manage_own_company_roster || false
  const isSiteAdmin = viewerProfile?.is_site_admin || false

  let canEdit = false;
  if (isSiteAdmin || canManageAll) canEdit = true;
  else if (canManageOwn && profile.company_id && profile.company_id === viewerProfile?.company_id) canEdit = true;

  // 6. Fetch Audit Log
  const { data: auditLog } = await supabase
    .rpc('get_cadet_audit_log', { p_cadet_id: profile.id })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <ProfileClient 
        profile={fullProfile} 
        auditLog={auditLog || []} 
        canEdit={canEdit} 
        viewerRoleLevel={viewerRole?.default_role_level || 0} 
        options={dropdowns} // <--- PASSING THE OPTIONS PROP
      />
    </div>
  )
}