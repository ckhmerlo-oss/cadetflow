import type { SpecialReport } from '@/app/special-reports/actions'
import type { IncidentReport } from '@/app/incidents/actions'
import type { DisciplineEvent } from '../actions'

export type NavigatorSelection =
  | { kind: 'specialReports' }
  | { kind: 'incidentReports' }
  | { kind: 'resolvedArchive' }
  | { kind: 'event'; eventId: string }

export type PreviewSelection =
  | { kind: 'create' }
  | { kind: 'event'; eventId: string }
  | { kind: 'report'; reportId: string }
  | { kind: 'incident'; incidentId: string }

export type MobilePane = 'navigator' | 'filings' | 'preview'

export function formatPersonName(
  person: { first_name?: string; last_name?: string } | null | undefined
) {
  if (!person?.last_name) return 'Unknown'
  return `${person.last_name}, ${person.first_name ?? ''}`.trim()
}

export function sortSpecialReports(reports: SpecialReport[]) {
  return [...reports].sort((a, b) => {
    if (a.flagged_for_review !== b.flagged_for_review) {
      return a.flagged_for_review ? -1 : 1
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function sortIncidents(incidents: IncidentReport[]) {
  return [...incidents].sort((a, b) => {
    if (a.flagged_for_review !== b.flagged_for_review) {
      return a.flagged_for_review ? -1 : 1
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function partitionEvents(events: DisciplineEvent[]) {
  const open = events.filter((e) =>
    ['open', 'under_review', 'carried_forward'].includes(e.status)
  )
  const closed = events.filter((e) => e.status === 'closed')
  return { open, closed }
}

export const EVENT_STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  under_review: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  closed: 'bg-muted text-muted-foreground',
  carried_forward: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
}

export const REPORT_STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  reviewed: 'bg-green-500/10 text-green-700 dark:text-green-300',
  closed: 'bg-muted text-muted-foreground',
}

export function buildIncidentsUrl(params: {
  create?: boolean
  eventId?: string | null
  reportId?: string | null
  incidentId?: string | null
  inbox?: 'special' | 'incidents' | null
  archive?: boolean
}) {
  const search = new URLSearchParams()
  if (params.create) search.set('create', '1')
  if (params.eventId) search.set('event', params.eventId)
  if (params.reportId) search.set('report', params.reportId)
  if (params.incidentId) search.set('incident', params.incidentId)
  if (params.inbox === 'special') search.set('inbox', 'special')
  if (params.inbox === 'incidents') search.set('inbox', 'incidents')
  if (params.archive) search.set('archive', '1')
  const qs = search.toString()
  return qs ? `/incidents?${qs}` : '/incidents'
}

/** @deprecated Use buildIncidentsUrl */
export function buildEventsUrl(params: {
  create?: boolean
  eventId?: string | null
  reportId?: string | null
  incidentId?: string | null
  inbox?: 'special' | 'incidents' | null
}) {
  return buildIncidentsUrl(params)
}
