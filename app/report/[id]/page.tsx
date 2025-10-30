// in app/report/[id]/page.tsx
'use client' // This page is interactive, so it's a client component

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

// Define types for our data
type Report = {
  id: string;
  title: string;
  status: string;
  content: { details: string };
  submitted_by: string;
  current_approver_group_id: string;
  // Add 'profiles' if you fetch submitter/subject names
};

type Log = {
  id: string;
  action: string;
  comment: string;
  created_at: string;
  // Add 'profiles' if you fetch actor name
};

export default function ReportDetails({ params }: { params: { id: string } }) {
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

  // 1. Fetch all report data and its approval log
  useEffect(() => {
    async function getReportData() {
      setLoading(true)

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch the report
      // Your RLS policy will deny this if the user isn't involved
      const { data: reportData, error: reportError } = await supabase
        .from('reports') // Use 'demerit_reports' if that's your table name
        .select('*')
        .eq('id', params.id)
        .single() // We only expect one

      if (reportError) {
        setError('Could not load report: ' + reportError.message)
        setLoading(false)
        return
      }
      
      setReport(reportData)
      setIsSubmitter(reportData.submitted_by === user.id)

      // Fetch the report's history
      const { data: logData } = await supabase
        .from('approval_log')
        .select('*') // You can join with profiles: '*, actor:profiles(full_name)'
        .eq('report_id', params.id)
        .order('created_at', { ascending: false })
      
      if (logData) setLogs(logData)

      // Check if the current user is in the approval group
      if (reportData.current_approver_group_id) {
        const { data: groupMember, error: groupError } = await supabase
          .from('group_members')
          .select()
          .eq('group_id', reportData.current_approver_group_id)
          .eq('user_id', user.id)
          .maybeSingle() // Use .maybeSingle() to check for one or none
        
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
    setActionLoading(true)

    const { error: rpcError } = await supabase.rpc('handle_rejection', {
      report_id_to_reject: report.id,
      rejection_comment: comment || 'Rejected'
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
    setActionLoading(true)

    const { error: rpcError } = await supabase.rpc('handle_kickback', {
      report_id_to_kickback: report.id,
      kickback_comment: comment || 'Needs revision'
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
  if (loading) return <div>Loading report...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!report) return <div>Report not found or you do not have permission.</div>

  // Show the correct buttons based on user role and report status
  const showApprovalBox = isApprover && report.status === 'pending_approval'
  const showEditButton = isSubmitter && report.status === 'needs_revision'

  return (
    <div style={{ padding: '2em' }}>
      <h1>{report.title}</h1>
      <p>Status: <strong>{report.status}</strong></p>
      
      <h3>Report Details:</h3>
      <pre style={{ background: '#f4f4f4', padding: '1em', borderRadius: '5px' }}>
        {JSON.stringify(report.content, null, 2)}
      </pre>

      {/* --- Action Box --- */}
      {showApprovalBox && (
        <div style={{ border: '1px solid #ccc', padding: '1em', margin: '1em 0' }}>
          <h3>Actions</h3>
          <textarea 
            placeholder="Add a comment..." 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            style={{ width: '100%', minHeight: '60px' }}
            disabled={isActionLoading}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={onApprove} disabled={isActionLoading}>Approve</button>
            <button onClick={onKickback} disabled={isActionLoading}>Kick-back for Revision</button>
            <button onClick={onReject} disabled={isActionLoading} style={{ background: 'red' }}>Reject (Final)</button>
          </div>
        </div>
      )}
      
      {/* --- Revision Button --- */}
      {showEditButton && (
        <div style={{ border: '1px solid #ccc', padding: '1em', margin: '1em 0' }}>
          <h3>This report needs your revision.</h3>
          <p>Please edit the report and re-submit.</p>
          {/* We'll build this 'edit' page later if needed */}
          <button disabled>Edit Report (Not Implemented)</button>
        </div>
      )}

      {/* --- History Log --- */}
      <h3>History</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {logs.map(log => (
          <li key={log.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            <strong>{log.action}</strong> at {new Date(log.created_at).toLocaleString()}
            {log.comment && <p style={{ margin: '5px 0 0 10px' }}>"{log.comment}"</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}