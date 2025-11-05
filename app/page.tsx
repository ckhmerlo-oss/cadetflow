// in app/page.tsx (This is your main dashboard)
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
// *** FIX: Removed this unused import ***
// import { Database } from '@/utils/supabase/types' 

// *** REFACTORED: This type now matches the JSON from our RPC ***
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

// Type for our new stats RPC
type CadetStats = {
  term_demerits: number;
  year_demerits: number;
  total_tours: number;
}

// *** FIX: Added type for the permissions RPC ***
type ManagePermissions = {
  can_manage_own: boolean;
  can_manage_all: boolean;
}

export default async function Dashboard() {
  const supabase = createClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. Get user's profile for name and role_level
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role_level') 
    .eq('id', user.id)
    .single()

  const isFaculty = (profile?.role_level || 0) >= 50;

  // *** NEW: Get the user's specific management permissions ***
  const { data: permsData, error: permsError } = await supabase
    .rpc('get_my_manage_permissions')
    .single<ManagePermissions>() // <-- FIX: Added type
    
  if (permsError) {
    console.error("Error fetching permissions:", permsError.message)
  }
  
  // Default to false if error or no data
  const canManageAll = permsData?.can_manage_all || false;

  // *** NEW: Fetch user's groups for the subtitle ***
  const { data: groupsData } = await supabase
    .from('group_members')
    .select('approval_groups(group_name)')
    .eq('user_id', user.id)

  // Format the group names into a string
  const groupNames = groupsData
    // *** FIX: Added (item: any) to resolve implicit 'any' error ***
    ?.map((item: any) => item.approval_groups?.group_name)
    .filter(Boolean) // Remove any null/undefined
    .join(', ') || 'Personal Dashboard';

  // 3. *** FIX: Call our new RPC function to get all data ***
  // This avoids RLS recursion and solves the "N/A" name problem.
  const { data: rpcData, error } = await supabase
    .rpc('get_my_dashboard_reports')
    
  // *** FIX: Ensure allInvolvedReports is ALWAYS an array ***
  const allInvolvedReports: ReportWithNames[] = rpcData || [];
    
  if (error) {
    console.error("Error fetching reports:", error.message)
  }

  // 4. Conditionally fetch data
  let individualItems: ReportWithNames[] = [];
  let allPendingReports: ReportWithNames[] = [];
  let cadetStats: CadetStats | null = null; 
  let allCompletedReports: ReportWithNames[] = []; 

  if (isFaculty) {
    // Faculty sees ALL pending reports
    const { data: facultyData, error: rpcError } = await supabase
      .rpc('get_all_pending_reports_for_faculty')
    
    if (rpcError) console.error("Error fetching faculty reports:", rpcError.message)
    // Cast the JSON from RPC to match our type
    // *** FIX: Added (item: any) to resolve implicit 'any' error ***
    allPendingReports = facultyData?.map((item: any) => ({
      ...item,
      subject: item.subject,
      submitter: item.submitter,
      group: item.group,
      offense_type: { offense_name: item.title } // 'title' from RPC is offense_name
    })) as ReportWithNames[] || [];

    // *** NEW: Faculty also sees ALL completed reports ***
    const { data: completedData, error: completedError } = await supabase
      .rpc('get_all_completed_reports_for_faculty')

    if (completedError) console.error("Error fetching all completed reports:", completedError.message)
    
    // *** FIX: Added (item: any) to resolve implicit 'any' error ***
    allCompletedReports = completedData?.map((item: any) => ({
      ...item,
      subject: item.subject,
      submitter: item.submitter,
      group: item.group,
      offense_type: { offense_name: item.title }
    })) as ReportWithNames[] || [];

  } else {
    // Cadets see "Individual Items"
    individualItems = allInvolvedReports.filter(report => 
      report.subject_cadet_id === user.id
    ) || []

    // Cadets also fetch their dashboard stats
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_my_tour_and_demerit_stats')
      .single<CadetStats>() // <-- FIX: Added type
    
    if (statsError) console.error("Error fetching cadet stats:", statsError.message)
    if (statsData) cadetStats = statsData;
  }
    
  // 5. Filter the other reports
  
  // Box 1: Action Items
  const actionItems = allInvolvedReports.filter(report => 
    (report.status === 'pending_approval' && report.current_approver_group_id !== null) || // RLS handles approver check
    (report.status === 'needs_revision' && report.submitted_by === user.id)
  ) || []

  // Box 3: My Submitted Reports (By me)
  const mySubmittedReports = allInvolvedReports.filter(report => 
    report.submitted_by === user.id
  ) || []
  
  // (No Box 4 logic needed here anymore, it's inside the isFaculty check)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.first_name || user.email}
          </h1>
          {/* *** CHANGED: Use the new groupNames string *** */}
          <p className="mt-2 text-lg text-gray-600">
            {groupNames}
          </p>
        </div>
        <div>
          {/* *** NEW: Conditionally show button based on role_level *** */}
          {(profile?.role_level || 0) >= 15 && (
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
        
        {/* *** NEW: Conditionally show Action Items *** */}
        {(profile?.role_level || 0) >= 15 && (
          <DashboardSection 
            title="Action Items" 
            items={actionItems} 
            emptyMessage="No action items in your queue. Great job!" 
            showSubject 
          />
        )}
        
        {/* *** UPDATED: Only faculty AND those with 'all' perms can see this *** */}
        {isFaculty && canManageAll ? (
          <DashboardSection 
            title="All In-Progress Reports" 
            items={allPendingReports} 
            emptyMessage="There are no reports pending approval." 
            showSubject 
          />
        ) : (
          <DashboardSection 
            // *** CHANGED: Title updated ***
            title="My Demerit Reports" 
            items={individualItems} 
            emptyMessage="You have no reports filed about you." 
            showSubmitter 
          />
        )}

        {/* *** NEW: Conditionally show Submitted Reports *** */}
        {(profile?.role_level || 0) >= 15 && (
          <DashboardSection 
            // *** CHANGED: Title updated ***
            title="Submitted Reports" 
            items={mySubmittedReports} 
            emptyMessage="You haven't submitted any reports yet." 
            showSubject 
          />
        )}

        {/* *** CHANGED: This section only shows for faculty *** */}
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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${isPlaceholder ? 'text-gray-400' : 'text-gray-900'}`}>
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
      <h2 className="text-2xl font-semibold text-gray-800">
        {title} ({items?.length || 0})
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-3 h-96 overflow-y-auto">
        {items && items.length > 0 ? (
          items.map(report => (
            <ReportCard key={report.id} report={report} showSubject={showSubject} showSubmitter={showSubmitter} />
          ))
        ) : (
          <p className="text-gray-500 p-4">{emptyMessage}</p>
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
  
  // *** NEW: Helper function to format status names ***
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
      className="block p-4 border rounded-md hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-indigo-600 truncate">{title}</span>
        {/* *** UPDATED: Using the formatStatus function *** */}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor()}`}>
          {formatStatus(report.status)}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {showSubject && (
          <p>Subject: <span className="font-medium text-gray-700">{formatName(report.subject)}</span></p>
        )}
        {showSubmitter && (
          <p>Submitter: <span className="font-medium text-gray-700">{formatName(report.submitter)}</span></p>
        )}
        {report.status === 'pending_approval' && (
          <p>Waiting for: <span className="font-medium text-gray-700">{report.group?.group_name || 'N/A'}</span></p>
        )}
      </div>
    </Link>
  )
}