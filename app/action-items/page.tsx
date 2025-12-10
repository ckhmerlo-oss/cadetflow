import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ActionItemsClient from './ActionItemsClient'
import { getIncidents, IncidentReport } from '../incidents/actions'

export type ActionItemReport = {
  id: string;
  type: 'report' | 'incident';
  status: string;
  created_at: string;
  current_approver_group_id: string | null;
  subject_cadet_id: string;
  submitted_by: string;
  subject: { first_name: string, last_name: string };
  submitter: { first_name: string, last_name: string };
  group: { group_name: string } | null;
  offense_type: { offense_name: string; demerits: number };
  notes: string | null;
  appeal_status: string | null;
  appeal_id: string | null;
  appeal_justification: string | null;
  appeal_issuer_comment: string | null;
  appeal_chain_comment: string | null;
  logs: {
    actor_name: string;
    action: string;
    created_at: string;
    comment: string;
  }[];
}

export default async function ActionItemsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Fetch Profile with Group ID
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select(`
        role:role_id (
            default_role_level, 
            approval_group:approval_group_id (id, group_name)
        )
    `)
    .eq('id', user.id)
    .single()

  const roleData = viewerProfile?.role as any
  const viewerRoleLevel = roleData?.default_role_level || 0;
  const viewerGroupId = roleData?.approval_group?.id || null; // <--- Captured ID
  
  // LOGIC: Only TACs (65-89) see incidents. Admins (90+) do NOT see pending incidents.
  const isTac = viewerRoleLevel >= 65 && viewerRoleLevel < 90; 

  const { data: rpcData, error } = await supabase.rpc('get_my_dashboard_reports')
  if (error) console.error("Error fetching reports:", error.message)

  let allInvolvedReports = (rpcData || []) as any[]

  // 2. Fetch Incidents (TACs Only)
  let incidents: IncidentReport[] = []
  if (isTac) {
      incidents = await getIncidents('pending')
  }

  const allReportIds = allInvolvedReports.map(r => r.id);
  let appealsMap: Record<string, any> = {};
  
  if (allReportIds.length > 0) {
      const { data: appealsData } = await supabase
        .from('appeals')
        .select('id, report_id, status, justification, issuer_comment, chain_comment, current_assignee_id') 
        .in('report_id', allReportIds);
        
      if (appealsData) {
          appealsData.forEach(app => { appealsMap[app.report_id] = app; });
      }
  }

  let logsMap: Record<string, any[]> = {};
  if (allReportIds.length > 0) {
    const { data: logsData } = await supabase
        .from('approval_log')
        .select('report_id, action, comment, created_at, actor:actor_id(first_name, last_name)')
        .in('report_id', allReportIds)
        .order('created_at', { ascending: false });
        
    if (logsData) {
        logsData.forEach(log => {
            if (!logsMap[log.report_id]) logsMap[log.report_id] = [];
            const actor = Array.isArray(log.actor) ? log.actor[0] : log.actor;
            logsMap[log.report_id].push({
                actor_name: actor ? `${actor.last_name}, ${actor.first_name}` : 'Unknown',
                action: log.action,
                created_at: log.created_at,
                comment: log.comment
            });
        });
    }
  }

  const finalItems: ActionItemReport[] = []

  // 3. Process Reports with Strict Filtering
  allInvolvedReports.forEach(report => {
      let include = false;
      if (report.status === 'pulled') return;
      
      // A. Approvals: Strict Group Matching
      if (report.status === 'pending_approval' && report.current_approver_group_id !== null) {
          // You must be in the assigned group AND not be the submitter
          if (report.current_approver_group_id === viewerGroupId && report.submitted_by !== user.id) {
              include = true;
          }
      }
      
      // B. Revisions: Submitter Only
      if (report.status === 'needs_revision' && report.submitted_by === user.id) include = true;
      
      // C. Appeals: Logic based on role/assignee
      const appealData = appealsMap[report.id];
      const appealStatus = report.appeal_status || appealData?.status;
      if (appealStatus) {
          if (report.subject_cadet_id === user.id && ['rejected_by_issuer', 'rejected_by_chain'].includes(appealStatus)) include = true;
          else if (appealStatus === 'pending_issuer' && appealData?.current_assignee_id === user.id) include = true;
          else if (appealStatus === 'pending_chain' && report.submitted_by !== user.id) include = true;
          else if (appealStatus === 'pending_commandant' && viewerRoleLevel >= 90) include = true;
      }

      if (include) {
        const subjectObj = Array.isArray(report.subject) ? report.subject[0] : report.subject;
        const submitterObj = Array.isArray(report.submitter) ? report.submitter[0] : report.submitter;
        const groupObj = Array.isArray(report.group) ? report.group[0] : report.group;
        const offenseObj = Array.isArray(report.offense_type) ? report.offense_type[0] : report.offense_type;
        const app = appealsMap[report.id] || {};

        finalItems.push({
            id: report.id,
            type: 'report' as const,
            status: report.status,
            created_at: report.created_at,
            current_approver_group_id: report.current_approver_group_id,
            subject_cadet_id: report.subject_cadet_id,
            submitted_by: report.submitted_by,
            subject: subjectObj || { first_name: 'Unknown', last_name: 'Unknown' },
            submitter: submitterObj || { first_name: 'Unknown', last_name: 'Unknown' },
            group: groupObj,
            offense_type: { 
                offense_name: offenseObj?.offense_name || report.title || 'Unknown Offense',
                demerits: 0 
            },
            notes: report.notes,
            appeal_status: report.appeal_status || app.status || null,
            appeal_id: app.id || null,
            appeal_justification: app.justification || null,
            appeal_issuer_comment: app.issuer_comment || null,
            appeal_chain_comment: app.chain_comment || null,
            logs: logsMap[report.id] || []
        })
      }
  })

  // 4. Add Incidents
  incidents.forEach(inc => {
      finalItems.push({
          id: inc.id,
          type: 'incident' as const,
          status: 'pending',
          created_at: inc.created_at,
          current_approver_group_id: null,
          subject_cadet_id: inc.subject_cadet_id,
          submitted_by: inc.reporter_id,
          subject: inc.subject,
          submitter: inc.reporter, 
          group: null,
          offense_type: { offense_name: 'Incident Report', demerits: 0 },
          notes: inc.description, 
          appeal_status: null, appeal_id: null, appeal_justification: null, 
          appeal_issuer_comment: null, appeal_chain_comment: null,
          logs: [] 
      })
  })

  finalItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Action Items</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Reports and Incidents requiring your immediate attention.
          </p>
        </div>
      </div>
      <ActionItemsClient initialReports={finalItems} currentUserId={user.id} />
    </div>
  )
}