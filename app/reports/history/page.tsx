import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ReportHistoryClient from './ReportHistoryClient'
import { fetchReportHistory } from './actions'

export default async function ReportArchivePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // CHECK PERMISSIONS (Level 50+ only)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0;
  if (roleLevel < 50) {
      // Unauthorized users go home
      return redirect('/')
  }

  // Initial load
  const { data, error } = await fetchReportHistory(0, 50)

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading history: {error}</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Archive</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage past reports.
          </p>
        </div>
      </div>
      
      <ReportHistoryClient initialReports={data || []} />
    </div>
  )
}