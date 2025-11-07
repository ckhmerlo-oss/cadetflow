// in app/ledger/[id]/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import React from 'react'

// --- Types ---
type AuditLogEvent = {
  event_date: string
  event_type: 'demerit' | 'served'
  title: string
  details: string | null
  demerits_issued: number // <-- NEW
  tour_change: number     // <-- RENAMED from 'amount'
  actor_name: string
  status: string
  running_balance: number
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
  const [stats, setStats] = useState<LedgerStats | null>(null) // <-- NEW STATE
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

      // Fetch everything in parallel
      const [logRes, statsRes, termsRes, profileRes] = await Promise.all([
        supabase.rpc('get_cadet_audit_log', { p_cadet_id: targetCadetId }),
        supabase.rpc('get_cadet_ledger_stats', { p_cadet_id: targetCadetId }).single(), // <-- NEW RPC CALL
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

  // --- Filtering Logic (Unchanged) ---
  const displayedLog = useMemo(() => {
    if (selectedTermId === 'all') return fullLog
    const term = terms.find(t => t.id === selectedTermId)
    if (!term) return fullLog
    return fullLog.filter(event => 
      event.event_date >= term.start_date && event.event_date <= term.end_date
    )
  }, [fullLog, selectedTermId, terms])

  // --- Starting Balance Logic (Unchanged) ---
  const startingBalanceEvent = useMemo(() => {
    if (selectedTermId === 'all') return null;
    const term = terms.find(t => t.id === selectedTermId)
    if (!term) return null;
    const previousEvent = fullLog.find(event => event.event_date < term.start_date);
    return {
        balance: previousEvent ? previousEvent.running_balance : 0,
        date: term.start_date
    };
  }, [fullLog, selectedTermId, terms])

  // --- Helpers (Status Colors Unchanged) ---
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
        {/* --- Header & Controls --- */}
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
            {/* --- NEW: Fast Facts Dashboard --- */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-4">
                <StatBox label="Term Demerits" value={stats.term_demerits} />
                <StatBox label="Year Demerits" value={stats.year_demerits} />
                <StatBox label="Tours Marched (Total)" value={stats.total_tours_marched} />
                <StatBox label="Current Tour Balance" value={stats.current_tour_balance} highlight />
              </div>
            )}

            {/* --- Audit Log List --- */}
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {displayedLog.map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-8 print:pb-4">
                      {eventIdx !== displayedLog.length - 1 ? <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-300 dark:bg-gray-700" aria-hidden="true" /> : null}                      <div className="relative flex items-start space-x-3">
                        <div className="no-print">
                          <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${event.event_type === 'demerit' ? 'bg-red-600' : 'bg-green-500'}`}>
                            <span className="text-white font-bold">{event.event_type === 'demerit' ? 'D' : 'T'}</span>
                          </span>
                        </div>
                        
                        <div className="min-w-0 flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 print-card">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${event.event_type === 'served' ? getStatusColor('completed') : getStatusColor(event.status)}`}>
                              {formatStatus(event.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.event_date).toLocaleString()}</p>
                          
                          {/* --- UPDATED GRID for Demerits vs Tours --- */}
                          <div className="mt-3 grid grid-cols-3 gap-4">
                             {/* Col 1: Demerits Issued (Only if it's a demerit report) */}
                             {event.event_type === 'demerit' ? (
                               <div>
                                 <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Demerits</p>
                                 <p className={`text-base font-medium ${event.status === 'rejected' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                   {event.demerits_issued}
                                 </p>
                               </div>
                             ) : <div />} 

                             {/* Col 2: Tour Change */}
                             <div>
                               <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Tour Change</p>
                               <p className={`text-base font-bold ${event.status === 'rejected' ? 'line-through text-gray-400' : (event.tour_change > 0 ? 'text-red-600 dark:text-red-400' : (event.tour_change < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'))}`}>
                                 {event.tour_change > 0 ? `+${event.tour_change}` : event.tour_change}
                               </p>
                             </div>

                             {/* Col 3: Running Balance */}
                             {event.status !== 'rejected' && (
                               <div className="text-right">
                                 <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Balance</p>
                                 <p className="text-base font-bold text-gray-900 dark:text-white">{event.running_balance}</p>
                               </div>
                             )}
                          </div>

                          <div className="mt-3 pt-3 border-t dark:border-gray-700">
                             <p className="text-sm text-gray-700 dark:text-gray-300">
                               <span className="font-medium">{event.event_type === 'demerit' ? 'Submitted by:' : 'Logged by:'}</span> {event.actor_name || 'System'}
                             </p>
                             {event.details && <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">"{event.details}"</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {/* (Starting Balance Row remains the same) */}
                {startingBalanceEvent && (
                   <li>
                     <div className="relative pb-8">
                       <div className="relative flex items-start space-x-3">
                         <div className="no-print"><span className="h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 bg-gray-400"><span className="text-white font-bold">B</span></span></div>
                         <div className="min-w-0 flex-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                           <div className="flex justify-between items-center">
                             <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Starting Balance</h3>
                             <span className="text-lg font-bold text-gray-900 dark:text-white">{startingBalanceEvent.balance} Tours</span>
                           </div>
                           <p className="text-sm text-gray-500 dark:text-gray-400">Carried forward (as of {new Date(startingBalanceEvent.date).toLocaleDateString()})</p>
                         </div>
                       </div>
                     </div>
                   </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// --- NEW Helper Component ---
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