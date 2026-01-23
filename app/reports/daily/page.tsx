'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo, useRef } from 'react' // <--- Added useRef
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { triggerGreenSheetBlast } from '@/app/lib/server' 
import { getGreenSheetData, publishGreenSheet, markReportAsPosted, unpostReport, GreenSheetItem } from './actions'

// --- TYPES ---
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
  const dateInputRef = useRef<HTMLInputElement>(null) // <--- Ref for the date picker

  // State
  const [activeTab, setActiveTab] = useState<'green' | 'tour'>('green')
  const [viewDate, setViewDate] = useState<string | null>(null) 
  
  const [greenSheet, setGreenSheet] = useState<GreenSheetItem[]>([])
  const [tourSheet, setTourSheet] = useState<TourSheetCadet[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  
  // Actions State
  const [isPosting, setIsPosting] = useState(false)
  const [isLoggingTours, setIsLoggingTours] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  
  // Tour Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCadet, setSelectedCadet] = useState<TourSheetCadet | null>(null) 
  const [selectedTourCadets, setSelectedTourCadets] = useState<Set<string>>(new Set()) 
  const [toursToLog, setToursToLog] = useState(3)
  const [logComment, setLogComment] = useState('')

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' })
  const [isCopied, setIsCopied] = useState(false)

  // --- INITIAL LOAD ---
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('roles:role_id ( role_name )').eq('id', user.id).eq('archived', false).single()
        if (profile && profile.roles) setUserRole((profile.roles as any).role_name || '');
      }
      fetchData()
    }
    init()
  }, [])

  // --- DATA FETCHING ---
  async function fetchData() {
    setLoading(true)
    setError(null)

    try {
        const greenData = await getGreenSheetData(viewDate || undefined)
        setGreenSheet(greenData)

        const { data: tourData, error: tourError } = await supabase.rpc('get_tour_sheet')
        if (tourError) throw tourError
        if (tourData) setTourSheet(tourData)

    } catch (e: any) {
        console.error(e)
        setError("Error loading reports.")
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
      fetchData()
  }, [viewDate])

  // --- DATE NAVIGATION ---
  const handleDateChange = (days: number) => {
    const baseStr = viewDate || new Date().toISOString().split('T')[0]
    const [y, m, d] = baseStr.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    dateObj.setDate(dateObj.getDate() + days)
    
    const newY = dateObj.getFullYear()
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0')
    const newD = String(dateObj.getDate()).padStart(2, '0')
    
    setViewDate(`${newY}-${newM}-${newD}`)
  }

  // --- HANDLERS ---
  const handlePublishAll = async () => {
    if (!greenSheet.length || !confirm("Mark all displayed reports as posted?")) return
    setIsPosting(true)
    const ids = greenSheet.map(r => r.report_id)
    const res = await publishGreenSheet(ids)
    if (res.success) { 
        alert("Posted successfully."); 
        fetchData(); 
    } else { 
        alert(res.error); 
    }
    setIsPosting(false)
  }

  const handleMarkSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() 
    if(!confirm("Hide this report? It will be removed from the pending list.")) return
    
    // Capture the response
    const res = await markReportAsPosted(id)
    
    if (res.success) {
        // Only fetch if successful
        fetchData()
    } else {
        // Alert the actual error from Supabase
        alert(`Error: ${res.error}`)
    }
  }

  const handleUnpost = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      if(!confirm("Unpost this report? It will return to the Pending queue.")) return
      await unpostReport(id)
      fetchData()
  }

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // --- FILTER & SORT ---
  const processedGreenSheet = useMemo(() => {
    let data = [...greenSheet];
    if (searchTerm) {
        const low = searchTerm.toLowerCase();
        data = data.filter(r => r.subject_name.toLowerCase().includes(low) || r.offense_name.toLowerCase().includes(low));
    }
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
  }, [greenSheet, sortConfig, searchTerm])

  const processedTourSheet = useMemo(() => {
    let data = [...tourSheet];
    if (searchTerm) {
        const low = searchTerm.toLowerCase();
        data = data.filter(r => r.last_name.toLowerCase().includes(low));
    }
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
  }, [tourSheet, sortConfig, searchTerm])

  // --- MISC HELPERS ---
  const handleEmailBlast = async () => {
      if (!confirm("Are you sure you want to email the current Green Sheet?")) return;
      setIsSendingEmail(true);
      try { await triggerGreenSheetBlast(); alert("Sent!"); } catch (e: any) { alert(`Error: ${e.message}`); }
      setIsSendingEmail(false);
  }

  const handleLogTours = async () => {
    setIsLoggingTours(true)
    const targets = selectedCadet ? [selectedCadet.cadet_id] : Array.from(selectedTourCadets);
    const promises = targets.map(id => supabase.rpc('log_served_tours', { p_cadet_id: id, p_tours_served: toursToLog, p_comment: logComment }));
    await Promise.all(promises);
    setTourSheet(prev => prev.map(c => targets.includes(c.cadet_id) ? { ...c, total_tours: c.total_tours - toursToLog, tours_logged_today: true } : c));
    closeModal(); setSelectedTourCadets(new Set());
    setIsLoggingTours(false)
  }

  const openTourModal = (cadet?: TourSheetCadet) => { 
      if (cadet) setSelectedCadet(cadet); else setSelectedCadet(null);
      setToursToLog(3); setLogComment(''); setModalOpen(true); 
  }
  const closeModal = () => { setModalOpen(false); setSelectedCadet(null); }
  const handleSelectTourRow = (id: string) => { const n = new Set(selectedTourCadets); if(n.has(id)) n.delete(id); else n.add(id); setSelectedTourCadets(n); }
  const handleSelectAllTourRows = () => { if (selectedTourCadets.size === processedTourSheet.length) setSelectedTourCadets(new Set()); else setSelectedTourCadets(new Set(processedTourSheet.map(c => c.cadet_id))); }

  const formatDate = (d: string) => new Date(new Date(d).getTime() + new Date(d).getTimezoneOffset() * 60000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  const SortIcon = ({ column }: { column: SortKey }) => (sortConfig.key !== column ? <span className="text-muted-foreground/30 ml-1 print:hidden">⇅</span> : <span className="text-primary ml-1 print:hidden">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>);
  const canPost = ['Commandant', 'Deputy Commandant', 'Admin', 'Administrative Assistant to the Commandant'].includes(userRole);
  const canLog = userRole.includes('TAC') || canPost;

  // --- CLIPBOARD ---
  const copyToClipboard = async (html: string) => {
      try {
          const blob = new Blob([html], { type: 'text/html' });
          await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
          setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
      } catch (err) { alert('Failed to copy.'); }
  }
  const handleCopyGreenSheet = () => {
      const rows = processedGreenSheet.map(r => `<tr><td style="border:1px solid #ddd;padding:8px;">${r.subject_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.company_name||'-'}</td><td style="border:1px solid #ddd;padding:8px;">${r.offense_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.policy_category}</td><td style="border:1px solid #ddd;padding:8px;">${r.demerits}</td><td style="border:1px solid #ddd;padding:8px;">${r.submitter_name}</td><td style="border:1px solid #ddd;padding:8px;">${formatDate(r.date_of_offense)}</td></tr>`).join('');
      const html = `<h2>Green Sheet - ${viewDate ? new Date(viewDate).toLocaleDateString() : new Date().toLocaleDateString()}</h2><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><thead><tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd;padding:8px;">Cadet</th><th style="border:1px solid #ddd;padding:8px;">Co</th><th style="border:1px solid #ddd;padding:8px;">Offense</th><th style="border:1px solid #ddd;padding:8px;">Cat</th><th style="border:1px solid #ddd;padding:8px;">Dem</th><th style="border:1px solid #ddd;padding:8px;">By</th><th style="border:1px solid #ddd;padding:8px;">Date</th></tr></thead><tbody>${rows}</tbody></table>`;
      copyToClipboard(html);
  }
  const handleCopyTourSheet = () => {
    const rows = processedTourSheet.map(c => `<tr><td style="border:1px solid #ddd;padding:8px;">${c.last_name}, ${c.first_name} ${c.has_star_tours?'(*)':''}</td><td style="border:1px solid #ddd;padding:8px;">${c.company_name||'-'}</td><td style="border:1px solid #ddd;padding:8px;text-align:center;font-weight:bold;">${c.has_star_tours?'*':c.total_tours}</td><td style="border:1px solid #ddd;padding:8px;"></td><td style="border:1px solid #ddd;padding:8px;"></td></tr>`).join('');
    const html = `<h2>Tour Sheet - ${new Date().toLocaleDateString()}</h2><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><thead><tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd;padding:8px;">Cadet</th><th style="border:1px solid #ddd;padding:8px;">Co</th><th style="border:1px solid #ddd;padding:8px;">Total</th><th style="border:1px solid #ddd;padding:8px;width:100px;">Served</th><th style="border:1px solid #ddd;padding:8px;width:200px;">Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
    copyToClipboard(html);
  }

  if (loading && !greenSheet.length && !tourSheet.length) return <div className="p-4 text-center text-muted-foreground">Loading reports...</div>

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 0.25in; }
          body { background-color: white !important; color: black !important; }
          header, .no-print, .printable-section:not(.print-active) { display: none !important; }
          .printable-table th, .printable-table td { border: 1px solid #000; padding: 4px; font-size: 9pt; }
          .col-notes, .col-check, .col-actions { display: none !important; }
        }
      `}</style>
      
      <div id="tour-daily-table" className="mt-8 flex flex-col">
       <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 print-container">
        
        {/* TOP TOOLBAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold text-primary">Reports</h1>
            <p className="text-sm text-muted-foreground">Daily administrative summaries.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             <input type="text" placeholder="Search..." className="input-base w-full sm:w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             
             <button onClick={activeTab === 'green' ? handleCopyGreenSheet : handleCopyTourSheet} disabled={isCopied} className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${isCopied ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                {isCopied ? 'Copied!' : 'Copy Table'}
             </button>

             {canPost && <button onClick={handleEmailBlast} disabled={isSendingEmail} className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">{isSendingEmail ? '...' : 'Email'}</button>}
             <button onClick={() => window.print()} className="btn-primary py-2 px-4 font-bold">Print</button>
          </div>
        </div>

        {/* TABS */}
        <div id="daily-tabs" className="mt-6 border-b border-border no-print">
          <nav className="-mb-px flex space-x-6">
            <button onClick={() => setActiveTab('green')} className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'green' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Green Sheet</button>
            <button onClick={() => setActiveTab('tour')} className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'tour' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Tour Sheet</button>
          </nav>
        </div>

        <div id="daily-content-area">
            
            {/* --- GREEN SHEET --- */}
            <section className={`mt-6 bg-card p-4 rounded-lg shadow-sm border border-border printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`}>
             
             {/* DATE NAVIGATOR with CALENDAR */}
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 no-print bg-muted/20 p-2 rounded">
                
                {/* Center Control */}
                <div className="flex items-center gap-2">
                    <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-muted rounded text-muted-foreground" title="Previous Day">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    
                    <div className="flex flex-col items-center gap-1 min-w-[180px]">
                        {/* Native Date Picker */}
                        <div className="relative">
                            <input 
                                ref={dateInputRef} // <--- ATTACH REF
                                type="date" 
                                value={viewDate || ''}
                                onChange={(e) => setViewDate(e.target.value || null)}
                                className="bg-transparent text-foreground font-bold text-center border border-border rounded px-2 py-1 focus:ring-primary focus:border-primary text-sm"
                            />
                            {/* Overlay Label for "Pending" when null */}
                            {!viewDate && (
                                <button
                                    onClick={() => dateInputRef.current?.showPicker()} // <--- PROGRAMMATIC OPEN
                                    className="absolute inset-0 flex items-center justify-center bg-card rounded border border-dashed border-primary/50 text-primary font-bold text-sm cursor-pointer"
                                >
                                    Pending Queue
                                </button>
                            )}
                        </div>

                        {/* Toggle Link */}
                        {viewDate ? (
                            <button onClick={() => setViewDate(null)} className="text-xs text-primary hover:underline">
                                Return to Pending Queue
                            </button>
                        ) : (
                            <span className="text-xs text-muted-foreground">Select a date to view history</span>
                        )}
                    </div>

                    <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-muted rounded text-muted-foreground" title="Next Day">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Mark All Posted (Only in Pending Mode) */}
                {canPost && !viewDate && greenSheet.length > 0 && (
                    <button onClick={handlePublishAll} disabled={isPosting} className="py-2 px-3 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors">
                        Mark All Posted
                    </button>
                )}
             </div>

             <div className="mt-4 flow-root"><div className="-mx-2 -my-2 overflow-x-auto"><div className="inline-block min-w-full py-2"><table className="min-w-full printable-table border-collapse border border-border">
                    <thead className="bg-muted/50">
                        <tr>
                        <th onClick={() => handleSort('subject')} className="p-2 text-left text-sm font-semibold text-foreground cursor-pointer">Cadet <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('company')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-foreground cursor-pointer">CO <SortIcon column="company"/></th>
                        <th onClick={() => handleSort('offense')} className="p-2 text-left text-sm font-semibold text-foreground cursor-pointer">Offense <SortIcon column="offense"/></th>
                        <th onClick={() => handleSort('cat')} className="hidden lg:table-cell p-2 text-left text-sm font-semibold text-foreground cursor-pointer">Cat <SortIcon column="cat"/></th>
                        <th onClick={() => handleSort('demerits')} className="p-2 text-left text-sm font-semibold text-foreground cursor-pointer">Dem <SortIcon column="demerits"/></th>
                        <th onClick={() => handleSort('submitter')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-foreground cursor-pointer">By <SortIcon column="submitter"/></th>
                        <th className="hidden lg:table-cell p-2 text-left text-sm font-semibold text-foreground col-notes">Notes</th>
                        <th onClick={() => handleSort('date')} className="hidden sm:table-cell p-2 text-left text-sm font-semibold text-foreground cursor-pointer">Date <SortIcon column="date"/></th>
                        <th className="p-2 w-10 no-print col-actions"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-card">
                        {processedGreenSheet.length > 0 ? processedGreenSheet.map(r => (
                        <tr key={r.report_id} onClick={() => router.push(`/report/${r.report_id}`)} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <td className="p-2 text-sm font-medium text-foreground border border-border">{r.subject_name}</td>
                            <td className="hidden md:table-cell p-2 text-sm text-muted-foreground border border-border">{r.company_name || '-'}</td>
                            <td className="p-2 text-sm text-muted-foreground border border-border">{r.offense_name}</td>
                            <td className="hidden lg:table-cell p-2 text-sm text-muted-foreground border border-border">{r.policy_category}</td>
                            <td className="p-2 text-sm text-muted-foreground border border-border">{r.demerits}</td>
                            <td className="hidden md:table-cell p-2 text-sm text-muted-foreground border border-border">{r.submitter_name}</td>
                            <td className="hidden lg:table-cell p-2 text-sm text-muted-foreground border border-border truncate max-w-xs col-notes">{r.notes}</td>
                            <td className="hidden sm:table-cell p-2 text-sm text-muted-foreground border border-border">{formatDate(r.date_of_offense)}</td>
                            <td className="p-2 text-center no-print col-actions">
                                {canPost && (
                                    viewDate ? (
                                        <button onClick={(e) => handleUnpost(e, r.report_id)} className="text-yellow-600 hover:text-yellow-700 text-xs font-bold px-2 py-1 border border-yellow-200 rounded bg-yellow-50">Unpost</button>
                                    ) : (
                                        <button onClick={(e) => handleMarkSingle(e, r.report_id)} className="text-muted-foreground hover:text-foreground text-xs border border-border px-2 py-1 rounded" title="Hide">Hide</button>
                                    )
                                )}
                            </td>
                        </tr>
                        )) : <tr className="no-print"><td colSpan={9} className="p-4 text-center text-muted-foreground">{viewDate ? `No reports found for ${new Date(viewDate).toLocaleDateString()}.` : "No pending reports."}</td></tr>}
                    </tbody>
                    </table></div></div></div>
            </section>

            {/* --- TOUR SHEET --- */}
            <section className={`mt-6 bg-card p-4 rounded-lg shadow-sm border border-border printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center no-print mb-4 gap-4">
                <div><h2 className="text-2xl font-semibold text-foreground">Tour Sheet</h2><p className="text-sm text-muted-foreground">Active tour balances.</p></div>
                <div className="flex items-center gap-2">
                    <Link href="/tours" className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border text-sm font-bold rounded shadow-sm hover:bg-accent transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> View Full Ledger
                    </Link>
                    {canLog && selectedTourCadets.size > 0 && <button onClick={() => openTourModal()} className="btn-primary py-2 px-4 font-bold">Bulk Log ({selectedTourCadets.size})</button>}
                </div>
            </div>
            <div className="mt-4 flow-root"><div className="-mx-2 -my-2 overflow-x-auto"><div className="inline-block min-w-full py-2"><table className="min-w-full printable-table border-collapse border border-border">
                    <thead className="bg-muted/50">
                        <tr>
                        {canLog && <th className="p-2 w-10 col-check no-print"><input type="checkbox" className="rounded border-input text-primary focus:ring-primary" onChange={handleSelectAllTourRows} checked={processedTourSheet.length > 0 && selectedTourCadets.size === processedTourSheet.filter(c => !c.tours_logged_today).length}/></th>}
                        <th onClick={() => handleSort('subject')} className="p-2 text-left text-sm font-semibold text-foreground border border-border col-tour-cadet cursor-pointer">Cadet <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('company')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-foreground border border-border col-tour-co cursor-pointer">Company <SortIcon column="company"/></th>
                        <th onClick={() => handleSort('total_tours')} className="p-2 text-left text-sm font-semibold text-foreground border border-border col-tour-total cursor-pointer">Total <SortIcon column="total_tours"/></th>
                        <th className="p-2 no-print border border-border w-auto"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-card">
                        {processedTourSheet.length > 0 ? processedTourSheet.map(c => (
                        <tr key={c.cadet_id} className={c.tours_logged_today ? 'opacity-50 bg-muted' : 'hover:bg-muted/50 transition-colors'}>
                            {canLog && <td className="p-2 text-center border border-border col-check no-print"><input type="checkbox" className="rounded border-input text-primary focus:ring-primary" checked={selectedTourCadets.has(c.cadet_id)} onChange={() => handleSelectTourRow(c.cadet_id)} disabled={c.tours_logged_today}/></td>}
                            <td className="p-2 text-sm font-medium text-foreground border border-border">{c.last_name}, {c.first_name} {c.has_star_tours && <span className="text-destructive font-bold">*</span>}</td>
                            <td className="hidden md:table-cell p-2 text-sm text-muted-foreground border border-border">{c.company_name || '-'}</td>
                            <td className="p-2 text-sm font-bold text-destructive border border-border">{c.has_star_tours ? '*' : c.total_tours}</td>
                            <td className="p-2 text-right no-print border border-border">{canLog && <button onClick={() => openTourModal(c)} className="text-primary hover:underline">Log</button>}</td>
                        </tr>
                        )) : <tr className="no-print"><td colSpan={7} className="p-4 text-center text-muted-foreground">No cadets on ED.</td></tr>}
                    </tbody>
                    </table></div></div></div>
            </section>
        </div>
      </div>
      </div>
      
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-sm border border-border animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold mb-4 text-foreground">Log Tours</h3>
                <input type="number" value={toursToLog} onChange={e=>setToursToLog(Number(e.target.value))} className="input-base mb-4" />
                <input type="text" placeholder="Notes" value={logComment} onChange={e=>setLogComment(e.target.value)} className="input-base mb-4" />
                <div className="flex justify-end gap-2">
                    <button onClick={closeModal} className="px-4 py-2 border border-input rounded bg-background text-foreground hover:bg-accent transition-colors">Cancel</button>
                    <button onClick={handleLogTours} className="btn-primary px-4 py-2 font-medium">Confirm</button>
                </div>
            </div>
        </div>
      )}
    </>
  )
}