import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ActionItemsClient from './ActionItemsClient'

export type ActionItemReport = {
  id: string;
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
  
  // --- Appeal Specific Data ---
  appeal_status: string | null;
  appeal_id: string | null;
  appeal_justification: string | null;
  appeal_issuer_comment: string | null;
  appeal_chain_comment: string | null;
  // ----------------------------
  
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

  // 1. Fetch All Involved Reports
  const { data: rpcData, error } = await supabase.rpc('get_my_dashboard_reports')
  
  if (error) {
    console.error("Error fetching reports:", error.message)
    return <div className="p-8 text-red-600">Error loading action items.</div>
  }

  let allInvolvedReports = (rpcData || []) as any[]

  // 2. Fetch Appeals for ALL involved reports (to ensure we don't miss status if RPC doesn't return it)
  const allReportIds = allInvolvedReports.map(r => r.id);
  let appealsMap: Record<string, any> = {};
  
  if (allReportIds.length > 0) {
      const { data: appealsData } = await supabase
        .from('appeals')
        .select('id, report_id, status, justification, issuer_comment, chain_comment')
        .in('report_id', allReportIds);
        
      if (appealsData) {
          appealsData.forEach(app => {
              appealsMap[app.report_id] = app;
          });
      }
  }

  // 3. Filter for Action Items
  let filteredReports = allInvolvedReports.filter(report => {
      if (report.status === 'pulled') return false;
      
      // Pending Approval (Standard)
      if (report.status === 'pending_approval' && report.current_approver_group_id !== null) return true;
      
      // Needs Revision
      if (report.status === 'needs_revision' && report.submitted_by === user.id) return true;
      
      // Appeal Actions
      // Check RPC status OR the fetched map status
      const appealStatus = report.appeal_status || appealsMap[report.id]?.status;
      
      if (appealStatus) {
          // If I am the subject, I act if it was rejected (to escalate)
          if (report.subject_cadet_id === user.id) return ['rejected_by_issuer', 'rejected_by_chain'].includes(appealStatus);
          // If I am authority, I act if it is pending
          return ['pending_issuer', 'pending_chain', 'pending_commandant'].includes(appealStatus);
      }
      return false;
  });

  const filteredIds = filteredReports.map(r => r.id);
  
  // 4. Fetch Logs for filtered items
  let logsMap: Record<string, any[]> = {};
  if (filteredIds.length > 0) {
    const { data: logsData } = await supabase
        .from('approval_log')
        .select('report_id, action, comment, created_at, actor:actor_id(first_name, last_name)')
        .in('report_id', filteredIds)
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

  // 5. Map to Final Type
  const actionItems: ActionItemReport[] = filteredReports.map(item => {
        // Normalize array/object responses from Supabase joins
        const subjectObj = Array.isArray(item.subject) ? item.subject[0] : item.subject;
        const submitterObj = Array.isArray(item.submitter) ? item.submitter[0] : item.submitter;
        const groupObj = Array.isArray(item.group) ? item.group[0] : item.group;
        const offenseObj = Array.isArray(item.offense_type) ? item.offense_type[0] : item.offense_type;
        
        const appealData = appealsMap[item.id] || {};

        return {
            id: item.id,
            status: item.status,
            created_at: item.created_at,
            current_approver_group_id: item.current_approver_group_id,
            subject_cadet_id: item.subject_cadet_id,
            submitted_by: item.submitted_by,
            
            subject: subjectObj || { first_name: 'Unknown', last_name: 'Unknown' },
            submitter: submitterObj || { first_name: 'Unknown', last_name: 'Unknown' },
            group: groupObj,
            
            offense_type: { 
                offense_name: offenseObj?.offense_name || item.title || 'Unknown Offense',
                demerits: 0 
            },
            notes: item.notes,
            
            // --- Populate Appeal Fields (Fixes 2322 Error) ---
            appeal_status: item.appeal_status || appealData.status || null,
            appeal_id: appealData.id || null,
            appeal_justification: appealData.justification || null,
            appeal_issuer_comment: appealData.issuer_comment || null,
            appeal_chain_comment: appealData.chain_comment || null,
            // -------------------------------------------------
            
            logs: logsMap[item.id] || []
        };
  })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Action Items</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Reports requiring your immediate attention. Select rows to perform bulk actions.
          </p>
        </div>
      </div>
      
      <ActionItemsClient initialReports={actionItems} currentUserId={user.id} />
    </div>
  )
}