import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getProfileById, isStaffRoleLevel } from '@/app/lib/profile-queries'
import { getAcademicTermsForYears, listCadetHistoricalYears } from '@/app/lib/period-queries'
import { buildDefaultPeriodSelection, selectableYears } from '@/app/lib/period-utils'
import { canViewCadetHistory } from '@/app/lib/cadet-history-queries'
import CadetHistoryClient from './CadetHistoryClient'

export default async function CadetHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error, kind } = await getProfileById(supabase, id)
  if (error || !profile) notFound()
  if (kind === 'staff' || isStaffRoleLevel((profile.role as { default_role_level?: number } | null)?.default_role_level)) {
    notFound()
  }

  const allowed = await canViewCadetHistory(id)
  if (!allowed) notFound()

  const historicalYears = await listCadetHistoricalYears(profile.id)
  const allTerms = await getAcademicTermsForYears(historicalYears)
  const years = selectableYears(allTerms, historicalYears)
  const initialPeriod = buildDefaultPeriodSelection(years, allTerms)

  return (
    <CadetHistoryClient
      cadetId={profile.id}
      cadetName={`${profile.last_name}, ${profile.first_name}`}
      cadetRank={(profile as { cadet_rank?: string }).cadet_rank ?? 'Cadet'}
      isArchived={profile.archived === true}
      historicalYears={years}
      allTerms={allTerms}
      initialPeriod={initialPeriod}
    />
  )
}
