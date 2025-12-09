import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

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

  // Fetch Viewer
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select(`id, company_id, is_site_admin, role:role_id (default_role_level, can_manage_all_rosters, can_manage_own_company_roster)`)
    .eq('id', user.id)
    .single()

  // Fetch Profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`*, company:companies(id, company_name), role:roles(id, role_name, default_role_level)`)
    .eq('id', id)
    .single()

  if (error || !profile) notFound()

  // Calculate Stats
  const { data: rawStats } = await supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: profile.id }).single()
  const stats = rawStats as CadetStats;
  
  const fullProfile = {
      ...profile,
      term_demerits: stats?.term_demerits || 0,
      year_demerits: stats?.year_demerits || 0,
      // Use the calculation function for accuracy, or fallback to cache
      current_tour_balance: profile.cached_tour_balance, 
      is_on_probation: profile.probation_status !== 'None' && profile.probation_status !== null,
      conduct_status: (stats?.term_demerits || 0) >= 100 ? 'Unsatisfactory' : (stats?.term_demerits || 0) >= 60 ? 'Deficient' : 'Satisfactory'
  }

  // Permissions
  const viewerRole = viewerProfile?.role as any
  const canManageAll = viewerRole?.can_manage_all_rosters || false
  const canManageOwn = viewerRole?.can_manage_own_company_roster || false
  const isSiteAdmin = viewerProfile?.is_site_admin || false

  let canEdit = false;
  if (isSiteAdmin || canManageAll) canEdit = true;
  else if (canManageOwn && profile.company_id && profile.company_id === viewerProfile?.company_id) canEdit = true;

  // *** FIX: Fetch from the correct RPC ***
  const { data: auditLog } = await supabase
    .rpc('get_cadet_audit_log', { p_cadet_id: profile.id })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <ProfileClient 
        profile={fullProfile} 
        auditLog={auditLog || []} // Pass the audit log instead of 'ledger'
        canEdit={canEdit} 
        viewerRoleLevel={viewerRole?.default_role_level || 0} 
      />
    </div>
  )
}