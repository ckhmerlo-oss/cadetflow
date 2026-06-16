import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { getProfileDropdowns } from '@/app/lib/options'
import { getProfileById, isStaffRoleLevel } from '@/app/lib/profile-queries'
import { getCadetSchedule } from '@/app/classes/actions'
import { getCadetOversight } from '@/app/oversight/actions'

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

  const dropdowns = await getProfileDropdowns()

  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select(`id, company_id, is_site_admin, role:role_id (default_role_level, can_manage_all_rosters, can_manage_own_company_roster)`)
    .eq('id', user.id)
    .eq('archived', false)
    .single()

  const { data: profile, error, kind } = await getProfileById(supabase, id)

  if (error || !profile) notFound()

  if (profile.archived) {
    const viewerLevel = (viewerProfile?.role as any)?.default_role_level || 0
    if (viewerLevel < 90) notFound()
  }

  const isStaff = kind === 'staff' || isStaffRoleLevel((profile.role as any)?.default_role_level)

  let fullProfile: Record<string, unknown> = { ...profile }
  let auditLog: AuditLogEntry[] = []

  if (!isStaff) {
    const { data: rawStats } = await supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: profile.id }).single()
    const stats = rawStats as CadetStats

    fullProfile = {
      ...profile,
      term_demerits: stats?.term_demerits || 0,
      year_demerits: stats?.year_demerits || 0,
      current_tour_balance: (profile as any).cached_tour_balance ?? 0,
      is_on_probation: (profile as any).probation_status !== 'None' && (profile as any).probation_status !== null,
      conduct_status:
        (stats?.term_demerits || 0) >= 100
          ? 'Unsatisfactory'
          : (stats?.term_demerits || 0) >= 60
            ? 'Deficient'
            : 'Satisfactory',
    }

    const { data: logData } = await supabase.rpc('get_cadet_audit_log', { p_cadet_id: profile.id })
    auditLog = logData || []
  }

  const viewerRole = viewerProfile?.role as any
  const canManageAll = viewerRole?.can_manage_all_rosters || false
  const canManageOwn = viewerRole?.can_manage_own_company_roster || false
  const isSiteAdmin = viewerProfile?.is_site_admin || false

  let canEdit = false
  if (isSiteAdmin || canManageAll) canEdit = true
  else if (canManageOwn && profile.company_id && profile.company_id === viewerProfile?.company_id) canEdit = true

  const viewerRoleLevel = viewerRole?.default_role_level || 0
  let canEditSchedule = false
  if (isSiteAdmin || canManageAll) canEditSchedule = true
  else if (viewerRoleLevel >= 65 && canManageOwn && profile.company_id === viewerProfile?.company_id) canEditSchedule = true

  let schedule: Array<Record<string, unknown>> = []
  let oversight: Array<Record<string, unknown>> = []

  if (!isStaff) {
    schedule = (await getCadetSchedule(profile.id)) as Array<Record<string, unknown>>
    oversight = (await getCadetOversight(profile.id)) as Array<Record<string, unknown>>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <ProfileClient
        profile={fullProfile as any}
        auditLog={auditLog}
        canEdit={canEdit}
        viewerRoleLevel={viewerRoleLevel}
        options={dropdowns}
        isStaff={isStaff}
        schedule={schedule as any}
        oversight={oversight as any}
        canEditSchedule={canEditSchedule}
        currentUserId={user.id}
      />
    </div>
  )
}
