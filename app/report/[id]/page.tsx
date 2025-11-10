// in app/report/[id]/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import React from 'react' 

// --- Types ---
type Report = {
  id: string;
  status: string;
  notes: string | null;
  submitted_by: string;
  subject_cadet_id: string;
  current_approver_group_id: string | null; 
  date_of_offense: string;
  offense_type_id: string;
  demerits_effective: number;
  subject: { first_name: string, last_name: string }; 
  submitter: { first_name: string, last_name: string };
  offense_type: {
    offense_name: string;
    offense_code: string;
    demerits: number;
    policy_category: number;
  }
};

type Log = {
  id: string;
  action: string;
  comment: string;
  created_at: string;
  actor: { first_name: string, last_name: string } | null; 
};

type OffenseType = {
  id: string;
  offense_group: string;
  offense_name: string;
  demerits: number;
}

type Appeal = {
  id: string;
  status: string;
  justification: string;
  current_assignee_id: string | null;
  current_group_id: string | null;
  issuer_comment: string | null;
  chain_comment: string | null;
  final_comment: string | null;
}

export default function ReportDetails({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  
  const params = React.use(paramsPromise);
  const reportId = params.id;

  const supabase = createClient()
  const router = useRouter()

  // --- STATE HOOKS ---
  const [report, setReport] = useState<Report | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [appeal, setAppeal] = useState<Appeal | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setActionLoading] = useState(false)
  // Permissions
  const [isSubmitter, setIsSubmitter] = useState(false)
  const [isApprover, setIsApprover] = useState(false)
  const [isSubject, setIsSubject] = useState(false)
  const [canActOnAppeal, setCanActOnAppeal] = useState(false);
  // Form Modes & Inputs
  const [isEditing, setIsEditing] = useState(false);
  const [offenses, setOffenses] = useState<OffenseType[]>([]);
  const [editableOffenseId, setEditableOffenseId] = useState('');
  const [editableNotes, setEditableNotes] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableTime, setEditableTime] = useState('');
  const [isAppealing, setIsAppealing] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [appealJustification, setAppealJustification] = useState('');
  const [comment, setComment] = useState('') 
  const [appealComment, setAppealComment] = useState('');
  const [escalationTarget, setEscalationTarget] = useState('');

  // --- Helpers ---
  const formatName = (person: { first_name: string, last_name: string } | null) => {
    if (!person) return 'N/A';
    return `${person.last_name}, ${person.first_name.charAt(0)}.`;
  }
  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Approved'; case 'rejected': return 'Rejected';
      case 'needs_revision': return 'Revision Requested'; case 'pending_approval': return 'Pending Approval';
      default: return status.replace('_', ' ');
    }
  }
  const formatAppealStatus = (status: string) => {
     switch (status) {
       case 'pending_issuer': return 'Pending Initial Review';
       case 'rejected_by_issuer': return 'Rejected by Issuer (Can Escalate)';
       case 'pending_chain': return 'Pending Chain of Command';
       case 'rejected_by_chain': return 'Rejected by Chain (Can Escalate)';
       case 'pending_commandant': return 'Pending Commandant Review';
       case 'approved': return 'Appeal Granted';
       case 'rejected_final': return 'Appeal Denied (Final)';
       default: return status.replace('_', ' ');
     }
  }

  // 1. Fetch Data
  useEffect(() => {
    async function getReportData() {
      setLoading(true)
      if (!reportId || reportId === 'undefined' || reportId === 'null') {
          setError("Invalid Report ID."); setLoading(false); return;
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return; }
      setUser(user)

      // A. Fetch Report
      const { data: reportData, error: reportError } = await supabase
        .from('demerit_reports') 
        .select(`*, subject:subject_cadet_id ( first_name, last_name ), submitter:submitted_by ( first_name, last_name ), offense_type:offense_type_id ( * )`)
        .eq('id', reportId)
        .single() 

      if (reportError) { setError('Could not load report: ' + reportError.message); setLoading(false); return; }
      setReport(reportData as unknown as Report)
      setIsSubmitter(reportData.submitted_by === user.id)
      setIsSubject(reportData.subject_cadet_id === user.id)

      // B. Fetch Appeal (if any)
      const { data: appealData } = await supabase
        .from('appeals')
        .select('id, status, justification, current_assignee_id, current_group_id, issuer_comment, chain_comment, final_comment')
        .eq('report_id', reportId)
        .maybeSingle()
      
      if (appealData) {
          setAppeal(appealData as Appeal)
          if (appealData.status === 'pending_commandant') {
              setAppealComment(appealData.chain_comment || appealData.issuer_comment || '');
          }
          if (['rejected_by_issuer', 'rejected_by_chain'].includes(appealData.status)) {
             const { data: targetName } = await supabase.rpc('get_next_escalation_target', { p_appeal_id: appealData.id });
             if (targetName) setEscalationTarget(targetName as string);
          }
      }

      // C. Check Appeal Action Permission
      if (appealData && user) {
          if (appealData.status === 'pending_issuer' && appealData.current_assignee_id === user.id) {
              setCanActOnAppeal(true);
          } else if (['pending_chain', 'pending_commandant'].includes(appealData.status) && appealData.current_group_id) {
               const { data: hasPerm } = await supabase.rpc('is_member_of_approver_group', { p_group_id: appealData.current_group_id });
               if (hasPerm) setCanActOnAppeal(true);
          }
      }

      // D. Fetch Dropdown Data (only if needed for editing)
      if (reportData.submitted_by === user.id && reportData.status === 'needs_revision') {
        const { data: offensesData } = await supabase.from('offense_types').select('*').order('offense_group').order('offense_name')
        if (offensesData) setOffenses(offensesData)
      }

      // E. Fetch Logs
      const { data: logData } = await supabase.from('approval_log').select('*, actor:actor_id(first_name, last_name)').eq('report_id', reportId).order('created_at', { ascending: false })
      if (logData) setLogs(logData as Log[])

      // F. Check Approver Status
      if (reportData.current_approver_group_id) {
        const { data: profile } = await supabase.from('profiles').select('roles:role_id(approval_group_id)').eq('id', user.id).single();
        if (profile && (profile.roles as any)?.approval_group_id === reportData.current_approver_group_id) {
           setIsApprover(true);
        }
      }
      setLoading(false)
    }
    getReportData()
  }, [supabase, reportId, router])

  // --- Actions ---
  async function handleApprovalAction(action: 'approve' | 'reject' | 'kickback') {
    if (!report) return;
    let rpcName = '';
    if (action === 'approve') rpcName = 'handle_approval';
    else if (action === 'reject') rpcName = 'handle_rejection';
    else rpcName = 'handle_kickback';

    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    if ((action === 'reject' || action === 'kickback') && !comment) { alert("Comment required."); return; }

    setActionLoading(true);
    const payload = action === 'approve' ? { report_id_to_approve: report.id, approval_comment: comment || 'Approved' } : { p_report_id: report.id, p_comment: comment };
    const { error } = await supabase.rpc(rpcName, payload);

    if (error) { alert(error.message); setActionLoading(false); }
    else { router.push('/'); router.refresh(); }
  }

  // Edit Report Handlers
  function handleEditClick() {
    if (!report) return;
    setIsEditing(true);
    setEditableOffenseId(report.offense_type_id);
    setEditableNotes(report.notes || '');
    
    const dt = new Date(report.date_of_offense);
    
    // *** FIX: Use local date parts instead of toISOString() ***
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    setEditableDate(`${year}-${month}-${day}`);
    
    setEditableTime(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  }

  async function handleResubmit(e: React.FormEvent) {
    e.preventDefault(); setActionLoading(true);
    const localDateTime = new Date(`${editableDate}T${editableTime}:00`);
    const fullTimestamp = localDateTime.toISOString();
    const { error } = await supabase.rpc('resubmit_report', {
      p_report_id: reportId, p_new_offense_type_id: editableOffenseId,
      p_new_notes: editableNotes, p_new_timestamp: fullTimestamp
    });
    if (error) { alert(error.message); setActionLoading(false); }
    else { router.push('/'); router.refresh(); }
  }

  // Appeal Handlers
  async function handleSubmitAppeal(e: React.FormEvent) {
      e.preventDefault();
      if (!appealJustification.trim()) return;
      setActionLoading(true);
      const { error } = await supabase.from('appeals').insert({ report_id: reportId, appealing_cadet_id: user?.id, justification: appealJustification });
      if (error) { alert(error.message); setActionLoading(false); }
      else { alert("Appeal submitted."); router.refresh(); setIsAppealing(false); }
  }

  async function handleAppealAction(action: 'grant' | 'reject') {
      if (!appeal) return;
      if (!appealComment.trim()) { alert("Please provide a comment."); return; }
      setActionLoading(true);
      let rpcName = '';
      if (appeal.status === 'pending_issuer') rpcName = 'appeal_issuer_action';
      else if (appeal.status === 'pending_chain') rpcName = 'appeal_chain_action';
      else if (appeal.status === 'pending_commandant') rpcName = 'appeal_commandant_action';

      if (rpcName) {
          const { error } = await supabase.rpc(rpcName, { p_appeal_id: appeal.id, p_action: action, p_comment: appealComment });
          if (error) alert(error.message);
          else {
              alert(action === 'grant' ? "Appeal granted/forwarded." : "Appeal rejected.");
              // *** FIX: Redirect to dashboard on success ***
              router.push('/');
              router.refresh();
          }
      }
      setActionLoading(false);
  }

  async function handleEscalate(e: React.FormEvent) {
      e.preventDefault();
      if (!appeal || !appealJustification.trim()) return;
      setActionLoading(true);
      const { error } = await supabase.rpc('escalate_appeal', {
          p_appeal_id: appeal.id,
          p_justification: appealJustification
      });
      if (error) { alert(error.message); setActionLoading(false); }
      else {
          alert("Appeal escalated.");
          setIsEscalating(false);
          router.refresh();
      }
  }

  // Group offenses for dropdown
  const groupedOffenses = offenses.reduce((acc, o) => { (acc[o.offense_group] = acc[o.offense_group] || []).push(o); return acc; }, {} as Record<string, OffenseType[]>);

  // --- Render States ---
  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading report...</div>
  if (error) return <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
  if (!report) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Report not found.</div>

  const showActionBox = isApprover && report.status === 'pending_approval' && !isEditing && !isAppealing;
  const showRevisionBox = isSubmitter && report.status === 'needs_revision' && !isEditing;
  const canAppeal = isSubject && report.status === 'completed' && !appeal && !isAppealing;
  const canEscalate = isSubject && appeal && ['rejected_by_issuer', 'rejected_by_chain'].includes(appeal.status) && !isEscalating;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* --- MODE 1: EDIT REPORT (Submitter) --- */}
      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <form onSubmit={handleResubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Report</h2>
             <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" value={editableDate} onChange={e => setEditableDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <input type="time" value={editableTime} onChange={e => setEditableTime(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Offense</label>
               <select value={editableOffenseId} onChange={e => setEditableOffenseId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm">
                 {Object.entries(groupedOffenses).map(([group, opts]) => (
                   <optgroup label={group} key={group}>{opts.map(o => <option key={o.id} value={o.id}>({o.demerits}) {o.offense_name}</option>)}</optgroup>
                 ))}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
               <textarea value={editableNotes} onChange={e => setEditableNotes(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsEditing(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button type="submit" disabled={isActionLoading} className="w-1/2 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">{isActionLoading ? 'Saving...' : 'Resubmit'}</button>
            </div>
          </form>
        </div>
      ) 

      /* --- MODE 2a: CREATE APPEAL (Subject) --- */
      : isAppealing ? (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-indigo-500">
             <form onSubmit={handleSubmitAppeal} className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appeal this Report</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                     State your case clearly. This will be sent first to <strong>{formatName(report.submitter)}</strong> for review.
                 </p>
                 <div>
                     <label htmlFor="justification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Justification / Defense</label>
                     <textarea id="justification" rows={6} required value={appealJustification} onChange={(e) => setAppealJustification(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="I respectfully appeal this report because..." />
                 </div>
                 <div className="flex gap-4">
                     <button type="button" onClick={() => setIsAppealing(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                     <button type="submit" disabled={isActionLoading} className="w-1/2 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">{isActionLoading ? 'Submitting...' : 'Submit Appeal'}</button>
                 </div>
             </form>
         </div>
      )

      /* --- MODE 2b: ESCALATE APPEAL (Subject) --- */
      : isEscalating && appeal ? (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-yellow-500">
             <form onSubmit={handleEscalate} className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Escalate Appeal</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                    You are escalating this appeal to the next level in the chain of command:
                    <br />
                    <strong className="text-lg text-gray-900 dark:text-white block mt-2">
                       {escalationTarget || 'Loading next step...'}
                    </strong>
                 </p>
                 
                 {appeal.issuer_comment && appeal.status === 'rejected_by_issuer' && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Issuer's Reason for Rejection:</p>
                        <p className="text-sm text-red-700 dark:text-red-200 italic">"{appeal.issuer_comment}"</p>
                    </div>
                 )}
                 {appeal.chain_comment && appeal.status === 'rejected_by_chain' && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Chain of Command's Reason for Rejection:</p>
                        <p className="text-sm text-red-700 dark:text-red-200 italic">"{appeal.chain_comment}"</p>
                    </div>
                 )}

                 <div>
                     <label htmlFor="justification_esc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Update Justification (Optional)</label>
                     <textarea id="justification_esc" rows={6} required value={appealJustification} onChange={(e) => setAppealJustification(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
                 </div>
                 <div className="flex gap-4">
                     <button type="button" onClick={() => setIsEscalating(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                     <button type="submit" disabled={isActionLoading} className="w-1/2 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400">{isActionLoading ? 'Escalating...' : 'Confirm Escalation'}</button>
                 </div>
             </form>
         </div>
      )

      /* --- MODE 3: VIEW REPORT (Default) --- */
      : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{report.offense_type.offense_name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                report.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                report.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                report.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
            }`}>
              {formatStatus(report.status)}
            </span>
          </div>

          {/* --- APPEAL STATUS & HISTORY RECORD --- */}
          {appeal && (
              <div className="mt-6 space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200">Appeal Status</h3>
                          <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider">
                              {formatAppealStatus(appeal.status)}
                          </span>
                      </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700 space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Appeal Record</h4>
                      <div className="pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                          <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Cadet Justification</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{appeal.justification}</p>
                      </div>
                      {appeal.issuer_comment && (
                          <div className="pl-4 border-l-2 border-blue-300 dark:border-blue-600">
                              <p className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-400">Issuer Note</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{appeal.issuer_comment}</p>
                          </div>
                      )}
                      {appeal.chain_comment && (
                          <div className="pl-4 border-l-2 border-purple-300 dark:border-purple-600">
                              <p className="text-xs uppercase font-semibold text-purple-600 dark:text-purple-400">Chain of Command Note</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{appeal.chain_comment}</p>
                          </div>
                      )}
                      {appeal.final_comment && (
                          <div className={`pl-4 border-l-2 ${appeal.status === 'approved' ? 'border-green-500' : 'border-red-500'}`}>
                              <p className={`text-xs uppercase font-semibold ${appeal.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  Final Decision
                              </p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{appeal.final_comment}</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t dark:border-gray-700 pt-6">
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</h3><p className="mt-1 text-lg text-gray-900 dark:text-white">{formatName(report.subject)}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</h3><p className="mt-1 text-lg text-gray-900 dark:text-white">{formatName(report.submitter)}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</h3><p className="mt-1 text-lg text-gray-900 dark:text-white">{new Date(report.date_of_offense).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3><p className="mt-1 text-lg text-gray-900 dark:text-white">Cat {report.offense_type.offense_code}</p></div>
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Demerits</h3>
                <p className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
                    {report.demerits_effective !== report.offense_type.demerits ? (
                        <><span className="line-through text-gray-400 mr-2">{report.offense_type.demerits}</span>{report.demerits_effective}</>
                    ) : (report.demerits_effective)}
                </p>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-6">Notes:</h3>
          <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md whitespace-pre-wrap">
            {report.notes || "No notes provided."}
          </p>

          {/* --- APPEAL ACTION BOX --- */}
          {canActOnAppeal && !isEditing && (
              <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-4">Appeal Action Required</h3>
                  <textarea placeholder="Reason for your decision (this will be visible in the appeal record)..." value={appealComment} onChange={e => setAppealComment(e.target.value)} className="w-full rounded-md border-purple-300 dark:border-purple-600 dark:bg-gray-900 dark:text-white mb-4" rows={3} />
                  <div className="flex gap-4">
                      <button onClick={() => handleAppealAction('grant')} disabled={isActionLoading} className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                          {appeal?.status === 'pending_commandant' ? 'Final Approval (Grant Appeal)' : 'Grant & Forward to Next Level'}
                      </button>
                      <button onClick={() => handleAppealAction('reject')} disabled={isActionLoading} className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">Reject Appeal</button>
                  </div>
              </div>
          )}

          {/* --- OPTIONS BUTTONS --- */}
          {(canAppeal || canEscalate) && (
              <div className="mt-8 border-t dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Options</h3>
                  {canAppeal && (
                     <>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-4">If you believe this report was issued in error, you may submit an appeal.</p>
                        <button onClick={() => setIsAppealing(true)} className="py-2 px-4 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Appeal this Report</button>
                     </>
                  )}
                  {canEscalate && (
                      <>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-4">Your appeal was rejected. You may accept this decision or escalate it.</p>
                        <button onClick={() => { setAppealJustification(appeal?.justification || ''); setIsEscalating(true); }} className="py-2 px-4 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition-colors">Escalate Appeal</button>
                      </>
                  )}
              </div>
          )}

        </div>
      )}

      {/* --- STANDARD ACTION BOX (Approver / Submitter Revision) --- */}
      {showActionBox && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actions</h3>
          <textarea placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} className="mt-4 mb-4 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" rows={3} />
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => handleApprovalAction('approve')} disabled={isActionLoading} className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">Approve</button>
            <button onClick={() => handleApprovalAction('kickback')} disabled={isActionLoading} className="flex-1 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400">Kick-back</button>
            <button onClick={() => handleApprovalAction('reject')} disabled={isActionLoading} className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400">Reject</button>
          </div>
        </div>
      )}

      {showRevisionBox && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Needs Revision</h3>
          <button onClick={handleEditClick} className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Edit Report</button>
        </div>
      )}

      {/* --- HISTORY LOG --- */}
      {!isEditing && !isAppealing && !isEscalating && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">History</h3>
            <ul className="space-y-4">
              {logs.length > 0 ? logs.map(log => (
                <li key={log.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white"><strong>{formatName(log.actor)}</strong>: {log.action}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  {log.comment && <p className="mt-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-gray-600 dark:text-gray-300">"{log.comment}"</p>}
                </li>
              )) : <p className="text-gray-500 dark:text-gray-400">No history yet.</p>}
            </ul>
          </div>
      )}

    </div>
  )
}