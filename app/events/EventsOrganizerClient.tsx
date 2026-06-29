'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IncidentReport } from '@/app/incidents/actions'
import type { SpecialReport } from '@/app/special-reports/actions'
import type { DisciplineEvent, EventDetail, IncidentPreviewContext, EventResolutionOffense } from './actions'
import EventsNavigator from './components/EventsNavigator'
import FilingsListColumn from './components/FilingsListColumn'
import ResolvedFilingsArchiveColumn from './components/ResolvedFilingsArchiveColumn'
import NewEventPanel from './components/NewEventPanel'
import EventPreviewPanel from './components/EventPreviewPanel'
import SpecialReportPreviewPanel from './components/SpecialReportPreviewPanel'
import IncidentPreviewPanel from './components/IncidentPreviewPanel'
import {
  buildIncidentsUrl,
  type MobilePane,
  type NavigatorSelection,
} from './lib/organizer'

type InitialParams = {
  create?: boolean
  eventId?: string | null
  reportId?: string | null
  incidentId?: string | null
  inbox?: 'special' | 'incidents' | null
  archive?: boolean
}

export default function EventsOrganizerClient({
  events,
  unlinkedReports,
  unlinkedIncidents,
  resolvedFilings,
  eventDetail,
  highlightReport,
  incidentPreview,
  roleLevel,
  resolutionOffenses,
  initialParams,
}: {
  events: DisciplineEvent[]
  unlinkedReports: SpecialReport[]
  unlinkedIncidents: IncidentReport[]
  resolvedFilings: { incidents: IncidentReport[]; specialReports: SpecialReport[] }
  eventDetail: EventDetail | null
  highlightReport: SpecialReport | null
  incidentPreview: IncidentPreviewContext | null
  roleLevel: number
  resolutionOffenses: EventResolutionOffense[]
  initialParams: InitialParams
}) {
  const router = useRouter()

  const resolveNavigator = useCallback((): NavigatorSelection => {
    if (initialParams.archive) return { kind: 'resolvedArchive' }
    if (initialParams.eventId) return { kind: 'event', eventId: initialParams.eventId }
    if (initialParams.reportId) {
      const report =
        highlightReport ??
        unlinkedReports.find((r) => r.id === initialParams.reportId) ??
        resolvedFilings.specialReports.find((r) => r.id === initialParams.reportId)
      if (report?.event_id) return { kind: 'event', eventId: report.event_id }
      if (resolvedFilings.specialReports.some((r) => r.id === initialParams.reportId)) {
        return { kind: 'resolvedArchive' }
      }
      return { kind: 'specialReports' }
    }
    if (initialParams.incidentId) {
      const incident =
        incidentPreview?.incident ??
        unlinkedIncidents.find((i) => i.id === initialParams.incidentId) ??
        resolvedFilings.incidents.find((i) => i.id === initialParams.incidentId)
      if (incident?.event_id) return { kind: 'event', eventId: incident.event_id }
      if (resolvedFilings.incidents.some((i) => i.id === initialParams.incidentId)) {
        return { kind: 'resolvedArchive' }
      }
      return { kind: 'incidentReports' }
    }
    if (initialParams.inbox === 'incidents') return { kind: 'incidentReports' }
    return { kind: 'specialReports' }
  }, [
    highlightReport,
    incidentPreview,
    initialParams.archive,
    initialParams.eventId,
    initialParams.incidentId,
    initialParams.inbox,
    initialParams.reportId,
    resolvedFilings.incidents,
    resolvedFilings.specialReports,
    unlinkedIncidents,
    unlinkedReports,
  ])

  const [navigatorSelection, setNavigatorSelection] = useState<NavigatorSelection>(resolveNavigator)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialParams.reportId ?? null
  )
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    initialParams.incidentId ?? null
  )
  const [showCreate, setShowCreate] = useState(initialParams.create ?? false)
  const [mobilePane, setMobilePane] = useState<MobilePane>('navigator')

  useEffect(() => {
    setNavigatorSelection(resolveNavigator())
    setSelectedReportId(initialParams.reportId ?? null)
    setSelectedIncidentId(initialParams.incidentId ?? null)
    setShowCreate(initialParams.create ?? false)
  }, [
    initialParams.create,
    initialParams.eventId,
    initialParams.incidentId,
    initialParams.inbox,
    initialParams.archive,
    initialParams.reportId,
    resolveNavigator,
  ])

  const activeEventId =
    navigatorSelection.kind === 'event' ? navigatorSelection.eventId : null

  const activeEventDetail = useMemo(() => {
    if (!activeEventId) return null
    if (eventDetail?.id === activeEventId) return eventDetail
    return null
  }, [activeEventId, eventDetail])

  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null
    if (highlightReport?.id === selectedReportId) return highlightReport
    const fromUnlinked = unlinkedReports.find((r) => r.id === selectedReportId)
    if (fromUnlinked) return fromUnlinked
    const fromArchive = resolvedFilings.specialReports.find((r) => r.id === selectedReportId)
    if (fromArchive) return fromArchive
    return activeEventDetail?.special_reports.find((r) => r.id === selectedReportId) ?? null
  }, [activeEventDetail, highlightReport, resolvedFilings.specialReports, selectedReportId, unlinkedReports])

  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null
    if (incidentPreview?.incident.id === selectedIncidentId) return incidentPreview.incident
    const fromUnlinked = unlinkedIncidents.find((i) => i.id === selectedIncidentId)
    if (fromUnlinked) return fromUnlinked
    const fromArchive = resolvedFilings.incidents.find((i) => i.id === selectedIncidentId)
    if (fromArchive) return fromArchive
    return activeEventDetail?.incidents.find((i) => i.id === selectedIncidentId) ?? null
  }, [activeEventDetail, incidentPreview, resolvedFilings.incidents, selectedIncidentId, unlinkedIncidents])

  const syncUrl = useCallback(
    (next: {
      create?: boolean
      eventId?: string | null
      reportId?: string | null
      incidentId?: string | null
      inbox?: 'special' | 'incidents' | null
      archive?: boolean
    }) => {
      router.replace(
        buildIncidentsUrl({
          create: next.create,
          eventId: next.eventId,
          reportId: next.reportId,
          incidentId: next.incidentId,
          inbox: next.inbox,
          archive: next.archive,
        }),
        { scroll: false }
      )
    },
    [router]
  )

  const handleRefresh = () => router.refresh()

  const handleNewEvent = () => {
    setShowCreate(true)
    setSelectedReportId(null)
    setSelectedIncidentId(null)
    setMobilePane('preview')
    syncUrl({ create: true })
  }

  const handleSelectSpecialReports = () => {
    setNavigatorSelection({ kind: 'specialReports' })
    setShowCreate(false)
    setSelectedReportId(null)
    setSelectedIncidentId(null)
    setMobilePane('filings')
    syncUrl({ inbox: 'special' })
  }

  const handleSelectIncidentReports = () => {
    setNavigatorSelection({ kind: 'incidentReports' })
    setShowCreate(false)
    setSelectedReportId(null)
    setSelectedIncidentId(null)
    setMobilePane('filings')
    syncUrl({ inbox: 'incidents' })
  }

  const handleSelectResolvedArchive = () => {
    setNavigatorSelection({ kind: 'resolvedArchive' })
    setShowCreate(false)
    setSelectedReportId(null)
    setSelectedIncidentId(null)
    setMobilePane('filings')
    syncUrl({ archive: true })
  }

  const handleSelectEvent = (eventId: string) => {
    setNavigatorSelection({ kind: 'event', eventId })
    setShowCreate(false)
    setSelectedReportId(null)
    setSelectedIncidentId(null)
    setMobilePane('filings')
    syncUrl({ eventId })
  }

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setSelectedIncidentId(null)
    setShowCreate(false)
    setMobilePane('preview')
    const report =
      unlinkedReports.find((r) => r.id === reportId) ??
      resolvedFilings.specialReports.find((r) => r.id === reportId) ??
      activeEventDetail?.special_reports.find((r) => r.id === reportId)
    syncUrl({
      eventId: report?.event_id ?? activeEventId,
      reportId,
      archive: navigatorSelection.kind === 'resolvedArchive' ? true : undefined,
    })
  }

  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId)
    setSelectedReportId(null)
    setShowCreate(false)
    setMobilePane('preview')
    const incident =
      unlinkedIncidents.find((i) => i.id === incidentId) ??
      resolvedFilings.incidents.find((i) => i.id === incidentId) ??
      activeEventDetail?.incidents.find((i) => i.id === incidentId)
    syncUrl({
      eventId: incident?.event_id ?? activeEventId,
      incidentId,
      archive: navigatorSelection.kind === 'resolvedArchive' ? true : undefined,
    })
  }

  const handleCreatedEvent = (eventId: string) => {
    setShowCreate(false)
    setNavigatorSelection({ kind: 'event', eventId })
    setMobilePane('filings')
    syncUrl({ eventId })
    handleRefresh()
  }

  const handleFiledToEvent = (eventId: string) => {
    setNavigatorSelection({ kind: 'event', eventId })
    setSelectedReportId(null)
    setSelectedIncidentId(null)
    setMobilePane('filings')
    syncUrl({ eventId })
  }

  const handleReportUnlinked = () => {
    setNavigatorSelection({ kind: 'specialReports' })
    setSelectedReportId(null)
    setMobilePane('filings')
    syncUrl({ inbox: 'special' })
  }

  const handleIncidentUnlinked = () => {
    setNavigatorSelection({ kind: 'incidentReports' })
    setSelectedIncidentId(null)
    setMobilePane('filings')
    syncUrl({ inbox: 'incidents' })
  }

  const previewContent = () => {
    if (showCreate) {
      return <NewEventPanel onCreated={handleCreatedEvent} />
    }
    if (selectedReport) {
      return (
        <SpecialReportPreviewPanel
          report={selectedReport}
          events={events}
          onRefresh={handleRefresh}
          onFiledToEvent={handleFiledToEvent}
          onUnlinked={handleReportUnlinked}
          onOpenEvent={handleSelectEvent}
        />
      )
    }
    if (selectedIncident) {
      const ctx =
        incidentPreview?.incident.id === selectedIncident.id
          ? incidentPreview
          : {
              incident: selectedIncident,
              facultyList: [] as { id: string; label: string }[],
              offenseTypes: [] as { id: string; label: string; demerits: number; group: string }[],
            }
      return (
        <IncidentPreviewPanel
          incident={ctx.incident}
          events={events}
          userRoleLevel={roleLevel}
          facultyList={ctx.facultyList}
          offenseTypes={ctx.offenseTypes}
          onRefresh={handleRefresh}
          onFiledToEvent={handleFiledToEvent}
          onUnlinked={handleIncidentUnlinked}
          onOpenEvent={handleSelectEvent}
        />
      )
    }
    if (activeEventDetail) {
      return <EventPreviewPanel event={activeEventDetail} offenses={resolutionOffenses} onRefresh={handleRefresh} />
    }
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
        Select Special Reports, Incident Reports, an event, or create a new event to begin review.
      </div>
    )
  }

  const paneClass = (pane: MobilePane) =>
    pane === mobilePane ? 'flex flex-col min-h-0 h-full' : 'hidden lg:flex lg:flex-col lg:min-h-0 lg:h-full'

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[32rem]">
      {mobilePane !== 'navigator' && (
        <div className="lg:hidden mb-2">
          <button
            type="button"
            onClick={() =>
              setMobilePane(mobilePane === 'preview' ? 'filings' : 'navigator')
            }
            className="text-sm text-primary hover:underline"
          >
            ← Back
          </button>
        </div>
      )}

      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={`${paneClass('navigator')} lg:col-span-1 border border-border rounded-lg bg-card/50 p-3`}>
          <EventsNavigator
            events={events}
            specialReportsCount={unlinkedReports.length}
            incidentReportsCount={unlinkedIncidents.length}
            resolvedCount={resolvedFilings.incidents.length + resolvedFilings.specialReports.length}
            selection={navigatorSelection}
            onSelectSpecialReports={handleSelectSpecialReports}
            onSelectIncidentReports={handleSelectIncidentReports}
            onSelectResolvedArchive={handleSelectResolvedArchive}
            onSelectEvent={handleSelectEvent}
            onNewEvent={handleNewEvent}
          />
        </div>

        <div className={`${paneClass('filings')} lg:col-span-1 border border-border rounded-lg bg-card/50 p-3`}>
          {navigatorSelection.kind === 'resolvedArchive' ? (
            <ResolvedFilingsArchiveColumn
              navigatorSelection={navigatorSelection}
              incidents={resolvedFilings.incidents}
              specialReports={resolvedFilings.specialReports}
              selectedReportId={selectedReportId}
              selectedIncidentId={selectedIncidentId}
              onSelectReport={handleSelectReport}
              onSelectIncident={handleSelectIncident}
            />
          ) : (
            <FilingsListColumn
              navigatorSelection={navigatorSelection}
              unlinkedReports={unlinkedReports}
              unlinkedIncidents={unlinkedIncidents}
              eventDetail={activeEventDetail}
              selectedReportId={selectedReportId}
              selectedIncidentId={selectedIncidentId}
              onSelectReport={handleSelectReport}
              onSelectIncident={handleSelectIncident}
            />
          )}
        </div>

        <div
          className={`${paneClass('preview')} lg:col-span-2 border border-border rounded-lg bg-card p-4 sm:p-6`}
        >
          {previewContent()}
        </div>
      </div>
    </div>
  )
}
