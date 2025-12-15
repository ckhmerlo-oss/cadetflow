'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PendingReport, fetchPendingReports } from './actions'

// --- HELPERS & COLORS ---
const formatName = (person: { first_name: string, last_name: string } | null) => {
  if (!person) return 'Unknown'
  return `${person.last_name}, ${person.first_name}`
}

const STATUS_COLORS: Record<string, string> = {
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  needs_revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
}

type SortKey = 'date' | 'status' | 'subject' | 'submitter' | 'offense' | 'demerits' | 'waiting'
type FilterType = 'all' | 'date_range' | 'subject' | 'submitter' | 'offense'

export default function PendingReportsClient({ initialReports }: { initialReports: PendingReport[] }) {
  const router = useRouter()
  const [reports, setReports] = useState<PendingReport[]>(initialReports)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadAmount, setLoadAmount] = useState(50)
  const [offset, setOffset] = useState(initialReports.length)
  
  // UI
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'asc' })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('') 
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState('') 
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const { data } = await fetchPendingReports(offset, loadAmount)
    if (data) {
      if (data.length < loadAmount) setHasMore(false)
      setReports(prev => [...prev, ...data.filter(n => !prev.some(p => p.id === n.id))])
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

  const getWaitingOn = (report: PendingReport) => {
    if (report.status === 'needs_revision') return 'Author (Revision)'
    return report.current_approver_group?.group_name || 'Unknown Group'
  }

  // Options
  const uniqueSubjects = useMemo(() => [...new Set(reports.map(r => formatName(r.subject)))].sort(), [reports])
  const uniqueSubmitters = useMemo(() => [...new Set(reports.map(r => formatName(r.submitter)))].sort(), [reports])
  const uniqueOffenses = useMemo(() => [...new Set(reports.map(r => r.offense_type.offense_name))].sort(), [reports])

  const processedReports = useMemo(() => {
    let res = reports.filter(r => {
        if(searchTerm) {
            const low = searchTerm.toLowerCase()
            return formatName(r.subject).toLowerCase().includes(low) || 
                   formatName(r.submitter).toLowerCase().includes(low) ||
                   r.offense_type.offense_name.toLowerCase().includes(low)
        }
        return true
    })

    if (filterType === 'date_range') {
        if (startDate) res = res.filter(r => new Date(r.created_at) >= new Date(startDate))
        if (endDate) res = res.filter(r => new Date(r.created_at) <= new Date(endDate + 'T23:59:59'))
    } else if (filterValue) {
        if (filterType === 'subject') res = res.filter(r => formatName(r.subject) === filterValue)
        if (filterType === 'submitter') res = res.filter(r => formatName(r.submitter) === filterValue)
        if (filterType === 'offense') res = res.filter(r => r.offense_type.offense_name === filterValue)
    }

    res.sort((a, b) => {
        let valA: any = '', valB: any = ''
        switch(sortConfig.key) {
            case 'date': valA = new Date(a.created_at).getTime(); valB = new Date(b.created_at).getTime(); break;
            case 'subject': valA = formatName(a.subject); valB = formatName(b.subject); break;
            case 'submitter': valA = formatName(a.submitter); valB = formatName(b.submitter); break;
            case 'offense': valA = a.offense_type.offense_name; valB = b.offense_type.offense_name; break;
            case 'status': valA = a.status; valB = b.status; break;
            case 'demerits': valA = a.demerits_effective; valB = b.demerits_effective; break;
            case 'waiting': valA = getWaitingOn(a); valB = getWaitingOn(b); break;
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
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Quick Search</label>
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
                        <option value="submitter">Submitter</option>
                        <option value="offense">Infraction</option>
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
                                {filterType === 'submitter' && uniqueSubmitters.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterType === 'offense' && uniqueOffenses.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                        </div>
                    )}
                </div>
            </div>
          </div>
      </div>

      <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                    <tr>
                        <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Status <SortIcon column="status"/></th>
                        {/* NEW: Waiting On Column */}
                        <th onClick={() => handleSort('waiting')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Waiting On <SortIcon column="waiting"/></th>
                        <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Subject <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('submitter')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Submitter <SortIcon column="submitter"/></th>
                        <th onClick={() => handleSort('offense')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Infraction <SortIcon column="offense"/></th>
                        <th onClick={() => handleSort('demerits')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Dem <SortIcon column="demerits"/></th>
                        <th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground">Date <SortIcon column="date"/></th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {processedReports.length > 0 ? processedReports.map(report => (
                        <React.Fragment key={report.id}>
                            <tr onClick={() => setExpandedId(expandedId === report.id ? null : report.id)} className={`cursor-pointer hover:bg-accent transition-colors ${expandedId === report.id ? 'bg-muted/50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[report.status] || 'bg-muted text-muted-foreground'}`}>{report.status.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{getWaitingOn(report)}</td>
                                <td className="px-6 py-4 text-sm font-medium text-foreground">{formatName(report.subject)}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{formatName(report.submitter)}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{report.offense_type.offense_name}</td>
                                <td className="px-6 py-4 text-sm font-bold text-destructive">{report.demerits_effective}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</td>
                            </tr>
                            
                            {expandedId === report.id && (
                                <tr className="bg-muted/30 shadow-inner">
                                    <td colSpan={7} className="px-6 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase">Report Details</h4>
                                                <div className="bg-card p-4 rounded border border-border">
                                                    <p className="text-sm text-foreground mb-2"><strong>Date of Offense:</strong> {new Date(report.date_of_offense).toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                                                    <p className="text-sm text-foreground whitespace-pre-wrap">{report.notes || 'None'}</p>
                                                    <div className="mt-4 pt-3 border-t border-border">
                                                        <Link href={`/report/${report.id}`} className="text-primary text-sm font-medium hover:underline">View Full Report &rarr;</Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase">Timeline</h4>
                                                <ul className="bg-card rounded border border-border divide-y divide-border">
                                                    {report.approval_log.map((log, i) => (
                                                        <li key={i} className="p-3 text-sm">
                                                            <div className="flex justify-between font-medium text-foreground">
                                                                <span>{formatName(log.actor)}</span>
                                                                <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1"><span className="uppercase font-bold">{log.action}</span> {log.comment && `- "${log.comment}"`}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    )) : <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">No pending reports found.</td></tr>}
                </tbody>
            </table>
        </div>
        {hasMore && (
            <div className="p-4 flex justify-center bg-muted/20 border-t border-border">
                <button 
                    onClick={handleLoadMore} 
                    disabled={isLoadingMore} 
                    className="px-6 py-2 bg-card border border-border rounded-full shadow-sm text-primary text-sm font-medium hover:bg-accent disabled:opacity-50"
                >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
            </div>
        )}
      </div>
    </div>
  )
}