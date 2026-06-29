import { getAllowedPolicyCategories } from '@/app/lib/categoryRestrictions.server'
import { filterOffensesByPolicy } from '@/app/lib/categoryRestrictions'
import { canSubmitIncidents } from '@/app/lib/submissionPermissions.server'
import { createClient } from '@/utils/supabase/server'
import { getIncidents } from './actions'
import IncidentsClient from './IncidentsClient'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  getEvents,
  getEvent,
  getIncidentPreviewContext,
  getEventResolutionOffenses,
  getResolvedUnlinkedFilings,
} from '@/app/events/actions'
import {
  getSpecialReport,
  getUnlinkedSpecialReports,
} from '@/app/special-reports/actions'
import { getUnlinkedIncidents } from './actions'
import EventsOrganizerClient from '@/app/events/EventsOrganizerClient'

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    create?: string
    event?: string
    report?: string
    incident?: string
    inbox?: string
    archive?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0

  const canSubmit = await canSubmitIncidents(roleLevel)
  if (!canSubmit && roleLevel < 65) redirect('/')

  if (roleLevel >= 65) {
    const eventId = params.event ?? null
    const reportId = params.report ?? null
    const incidentId = params.incident ?? null
    const create = params.create === '1'
    const archive = params.archive === '1'
    const inbox =
      params.inbox === 'incidents' ? 'incidents' as const
      : params.inbox === 'special' ? 'special' as const
      : null

    const [
      events,
      unlinkedReports,
      unlinkedIncidents,
      resolvedFilings,
      eventDetail,
      highlightReport,
      incidentPreview,
      resolutionOffenses,
    ] = await Promise.all([
      getEvents('all'),
      getUnlinkedSpecialReports(),
      getUnlinkedIncidents(),
      getResolvedUnlinkedFilings(),
      eventId ? getEvent(eventId) : Promise.resolve(null),
      reportId ? getSpecialReport(reportId) : Promise.resolve(null),
      incidentId ? getIncidentPreviewContext(incidentId) : Promise.resolve(null),
      getEventResolutionOffenses(roleLevel),
    ])

    return (
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Incidents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review incident and special reports, group filings into events, and take action.
          </p>
        </div>

        <EventsOrganizerClient
          events={events}
          unlinkedReports={unlinkedReports}
          unlinkedIncidents={unlinkedIncidents}
          resolvedFilings={resolvedFilings}
          eventDetail={eventDetail}
          highlightReport={highlightReport}
          incidentPreview={incidentPreview}
          roleLevel={roleLevel}
          resolutionOffenses={resolutionOffenses}
          initialParams={{
            create,
            eventId,
            reportId,
            incidentId,
            inbox,
            archive,
          }}
        />
      </div>
    )
  }

  const incidents = await getIncidents('all')

  const { data: offenseTypes } = await supabase
    .from('offense_types')
    .select('id, offense_name, offense_group, demerits, policy_category')
    .order('offense_group')

  const allowedCategories = roleLevel >= 90
    ? [1, 2, 3]
    : (await getAllowedPolicyCategories(roleLevel)).categories

  const filteredOffenses = filterOffensesByPolicy(offenseTypes ?? [], allowedCategories)

  const formattedOffenses = filteredOffenses.map((o: { id: string; offense_name: string; offense_group: string; demerits: number; policy_category: number }) => ({
    id: o.id,
    label: o.offense_name,
    group: o.offense_group,
    demerits: o.demerits,
    policy_category: o.policy_category,
  }))

  const isCadetLeader = roleLevel < 50

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isCadetLeader ? 'My Incident Reports' : 'Incident Reports'}
          </h1>
          <p className="text-muted-foreground">
            {isCadetLeader
              ? 'View incidents you have submitted.'
              : 'Track and triage behavioral incidents.'}
          </p>
        </div>
        <Link href="/submit?tab=incident" className="btn-primary font-bold">
          + New Incident
        </Link>
      </div>

      <IncidentsClient
        incidents={incidents}
        roleLevel={roleLevel}
        offenseTypes={formattedOffenses}
      />
    </div>
  )
}
