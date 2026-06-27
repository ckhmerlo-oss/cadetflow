'use client'

import {
  INSPECTION_STATUS_PICKER_STATUSES,
  type InspectionStatus,
} from '../constants'

const STATUS_LABELS: Record<InspectionStatus, string> = {
  INS: 'Inspected',
  DAM: 'Damaged',
  CLN: 'Needs cleaning',
  FIX: 'Repair',
  REP: 'Replace',
  MIS: 'Missing',
  OTH: 'Other',
  'N/A': 'Not assessed',
}

type InspectionStatusBubblePickerProps = {
  value: InspectionStatus
  onChange: (status: InspectionStatus) => void
  name: string
}

export default function InspectionStatusBubblePicker({
  value,
  onChange,
  name,
}: InspectionStatusBubblePickerProps) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={`Status for ${name}`}>
      {INSPECTION_STATUS_PICKER_STATUSES.map((status) => {
        const selected = value === status
        return (
          <label
            key={status}
            title={STATUS_LABELS[status]}
            className={[
              'cursor-pointer select-none rounded-full border px-2.5 py-1.5 text-xs font-medium leading-none transition-colors min-h-[2.25rem] min-w-[2.25rem] inline-flex items-center justify-center',
              selected
                ? status === 'INS'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : status === 'N/A'
                    ? 'border-muted-foreground/40 bg-muted text-muted-foreground'
                    : 'border-amber-600 bg-amber-600 text-white'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
            ].join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={status}
              checked={selected}
              onChange={() => onChange(status)}
              className="sr-only"
            />
            {status}
          </label>
        )
      })}
    </div>
  )
}
