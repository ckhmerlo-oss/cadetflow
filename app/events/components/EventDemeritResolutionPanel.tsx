'use client'

import { useMemo, useState } from 'react'
import SearchableSelect, { type SelectOption } from '@/app/components/SearchableSelect'
import { formatOffenseOptionLabel } from '@/app/lib/blueBook'
import {
  resolveEventWithDemerits,
  type EventDemeritAssignment,
  type EventDetail,
  type EventResolutionOffense,
} from '../actions'
import { formatPersonName } from '../lib/organizer'

type AssignmentRow = {
  cadetId: string
  offenseTypeId: string
  notes: string
  explanation: string
}

function collectEventCadets(event: EventDetail): SelectOption[] {
  const map = new Map<string, SelectOption>()

  for (const report of event.special_reports) {
    if (report.submitter) {
      map.set(report.submitter_cadet_id, {
        id: report.submitter_cadet_id,
        label: `${formatPersonName(report.submitter)} (submitter)`,
      })
    }
    for (const subject of report.subjects ?? []) {
      map.set(subject.id, {
        id: subject.id,
        label: `${subject.last_name}, ${subject.first_name} (subject)`,
      })
    }
    if (report.subject && report.subject_cadet_id) {
      map.set(report.subject_cadet_id, {
        id: report.subject_cadet_id,
        label: `${formatPersonName(report.subject)} (subject)`,
      })
    }
  }

  for (const incident of event.incidents) {
    if (incident.subject) {
      map.set(incident.subject_cadet_id, {
        id: incident.subject_cadet_id,
        label: `${formatPersonName(incident.subject)} (incident subject)`,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function defaultDateFromEvent(event: EventDetail) {
  const candidates = [
    ...event.special_reports.map((r) => r.occurred_at),
    ...event.incidents.map((i) => i.incident_time),
  ]
    .filter(Boolean)
    .map((d) => new Date(d))

  const latest = candidates.sort((a, b) => b.getTime() - a.getTime())[0]
  if (!latest) return new Date().toISOString().split('T')[0]

  return latest.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

export default function EventDemeritResolutionPanel({
  event,
  offenses,
  onResolved,
}: {
  event: EventDetail
  offenses: EventResolutionOffense[]
  onResolved: () => void
}) {
  const cadetOptions = useMemo(() => collectEventCadets(event), [event])
  const offenseOptions: SelectOption[] = useMemo(
    () =>
      offenses.map((o) => ({
        id: o.id,
        label: formatOffenseOptionLabel(o.label, o.offense_code ?? '', o.policy_category, o.demerits),
        group: o.group,
      })),
    [offenses]
  )

  const [rows, setRows] = useState<AssignmentRow[]>([
    { cadetId: cadetOptions[0]?.id ?? '', offenseTypeId: '', notes: '', explanation: '' },
  ])
  const [dateOfOffense, setDateOfOffense] = useState(defaultDateFromEvent(event))
  const [closeNotes, setCloseNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateRow = (index: number, patch: Partial<AssignmentRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { cadetId: cadetOptions[0]?.id ?? '', offenseTypeId: '', notes: '', explanation: '' },
    ])
  }

  const removeRow = (index: number) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const handleSubmit = async () => {
    const assignments: EventDemeritAssignment[] = rows
      .filter((row) => row.cadetId && row.offenseTypeId && row.notes.trim())
      .map((row) => ({
        cadet_id: row.cadetId,
        offense_type_id: row.offenseTypeId,
        notes: row.notes.trim(),
        explanation: row.explanation.trim() || undefined,
      }))

    if (assignments.length === 0) {
      setError('Add at least one complete assignment (cadet, infraction, and green sheet summary).')
      return
    }

    setLoading(true)
    setError(null)
    const result = await resolveEventWithDemerits(
      event.id,
      assignments,
      dateOfOffense,
      closeNotes.trim() || undefined
    )
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onResolved()
  }

  if (cadetOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Link filings with named cadets before assigning demerits from this event.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Create demerit report(s) linked to this event, acknowledge open affidavits, and close the
        event. Reports enter the normal approval chain.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Date of offense</label>
        <input
          type="date"
          value={dateOfOffense}
          onChange={(e) => setDateOfOffense(e.target.value)}
          className="input-base max-w-xs"
        />
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Assignment {index + 1}
              </span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <SearchableSelect
              label="Subject cadet"
              options={cadetOptions}
              value={row.cadetId}
              onChange={(val) => updateRow(index, { cadetId: val })}
              placeholder="Select cadet..."
              required
            />
            <SearchableSelect
              label="Infraction"
              options={offenseOptions}
              value={row.offenseTypeId}
              onChange={(val) => updateRow(index, { offenseTypeId: val })}
              placeholder="Search infraction..."
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1">Green sheet summary</label>
              <input
                type="text"
                value={row.notes}
                onChange={(e) => updateRow(index, { notes: e.target.value })}
                maxLength={100}
                className="input-base"
                placeholder="Brief public summary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Report details (optional)</label>
              <textarea
                rows={3}
                value={row.explanation}
                onChange={(e) => updateRow(index, { explanation: e.target.value })}
                className="input-base text-sm"
                placeholder="Detailed narrative for staff and subject..."
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="text-sm text-primary font-medium hover:underline"
      >
        + Add another cadet
      </button>

      <div>
        <label className="block text-sm font-medium mb-1">Event close notes (optional)</label>
        <input
          type="text"
          value={closeNotes}
          onChange={(e) => setCloseNotes(e.target.value)}
          className="input-base"
          placeholder="Appended to event summary"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {loading ? 'Assigning...' : 'Assign demerits & close event'}
      </button>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
          {error}
        </p>
      )}
    </div>
  )
}
