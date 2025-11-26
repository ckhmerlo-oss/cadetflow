import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ReportHistoryClient from './ReportHistoryClient'

export type CompletedReport = {
  id: string;
  status: string;
  created_at: string;
  subject: { first_name: string, last_name: string, company: { company_name: string } | null } | null;
  submitter: { first_name: string, last_name: string } | null;
  group: { group_name: string } | null;
  offense_type: { offense_name: string } | null;
  appeal_status: string | null;
}

export default async function ReportArchivePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Check Permissions (Faculty Only)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level)')
    .eq('id', user.id)
    .single()

  const isFaculty = ((profile?.role as any)?.default_role_level || 0) >= 50

  if (!isFaculty) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-gray-600 mt-2">Only faculty can view the full report archive.</p>
      </div>
    )
  }

  // 2. Fetch Completed Reports
  const { data: rpcData, error } = await supabase.rpc('get_all_completed_reports_for_faculty')
  
  if (error) {
    console.error("Error fetching history:", error)
    return <div className="p-8 text-red-500">Error loading archive.</div>
  }

  // 3. Transform Data
  // The RPC returns `subject`, `submitter` etc as json objects
  const reports: CompletedReport[] = rpcData?.map((item: any) => ({ 
    ...item, 
    subject: item.subject, 
    submitter: item.submitter, 
    group: item.group, 
    offense_type: { offense_name: item.title },
    appeal_status: item.appeal_status
  })) || []

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Archive</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Searchable record of all completed disciplinary reports.
          </p>
        </div>
      </div>
      
      <ReportHistoryClient initialReports={reports} />
    </div>
  )
}