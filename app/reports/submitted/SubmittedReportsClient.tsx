'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SubmittedReport, fetchSubmittedReports } from './actions'

// --- HELPERS ---
const formatName = (person: { first_name: string, last_name: string } | null) => {
  if (!person) return 'Unknown'
  return `${person.last_name}, ${person.first_name}`
}

const STATUS_COLORS: Record<string, string> = {
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  rejected: 'bg-destructive/10 text-destructive',
  pulled: 'bg-muted text-muted-foreground',
}

const APPEAL_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  rejected_final: 'bg-destructive/10 text-destructive',
  pending_issuer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  pending_chain: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  pending_commandant: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
}

type SortKey = 'date' | 'status' | 'subject' | 'offense' | 'demerits' | 'appeal'
type FilterType = 'all' | 'date_range' | 'subject' | 'offense' | 'status' | 'appeal'

export default function SubmittedReportsClient({ initialReports }: { initialReports: SubmittedReport[] }) {
  const router = useRouter()

  // Data
  const [reports, setReports] = useState<SubmittedReport[]>(initialReports)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [offset, setOffset] = useState(initialReports.length)
  const [loadAmount, setLoadAmount] = useState(50)
  
  // UI
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('') 
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState('') 
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // --- HANDLERS ---
  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const { data } = await fetchSubmittedReports(offset, loadAmount)
    if (data) {
      if (data.length < loadAmount) setHasMore(false)
      setReports(prev => {
        const existingIds = new Set(prev.map(r => r.id))
        const uniqueNew = data.filter(r => !existingIds.has(r.id))
        return [...prev, ...uniqueNew]
      })
      setOffset(prev => prev + data.length)
    }
    setIsLoadingMore(false)
  }

  const handleSort = (key: SortKey) => {
    setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }))
  }

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type); setFilterValue(''); setStartDate(''); setEndDate('')
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-muted-foreground/30 ml-1">⇅</span>
    return <span className="text-primary ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  // --- OPTIONS ---
  const uniqueSubjects = useMemo(() => [...new Set(reports.map(r => formatName(r.subject)))].sort(), [reports])
  const uniqueOffenses = useMemo(() => [...new Set(reports.map(r => r.offense_type.offense_name))].sort(), [reports])
  const uniqueStatuses = useMemo(() => [...new Set(reports.map(r => r.status))].sort(), [reports])
  const uniqueAppeals = useMemo(() => [...new Set(reports.map(r => r.appeals?.[0]?.status || 'None'))].sort(), [reports])

  // --- FILTERING ---
  const processedReports = useMemo(() => {
    let res = reports.filter(r => {
        if(searchTerm) {
            const low = searchTerm.toLowerCase()
            return formatName(r.subject).toLowerCase().includes(low) || r.offense_type.offense_name.toLowerCase().includes(low)
        }
        return true
    })

    if (filterType === 'date_range') {
        if (startDate) res = res.filter(r => new Date(r.created_at) >= new Date(startDate))
        if (endDate) res = res.filter(r => new Date(r.created_at) <= new Date(endDate + 'T23:59:59'))
    } else if (filterValue && filterType !== 'all') {
        if (filterType === 'subject') res = res.filter(r => formatName(r.subject) === filterValue)
        if (filterType === 'offense') res = res.filter(r => r.offense_type.offense_name === filterValue)
        if (filterType === 'status') res = res.filter(r => r.status === filterValue)
        if (filterType === 'appeal') res = res.filter(r => (r.appeals?.[0]?.status || 'None') === filterValue)
    }

    res.sort((a, b) => {
        let valA: any = '', valB: any = ''
        switch(sortConfig.key) {
            case 'date': valA = new Date(a.created_at).getTime(); valB = new Date(b.created_at).getTime(); break;
            case 'subject': valA = formatName(a.subject); valB = formatName(b.subject); break;
            case 'offense': valA = a.offense_type.offense_name; valB = b.offense_type.offense_name; break;
            case 'status': valA = a.status; valB = b.status; break;
            case 'demerits': valA = a.demerits_effective; valB = b.demerits_effective; break;
            case 'appeal': valA = a.appeals?.[0]?.status || ''; valB = b.appeals?.[0]?.status || ''; break;
        }
        return sortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1)
    })
    return res
  }, [reports, searchTerm, filterType, filterValue, startDate, endDate, sortConfig])

  return (
    <div className="space-y-6">
      
      {/* --- FLOATING FILTER CARD --- */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* 1. Search Bar (1/3 Width) */}
            <div className="w-full lg:w-1/3 relative">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Search My Reports</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="input-base pl-10 pr-3" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {/* 2. Filter Controls (2/3 Width) */}
            <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Filter By</label>
                    <select 
                        value={filterType} 
                        onChange={e => handleFilterTypeChange(e.target.value as FilterType)}
                        className="input-base"
                    >
                        <option value="all">None</option>
                        <option value="date_range">Date Range</option>
                        <option value="subject">Subject</option>
                        <option value="offense">Infraction</option>
                        <option value="status">Status</option>
                        <option value="appeal">Appeal Status</option>
                    </select>
                </div>

                <div className="w-full sm:w-2/3">
                    {filterType === 'date_range' ? (
                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">From</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-base" />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">To</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-base" />
                            </div>
                        </div>
                    ) : (
                        <div>
                             <label className={`block text-xs font-bold uppercase mb-1 ${filterType === 'all' ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                 {filterType === 'all' ? 'Select Filter Type First' : 'Select Value'}
                             </label>
                             <select 
                                value={filterValue} 
                                onChange={e => setFilterValue(e.target.value)} 
                                disabled={filterType === 'all'} 
                                className="input-base disabled:opacity-50"
                             >
                                <option value="">{filterType === 'all' ? '—' : 'Select...'}</option>
                                {filterType === 'subject' && uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterType === 'offense' && uniqueOffenses.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterType === 'status' && uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterType === 'appeal' && uniqueAppeals.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                        </div>
                    )}
                </div>
            </div>
          </div>
      </div>

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Status <SortIcon column="status" /></th>
                <th onClick={() => handleSort('appeal')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Appeal <SortIcon column="appeal" /></th>
                <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Subject <SortIcon column="subject" /></th>
                <th onClick={() => handleSort('offense')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Infraction <SortIcon column="offense" /></th>
                <th onClick={() => handleSort('demerits')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Dem <SortIcon column="demerits" /></th>
                <th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Date <SortIcon column="date" /></th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {processedReports.length > 0 ? processedReports.map(report => {
                const appealStatus = report.appeals?.[0]?.status;
                const appeal = report.appeals?.[0];
                return (
                  <React.Fragment key={report.id}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                      className={`cursor-pointer hover:bg-accent transition-colors ${expandedId === report.id ? 'bg-muted/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[report.status] || 'bg-muted text-muted-foreground'}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {appealStatus ? (
                           <span className={`px-2 py-0.5 rounded text-xs font-medium ${APPEAL_COLORS[appealStatus] || 'bg-muted text-muted-foreground'}`}>
                             {appealStatus.replace(/_/g, ' ')}
                           </span>
                         ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{formatName(report.subject)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{report.offense_type.offense_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-destructive">{report.demerits_effective}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedId === report.id && (
                      <tr className="bg-muted/30 shadow-inner">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Report Details</h4>
                                <div className="bg-card p-4 rounded-lg border border-border space-y-3">
                                    <div>
                                        <span className="block text-xs text-muted-foreground">Date of Offense</span>
                                        <span className="text-sm font-medium text-foreground">{new Date(report.date_of_offense).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-muted-foreground">Notes</span>
                                        <p className="text-sm text-foreground whitespace-pre-wrap mt-1">{report.notes || 'No notes provided.'}</p>
                                    </div>
                                    <div className="pt-3 border-t border-border">
                                        <Link href={`/report/${report.id}`} className="text-primary text-sm font-medium hover:underline">
                                            View Full Report Page &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approval Chain</h4>
                                <div className="bg-card rounded-lg border border-border overflow-hidden">
                                    {report.approval_log && report.approval_log.length > 0 ? (
                                        <ul className="divide-y divide-border">
                                            {report.approval_log.map((log, idx) => (
                                                <li key={idx} className="p-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-foreground">{formatName(log.actor)}</span>
                                                        <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                            log.action.toLowerCase().includes('approve') ? 'bg-green-100 text-green-800' : 
                                                            log.action.toLowerCase().includes('reject') ? 'bg-destructive/10 text-destructive' : 
                                                            'bg-muted text-muted-foreground'
                                                        }`}>
                                                            {log.action}
                                                        </span>
                                                        {log.comment && <span className="text-muted-foreground italic">"{log.comment}"</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="p-4 text-sm text-muted-foreground italic">No logs available.</p>
                                    )}
                                </div>
                            </div>

                            {appeal ? (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appeal Case</h4>
                                    <div className="bg-card p-4 rounded-lg border border-border space-y-3">
                                        <div>
                                            <span className="block text-xs text-muted-foreground">Current Status</span>
                                            <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-bold ${APPEAL_COLORS[appeal.status] || 'bg-muted text-muted-foreground'}`}>
                                                {appeal.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">Justification</span>
                                            <p className="text-sm text-foreground mt-1 italic">"{appeal.justification}"</p>
                                        </div>
                                        {appeal.final_comment && (
                                            <div className="pt-2 border-t border-border">
                                                <span className="block text-xs text-muted-foreground">Verdict Note</span>
                                                <p className="text-sm text-foreground font-medium mt-1">{appeal.final_comment}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic bg-muted/20 rounded-lg border border-dashed border-border">
                                    No appeal filed.
                                </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-4 bg-muted/20 rounded-lg border border-dashed border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Load</span>
            <select 
              value={loadAmount} 
              onChange={e => setLoadAmount(Number(e.target.value))}
              className="rounded-md border-border bg-background py-1 pl-2 pr-8 text-sm focus:ring-primary focus:border-primary"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={300}>300</option>
            </select>
            <span>more rows</span>
          </div>
          <button 
            onClick={handleLoadMore} 
            disabled={isLoadingMore}
            className="px-6 py-2 bg-card border border-border rounded-full shadow-sm text-primary font-medium hover:bg-accent transition-all disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More Reports'}
          </button>
        </div>
      )}
    </div>
  )
}