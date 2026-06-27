'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { InspectionFormData } from '../actions'
import { revokeMoveInInvite, updateMoveInInviteEmail } from '../actions'
import { formatInspectionTimestamp } from '../lib/move-in-form-status'
import MoveInFormStatusBadge from './MoveInFormStatusBadge'

type InspectionFormAuditCardProps = {
  form: InspectionFormData['form']
  roomId: string
  roomNumber: string
  cadetName: string
  canManage?: boolean
}

export default function InspectionFormAuditCard({
  form,
  roomId,
  roomNumber,
  cadetName,
  canManage = false,
}: InspectionFormAuditCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState(form.recipient_email ?? '')

  if (form.form_type !== 'move_in') return null

  const canEditInvite = canManage && form.invite_can_edit && form.invite_id

  const handleCancel = () => {
    if (!form.invite_id) return
    startTransition(async () => {
      setError(null)
      const result = await revokeMoveInInvite(form.invite_id!, roomId)
      if (result.error) setError(result.error)
      else {
        setMessage('Invite cancelled.')
        router.refresh()
      }
    })
  }

  const handleSaveEmail = () => {
    if (!form.invite_id || !email.trim()) return
    startTransition(async () => {
      setError(null)
      setMessage(null)
      const result = await updateMoveInInviteEmail(form.invite_id!, email.trim(), {
        roomId,
        cadetName,
        roomNumber,
        resend: true,
      })
      if (result.error) setError(result.error)
      else {
        setMessage(result.emailSent ? 'Email updated and invite resent.' : 'Email updated.')
        setEditing(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Form status</h2>
        <MoveInFormStatusBadge form={form} />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {form.sent_by_name && (
          <>
            <dt className="text-muted-foreground">Requested by</dt>
            <dd className="font-medium">{form.sent_by_name}</dd>
          </>
        )}
        {form.sent_at && (
          <>
            <dt className="text-muted-foreground">Sent</dt>
            <dd>{formatInspectionTimestamp(form.sent_at)}</dd>
          </>
        )}
        {form.recipient_email && (
          <>
            <dt className="text-muted-foreground">Sent to</dt>
            <dd>{form.recipient_email}</dd>
          </>
        )}
        {form.filled_by_name && form.submission_status !== 'draft' && (
          <>
            <dt className="text-muted-foreground">Completed by</dt>
            <dd className="font-medium">{form.filled_by_name}</dd>
          </>
        )}
        {form.completed_at && (
          <>
            <dt className="text-muted-foreground">Completed</dt>
            <dd>{formatInspectionTimestamp(form.completed_at)}</dd>
          </>
        )}
        {form.validated_by_name && (
          <>
            <dt className="text-muted-foreground">Validated by</dt>
            <dd className="font-medium">{form.validated_by_name}</dd>
          </>
        )}
      </dl>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {message && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>
      )}

      {canEditInvite && (
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Wrong email? Update it before the parent opens the link.
          </p>
          {editing ? (
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base w-full"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSaveEmail}
                  className="btn-primary text-sm"
                >
                  {isPending ? 'Saving...' : 'Save & resend'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setEmail(form.recipient_email ?? '')
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel edit
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setEditing(true)}
                className="btn-secondary text-sm"
              >
                Edit email
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancel}
                className="btn-secondary text-sm text-destructive border-destructive/30"
              >
                Cancel invite
              </button>
            </div>
          )}
        </div>
      )}

      {form.invite_revoked_at && (
        <p className="text-xs text-muted-foreground">
          Invite cancelled {formatInspectionTimestamp(form.invite_revoked_at)}
        </p>
      )}
    </div>
  )
}
