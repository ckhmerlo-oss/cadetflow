// in app/onboarding/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react' // <-- Removed useEffect

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // (Removed the useEffect that fetched companies)

  // Handle the form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // *** UPDATED: Only sends name ***
    const { error: rpcError } = await supabase.rpc('update_my_onboarding_profile', {
      p_first_name: firstName,
      p_last_name: lastName
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
    } else {
      // Success! Send them to the dashboard.
      router.push('/')
      router.refresh() // Refresh the layout to get new permissions/logo
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Welcome to CadetFlow
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please complete your profile to continue.
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-card p-8 shadow-lg rounded-lg border border-border" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-foreground">
              First Name
            </label>
            <input
              id="first-name"
              name="first-name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input-base mt-1"
              placeholder="John"
            />
          </div>

          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-foreground">
              Last Name
            </label>
            <input
              id="last-name"
              name="last-name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input-base mt-1"
              placeholder="Doe"
            />
          </div>

          {/* --- Company Dropdown Removed --- */}
          
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}