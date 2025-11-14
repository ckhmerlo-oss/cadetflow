// in app/reports/daily/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

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
}

export default function DailyReportsPage() {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'green' | 'tour'>('green')
  const [greenSheet, setGreenSheet] = useState<GreenSheetReport[]>([])
  const [tourSheet, setTourSheet] = useState<TourSheetCadet[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Permissions State
  const [userRole, setUserRole] = useState<string>('')
  const [userLevel, setUserLevel] = useState<number>(0)
  
  const [isPosting, setIsPosting] = useState(false)
  const [isLoggingTours, setIsLoggingTours] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCadet, setSelectedCadet] = useState<TourSheetCadet | null>(null)
  const [toursToLog, setToursToLog] = useState(3)
  const [logComment, setLogComment] = useState('')
// --- Set Document Title for Printing ---
  useEffect(() => {
    const date = new Date();
    // Formats date to MM/DD/YY
    const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' });
    
    if (activeTab === 'green') {
      document.title = `Green Sheet ${formattedDate}`;
    } else {
      document.title = `Tour Sheet ${formattedDate}`;
    }
    
    // Cleanup: Revert title when leaving the page
    return () => {
      document.title = 'CadetFlow'; // Your default title
    };
  }, [activeTab]); // This will re-run whenever the tab changes
  
  useEffect(() => {
    async function getReports() {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('roles:role_id ( role_name, default_role_level )')
          .eq('id', user.id)
          .single()
        
        if (profile && profile.roles) {
           setUserRole((profile.roles as any).role_name || '');
           setUserLevel((profile.roles as any).default_role_level || 0);
        }
      }

      const [greenRes, tourRes] = await Promise.all([
        supabase.rpc('get_unposted_green_sheet'),
        supabase.rpc('get_tour_sheet')
      ])

      if (greenRes.error) {
        // If RLS fails (e.g. user is level < 50), we'll catch it here
        setError("You do not have permission to view these reports.")
      } else {
        setGreenSheet(greenRes.data)
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

  // --- Action Handlers ---
  async function handleMarkAsPosted() {
    if (greenSheet.length === 0 || !window.confirm("Mark all as posted?")) return
    setIsPosting(true)
    const { error } = await supabase.rpc('mark_green_sheet_as_posted', { p_report_ids: greenSheet.map(r => r.report_id) })
    if (error) alert(error.message)
    else { setGreenSheet([]); alert("Posted successfully.") }
    setIsPosting(false)
  }

  async function handleLogTours() {
    if (!selectedCadet || toursToLog <= 0) return
    if (toursToLog > selectedCadet.total_tours) {
      alert(`Cannot log ${toursToLog} tours. Only ${selectedCadet.total_tours} remaining.`); return;
    }
    setIsLoggingTours(true)
    const { error } = await supabase.rpc('log_served_tours', { p_cadet_id: selectedCadet.cadet_id, p_tours_served: toursToLog, p_comment: logComment })
    if (error) alert(error.message)
    else {
      setTourSheet(tourSheet.map(c => c.cadet_id === selectedCadet.cadet_id ? { ...c, total_tours: c.total_tours - toursToLog } : c).filter(c => c.total_tours > 0))
      closeModal()
    }
    setIsLoggingTours(false)
  }

  function openTourModal(cadet: TourSheetCadet) { setSelectedCadet(cadet); setToursToLog(3); setLogComment(''); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setSelectedCadet(null); }
  
  const formatDate = (d: string) => new Date(new Date(d).getTime() + new Date(d).getTimezoneOffset() * 60000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

  // --- PERMISSIONS LOGIC ---
  // 1. Can VIEW page: Level >= 50 (Handled by SQL RLS, checked in useEffect)
  // 2. Can POST Green Sheet: ONLY Commandant Staff
  const canPost = ['Commandant', 'Deputy Commandant', 'Admin'].includes(userRole);
  // 3. Can LOG Tours: TAC Officers OR Commandant Staff
  const canLog = userRole.includes('TAC') || canPost;

  if (loading) return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading daily reports...</div>
  if (error) return <div className="p-4 text-center text-red-600 dark:text-red-400">{error}</div>

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.25in;
          }
          body { background-color: white !important; color: black !important; }
          header, .no-print, .printable-section:not(.print-active) { display: none !important; }
          main { padding: 0; margin: 0; }
          
          .printable-section {
            padding: 0;
            box-shadow: none;
            border: none;
            margin: 0;
            width: 100%;
          }
          .printable-section h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 0.5rem;
          }

          /* --- START: NEW FIX --- */
          /* These rules "flatten" the container divs, allowing the table
             to be the element that breaks across pages. */
          .flow-root,
          .overflow-x-auto,
          .inline-block {
            display: block !important;
            width: 100% !important;
            min-width: 100% !important;
            overflow: visible !important;
          }
          /* --- END: NEW FIX --- */
          
          .printable-table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto; /* Allow table to break */
          }
          
          .printable-table thead {
            display: table-header-group; /* Repeat header */
          }
          
          .printable-table tbody tr {
            page-break-inside: avoid; /* Keep rows together */
          }

          .printable-table th, .printable-table td {
            border: 1px solid #000;
            padding: 0.2rem 0.25rem;
            font-size: 8pt;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          .printable-table th { background-color: #eee; }
          
          .col-cadet { width: 18%; } .col-co { width: 5%; } .col-offense { width: 25%; } .col-cat { width: 4%; } .col-demerits { width: 6%; } .col-submitter { width: 15%; } .col-notes { width: 22%; } .col-date { width: 5%; }
          .col-tour-cadet { width: 30%; } .col-tour-co { width: 15%; } .col-tour-total { width: 10%; } .col-tour-served { width: 15%; } .col-tour-notes { width: 30%; }
          .fill-in-box { height: 2.5em; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
        <div className="flex justify-between items-center no-print">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <button onClick={() => window.print()} className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Print {activeTab === 'green' ? 'Green Sheet' : 'Tour Sheet'}</button>
        </div>

        <div className="mt-4 border-b border-gray-200 dark:border-gray-700 no-print">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('green')} className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'green' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Green Sheet</button>
            <button onClick={() => setActiveTab('tour')} className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === 'tour' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Tour Sheet</button>
          </nav>
        </div>

        {/* --- Green Sheet Section --- */}
        <section className={`mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`}>
          <div className="flex justify-between items-center no-print">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Unposted Green Sheet ({greenSheet.length})</h2>
            {/* *** CONDITIONAL POST BUTTON *** */}
            {canPost && (
              <button onClick={handleMarkAsPosted} disabled={isPosting || greenSheet.length === 0} className="py-2 px-3 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                {isPosting ? 'Posting...' : 'Mark All as Posted'}
              </button>
            )}
          </div>
          <h2 className="hidden print:block">Green Sheet - {new Date().toLocaleDateString()}</h2>
          <div className="mt-4 flow-root">
            <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6"><div className="inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6">
                <table className="min-w-full printable-table border-collapse border border-gray-300 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cadet">Cadet</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-co">CO</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-offense">Offense</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-cat">Cat</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-demerits">Dem</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-submitter">By</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-notes">Notes</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-date">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {greenSheet.length > 0 ? greenSheet.map(r => (
                      <tr key={r.report_id}>
                        <td className="p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{r.subject_name}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.company_name || '-'}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.offense_name}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.policy_category}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.demerits}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.submitter_name}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{r.notes}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{formatDate(r.date_of_offense)}</td>
                      </tr>
                    )) : <tr className="no-print"><td colSpan={8} className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">No unposted demerits.</td></tr>}
                  </tbody>
                </table>
            </div></div>
          </div>
        </section>

        {/* --- Tour Sheet Section --- */}
        <section className={`mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`}>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white no-print">Tour Sheet ({tourSheet.length})</h2>
          <h2 className="hidden print:block">Tour Sheet - {new Date().toLocaleDateString()}</h2>
          <div className="mt-4 flow-root">
            <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6"><div className="inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6">
                <table className="min-w-full printable-table border-collapse border border-gray-300 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-cadet">Cadet</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-co">Company</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 col-tour-total">Total</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-served">Served</th>
                      <th className="p-2 text-left text-sm font-semibold text-gray-900 dark:text-white print:table-cell hidden border border-gray-300 dark:border-gray-600 col-tour-notes">Notes</th>
                      <th className="relative p-2 no-print border-l border-gray-300 dark:border-gray-600"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {tourSheet.length > 0 ? tourSheet.map(c => (
                      <tr key={c.cadet_id}>
                        <td className="p-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{c.last_name}, {c.first_name}</td>
                        <td className="p-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">{c.company_name || '-'}</td>
                        <td className="p-2 text-sm font-bold text-red-600 dark:text-red-400 border border-gray-300 dark:border-gray-600">{c.total_tours}</td>
                        <td className="p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"></td>
                        <td className="p-2 print:table-cell hidden fill-in-box border border-gray-300 dark:border-gray-600"></td>
                        <td className="relative p-2 text-right text-sm font-medium no-print border border-gray-300 dark:border-gray-600">
                          {/* *** CONDITIONAL LOG BUTTON *** */}
                          {canLog && (
                            <button onClick={() => openTourModal(c)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">Log</button>
                          )}
                        </td>
                      </tr>
                    )) : <tr className="no-print"><td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">No cadets on ED.</td></tr>}
                  </tbody>
                </table>
            </div></div>
          </div>
        </section>
      </div>

      {/* --- Log Tours Modal --- */}
      {modalOpen && selectedCadet && (
        <div className="relative z-10 no-print" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900/75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">Log Served Tours: {selectedCadet.last_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance: {selectedCadet.total_tours} tours</p>
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
                  <button type="button" disabled={isLoggingTours} onClick={handleLogTours} className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">{isLoggingTours ? 'Logging...' : 'Log Tours'}</button>
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