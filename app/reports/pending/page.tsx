import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PendingReportsClient from './PendingReportsClient'

// Type definition matching the structure we need
export type ReportWithNames = {
  id: string;
  status: string;
  created_at: string;
  current_approver_group_id: string | null;
  subject_cadet_id: string;
  submitted_by: string;
  subject: { first_name: string, last_name: string } | null;
  submitter: { first_name: string, last_name: string } | null;
  group: { group_name: string } | null;
  offense_type: { offense_name: string } | null;
}

export default async function PendingReportsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Check Permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level, can_manage_all_rosters)')
    .eq('id', user.id)
    .single()

  const role = profile?.role as any
  const isFaculty = (role?.default_role_level || 0) >= 50
  const canManageAll = role?.can_manage_all_rosters || false

  // Only allow Staff who have roster management permissions (Commandant/Admin/Main TACs)
  if (!isFaculty || !canManageAll) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-gray-600 mt-2">You do not have permission to view all pending reports.</p>
      </div>
    )
  }

  // 2. Fetch Data using the existing faculty RPC
  const { data: rpcData, error } = await supabase.rpc('get_all_pending_reports_for_faculty')
  
  if (error) {
    console.error("Error fetching pending reports:", error)
    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Error loading reports: {error.message}
            </div>
        </div>
    )
  }

  // 3. Transform Data
  const reports: ReportWithNames[] = rpcData?.map((item: any) => ({ 
    ...item, 
    subject: item.subject, 
    submitter: item.submitter, 
    group: item.group, 
    offense_type: { offense_name: item.title } 
  })) || []

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">In-Progress Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of all reports currently moving up the chain of command.
          </p>
        </div>
      </div>
      
      <PendingReportsClient initialReports={reports} />
    </div>
  )
}