// in app/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// (All your Type definitions remain the same)
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
  offense_type: {
    offense_name: string;
  } | null;
}
type CadetStats = {
  term_demerits: number;
  year_demerits: number;
  total_tours: number;
}

export default async function Dashboard() {
  const supabase = createClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. Get user's profile AND their associated role data
  // *** THIS IS THE FIX ***
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      first_name, 
      last_name,
      company_id,
      role:role_id (
        default_role_level,
        can_manage_all_rosters,
        approval_group:approval_group_id (group_name)
      )
    `)
    .eq('id', user.id)
    .single()

  // 3. Check for onboarding
  if (profile && profile.company_id === null && profile.first_name === 'New') {
    return redirect('/onboarding')
  }

  // 4. Define permissions based on the user's ROLE
  const role = profile?.role as any
  const role_level = role?.default_role_level || 0
  const canManageAll = role?.can_manage_all_rosters || false
  const isFaculty = role_level >= 50 || canManageAll
  const groupName = role?.approval_group?.group_name || 'Personal Dashboard'


  // 5. Fetch dashboard reports
  const { data: rpcData, error } = await supabase
    .rpc('get_my_dashboard_reports')
    
  const allInvolvedReports: ReportWithNames[] = rpcData || [];
    
  if (error) {
    console.error("Error fetching reports:", error.message)
  }

  // 6. Conditionally fetch data
  let individualItems: ReportWithNames[] = [];
  let allPendingReports: ReportWithNames[] = [];
  let cadetStats: CadetStats | null = null; 
  let allCompletedReports: ReportWithNames[] = []; 

  if (isFaculty) {
    const { data: facultyData, error: rpcError } = await supabase
      .rpc('get_all_pending_reports_for_faculty')
    
    if (rpcError) console.error("Error fetching faculty reports:", rpcError.message)
    allPendingReports = facultyData?.map((item: any) => ({
      ...item,
      subject: item.subject,
      submitter: item.submitter,
      group: item.group,
      offense_type: { offense_name: item.title }
    })) as ReportWithNames[] || [];

    const { data: completedData, error: completedError } = await supabase
      .rpc('get_all_completed_reports_for_faculty')

    if (completedError) console.error("Error fetching all completed reports:", completedError.message)
    
    allCompletedReports = completedData?.map((item: any) => ({
      ...item,
      subject: item.subject,
      submitter: item.submitter,
      group: item.group,
      offense_type: { offense_name: item.title }
    })) as ReportWithNames[] || [];

  } else {
    individualItems = allInvolvedReports.filter(report => 
      report.subject_cadet_id === user.id
    ) || []

    const { data: statsData, error: statsError } = await supabase
      .rpc('get_my_tour_and_demerit_stats')
      .single<CadetStats>()
    
    if (statsError) console.error("Error fetching cadet stats:", statsError.message)
    if (statsData) cadetStats = statsData;
  }
    
  // 7. Filter the other reports
  const actionItems = allInvolvedReports.filter(report => 
    (report.status === 'pending_approval' && report.current_approver_group_id !== null) ||
    (report.status === 'needs_revision' && report.submitted_by === user.id)
  ) || []

  const mySubmittedReports = allInvolvedReports.filter(report => 
    report.submitted_by === user.id
  ) || []

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile?.last_name || user.email}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {groupName}
          </p>
        </div>
        <div>
          {/* *** FIX: Check the new 'role_level' variable *** */}
          {(role_level >= 15) && (
            <Link 
              href="/submit" 
              className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Submit New Report
            </Link>
          )}
        </div>
      </div>

      {/* Conditional Cadet Stats Header */}
      {!isFaculty && cadetStats && (
        <CadetStatsHeader stats={cadetStats} />
      )}

      {/* Grid for the four columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* *** FIX: Check the new 'role_level' variable *** */}
        {(role_level >= 15) && (
          <DashboardSection 
            title="Action Items" 
            items={actionItems} 
            emptyMessage="No action items in your queue. Great job!" 
            showSubject 
          />
        )}
        
        {isFaculty && canManageAll ? (
          <DashboardSection 
            title="All In-Progress Reports" 
            items={allPendingReports} 
            emptyMessage="There are no reports pending approval." 
            showSubject 
          />
        ) : (
          <DashboardSection 
            title="My Demerit Reports" 
            items={individualItems} 
            emptyMessage="You have no reports filed about you." 
            showSubmitter 
          />
        )}

        {/* *** FIX: Check the new 'role_level' variable *** */}
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
          />
        )}
        
      </div>
    </div>
  )
}

// --- Helper Components ---
// (No changes to helper components: CadetStatsHeader, StatCard, DashboardSection, ReportCard)
function CadetStatsHeader({ stats }: { stats: CadetStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Current Term Demerits" value={stats.term_demerits} />
      <StatCard title="Academic Year Demerits" value={stats.year_demerits} />
      <StatCard title="Total Tours" value={stats.total_tours} />
    </div>
  )
}

function StatCard({ title, value, isPlaceholder = false }: { title: string, value: string | number, isPlaceholder?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium dark:text-gray-400 dark:text-white">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${isPlaceholder ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
      {isPlaceholder && <p className="text-xs text-gray-400">(Future Implementation)</p>}
    </div>
  )
}

function DashboardSection({ title, items, emptyMessage, showSubject = false, showSubmitter = false }: {
  title: string;
  items: ReportWithNames[];
  emptyMessage: string;
  showSubject?: boolean;
  showSubmitter?: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        {title} ({items?.length || 0})
      </h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-3 h-96 overflow-y-auto">
        {items && items.length > 0 ? (
          items.map(report => (
            <ReportCard key={report.id} report={report} showSubject={showSubject} showSubmitter={showSubmitter} />
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
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'needs_revision':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatName = (person: { first_name: string, last_name: string } | null) => {
    if (!person) return 'N/A';
    const firstInitial = person.first_name ? `${person.first_name[0]}.` : '';
    return `${person.last_name}, ${firstInitial}`;
  }
  
  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'needs_revision':
        return 'Awaiting Revision'
      case 'pending_approval':
        return 'Pending Approval'
      default:
        return status
    }
  }
  
  const title = report.offense_type?.offense_name || 'Untitled Report';

  return (
    <Link 
      href={`/report/${report.id}`} 
      className="block p-4 border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-indigo-600 truncate">{title}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor()}`}>
          {formatStatus(report.status)}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
        {showSubject && (
          <p>Subject: <span className="font-medium text-gray-700 dark:text-gray-200">{formatName(report.subject)}</span></p>
        )}
        {showSubmitter && (
          <p>Submitter: <span className="font-medium text-gray-700 dark:text-gray-200">{formatName(report.submitter)}</span></p>
        )}
        {report.status === 'pending_approval' && (
          <p>Waiting for: <span className="font-medium text-gray-700 dark:text-gray-200">{report.group?.group_name || 'N/A'}</span></p>
        )}
      </div>
    </Link>
  )
}