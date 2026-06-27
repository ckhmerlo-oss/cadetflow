'use client'

import { useEffect, useState, useTransition } from 'react'
import SearchableSelect, { type SelectOption } from '@/app/components/SearchableSelect'
import {
  createMoveInInvite,
  getCadetParentContact,
} from '../actions'

type SendMoveInInviteModalProps = {
  roomId: string
  roomNumber: string
  cadetOptions: SelectOption[]
  defaultCadetId?: string
  defaultBunk?: 'top' | 'bottom'
  onClose: () => void
  onSent?: () => void
}

export default function SendMoveInInviteModal({
  roomId,
  roomNumber,
  cadetOptions,
  defaultCadetId = '',
  defaultBunk = 'top',
  onClose,
  onSent,
}: SendMoveInInviteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [cadetId, setCadetId] = useState(defaultCadetId)
  const [email, setEmail] = useState('')
  const [lockedBunk, setLockedBunk] = useState<'top' | 'bottom'>(defaultBunk)
  const [lockedDeskSide, setLockedDeskSide] = useState<'left' | 'right'>('left')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copyLink, setCopyLink] = useState<string | null>(null)

  useEffect(() => {
    if (!cadetId) return
    getCadetParentContact(cadetId).then((contact) => {
      if (contact?.parent_email) setEmail(contact.parent_email)
    })
  }, [cadetId])

  const cadetLabel =
    (cadetOptions.find((c) => c.id === cadetId)?.label as string | undefined) ?? 'Cadet'

  const handleSend = () => {
    if (!cadetId) {
      setError('Select a cadet.')
      return
    }
    if (!email.trim()) {
      setError('Parent email is required.')
      return
    }

    startTransition(async () => {
      setError(null)
      setSuccess(null)
      const result = await createMoveInInvite({
        roomId,
        cadetId,
        recipientEmail: email.trim(),
        lockedBunk,
        lockedDeskSide,
        cadetName: cadetLabel,
        roomNumber,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setCopyLink(result.inviteLink ?? null)
      setSuccess(
        result.emailSent
          ? 'Invite email sent successfully.'
          : 'Invite created. Email could not be sent — copy the link below.'
      )
      onSent?.()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div
        className="bg-card border border-border rounded-t-xl sm:rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4"
        role="dialog"
        aria-labelledby="send-invite-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="send-invite-title" className="text-lg font-semibold">Send move-in link</h2>
            <p className="text-sm text-muted-foreground">Room {roomNumber}</p>
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

        {success && (
          <div className="p-3 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-800 dark:text-emerald-200">
            {success}
          </div>
        )}

        {copyLink && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">Invite link</label>
            <div className="flex gap-2">
              <input type="text" readOnly value={copyLink} className="input-base text-xs flex-1" />
              <button
                type="button"
                className="btn-secondary text-sm shrink-0"
                onClick={() => navigator.clipboard.writeText(copyLink)}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <SearchableSelect
          label="Cadet"
          options={cadetOptions}
          value={cadetId}
          onChange={setCadetId}
          placeholder="Select cadet..."
          required
        />

        <div>
          <label className="block text-sm font-medium mb-1">Parent email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base w-full"
            placeholder="parent@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bunk</label>
            <div className="flex gap-2">
              {(['top', 'bottom'] as const).map((bunk) => (
                <label
                  key={bunk}
                  className={[
                    'flex-1 text-center rounded-lg border px-3 py-2 text-sm font-medium cursor-pointer min-h-[2.75rem]',
                    lockedBunk === bunk
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="lockedBunk"
                    value={bunk}
                    checked={lockedBunk === bunk}
                    onChange={() => setLockedBunk(bunk)}
                    className="sr-only"
                  />
                  {bunk === 'top' ? 'Top' : 'Bottom'}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Desk side</label>
            <div className="flex gap-2">
              {(['left', 'right'] as const).map((side) => (
                <label
                  key={side}
                  className={[
                    'flex-1 text-center rounded-lg border px-3 py-2 text-sm font-medium cursor-pointer min-h-[2.75rem]',
                    lockedDeskSide === side
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="lockedDeskSide"
                    value={side}
                    checked={lockedDeskSide === side}
                    onChange={() => setLockedDeskSide(side)}
                    className="sr-only"
                  />
                  {side === 'left' ? 'Left' : 'Right'}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSend}
            className="btn-primary w-full min-h-[3rem]"
          >
            {isPending ? 'Sending...' : 'Send invite email'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary w-full min-h-[2.75rem]">
            {success ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
