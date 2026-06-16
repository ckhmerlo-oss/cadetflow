import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getIncidents, IncidentReport } from './incidents/actions'

// --- IMPORTS ---
import { StatusBadge } from './components/ui/StatusBadge' 
import Snowfall from './components/Snowfall' 

// --- TYPES ---
type DashboardItem = {
  id: string
  type: 'report' | 'incident'
  status: string
  created_at: string
  subject: { first_name: string; last_name: string } | null
  title: string
  submitted_by?: string
  submitter?: { first_name: string; last_name: string } | null
  group?: { group_name: string } | null
  appeal_status?: string | null
  reporter?: { first_name: string; last_name: string }
}

type CadetStats = {
  term_demerits: number
  year_demerits: number
  current_tour_balance: number
}

type ReportWithNames = {
  id: string
  status: string
  created_at: string
  submitted_by: string
  subject: { first_name: string; last_name: string } | null
  submitter: { first_name: string; last_name: string } | null
  group?: { group_name: string } | null
  offense_type?: { offense_name: string }
  title?: string
  appeal_status?: string | null
}

export default async function Dashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Fetch Profile + Group ID
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
        first_name, 
        last_name, 
        company_id, 
        role:role_id (
            default_role_level, 
            can_manage_all_rosters, 
            approval_group:approval_group_id (id, group_name)
        )
    `)
    .eq('id', user.id)
    .single()

  if (profile && profile.company_id === null && profile.first_name === 'New') return redirect('/onboarding')

  const role = profile?.role as any
  const role_level = role?.default_role_level || 0
  const groupName = role?.approval_group?.group_name || 'Personal Dashboard'
  const groupId = role?.approval_group?.id || null; 

  const isFaculty = role_level >= 50
  const isTac = role_level >= 65 && role_level < 90; 

  if (role_level === 10) redirect(`/ledger/${user.id}`);

  const { data: rpcData } = await supabase.rpc('get_my_dashboard_reports')
  const allInvolvedReports = rpcData || [];

  // 2. Fetch Incidents (TAC Only)
  let pendingIncidents: IncidentReport[] = []
  if (isTac) {
      pendingIncidents = await getIncidents('pending')
  }

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
    
  // --- 3. FILTER ACTION ITEMS ---
  const actionItems: DashboardItem[] = []
  
  allInvolvedReports.forEach((report: any) => {
      if (report.status === 'pulled') return; 
      
      let isAction = false;

      if (report.status === 'pending_approval' && report.current_approver_group_id !== null) {
          if (report.current_approver_group_id === groupId && report.submitted_by !== user.id) {
              isAction = true;
          }
      }
      
      if (report.status === 'needs_revision' && report.submitted_by === user.id) isAction = true;
      
      if (report.appeal_status) {
          if (role_level >= 90 && report.appeal_status === 'pending_commandant') isAction = true;
          else if (report.subject_cadet_id === user.id && ['rejected_by_issuer', 'rejected_by_chain'].includes(report.appeal_status)) isAction = true;
          else if (report.appeal_status === 'pending_issuer' && report.submitted_by === user.id) isAction = true;
          else if (report.appeal_status === 'pending_chain' && report.submitted_by !== user.id) isAction = true;
      }

      if (isAction) {
          actionItems.push({
              id: report.id,
              type: 'report',
              status: report.status,
              created_at: report.created_at,
              subject: report.subject,
              title: report.offense_type?.offense_name || report.title || 'Report',
              submitted_by: report.submitted_by,
              submitter: report.submitter,
              group: report.group,
              appeal_status: report.appeal_status
          })
      }
  })

  pendingIncidents.forEach((i) => {
      actionItems.push({
          id: i.id,
          type: 'incident',
          status: 'pending',
          created_at: i.created_at,
          subject: i.subject,
          title: 'Incident Report',
          reporter: i.reporter
      })
  })

  actionItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const mySubmittedReports = allInvolvedReports.filter((report: any) => report.submitted_by === user.id) || []

  const submitLink = '/submit';
  const submitLabel = 'Submit Report';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 bg-background text-foreground transition-colors relative">
       
       <Snowfall />

       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.first_name || user.email}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{groupName}</p>
        </div>
        
        <div className="flex gap-3">
          {(role_level >= 15) && (
            <Link 
                href={submitLink} 
                className="py-2 px-4 rounded-md shadow-sm text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {submitLabel}
            </Link>
          )}
        </div>
      </div>
      
      {!isFaculty && cadetStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* UPDATED: Semantic Stats */}
              <StatCard title="Term Demerits" value={cadetStats.term_demerits} />
              <StatCard title="Year Demerits" value={cadetStats.year_demerits} />
              <StatCard title="Tours Owed" value={cadetStats.current_tour_balance} isHighlight />
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg shadow-sm flex overflow-hidden">
            <Link href={`/ledger/${user.id}`} className="flex-1 flex items-center justify-center p-6 text-lg font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors w-full h-full text-center">
                View Full Record &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {(role_level >= 15) && (
            <div id="dashboard-action-items">
                <DashboardSection 
                    title="Action Items" 
                    items={actionItems as any} 
                    emptyMessage="No action items in your queue. Great job!" 
                    showSubject 
                    viewAllHref="/action-items"
                />
            </div>
        )}
        
        {isFaculty && (
            <DashboardSection 
                title="All In-Progress Reports" 
                items={allPendingReports} 
                emptyMessage="No reports pending approval." 
                showSubject 
                viewAllHref="/reports/pending"
            />
        )}

        {(role_level >= 15) && (
            <DashboardSection 
                title="Submitted Reports" 
                items={mySubmittedReports} 
                emptyMessage="You haven't submitted any reports yet." 
                showSubject 
                viewAllHref="/reports/submitted"
            />
        )}

        {isFaculty && (
            <DashboardSection 
                title="Completed Archive" 
                items={allCompletedReports} 
                emptyMessage="No completed reports found." 
                showSubject 
                viewAllHref="/reports/history" 
            />
        )}
      </div>
    </div>
  )
}

// --- UPDATED SUB COMPONENTS ---

// 1. Semantic Stat Card
function StatCard({ title, value, isHighlight = false }: { title: string, value: number, isHighlight?: boolean }) {
    return (
        <div className={`p-4 rounded-lg shadow-sm border transition-colors ${
            isHighlight 
                ? 'bg-destructive/10 border-destructive/20 text-destructive' // Highlight is typically "Bad" (Red)
                : 'bg-card border-border text-foreground'
        }`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                {title}
            </p>
            <p className={`text-2xl font-bold mt-1 ${isHighlight ? 'text-destructive' : 'text-primary'}`}>
                {value}
            </p>
        </div>
    )
}

function DashboardSection({ 
    title, 
    items, 
    emptyMessage, 
    showSubject = false, 
    showSubmitter = false,
    viewAllHref 
}: { 
    title: string; 
    items: any[]; 
    emptyMessage: string; 
    showSubject?: boolean; 
    showSubmitter?: boolean;
    viewAllHref?: string;
}) {
  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-end">
          <h2 className="text-2xl font-semibold text-foreground">
            {viewAllHref ? (
                <Link href={viewAllHref} className="hover:text-primary transition-colors">
                    {title}
                </Link>
            ) : title}
            <span className="ml-2 text-lg text-muted-foreground font-normal">({items?.length || 0})</span>
          </h2>
          
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline pb-1">
                View all &rarr;
            </Link>
          )}
      </div>
      
      <div className="bg-card border border-border p-4 rounded-lg shadow-sm space-y-3 h-96 overflow-y-auto flex-grow">
        {items && items.length > 0 ? (
            items.map((item, idx) => (
                <ReportCard 
                    key={item.id || idx} 
                    report={item} 
                    showSubject={showSubject} 
                    showSubmitter={showSubmitter} 
                />
            ))
        ) : (
            <p className="text-muted-foreground p-4 text-center italic">{emptyMessage}</p>
        )}
      </div>
    </div>
  )
}

function ReportCard({ report, showSubject, showSubmitter }: { report: any; showSubject?: boolean; showSubmitter?: boolean }) {
  
  const formatName = (person: { first_name: string, last_name: string } | null) => person ? `${person.last_name}, ${person.first_name.charAt(0)}.` : 'N/A';
  
  const isIncident = report.type === 'incident';
  const title = report.title || report.offense_type?.offense_name || 'Report';
  const href = isIncident ? `/incidents/${report.id}` : `/report/${report.id}`;

  const getAppealBadge = (status: string) => {
      if (status === 'approved') {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary ml-2">Appeal Granted</span>
      } else if (status === 'rejected_final') {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/20 text-destructive ml-2">Appeal Denied</span>
      } else {
           return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground ml-2">Appeal In Progress</span>
      }
  }

  const containerClasses = isIncident 
    ? 'border-destructive/50 bg-destructive/5 hover:bg-destructive/10' 
    : 'border-border bg-card hover:bg-muted/50';

  return (
    <Link 
      href={href} 
      className={`block p-4 border rounded-md transition-colors ${containerClasses}`}
    >
      <div className="flex justify-between items-center">
        <div className="truncate flex items-center flex-1 mr-2">
             <span className={`font-medium ${report.status === 'pulled' ? 'text-muted-foreground line-through' : 'text-primary'}`}>{title}</span>
             
             {isIncident && (
                <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded font-bold">
                    INCIDENT
                </span>
             )}
             
             {report.appeal_status && getAppealBadge(report.appeal_status)}
        </div>
        
        {(!report.appeal_status || report.appeal_status === 'approved' || report.appeal_status === 'rejected_final') && (
            <StatusBadge status={report.status} />
        )}
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground">
        {showSubject && <p>Subject: <span className="font-medium text-foreground">{formatName(report.subject)}</span></p>}
        {showSubmitter && <p>Submitter: <span className="font-medium text-foreground">{formatName(report.submitter)}</span></p>}
        {report.status === 'pending_approval' && <p>Waiting for: <span className="font-medium text-foreground">{report.group?.group_name || 'N/A'}</span></p>}
      </div>
    </Link>
  )
}