'use client'

import { useState, useTransition } from 'react'
import { updateMoveInInviteEmail } from '../actions'

type EditMoveInInviteModalProps = {
  inviteId: string
  roomId: string
  roomNumber: string
  cadetName: string
  initialEmail: string
  onClose: () => void
  onSaved?: () => void
}

export default function EditMoveInInviteModal({
  inviteId,
  roomId,
  roomNumber,
  cadetName,
  initialEmail,
  onClose,
  onSaved,
}: EditMoveInInviteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    startTransition(async () => {
      setError(null)
      const result = await updateMoveInInviteEmail(inviteId, email.trim(), {
        roomId,
        cadetName,
        roomNumber,
        resend: true,
      })
      if (result.error) setError(result.error)
      else {
        onSaved?.()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-card border border-border rounded-t-xl sm:rounded-xl shadow-lg w-full max-w-md p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Edit invite email</h2>
            <p className="text-sm text-muted-foreground">{cadetName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        {error && (
          <div className="p-3 text-sm bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Parent email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Saving will update the invite and send a new email to the corrected address.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="btn-primary w-full min-h-[2.75rem]"
          >
            {isPending ? 'Saving...' : 'Save & resend invite'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary w-full min-h-[2.75rem]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
