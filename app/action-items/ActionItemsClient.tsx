'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { ActionItem } from './page' 

// Helper to format names
const formatName = (person: { first_name: string, last_name: string }) => {
  if (!person?.last_name) return 'N/A'
  return `${person.last_name}, ${person.first_name}`
}

type SortKey = 'subject' | 'submitter' | 'company' | 'offense' | 'date'
type SortDirection = 'asc' | 'desc'

export default function ActionItemsClient({ items }: { items: ActionItem[] }) {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'asc' })
  const [isLoading, setIsLoading] = useState(false)
  const [bulkComment, setBulkComment] = useState('')

  // Inline Action State
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [singleComment, setSingleComment] = useState('')

  // --- Filtering & Sorting ---
  const filteredItems = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    if (!lowerSearch) return items
    return items.filter(item => (
        formatName(item.subject).toLowerCase().includes(lowerSearch) ||
        formatName(item.submitter).toLowerCase().includes(lowerSearch) ||
        item.company?.company_name?.toLowerCase().includes(lowerSearch) ||
        item.offense_type.offense_name.toLowerCase().includes(lowerSearch)
    ))
  }, [items, searchTerm])

  const sortedAndFilteredItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aValue: any = '', bValue: any = ''
      switch (sortConfig.key) {
        case 'subject': aValue = formatName(a.subject); bValue = formatName(b.subject); break;
        case 'submitter': aValue = formatName(a.submitter); bValue = formatName(b.submitter); break;
        case 'company': aValue = a.company?.company_name || ''; bValue = b.company?.company_name || ''; break;
        case 'offense': aValue = a.offense_type.offense_name; bValue = b.offense_type.offense_name; break;
        case 'date': aValue = new Date(a.created_at).getTime(); bValue = new Date(b.created_at).getTime(); break;
      }
      return aValue < bValue ? (sortConfig.direction === 'asc' ? -1 : 1) : (aValue > bValue ? (sortConfig.direction === 'asc' ? 1 : -1) : 0)
    })
  }, [filteredItems, sortConfig])

  // --- Handlers ---
  const handleSort = (key: SortKey) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' })
  }

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedReports)
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedReports(newSet)
  }

  const handleSelectAll = () => {
    setSelectedReports(selectedReports.size === sortedAndFilteredItems.length ? new Set() : new Set(sortedAndFilteredItems.map(i => i.id)))
  }

  // Toggle Expansion
  const handleRowClick = (reportId: string) => {
    if (expandedRowId === reportId) {
      setExpandedRowId(null)
      setSingleComment('')
    } else {
      setExpandedRowId(reportId)
      setSingleComment('')
    }
  }

  // Handle Individual Action
  const handleSingleAction = async (reportId: string, action: 'approve' | 'reject' | 'kickback') => {
    if ((action === 'reject' || action === 'kickback') && !singleComment.trim()) {
      alert(`A comment is required to ${action} this report.`)
      return
    }

    setIsLoading(true)
    let rpcName = 'bulk_approve_reports'
    if (action === 'reject') rpcName = 'bulk_reject_reports'
    if (action === 'kickback') rpcName = 'bulk_kickback_reports'

    const comment = singleComment.trim() || 'Approved'
    
    const { data, error } = await supabase.rpc(rpcName, {
      p_report_ids: [reportId],
      p_comment: comment
    })

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setExpandedRowId(null)
      setSingleComment('')
      router.refresh()
    }
    setIsLoading(false)
  }

  // Bulk Action Handler
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedReports.size === 0) return
    if (action === 'reject' && !bulkComment.trim()) { alert('Comment required for rejection'); return; }
    setIsLoading(true)
    const rpcName = action === 'approve' ? 'bulk_approve_reports' : 'bulk_reject_reports'
    await supabase.rpc(rpcName, { p_report_ids: Array.from(selectedReports), p_comment: bulkComment || 'Approved' })
    setSelectedReports(new Set()); setBulkComment(''); router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      
      {/* Toolbar */}
      <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <input type="text" placeholder="Search..." className="block w-full md:w-1/3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
          <textarea placeholder={selectedReports.size > 0 ? `Comment for ${selectedReports.size} items...` : 'Select items...'} className="block w-full sm:flex-grow rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm py-2 px-3" value={bulkComment} onChange={e => setBulkComment(e.target.value)} disabled={selectedReports.size === 0 || isLoading} />
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => handleBulkAction('approve')} disabled={selectedReports.size === 0 || isLoading} className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">Approve</button>
            <button onClick={() => handleBulkAction('reject')} disabled={selectedReports.size === 0 || isLoading || !bulkComment.trim()} className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400">Reject</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {/* *** HYDRATION FIX: Removed all whitespace *** */}
            <tr><th className="p-4 text-left"><input type="checkbox" className="rounded" checked={selectedReports.size > 0 && selectedReports.size === sortedAndFilteredItems.length} onChange={handleSelectAll} /></th><th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Subject</th><th onClick={() => handleSort('submitter')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Submitter</th><th onClick={() => handleSort('company')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Company</th><th onClick={() => handleSort('offense')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Infraction</th><th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th></tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* *** HYDRATION FIX: Map to an array of <tr> elements, no <React.Fragment> *** */}
            {sortedAndFilteredItems.length > 0 ? sortedAndFilteredItems.map(item => [
                // Main Row
                <tr 
                  key={item.id} 
                  onClick={() => handleRowClick(item.id)} 
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${expandedRowId === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                >
                  <td className="p-4" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" checked={selectedReports.has(item.id)} onChange={() => handleSelect(item.id)} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{formatName(item.subject)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatName(item.submitter)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.company?.company_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{item.offense_type.offense_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>,

                // EXPANDED ROW VIEW
                expandedRowId === item.id && (
                  <tr key={`${item.id}-details`} className="bg-gray-50 dark:bg-gray-900/30">
                    <td colSpan={7} className="p-0 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col md:flex-row">
                        
                        {/* LEFT: DETAILS */}
                        <div className="flex-grow p-6 space-y-6 md:border-r border-gray-200 dark:border-gray-700">
                          {/* Grid Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Subject</span>
                                <span className="text-gray-900 dark:text-white font-medium">{formatName(item.subject)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Demerits</span>
                                <span className="text-red-600 dark:text-red-400 font-bold text-lg">{item.offense_type.demerits}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Submitter</span>
                                <span className="text-gray-900 dark:text-white">{formatName(item.submitter)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</span>
                                <span className="text-gray-900 dark:text-white">{new Date(item.created_at).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Notes</h4>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {item.notes || <span className="italic text-gray-400">No notes provided.</span>}
                            </div>
                          </div>

                          {/* Approver History */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">History</h4>
                            <div className="space-y-2">
                                {item.logs && item.logs.length > 0 ? (
                                    item.logs.map((log, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm flex-wrap">
                                            <span className="font-medium text-gray-900 dark:text-white w-32 flex-shrink-0">{log.actor_name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                log.action === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                                log.action === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                log.action === 'kickback' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                            }`}>
                                                {log.action}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs">{new Date(log.date).toLocaleDateString()}</span>
                                            {log.comment && <span className="text-gray-600 dark:text-gray-300 italic">"{log.comment}"</span>}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No prior history.</p>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: ACTION BOX (20% / Fixed Width) */}
                        <div className="md:w-64 flex-shrink-0 p-4 bg-white dark:bg-gray-800 flex flex-col gap-4 border-t md:border-t-0 border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Review Action</label>
                                <textarea
                                    placeholder="Add a comment (required for Reject/Kickback)..."
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm text-sm"
                                    rows={4}
                                    value={singleComment}
                                    onChange={e => setSingleComment(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleSingleAction(item.id, 'approve')} disabled={isLoading} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50">
                                    Approve
                                </button>
                                <button onClick={() => handleSingleAction(item.id, 'kickback')} disabled={isLoading || !singleComment.trim()} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium disabled:opacity-50">
                                    Kick-Back
                                </button>
                                <button onClick={() => handleSingleAction(item.id, 'reject')} disabled={isLoading || !singleComment.trim()} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50">
                                    Reject
                                </button>
                            </div>
                            <div className="mt-auto pt-4 text-center">
                                <a href={`/report/${item.id}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                    View Full Page &rarr;
                                </a>
                            </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                )
            ]) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">{searchTerm ? 'No reports match your search.' : 'Your action item queue is empty.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}