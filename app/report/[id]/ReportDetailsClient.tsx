'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import React from 'react' 
import { pullReportAction, resubmitReport } from './actions' 

// ... (Types unchanged) ...
type Report = {
  id: string;
  status: string;
  notes: string | null;
  report_explanation: string | null; 
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

interface ReportDetailsClientProps {
  user: User;
  initialReport: Report;
  initialLogs: Log[];
  initialAppeal: Appeal | null;
  offenses: OffenseType[];
  escalationTarget: string | null;
  linkedIncidentId?: string | null; 
  isStaff?: boolean;                
  canViewNarrative: boolean; 
  permissions: {
    isSubmitter: boolean;
    isSubject: boolean;
    isApprover: boolean;
    canActOnAppeal: boolean;
    canPull: boolean; 
  }
}

export default function ReportDetailsClient({
  user,
  initialReport,
  initialLogs,
  initialAppeal,
  offenses,
  escalationTarget: initialEscalationTarget,
  permissions,
  linkedIncidentId,
  isStaff,
  canViewNarrative
}: ReportDetailsClientProps) {
  
  const supabase = createClient()
  const router = useRouter()

  // --- STATE HOOKS ---
  const [report, setReport] = useState<Report>(initialReport)
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [appeal, setAppeal] = useState<Appeal | null>(initialAppeal)
  
  const [isActionLoading, setActionLoading] = useState(false)
  const { isSubmitter, isSubject, isApprover, canActOnAppeal, canPull } = permissions 
  
  // Form Modes & Inputs
  const [isEditing, setIsEditing] = useState(false);
  const [editableOffenseId, setEditableOffenseId] = useState(initialReport.offense_type_id);
  const [editableNotes, setEditableNotes] = useState(initialReport.notes || '');
  const [editableExplanation, setEditableExplanation] = useState(initialReport.report_explanation || ''); 
  const [editableDate, setEditableDate] = useState('');
  const [editableTime, setEditableTime] = useState('');
  
  const [isAppealing, setIsAppealing] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [appealJustification, setAppealJustification] = useState('');
  const [comment, setComment] = useState('') 
  const [appealComment, setAppealComment] = useState('');
  const [escalationTarget, setEscalationTarget] = useState(initialEscalationTarget || '');

  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [pullComment, setPullComment] = useState('');

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

  function handleEditClick() {
    if (!report) return;
    setIsEditing(true);
    setEditableOffenseId(report.offense_type_id);
    setEditableNotes(report.notes || '');
    setEditableExplanation(report.report_explanation || ''); 
    
    const dt = new Date(report.date_of_offense);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    setEditableDate(`${year}-${month}-${day}`);
    
    setEditableTime(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  }

  async function handleResubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setActionLoading(true);
    
    // Construct ISO string
    const localDateTime = new Date(`${editableDate}T${editableTime}:00`);
    const fullTimestamp = localDateTime.toISOString();
    
    // CALL SERVER ACTION (Replaces direct Supabase update)
    const result = await resubmitReport(report.id, {
        offenseTypeId: editableOffenseId,
        notes: editableNotes,
        reportExplanation: editableExplanation,
        dateOfOffense: fullTimestamp
    });

    if (result.error) { 
        alert(result.error); 
        setActionLoading(false); 
    } else { 
        // Success
        setIsEditing(false); // Close edit mode
        router.refresh();    // Refresh page data
        // router.push('/')  // Optional: Redirect to dashboard if preferred
    }
  }

  async function handleSubmitAppeal(e: React.FormEvent) {
      e.preventDefault();
      if (!appealJustification.trim()) return;
      setActionLoading(true);
      const { error } = await supabase.from('appeals').insert({ report_id: report.id, appealing_cadet_id: user?.id, justification: appealJustification });
      if (error) { alert(error.message); setActionLoading(false); }
      else { 
        alert("Appeal submitted."); 
        setActionLoading(false);
        setIsAppealing(false);
        router.refresh();
      }
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

  async function handlePullReport() {
    if (!pullComment.trim()) {
      alert("A comment is required to pull a report.");
      return;
    }
    setActionLoading(true);
    const result = await pullReportAction(report.id, pullComment);
    if (result?.error) {
      alert(`Error: ${result.error}`);
      setActionLoading(false);
    } else {
      alert("Report successfully pulled.");
      router.refresh(); 
      setIsPullModalOpen(false);
      setPullComment('');
      setActionLoading(false);
    }
  }

  const groupedOffenses = useMemo(() => {
    return offenses.reduce((acc, o) => { (acc[o.offense_group] = acc[o.offense_group] || []).push(o); return acc; }, {} as Record<string, OffenseType[]>);
  }, [offenses])
  
  if (!report) return null; 

  const showActionBox = isApprover && report.status === 'pending_approval' && !isEditing && !isAppealing;
  const showRevisionBox = isSubmitter && report.status === 'needs_revision' && !isEditing;
  const canAppeal = isSubject && report.status === 'completed' && !appeal && !isAppealing;
  const canEscalate = isSubject && appeal && ['rejected_by_issuer', 'rejected_by_chain'].includes(appeal.status) && !isEscalating;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* --- MODE 1: EDIT REPORT (Submitter) --- */}
      {isEditing ? (
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <form onSubmit={handleResubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Edit Report</h2>
             <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-muted-foreground">Date</label>
                <input type="date" value={editableDate} onChange={e => setEditableDate(e.target.value)} required className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Time</label>
                <input type="time" value={editableTime} onChange={e => setEditableTime(e.target.value)} required className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm" />
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-muted-foreground">Offense</label>
               <select value={editableOffenseId} onChange={e => setEditableOffenseId(e.target.value)} required className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm">
                 {Object.entries(groupedOffenses).map(([group, opts]) => (
                   <optgroup label={group} key={group}>{opts.map(o => <option key={o.id} value={o.id}>({o.demerits}) {o.offense_name}</option>)}</optgroup>
                 ))}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-muted-foreground">Public Summary</label>
               <input value={editableNotes} onChange={e => setEditableNotes(e.target.value)} className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm" />
            </div>
            <div>
               <label className="block text-sm font-medium text-muted-foreground">Full Explanation</label>
               <textarea value={editableExplanation} onChange={e => setEditableExplanation(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm" />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsEditing(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground">Cancel</button>
              <button type="submit" disabled={isActionLoading} className="w-1/2 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">{isActionLoading ? 'Saving...' : 'Resubmit'}</button>
            </div>
          </form>
        </div>
      ) 

      /* --- MODE 2a: CREATE APPEAL (Subject) --- */
      : isAppealing ? (
         <div className="bg-card p-6 rounded-lg shadow border border-primary">
             <form onSubmit={handleSubmitAppeal} className="space-y-6">
                 <h2 className="text-2xl font-bold text-foreground">Appeal this Report</h2>
                 <p className="text-sm text-muted-foreground">
                     State your case clearly. This will be sent first to <strong>{formatName(report.submitter)}</strong> for review.
                 </p>
                 <div>
                     <label htmlFor="justification" className="block text-sm font-medium text-muted-foreground">Justification / Defense</label>
                     <textarea id="justification" rows={6} required value={appealJustification} onChange={(e) => setAppealJustification(e.target.value)} className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="I respectfully appeal this report because..." />
                 </div>
                 <div className="flex gap-4">
                     <button type="button" onClick={() => setIsAppealing(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground">Cancel</button>
                     <button type="submit" disabled={isActionLoading} className="w-1/2 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">{isActionLoading ? 'Submitting...' : 'Submit Appeal'}</button>
                 </div>
             </form>
         </div>
      )

      /* --- MODE 2b: ESCALATE APPEAL (Subject) --- */
      : isEscalating && appeal ? (
         <div className="bg-card p-6 rounded-lg shadow border border-yellow-500">
             <form onSubmit={handleEscalate} className="space-y-6">
                 <h2 className="text-2xl font-bold text-foreground">Escalate Appeal</h2>
                 <p className="text-sm text-muted-foreground">
                    You are escalating this appeal to the next level in the chain of command:
                    <br />
                    <strong className="text-lg text-foreground block mt-2">
                       {escalationTarget || 'Loading next step...'}
                    </strong>
                 </p>
                 
                 {appeal.issuer_comment && appeal.status === 'rejected_by_issuer' && (
                    <div className="bg-destructive/10 p-3 rounded border-l-4 border-destructive">
                        <p className="text-sm font-medium text-destructive">Issuer's Reason for Rejection:</p>
                        <p className="text-sm text-muted-foreground italic">"{appeal.issuer_comment}"</p>
                    </div>
                 )}
                 {appeal.chain_comment && appeal.status === 'rejected_by_chain' && (
                    <div className="bg-destructive/10 p-3 rounded border-l-4 border-destructive">
                        <p className="text-sm font-medium text-destructive">Chain of Command's Reason for Rejection:</p>
                        <p className="text-sm text-muted-foreground italic">"{appeal.chain_comment}"</p>
                    </div>
                 )}

                 <div>
                     <label htmlFor="justification_esc" className="block text-sm font-medium text-muted-foreground">Update Justification (Optional)</label>
                     <textarea id="justification_esc" rows={6} required value={appealJustification} onChange={(e) => setAppealJustification(e.target.value)} className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm" />
                 </div>
                 <div className="flex gap-4">
                     <button type="button" onClick={() => setIsEscalating(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground">Cancel</button>
                     <button type="submit" disabled={isActionLoading} className="w-1/2 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50">{isActionLoading ? 'Escalating...' : 'Confirm Escalation'}</button>
                 </div>
             </form>
         </div>
      )

      /* --- MODE 3: VIEW REPORT (Default) --- */
      : (
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          {/* ... Header ... */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{report.offense_type.offense_name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                report.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                report.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                report.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
            }`}>
              {formatStatus(report.status)}
            </span>
          </div>

          {/* --- APPEAL STATUS --- */}
          {appeal && (
              <div className="mt-6 space-y-4">
                  <div className="bg-primary/10 border-l-4 border-primary p-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-primary">Appeal Status</h3>
                          <span className="text-sm font-bold text-primary uppercase tracking-wider">
                              {formatAppealStatus(appeal.status)}
                          </span>
                      </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3">
                      <h4 className="font-medium text-foreground mb-2">Appeal Record</h4>
                      <div className="pl-4 border-l-2 border-border">
                          <p className="text-xs uppercase font-semibold text-muted-foreground">Cadet Justification</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{appeal.justification}</p>
                      </div>
                      {appeal.issuer_comment && (
                          <div className="pl-4 border-l-2 border-blue-500">
                              <p className="text-xs uppercase font-semibold text-blue-500">Issuer Note</p>
                              <p className="text-sm text-foreground">{appeal.issuer_comment}</p>
                          </div>
                      )}
                      {appeal.chain_comment && (
                          <div className="pl-4 border-l-2 border-purple-500">
                              <p className="text-xs uppercase font-semibold text-purple-500">Chain of Command Note</p>
                              <p className="text-sm text-foreground">{appeal.chain_comment}</p>
                          </div>
                      )}
                      {appeal.final_comment && (
                          <div className={`pl-4 border-l-2 ${appeal.status === 'approved' ? 'border-green-500' : 'border-red-500'}`}>
                              <p className={`text-xs uppercase font-semibold ${appeal.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                                  Final Decision
                              </p>
                              <p className="text-sm text-foreground">{appeal.final_comment}</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6">
            <div><h3 className="text-sm font-medium text-muted-foreground">Subject</h3><p className="mt-1 text-lg text-foreground">{formatName(report.subject)}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Submitted By</h3><p className="mt-1 text-lg text-foreground">{formatName(report.submitter)}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3><p className="mt-1 text-lg text-foreground">{new Date(report.date_of_offense).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Category</h3><p className="mt-1 text-lg text-foreground">Cat {report.offense_type.offense_code}</p></div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">Demerits</h3>
                <p className="mt-1 text-lg font-bold text-destructive">
                    {report.demerits_effective !== report.offense_type.demerits ? (
                        <><span className="line-through text-muted-foreground mr-2">{report.offense_type.demerits}</span>{report.demerits_effective}</>
                    ) : (report.demerits_effective)}
                </p>
            </div>
          </div>

        {/* --- SECTION 1: FULL REPORT NARRATIVE (CONDITIONAL) --- */}
        {canViewNarrative && (
            <div className="mt-8">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Full Report Narrative
                </h3>
                <div className="bg-muted/50 p-4 rounded-md border border-border whitespace-pre-wrap text-foreground text-sm leading-relaxed shadow-sm">
                    {report.report_explanation || <span className="italic text-muted-foreground">No detailed narrative provided.</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground text-right">
                    {linkedIncidentId ? "Confidential: Staff Only" : "Visible to Subject, Submitter & Staff"}
                </p>
            </div>
        )}

        {/* --- SECTION 2: GREEN SHEET SUMMARY (ALWAYS VISIBLE) --- */}
        <div className="mt-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Green Sheet Summary (Public)
            </h3>
            <div className="p-3 rounded-md border border-border text-foreground text-sm bg-background">
                {report.notes || <span className="italic">No summary provided.</span>}
            </div>
        </div>

        {/* --- SECTION 3: INCIDENT LINK (STAFF ONLY) --- */}
        {isStaff && linkedIncidentId && (
            <div className="mt-4 flex justify-end">
                <a 
                    href={`/incidents/${linkedIncidentId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-orange-600 hover:text-orange-800 font-bold transition-colors group"
                >
                    <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    View Original Incident Report &rarr;
                </a>
            </div>
        )}

          {/* --- APPEAL ACTION BOX --- */}
          {canActOnAppeal && !isEditing && (
              <div className="mt-6 bg-primary/10 border border-primary/20 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-primary mb-4">Appeal Action Required</h3>
                  <textarea placeholder="Reason for your decision (this will be visible in the appeal record)..." value={appealComment} onChange={e => setAppealComment(e.target.value)} className="w-full rounded-md border-input bg-background text-foreground mb-4" rows={3} />
                  <div className="flex gap-4">
                      <button onClick={() => handleAppealAction('grant')} disabled={isActionLoading} className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                          {appeal?.status === 'pending_commandant' ? 'Final Approval (Grant Appeal)' : 'Grant & Forward to Next Level'}
                      </button>
                      <button onClick={() => handleAppealAction('reject')} disabled={isActionLoading} className="flex-1 py-2 bg-destructive text-white rounded hover:bg-destructive/90 disabled:opacity-50">Reject Appeal</button>
                  </div>
              </div>
          )}

          {/* --- OPTIONS BUTTONS --- */}
          {(canAppeal || canEscalate || canPull) && (
              <div className="mt-8 border-t border-border pt-6 space-y-6">
                  {canAppeal && (
                     <div>
                        <p className="mt-1 text-sm text-muted-foreground mb-4">If you believe this report was issued in error, you may submit an appeal.</p>
                        <button onClick={() => setIsAppealing(true)} className="py-2 px-4 border border-primary text-primary rounded-md font-medium hover:bg-primary/10 transition-colors">Appeal this Report</button>
                     </div>
                  )}
                  {canEscalate && (
                      <div>
                        <p className="mt-1 text-sm text-muted-foreground mb-4">Your appeal was rejected. You may accept this decision or escalate it.</p>
                        <button onClick={() => { setAppealJustification(appeal?.justification || ''); setIsEscalating(true); }} className="py-2 px-4 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition-colors">Escalate Appeal</button>
                      </div>
                  )}
                   {canPull && (
                      <div>
                         <p className="mt-1 text-sm text-muted-foreground mb-4">You can pull this report. This is a final action and should be used for reports submitted or approved in error.</p>
                         <button 
                           onClick={() => setIsPullModalOpen(true)} 
                           className="py-2 px-4 border border-destructive text-destructive rounded-md font-medium hover:bg-destructive/10 transition-colors"
                         >
                           Pull Report
                         </button>
                      </div>
                   )}                  
              </div>
          )}

        </div>
      )}

      {/* --- STANDARD ACTION BOX --- */}
      {showActionBox && (
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-medium text-foreground">Actions</h3>
          <textarea placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} className="mt-4 mb-4 block w-full rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm" rows={3} />
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => handleApprovalAction('approve')} disabled={isActionLoading} className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Approve</button>
            <button onClick={() => handleApprovalAction('kickback')} disabled={isActionLoading} className="flex-1 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50">Kick-back</button>
            <button onClick={() => handleApprovalAction('reject')} disabled={isActionLoading} className="flex-1 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 disabled:opacity-50">Reject</button>
          </div>
        </div>
      )}

      {showRevisionBox && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Needs Revision</h3>
          <button onClick={handleEditClick} className="mt-4 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Edit Report</button>
        </div>
      )}

      {/* --- HISTORY LOG --- */}
      {!isEditing && !isAppealing && !isEscalating && (
          <div className="bg-card p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">History</h3>
            <ul className="space-y-4">
              {logs.length > 0 ? logs.map(log => (
                <li key={log.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground"><strong>{formatName(log.actor)}</strong>: {log.action}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  {log.comment && <p className="mt-2 text-sm bg-muted/50 p-2 rounded text-muted-foreground">"{log.comment}"</p>}
                </li>
              )) : <p className="text-muted-foreground">No history yet.</p>}
            </ul>
          </div>
      )}
      
      {/* --- PULL REPORT MODAL --- */}
      {isPullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full border border-border">
            <h2 className="text-2xl font-bold text-foreground">Pull Report</h2>
            <p className="mt-4 text-muted-foreground">
              You are about to pull this report. This will permanently set its demerits to <strong>0</strong> and remove any associated tours. This action is logged and cannot be undone.
            </p>
            
            <div className="mt-6">
              <label htmlFor="pull_comment" className="block text-sm font-medium text-muted-foreground">
                Reason / Comment (Required)
              </label>
              <textarea
                id="pull_comment"
                rows={3}
                value={pullComment}
                onChange={(e) => setPullComment(e.target.value)}
                className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="e.g., 'Pulled per discussion with cadet and issuer.'"
              />
            </div>
            
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setIsPullModalOpen(false)}
                disabled={isActionLoading}
                className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePullReport}
                disabled={isActionLoading || !pullComment.trim()}
                className="w-1/2 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 disabled:opacity-50"
              >
                {isActionLoading ? 'Pulling...' : 'Confirm Pull'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}