import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// --- Types ---
type ReportWithNames = {
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
  appeal_status: string | null;
}

type CadetStats = {
  term_demerits: number;
  year_demerits: number;
  total_tours_marched: number;
  current_tour_balance: number;
}

export default async function Dashboard() {
  const supabase = createClient()

  // 1. Get User & Profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`first_name, last_name, company_id, role:role_id (default_role_level, can_manage_all_rosters, approval_group:approval_group_id (group_name))`)
    .eq('id', user.id)
    .single()

  if (profile && profile.company_id === null && profile.first_name === 'New') return redirect('/onboarding')

  // Handle Types safely
  const role = profile?.role as any
  const role_level = role?.default_role_level || 0
  const canManageAll = role?.can_manage_all_rosters || false
  const isFaculty = role_level >= 50 || false
  const groupName = role?.approval_group?.group_name || 'Personal Dashboard'

  // Redirect low-level roles if needed
  if (role_level === 10) {
    redirect(`/ledger/${user.id}`);
  }

  // 2. Fetch Data (Using the logic from Live Site)
  const { data: rpcData, error } = await supabase.rpc('get_my_dashboard_reports')
  if (error) console.error("Error fetching reports:", error.message)
  
  const allInvolvedReports: ReportWithNames[] = rpcData || [];

  let allPendingReports: ReportWithNames[] = [];
  let cadetStats: CadetStats | null = null; 
  let allCompletedReports: ReportWithNames[] = []; 

  if (isFaculty) {
    const { data: facultyData } = await supabase.rpc('get_all_pending_reports_for_faculty')
    allPendingReports = facultyData?.map((item: any) => ({ ...item, subject: item.subject, submitter: item.submitter, group: item.group, offense_type: { offense_name: item.title } })) as ReportWithNames[] || [];

    const { data: completedData } = await supabase.rpc('get_all_completed_reports_for_faculty')
    allCompletedReports = completedData?.map((item: any) => ({ 
        ...item, 
        subject: item.subject, 
        submitter: item.submitter, 
        group: item.group, 
        offense_type: { offense_name: item.title },
        appeal_status: item.appeal_status 
    })) as ReportWithNames[] || [];
  } else {
    const { data: statsData } = await supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: user.id }).single<CadetStats>()
    if (statsData) cadetStats = statsData;
  }
    
  // 3. Filter Lists
  const actionItems = allInvolvedReports.filter(report => {
      if (report.status === 'pending_approval' && report.current_approver_group_id !== null) return true;
      if (report.status === 'needs_revision' && report.submitted_by === user.id) return true;
      if (report.appeal_status) {
          if (report.subject_cadet_id === user.id) return ['rejected_by_issuer', 'rejected_by_chain'].includes(report.appeal_status);
          return ['pending_issuer', 'pending_chain', 'pending_commandant'].includes(report.appeal_status);
      }
      return false;
  }) || []

  const mySubmittedReports = allInvolvedReports.filter(report => report.submitted_by === user.id) || []

  return (
    // Removed "opacity-0" here to fix the blank screen issue
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {profile?.first_name || user.email}</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{groupName}</p>
        </div>
        <div>
          {(role_level >= 15) && (
            <Link href="/submit" className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Submit New Report
            </Link>
          )}
        </div>
      </div>

      {!isFaculty && cadetStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><CadetStatsHeader stats={cadetStats} /></div></div>
          <div className="bg-sky-300 dark:bg-indigo-900 rounded-lg shadow-sm flex overflow-hidden">
            <Link href={`/ledger/${user.id}`} className="flex-1 flex items-center justify-center p-6 text-lg font-bold text-white hover:bg-sky-500 dark:hover:bg-indigo-600 transition-colors w-full h-full text-center">
                View Full Record &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {(role_level >= 15) && (
            <DashboardSection 
                title="Action Items" 
                items={actionItems} 
                emptyMessage="No action items in your queue. Great job!" 
                showSubject 
                viewAllHref="/action-items"
            />
        )}
        
        {isFaculty && canManageAll && (
            <DashboardSection 
                title="All In-Progress Reports" 
                items={allPendingReports} 
                emptyMessage="No reports pending approval." 
                showSubject 
            />
        )}

        {(role_level >= 15) && (
            <DashboardSection 
                title="Submitted Reports" 
                items={mySubmittedReports} 
                emptyMessage="You haven't submitted any reports yet." 
                showSubject 
            />
        )}

        {isFaculty && (
            <DashboardSection 
                title="Completed Archive" 
                items={allCompletedReports} 
                emptyMessage="No completed reports found." 
                showSubject 
                // viewAllHref="/archive" // Uncomment when archive page is ready
            />
        )}
      </div>
    </div>
  )
}

