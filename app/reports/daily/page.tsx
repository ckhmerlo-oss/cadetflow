'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { triggerGreenSheetBlast } from '@/app/lib/server' 

// ... (Types remain the same)
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
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCadet, setSelectedCadet] = useState<TourSheetCadet | null>(null) 
  const [selectedTourCadets, setSelectedTourCadets] = useState<Set<string>>(new Set()) 
  const [toursToLog, setToursToLog] = useState(3)
  const [logComment, setLogComment] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' })
  
  const [isCopied, setIsCopied] = useState(false)

  // ... (Keep useEffects) ...
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
  
  useEffect(() => { setIsCopied(false); }, [activeTab]);

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

      if (greenRes.error) setError("You do not have permission to view these reports.")
      else setGreenSheet(greenRes.data || [])

      if (tourRes.error && !greenRes.error) setError(tourRes.error.message)
      else if (tourRes.data) setTourSheet(tourRes.data)

      setLoading(false)
    }
    getReports()
  }, [supabase])

  // ... (Keep Sort and Filter Logic) ...
  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }
  
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-muted-foreground/30 ml-1 print:hidden">⇅</span>
    return <span className="text-primary ml-1 print:hidden">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }
  
  const handleSelectTourRow = (id: string) => {
    const newSet = new Set(selectedTourCadets)
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedTourCadets(newSet)
  }

  const handleSelectAllTourRows = () => {
    const eligibleCadets = processedTourSheet.filter(c => !c.tours_logged_today).map(c => c.cadet_id);
    if (selectedTourCadets.size === eligibleCadets.length) setSelectedTourCadets(new Set())
    else setSelectedTourCadets(new Set(eligibleCadets))
  }

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

  // ... (Keep Handlers) ...
  async function handleMarkAsPosted() {
    if (greenSheet.length === 0 || !window.confirm("Mark all currently unposted reports as posted?")) return
    setIsPosting(true)
    const { error } = await supabase.rpc('mark_green_sheet_as_posted', { p_report_ids: greenSheet.map(r => r.report_id) })
    if (error) alert(error.message)
    else { setGreenSheet([]); alert("Posted successfully.") }
    setIsPosting(false)
  }

  async function handleEmailBlast() {
      if (!confirm("Are you sure you want to email the current Green Sheet to the distribution list?")) return;
      
      setIsSendingEmail(true);
      try {
          const result = await triggerGreenSheetBlast();
          if (result?.success) {
              alert("Email blast sent successfully!");
          } else {
              alert(`Failed to send: ${result?.error || 'Unknown error'}`);
          }
      } catch (e: any) {
          alert(`Error: ${e.message}`);
      }
      setIsSendingEmail(false);
  }

  async function handleLogTours() {
    if (toursToLog <= 0) return;
    if (selectedCadet && !selectedTourCadets.size) {
        if (toursToLog > selectedCadet.total_tours && !selectedCadet.has_star_tours) { alert(`Cannot log ${toursToLog} tours.`); return; }
    }
    setIsLoggingTours(true)
    let successCount = 0; let errorMsg = '';
    const targets = selectedCadet ? [selectedCadet.cadet_id] : Array.from(selectedTourCadets);
    const promises = targets.map(cadetId => supabase.rpc('log_served_tours', { p_cadet_id: cadetId, p_tours_served: toursToLog, p_comment: logComment }));
    const results = await Promise.all(promises);
    results.forEach(res => { if (res.error) errorMsg = res.error.message; else successCount++; });
    if (errorMsg && successCount === 0) alert(`Failed: ${errorMsg}`);
    else {
        const affectedIds = new Set(targets);
        setTourSheet(prev => prev.map(c => affectedIds.has(c.cadet_id) ? { ...c, total_tours: c.total_tours - toursToLog, tours_logged_today: true } : c).filter(c => c.total_tours > 0 || c.has_star_tours));
        closeModal(); setSelectedTourCadets(new Set());
    }
    setIsLoggingTours(false)
  }

  function openTourModal(cadet?: TourSheetCadet) { 
      if (cadet) { setSelectedCadet(cadet); } else { setSelectedCadet(null); }
      setToursToLog(3); setLogComment(''); setModalOpen(true); 
  }
  function closeModal() { setModalOpen(false); setSelectedCadet(null); }
  const formatDate = (d: string) => new Date(new Date(d).getTime() + new Date(d).getTimezoneOffset() * 60000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  const canPost = ['Commandant', 'Deputy Commandant', 'Admin', 'Administrative Assistant to the Commandant'].includes(userRole);
  const canLog = userRole.includes('TAC') || canPost;

  // ... (Keep Clipboard Logic) ...
  const copyToClipboard = async (html: string) => {
      try {
          const blob = new Blob([html], { type: 'text/html' });
          const data = [new ClipboardItem({ 'text/html': blob })];
          await navigator.clipboard.write(data);
          setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
      } catch (err) { console.error('Failed to copy:', err); alert('Failed to copy.'); }
  }
  const handleCopyGreenSheet = () => {
      if (processedGreenSheet.length === 0) { alert('No data.'); return; }
      const rows = processedGreenSheet.map(r => `<tr><td style="border:1px solid #ddd;padding:8px;">${r.subject_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.company_name||'-'}</td><td style="border:1px solid #ddd;padding:8px;">${r.offense_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.policy_category}</td><td style="border:1px solid #ddd;padding:8px;">${r.demerits}</td><td style="border:1px solid #ddd;padding:8px;">${r.submitter_name}</td><td style="border:1px solid #ddd;padding:8px;">${r.notes||''}</td><td style="border:1px solid #ddd;padding:8px;">${formatDate(r.date_of_offense)}</td></tr>`).join('');
      const html = `<h2>Green Sheet - ${new Date().toLocaleDateString()}</h2><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><thead><tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd;padding:8px;">Cadet</th><th style="border:1px solid #ddd;padding:8px;">Co</th><th style="border:1px solid #ddd;padding:8px;">Offense</th><th style="border:1px solid #ddd;padding:8px;">Cat</th><th style="border:1px solid #ddd;padding:8px;">Dem</th><th style="border:1px solid #ddd;padding:8px;">By</th><th style="border:1px solid #ddd;padding:8px;">Notes</th><th style="border:1px solid #ddd;padding:8px;">Date</th></tr></thead><tbody>${rows}</tbody></table>`;
      copyToClipboard(html);
  }
  const handleCopyTourSheet = () => {
    if (processedTourSheet.length === 0) { alert('No data.'); return; }
    const rows = processedTourSheet.map(c => `<tr><td style="border:1px solid #ddd;padding:8px;">${c.last_name}, ${c.first_name} ${c.has_star_tours?'(*)':''}</td><td style="border:1px solid #ddd;padding:8px;">${c.company_name||'-'}</td><td style="border:1px solid #ddd;padding:8px;text-align:center;font-weight:bold;">${c.has_star_tours?'*':c.total_tours}</td><td style="border:1px solid #ddd;padding:8px;"></td><td style="border:1px solid #ddd;padding:8px;"></td></tr>`).join('');
    const html = `<h2>Tour Sheet - ${new Date().toLocaleDateString()}</h2><table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><thead><tr style="background-color:#f2f2f2;"><th style="border:1px solid #ddd;padding:8px;">Cadet</th><th style="border:1px solid #ddd;padding:8px;">Co</th><th style="border:1px solid #ddd;padding:8px;">Total</th><th style="border:1px solid #ddd;padding:8px;width:100px;">Served</th><th style="border:1px solid #ddd;padding:8px;width:200px;">Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
    copyToClipboard(html);
  }

  if (loading) return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  if (error) return <div className="p-4 text-center text-destructive">{error}</div>

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 0.25in; }
          body { background-color: white !important; color: black !important; }
          header, .no-print, .printable-section:not(.print-active) { display: none !important; }
          main { padding: 0; margin: 0; }
          .print-container { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .flow-root, .overflow-x-auto, .inline-block { display: block !important; width: 100% !important; }
          .printable-table { width: 100%; border-collapse: collapse; }
          .printable-table th, .printable-table td { border: 1px solid #000; padding: 4px; font-size: 9pt; }
          .printable-table th, .printable-table td { display: table-cell !important; }
          .col-check { display: none; }
        }
      `}</style>
      
      <div id="tour-daily-table" className="mt-8 flex flex-col">
       <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 print-container">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold text-primary">Reports</h1>
            <p className="text-sm text-muted-foreground">Daily administrative summaries.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             <input 
                type="text" 
                placeholder="Search..." 
                className="input-base w-full sm:w-48" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
             />
             
             {/* COPY BUTTON */}
             <button 
                onClick={activeTab === 'green' ? handleCopyGreenSheet : handleCopyTourSheet} 
                disabled={isCopied} 
                className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${isCopied ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
             >
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
             </button>

             {/* EMAIL BUTTON (Authorized Only) */}
             {canPost && (
                 <button 
                    onClick={handleEmailBlast} 
                    disabled={isSendingEmail} 
                    className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex-shrink-0 transition-colors disabled:opacity-50"
                 >
                     {isSendingEmail ? 'Sending...' : 'Email Blast'}
                 </button>
             )}

             <button 
                onClick={() => window.print()} 
                className="btn-primary py-2 px-4 font-bold flex-shrink-0"
             >
                Print
             </button>
          </div>
        </div>

        <div id="daily-tabs" className="mt-6 border-b border-border no-print">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button 
                onClick={() => setActiveTab('green')} 
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'green' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
                Green Sheet
            </button>
            <button 
                onClick={() => setActiveTab('tour')} 
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'tour' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
                Tour Sheet
            </button>
          </nav>
        </div>

        <div id="daily-content-area">
            {/* GREEN SHEET TABLE */}
            <section id="green-sheet-container" className={`mt-6 bg-card p-4 rounded-lg shadow-sm border border-border printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`}>
             <div className="flex justify-between items-center no-print mb-4">
                <h2 className="text-2xl font-semibold text-foreground">Unposted Green Sheet</h2>
                {canPost && (
                    <button 
                        onClick={handleMarkAsPosted} 
                        disabled={isPosting} 
                        className="py-2 px-3 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        Mark All Posted
                    </button>
                )}
             </div>
             <div className="mt-4 flow-root"><div className="-mx-2 -my-2 overflow-x-auto"><div className="inline-block min-w-full py-2"><table className="min-w-full printable-table border-collapse border border-border">
                    <thead className="bg-muted/50">
                        <tr>
                        <th onClick={() => handleSort('subject')} className="p-2 text-left text-sm font-semibold text-foreground col-cadet cursor-pointer">Cadet <SortIcon column="subject"/></th>
                        <th onClick={() => handleSort('company')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-foreground col-co cursor-pointer">CO <SortIcon column="company"/></th>
                        <th onClick={() => handleSort('offense')} className="p-2 text-left text-sm font-semibold text-foreground col-offense cursor-pointer">Offense <SortIcon column="offense"/></th>
                        <th onClick={() => handleSort('cat')} className="hidden lg:table-cell p-2 text-left text-sm font-semibold text-foreground col-cat cursor-pointer">Cat <SortIcon column="cat"/></th>
                        <th onClick={() => handleSort('demerits')} className="p-2 text-left text-sm font-semibold text-foreground col-demerits cursor-pointer">Dem <SortIcon column="demerits"/></th>
                        <th onClick={() => handleSort('submitter')} className="hidden md:table-cell p-2 text-left text-sm font-semibold text-foreground col-submitter cursor-pointer">By <SortIcon column="submitter"/></th>
                        <th className="hidden lg:table-cell p-2 text-left text-sm font-semibold text-foreground col-notes">Notes</th>
                        <th onClick={() => handleSort('date')} className="hidden sm:table-cell p-2 text-left text-sm font-semibold text-foreground col-date cursor-pointer">Date <SortIcon column="date"/></th>
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
                            <td className="hidden lg:table-cell p-2 text-sm text-muted-foreground border border-border truncate max-w-xs">{r.notes}</td>
                            <td className="hidden sm:table-cell p-2 text-sm text-muted-foreground border border-border">{formatDate(r.date_of_offense)}</td>
                        </tr>
                        )) : <tr className="no-print"><td colSpan={8} className="p-4 text-center text-muted-foreground">No unposted demerits.</td></tr>}
                    </tbody>
                    </table></div></div></div>
            </section>

            {/* TOUR SHEET TABLE */}
            <section className={`mt-6 bg-card p-4 rounded-lg shadow-sm border border-border printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`}>
            {/* UPDATED HEADER with BUTTON */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center no-print mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Tour Sheet</h2>
                    <p className="text-sm text-muted-foreground">Active tour balances.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link 
                        href="/tours" 
                        className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border text-sm font-bold rounded shadow-sm hover:bg-accent transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        View Full Ledger
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
                <input 
                    type="number" 
                    value={toursToLog} 
                    onChange={e=>setToursToLog(Number(e.target.value))} 
                    className="input-base mb-4"
                />
                <input 
                    type="text" 
                    placeholder="Notes" 
                    value={logComment} 
                    onChange={e=>setLogComment(e.target.value)} 
                    className="input-base mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={closeModal} 
                        className="px-4 py-2 border border-input rounded bg-background text-foreground hover:bg-accent transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleLogTours} 
                        className="btn-primary px-4 py-2 font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  )
}