'use client'

import InspectionStatusBubblePicker from './InspectionStatusBubblePicker'
import { type InspectionStatus } from '../constants'
import { isDeficiencyStatus } from '../lib/inspection-form-layout'

type InspectionItemCardProps = {
  itemKey: string
  label: string
  mode: 'edit' | 'view'
  status: InspectionStatus | string
  notes?: string | null
  onStatusChange?: (status: InspectionStatus) => void
  onNotesChange?: (notes: string) => void
}

export default function InspectionItemCard({
  itemKey,
  label,
  mode,
  status,
  notes,
  onStatusChange,
  onNotesChange,
}: InspectionItemCardProps) {
  const deficient = isDeficiencyStatus(String(status))
  const hasNotes = Boolean(notes?.trim())

  return (
    <div
      className={[
        'rounded-lg border p-3 space-y-2',
        deficient ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/60 bg-background',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {label.trim() ? (
          <span className="text-sm font-medium leading-snug">{label}</span>
        ) : null}
        {mode === 'edit' && onStatusChange ? (
          <InspectionStatusBubblePicker
            name={`status-${itemKey}`}
            value={status as InspectionStatus}
            onChange={onStatusChange}
          />
        ) : mode === 'view' ? (
          <span
            className={[
              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold font-mono',
              label.trim() ? 'ml-auto' : '',
              deficient ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {status}
          </span>
        ) : null}
      </div>

      {mode === 'edit' && onNotesChange ? (
        <input
          type="text"
          value={notes ?? ''}
          onChange={(e) => onNotesChange(e.target.value)}
          className="input-base w-full text-sm min-h-[2.75rem]"
          placeholder="Notes (optional)..."
        />
      ) : mode === 'view' && hasNotes ? (
        <p className="text-sm text-muted-foreground">{notes}</p>
      ) : null}
    </div>
  )
}
