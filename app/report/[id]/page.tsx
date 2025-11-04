// in app/report/[id]/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import React from 'react' 
import CloseButton from '@/app/components/CloseButton'
// *** NEW: Link is no longer needed for editing ***

// *** REFACTORED TYPE ***
type Report = {
  id: string;
  status: string;
  notes: string | null;
  submitted_by: string;
  current_approver_group_id: string | null; 
  date_of_offense: string;
  // *** NEW: Added offense_type_id for the edit form ***
  offense_type_id: string;
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

// *** NEW: Type for the offense dropdown ***
type OffenseType = {
  id: string;
  offense_group: string;
  offense_name: string;
  demerits: number;
}

export default function ReportDetails({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  
  const params = React.use(paramsPromise);
  const reportId = params.id; // Get ID from params

  const supabase = createClient()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [comment, setComment] = useState('')
  const [user, setUser] = useState<User | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setActionLoading] = useState(false)
  const [isSubmitter, setIsSubmitter] = useState(false)
  const [isApprover, setIsApprover] = useState(false)

  // *** NEW: State for toggling edit mode ***
  const [isEditing, setIsEditing] = useState(false);

  // *** NEW: State for the edit form fields ***
  const [offenses, setOffenses] = useState<OffenseType[]>([]);
  const [editableOffenseId, setEditableOffenseId] = useState('');
  const [editableNotes, setEditableNotes] = useState('');
  const [editableDate, setEditableDate] = useState('');

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

  // 1. Fetch all report data and its approval log
  useEffect(() => {
    async function getReportData() {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // *** REFACTORED: Select joins all the new data ***
      const { data: reportData, error: reportError } = await supabase
        .from('demerit_reports') 
        .select(`
          id, status, notes, submitted_by, current_approver_group_id, date_of_offense,
          offense_type_id,
          subject:subject_cadet_id ( first_name, last_name ),
          submitter:submitted_by ( first_name, last_name ),
          offense_type:offense_type_id ( * )
        `)
        .eq('id', params.id)
        .single() 

      if (reportError) {
        setError('Could not load report: ' + reportError.message)
        setLoading(false)
        return
      }
      
      setReport(reportData as Report) 
      setIsSubmitter(reportData.submitted_by === user.id)

      // *** NEW: Fetch offense types FOR THE DROPDOWN if user is submitter ***
      if (reportData.submitted_by === user.id) {
        const { data: offensesData, error: offensesError } = await supabase
          .from('offense_types')
          .select('id, offense_group, offense_name, demerits')
          .order('offense_group')
          .order('offense_name')
          
        if (offensesError) {
          console.error("Could not fetch offense types:", offensesError.message)
        } else if (offensesData) {
          setOffenses(offensesData)
        }
      }

      // Fetch logs
      const { data: logData, error: logError } = await supabase
        .from('approval_log')
        .select(`
          *,
          actor:actor_id ( first_name, last_name )
        `)
        .eq('report_id', params.id) 
        .order('created_at', { ascending: false })
      
      if (logData) setLogs(logData as Log[])

      // Check for approver status
      if (reportData.current_approver_group_id) {
        const { data: groupMember, error: groupError } = await supabase
          .from('group_members')
          .select('user_id') 
          .eq('group_id', reportData.current_approver_group_id)
          .eq('user_id', user.id)
          .maybeSingle() 
        
        if (groupMember) {
          setIsApprover(true)
        }
      }
      
      setLoading(false)
    }
    
    getReportData()
  }, [supabase, params.id, router])

  // --- RPC functions for approval (onApprove, onReject, onKickback) ---
  // These remain the same as before
    
  async function onApprove() {
    if (!report || !window.confirm('Are you sure you want to approve?')) return
    setActionLoading(true)
    const { error: rpcError } = await supabase.rpc('handle_approval', {
      report_id_to_approve: report.id,
      approval_comment: comment || 'Approved'
    })
    if (rpcError) {
      alert(rpcError.message); setActionLoading(false);
    } else {
      router.push('/'); router.refresh();
    }
  }

  async function onReject() {
    if (!report || !window.confirm('Are you sure you want to REJECT? This is final.')) return
    if (!comment) { alert("A comment is required for rejection."); return; }
    setActionLoading(true)
    const { error: rpcError } = await supabase.rpc('handle_rejection', {
      p_report_id: report.id, p_comment: comment
    })
    if (rpcError) {
      alert(rpcError.message); setActionLoading(false);
    } else {
      router.push('/'); router.refresh();
    }
  }

  async function onKickback() {
    if (!report || !window.confirm('Are you sure you want to kick-back for revision?')) return
    if (!comment) { alert("A comment is required for kick-back."); return; }
    setActionLoading(true)
    const { error: rpcError } = await supabase.rpc('handle_kickback', {
      p_report_id: report.id, p_comment: comment
    })
    if (rpcError) {
      alert(rpcError.message); setActionLoading(false);
    } else {
      router.push('/'); router.refresh();
    }
  }

  // --- *** NEW: Functions for inline editing *** ---

  // 4. Function to toggle "Edit Mode" on
  function handleEditClick() {
    if (!report) return;
    setIsEditing(true);
    // Pre-populate the editable state
    setEditableOffenseId(report.offense_type_id);
    setEditableNotes(report.notes || '');
    setEditableDate(new Date(report.date_of_offense).toISOString().split('T')[0]);
  }

  // 5. Function to cancel editing
  function handleCancelClick() {
    setIsEditing(false);
    // Clear any errors
    setError(null);
  }

  // 6. Function to handle resubmission
  async function handleResubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionLoading(true); // Use the same loading state
    setError(null);

    const { error: rpcError } = await supabase.rpc('resubmit_report', {
      p_report_id: reportId,
      p_new_offense_type_id: editableOffenseId,
      p_new_notes: editableNotes,
      p_new_date_of_offense: editableDate
    });

    setActionLoading(false);

    if (rpcError) {
      setError('Error resubmitting report: ' + rpcError.message);
    } else {
      // Success!
      setIsEditing(false); // Turn off edit mode
      router.push('/'); // Go to dashboard
      router.refresh(); // Refresh dashboard data
    }
  }

  // 7. Group offenses for the dropdown
  const groupedOffenses = offenses.reduce((acc, offense) => {
    const group = offense.offense_group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(offense);
    return acc;
  }, {} as Record<string, OffenseType[]>);


  // --- Render logic ---
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading report...</div>
  }
  
  if (error && !isActionLoading) {
    return <div className="p-8 text-center text-red-600">{error}</div>
  }
  
  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found or you do not have permission.</div>
  }

  const showApprovalBox = isApprover && report.status === 'pending_approval' && !isEditing;
  const showEditButton = isSubmitter && report.status === 'needs_revision' && !isEditing;
  const showHistory = !isEditing; // Don't show history log when editing

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* --- Card 1: Conditional View/Edit Card --- */}
      
      {/* *** NEW: If editing, show the form. If not, show details. *** */}
      {isEditing ? (
        
        /* --- THE EDIT FORM (Card 1) --- */
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleResubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Edit & Resubmit Report
            </h2>
            
            {/* Subject Cadet Field (Read-only) */}
            <div>
              <label htmlFor="cadet" className="block text-sm font-medium text-gray-700">
                Subject Cadet (Cannot be changed)
              </label>
              <input 
                type="text"
                id="cadet"
                value={formatName(report.subject)}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
              />
            </div>

            {/* Date of Offense */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date of Offense
              </label>
              <input 
                id="date"
                type="date"
                value={editableDate} 
                onChange={(e) => setEditableDate(e.target.value)} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Offense Type Dropdown */}
            <div>
              <label htmlFor="offense_type" className="block text-sm font-medium text-gray-700">
                Offense
              </label>
              <select 
                id="offense_type"
                value={editableOffenseId} 
                onChange={(e) => setEditableOffenseId(e.target.value)} 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select an offense...</option>
                {Object.entries(groupedOffenses).map(([groupName, groupOffenses]) => (
                  <optgroup label={groupName} key={groupName}>
                    {groupOffenses.map((offense) => (
                      <option key={offense.id} value={offense.id}>
                        ({offense.demerits} demerits) {offense.offense_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea 
                id="notes"
                value={editableNotes} 
                onChange={(e) => setEditableNotes(e.target.value)} 
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Provide specific details of the incident..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                type="button" // Important: type=button to not submit form
                onClick={handleCancelClick}
                disabled={isActionLoading}
                className="w-1/2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isActionLoading}
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {isActionLoading ? 'Resubmitting...' : 'Resubmit Report'}
              </button>
            </div>
            
            {/* Show resubmit errors here */}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </div>

      ) : (

        /* --- THE REPORT DETAILS VIEW (Card 1) --- */
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">{report.offense_type.offense_name}</h1>
            <span 
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                report.status === 'completed' ? 'bg-green-100 text-green-800' :
                report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                report.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800' // needs_revision
              }`}
            >
              {formatStatus(report.status)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Subject</h3>
              <p className="mt-1 text-lg text-gray-900">{formatName(report.subject)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Submitted By</h3>
              <p className="mt-1 text-lg text-gray-900">{formatName(report.submitter)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date of Offense</h3>
              <p className="mt-1 text-lg text-gray-900">{new Date(report.date_of_offense).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 text-lg text-gray-900">
                Category {report.offense_type.offense_code}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Demerits</h3>
              <p className="mt-1 text-lg font-bold text-red-600">{report.offense_type.demerits}</p>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-700 mt-6">Notes:</h3>
          <p className="mt-2 text-sm text-gray-800 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
            {report.notes || "No additional notes provided."}
          </p>
        </div>

      )} {/* --- End of Conditional Card 1 --- */}


      {/* Card 2: Action Box (if you're an approver) */}
      {/* This box is now hidden if editing: showApprovalBox */}
      {showApprovalBox && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
          <div className="mt-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Add a Comment (Required for Reject/Kick-back)
            </label>
            <textarea 
              id="comment"
              placeholder="Your comments will be logged..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
              disabled={isActionLoading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button 
              onClick={onApprove} 
              disabled={isActionLoading}
              className="flex-1 justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              Approve
            </button>
            <button 
              onClick={onKickback} 
              disabled={isActionLoading}
              className="flex-1 justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400"
            >
              Kick-back for Revision
            </button>
            <button 
              onClick={onReject} 
              disabled={isActionLoading}
              className="flex-1 justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
            >
              Reject (Final)
            </button>
          </div>
        </div>
      )}
      
      {/* Card 3: Revision Box (if you're the submitter) */}
      {/* This box is now hidden if editing: showEditButton */}
      {showEditButton && (
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-yellow-800">This report needs your revision.</h3>
          <p className="mt-2 text-sm text-yellow-700">Please review the comments in the history log, then edit and re-submit the report.</p>
          
          {/* *** NEW: This button now toggles edit mode *** */}
          <button 
            onClick={handleEditClick}
            className="mt-4 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Edit Report
          </button>
        </div>
      )}

      {/* Card 4: History Log */}
      {/* *** NEW: This card is now hidden if editing *** */}
      {showHistory && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">History</h3>
          <ul className="mt-4 space-y-4">
            {logs.length > 0 ? logs.map(log => (
              <li key={log.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">
                    <strong>{formatName(log.actor)}</strong>: 
                    <span className="font-semibold text-indigo-600 ml-1">{log.action}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                {log.comment && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    "{log.comment}"
                  </p>
                )}
              </li>
            )) : <p className="text-sm text-gray-500">No history for this report yet.</p>}
          </ul>
        </div>
      )}
    </div>
  )
}