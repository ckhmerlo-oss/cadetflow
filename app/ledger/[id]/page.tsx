'use client'

import { createClient } from '@/utils/supabase/client'
import { buildLoginUrl } from '@/utils/auth-redirect'
import { useState, useEffect, useMemo, useCallback } from 'react'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PeriodSelector from '@/app/components/PeriodSelector'
import type { PeriodSelection, AcademicTermRow, CadetPeriodStats } from '@/app/lib/period-types'
import { buildDefaultPeriodSelection, periodBoundsFromTerms, selectableTerms, selectableYears } from '@/app/lib/period-utils'

// ... (Types remain the same) ...
type AuditLogEvent = {
  event_date: string
  event_type: 'demerit' | 'served' | 'adjustment'
  title: string
  details: string | null
  demerits_issued: number
  tour_change: number | null
  actor_name: string
  status: string
  report_id: string | null
  appeal_status: string | null
  appeal_note: string | null
  date_of_offense: string | null
  policy_category?: number
}

type LedgerStats = {
  term_demerits: number
  year_demerits: number
  total_tours_marched: number
  current_tour_balance: number | null
  conduct_status?: string
}

type CadetProfile = {
  first_name: string
  last_name: string
  role: { role_name: string } | null
}

export default function LedgerPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise)
  const targetCadetId = params.id
  const router = useRouter()
  const supabase = createClient()

  // --- STATE ---
  const [fullLog, setFullLog] = useState<AuditLogEvent[]>([])
  const [stats, setStats] = useState<LedgerStats | null>(null)
  const [years, setYears] = useState<string[]>([])
  const [allTerms, setAllTerms] = useState<AcademicTermRow[]>([])
  const [period, setPeriod] = useState<PeriodSelection | null>(null)
  const [cadetProfile, setCadetProfile] = useState<CadetProfile | null>(null)

  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  const [loading, setLoading] = useState(true)
  const [periodLoading, setPeriodLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isArchivedView, setIsArchivedView] = useState(false)

  const loadPeriodData = useCallback(async (selection: PeriodSelection, terms: AcademicTermRow[]) => {
    setPeriodLoading(true)
    const bounds = periodBoundsFromTerms(terms, selection)
    if (!bounds) {
      setPeriodLoading(false)
      return
    }

    const [statsRes, logRes] = await Promise.all([
      supabase.rpc('get_cadet_period_stats', {
        p_cadet_id: targetCadetId,
        p_school_year: selection.schoolYear,
        p_term_number: selection.termNumber,
      }).single(),
      supabase.rpc('get_cadet_ledger_for_period', {
        p_cadet_id: targetCadetId,
        p_start: bounds.start,
        p_end: bounds.end,
      }),
    ])

    if (statsRes.error) setError(statsRes.error.message)
    else {
      const ps = statsRes.data as CadetPeriodStats
      setStats({
        term_demerits: ps.term_demerits,
        year_demerits: ps.year_demerits,
        total_tours_marched: ps.total_tours_marched,
        current_tour_balance: ps.current_tour_balance,
        conduct_status: ps.conduct_status,
      })
    }

    if (logRes.error) setError(logRes.error.message)
    else setFullLog(logRes.data as AuditLogEvent[])

    setPeriodLoading(false)
  }, [supabase, targetCadetId])

  // --- DATA FETCHING (Unchanged) ---
  useEffect(() => {
    async function getData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(buildLoginUrl(window.location.pathname + window.location.search))
        return
      }

      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('archived, company_id')
        .eq('id', targetCadetId)
        .single()

      const targetArchived = targetProfile?.archived === true
      setIsArchivedView(targetArchived)

      const { data: viewerProfile } = await supabase
        .from('profiles')
        .select(`id, company_id, role:role_id (can_manage_all_rosters, can_manage_own_company_roster, role_name, default_role_level)`)
        .eq('id', user.id)
        .single()
        
      if (viewerProfile) {
         const role = viewerProfile.role as any;
         const canManageAll = role?.can_manage_all_rosters || false;
         const canManageOwn = role?.can_manage_own_company_roster || false;
         const isAdmin = role?.role_name === 'Admin' || (role?.default_role_level ?? 0) >= 90;

         if (user.id !== targetCadetId && !isAdmin) {
           if (targetArchived) {
             const { data: canView } = await supabase.rpc('can_view_archived_cadet', { p_cadet_id: targetCadetId })
             if (!canView) {
               setError("Unauthorized: You cannot view this archived cadet's ledger.")
               setLoading(false)
               return
             }
           } else {
             const { data: target } = await supabase.from('profiles').select('company_id').eq('id', targetCadetId).single();
             if (!canManageAll && canManageOwn) {
                 if (target && target.company_id !== viewerProfile.company_id) {
                     setError("Unauthorized: You can only view ledgers within your own company."); setLoading(false); return;
                 }
             } else if (!canManageAll && !canManageOwn) {
                 setError("Unauthorized."); setLoading(false); return;
             }
           }
         }
      }
      

      const [yearsRes, termsRes, profileRes] = await Promise.all([
        supabase.rpc('list_cadet_historical_years', { p_cadet_id: targetCadetId }),
        supabase.from('academic_terms').select('id, term_name, school_year, term_number, start_date, end_date, archived').order('start_date', { ascending: false }),
        supabase.from('profiles').select('first_name, last_name, role:roles(role_name)').eq('id', targetCadetId).single(),
      ])

      const rawYears = (yearsRes.data as { school_year: string }[] | null)?.map((r) => r.school_year) ?? []
      const termRows = selectableTerms((termsRes.data ?? []) as AcademicTermRow[])
      const yearList = selectableYears(termRows, rawYears)
      setYears(yearList)
      setAllTerms(termRows)
      if (profileRes.data) {
        const raw = profileRes.data as { first_name: string; last_name: string; role: { role_name: string } | { role_name: string }[] | null }
        const role = Array.isArray(raw.role) ? raw.role[0] : raw.role
        setCadetProfile({ first_name: raw.first_name, last_name: raw.last_name, role: role ?? null })
      }

      const defaultPeriod = buildDefaultPeriodSelection(yearList, termRows)
      if (defaultPeriod) {
        setPeriod(defaultPeriod)
        await loadPeriodData(defaultPeriod, termRows)
      }

      setLoading(false)
    }
    getData()
  }, [supabase, targetCadetId, router, loadPeriodData])

  const handlePeriodChange = (next: PeriodSelection) => {
    setPeriod(next)
    void loadPeriodData(next, allTerms)
  }
  

  // --- DYNAMIC TITLE UPDATE ---
  useEffect(() => {
    if (cadetProfile) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        document.title = `${cadetProfile.last_name}_Ledger_${dd}${mm}${yy}`;
    }
    return () => { document.title = 'CadetFlow'; }
  }, [cadetProfile]);

  // --- FILTERING LOGIC ---
  const displayedLog = useMemo(() => {
    let data = [...fullLog]

    if (filterType !== 'all') {
        if (filterType === 'tours') {
            data = data.filter(e => e.event_type === 'served' || e.event_type === 'adjustment');
        } else {
            const catNum = parseInt(filterType);
            data = data.filter(e => e.event_type === 'demerit' && (e.policy_category === catNum));
        }
    }

    return data
  }, [fullLog, filterType])

  // --- HELPERS ---
  const formatStatus = (status: string) => { 
    switch (status) { case 'completed': return 'Approved'; case 'rejected': return 'Rejected'; case 'pending_approval': return 'Pending'; case 'needs_revision': return 'Revision Needed'; case 'pulled': return 'Pulled'; default: return status; }
  }
  
  // NOTE: Status colors are usually semantic (Green/Red/Yellow) regardless of theme, 
  // so we keep standard colors but ensure text is legible.
  const getDisplayStatusColor = (event: AuditLogEvent) => {
     if (event.appeal_status === 'approved') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
     switch (event.status) { case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'; case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'; case 'pending_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'; case 'pulled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'; default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'; }
  }
  
  const formatDateTime = (dateStr: string, includeTime = true) => new Date(dateStr).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', ...(includeTime && { hour: 'numeric', minute: '2-digit' }) })

  const formatActorShort = (name: string) => {
      if (!name) return '-';
      const parts = name.split(', ');
      if (parts.length === 2) return `${parts[0]}, ${parts[1].charAt(0)}.`;
      return name; 
  }

  const handleRowClick = (event: AuditLogEvent) => {
    if (event.event_type === 'demerit' && event.report_id) {
        router.push(`/report/${event.report_id}`);
    }
  }

  const truncateText = (text: string | null, limit: number) => {
      if (!text) return null;
      if (text.length <= limit) return text;
      return text.substring(0, limit) + '...';
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          .print-card { box-shadow: none !important; border: 1px solid #ccc !important; break-inside: avoid; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 9pt !important; } 
          th, td { border: 1px solid #999 !important; padding: 4px !important; }
          .print-hidden { display: none !important; }
          .col-status { width: 15% !important; } 
          .no-print-break { break-inside: avoid; }
          .col-title-details { max-width: 250px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 print-container">
        {isArchivedView && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-800 dark:text-amber-200 no-print">
            This cadet is archived. Ledger is read-only historical record.
          </div>
        )}
        {/* HEADER */}
        {cadetProfile && stats?.conduct_status && (
          <div className="hidden print:flex print:justify-between print:items-start print:mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {cadetProfile.last_name}, {cadetProfile.first_name}
            </h1>
            <div className="text-xl font-bold text-foreground">{stats.conduct_status}</div>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
          <div>
            {/* THEMED: Text Colors */}
            <h1 className="text-3xl font-bold text-foreground">Ledger</h1>
            {cadetProfile && (
               <p className="mt-1 text-lg text-muted-foreground">
                 {cadetProfile.last_name}, {cadetProfile.first_name} <span className="text-sm bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">{cadetProfile.role?.role_name || 'Unassigned'}</span>
               </p>
            )}
          </div>
          
          {/* CONTROLS */}
          <div className="flex flex-wrap gap-2 no-print w-full md:w-auto items-center">
             {period && (
               <PeriodSelector
                 years={years}
                 terms={allTerms}
                 value={period}
                 onChange={handlePeriodChange}
                 disabled={periodLoading}
               />
             )}

              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="block w-full sm:w-32 rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm py-2 focus:ring-ring focus:border-ring">
                <option value="all">All Types</option>
                <option value="1">Category I</option>
                <option value="2">Category II</option>
                <option value="3">Category III</option>
                <option value="tours">Tours Only</option>
              </select>

            {/* View Toggle */}
            <div className="hidden sm:flex rounded-md shadow-sm" role="group">
                <button type="button" onClick={() => setViewMode('cards')} 
                    className={`px-4 py-2 text-sm font-medium border rounded-l-lg 
                    ${viewMode === 'cards' 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                    }`}>
                    Cards
                </button>
                <button type="button" onClick={() => setViewMode('list')} 
                    className={`px-4 py-2 text-sm font-medium border rounded-r-lg 
                    ${viewMode === 'list' 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                    }`}>
                    List
                </button>
            </div>

            <button onClick={() => window.print()} className="ml-2 py-2 px-4 rounded-md shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
               Print
            </button>
          </div>
        </div>

        {(loading || periodLoading) && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">{error}</p>}

        {!loading && !periodLoading && !error && (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 print:mb-4 no-print-break">
                {stats.conduct_status && (
                  <div className="print:hidden">
                    <StatBox label="Conduct" value={0} textValue={stats.conduct_status} />
                  </div>
                )}
                <StatBox label="Term Demerits" value={stats.term_demerits} />
                <StatBox label="Year Demerits" value={stats.year_demerits} />
                <StatBox label="Tours Marched" value={stats.total_tours_marched} />
                <StatBox
                  label="Tours Owed"
                  value={stats.current_tour_balance ?? 0}
                  highlight
                  muted={stats.current_tour_balance == null}
                  textValue={stats.current_tour_balance == null ? '—' : undefined}
                />
              </div>
            )}

            {displayedLog.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-border rounded-lg border-dashed">No entries found for this filter.</div>
            ) : (
                <>
                {/* --- CARD VIEW --- */}
                <div className={`${viewMode === 'cards' ? 'block' : 'hidden sm:hidden'} flow-root`}>
                    <ul role="list" className="-mb-8">
                        {displayedLog.map((event, eventIdx) => (
                        <li key={eventIdx}>
                            <div className="relative pb-8 print:pb-4">
                            {eventIdx !== displayedLog.length - 1 ? <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border" aria-hidden="true" /> : null}
                            <div className="relative flex items-start space-x-3">
                                <div className="no-print">
                                <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-background ${event.event_type === 'demerit' ? 'bg-destructive' : 'bg-green-500'}`}>
                                    <span className="text-white font-bold">{event.event_type === 'demerit' ? 'D' : 'T'}</span>
                                </span>
                                </div>
                                
                                {/* THEMED: Card Container */}
                                <div className="min-w-0 flex-1 bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border print-card">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-foreground flex items-center flex-wrap gap-2">
                                        {event.event_type === 'demerit' && event.report_id ? (
                                            <Link href={`/report/${event.report_id}`} className="hover:underline hover:text-primary transition-colors">
                                            {event.title}
                                            </Link>
                                        ) : event.title}
                                        
                                        {event.appeal_status === 'approved' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Appeal Granted</span>}
                                        {['pending_issuer', 'pending_chain', 'pending_commandant'].includes(event.appeal_status || '') && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Appeal Pending</span>}
                                        </h3>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${event.event_type === 'served' ? 'bg-green-100 text-green-800' : getDisplayStatusColor(event)}`}>
                                        {event.event_type === 'served' ? 'Completed' : formatStatus(event.status)}
                                    </span>
                                </div>
                                
                                <div className="mt-1 text-sm text-muted-foreground flex flex-wrap gap-4">
                                    {event.event_type === 'demerit' && event.date_of_offense && <span>Offense: <span className="font-medium">{formatDateTime(event.date_of_offense)}</span></span>}
                                    <span>Logged: {formatDateTime(event.event_date)}</span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-4">
                                    {event.event_type === 'demerit' ? (
                                    <div>
                                        <p className="text-xs uppercase font-semibold text-muted-foreground">Demerits</p>
                                        <p className={`text-base font-bold ${event.status === 'rejected' || event.status === 'pulled' || event.appeal_status === 'approved' ? 'line-through text-muted-foreground' : 'text-destructive'}`}>{event.demerits_issued}</p>
                                    </div>
                                    ) : (
                                    <div>
                                        <p className="text-xs uppercase font-semibold text-muted-foreground">Tours Served</p>
                                        <p className="text-base font-bold text-green-600">{Math.abs(event.tour_change || 0)}</p>
                                    </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-3 border-t border-border text-sm">
                                    <p className="text-foreground"><span className="font-medium">{event.event_type === 'demerit' ? 'By:' : 'Logged By:'}</span> {event.actor_name || 'System'}</p>
                                    {event.details && <p className="text-muted-foreground italic mt-1">"{event.details}"</p>}
                                    {event.appeal_note && (<div className="mt-2 text-orange-800 bg-orange-50 p-2 rounded text-xs"><strong>Appeal Note:</strong> {event.appeal_note}</div>)}
                                </div>
                                </div>
                            </div>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>

                {/* --- LIST / TABLE VIEW --- */}
                {viewMode === 'list' && (
                    <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
                        {/* THEMED: Table Colors */}
                        <table className="min-w-full divide-y divide-border bg-card text-sm table-fixed">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-2 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider w-24">Date</th>
                                    <th className="px-2 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider col-title-details">Title/Details</th>
                                    <th className="px-2 py-3 text-center font-medium text-muted-foreground uppercase tracking-wider w-16">Value</th>
                                    <th className="px-2 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider w-28">By</th>
                                    <th className="px-2 py-3 text-center font-medium text-muted-foreground uppercase tracking-wider w-32 col-status">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {displayedLog.map((event, idx) => (
                                    <tr 
                                        key={idx} 
                                        onClick={() => handleRowClick(event)}
                                        className={`hover:bg-accent/50 transition-colors ${event.event_type === 'demerit' && event.report_id ? 'cursor-pointer' : ''}`}
                                    >
                                        <td className="px-2 py-2 whitespace-nowrap text-foreground truncate">
                                            {formatDateTime(event.event_date, false)}
                                        </td>
                                        
                                        <td className="px-2 py-2 text-card-foreground col-title-details">
                                            <div className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px] print:max-w-[250px]" title={event.title}>
                                                {event.title}
                                            </div>
                                            {event.details && (
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px] print:max-w-[250px]" title={event.details}>
                                                    {truncateText(event.details, 70)}
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td className="px-2 py-2 text-center whitespace-nowrap">
                                            {event.event_type === 'demerit' 
                                                ? <span className={`font-bold ${event.status === 'rejected' || event.status === 'pulled' || event.appeal_status === 'approved' ? 'line-through text-muted-foreground' : 'text-destructive'}`}>{event.demerits_issued}</span>
                                                : <span className="font-bold text-green-600">-{Math.abs(event.tour_change || 0)}</span>
                                            }
                                        </td>
                                        
                                        <td className="px-2 py-2 whitespace-nowrap text-muted-foreground truncate" title={event.actor_name}>
                                            {formatActorShort(event.actor_name)}
                                        </td>
                                        
                                        <td className="px-2 py-2 text-center whitespace-nowrap col-status">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${event.event_type === 'served' ? 'bg-muted text-muted-foreground' : getDisplayStatusColor(event)}`}>
                                                {event.event_type === 'served' ? 'Logged' : (event.appeal_status === 'approved' ? 'Appeal Granted' : formatStatus(event.status))}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                </>
            )}
          </>
        )}
      </div>
    </>
  )
}

function StatBox({
  label,
  value,
  highlight = false,
  muted = false,
  textValue,
}: {
  label: string
  value: number
  highlight?: boolean
  muted?: boolean
  textValue?: string
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-primary/10 border-primary/20' : 'bg-card border-border'} ${muted ? 'opacity-60' : ''}`}>
      <p className={`text-xs font-medium uppercase ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 text-foreground">
        {textValue ?? value}
      </p>
    </div>
  )
}