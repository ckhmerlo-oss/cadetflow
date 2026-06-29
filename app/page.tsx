import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getIncidents, IncidentReport } from './incidents/actions'
import { getSpecialReportsForReview } from './special-reports/actions'
import { getEvents } from './events/actions'
import { getMyWorkOrders, getViewerPersona } from './work-orders/actions'

// --- IMPORTS ---
import { StatusBadge } from './components/ui/StatusBadge' 
import Snowfall from './components/Snowfall' 

// --- TYPES ---
type DashboardItem = {
  id: string
  type: 'report' | 'incident' | 'special_report' | 'event'
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
  date_of_offense?: string
  submitted_by: string
  subject: { first_name: string; last_name: string } | null
  submitter: { first_name: string; last_name: string } | null
  group?: { group_name: string } | null
  offense_type?: { offense_name: string }
  title?: string
  appeal_status?: string | null
}

type SchoolYearBounds = { start: string; end: string }

function reportInSchoolYear(
  report: { date_of_offense?: string; created_at: string },
  bounds: SchoolYearBounds | null,
): boolean {
  if (!bounds) return true
  const offenseDate = report.date_of_offense ?? report.created_at.slice(0, 10)
  return offenseDate >= bounds.start && offenseDate <= bounds.end
}

async function getActiveSchoolYearBounds(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ activeYear: string | null; bounds: SchoolYearBounds | null }> {
  const { data: activeYear } = await supabase.rpc('get_active_school_year')
  if (!activeYear) return { activeYear: null, bounds: null }

  const { data: terms } = await supabase.rpc('get_school_year_terms', {
    p_school_year: activeYear,
  })
  if (!terms?.length) return { activeYear, bounds: null }

  const starts = terms.map((t: { start_date: string }) => t.start_date).sort()
  const ends = terms.map((t: { end_date: string }) => t.end_date).sort()
  return {
    activeYear,
    bounds: { start: starts[0], end: ends[ends.length - 1] },
  }
}

