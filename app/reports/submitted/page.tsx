import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SubmittedReportsClient from './SubmittedReportsClient'
import { fetchSubmittedReports } from './actions'

export default async function SubmittedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data, error } = await fetchSubmittedReports(0, 50)

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Submitted Reports</h1>
      <SubmittedReportsClient initialReports={data || []} />
    </div>
  )
}