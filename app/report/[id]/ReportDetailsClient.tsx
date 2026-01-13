'use client'

import { formatDateTime } from '@/app/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react' // Added useEffect
import { User } from '@supabase/supabase-js'
import React from 'react'
// UPDATED: Path matches your submit/page.tsx
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect' 

import { 
  pullReport, 
  approveReportAction, 
  rejectReportAction, 
  kickBackReportAction,
  resubmitReport,
  editAndApproveReport
} from './actions'

// ... (Types)
type Report = {
  id: string;
  status: string;
  notes: string | null;
  report_explanation?: string | null;
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

// UPDATED: Matched exactly to submit/page.tsx
type OffenseType = {
  id: string;
  offense_name: string;
  demerits: number;
  policy_category: number;
  offense_group: string;
  offense_code: string;
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
  // We keep this prop for type safety, but we will load data via useEffect to be safe
  offenses?: OffenseType[]; 
  escalationTarget: string | null;
  linkedIncidentId?: string | null;
  isStaff?: boolean;
  permissions: {
    isSubmitter: boolean;
    isSubject: boolean;
    isApprover: boolean;
    canActOnAppeal: boolean;
    canPull: boolean;
  }
  userProfile?: any;
}

export default function ReportDetailsClient({
  user,
  initialReport,
  initialLogs,
  initialAppeal,
  permissions,
  userProfile 
}: ReportDetailsClientProps) {
  
  const supabase = createClient()
  const router = useRouter()

  // State
  const [report, setReport] = useState<Report>(initialReport)
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [appeal, setAppeal] = useState<Appeal | null>(initialAppeal)
  
  // NEW: Store offenses in state (Client Side Fetch)
  const [offensesList, setOffensesList] = useState<OffenseType[]>([]) 

  const [isActionLoading, setActionLoading] = useState(false)
  const { isSubmitter, isSubject, isApprover, canActOnAppeal, canPull } = permissions
  
  // Modes
  const [isEditing, setIsEditing] = useState(false);
  const [editIntent, setEditIntent] = useState<'resubmit' | 'approve'>('resubmit');

  const [isAppealing, setIsAppealing] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  
  // Inputs
  const [editableOffenseId, setEditableOffenseId] = useState(initialReport.offense_type_id);
  const [editableNotes, setEditableNotes] = useState(initialReport.notes || '');
  const [editableExplanation, setEditableExplanation] = useState(initialReport.report_explanation || '');
  
  const dt = new Date(initialReport.date_of_offense);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const [editableDate, setEditableDate] = useState(`${year}-${month}-${day}`);
  const [editableTime, setEditableTime] = useState(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

  const [appealJustification, setAppealJustification] = useState('');
  const [comment, setComment] = useState('') 
  const [appealComment, setAppealComment] = useState('');
  
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [pullComment, setPullComment] = useState('');

  const roleLevel = userProfile?.role?.default_role_level || 0
  const isCommandant = roleLevel >= 90;
  
  const userRole = userProfile?.role?.role_name || userProfile?.role?.name || '';

  // Define when the Appeal button should be visible
  const showAppealButton = isSubject && report.status === 'completed' && !appeal && !isAppealing;

  // Only show appeal actions if the user has permission and an appeal is active
  const showAppealActionBox = canActOnAppeal && appeal && !isEditing && !isAppealing && !isEscalating;

  // --- NEW: FETCH OFFENSES (Matches submit/page.tsx logic) ---
  useEffect(() => {
    async function fetchOffenses() {
      const { data } = await supabase
        .from('offense_types')
        .select('*')
        .order('policy_category', { ascending: true })
        .order('offense_group', { ascending: true })
        .order('offense_code', { ascending: true })
      
      if (data) {
        setOffensesList(data)
      }
    }
    fetchOffenses()
  }, []) // Runs once on mount
  
  useEffect(() => {
    setReport(initialReport)
  }, [initialReport])

  useEffect(() => {
    setLogs(initialLogs)
  }, [initialLogs])

  useEffect(() => {
    setAppeal(initialAppeal)
  }, [initialAppeal])

  // --- PREPARE OFFENSE OPTIONS (Matches submit/page.tsx logic) ---
  const offenseOptions: SelectOption[] = useMemo(() => {
    return offensesList.map(o => ({
        id: o.id,
        label: `[${o.offense_code}] ${o.offense_name} (${o.demerits})`,
        group: o.offense_group
    }))
  }, [offensesList])

  // --- ACTIONS ---
  async function handleApprovalAction(action: 'approve' | 'reject' | 'kickback') {
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    if ((action === 'reject' || action === 'kickback') && !comment) { alert("Comment required."); return; }

    setActionLoading(true);
    let result;
    if (action === 'approve') result = await approveReportAction(report.id);
    else if (action === 'reject') result = await rejectReportAction(report.id);
    else result = await kickBackReportAction(report.id, comment);

    if (result?.error) { alert(result.error); setActionLoading(false); }
    else { router.refresh(); }
  }

  async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault(); 
    setActionLoading(true);
    const localDateTime = new Date(`${editableDate}T${editableTime}:00`);
    const fullTimestamp = localDateTime.toISOString();
    const payload = { offenseTypeId: editableOffenseId, notes: editableNotes, reportExplanation: editableExplanation, dateOfOffense: fullTimestamp }
    let result;
    if (editIntent === 'approve') result = await editAndApproveReport(report.id, payload);
    else result = await resubmitReport(report.id, payload);
    if (result.error) { alert(result.error); setActionLoading(false); }
    else { setIsEditing(false); router.refresh(); }
  }

  async function handleSubmitAppeal(e: React.FormEvent) {
      e.preventDefault();
      if (!appealJustification.trim()) return;
      setActionLoading(true);
      const { error } = await supabase.from('appeals').insert({ report_id: report.id, appealing_cadet_id: user?.id, justification: appealJustification });
      if (error) { alert(error.message); setActionLoading(false); }
      else { alert("Appeal submitted."); setActionLoading(false); setIsAppealing(false); router.refresh(); }
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
          else { alert(action === 'grant' ? "Appeal granted." : "Appeal rejected."); router.refresh(); }
      }
      setActionLoading(false);
  }

  async function handleEscalate(e: React.FormEvent) {
      e.preventDefault();
      if (!appeal || !appealJustification.trim()) return;
      setActionLoading(true);
      const { error } = await supabase.rpc('escalate_appeal', { p_appeal_id: appeal.id, p_justification: appealJustification });
      if (error) { alert(error.message); setActionLoading(false); }
      else { alert("Appeal escalated."); setIsEscalating(false); router.refresh(); }
  }

  async function handlePullReport() {
    if (!pullComment.trim()) { alert("A comment is required."); return; }
    setActionLoading(true);
    // REMINDER: Update your actions.ts pullReport function to accept (reportId, comment)
    const result = await pullReport(report.id, pullComment);
    if (result?.error) { alert(`Error : ${result.error}`); setActionLoading(false); }
    else { alert("Report pulled."); router.refresh(); setIsPullModalOpen(false); }
  }

  const formatName = (person: { first_name: string, last_name: string } | null) => person ? `${person.last_name}, ${person.first_name.charAt(0)}.` : 'N/A';
  
  // 1. Update Badge Text
  const formatStatus = (status: string) => {
    if (status === 'completed') return 'Approved';
    if (status === 'needs_revision') return 'Revision Requested';
    if (status === 'pulled') return 'Pulled'; // Clear indication it is void
    return status.replace('_', ' ');
  };
  
  const formatAppealStatus = (status: string) => status.replace(/_/g, ' ');

  // 2. Ensure badge color handles 'Pulled' (Gray/Neutral)
  const getStatusColor = (status: string) => {
      if (status === 'completed') return 'bg-green-500/10 text-green-600 border-green-200';
      if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/20';
      if (status === 'pulled') return 'bg-gray-500/10 text-gray-600 border-gray-200'; // Neutral gray for pulled
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
  };

  const showActionBox = isApprover && report.status === 'pending_approval' && !isEditing && !isAppealing;
  const showRevisionBox = isSubmitter && report.status === 'needs_revision' && !isEditing;
  
  // 3. LOCK EDITING: Ensure 'Pulled' is NOT in this logic
  const canEdit = 
    (isSubmitter && report.status === 'needs_revision') || // Only edit if explicitly asked for revision
    (isApprover && report.status === 'pending_approval') ||
    (userRole === 'Admin');
    
  // 4. Hide Pull Button if already pulled
  const showPullButton = canPull && report.status !== 'pulled';

    
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* --- EDIT MODE --- */}
      {isEditing ? (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmitEdit} className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {editIntent === 'approve' ? <span className="text-primary">Edit & Approve</span> : <span>Edit Report</span>}
            </h2>
             <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-foreground">Date</label>
                <input type="date" value={editableDate} onChange={e => setEditableDate(e.target.value)} required className="input-base w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Time</label>
                <input type="time" value={editableTime} onChange={e => setEditableTime(e.target.value)} required className="input-base w-full" />
              </div>
            </div>
            <div>
               {/* Searchable Select (State populated by useEffect) */}
               <SearchableSelect
                 label="Infraction"
                 options={offenseOptions}
                 value={editableOffenseId}
                 onChange={setEditableOffenseId}
                 placeholder="Search for an infraction..."
                 required
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground">Explanation</label>
               <textarea value={editableExplanation} onChange={e => setEditableExplanation(e.target.value)} rows={4} className="input-base w-full" placeholder="Detailed explanation..."/>
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground">Notes (Internal)</label>
               <textarea value={editableNotes} onChange={e => setEditableNotes(e.target.value)} rows={2} className="input-base w-full" />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsEditing(false)} disabled={isActionLoading} className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent">Cancel</button>
              <button type="submit" disabled={isActionLoading} className={`w-1/2 py-2 text-primary-foreground rounded-md shadow ${editIntent === 'approve' ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50`}>
                  {isActionLoading ? 'Saving...' : (editIntent === 'approve' ? 'Confirm & Approve' : 'Resubmit')}
              </button>
            </div>
          </form>
        </div>
      ) 

      /* --- VIEW MODE --- */
      : (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          {/* View Mode Header */}
          <div className="flex flex-col md:flex-row justify-between ...">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{report.offense_type.offense_name}</h1>
              
              {/* Use the helper for dynamic classes */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                  {formatStatus(report.status)}
              </span>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6">
            <div><h3 className="text-sm font-medium text-muted-foreground">Subject</h3><p className="mt-1 text-lg text-foreground">{formatName(report.subject)}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Submitted By</h3><p className="mt-1 text-lg text-foreground">{formatName(report.submitter)}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3><p className="mt-1 text-lg text-foreground">{formatDateTime(report.date_of_offense).toLocaleString()}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Category</h3><p className="mt-1 text-lg text-foreground">Cat {report.offense_type.offense_code}</p></div>
            <div><h3 className="text-sm font-medium text-muted-foreground">Demerits</h3><p className="mt-1 text-lg font-bold text-destructive">{report.demerits_effective}</p></div>
          </div>

          <div className="mt-6"><h3 className="text-sm font-medium text-muted-foreground">Green Sheet Summary</h3><div className="mt-1 p-3 bg-muted/50 rounded text-foreground text-sm border border-border">{report.notes || 'None'}</div></div>
          <div className="mt-6"><h3 className="text-sm font-medium text-muted-foreground">Detailed Narrative</h3><div className="mt-1 p-3 bg-muted/50 rounded text-foreground text-sm border border-border whitespace-pre-wrap">{report.report_explanation || 'None'}</div></div>

          {/* --- APPEAL INTERFACE --- */}

          {/* 1. Appeal Button */}
          {showAppealButton && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Appeal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you believe this report is in error, you may submit an appeal. 
                This will be escalated to your chain of command.
              </p>
              <button 
                onClick={() => setIsAppealing(true)} 
                className="py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Appeal this Report
              </button>
            </div>
          )}

          {/* 2. Appeal Form */}
          {isAppealing && (
            <div className="mt-8 bg-card border border-border p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Submit Appeal</h3>
              <form onSubmit={handleSubmitAppeal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Justification
                  </label>
                  <textarea 
                    required
                    value={appealJustification} 
                    onChange={e => setAppealJustification(e.target.value)} 
                    rows={5} 
                    className="input-base w-full p-2 border rounded bg-background text-foreground"
                    placeholder="Explain clearly why this report is incorrect or unjust..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAppealing(false)} 
                    disabled={isActionLoading}
                    className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isActionLoading} 
                    className="w-1/2 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isActionLoading ? 'Submitting...' : 'Submit Appeal'}
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* --- APPEAL STATUS --- */}
          {appeal && (
              <div className="mt-6 space-y-4">
                  <div className="bg-primary/5 border-l-4 border-primary p-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-foreground">Appeal Status</h3>
                          <span className="text-sm font-bold text-primary uppercase tracking-wider">
                              {formatAppealStatus(appeal.status)}
                          </span>
                      </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                      <div className="pl-4 border-l-2 border-muted-foreground">
                          <p className="text-xs uppercase font-semibold text-muted-foreground">Cadet Justification</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{appeal.justification}</p>
                      </div>
                  </div>
              </div>
          )}

          {/* --- APPEAL AUTHORITY ACTIONS --- */}
          {showAppealActionBox && (
              <div className="mt-8 border-t border-border pt-6 bg-primary/5 p-4 rounded-lg border-primary/20">
                  <h3 className="text-lg font-bold text-foreground mb-4">Appeal Authority Actions</h3>
                  
                  {/* Input for Decision Comments */}
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-1">Decision Comment / Reason</label>
                      <textarea 
                          value={appealComment} 
                          onChange={e => setAppealComment(e.target.value)} 
                          className="input-base w-full p-2 border rounded" 
                          rows={3}
                          placeholder="Required for Rejection or Granting..."
                      />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                          onClick={() => handleAppealAction('grant')} 
                          disabled={isActionLoading} 
                          className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                          Grant Appeal
                      </button>
                      <button 
                          onClick={() => handleAppealAction('reject')} 
                          disabled={isActionLoading} 
                          className="flex-1 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                      >
                          Reject Appeal
                      </button>
                      
                      {/* Escalate Button - Toggles Escalation Mode */}
                      <button 
                          onClick={() => setIsEscalating(true)} 
                          disabled={isActionLoading} 
                          className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                      >
                          Escalate Appeal
                      </button>
                  </div>
              </div>
          )}

          {/* --- ESCALATION FORM --- */}
          {isEscalating && (
              <div className="mt-8 bg-card border border-border p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-4">Escalate Appeal</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                      You are escalating this appeal to the next level in the chain of command. 
                      Please provide a justification for this escalation.
                  </p>
                  <form onSubmit={handleEscalate} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Escalation Justification</label>
                          {/* Note: We reuse appealJustification state as required by handleEscalate */}
                          <textarea 
                              required
                              value={appealJustification} 
                              onChange={e => setAppealJustification(e.target.value)} 
                              rows={4} 
                              className="input-base w-full p-2 border rounded"
                              placeholder="Why is this being escalated?"
                          />
                      </div>
                      <div className="flex gap-4">
                          <button 
                              type="button" 
                              onClick={() => setIsEscalating(false)} 
                              disabled={isActionLoading}
                              className="w-1/2 py-2 border border-input rounded-md text-foreground hover:bg-accent"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              disabled={isActionLoading} 
                              className="w-1/2 py-2 bg-orange-500 text-white rounded-md shadow hover:bg-orange-600 disabled:opacity-50"
                          >
                              {isActionLoading ? 'Processing...' : 'Confirm Escalation'}
                          </button>
                      </div>
                  </form>
              </div>
          )}

          {/* --- ACTION BUTTONS (Approver) --- */}
          {showActionBox && (
            <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Actions</h3>
                <textarea placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} className="input-base w-full mb-4" rows={3} />
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => handleApprovalAction('approve')} disabled={isActionLoading} className="flex-1 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">Approve</button>
                    
                    {isCommandant && (
                        <button 
                            onClick={() => { setEditIntent('approve'); setIsEditing(true); }} 
                            disabled={isActionLoading}
                            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            Edit & Approve
                        </button>
                    )}

                    <button onClick={() => handleApprovalAction('kickback')} disabled={isActionLoading} className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50">Kick Back</button>
                    <button onClick={() => handleApprovalAction('reject')} disabled={isActionLoading} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50">Reject</button>
                </div>
            </div>
          )}

          {/* --- REVISION BOX --- */}
          {showRevisionBox && (
            <div className="mt-8 bg-orange-500/10 border border-orange-500/30 p-4 rounded">
              <h3 className="text-lg font-medium text-orange-700 dark:text-orange-300">Needs Revision</h3>
              <p className="text-sm mt-1 mb-3 text-orange-600 dark:text-orange-400">Please edit and resubmit this report.</p>
              <button onClick={() => { setEditIntent('resubmit'); setIsEditing(true); }} className="py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90">Edit & Resubmit</button>
            </div>
          )}

          {/* PULL BUTTON */}
          {showPullButton && (
            <div className="mt-8 border-t border-border pt-6">
              <button 
                onClick={() => setIsPullModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <span className="mr-2">↩</span> Pull Report
              </button>
              
            </div>
          )}
        </div>
      )}

      {/* --- HISTORY LOG --- */}
      {!isEditing && (
          <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
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

      {/* --- PULL MODAL --- */}
      {isPullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full border border-border">
            <h2 className="text-2xl font-bold text-foreground">Pull Report</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                This will retract the report, set demerits to zero, and remove it from the approval chain.
              </p>
            <textarea
                rows={3}
                value={pullComment}
                onChange={(e) => setPullComment(e.target.value)}
                className="mt-4 block w-full input-base"
                placeholder="Reason for pulling..."
            />
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsPullModalOpen(false)} className="w-1/2 py-2 border border-input rounded text-foreground hover:bg-accent">Cancel</button>
              <button onClick={handlePullReport} disabled={!pullComment.trim()} className="w-1/2 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50">Confirm Pull</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}