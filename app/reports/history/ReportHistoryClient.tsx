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

// Types for Sorting
type SortKey = 'date' | 'status' | 'subject' | 'submitter' | 'offense' | 'demerits' | 'appeal'
type SortDirection = 'asc' | 'desc'

export default function ReportHistoryClient({ initialReports }: { initialReports: HistoryReport[] }) {
  const router = useRouter()

  // Data State
  const [reports, setReports] = useState<HistoryReport[]>(initialReports)
  const [offset, setOffset] = useState(initialReports.length)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Preferences
  const [loadAmount, setLoadAmount] = useState(50)
  
  // Filters & Sort
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // --- HANDLERS ---

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const { data, error } = await fetchReportHistory(offset, loadAmount)
    
    if (error) {
      alert("Failed to load more reports.")
    } else if (data) {
      if (data.length < loadAmount) setHasMore(false)
      setReports(prev => [...prev, ...data])
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

  // Helper to render sort arrow
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-gray-300 ml-1">⇅</span>
    return <span className="text-indigo-600 dark:text-indigo-400 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  // --- FILTERING & SORTING LOGIC ---
  const processedReports = useMemo(() => {
    // 1. Filter
    let result = reports.filter(r => {
      const lowerSearch = searchTerm.toLowerCase()
      if (!lowerSearch) return true
      return (
        formatName(r.subject).toLowerCase().includes(lowerSearch) ||
        formatName(r.submitter).toLowerCase().includes(lowerSearch) ||
        r.offense_type.offense_name.toLowerCase().includes(lowerSearch) ||
        r.status.toLowerCase().includes(lowerSearch)
      )
    })

    // 2. Sort
    result.sort((a, b) => {
      let valA: any = '', valB: any = ''

      switch (sortConfig.key) {
        case 'date':
          valA = new Date(a.created_at).getTime()
          valB = new Date(b.created_at).getTime()
          break
        case 'subject':
          valA = formatName(a.subject)
          valB = formatName(b.subject)
          break
        case 'submitter':
          valA = formatName(a.submitter)
          valB = formatName(b.submitter)
          break
        case 'offense':
          valA = a.offense_type.offense_name
          valB = b.offense_type.offense_name
          break
        case 'status':
          valA = a.status
          valB = b.status
          break
        case 'demerits':
          valA = a.demerits_effective
          valB = b.demerits_effective
          break
        case 'appeal':
          valA = a.appeals?.[0]?.status || ''
          valB = b.appeals?.[0]?.status || ''
          break
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [reports, searchTerm, sortConfig])

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* TOOLBAR */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Search Archives</label>
            <input 
              type="text" 
              placeholder="Search by name, offense, or status..." 
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm sm:text-sm py-2 px-3" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="w-full sm:w-auto">
             <button onClick={() => router.refresh()} className="w-full py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm">
               ↻ Refresh Data
             </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Status <SortIcon column="status" /></th>
                <th onClick={() => handleSort('appeal')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Appeal <SortIcon column="appeal" /></th>
                <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Subject <SortIcon column="subject" /></th>
                <th onClick={() => handleSort('submitter')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Submitter <SortIcon column="submitter" /></th>
                <th onClick={() => handleSort('offense')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Offense <SortIcon column="offense" /></th>
                <th onClick={() => handleSort('demerits')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Dem <SortIcon column="demerits" /></th>
                <th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Date <SortIcon column="date" /></th>
                <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedReports.length > 0 ? processedReports.map(report => {
                const appealStatus = report.appeals?.[0]?.status;
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {expandedId === report.id ? 'Close' : 'View'}
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedId === report.id && (
                      <tr className="bg-gray-50 dark:bg-gray-900/30 shadow-inner">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-grow space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Date of Offense:</strong> {new Date(report.date_of_offense).toLocaleString()}</p>
                                {appealStatus && (
                                   <p className="text-sm text-gray-700 dark:text-gray-300">
                                     <strong>Appeal Status:</strong> <span className="capitalize">{appealStatus.replace(/_/g, ' ')}</span>
                                   </p>
                                )}
                                <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{report.notes || 'No notes provided.'}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Link 
                                    href={`/report/${report.id}`}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                >
                                    Open Full Report Page &rarr;
                                </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No reports found.</td></tr>
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