export default async function Dashboard() {
  const supabase = await createClient()

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
            role_name,
            can_manage_all_rosters, 
            approval_group:approval_group_id (id, group_name)
        )
    `)
    .eq('id', user.id)
    .single()

  if (profile && profile.company_id === null && profile.first_name === 'New') return redirect('/onboarding')

  const role = profile?.role as { default_role_level?: number; role_name?: string; approval_group?: { id?: string; group_name?: string } } | null
  const role_level = role?.default_role_level || 0
  const groupName = role?.approval_group?.group_name || 'Personal Dashboard'
  const groupId = role?.approval_group?.id || null; 

  const isFaculty = role_level >= 50
  const isTac = role_level >= 65 && role_level < 90; 

  const { bounds: activeYearBounds } = await getActiveSchoolYearBounds(supabase)

  const { data: rpcData } = await supabase.rpc('get_my_dashboard_reports')
  const allInvolvedReports = rpcData || [];

  // 2. Fetch Incidents (TAC Only)
  let pendingIncidents: IncidentReport[] = []
  let pendingSpecialReports: Awaited<ReturnType<typeof getSpecialReportsForReview>> = []
  let openEvents: Awaited<ReturnType<typeof getEvents>> = []
  if (role_level >= 65) {
      pendingIncidents = await getIncidents('pending')
      pendingSpecialReports = (await getSpecialReportsForReview('pending')).filter((r) => !r.event_id)
      openEvents = await getEvents('open')
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

    if (activeYearBounds && allCompletedReports.length > 0) {
      const ids = allCompletedReports.map((report) => report.id)
      const { data: offenseRows } = await supabase
        .from('demerit_reports')
        .select('id, date_of_offense')
        .in('id', ids)
      const offenseById = new Map(
        (offenseRows ?? []).map((row: { id: string; date_of_offense: string }) => [row.id, row.date_of_offense]),
      )
      allCompletedReports = allCompletedReports
        .map((report) => ({
          ...report,
          date_of_offense: offenseById.get(report.id) ?? report.created_at.slice(0, 10),
        }))
        .filter((report) => reportInSchoolYear(report, activeYearBounds))
    } else if (activeYearBounds) {
      allCompletedReports = allCompletedReports.filter((report) =>
        reportInSchoolYear(report, activeYearBounds),
      )
    }
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

  pendingSpecialReports.forEach((sr) => {
      actionItems.push({
          id: sr.id,
          type: 'special_report',
          status: sr.status,
          created_at: sr.created_at,
          subject: sr.subject ?? null,
          title: 'Special Report',
          submitter: sr.submitter as { first_name: string; last_name: string } | undefined,
      })
  })

  openEvents.slice(0, 5).forEach((ev) => {
      actionItems.push({
          id: ev.id,
          type: 'event',
          status: ev.status,
          created_at: ev.updated_at,
          subject: null,
          title: ev.title,
      })
  })

  actionItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  let workOrderQueue: Awaited<ReturnType<typeof getMyWorkOrders>> = []
  let workOrderViewHref = '/work-orders'
  let workOrderSectionTitle = 'Work Orders'

  if (role_level >= 15) {
    workOrderQueue = await getMyWorkOrders('actionable')
    const persona = await getViewerPersona()
    if (persona?.isMaintenance && !persona.isAdmin) {
      workOrderViewHref = '/work-orders'
      workOrderSectionTitle = 'Maintenance Queue'
    } else if (persona && persona.roleLevel < 65) {
      workOrderSectionTitle = 'My Requests'
    } else if (persona?.isTac) {
      workOrderSectionTitle = 'Work Orders'
    }
  }

  const mySubmittedReports = (allInvolvedReports.filter((report: any) => report.submitted_by === user.id) || [])
    .filter((report: any) => reportInSchoolYear(report, activeYearBounds))

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

        {(role_level >= 15) && (
            <WorkOrdersDashboardSection
              title={workOrderSectionTitle}
              orders={workOrderQueue}
              viewAllHref={workOrderViewHref}
            />
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

        {(role_level >= 15) && mySubmittedReports.length > 0 && (
            <DashboardSection 
                title="Submitted Reports" 
                items={mySubmittedReports} 
                emptyMessage="You haven't submitted any reports yet." 
                showSubject 
                viewAllHref="/reports/submitted"
            />
        )}

        {isFaculty && allCompletedReports.length > 0 && (
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

function WorkOrdersDashboardSection({
  title,
  orders,
  viewAllHref,
}: {
  title: string
  orders: Array<{
    id: string
    created_at: string
    status: string
    description: string
    barracks_room?: { room_number: string } | null
    location?: string | null
    requester?: { first_name: string; last_name: string }
  }>
  viewAllHref: string
}) {
  const displayLocation = (order: (typeof orders)[number]) =>
    order.barracks_room?.room_number ?? order.location ?? 'Unknown'

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-semibold text-foreground">
          <Link href={viewAllHref} className="hover:text-primary transition-colors">
            {title}
          </Link>
          <span className="ml-2 text-lg text-muted-foreground font-normal">({orders.length})</span>
        </h2>
        <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline pb-1">
          View all &rarr;
        </Link>
      </div>

      <div className="bg-card border border-border p-4 rounded-lg shadow-sm space-y-3 h-96 overflow-y-auto flex-grow">
        {orders.length > 0 ? (
          orders.slice(0, 8).map((order) => (
            <Link
              key={order.id}
              href={`/work-orders/${order.id}`}
              className="block p-4 border border-border rounded-md bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium text-primary truncate">{displayLocation(order)}</span>
                <StatusBadge status={order.status} type="workorder" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{order.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground p-4 text-center italic">No work orders in your queue.</p>
        )}
      </div>
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
  const isSpecialReport = report.type === 'special_report';
  const isEvent = report.type === 'event';
  const title = report.title || report.offense_type?.offense_name || 'Report';
  const href = isIncident
    ? `/incidents?incident=${report.id}`
    : isSpecialReport
        ? `/incidents?report=${report.id}`
      : isEvent
        ? `/incidents?event=${report.id}`
        : `/report/${report.id}`;

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
    : isSpecialReport
      ? 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10'
      : isEvent
        ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
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

             {isSpecialReport && (
                <span className="ml-2 bg-amber-600 text-white text-xs px-2 py-0.5 rounded font-bold">
                    SPECIAL
                </span>
             )}

             {isEvent && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-bold">
                    EVENT
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