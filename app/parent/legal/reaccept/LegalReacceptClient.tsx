'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptRequiredLegalDocs } from '@/app/parent/actions'
import LegalAcceptanceCheckboxes, {
  allLegalDocsAccepted,
} from '@/app/components/LegalAcceptanceCheckboxes'

export default function LegalReacceptClient() {
  const router = useRouter()
  const [accepted, setAccepted] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allLegalDocsAccepted(accepted)) {
      setError('Accept all agreements to continue.')
      return
    }
    startTransition(async () => {
      setError(null)
      const result = await acceptRequiredLegalDocs()
      if ('error' in result) {
        setError(result.error ?? 'Failed to record acceptance')
        return
      }
      router.push('/parent')
      router.refresh()
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Updated legal agreements</h1>
      <p className="text-sm text-muted-foreground">
        Our terms have been updated. Please review and accept before using the parent portal.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <LegalAcceptanceCheckboxes
          accepted={accepted}
          onChange={(key, checked) => setAccepted((prev) => ({ ...prev, [key]: checked }))}
          disabled={isPending}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? 'Saving…' : 'Continue to portal'}
        </button>
      </form>
    </div>
  )
}
