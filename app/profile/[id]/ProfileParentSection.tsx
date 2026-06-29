'use client'

import { useState, useTransition } from 'react'
import type { CadetParentLinkRow, PortalInviteRow } from '@/app/lib/parent-queries'
import {
  createPortalInvite,
  resendPortalInvite,
  revokePortalInvite,
  updatePortalInviteEmail,
} from '@/app/parent/actions'

type ProfileParentSectionProps = {
  cadetId: string
  cadetName: string
  parentName?: string | null
  parentEmail?: string | null
  parentPhone?: string | null
  isArchived: boolean
  canManage: boolean
  linkedParents: CadetParentLinkRow[]
  portalInvites: PortalInviteRow[]
}

export default function ProfileParentSection({
  cadetId,
  cadetName,
  parentName,
  parentEmail,
  parentPhone,
  isArchived,
  canManage,
  linkedParents,
  portalInvites,
}: ProfileParentSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState(parentEmail ?? '')
  const [editingInviteId, setEditingInviteId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState('')

  const handleSendInvite = () => {
    startTransition(async () => {
      setError(null)
      setMessage(null)
      const result = await createPortalInvite({
        cadetId,
        recipientEmail: inviteEmail,
        cadetName,
      })
      if ('error' in result) {
        setError(result.error ?? 'Failed to send invite')
        return
      }
      setMessage(result.emailSent ? 'Portal invite sent by email.' : 'Invite created — email failed.')
      setShowInviteForm(false)
    })
  }

  const handleResend = (invite: PortalInviteRow) => {
    startTransition(async () => {
      setError(null)
      const result = await resendPortalInvite({
        inviteId: invite.id,
        cadetId,
        cadetName,
      })
      if ('error' in result) {
        setError(result.error ?? 'Resend failed')
        return
      }
      setMessage(result.emailSent ? 'Invite resent.' : 'New link generated — email failed.')
    })
  }

  const handleRevoke = (inviteId: string) => {
    startTransition(async () => {
      setError(null)
      const result = await revokePortalInvite(inviteId, cadetId)
      if ('error' in result) {
        setError(result.error ?? 'Revoke failed')
        return
      }
      setMessage('Invite revoked.')
    })
  }

  const handleUpdateEmail = () => {
    if (!editingInviteId) return
    startTransition(async () => {
      setError(null)
      const result = await updatePortalInviteEmail(editingInviteId, cadetId, editEmail)
      if ('error' in result) {
        setError(result.error ?? 'Update failed')
        return
      }
      setMessage('Invite email updated.')
      setEditingInviteId(null)
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Parent / Guardian</h2>
        {canManage && !isArchived && (
          <button
            type="button"
            onClick={() => setShowInviteForm((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send portal invite
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Contact name</p>
          <p className="font-medium">{parentName || 'Not listed'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{parentEmail || 'No email'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p className="font-medium">{parentPhone || '(---) --- ----'}</p>
        </div>
      </div>

      {isArchived && (
        <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          Cadet is archived. Linked parents retain read-only portal access; new invites are disabled.
        </p>
      )}

      {message && (
        <p className="text-sm text-green-700 dark:text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {showInviteForm && canManage && !isArchived && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <label className="block text-sm font-medium">Parent email</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="input-base w-full"
          />
          <button
            type="button"
            disabled={isPending || !inviteEmail.trim()}
            onClick={handleSendInvite}
            className="btn-primary"
          >
            {isPending ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      )}

      {linkedParents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Linked accounts</h3>
          <ul className="divide-y divide-border border border-border rounded-lg">
            {linkedParents.map((link) => (
              <li key={link.id} className="px-4 py-3 text-sm flex justify-between gap-2">
                <span className="font-medium">{link.parent_name}</span>
                <span className="text-muted-foreground truncate">{link.parent_email ?? '—'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canManage && portalInvites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Portal invites</h3>
          <ul className="divide-y divide-border border border-border rounded-lg">
            {portalInvites.map((invite) => {
              const status = invite.revoked_at
                ? 'Revoked'
                : invite.redeemed_at
                  ? 'Redeemed'
                  : new Date(invite.expires_at) < new Date()
                    ? 'Expired'
                    : 'Pending'
              return (
                <li key={invite.id} className="px-4 py-3 text-sm space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium truncate">{invite.recipient_email}</span>
                    <span className="text-muted-foreground">{status}</span>
                  </div>
                  {!invite.revoked_at && !invite.redeemed_at && (
                    <div className="flex flex-wrap gap-2">
                      {invite.can_edit && (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => {
                            setEditingInviteId(invite.id)
                            setEditEmail(invite.recipient_email)
                          }}
                        >
                          Edit email
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        disabled={isPending}
                        onClick={() => handleResend(invite)}
                      >
                        Resend
                      </button>
                      {invite.can_edit && (
                        <button
                          type="button"
                          className="text-xs text-destructive hover:underline"
                          disabled={isPending}
                          onClick={() => handleRevoke(invite.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  )}
                  {editingInviteId === invite.id && (
                    <div className="flex gap-2 items-center pt-1">
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="input-base flex-1 text-xs"
                      />
                      <button type="button" className="text-xs btn-primary" onClick={handleUpdateEmail}>
                        Save
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
