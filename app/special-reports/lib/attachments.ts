/**
 * Special report attachment scaffold — UI wired now; persistence activates when
 * Day 12.2 `file_assets` + `special-report-files` bucket land.
 */

export const SPECIAL_REPORT_FILE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const
export const SPECIAL_REPORT_FILE_MAX_BYTES = 10 * 1024 * 1024
export const SPECIAL_REPORT_FILE_MAX_COUNT = 5

export type PendingSpecialReportFile = {
  clientId: string
  file: File
  previewUrl: string | null
}

export type SpecialReportUploadResult = {
  enabled: boolean
  uploaded: number
  deferred: number
  message: string
}

export function isSpecialReportUploadEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SPECIAL_REPORT_UPLOAD === 'true'
}

export function validateSpecialReportFile(file: File): string | null {
  if (!SPECIAL_REPORT_FILE_MIMES.includes(file.type as (typeof SPECIAL_REPORT_FILE_MIMES)[number])) {
    return 'Use JPEG, PNG, WebP, or PDF files only.'
  }
  if (file.size > SPECIAL_REPORT_FILE_MAX_BYTES) {
    return 'Each file must be 10 MB or smaller.'
  }
  return null
}

export function createPendingSpecialReportFile(file: File): PendingSpecialReportFile {
  const isImage = file.type.startsWith('image/')
  return {
    clientId: crypto.randomUUID(),
    file,
    previewUrl: isImage ? URL.createObjectURL(file) : null,
  }
}

export function releasePendingFilePreviews(files: PendingSpecialReportFile[]): void {
  for (const item of files) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  }
}

export function deferredUploadMessage(count: number): string {
  if (isSpecialReportUploadEnabled()) {
    return count > 0 ? `${count} file(s) queued for upload.` : 'No files selected.'
  }
  return count > 0
    ? `${count} file(s) selected — uploads will be available after Day 12.2 file storage is enabled.`
    : 'File attachments will be available after Day 12.2 file storage is enabled.'
}
