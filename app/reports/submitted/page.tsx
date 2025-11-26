import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SubmittedReportsClient from './SubmittedReportsClient'

export type SubmittedReport = {
  id: string;
  status: string;
  created_at: string;
  current_approver_group_id: string | null;
  subject_cadet_id: string;
  submitted_by: string;
  subject: { first_name: string, last_name: string } | null;
  group: { group_name: string } | null;
  offense_type: { offense_name: string } | null;
  // *** ADDED: Appeal Data ***
  appeals: { status: string }[];
}

export default async function SubmittedReportsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Check Permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level)')
    .eq('id', user.id)
    .single()

  const role_level = (profile?.role as any)?.default_role_level || 0

  if (role_level < 15) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-gray-600 mt-2">You do not have permission to submit or view submitted reports.</p>
      </div>
    )
  }

  // 2. Fetch Reports Submitted by User
  const { data, error } = await supabase
    .from('demerit_reports')
    .select(`
      id, 
      status, 
      created_at, 
      current_approver_group_id,
      subject_cadet_id,
      submitted_by,
      subject:subject_cadet_id ( first_name, last_name ),
      group:current_approver_group_id ( group_name ),
      offense_type:offense_type_id ( offense_name ),
      appeals ( status ) -- <<< Fetch appeal status
    `)
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error("Error fetching submitted reports:", error)
    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                Error loading reports: {error.message}
            </div>
        </div>
    )
  }

  const reports = data as unknown as SubmittedReport[]

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Submitted Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            History of all demerit reports you have issued.
          </p>
        </div>
      </div>
      
      <SubmittedReportsClient initialReports={reports} />
    </div>
  )
}