'use client'

import { useState } from 'react'
import type { DisciplineEvent } from '../actions'
import {
  EVENT_STATUS_STYLES,
  formatPersonName,
  partitionEvents,
  type NavigatorSelection,
} from '../lib/organizer'

export default function EventsNavigator({
  events,
  specialReportsCount,
  incidentReportsCount,
  resolvedCount,
  selection,
  onSelectSpecialReports,
  onSelectIncidentReports,
  onSelectResolvedArchive,
  onSelectEvent,
  onNewEvent,
}: {
  events: DisciplineEvent[]
  specialReportsCount: number
  incidentReportsCount: number
  resolvedCount: number
  selection: NavigatorSelection
  onSelectSpecialReports: () => void
  onSelectIncidentReports: () => void
  onSelectResolvedArchive: () => void
  onSelectEvent: (eventId: string) => void
  onNewEvent: () => void
}) {
  const [closedOpen, setClosedOpen] = useState(false)
  const [resolvedOpen, setResolvedOpen] = useState(false)
  const { open, closed } = partitionEvents(events)

  const isSpecialReportsSelected = selection.kind === 'specialReports'
  const isIncidentReportsSelected = selection.kind === 'incidentReports'
  const isResolvedSelected = selection.kind === 'resolvedArchive'
  const selectedEventId = selection.kind === 'event' ? selection.eventId : null
  return (
    <div className="flex flex-col h-full min-h-0">
      <button
        type="button"
        onClick={onNewEvent}
        className="w-full btn-primary font-bold text-sm mb-3 shrink-0"
      >
        + New Event
      </button>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2">
            Inbox
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onSelectSpecialReports}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                isSpecialReportsSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-foreground">Special Reports</span>
                {specialReportsCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {specialReportsCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unfiled cadet affidavits awaiting review
              </p>
            </button>

            <button
              type="button"
              onClick={onSelectIncidentReports}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                isIncidentReportsSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-foreground">Incident Reports</span>
                {incidentReportsCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {incidentReportsCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unfiled faculty incident reports
              </p>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2">
            Events
          </h2>
          {open.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1 py-2">No open events.</p>
          ) : (
            <ul className="space-y-1">
              {open.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(event.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                      selectedEventId === event.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-2">{event.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${EVENT_STATUS_STYLES[event.status] ?? 'bg-muted'}`}
                      >
                        {event.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(event.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {event.creator && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatPersonName(event.creator)}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {closed.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setClosedOpen((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2 hover:text-foreground"
            >
              <span>Closed ({closed.length})</span>
              <span>{closedOpen ? '−' : '+'}</span>
            </button>
            {closedOpen && (
              <ul className="space-y-1">
                {closed.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(event.id)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                        selectedEventId === event.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/40 opacity-80'
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {event.closed_at
                          ? `Closed ${new Date(event.closed_at).toLocaleDateString()}`
                          : event.school_year}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section>
          <button
            type="button"
            onClick={() => {
              setResolvedOpen((v) => !v)
              if (!resolvedOpen) onSelectResolvedArchive()
            }}
            className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2 hover:text-foreground"
          >
            <span>Resolved ({resolvedCount})</span>
            <span>{resolvedOpen ? '−' : '+'}</span>
          </button>
          {resolvedOpen && (
            <button
              type="button"
              onClick={onSelectResolvedArchive}
              className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                isResolvedSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/40 opacity-80'
              }`}
            >
              <p className="text-sm font-medium text-foreground">Resolved archive</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Handled filings not linked to an event
              </p>
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
