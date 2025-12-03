'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// --- Types ---
type GreenSheetReport = {
  report_id: string;
  subject_name: string;
  company_name: string | null;
  offense_name: string;
  policy_category: number;
  demerits: number;
  submitter_name: string;
  date_of_offense: string;
  notes: string | null;
}

type TourSheetCadet = {
  cadet_id: string;
  last_name: string;
  first_name: string;
  company_name: string;
  total_tours: number;
  has_star_tours: boolean;
  tours_logged_today: boolean;
}

type SortKey = 'subject' | 'company' | 'offense' | 'cat' | 'demerits' | 'submitter' | 'date' | 'total_tours'
type SortDirection = 'asc' | 'desc'

export default function DailyReportsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'green' | 'tour'>('green')
  const [greenSheet, setGreenSheet] = useState<GreenSheetReport[]>([])
  const [tourSheet, setTourSheet] = useState<TourSheetCadet[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [userRole, setUserRole] = useState<string>('')
  
  const [isPosting, setIsPosting] = useState(false)
  const [isLoggingTours, setIsLoggingTours] = useState(false)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCadet, setSelectedCadet] = useState<TourSheetCadet | null>(null) 
  const [selectedTourCadets, setSelectedTourCadets] = useState<Set<string>>(new Set()) 
  const [toursToLog, setToursToLog] = useState(3)
  const [logComment, setLogComment] = useState('')

  // REMOVED: searchTerm state
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' })
  
  const [isCopied, setIsCopied] = useState(false)

  // --- Set Document Title ---
  useEffect(() => {
    const updateTitle = () => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        const prefix = activeTab === 'green' ? 'Green Sheet' : 'Tour Sheet';
        document.title = `${prefix} ${formattedDate}`;
    };
    updateTitle();
    return () => { document.title = 'CadetFlow'; };
  }, [activeTab]);
  
  useEffect(() => {
      setIsCopied(false);
  }, [activeTab]);

  useEffect(() => {
    async function getReports() {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('roles:role_id ( role_name )')
          .eq('id', user.id)
          .single()
        
        if (profile && profile.roles) {
           setUserRole((profile.roles as any).role_name || '');
        }
      }

      const [greenRes, tourRes] = await Promise.all([
        supabase.rpc('get_unposted_green_sheet'),
        supabase.rpc('get_tour_sheet')
      ])

      if (greenRes.error) {
        setError("You do not have permission to view these reports.")
      } else {
        setGreenSheet(greenRes.data || [])
      }

      if (tourRes.error && !greenRes.error) {
         setError(tourRes.error.message)
      } else if (tourRes.data) {
        setTourSheet(tourRes.data)
      }
      setLoading(false)
    }
    getReports()
  }, [supabase])

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectTourRow = (id: string) => {
    const newSet = new Set(selectedTourCadets)
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedTourCadets(newSet)
  }

  const handleSelectAllTourRows = () => {
    const eligibleCadets = processedTourSheet.filter(c => !c.tours_logged_today).map(c => c.cadet_id);
    if (selectedTourCadets.size === eligibleCadets.length) {
      setSelectedTourCadets(new Set())
    } else {
      setSelectedTourCadets(new Set(eligibleCadets))
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-gray-300 ml-1 print:hidden">⇅</span>
    return <span className="text-indigo-600 dark:text-indigo-400 ml-1 print:hidden">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  const processedGreenSheet = useMemo(() => {
    // REMOVED: Filtering logic
    let data = [...greenSheet]; // Copy array

    data.sort((a, b) => {
      let valA: any = '', valB: any = ''
      switch (sortConfig.key) {
        case 'subject': valA = a.subject_name; valB = b.subject_name; break;
        case 'company': valA = a.company_name || ''; valB = b.company_name || ''; break;
        case 'offense': valA = a.offense_name; valB = b.offense_name; break;
        case 'cat': valA = a.policy_category; valB = b.policy_category; break;
        case 'demerits': valA = a.demerits; valB = b.demerits; break;
        case 'submitter': valA = a.submitter_name; valB = b.submitter_name; break;
        case 'date': valA = new Date(a.date_of_offense).getTime(); valB = new Date(b.date_of_offense).getTime(); break;
        default: return 0;
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [greenSheet, sortConfig])

  const processedTourSheet = useMemo(() => {
    // REMOVED: Filtering logic
    let data = [...tourSheet]; // Copy array

    data.sort((a, b) => {
      let valA: any = '', valB: any = ''
      switch (sortConfig.key) {
        case 'subject': valA = a.last_name; valB = b.last_name; break;
        case 'company': valA = a.company_name; valB = b.company_name; break;
        case 'total_tours': valA = a.total_tours; valB = b.total_tours; break;
        default: return 0;
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [tourSheet, sortConfig])

  async function handleMarkAsPosted() {
    if (greenSheet.length === 0 || !window.confirm("Mark all currently unposted reports as posted?")) return
    setIsPosting(true)
    const { error } = await supabase.rpc('mark_green_sheet_as_posted', { p_report_ids: greenSheet.map(r => r.report_id) })
    if (error) alert(error.message)
    else { setGreenSheet([]); alert("Posted successfully.") }
    setIsPosting(false)
  }

  async function handleLogTours() {
    if (toursToLog <= 0) return;
    if (selectedCadet && !selectedTourCadets.size) {
        if (toursToLog > selectedCadet.total_tours && !selectedCadet.has_star_tours) {
            alert(`Cannot log ${toursToLog} tours. Only ${selectedCadet.total_tours} remaining.`); 
            return;
        }
    }
    setIsLoggingTours(true)
    let successCount = 0;
    let errorMsg = '';
    const targets = selectedCadet ? [selectedCadet.cadet_id] : Array.from(selectedTourCadets);
    const promises = targets.map(cadetId => 
        supabase.rpc('log_served_tours', { p_cadet_id: cadetId, p_tours_served: toursToLog, p_comment: logComment })
    );
    const results = await Promise.all(promises);
    results.forEach(res => {
        if (res.error) errorMsg = res.error.message; else successCount++;
    });
    if (errorMsg && successCount === 0) {
        alert(`Failed: ${errorMsg}`);
    } else {
        const affectedIds = new Set(targets);
        setTourSheet(prev => prev.map(c => 
            affectedIds.has(c.cadet_id) ? { ...c, total_tours: c.total_tours - toursToLog, tours_logged_today: true } : c
          ).filter(c => c.total_tours > 0 || c.has_star_tours)
        );
        closeModal();
        setSelectedTourCadets(new Set());
    }
    setIsLoggingTours(false)
  }

  function openTourModal(cadet?: TourSheetCadet) { 
      if (cadet) { setSelectedCadet(cadet); } else { setSelectedCadet(null); }
      setToursToLog(3); setLogComment(''); setModalOpen(true); 
  }
  function closeModal() { setModalOpen(false); setSelectedCadet(null); }
  const formatDate = (d: string) => new Date(new Date(d).getTime() + new Date(d).getTimezoneOffset() * 60000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  const canPost = ['Commandant', 'Deputy Commandant', 'Admin'].includes(userRole);
  const canLog = userRole.includes('TAC') || canPost;

  // --- CLIPBOARD HELPERS ---
  const copyToClipboard = async (html: string) => {
      try {
          const blob = new Blob([html], { type: 'text/html' });
          const data = [new ClipboardItem({ 'text/html': blob })];
          await navigator.clipboard.write(data);
          
          // Visual Feedback Loop
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          
      } catch (err) {
          console.error('Failed to copy:', err);
          alert('Failed to copy to clipboard. Please try again.');
      }
  }

  const handleCopyGreenSheet = () => {
      if (processedGreenSheet.length === 0) { alert('No data.'); return; }
      const rows = processedGreenSheet.map(r => `<tr><td style="border:1px solid #ddd;padding:8px;">${r.subject_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.company_name||'-'}</td><td style="border:1px solid #ddd;padding:8px;">${r.offense_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.policy_category}</td><td style="border:1px solid #ddd;padding:8px;">${r.demerits}</td><td style="border:1px solid #ddd;padding:8px;">${r.submitter_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.notes||''}</td><td style="border:1px solid #ddd;padding:8px;">${formatDate(r.date_of_offense)}</td></tr>`).join('');
      const html = `<h2>Green Sheet - ${new Date().toLocaleDateString()}</h2><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><thead><tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd;padding:8px;">Cadet</th><th style="border:1px solid #ddd;padding:8px;">Company</th><th style="border:1px solid #ddd;padding:8px;">Offense</th><th style="border:1px solid #ddd;padding:8px;">Cat</th><th style="border:1px solid #ddd;padding:8px;">Dem</th><th style="border:1px solid #ddd;padding:8px;">Submitted By</th><th style="border:1px solid #ddd;padding:8px;">Notes</th><th style="border:1px solid #ddd;padding:8px;">Date</th></tr></thead><tbody>${rows}</tbody></table>`;
      copyToClipboard(html);
  }

  const handleCopyTourSheet = () => {
    if (processedTourSheet.length === 0) { alert('No data.'); return; }
    const rows = processedTourSheet.map(c => `<tr><td style="border:1px solid #ddd;padding:8px;">${c.last_name}, ${c.first_name} ${c.has_star_tours?'(*)':''}</td><td style="border:1px solid #ddd;padding:8px;">${c.company_name||'-'}</td><td style="border:1px solid #ddd;padding:8px;text-align:center;font-weight:bold;">${c.has_star_tours?'*':c.total_tours}</td><td style="border:1px solid #ddd;padding:8px;"></td><td style="border:1px solid #ddd;padding:8px;"></td></tr>`).join('');
    const html = `<h2>Tour Sheet - ${new Date().toLocaleDateString()}</h2><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><thead><tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd;padding:8px;">Cadet</th><th style="border:1px solid #ddd;padding:8px;">Company</th><th style="border:1px solid #ddd;padding:8px;">Total</th><th style="border:1px solid #ddd;padding:8px;width:100px;">Served</th><th style="border:1px solid #ddd;padding:8px;width:200px;">Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
    copyToClipboard(html);
  }

  if (loading) return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading daily reports...</div>
  if (error) return <div className="p-4 text-center text-red-600 dark:text-red-400">{error}</div>

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 0.25in; }
          body { background-color: white !important; color: black !important; }
          header, .no-print, .printable-section:not(.print-active) { display: none !important; }
          main { padding: 0; margin: 0; }
          .print-container { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .flow-root, .overflow-x-auto, .inline-block {
            display: block !important;
            width: 100% !important;
            min-width: 100% !important;
            overflow: visible !important;
          }
          .printable-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
          .printable-table thead { display: table-header-group; }
          .printable-table tbody tr { page-break-inside: avoid; }
          .printable-table th, .printable-table td { border: 1px solid #000; padding: 0.2rem 0.25rem; font-size: 8pt; text-align: left; vertical-align: top; word-wrap: break-word; }
          .printable-table th { background-color: #eee; }
          .printable-table th, .printable-table td { display: table-cell !important; }
          .col-cadet { width: 18%; } .col-co { width: 5%; } .col-offense { width: 25%; } .col-cat { width: 4%; } .col-demerits { width: 6%; } .col-submitter { width: 15%; } .col-notes { width: 22%; } .col-date { width: 5%; }
          .col-tour-cadet { width: 30%; } .col-tour-co { width: 15%; } .col-tour-total { width: 10%; } .col-tour-served { width: 15%; } .col-tour-notes { width: 30%; }
          .fill-in-box { height: 2.5em; }
          .col-check, .cell-check { display: none; }
        }
      `}</style>
      
      <div id="tour-daily-table" className="mt-8 flex flex-col">
       <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 print-container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily administrative summaries.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             {/* REMOVED SEARCH INPUT */}
             <button 
                onClick={activeTab === 'green' ? handleCopyGreenSheet : handleCopyTourSheet} 
                disabled={isCopied}
                className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium flex-shrink-0 transition-colors duration-200 ${
                    isCopied 
                        ? 'bg-green-100 text-green-800' 
                        : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200' 
                }`}
             >
               {isCopied ? 'Copied!' : 'Copy to Clipboard'}
             </button>

             <button onClick={() => window.print()} className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex-shrink-0 transition-colors">
               Print {activeTab === 'green' ? 'Green Sheet' : 'Tour Sheet'}
             </button>
          </div>
        </div>

        <div id="daily-tabs" className="mt-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('green')} className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'green' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Green Sheet</button>
            <button onClick={() => setActiveTab('tour')} className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'tour' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Tour Sheet</button>
          </nav>
        </div>

        <div id="daily-content-area">
            {/* --- Green Sheet Section --- */}
            <section id="green-sheet-container" className={`mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`}>
            <div className="flex justify-between items-center no-print mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Unposted Green Sheet ({processedGreenSheet.length})
                    <span className="text-sm font-normal text-gray-500 ml-2"></span>
                </h2>
                {canPost && (
                <button onClick={handleMarkAsPosted} disabled={isPosting || greenSheet.length === 0} className="py-2 px-3 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                    {isPosting ? 'Posting...' : `Mark All ${greenSheet.length} as Posted`}
                </button>
                )}
            </div>
            <h2 className="hidden print:block">Green Sheet - {new Date().toLocaleDateString()}</h2>
            
            <div className="mt-4 flow-root">
                <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6"><div className="inline-block min-w-full w-full py-2 align-middle sm:px-4 lg:px-6">
                    <table className="min-w-full w-full printable-table border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                        <th onClick={() => handleSort('subject')} className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cadet cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Cadet <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('company')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-co cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Company <SortIcon column="company"/></th>
                        <th onClick={() => handleSort('offense')} className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-offense cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Offense <SortIcon column="offense"/></th>
                        <th onClick={() => handleSort('cat')} className="hidden lg:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cat cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Cat <SortIcon column="cat"/></th>
                        <th onClick={() => handleSort('demerits')} className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-demerits cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Dem <SortIcon column="demerits"/></th>
                        <th onClick={() => handleSort('submitter')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-submitter cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Submitted By <SortIcon column="submitter"/></th>
                        <th className="hidden lg:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-notes">Notes</th>
                        <th onClick={() => handleSort('date')} className="hidden sm:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-date cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Date <SortIcon column="date"/></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {processedGreenSheet.length > 0 ? processedGreenSheet.map(r => (
                        <tr 
                            key={r.report_id}
                            onClick={() => router.push(`/report/${r.report_id}`)}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <td className="p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{r.subject_name}</td>
                            <td className="hidden md:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.company_name || '-'}</td>
                            <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.offense_name}</td>
                            <td className="hidden lg:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.policy_category}</td>
                            <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.demerits}</td>
                            <td className="hidden md:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.submitter_name}</td>
                            <td className="hidden lg:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 max-w-xs break-words">{r.notes}</td>
                            <td className="hidden sm:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{formatDate(r.date_of_offense)}</td>
                        </tr>
                        )) : <tr className="no-print"><td colSpan={8} className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">No unposted demerits.</td></tr>}
                    </tbody>
                    </table>
                </div></div>
            </div>
            </section>

            {/* --- Tour Sheet Section --- */}
            <section className={`mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`}>
            <div className="no-print mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Tour Sheet ({processedTourSheet.length})
                    <span className="text-sm font-normal text-gray-500 ml-2"></span>
                </h2>
                
                {canLog && selectedTourCadets.size > 0 && (
                    <button 
                        id="tour-bulk-log-btn"
                        onClick={() => openTourModal()}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm font-medium"
                    >
                        Bulk Log for {selectedTourCadets.size} Cadets
                    </button>
                )}
            </div>
            <h2 className="hidden print:block">Tour Sheet - {new Date().toLocaleDateString()}</h2>
            <div className="mt-4 flow-root">
                <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6"><div className="inline-block min-w-full w-full py-2 align-middle sm:px-4 lg:px-6">
                    <table className="min-w-full w-full printable-table border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                        {canLog && (
                            <th className="p-2 text-center w-10 border border-gray-300 dark:border-gray-600 col-check no-print">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                    onChange={handleSelectAllTourRows}
                                    checked={
                                        processedTourSheet.filter(c => !c.tours_logged_today).length > 0 && 
                                        selectedTourCadets.size === processedTourSheet.filter(c => !c.tours_logged_today).length
                                    }
                                />
                            </th>
                        )}
                        <th onClick={() => handleSort('subject')} className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-cadet cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-1/3">Cadet <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('company')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-co cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-1/4">Company <SortIcon column="company"/></th>
                        <th onClick={() => handleSort('total_tours')} className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-total cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-1/6">Total <SortIcon column="total_tours"/></th>
                        <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-served">Served</th>
                        <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-notes">Notes</th>
                        <th className="relative p-2 no-print border-l border-gray-300 dark:border-gray-600 w-auto"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {processedTourSheet.length > 0 ? processedTourSheet.map(c => (
                        <tr 
                            key={c.cadet_id} 
                            className={`
                                ${c.has_star_tours ? 'bg-red-50 dark:bg-red-900/20' : ''} 
                                ${c.tours_logged_today ? 'opacity-50 bg-gray-50 dark:bg-gray-900/50' : ''}
                            `}
                        >
                            {canLog && (
                                <td className="p-2 text-center border border-gray-300 dark:border-gray-600 cell-check no-print">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                                        checked={selectedTourCadets.has(c.cadet_id)}
                                        onChange={() => handleSelectTourRow(c.cadet_id)}
                                        disabled={c.tours_logged_today}
                                    />
                                </td>
                            )}
                            <td className="p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                                {c.has_star_tours && (
                                <span className="font-bold text-lg leading-none text-red-600 dark:text-red-400" aria-hidden="true" title="Star Tours Assigned">
                                    &lowast;
                                </span>
                                )}
                                {c.tours_logged_today && (
                                    <span className="text-green-600 dark:text-green-400 font-bold text-xs border border-green-600 dark:border-green-400 px-1 rounded no-print">
                                        ✓
                                    </span>
                                )}
                                <span>{c.last_name}, {c.first_name}</span>
                            </div>
                            </td>
                            <td className="hidden md:table-cell p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{c.company_name || '-'}</td>
                            <td className="p-2 text-sm font-bold text-red-600 dark:text-red-400 border border-gray-300 dark:border-gray-600">
                            {c.has_star_tours ? '*' : c.total_tours}
                            </td>
                            <td className="p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"></td>
                            <td className="p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"></td>
                            <td className="relative p-2 text-right text-sm font-medium no-print border border-gray-300 dark:border-gray-600">
                            {canLog && (
                                <button 
                                    onClick={() => openTourModal(c)} 
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 disabled:text-gray-400"
                                >
                                    Log
                                </button>
                            )}
                            </td>
                        </tr>
                        )) : <tr className="no-print"><td colSpan={7} className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">No cadets on ED.</td></tr>}
                    </tbody>
                    </table>
                </div></div>
            </div>
            </section>
        </div>
      </div>
      </div>

      {/* --- Log Tours Modal --- */}
      {modalOpen && (
        <div className="relative z-10 no-print" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900/75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                      {selectedCadet 
                        ? `Log Served Tours: ${selectedCadet.last_name}` 
                        : `Bulk Log Tours (${selectedTourCadets.size} Cadets)`
                      }
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedCadet 
                        ? `Current Balance: ${selectedCadet.has_star_tours ? '*' : selectedCadet.total_tours} tours`
                        : `This will deduct tours from all selected cadets.`
                      }
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tours Served</label>
                      <input type="number" value={toursToLog} onChange={e => setToursToLog(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                      <input type="text" placeholder="e.g., 'Good behavior'" value={logComment} onChange={e => setLogComment(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm sm:text-sm" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" disabled={isLoggingTours} onClick={handleLogTours} className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">{isLoggingTours ? 'Logging...' : 'Confirm Log'}</button>
                  <button type="button" onClick={closeModal} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}