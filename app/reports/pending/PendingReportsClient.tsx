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
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  needs_revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
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
    if (sortConfig.key !== column) return <span className="text-gray-300 ml-1">⇅</span>
    return <span className="text-indigo-600 dark:text-indigo-400 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* 1. Search Bar (1/3 Width) */}
            <div className="w-full lg:w-1/3 relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Quick Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 pl-10 pr-3 focus:ring-indigo-500 focus:border-indigo-500" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {/* 2. Filter Controls (2/3 Width) */}
            <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Filter By</label>
                    <select 
                        value={filterType} 
                        onChange={e => handleFilterTypeChange(e.target.value as FilterType)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
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
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">From</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3" />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">To</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3" />
                            </div>
                        </div>
                    ) : (
                        <div>
                             <label className={`block text-xs font-bold uppercase mb-1 ${filterType === 'all' ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                 {filterType === 'all' ? 'Select Filter Type First' : 'Select Value'}
                             </label>
                             <select 
                                value={filterValue} 
                                onChange={e => setFilterValue(e.target.value)} 
                                disabled={filterType === 'all'} 
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Status <SortIcon column="status"/></th>
                        {/* NEW: Waiting On Column */}
                        <th onClick={() => handleSort('waiting')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Waiting On <SortIcon column="waiting"/></th>
                        <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Subject <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('submitter')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Submitter <SortIcon column="submitter"/></th>
                        <th onClick={() => handleSort('offense')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Infraction <SortIcon column="offense"/></th>
                        <th onClick={() => handleSort('demerits')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Dem <SortIcon column="demerits"/></th>
                        <th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Date <SortIcon column="date"/></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {processedReports.length > 0 ? processedReports.map(report => (
                        <React.Fragment key={report.id}>
                            <tr onClick={() => setExpandedId(expandedId === report.id ? null : report.id)} className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${expandedId === report.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>{report.status.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">{getWaitingOn(report)}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatName(report.subject)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{formatName(report.submitter)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{report.offense_type.offense_name}</td>
                                <td className="px-6 py-4 text-sm font-bold text-red-600">{report.demerits_effective}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                            </tr>
                            
                            {expandedId === report.id && (
                                <tr className="bg-gray-50 dark:bg-gray-900/30 shadow-inner">
                                    <td colSpan={7} className="px-6 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase">Report Details</h4>
                                                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm text-gray-900 dark:text-white mb-2"><strong>Date of Offense:</strong> {new Date(report.date_of_offense).toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.notes || 'None'}</p>
                                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                        <Link href={`/report/${report.id}`} className="text-indigo-600 text-sm font-medium hover:underline">View Full Report &rarr;</Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase">Timeline</h4>
                                                <ul className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                                                    {report.approval_log.map((log, i) => (
                                                        <li key={i} className="p-3 text-sm">
                                                            <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                                                                <span>{formatName(log.actor)}</span>
                                                                <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-1"><span className="uppercase font-bold">{log.action}</span> {log.comment && `- "${log.comment}"`}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    )) : <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">No pending reports found.</td></tr>}
                </tbody>
            </table>
        </div>
        {hasMore && <div className="p-4 flex justify-center"><button onClick={handleLoadMore} disabled={isLoadingMore} className="px-6 py-2 bg-white border rounded-full shadow-sm text-indigo-600 text-sm font-medium">{isLoadingMore ? 'Loading...' : 'Load More'}</button></div>}
      </div>
    </div>
  )
}