'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HistoryReport, fetchReportHistory } from './actions'

// --- HELPERS ---
const formatName = (person: { first_name: string, last_name: string } | null) => {
  if (!person) return 'Unknown'
  return `${person.last_name}, ${person.first_name}`
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  pulled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

const APPEAL_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected_final: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  pending_issuer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  pending_chain: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  pending_commandant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

// Types
type SortKey = 'date' | 'status' | 'subject' | 'submitter' | 'offense' | 'demerits' | 'appeal'
type SortDirection = 'asc' | 'desc'
type FilterType = 'all' | 'date_range' | 'subject' | 'submitter' | 'offense' | 'status' | 'appeal'

export default function ReportHistoryClient({ initialReports }: { initialReports: HistoryReport[] }) {
  const router = useRouter()

  // Data State
  const [reports, setReports] = useState<HistoryReport[]>(initialReports)
  const [offset, setOffset] = useState(initialReports.length)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Preferences
  const [loadAmount, setLoadAmount] = useState(50)
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filtering State
  const [searchTerm, setSearchTerm] = useState('') 
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState('') 
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // --- HANDLERS ---

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const { data, error } = await fetchReportHistory(offset, loadAmount)
    
    if (error) {
      alert("Failed to load more reports.")
    } else if (data) {
      if (data.length < loadAmount) setHasMore(false)
      // Filter duplicates
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
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type)
    setFilterValue('')
    setStartDate('')
    setEndDate('')
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-gray-300 ml-1">⇅</span>
    return <span className="text-indigo-600 dark:text-indigo-400 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  // --- DYNAMIC OPTIONS ---
  const uniqueSubjects = useMemo(() => [...new Set(reports.map(r => formatName(r.subject)))].sort(), [reports])
  const uniqueSubmitters = useMemo(() => [...new Set(reports.map(r => formatName(r.submitter)))].sort(), [reports])
  const uniqueOffenses = useMemo(() => [...new Set(reports.map(r => r.offense_type.offense_name))].sort(), [reports])
  const uniqueStatuses = useMemo(() => [...new Set(reports.map(r => r.status))].sort(), [reports])
  const uniqueAppeals = useMemo(() => [...new Set(reports.map(r => r.appeals?.[0]?.status || 'None'))].sort(), [reports])

  // --- FILTERING & SORTING LOGIC ---
  const processedReports = useMemo(() => {
    let result = [...reports]

    // 1. Apply Search Term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(r => 
        formatName(r.subject).toLowerCase().includes(lower) ||
        formatName(r.submitter).toLowerCase().includes(lower) ||
        r.offense_type.offense_name.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower)
      )
    }

    // 2. Apply Specific Filter
    if (filterType === 'date_range') {
        if (startDate) result = result.filter(r => new Date(r.created_at) >= new Date(startDate))
        if (endDate) result = result.filter(r => new Date(r.created_at) <= new Date(endDate + 'T23:59:59'))
    } else if (filterValue && filterType !== 'all') {
        switch (filterType) {
            case 'subject': result = result.filter(r => formatName(r.subject) === filterValue); break;
            case 'submitter': result = result.filter(r => formatName(r.submitter) === filterValue); break;
            case 'offense': result = result.filter(r => r.offense_type.offense_name === filterValue); break;
            case 'status': result = result.filter(r => r.status === filterValue); break;
            case 'appeal': result = result.filter(r => (r.appeals?.[0]?.status || 'None') === filterValue); break;
        }
    }

    // 3. Sort
    result.sort((a, b) => {
      let valA: any = '', valB: any = ''

      switch (sortConfig.key) {
        case 'date': valA = new Date(a.created_at).getTime(); valB = new Date(b.created_at).getTime(); break;
        case 'subject': valA = formatName(a.subject); valB = formatName(b.subject); break;
        case 'submitter': valA = formatName(a.submitter); valB = formatName(b.submitter); break;
        case 'offense': valA = a.offense_type.offense_name; valB = b.offense_type.offense_name; break;
        case 'status': valA = a.status; valB = b.status; break;
        case 'demerits': valA = a.demerits_effective; valB = b.demerits_effective; break;
        case 'appeal': valA = a.appeals?.[0]?.status || ''; valB = b.appeals?.[0]?.status || ''; break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [reports, searchTerm, filterType, filterValue, startDate, endDate, sortConfig])

  return (
    <div className="space-y-6">
      
      {/* FLOATING TOOLBAR */}
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
                        placeholder="Search history..." 
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
                        <option value="status">Status</option>
                        <option value="appeal">Appeal Status</option>
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
                                {filterType === 'status' && uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterType === 'appeal' && uniqueAppeals.map(s => <option key={s} value={s}>{s}</option>)}
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
                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Status <SortIcon column="status" /></th>
                <th onClick={() => handleSort('appeal')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Appeal <SortIcon column="appeal" /></th>
                <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Subject <SortIcon column="subject" /></th>
                <th onClick={() => handleSort('submitter')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Submitter <SortIcon column="submitter" /></th>
                <th onClick={() => handleSort('offense')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Infraction <SortIcon column="offense" /></th>
                <th onClick={() => handleSort('demerits')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Dem <SortIcon column="demerits" /></th>
                <th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Date <SortIcon column="date" /></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedReports.length > 0 ? processedReports.map(report => {
                const appealStatus = report.appeals?.[0]?.status;
                const appeal = report.appeals?.[0];
                return (
                  <React.Fragment key={report.id}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${expandedId === report.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                          {report.status === 'completed' ? 'Approved' : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {appealStatus ? (
                           <span className={`px-2 py-0.5 rounded text-xs font-medium ${APPEAL_COLORS[appealStatus] || 'bg-gray-100 text-gray-800'}`}>
                             {appealStatus.replace(/_/g, ' ')}
                           </span>
                         ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{formatName(report.subject)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatName(report.submitter)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{report.offense_type.offense_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">{report.demerits_effective}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(report.created_at).toLocaleDateString()}</td>
                    </tr>

                    {/* EXPANDED ROW (ColSpan Fixed to 7) */}
                    {expandedId === report.id && (
                      <tr className="bg-gray-50 dark:bg-gray-900/30 shadow-inner">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Report Details</h4>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                                    <div>
                                        <span className="block text-xs text-gray-400">Date of Offense</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(report.date_of_offense).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Notes</span>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">{report.notes || 'No notes provided.'}</p>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <Link href={`/report/${report.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                                            View Full Report Page &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approval Chain</h4>
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {report.approval_log && report.approval_log.length > 0 ? (
                                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {report.approval_log.map((log, idx) => (
                                                <li key={idx} className="p-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-900 dark:text-white">{formatName(log.actor)}</span>
                                                        <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                            log.action.toLowerCase().includes('approve') ? 'bg-green-100 text-green-800' : 
                                                            log.action.toLowerCase().includes('reject') ? 'bg-red-100 text-red-800' : 
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {log.action}
                                                        </span>
                                                        {log.comment && <span className="text-gray-600 dark:text-gray-400 italic">"{log.comment}"</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="p-4 text-sm text-gray-400 italic">No logs available.</p>
                                    )}
                                </div>
                            </div>

                            {appeal ? (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Appeal Case</h4>
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                                        <div>
                                            <span className="block text-xs text-gray-400">Current Status</span>
                                            <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-bold ${APPEAL_COLORS[appeal.status] || 'bg-gray-100'}`}>
                                                {appeal.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Justification</span>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">"{appeal.justification}"</p>
                                        </div>
                                        {appeal.final_comment && (
                                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <span className="block text-xs text-gray-400">Verdict Note</span>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium mt-1">{appeal.final_comment}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
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
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Load</span>
            <select 
              value={loadAmount} 
              onChange={e => setLoadAmount(Number(e.target.value))}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 py-1 pl-2 pr-8 text-sm"
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
            className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More Reports'}
          </button>
        </div>
      )}
    </div>
  )
}