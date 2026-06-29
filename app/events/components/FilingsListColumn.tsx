'use client'

import type { IncidentReport } from '@/app/incidents/actions'
import type { SpecialReport } from '@/app/special-reports/actions'
import type { EventDetail } from '../actions'
import {
  formatPersonName,
  REPORT_STATUS_STYLES,
  sortIncidents,
  sortSpecialReports,
  type NavigatorSelection,
} from '../lib/organizer'

type FilingRow =
  | { kind: 'report'; item: SpecialReport }
  | { kind: 'incident'; item: IncidentReport }

function FlagIcon({ flagged }: { flagged?: boolean }) {
  if (!flagged) return null
  return (
    <span className="text-amber-600 dark:text-amber-400 shrink-0" title="Flagged for review">
      ⚑
    </span>
  )
}

function IncidentStatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
        pending
      </span>
    )
  }
  return <span className="text-[10px] text-muted-foreground">{status}</span>
}

export default function FilingsListColumn({
  navigatorSelection,
  unlinkedReports,
  unlinkedIncidents,
  eventDetail,
  selectedReportId,
  selectedIncidentId,
  onSelectReport,
  onSelectIncident,
}: {
  navigatorSelection: NavigatorSelection
  unlinkedReports: SpecialReport[]
  unlinkedIncidents: IncidentReport[]
  eventDetail: EventDetail | null
  selectedReportId: string | null
  selectedIncidentId: string | null
  onSelectReport: (reportId: string) => void
  onSelectIncident: (incidentId: string) => void
}) {
  if (navigatorSelection.kind === 'specialReports') {
    const reports = sortSpecialReports(unlinkedReports)

    return (
      <div className="flex flex-col h-full min-h-0">
        <h2 className="text-sm font-semibold text-foreground mb-2 shrink-0">Special Reports</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No unfiled special reports.</p>
        ) : (
          <ul className="flex-1 min-h-0 overflow-y-auto space-y-1">
            {reports.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  onClick={() => onSelectReport(report.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                    selectedReportId === report.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FlagIcon flagged={report.flagged_for_review} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatPersonName(report.submitter)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{report.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${REPORT_STATUS_STYLES[report.status] ?? 'bg-muted'}`}
                        >
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (navigatorSelection.kind === 'incidentReports') {
    const incidents = sortIncidents(unlinkedIncidents)

    return (
      <div className="flex flex-col h-full min-h-0">
        <h2 className="text-sm font-semibold text-foreground mb-2 shrink-0">Incident Reports</h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No unfiled incident reports.</p>
        ) : (
          <ul className="flex-1 min-h-0 overflow-y-auto space-y-1">
            {incidents.map((incident) => (
              <li key={incident.id}>
                <button
                  type="button"
                  onClick={() => onSelectIncident(incident.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                    selectedIncidentId === incident.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FlagIcon flagged={incident.flagged_for_review} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatPersonName(incident.subject)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{incident.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <IncidentStatusBadge status={incident.status} />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(incident.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (!eventDetail) {
    return (
      <p className="text-sm text-muted-foreground">Loading event filings...</p>
    )
  }

  const reports = sortSpecialReports(eventDetail.special_reports)
  const incidents = sortIncidents(eventDetail.incidents)
  const rows: FilingRow[] = [
    ...reports.map((item) => ({ kind: 'report' as const, item })),
    ...incidents.map((item) => ({ kind: 'incident' as const, item })),
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      <h2 className="text-sm font-semibold text-foreground mb-1 shrink-0 line-clamp-2">
        {eventDetail.title}
      </h2>
      <p className="text-xs text-muted-foreground mb-2 shrink-0">
        {rows.length} filing{rows.length === 1 ? '' : 's'}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No linked filings yet.</p>
      ) : (
        <ul className="flex-1 min-h-0 overflow-y-auto space-y-1">
          {reports.map((report) => (
            <li key={`r-${report.id}`}>
              <button
                type="button"
                onClick={() => onSelectReport(report.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                  selectedReportId === report.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FlagIcon flagged={report.flagged_for_review} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                      Special report
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatPersonName(report.submitter)}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${REPORT_STATUS_STYLES[report.status] ?? 'bg-muted'}`}
                    >
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {incidents.map((incident) => (
            <li key={`i-${incident.id}`}>
              <button
                type="button"
                onClick={() => onSelectIncident(incident.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                  selectedIncidentId === incident.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FlagIcon flagged={incident.flagged_for_review} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-destructive uppercase">Incident</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatPersonName(incident.subject)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{incident.location}</p>
                    <IncidentStatusBadge status={incident.status} />
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
