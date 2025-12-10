'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ActionItemReport } from './page'
import Link from 'next/link'

// --- Types ---
type SortKey = 'created_at' | 'subject' | 'type' | 'submitter';
type SortDirection = 'asc' | 'desc';
// 1. Added 'date_range' to categories
type FilterCategory = 'all' | 'date_range' | 'subject' | 'submitter' | 'offense' | 'type';

export default function ActionItemsClient({ initialReports, currentUserId }: { initialReports: ActionItemReport[], currentUserId: string }) {
  const router = useRouter()
  const supabase = createClient()

  // --- State ---
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'created_at', direction: 'asc' })
  const [isLoading, setIsLoading] = useState(false)
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [filterValue, setFilterValue] = useState('')
  // 2. Added Date State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Actions State
  const [bulkComment, setBulkComment] = useState('')
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [singleComment, setSingleComment] = useState('')

  // --- Helpers ---
  const formatName = (person: any) => {
    if (!person) return 'N/A';
    const p = Array.isArray(person) ? person[0] : person;
    if (!p || !p.last_name) return 'N/A';
    return `${p.last_name}, ${p.first_name}`;
  }
  
  const getTaskType = (r: ActionItemReport) => {
      if (r.type === 'incident') return 'Incident Review'; // <--- NEW CHECK
      
      if (r.appeal_status && ['pending_issuer', 'pending_chain', 'pending_commandant'].includes(r.appeal_status)) return 'Appeal Review';
      if (r.appeal_status && ['rejected_by_issuer', 'rejected_by_chain'].includes(r.appeal_status) && r.subject_cadet_id === currentUserId) return 'Appeal Decision';
      if (r.status === 'needs_revision') return 'Revision Needed';
      return 'Approval Needed';
  }

  const isBulkActionable = (r: ActionItemReport) => {
      return getTaskType(r) === 'Approval Needed';
  }

  // --- Dynamic Options ---
  const uniqueSubjects = useMemo(() => [...new Set(initialReports.map(r => formatName(r.subject)))].sort(), [initialReports])
  const uniqueSubmitters = useMemo(() => [...new Set(initialReports.map(r => formatName(r.submitter)))].sort(), [initialReports])
  const uniqueOffenses = useMemo(() => [...new Set(initialReports.map(r => r.offense_type.offense_name))].sort(), [initialReports])
  const uniqueTypes = useMemo(() => [...new Set(initialReports.map(r => getTaskType(r)))].sort(), [initialReports])

  // --- Filtering & Sorting Logic ---
  const processedReports = useMemo(() => {
    let result = [...initialReports];

    // 1. Search (Global Text Search)
    if (searchTerm) {
        const s = searchTerm.toLowerCase();
        result = result.filter(item => (
            formatName(item.subject).toLowerCase().includes(s) ||
            formatName(item.submitter).toLowerCase().includes(s) ||
            item.offense_type.offense_name.toLowerCase().includes(s)
        ));
    }

    // 2. Category Filtering
    // 3. Logic for Date Range vs Standard Value
    if (filterCategory === 'date_range') {
        if (startDate) result = result.filter(r => new Date(r.created_at) >= new Date(startDate))
        if (endDate) result = result.filter(r => new Date(r.created_at) <= new Date(endDate + 'T23:59:59'))
    } 
    else if (filterCategory !== 'all' && filterValue) {
        switch (filterCategory) {
            case 'subject':
                result = result.filter(r => formatName(r.subject) === filterValue);
                break;
            case 'submitter':
                result = result.filter(r => formatName(r.submitter) === filterValue);
                break;
            case 'offense':
                result = result.filter(r => r.offense_type.offense_name === filterValue);
                break;
            case 'type':
                result = result.filter(r => getTaskType(r) === filterValue);
                break;
        }
    }

    // 4. Sort
    result.sort((a, b) => {
        let aValue: any = '', bValue: any = ''
        switch (sortConfig.key) {
            case 'subject': aValue = formatName(a.subject); bValue = formatName(b.subject); break;
            case 'submitter': aValue = formatName(a.submitter); bValue = formatName(b.submitter); break;
            case 'type': aValue = getTaskType(a); bValue = getTaskType(b); break;
            case 'created_at': aValue = new Date(a.created_at).getTime(); bValue = new Date(b.created_at).getTime(); break;
        }
        return aValue < bValue ? (sortConfig.direction === 'asc' ? -1 : 1) : (aValue > bValue ? (sortConfig.direction === 'asc' ? 1 : -1) : 0)
    })
    return result;
  }, [initialReports, searchTerm, filterCategory, filterValue, startDate, endDate, sortConfig, currentUserId])

  // --- Handlers ---
  const handleSort = (key: SortKey) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' })
  }

  const handleFilterCategoryChange = (cat: FilterCategory) => {
      setFilterCategory(cat);
      setFilterValue(''); 
      setStartDate('');
      setEndDate('');
  }

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedReports)
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedReports(newSet)
  }

  const handleSelectAll = () => {
    const bulkableItems = processedReports.filter(isBulkActionable);
    if (selectedReports.size === bulkableItems.length && bulkableItems.length > 0) {
        setSelectedReports(new Set());
    } else {
        setSelectedReports(new Set(bulkableItems.map(i => i.id)))
    }
  }

  const handleRowClick = (reportId: string) => {
    if (expandedRowId === reportId) {
      setExpandedRowId(null)
      setSingleComment('')
    } else {
      setExpandedRowId(reportId)
      setSingleComment('')
    }
  }

  // --- Logic: Bulk & Single Actions ---
  const performAction = async (report: ActionItemReport, action: 'approve' | 'reject' | 'kickback', comment: string) => {
      const taskType = getTaskType(report);
      let rpcName = '';
      let payload = {};

      if (taskType === 'Approval Needed') {
          if (action === 'approve') {
              rpcName = 'handle_approval';
              payload = { report_id_to_approve: report.id, approval_comment: comment };
          } else if (action === 'reject') {
              rpcName = 'handle_rejection';
              payload = { p_report_id: report.id, p_comment: comment };
          } else if (action === 'kickback') {
              rpcName = 'handle_kickback';
              payload = { p_report_id: report.id, p_comment: comment };
          }
      } 
      else if (taskType === 'Appeal Review') {
          if (report.appeal_status === 'pending_issuer') rpcName = 'appeal_issuer_action';
          else if (report.appeal_status === 'pending_chain') rpcName = 'appeal_chain_action';
          else if (report.appeal_status === 'pending_commandant') rpcName = 'appeal_commandant_action';

          const appealAction = action === 'approve' ? 'grant' : 'reject';
          
          if (rpcName) {
            payload = { p_appeal_id: report.appeal_id, p_action: appealAction, p_comment: comment };
          } else {
             return { error: { message: 'Could not determine appeal stage.' } };
          }
      }
      else if (taskType === 'Revision Needed') {
           return { error: { message: 'Revisions must be done via the full edit page.' } };
      }

      return supabase.rpc(rpcName, payload);
  }

  const handleSingleAction = async (report: ActionItemReport, action: 'approve' | 'reject' | 'kickback') => {
    if ((action === 'reject' || action === 'kickback') && !singleComment.trim()) {
      alert(`A comment is required to ${action} this item.`)
      return
    }
    if (getTaskType(report).includes('Appeal') && action === 'kickback') {
        alert("You cannot 'Kick-Back' an appeal. Please Reject it if clarification is needed, or Grant it.");
        return;
    }

    setIsLoading(true)
    const { error } = await performAction(report, action, singleComment.trim() || 'Approved');
    
    if (error) alert(`Error: ${error.message}`)
    else {
      setExpandedRowId(null)
      setSingleComment('')
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedReports.size === 0) return
    if (action === 'reject' && !bulkComment.trim()) { alert('Comment required for rejection'); return; }
    
    if (!window.confirm(`Are you sure you want to ${action} ${selectedReports.size} items?`)) return;

    setIsLoading(true)
    const reportsToProcess = processedReports.filter(r => selectedReports.has(r.id));
    
    await Promise.all(reportsToProcess.map(report => 
        performAction(report, action, bulkComment.trim() || 'Bulk Action')
    ));
    
    setSelectedReports(new Set()); 
    setBulkComment(''); 
    router.refresh();
    setIsLoading(false)
  }

  const SortIcon = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' }) => {
      if (!active) return <span className="ml-1 text-gray-400">↕</span>;
      return <span className="ml-1 text-indigo-600 dark:text-indigo-400">{direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const getTaskBadge = (r: ActionItemReport) => {
      const type = getTaskType(r);
      const styles: Record<string, string> = {
          'Approval Needed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
          'Incident Review': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', // <--- NEW STYLE
          'Revision Needed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
          'Appeal Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          'Appeal Decision': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      };
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>{type}</span>
  }
  
  const bulkableCount = processedReports.filter(isBulkActionable).length;
  const isAllSelected = bulkableCount > 0 && selectedReports.size === bulkableCount;

  return (
    <div className="space-y-6">
      
      {/* --- STANDARDIZED FLOATING TOOLBAR --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* 1. Search Bar (Left) */}
            <div className="w-full lg:w-1/3 relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Quick Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 pl-10 pr-3 focus:ring-indigo-500 focus:border-indigo-500" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {/* 2. Filter Controls (Right) */}
            <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Filter By</label>
                    <select 
                        value={filterCategory} 
                        onChange={e => handleFilterCategoryChange(e.target.value as FilterCategory)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="all">None</option>
                        <option value="date_range">Date Range</option>
                        <option value="subject">Subject</option>
                        <option value="submitter">Submitter</option>
                        <option value="offense">Infraction</option>
                        <option value="type">Action Type</option>
                    </select>
                </div>

                <div className="w-full sm:w-2/3">
                     {/* 4. Conditional Rendering for Date Inputs vs Select Dropdown */}
                     {filterCategory === 'date_range' ? (
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
                            <label className={`block text-xs font-bold uppercase mb-1 ${filterCategory === 'all' ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                {filterCategory === 'all' ? 'Select Filter Type First' : 'Select Value'}
                            </label>
                            <select 
                                value={filterValue} 
                                onChange={e => setFilterValue(e.target.value)} 
                                disabled={filterCategory === 'all'} 
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">{filterCategory === 'all' ? '—' : 'Select...'}</option>
                                {filterCategory === 'subject' && uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterCategory === 'submitter' && uniqueSubmitters.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterCategory === 'offense' && uniqueOffenses.map(s => <option key={s} value={s}>{s}</option>)}
                                {filterCategory === 'type' && uniqueTypes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                     )}
                </div>
            </div>
          </div>
      </div>

      {/* --- BULK ACTION BAR --- */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
          <div className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[100px]">
             {selectedReports.size} selected
          </div>
          <div className="flex-1 w-full">
             <input type="text" placeholder={selectedReports.size > 0 ? "Comment for bulk action (required for rejection)..." : "Select checkboxes to enable bulk actions..."} value={bulkComment} onChange={e => setBulkComment(e.target.value)} disabled={selectedReports.size === 0} className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3 disabled:bg-gray-200 dark:disabled:bg-gray-700/50" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button onClick={() => handleBulkAction('approve')} disabled={selectedReports.size === 0 || isLoading} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">Approve</button>
             <button onClick={() => handleBulkAction('reject')} disabled={selectedReports.size === 0 || isLoading || !bulkComment.trim()} className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">Reject</button>
          </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="p-4 text-left w-12">
                        <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30" 
                            checked={isAllSelected} 
                            onChange={handleSelectAll} 
                            disabled={bulkableCount === 0}
                        />
                    </th>
                    <th onClick={() => handleSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Date <SortIcon active={sortConfig.key === 'created_at'} direction={sortConfig.direction} /></th>
                    <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Subject <SortIcon active={sortConfig.key === 'subject'} direction={sortConfig.direction} /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Infraction</th>
                    <th onClick={() => handleSort('type')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">Action <SortIcon active={sortConfig.key === 'type'} direction={sortConfig.direction} /></th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {processedReports.length > 0 ? processedReports.map(item => {
                    const isAppeal = getTaskType(item).includes('Appeal');
                    const canBulkSelect = isBulkActionable(item);
                    
                    return (
                    <React.Fragment key={item.id}>
                        <tr onClick={() => handleRowClick(item.id)} className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${expandedRowId === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                        <td className="p-4" onClick={e => e.stopPropagation()}>
                            {canBulkSelect ? (
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                                    checked={selectedReports.has(item.id)} 
                                    onChange={() => handleSelect(item.id)} 
                                />
                            ) : <span className="block w-4 h-4"></span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{formatName(item.subject)}</div><div className="text-xs text-gray-500">By: {formatName(item.submitter)}</div></td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{item.offense_type.offense_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getTaskBadge(item)}</td>
                        </tr>

                        {/* EXPANDED ROW */}
                        {expandedRowId === item.id && (
                        <tr className="bg-gray-50 dark:bg-gray-900/30 shadow-inner">
                            <td colSpan={5} className="p-0 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row">
                                
                                {/* LEFT COLUMN: Context & Details */}
                                <div className="flex-grow p-6 space-y-4 md:border-r border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="block text-xs font-bold text-gray-500 uppercase">Submitted By</span><span className="text-gray-900 dark:text-white">{formatName(item.submitter)}</span></div>
                                        <div><span className="block text-xs font-bold text-gray-500 uppercase">Time</span><span className="text-gray-900 dark:text-white">{new Date(item.created_at).toLocaleTimeString()}</span></div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Original Report Notes</h4>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                                            {item.notes || <span className="italic text-gray-400">No notes provided.</span>}
                                        </p>
                                    </div>

                                    {/* --- SPECIAL APPEAL VIEW --- */}
                                    {isAppeal ? (
                                        <div className="space-y-3 mt-4">
                                            <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-200 pb-1 border-b border-indigo-200 dark:border-indigo-800">Appeal Case File</h4>
                                            
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md">
                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase block mb-1">Cadet Justification</span>
                                                <p className="text-sm text-gray-900 dark:text-white">{item.appeal_justification}</p>
                                            </div>

                                            {item.appeal_issuer_comment && (
                                                <div className="ml-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-400">
                                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block mb-1">Issuer Rebuttal</span>
                                                    <p className="text-sm text-gray-900 dark:text-white">{item.appeal_issuer_comment}</p>
                                                </div>
                                            )}

                                            {item.appeal_chain_comment && (
                                                <div className="ml-8 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border-l-4 border-purple-400">
                                                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase block mb-1">Chain of Command Note</span>
                                                    <p className="text-sm text-gray-900 dark:text-white">{item.appeal_chain_comment}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* --- STANDARD HISTORY VIEW --- */
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">History</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {item.logs.map((log, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-xs">
                                                        <span className="font-medium text-gray-900 dark:text-white w-24 flex-shrink-0">{log.actor_name}</span>
                                                        <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-bold uppercase text-[10px]">{log.action}</span>
                                                        <span className="text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
                                                        {log.comment && <span className="text-gray-600 dark:text-gray-400 italic">- "{log.comment}"</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT COLUMN: Actions */}
                                <div className="md:w-72 flex-shrink-0 p-6 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-4 border-l border-gray-200 dark:border-gray-700">
                                    {/* NEW: Check if Incident */}
                                    {item.type === 'incident' ? (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Incidents require detailed review and cannot be quick-approved.
                                            </p>
                                            <Link 
                                                href={`/incidents/${item.id}`} 
                                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold text-center shadow-sm"
                                            >
                                                Process Incident &rarr;
                                            </Link>
                                        </div>
                                    ) : (
                                        /* STANDARD REPORT ACTIONS */
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                                    {isAppeal ? 'Appeal Decision Note' : 'Review Comment'}
                                                </label>
                                                <textarea
                                                    placeholder={isAppeal ? "Reason (visible to cadet)..." : "Reason..."}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm text-sm p-2"
                                                    rows={4}
                                                    value={singleComment}
                                                    onChange={e => setSingleComment(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleSingleAction(item, 'approve')} disabled={isLoading} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors shadow-sm">
                                                    {isAppeal ? 'Grant / Forward Appeal' : 'Approve'}
                                                </button>
                                                <div className="flex gap-2">
                                                    {!isAppeal && (
                                                        <button onClick={() => handleSingleAction(item, 'kickback')} disabled={isLoading || !singleComment.trim()} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors shadow-sm">
                                                            Kick-Back
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleSingleAction(item, 'reject')} disabled={isLoading || !singleComment.trim()} className={`flex-1 py-2 ${isAppeal ? 'w-full' : ''} bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors shadow-sm`}>
                                                        {isAppeal ? 'Reject Appeal' : 'Reject'}
                                                    </button>
                                                </div>
                                            </div>
                                            <Link href={`/report/${item.id}`} className="text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 font-medium">
                                                Open Full Report Page &rarr;
                                            </Link>
                                        </>
                                    )}
                                </div>

                            </div>
                            </td>
                        </tr>
                        )}
                    </React.Fragment>
                    );
                }) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No pending items found.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}