// --- Helper Components ---

function CadetStatsHeader({ stats }: { stats: CadetStats }) {
  return (
    <>
      <StatCard title="Current Term Demerits" value={stats.term_demerits} />
      <StatCard title="Academic Year Demerits" value={stats.year_demerits} />
      <StatCard title="Current Tour Balance" value={stats.current_tour_balance} />
    </>
  )
}

function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

// UPDATED: Accepts viewAllHref to create clickable headers
function DashboardSection({ 
    title, 
    items, 
    emptyMessage, 
    showSubject = false, 
    showSubmitter = false,
    viewAllHref 
}: { 
    title: string; 
    items: ReportWithNames[]; 
    emptyMessage: string; 
    showSubject?: boolean; 
    showSubmitter?: boolean;
    viewAllHref?: string;
}) {
  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-end">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {viewAllHref ? (
                <Link href={viewAllHref} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {title}
                </Link>
            ) : title}
            <span className="ml-2 text-lg text-gray-500 font-normal">({items?.length || 0})</span>
          </h2>
          
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline pb-1">
                View all &rarr;
            </Link>
          )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-3 h-96 overflow-y-auto flex-grow">
        {items && items.length > 0 ? (
            items.map(report => (
                <ReportCard 
                    key={report.id} 
                    report={report} 
                    showSubject={showSubject} 
                    showSubmitter={showSubmitter} 
                />
            ))
        ) : (
            <p className="text-gray-500 dark:text-gray-400 p-4">{emptyMessage}</p>
        )}
      </div>
    </div>
  )
}

function ReportCard({ report, showSubject, showSubmitter }: { report: ReportWithNames; showSubject?: boolean; showSubmitter?: boolean }) {
  
  const getStatusColor = () => {
    switch (report.status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'needs_revision': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  const formatName = (person: { first_name: string, last_name: string } | null) => person ? `${person.last_name}, ${person.first_name.charAt(0)}.` : 'N/A';
  const formatStatus = (status: string) => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const title = report.offense_type?.offense_name || 'Untitled Report';

  const getAppealBadge = (status: string) => {
      if (status === 'approved') {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ml-2">Appeal Granted</span>
      } else if (status === 'rejected_final') {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ml-2">Appeal Denied</span>
      } else {
           return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2">Appeal In Progress</span>
      }
  }

  return (
    <Link 
      href={`/report/${report.id}`} 
      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex justify-between items-center">
        <div className="truncate flex items-center flex-1 mr-2">
             <span className="font-medium text-indigo-600 dark:text-indigo-400 truncate">{title}</span>
             {report.appeal_status && getAppealBadge(report.appeal_status)}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor()}`}>
          {formatStatus(report.status)}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {showSubject && <p>Subject: <span className="font-medium text-gray-700 dark:text-gray-200">{formatName(report.subject)}</span></p>}
        {showSubmitter && <p>Submitter: <span className="font-medium text-gray-700 dark:text-gray-200">{formatName(report.submitter)}</span></p>}
        {report.status === 'pending_approval' && <p>Waiting for: <span className="font-medium text-gray-700 dark:text-gray-200">{report.group?.group_name || 'N/A'}</span></p>}
      </div>
    </Link>
  )
}