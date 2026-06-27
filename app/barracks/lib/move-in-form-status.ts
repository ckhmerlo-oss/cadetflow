export type MoveInSubmissionStatus = 'draft' | 'submitted' | 'validated'

export type MoveInFormStatusInput = {
  submission_status?: MoveInSubmissionStatus | string | null
  invite_id?: string | null
  invite_revoked_at?: string | null
  invite_redeemed_at?: string | null
  invite_expires_at?: string | null
  completed_at?: string | null
}

export type MoveInFormStatusLabel = {
  label: string
  tone: 'muted' | 'info' | 'warning' | 'success' | 'destructive'
}

export function getMoveInFormStatus(input: MoveInFormStatusInput): MoveInFormStatusLabel {
  const status = input.submission_status ?? 'validated'

  if (input.invite_revoked_at) {
    return { label: 'Invite cancelled', tone: 'destructive' }
  }

  if (status === 'validated') {
    return { label: 'Validated', tone: 'success' }
  }

  if (status === 'submitted') {
    return { label: 'Awaiting TAC review', tone: 'warning' }
  }

  if (status === 'draft' && input.invite_id) {
    if (input.invite_expires_at && new Date(input.invite_expires_at) < new Date()) {
      return { label: 'Invite expired', tone: 'destructive' }
    }
    if (input.invite_redeemed_at) {
      return { label: 'In progress', tone: 'info' }
    }
    return { label: 'Invite sent — awaiting parent', tone: 'info' }
  }

  if (status === 'draft') {
    return { label: 'In progress', tone: 'muted' }
  }

  return { label: status.replace('_', ' '), tone: 'muted' }
}

export const STATUS_BADGE_CLASS: Record<MoveInFormStatusLabel['tone'], string> = {
  muted: 'bg-muted text-muted-foreground border-border',
  info: 'bg-sky-500/10 text-sky-800 dark:text-sky-200 border-sky-500/30',
  warning: 'bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/30',
  success: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
}

export function formatInspectionTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
