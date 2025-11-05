// in app/onboarding/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type Company = {
  id: string;
  company_name: string;
}

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyId, setCompanyId] = useState('')
  
  // Data for dropdown
  const [companies, setCompanies] = useState<Company[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the list of companies for the dropdown
  useEffect(() => {
    async function getCompanies() {
      const { data, error } = await supabase.rpc('get_cadet_companies')
      if (error) {
        setError(error.message)
      } else {
        setCompanies(data)
      }
    }
    getCompanies()
  }, [supabase])

  // Handle the form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('update_my_onboarding_profile', {
      p_first_name: firstName,
      p_last_name: lastName,
      p_company_id: companyId
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to CadetFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please complete your profile to continue.
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 shadow-lg rounded-lg" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="first-name"
              name="first-name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="John"
            />
          </div>

          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="last-name"
              name="last-name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Doe"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Assign to Company
            </label>
            <select
              id="company"
              name="company"
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select your company...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>
          
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