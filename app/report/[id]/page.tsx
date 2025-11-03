// in app/report/[id]/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import React from 'react' 

// *** UPDATED TYPE ***
type Report = {
  id: string;
  title: string;
  status: string;
  content: { 
    category: string;
    demerit_count: number;
    notes: string;
  };
  submitted_by: string;
  current_approver_group_id: string | null; 
  date_of_offense: string;
  subject: { first_name: string, last_name: string }; // Changed
  submitter: { first_name: string, last_name: string }; // Changed
};

// *** UPDATED TYPE ***
type Log = {
  id: string;
  action: string;
  comment: string;
  created_at: string;
  actor: { first_name: string, last_name: string } | null; // Changed
};

export default function ReportDetails({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  
  const params = React.use(paramsPromise);

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

  // *** UPDATED: Format name to "Last, F." ***
  const formatName = (person: { first_name: string, last_name: string } | null) => {
    if (!person) return 'N/A';
    const firstInitial = person.first_name ? `${person.first_name[0]}.` : '';
    return `${person.last_name}, ${firstInitial}`;
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

      // *** UPDATED: Fetch first_name, last_name ***
      const { data: reportData, error: reportError } = await supabase
        .from('demerit_reports') 
        .select(`
          *,
          subject:subject_cadet_id ( first_name, last_name ),
          submitter:submitted_by ( first_name, last_name )
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

      // *** UPDATED: Fetch first_name, last_name ***
      const { data: logData, error: logError } = await supabase
        .from('approval_log')
        .select(`
          *,
          actor:actor_id ( first_name, last_name )
        `)
        .eq('report_id', params.id) 
        .order('created_at', { ascending: false })
      
      if (logData) setLogs(logData as Log[])

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

  // 2. Function to call 'handle_approval'
  async function onApprove() {
    if (!report || !window.confirm('Are you sure you want to approve?')) return
    setActionLoading(true)
    
    const { error: rpcError } = await supabase.rpc('handle_approval', {
      report_id_to_approve: report.id,
      approval_comment: comment || 'Approved'
    })
    
    if (rpcError) {
      alert(rpcError.message)
      setActionLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // 3. Function to call 'handle_rejection'
  async function onReject() {
    if (!report || !window.confirm('Are you sure you want to REJECT? This is final.')) return
    if (!comment) {
      alert("A comment is required for rejection.");
      return;
    }
    setActionLoading(true)

    const { error: rpcError } = await supabase.rpc('handle_rejection', {
      p_report_id: report.id, 
      p_comment: comment
    })
    
    if (rpcError) {
      alert(rpcError.message)
      setActionLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // 4. Function to call 'handle_kickback'
  async function onKickback() {
    if (!report || !window.confirm('Are you sure you want to kick-back for revision?')) return
    if (!comment) {
      alert("A comment is required for kick-back.");
      return;
    }
    setActionLoading(true)

    const { error: rpcError } = await supabase.rpc('handle_kickback', {
      p_report_id: report.id, 
      p_comment: comment
    })
    
    if (rpcError) {
      alert(rpcError.message)
      setActionLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // --- Render logic ---
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading report...</div>
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>
  }
  
  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found or you do not have permission.</div>
  }

  // Show the correct buttons based on user role and report status
  const showApprovalBox = isApprover && report.status === 'pending_approval'
  const showEditButton = isSubmitter && report.status === 'needs_revision'
  const isCompleted = report.status === 'completed' || report.status === 'rejected'

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Card 1: Main Report Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
          <span 
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              report.status === 'completed' ? 'bg-green-100 text-green-800' :
              report.status === 'rejected' ? 'bg-red-100 text-red-800' :
              report.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800' // needs_revision
            }`}
          >
            {report.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Subject</h3>
            {/* *** UPDATED: Display Formatted Name *** */}
            <p className="mt-1 text-lg text-gray-900">{formatName(report.subject)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Submitted By</h3>
            {/* *** UPDATED: Display Formatted Name *** */}
            <p className="mt-1 text-lg text-gray-900">{formatName(report.submitter)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Offense</h3>
            <p className="mt-1 text-lg text-gray-900">{new Date(report.date_of_offense).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="mt-1 text-lg text-gray-900">{report.content.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Demerits</h3>
            <p className="mt-1 text-lg font-bold text-red-600">{report.content.demerit_count}</p>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-700 mt-6">Notes:</h3>
        <p className="mt-2 text-sm text-gray-800 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
          {report.content.notes}
        </p>
      </div>

      {/* Card 2: Action Box (if you're an approver) */}
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
      {showEditButton && (
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-yellow-800">This report needs your revision.</h3>
          <p className="mt-2 text-sm text-yellow-700">Please review the comments in the history log, then edit and re-submit the report.</p>
          <button 
            disabled 
            className="mt-4 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Edit Report (Not Implemented)
          </button>
        </div>
      )}

      {/* Card 4: History Log */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">History</h3>
        <ul className="mt-4 space-y-4">
          {logs.length > 0 ? logs.map(log => (
            <li key={log.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">
                  {/* *** UPDATED: Display Formatted Name *** */}
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
    </div>
  )
}

