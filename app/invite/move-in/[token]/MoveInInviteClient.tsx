'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createParentAccountAndRedeem,
  redeemParentInvite,
  type MoveInInvitePublic,
} from '@/app/invite/actions'

type MoveInInviteClientProps = {
  token: string
  invite: MoveInInvitePublic
  isLoggedIn: boolean
  userEmail: string | null
}

export default function MoveInInviteClient({
  token,
  invite,
  isLoggedIn,
  userEmail,
}: MoveInInviteClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')

  const emailMismatch =
    isLoggedIn &&
    userEmail &&
    userEmail.toLowerCase() !== invite.recipient_email.toLowerCase()

  const cadetDisplayName =
    invite.cadet_last_name && invite.cadet_first_initial
      ? `${invite.cadet_last_name} ${invite.cadet_first_initial}.`
      : invite.cadet_first_name

  const handleRedeemLoggedIn = () => {
    startTransition(async () => {
      setError(null)
      const result = await redeemParentInvite(token)
      if (result.error) {
        setError(result.error)
        return
      }
      router.push(`/move-in/forms/${result.form_id}`)
    })
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || password.length < 6) {
      setError('Enter your name and a password of at least 6 characters.')
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await createParentAccountAndRedeem(token, {
        firstName,
        lastName,
        password,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      router.push(`/move-in/forms/${result.formId}`)
    })
  }

  if (invite.revoked_at) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-3">
        <h1 className="text-xl font-bold">Invite revoked</h1>
        <p className="text-sm text-muted-foreground">
          This move-in link is no longer active. Contact your TAC for a new invite.
        </p>
      </div>
    )
  }

  if (invite.is_expired) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-3">
        <h1 className="text-xl font-bold">Invite expired</h1>
        <p className="text-sm text-muted-foreground">
          This link expired on {new Date(invite.expires_at).toLocaleDateString()}. Ask your TAC to resend.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Move-in Inspection</h1>
        <p className="text-sm text-muted-foreground">
          Room <strong>{invite.room_number}</strong> · <strong>{cadetDisplayName}</strong>&apos;s move-in
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {emailMismatch ? (
        <div className="p-4 border border-border rounded-xl space-y-3 text-sm">
          <p>
            You are signed in as <strong>{userEmail}</strong>, but this invite was sent to{' '}
            <strong>{invite.recipient_email}</strong>.
          </p>
          <Link href={`/login?redirect=${encodeURIComponent(`/invite/move-in/${token}`)}`} className="text-primary hover:underline">
            Sign in with the correct email
          </Link>
        </div>
      ) : isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Continue to the move-in checklist for bunk <strong>{invite.locked_bunk}</strong> and desk{' '}
            <strong>{invite.locked_desk_side}</strong>.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={handleRedeemLoggedIn}
            className="btn-primary w-full min-h-[3rem]"
          >
            {isPending ? 'Loading...' : 'Continue to form'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4 bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Create your parent account for <strong>{invite.recipient_email}</strong> to complete the form.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" readOnly value={invite.recipient_email} className="input-base w-full bg-muted/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-base w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-base w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base w-full"
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={isPending} className="btn-primary w-full min-h-[3rem]">
            {isPending ? 'Creating account...' : 'Create account & open form'}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href={`/login?redirect=${encodeURIComponent(`/invite/move-in/${token}`)}`} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
