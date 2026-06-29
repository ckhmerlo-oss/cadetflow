'use client'

import { useMemo, useState } from 'react'
import type { IncidentReport } from '@/app/incidents/actions'
import type { SpecialReport } from '@/app/special-reports/actions'
import {
  formatPersonName,
  REPORT_STATUS_STYLES,
  type NavigatorSelection,
} from '../lib/organizer'

type ArchiveRow =
  | { kind: 'incident'; item: IncidentReport; sortDate: string }
  | { kind: 'report'; item: SpecialReport; sortDate: string }

type FilterType = 'all' | 'type' | 'status' | 'date_range' | 'subject'
type SortDirection = 'asc' | 'desc'

function formatStatusLabel(status: string) {
  return status.replace('_', ' ')
}

export default function ResolvedFilingsArchiveColumn({
  incidents,
  specialReports,
  selectedReportId,
  selectedIncidentId,
  onSelectReport,
  onSelectIncident,
}: {
  navigatorSelection: NavigatorSelection
  incidents: IncidentReport[]
  specialReports: SpecialReport[]
  selectedReportId: string | null
  selectedIncidentId: string | null
  onSelectReport: (reportId: string) => void
  onSelectIncident: (incidentId: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const allRows: ArchiveRow[] = useMemo(() => {
    const incidentRows: ArchiveRow[] = incidents.map((item) => ({
      kind: 'incident' as const,
      item,
      sortDate: item.resolved_at ?? item.created_at,
    }))
    const reportRows: ArchiveRow[] = specialReports.map((item) => ({
      kind: 'report' as const,
      item,
      sortDate: item.reviewed_at ?? item.created_at,
    }))
    return [...incidentRows, ...reportRows]
  }, [incidents, specialReports])

  const uniqueSubjects = useMemo(() => {
    const names = new Set<string>()
    for (const row of allRows) {
      if (row.kind === 'incident') {
        names.add(formatPersonName(row.item.subject))
      } else {
        names.add(formatPersonName(row.item.submitter))
      }
    }
    return [...names].sort()
  }, [allRows])

  const filteredRows = useMemo(() => {
    let rows = allRows

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      rows = rows.filter((row) => {
        if (row.kind === 'incident') {
          const inc = row.item
          return (
            formatPersonName(inc.subject).toLowerCase().includes(q) ||
            formatPersonName(inc.reporter).toLowerCase().includes(q) ||
            inc.location.toLowerCase().includes(q) ||
            inc.description.toLowerCase().includes(q) ||
            inc.status.toLowerCase().includes(q)
          )
        }
        const rep = row.item
        return (
          formatPersonName(rep.submitter).toLowerCase().includes(q) ||
          rep.location.toLowerCase().includes(q) ||
          rep.narrative.toLowerCase().includes(q) ||
          rep.status.toLowerCase().includes(q)
        )
      })
    }

    if (filterType === 'type' && filterValue) {
      rows = rows.filter((row) => row.kind === filterValue)
    }

    if (filterType === 'status' && filterValue) {
      rows = rows.filter((row) => row.item.status === filterValue)
    }

    if (filterType === 'subject' && filterValue) {
      rows = rows.filter((row) => {
        const name =
          row.kind === 'incident'
            ? formatPersonName(row.item.subject)
            : formatPersonName(row.item.submitter)
        return name === filterValue
      })
    }

    if (filterType === 'date_range') {
      if (startDate) {
        const start = new Date(startDate).getTime()
        rows = rows.filter((row) => new Date(row.sortDate).getTime() >= start)
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 86400000
        rows = rows.filter((row) => new Date(row.sortDate).getTime() < end)
      }
    }

    return [...rows].sort((a, b) => {
      const diff = new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime()
      return sortDirection === 'desc' ? -diff : diff
    })
  }, [allRows, searchTerm, filterType, filterValue, startDate, endDate, sortDirection])

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 mb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Resolved filings</h2>
          <button
            type="button"
            onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Date {sortDirection === 'desc' ? '↓' : '↑'}
          </button>
        </div>
        <input
          type="search"
          placeholder="Quick search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-base text-sm w-full"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as FilterType)
              setFilterValue('')
              setStartDate('')
              setEndDate('')
            }}
            className="input-base text-xs flex-1 min-w-[100px]"
          >
            <option value="all">All filters</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
            <option value="subject">Subject / submitter</option>
            <option value="date_range">Date range</option>
          </select>
          {filterType === 'type' && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="input-base text-xs flex-1 min-w-[100px]"
            >
              <option value="">All types</option>
              <option value="incident">Incident</option>
              <option value="report">Special report</option>
            </select>
          )}
          {filterType === 'status' && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="input-base text-xs flex-1 min-w-[100px]"
            >
              <option value="">All statuses</option>
              <option value="handled">Handled</option>
              <option value="converted">Converted</option>
              <option value="reviewed">Reviewed</option>
              <option value="closed">Closed</option>
            </select>
          )}
          {filterType === 'subject' && (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="input-base text-xs flex-1 min-w-[100px]"
            >
              <option value="">Select person</option>
              {uniqueSubjects.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
          {filterType === 'date_range' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-base text-xs"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-base text-xs"
              />
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredRows.length} of {allRows.length} resolved without event
        </p>
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resolved filings match your filters.</p>
      ) : (
        <ul className="flex-1 min-h-0 overflow-y-auto space-y-1">
          {filteredRows.map((row) => {
            if (row.kind === 'incident') {
              const incident = row.item
              return (
                <li key={`i-${incident.id}`}>
                  <button
                    type="button"
                    onClick={() => onSelectIncident(incident.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                      selectedIncidentId === incident.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:bg-muted/40 opacity-90'
                    }`}
                  >
                    <p className="text-[10px] font-bold text-destructive uppercase">Incident</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatPersonName(incident.subject)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{incident.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {incident.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(row.sortDate).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                </li>
              )
            }

            const report = row.item
            return (
              <li key={`r-${report.id}`}>
                <button
                  type="button"
                  onClick={() => onSelectReport(report.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                    selectedReportId === report.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/40 opacity-90'
                  }`}
                >
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                    Special report
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {formatPersonName(report.submitter)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{report.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${REPORT_STATUS_STYLES[report.status] ?? 'bg-muted'}`}
                    >
                      {formatStatusLabel(report.status)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(row.sortDate).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
