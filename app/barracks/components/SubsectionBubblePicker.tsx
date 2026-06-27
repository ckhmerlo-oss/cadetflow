'use client'

import type { InspectionSubsection } from '../lib/inspection-form-layout'

type SubsectionBubblePickerProps = {
  options: InspectionSubsection[]
  value: InspectionSubsection
  onChange?: (value: InspectionSubsection) => void
  name: string
  locked?: boolean
}

export default function SubsectionBubblePicker({
  options,
  value,
  onChange,
  name,
  locked = false,
}: SubsectionBubblePickerProps) {
  const labels: Record<InspectionSubsection, string> = {
    left: 'Left',
    right: 'Right',
    top: 'Top',
    bottom: 'Bottom',
  }

  if (options.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="radiogroup"
      aria-label={`${name} side`}
    >
      {options.map((option) => {
        const selected = value === option
        const interactive = !locked && onChange

        return (
          <label
            key={option}
            className={[
              'select-none rounded-full border px-3 py-1.5 text-xs font-semibold leading-none min-h-[2.25rem] inline-flex items-center justify-center transition-colors',
              interactive ? 'cursor-pointer' : 'cursor-default',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground',
              interactive && !selected ? 'hover:border-primary/40 hover:text-foreground' : '',
            ].join(' ')}
          >
            {interactive ? (
              <input
                type="radio"
                name={name}
                value={option}
                checked={selected}
                onChange={() => onChange!(option)}
                className="sr-only"
              />
            ) : null}
            {labels[option]}
          </label>
        )
      })}
    </div>
  )
}
