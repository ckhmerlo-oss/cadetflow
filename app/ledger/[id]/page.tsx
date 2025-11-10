// in app/ledger/[id]/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import React from 'react'
import Link from 'next/link'

type AuditLogEvent = {
  event_date: string
  event_type: 'demerit' | 'served'
  title: string
  details: string | null
  demerits_issued: number
  tour_change: number | null
  actor_name: string
  status: string
  report_id: string | null
  appeal_status: string | null
  appeal_note: string | null
}

type LedgerStats = {
  term_demerits: number
  year_demerits: number
  total_tours_marched: number
  current_tour_balance: number
}

type AcademicTerm = {
  id: string
  term_name: string
  start_date: string
  end_date: string
}

type CadetProfile = {
  first_name: string
  last_name: string
  role: { role_name: string } | null
}

export default function LedgerPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise)
  const targetCadetId = params.id

  const supabase = createClient()
  const [fullLog, setFullLog] = useState<AuditLogEvent[]>([])
  const [stats, setStats] = useState<LedgerStats | null>(null)
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [cadetProfile, setCadetProfile] = useState<CadetProfile | null>(null)
  const [selectedTermId, setSelectedTermId] = useState<string>('all')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false); setError("You must be logged in."); return;
      }

      const [logRes, statsRes, termsRes, profileRes] = await Promise.all([
        supabase.rpc('get_cadet_audit_log', { p_cadet_id: targetCadetId }),
        supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: targetCadetId }).single(),
        supabase.from('academic_terms').select('*').order('start_date', { ascending: false }),
        supabase.from('profiles').select('first_name, last_name, role:roles(role_name)').eq('id', targetCadetId).single()
      ])

      if (logRes.error) setError(logRes.error.message)
      else setFullLog(logRes.data as AuditLogEvent[])

      if (statsRes.error) console.error("Error fetching stats:", statsRes.error.message)
      else setStats(statsRes.data as LedgerStats)

      if (termsRes.data) setTerms(termsRes.data as AcademicTerm[])
      if (profileRes.data) setCadetProfile(profileRes.data as any)

      setLoading(false)
    }
    getData()
  }, [supabase, targetCadetId])

  const displayedLog = useMemo(() => {
    if (selectedTermId === 'all') return fullLog
    const term = terms.find(t => t.id === selectedTermId)
    if (!term) return fullLog
    return fullLog.filter(event => 
      event.event_date >= term.start_date && event.event_date <= term.end_date
    )
  }, [fullLog, selectedTermId, terms])

  // --- HELPERS ---
  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Approved'; case 'rejected': return 'Rejected';
      case 'pending_approval': return 'Pending'; case 'needs_revision': return 'Revision Needed';
      default: return status;
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }
  const getDisplayStatus = (event: AuditLogEvent) => {
    // If appeal is granted, override the main status text
    if (event.appeal_status === 'approved') return 'Appeal Granted';
    return formatStatus(event.status);
  }
  const getDisplayStatusColor = (event: AuditLogEvent) => {
     // If appeal is granted, override main status color to Purple
     if (event.appeal_status === 'approved') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
     return getStatusColor(event.status);
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          header, .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; }
          .print-card { box-shadow: none !important; border: 1px solid #ccc !important; break-inside: avoid; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 print-container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Reports</h1>
            {cadetProfile && (
               <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                 {cadetProfile.last_name}, {cadetProfile.first_name} - {cadetProfile.role?.role_name || 'Unassigned'}
               </p>
            )}
          </div>
          <div className="flex gap-4 no-print w-full sm:w-auto">
             <select value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}
                className="block w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="all">All Time</option>
                {terms.map(term => (<option key={term.id} value={term.id}>{term.term_name}</option>))}
              </select>
            <button onClick={() => window.print()} className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
              Print
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {!loading && !error && (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-4">
                <StatBox label="Term Demerits" value={stats.term_demerits} />
                <StatBox label="Year Demerits" value={stats.year_demerits} />
                <StatBox label="Tours Marched (Total)" value={stats.total_tours_marched} />
                <StatBox label="Current Tour Balance" value={stats.current_tour_balance} highlight />
              </div>
            )}

            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {displayedLog.map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-8 print:pb-4">
                      {eventIdx !== displayedLog.length - 1 ? <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-300 dark:bg-gray-700" aria-hidden="true" /> : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="no-print">
                          <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${event.event_type === 'demerit' ? 'bg-red-600' : 'bg-green-500'}`}>
                            <span className="text-white font-bold">{event.event_type === 'demerit' ? 'D' : 'T'}</span>
                          </span>
                        </div>
                        
                        <div className="min-w-0 flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 print-card">
                          <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center flex-wrap gap-2">
                                  {event.event_type === 'demerit' && event.report_id ? (
                                    <Link href={`/report/${event.report_id}`} className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                      {event.title}
                                    </Link>
                                  ) : (
                                    event.title
                                  )}
                                  
                                  {/* --- UPDATED APPEAL BADGES --- */}
                                  {/* Approved = Purple */}
                                  {event.appeal_status === 'approved' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Appeal Granted</span>}
                                  
                                  {/* Rejected Final = Orange */}
                                  {event.appeal_status === 'rejected_final' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Appeal Denied</span>}
                                  
                                  {/* Pending = Blue */}
                                  {['pending_issuer', 'pending_chain', 'pending_commandant'].includes(event.appeal_status || '') && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Appeal Pending</span>
                                  )}
                                  
                                  {/* Rejected but can escalate = Yellow */}
                                  {['rejected_by_issuer', 'rejected_by_chain'].includes(event.appeal_status || '') && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Appeal Rejected - Can Escalate</span>
                                  )}
                                </h3>
                              </div>
                              {/* Main Status Pill (overridden if appeal granted) */}
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${event.event_type === 'served' ? getStatusColor('completed') : getDisplayStatusColor(event)}`}>
                                {getDisplayStatus(event)}
                              </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.event_date).toLocaleString()}</p>
                          
                          <div className="mt-3 grid grid-cols-2 gap-4">
                             {event.event_type === 'demerit' ? (
                               <div>
                                 <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Demerits Issued</p>
                                 {/* Strike through demerits if rejected OR appeal granted */}
                                 <p className={`text-base font-bold ${event.status === 'rejected' || event.appeal_status === 'approved' ? 'line-through text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                                   {event.demerits_issued}
                                 </p>
                               </div>
                             ) : (
                               <div>
                                 <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Tours Served</p>
                                 <p className="text-base font-bold text-green-600 dark:text-green-400">
                                   {Math.abs(event.tour_change || 0)}
                                 </p>
                               </div>
                             )}
                          </div>

                          <div className="mt-3 pt-3 border-t dark:border-gray-700">
                             <p className="text-sm text-gray-700 dark:text-gray-300">
                               <span className="font-medium">{event.event_type === 'demerit' ? 'Submitted by:' : 'Logged by:'}</span> {event.actor_name || 'System'}
                             </p>
                             {event.details && <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">"{event.details}"</p>}
                             
                             {/* Final Appeal Note (e.g., from Commandant) */}
                             {event.appeal_note && (
                                <div className={`mt-2 p-2 border-l-4 rounded text-sm ${event.appeal_status === 'approved' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'}`}>
                                  <span className={`font-medium ${event.appeal_status === 'approved' ? 'text-purple-800 dark:text-purple-300' : 'text-orange-800 dark:text-orange-300'}`}>
                                      Appeal Decision Note: 
                                  </span>
                                  <span className={event.appeal_status === 'approved' ? 'text-purple-900 dark:text-purple-100' : 'text-orange-900 dark:text-orange-100'}>
                                      "{event.appeal_note}"
                                  </span>
                                </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function StatBox({ label, value, highlight = false }: { label: string, value: number, highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
      <p className={`text-xs font-medium uppercase ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}