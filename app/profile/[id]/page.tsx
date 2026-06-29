import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { getProfileDropdowns } from '@/app/lib/options'
import { getProfileById, isStaffRoleLevel } from '@/app/lib/profile-queries'
import { getCadetSchedule } from '@/app/classes/actions'
import { getCadetOversight } from '@/app/oversight/actions'
import {
  getAcademicTermsForYears,
  listCadetHistoricalYears,
  getCadetPeriodStats,
} from '@/app/lib/period-queries'
import {
  listCadetParentLinksForCadet,
  listPortalInvitesForCadet,
} from '@/app/lib/parent-queries'
import type { PeriodSelection } from '@/app/lib/period-types'
import { buildDefaultPeriodSelection, selectableYears } from '@/app/lib/period-utils'
import { canViewCadetHistory } from '@/app/lib/cadet-history-queries'

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

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
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

  const isArchivedCadet = profile.archived === true

  const isStaff = kind === 'staff' || isStaffRoleLevel((profile.role as any)?.default_role_level)

  let fullProfile: Record<string, unknown> = { ...profile }
  let auditLog: AuditLogEntry[] = []

  let historicalYears: string[] = []
  let allTerms: Awaited<ReturnType<typeof getAcademicTermsForYears>> = []
  let initialPeriod: PeriodSelection | null = null

  if (!isStaff) {
    historicalYears = await listCadetHistoricalYears(profile.id)
    allTerms = await getAcademicTermsForYears(historicalYears)
    historicalYears = selectableYears(allTerms, historicalYears)
    initialPeriod = buildDefaultPeriodSelection(historicalYears, allTerms)

    const periodValid = initialPeriod && allTerms.some((t) => t.school_year === initialPeriod!.schoolYear)
    const periodStats = periodValid
      ? await getCadetPeriodStats(profile.id, initialPeriod!.schoolYear, initialPeriod!.termNumber)
      : null

    fullProfile = {
      ...profile,
      term_demerits: periodStats?.term_demerits || 0,
      year_demerits: periodStats?.year_demerits || 0,
      current_tour_balance: periodStats?.current_tour_balance ?? (profile as any).cached_tour_balance ?? 0,
      is_on_probation: (profile as any).probation_status !== 'None' && (profile as any).probation_status !== null,
      conduct_status: periodStats?.conduct_status || 'Exemplary',
      years_attended: (profile as any).years_attended ?? 0,
    }

    const { data: logData } = await supabase.rpc('get_cadet_audit_log', { p_cadet_id: profile.id })
    auditLog = logData || []
  }

  const viewerRole = viewerProfile?.role as any
  const canManageAll = viewerRole?.can_manage_all_rosters || false
  const canManageOwn = viewerRole?.can_manage_own_company_roster || false
  const isSiteAdmin = viewerProfile?.is_site_admin || false

  let canEdit = false
  if (!isArchivedCadet) {
    if (isSiteAdmin || canManageAll) canEdit = true
    else if (canManageOwn && profile.company_id && profile.company_id === viewerProfile?.company_id) canEdit = true
  }

  const viewerRoleLevel = viewerRole?.default_role_level || 0
  let canEditSchedule = false
  if (!isArchivedCadet) {
    if (isSiteAdmin || canManageAll) canEditSchedule = true
    else if (viewerRoleLevel >= 65 && canManageOwn && profile.company_id === viewerProfile?.company_id) canEditSchedule = true
  }

  let schedule: Array<Record<string, unknown>> = []
  let oversight: Array<Record<string, unknown>> = []
  let canViewHistory = false
  let linkedParents: Awaited<ReturnType<typeof listCadetParentLinksForCadet>> = []
  let portalInvites: Awaited<ReturnType<typeof listPortalInvitesForCadet>> = []
  const canManagePortal =
    !isStaff &&
    viewerRoleLevel >= 65 &&
    (isSiteAdmin ||
      canManageAll ||
      (canManageOwn && profile.company_id === viewerProfile?.company_id))

  if (!isStaff) {
    canViewHistory = await canViewCadetHistory(profile.id)
    schedule = (await getCadetSchedule(profile.id)) as Array<Record<string, unknown>>
    oversight = (await getCadetOversight(profile.id)) as Array<Record<string, unknown>>

    if (viewerRoleLevel >= 50) {
      try {
        linkedParents = await listCadetParentLinksForCadet(profile.id)
        if (canManagePortal) {
          portalInvites = await listPortalInvitesForCadet(profile.id)
        }
      } catch {
        linkedParents = []
        portalInvites = []
      }
    }
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
        isArchivedView={isArchivedCadet}
        historicalYears={historicalYears}
        allTerms={allTerms}
        initialPeriod={initialPeriod}
        canViewHistory={canViewHistory}
        linkedParents={linkedParents}
        portalInvites={portalInvites}
        canManagePortal={canManagePortal}
      />
    </div>
  )
}
