'use client'

import { useRef } from 'react'
import {
  INSPECTION_PHOTO_MAX_COUNT,
  isInspectionPhotoUploadEnabled,
  validateInspectionPhotoFile,
  type PendingInspectionPhoto,
} from '../lib/inspection-attachments'

export type PhotoAttachStatusMessage = {
  type: 'success' | 'error' | 'info'
  message: string
}

type InspectionPhotoAttachProps = {
  label: string
  pendingPhotos: PendingInspectionPhoto[]
  maxPhotos?: number
  onAdd: (file: File) => void
  onRemove: (clientId: string) => void
  onValidationError?: (message: string) => void
  disabled?: boolean
  errorMessage?: string | null
  statusMessage?: PhotoAttachStatusMessage | null
}

export default function InspectionPhotoAttach({
  label,
  pendingPhotos,
  maxPhotos = INSPECTION_PHOTO_MAX_COUNT,
  onAdd,
  onRemove,
  onValidationError,
  disabled = false,
  errorMessage,
  statusMessage,
}: InspectionPhotoAttachProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadEnabled = isInspectionPhotoUploadEnabled()
  const atLimit = pendingPhotos.length >= maxPhotos

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (pendingPhotos.length >= maxPhotos) {
      onValidationError?.(`You can attach up to ${maxPhotos} photos.`)
      return
    }

    const validationError = validateInspectionPhotoFile(file)
    if (validationError) {
      onValidationError?.(validationError)
      return
    }

    onAdd(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || atLimit}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-50 sm:w-auto"
        >
          <span aria-hidden>📷</span>
          {label}
        </button>
        <span className="text-xs text-muted-foreground">
          {pendingPhotos.length}/{maxPhotos} photos
        </span>
        {!uploadEnabled && !disabled && (
          <span className="text-xs text-muted-foreground leading-snug">
            Preview only until photo storage is enabled (Day 12.2).
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {statusMessage && !errorMessage && (
        <p
          className={[
            'text-sm',
            statusMessage.type === 'success'
              ? 'text-emerald-700 dark:text-emerald-400'
              : statusMessage.type === 'error'
                ? 'text-destructive'
                : 'text-muted-foreground',
          ].join(' ')}
          role={statusMessage.type === 'error' ? 'alert' : 'status'}
        >
          {statusMessage.message}
        </p>
      )}

      {pendingPhotos.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {pendingPhotos.map((photo) => (
            <li key={photo.clientId} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt="Inspection attachment preview"
                className="h-20 w-20 rounded-lg border border-border object-cover sm:h-24 sm:w-24"
              />
              <button
                type="button"
                onClick={() => onRemove(photo.clientId)}
                disabled={disabled}
                className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow disabled:opacity-50"
                aria-label="Remove photo"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
