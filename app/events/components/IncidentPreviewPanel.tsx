'use client'

import { useEffect, useState } from 'react'
import {
  IncidentReport,
  resolveAsHandled,
  convertToDemerit,
  toggleIncidentFlag,
} from '@/app/incidents/actions'
import SearchableSelect from '@/app/components/SearchableSelect'
import type { DisciplineEvent } from '../actions'
import FilingEventLinkageSection from './FilingEventLinkageSection'
import { formatPersonName } from '../lib/organizer'

export default function IncidentPreviewPanel({
  incident: initialIncident,
  events,
  userRoleLevel,
  facultyList,
  offenseTypes,
  onRefresh,
  onFiledToEvent,
  onUnlinked,
  onOpenEvent,
}: {
  incident: IncidentReport
  events: DisciplineEvent[]
  userRoleLevel: number
  facultyList: { id: string; label: string }[]
  offenseTypes: { id: string; label: string; demerits: number; group: string }[]
  onRefresh: () => void
  onFiledToEvent: (eventId: string) => void
  onUnlinked: () => void
  onOpenEvent?: (eventId: string) => void
}) {
  const [incident, setIncident] = useState(initialIncident)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'view' | 'resolve' | 'convert'>('view')
  const [notes, setNotes] = useState('')
  const [handledBy, setHandledBy] = useState('')
  const [offenseId, setOffenseId] = useState('')

  useEffect(() => {
    setIncident(initialIncident)
  }, [initialIncident])

  const formattedOffenses = offenseTypes.map((o) => ({
    ...o,
    label: `${o.label} (${o.demerits} Dem)`,
  }))

  const getStatusBadge = (status: string) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
    if (status === 'handled') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    return 'bg-destructive/10 text-destructive'
  }

  const handleToggleFlag = async () => {
    setLoading(true)
    const result = await toggleIncidentFlag(incident.id)
    setLoading(false)
    if (result.error) {
      alert(result.error)
      return
    }
    setIncident((prev) => ({
      ...prev,
      flagged_for_review: result.flagged ?? !prev.flagged_for_review,
    }))
    onRefresh()
  }

  const handleResolve = async () => {
    setLoading(true)
    const { error } = await resolveAsHandled(incident.id, notes, handledBy)
    if (error) alert(error)
    else onRefresh()
    setLoading(false)
  }

  const handleConvert = async () => {
    setLoading(true)
    const { error } = await convertToDemerit(incident.id, offenseId, notes)
    if (error) alert(error)
    else onRefresh()
    setLoading(false)
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Incident report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted {new Date(incident.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userRoleLevel >= 65 && (
            <button
              type="button"
              disabled={loading}
              onClick={handleToggleFlag}
              className={`text-sm px-3 py-2 rounded border disabled:opacity-50 ${
                incident.flagged_for_review
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {incident.flagged_for_review ? 'Unflag' : 'Flag for review'}
            </button>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(incident.status)}`}>
            {incident.status}
          </span>
        </div>
      </div>

      {incident.flagged_for_review && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
          Flagged for review
        </span>
      )}

      <section className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Subject</h3>
          <p className="font-medium">{formatPersonName(incident.subject)}</p>
          <p className="text-muted-foreground">{incident.subject.company?.company_name}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Reporter</h3>
          <p className="font-medium">{formatPersonName(incident.reporter)}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase">Time & location</h3>
          <p>{new Date(incident.incident_time).toLocaleString()}</p>
          <p className="text-muted-foreground">{incident.location}</p>
        </div>
      </section>

      <section className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Description</h3>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{incident.description}</p>
        {incident.action_taken && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-1">Immediate action</h3>
            <p className="text-sm italic">{incident.action_taken}</p>
          </div>
        )}
      </section>

      {userRoleLevel >= 65 && (
        <FilingEventLinkageSection
          filingKind="incident"
          filingId={incident.id}
          currentEventId={incident.event_id ?? null}
          currentEventTitle={incident.event?.title}
          events={events}
          onLinked={(eventId) => {
            onFiledToEvent(eventId)
            onRefresh()
          }}
          onUnlinked={() => {
            onUnlinked()
            onRefresh()
          }}
          onOpenEvent={onOpenEvent}
        />
      )}

      {incident.status !== 'pending' && (
        <section className="bg-card border border-border rounded-lg p-6 text-sm">
          <h3 className="font-semibold mb-3">Resolution</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <dt className="text-muted-foreground">Resolved by</dt>
              <dd className="font-medium">{incident.resolver?.last_name ?? 'System'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">
                {incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : '—'}
              </dd>
            </div>
            {incident.resolution_notes && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Notes</dt>
                <dd>{incident.resolution_notes}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {incident.status === 'pending' && userRoleLevel >= 65 && (
        <section className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Process incident</h3>
          {mode === 'view' && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode('resolve')}
                className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm"
              >
                Mark handled
              </button>
              <button
                type="button"
                onClick={() => setMode('convert')}
                className="flex-1 min-w-[140px] bg-destructive hover:bg-destructive/90 text-destructive-foreground py-2.5 rounded-lg font-bold text-sm"
              >
                Convert to demerits
              </button>
            </div>
          )}
          {mode === 'resolve' && (
            <div className="space-y-3">
              <SearchableSelect
                label="Handled by"
                options={facultyList}
                value={handledBy}
                onChange={setHandledBy}
              />
              <textarea
                placeholder="Resolution notes..."
                className="input-base"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setMode('view')} className="text-sm text-muted-foreground">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={loading || !notes}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
          {mode === 'convert' && (
            <div className="space-y-3">
              <SearchableSelect
                label="Infraction"
                options={formattedOffenses}
                value={offenseId}
                onChange={setOffenseId}
              />
              <textarea
                placeholder="Official report description..."
                className="input-base"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setMode('view')} className="text-sm text-muted-foreground">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={loading || !notes || !offenseId}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                >
                  Create report
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
