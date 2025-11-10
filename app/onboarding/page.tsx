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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-950 dark:text-white">
            Welcome to CadetFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please complete your profile to continue.
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              First Name
            </label>
            <input
              id="first-name"
              name="first-name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="John"
            />
          </div>

          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Last Name
            </label>
            <input
              id="last-name"
              name="last-name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Doe"
            />
          </div>

          {/* --- Company Dropdown Removed --- */}
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}