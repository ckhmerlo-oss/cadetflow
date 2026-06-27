/**
 * Inspection photo upload scaffold — UI and callback contracts wired now;
 * persistence activates when Day 12.2 `file_assets` + `general-attachments` land.
 *
 * Day 12.2 integration checklist:
 * - Set NEXT_PUBLIC_INSPECTION_PHOTO_UPLOAD=true after bucket + RPCs deploy
 * - Implement requestInspectionPhotoUpload / finalizeInspectionPhotoUpload in actions.ts
 * - Wire uploadPendingInspectionPhotos to call those RPCs
 * - Enable general-attachments RLS for inspection paths
 */

export const INSPECTION_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const INSPECTION_PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const INSPECTION_PHOTO_MAX_COUNT = 10

export type InspectionPhotoScope =
  | { level: 'form'; formType: 'move_in' | 'move_out' }
  | { level: 'item'; formType: 'move_in' | 'move_out'; itemKey: string }

export type PendingInspectionPhoto = {
  clientId: string
  file: File
  previewUrl: string
  scope: InspectionPhotoScope
}

export type InspectionPhotoUploadResult = {
  enabled: boolean
  uploaded: number
  deferred: number
  message: string
}

export function isInspectionPhotoUploadEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INSPECTION_PHOTO_UPLOAD === 'true'
}

export function validateInspectionPhotoFile(file: File): string | null {
  if (!INSPECTION_PHOTO_MIMES.includes(file.type as (typeof INSPECTION_PHOTO_MIMES)[number])) {
    return 'Use JPEG, PNG, or WebP images only.'
  }
  if (file.size > INSPECTION_PHOTO_MAX_BYTES) {
    return 'Each photo must be 5 MB or smaller.'
  }
  return null
}

export function createPendingInspectionPhoto(
  file: File,
  scope: InspectionPhotoScope
): PendingInspectionPhoto {
  return {
    clientId: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    scope,
  }
}

export function releasePendingPhotoPreviews(photos: PendingInspectionPhoto[]): void {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl)
  }
}
