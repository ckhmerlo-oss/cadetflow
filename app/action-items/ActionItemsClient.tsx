'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ActionItemReport } from './page'
import Link from 'next/link'

type SortKey = 'created_at' | 'subject' | 'type' | 'submitter';
type SortDirection = 'asc' | 'desc';

export default function ActionItemsClient({ initialReports, currentUserId }: { initialReports: ActionItemReport[], currentUserId: string }) {
  const router = useRouter()
  const supabase = createClient()

  // --- State ---
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSubmitter, setFilterSubmitter] = useState<string>('all')
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'created_at', direction: 'asc' })
  const [isLoading, setIsLoading] = useState(false)
  
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
      if (r.appeal_status && ['pending_issuer', 'pending_chain', 'pending_commandant'].includes(r.appeal_status)) return 'Appeal Review';
      if (r.appeal_status && ['rejected_by_issuer', 'rejected_by_chain'].includes(r.appeal_status) && r.subject_cadet_id === currentUserId) return 'Appeal Decision';
      if (r.status === 'needs_revision') return 'Revision Needed';
      return 'Approval Needed';
  }

  // *** NEW: Determine if item can be bulk processed ***
  const isBulkActionable = (r: ActionItemReport) => {
      // Only standard approvals allow bulk actions. 
      // Appeals and Revisions require individual attention.
      return getTaskType(r) === 'Approval Needed';
  }

  const uniqueSubmitters = useMemo(() => {
    const submitters = new Set(initialReports.map(r => formatName(r.submitter)));
    return Array.from(submitters).sort();
  }, [initialReports]);

  // --- Filtering & Sorting ---
  const processedReports = useMemo(() => {
    let result = [...initialReports];

    // 1. Search
    if (searchTerm) {
        const s = searchTerm.toLowerCase();
        result = result.filter(item => (
            formatName(item.subject).toLowerCase().includes(s) ||
            formatName(item.submitter).toLowerCase().includes(s) ||
            item.offense_type.offense_name.toLowerCase().includes(s)
        ));
    }

    // 2. Filter Type
    if (filterType !== 'all') {
        result = result.filter(r => {
            const type = getTaskType(r);
            if (filterType === 'approvals') return type === 'Approval Needed';
            if (filterType === 'revisions') return type === 'Revision Needed';
            if (filterType === 'appeals') return type.includes('Appeal');
            return true;
        });
    }

    // 3. Filter Submitter
    if (filterSubmitter !== 'all') {
        result = result.filter(r => formatName(r.submitter) === filterSubmitter);
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
  }, [initialReports, searchTerm, filterType, filterSubmitter, sortConfig, currentUserId])

  // --- Handlers ---
  const handleSort = (key: SortKey) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' })
  }

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedReports)
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedReports(newSet)
  }

  // *** UPDATED: Only selects items that are allowed to be bulk approved ***
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

      // A. STANDARD APPROVAL
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
      // B. APPEAL ACTIONS
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
          'Revision Needed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
          'Appeal Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          'Appeal Decision': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      };
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>{type}</span>
  }
  
  // Calculations for Select All checkbox state
  const bulkableCount = processedReports.filter(isBulkActionable).length;
  const isAllSelected = bulkableCount > 0 && selectedReports.size === bulkableCount;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      
      {/* --- Toolbar --- */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <input type="text" placeholder="Search reports..." className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm py-2 px-3" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-2">
                 <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm">
                    <option value="all">All Actions</option>
                    <option value="approvals">Approval Needed</option>
                    <option value="revisions">Revision Needed</option>
                    <option value="appeals">Appeals</option>
                 </select>
                 <select value={filterSubmitter} onChange={e => setFilterSubmitter(e.target.value)} className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm">
                    <option value="all">All Submitters</option>
                    {uniqueSubmitters.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                 {selectedReports.size} selected
              </div>
              <input type="text" placeholder={selectedReports.size > 0 ? "Optional comment for bulk action..." : "Select items to enable actions..."} value={bulkComment} onChange={e => setBulkComment(e.target.value)} disabled={selectedReports.size === 0} className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm sm:text-sm" />
              <div className="flex gap-2">
                 <button onClick={() => handleBulkAction('approve')} disabled={selectedReports.size === 0 || isLoading} className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Approve</button>
                 <button onClick={() => handleBulkAction('reject')} disabled={selectedReports.size === 0 || isLoading || !bulkComment.trim()} className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">Reject</button>
              </div>
          </div>
      </div>

      {/* --- Table --- */}
      <div className="flex-grow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
                <th className="p-4 text-left w-12">
                    {/* *** SMART CHECKBOX: Only selects bulkable items *** */}
                    <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-30" 
                        checked={isAllSelected} 
                        onChange={handleSelectAll} 
                        disabled={bulkableCount === 0}
                    />
                </th>
                <th onClick={() => handleSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer">Date <SortIcon active={sortConfig.key === 'created_at'} direction={sortConfig.direction} /></th>
                <th onClick={() => handleSort('subject')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer">Subject <SortIcon active={sortConfig.key === 'subject'} direction={sortConfig.direction} /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Infraction</th>
                <th onClick={() => handleSort('type')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer">Action <SortIcon active={sortConfig.key === 'type'} direction={sortConfig.direction} /></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {processedReports.length > 0 ? processedReports.map(item => {
                const isAppeal = getTaskType(item).includes('Appeal');
                const canBulkSelect = isBulkActionable(item);
                
                return (
                <React.Fragment key={item.id}>
                    <tr onClick={() => handleRowClick(item.id)} className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${expandedRowId === item.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                          {/* *** CONDITIONAL CHECKBOX *** */}
                          {canBulkSelect ? (
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                                checked={selectedReports.has(item.id)} 
                                onChange={() => handleSelect(item.id)} 
                              />
                          ) : (
                             /* Placeholder to keep column alignment */
                             <span className="block w-4 h-4"></span>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{formatName(item.subject)}</div><div className="text-xs text-gray-500">By: {formatName(item.submitter)}</div></td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{item.offense_type.offense_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getTaskBadge(item)}</td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedRowId === item.id && (
                      <tr className="bg-gray-50 dark:bg-gray-900/30">
                        <td colSpan={5} className="p-0 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col md:flex-row">
                            
                            {/* LEFT COLUMN: Context & Details */}
                            <div className="flex-grow p-6 space-y-4 md:border-r border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="block text-xs font-semibold text-gray-500 uppercase">Submitted By</span><span className="text-gray-900 dark:text-white">{formatName(item.submitter)}</span></div>
                                    <div><span className="block text-xs font-semibold text-gray-500 uppercase">Time</span><span className="text-gray-900 dark:text-white">{new Date(item.created_at).toLocaleTimeString()}</span></div>
                                </div>
                                
                                {/* Always show original notes */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Original Report Notes</h4>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                                        {item.notes || <span className="italic text-gray-400">No notes provided.</span>}
                                    </p>
                                </div>

                                {/* --- SPECIAL APPEAL VIEW --- */}
                                {isAppeal ? (
                                    <div className="space-y-3 mt-4">
                                        <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-200 pb-1 border-b border-indigo-200 dark:border-indigo-800">Appeal Case File</h4>
                                        
                                        {/* 1. Cadet Statement */}
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md">
                                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase block mb-1">Cadet Justification</span>
                                            <p className="text-sm text-gray-900 dark:text-white">{item.appeal_justification}</p>
                                        </div>

                                        {/* 2. Issuer Statement (If exists) */}
                                        {item.appeal_issuer_comment && (
                                            <div className="ml-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-400">
                                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block mb-1">Issuer Rebuttal</span>
                                                <p className="text-sm text-gray-900 dark:text-white">{item.appeal_issuer_comment}</p>
                                            </div>
                                        )}

                                        {/* 3. Chain Statement (If exists) */}
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
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">History</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {item.logs.map((log, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs">
                                                    <span className="font-medium text-gray-900 dark:text-white w-24 flex-shrink-0">{log.actor_name}</span>
                                                    <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">{log.action}</span>
                                                    <span className="text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
                                                    {log.comment && <span className="text-gray-600 dark:text-gray-400 italic">- "{log.comment}"</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: Actions */}
                            <div className="md:w-72 flex-shrink-0 p-6 bg-white dark:bg-gray-800 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        {isAppeal ? 'Appeal Decision Note' : 'Review Comment'}
                                    </label>
                                    <textarea
                                        placeholder={isAppeal ? "Reason for decision (visible to cadet)..." : "Reason for decision..."}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm text-sm p-2"
                                        rows={3}
                                        value={singleComment}
                                        onChange={e => setSingleComment(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleSingleAction(item, 'approve')} disabled={isLoading} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors">
                                        {isAppeal ? 'Grant / Forward Appeal' : 'Approve'}
                                    </button>
                                    <div className="flex gap-2">
                                        {!isAppeal && (
                                            <button onClick={() => handleSingleAction(item, 'kickback')} disabled={isLoading || !singleComment.trim()} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors">
                                                Kick-Back
                                            </button>
                                        )}
                                        <button onClick={() => handleSingleAction(item, 'reject')} disabled={isLoading || !singleComment.trim()} className={`flex-1 py-2 ${isAppeal ? 'w-full' : ''} bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors`}>
                                            {isAppeal ? 'Reject Appeal' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                                <Link href={`/report/${item.id}`} className="text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
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
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}