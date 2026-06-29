'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createParentAccountAndRedeem,
  redeemParentInvite,
  type PortalInvitePublic,
} from '@/app/invite/actions'
import LegalAcceptanceCheckboxes, {
  allLegalDocsAccepted,
} from '@/app/components/LegalAcceptanceCheckboxes'

type PortalInviteClientProps = {
  token: string
  invite: PortalInvitePublic
  isLoggedIn: boolean
  userEmail: string | null
}

export default function PortalInviteClient({
  token,
  invite,
  isLoggedIn,
  userEmail,
}: PortalInviteClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [legalAccepted, setLegalAccepted] = useState<Record<string, boolean>>({})

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
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/parent')
    })
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || password.length < 6) {
      setError('Enter your name and a password of at least 6 characters.')
      return
    }
    if (!allLegalDocsAccepted(legalAccepted)) {
      setError('Accept all legal agreements to continue.')
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await createParentAccountAndRedeem(token, {
        firstName,
        lastName,
        password,
      })
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/parent')
    })
  }

  if (invite.revoked_at) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-3">
        <h1 className="text-xl font-bold">Invite revoked</h1>
        <p className="text-sm text-muted-foreground">
          This parent portal link is no longer active. Contact your TAC for a new invite.
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
        <h1 className="text-2xl font-bold">Parent Portal</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ve been invited to view updates for <strong>{cadetDisplayName}</strong>
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
          <Link
            href={`/login?redirect=${encodeURIComponent(`/invite/portal/${token}`)}`}
            className="text-primary hover:underline"
          >
            Sign in with the correct email
          </Link>
        </div>
      ) : isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Signed in as <strong>{userEmail}</strong>. Link your account to {cadetDisplayName}&apos;s profile.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={handleRedeemLoggedIn}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Linking…' : 'Accept invitation'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create your parent account for <strong>{invite.recipient_email}</strong>.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
              required
            />
          </div>
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            minLength={6}
            required
          />
          <LegalAcceptanceCheckboxes
            accepted={legalAccepted}
            onChange={(key, checked) => setLegalAccepted((prev) => ({ ...prev, [key]: checked }))}
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Creating account…' : 'Create account & accept'}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={`/login?redirect=${encodeURIComponent(`/invite/portal/${token}`)}`}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
