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

  // --- State ---
  const [activeTab, setActiveTab] = useState<'green' | 'tour'>('green')
  const [greenSheet, setGreenSheet] = useState<GreenSheetReport[]>([])
  const [tourSheet, setTourSheet] = useState<TourSheetCadet[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Action State
  const [isPosting, setIsPosting] = useState(false)
  const [isLoggingTours, setIsLoggingTours] = useState(false)
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCadet, setSelectedCadet] = useState<TourSheetCadet | null>(null)
  const [toursToLog, setToursToLog] = useState(3)
  const [logComment, setLogComment] = useState('')

  // --- Data Fetching ---
  useEffect(() => {
    async function getReports() {
      setLoading(true)
      setError(null)
      
      const [greenRes, tourRes] = await Promise.all([
        supabase.rpc('get_unposted_green_sheet'),
        supabase.rpc('get_tour_sheet')
      ])

      if (greenRes.error) {
        setError(greenRes.error.message)
      } else {
        setGreenSheet(greenRes.data)
      }

      if (tourRes.error) {
        setError(tourRes.error.message)
      } else {
        setTourSheet(tourRes.data)
      }
      
      setLoading(false)
    }
    getReports()
  }, [supabase])

  // --- Action Handlers (No Changes) ---

  async function handleMarkAsPosted() {
    if (greenSheet.length === 0) return
    if (!window.confirm("Are you sure you want to post all unposted demerits? This cannot be undone.")) return

    setIsPosting(true)
    
    const reportIds = greenSheet.map(r => r.report_id)
    const { error } = await supabase.rpc('mark_green_sheet_as_posted', {
      p_report_ids: reportIds
    })

    if (error) {
      alert("Error posting reports: " + error.message)
    } else {
      setGreenSheet([])
      alert("Green Sheet successfully posted.")
    }
    setIsPosting(false)
  }

  function openTourModal(cadet: TourSheetCadet) {
    setSelectedCadet(cadet)
    setToursToLog(3)
    setLogComment('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedCadet(null)
    setIsLoggingTours(false)
  }

  async function handleLogTours() {
    if (!selectedCadet || toursToLog <= 0) return
    setIsLoggingTours(true)
    
    const { error } = await supabase.rpc('log_served_tours', {
      p_cadet_id: selectedCadet.cadet_id,
      p_tours_served: toursToLog,
      p_comment: logComment
    })

    if (error) {
      alert("Error logging tours: " + error.message)
      setIsLoggingTours(false)
    } else {
      setTourSheet(
        tourSheet.map(c => 
          c.cadet_id === selectedCadet.cadet_id
            ? { ...c, total_tours: c.total_tours - toursToLog }
            : c
        ).filter(c => c.total_tours > 0)
      )
      closeModal()
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userOffset);
    return localDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  }

  // --- Render ---

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading daily reports...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>
  }

  return (
    <>
      {/* Print-friendly styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.25in;
          }
          body { background-color: white; }
          header, .no-print, .printable-section:not(.print-active) {
            display: none !important;
          }
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
          .printable-table {
            width: 100%;
            border-collapse: collapse; /* This ensures borders are clean */
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
          
          .col-cadet { width: 18%; }
          .col-co { width: 5%; }
          .col-offense { width: 25%; }
          .col-cat { width: 4%; }
          .col-demerits { width: 6%; }
          .col-submitter { width: 15%; }
          .col-notes { width: 22%; }
          .col-date { width: 5%; }
          
          .col-tour-cadet { width: 30%; }
          .col-tour-co { width: 15%; }
          .col-tour-total { width: 10%; }
          .col-tour-served { width: 15%; }
          .col-tour-notes { width: 30%; }
          
          .fill-in-box { height: 2.5em; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
        <div className="flex justify-between items-center no-print">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1> {/* <-- RENAMED */}
          <button
            onClick={() => window.print()}
            className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Print {activeTab === 'green' ? 'Green Sheet' : 'Tour Sheet'}
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="mt-4 border-b border-gray-200 no-print">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('green')}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === 'green'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Green Sheet
            </button>
            <button
              onClick={() => setActiveTab('tour')}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === 'tour'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Tour Sheet
            </button>
          </nav>
        </div>

        {/* --- Green Sheet Section --- */}
        <section 
          className={`mt-6 bg-white p-4 rounded-lg shadow printable-section ${activeTab === 'green' ? 'print-active' : 'hidden no-print'}`}
        >
          <div className="flex justify-between items-center no-print">
            <h2 className="text-2xl font-semibold text-gray-800">
              Unposted Green Sheet ({greenSheet.length} reports)
            </h2>
            <button
              onClick={handleMarkAsPosted}
              disabled={isPosting || greenSheet.length === 0}
              className="py-2 px-3 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {isPosting ? 'Posting...' : 'Mark All as Posted'}
            </button>
          </div>
          <h2 className="hidden print:block">
            Green Sheet - {new Date().toLocaleDateString()}
          </h2>

          <div className="mt-4 flow-root">
            <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6">
              <div className="inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6">
                {/* *** UPDATED: Removed divide-y, added border-collapse *** */}
                <table className="min-w-full printable-table border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* *** UPDATED: Added border class to all th *** */}
                      <th className="py-2 pl-2 pr-2 text-left text-sm font-semibold text-gray-900 col-cadet border border-gray-300">Cadet</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-co border border-gray-300">CO</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-offense border border-gray-300">Offense</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-cat border border-gray-300">Cat</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-demerits border border-gray-300">Demerits</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-submitter border border-gray-300">Submitted By</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-notes border border-gray-300">Notes</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-date border border-gray-300">Date</th>
                    </tr>
                  </thead>
                  {/* *** UPDATED: Removed divide-y *** */}
                  <tbody className="bg-white">
                    {greenSheet.length > 0 ? (
                      greenSheet.map((r) => (
                        <tr key={r.report_id}>
                          {/* *** UPDATED: Added border class to all td, removed whitespace-pre-wrap *** */}
                          <td className="py-2 pl-2 pr-2 text-sm font-medium text-gray-900 border border-gray-300">{r.subject_name}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{r.company_name || 'N/A'}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{r.offense_name}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{r.policy_category}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{r.demerits}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{r.submitter_name}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{r.notes}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{formatDate(r.date_of_offense)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-print"><td colSpan={8} className="p-4 text-center text-gray-500 border border-gray-300">No unposted demerits.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* --- Tour Sheet Section --- */}
        <section 
          className={`mt-6 bg-white p-4 rounded-lg shadow printable-section ${activeTab === 'tour' ? 'print-active' : 'hidden no-print'}`}
        >
          <h2 className="text-2xl font-semibold text-gray-800 no-print">
            Tour Sheet ({tourSheet.length} cadets)
          </h2>
          <h2 className="hidden print:block">
            Tour Sheet - {new Date().toLocaleDateString()}
          </h2>
          <div className="mt-4 flow-root">
            <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-4 lg:-mx-6">
              <div className="inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6">
                {/* *** UPDATED: Removed divide-y, added border-collapse *** */}
                <table className="min-w-full printable-table border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* *** UPDATED: Added border class to all th *** */}
                      <th className="py-2 pl-2 pr-2 text-left text-sm font-semibold text-gray-900 col-tour-cadet border border-gray-300">Cadet</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-tour-co border border-gray-300">Company</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 col-tour-total border border-gray-300">Total Tours</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 print:table-cell hidden col-tour-served border border-gray-300">Tours Served</th>
                      <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 print:table-cell hidden col-tour-notes border border-gray-300">Notes</th>
                      <th className="relative py-2 pl-2 pr-2 no-print border-l border-gray-300"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  {/* *** UPDATED: Removed divide-y *** */}
                  <tbody className="bg-white">
                    {tourSheet.length > 0 ? (
                      tourSheet.map((c) => (
                        <tr key={c.cadet_id}>
                          {/* *** UPDATED: Added border class to all visible td *** */}
                          <td className="py-2 pl-2 pr-2 text-sm font-medium text-gray-900 border border-gray-300">{c.last_name}, {c.first_name}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300">{c.company_name || 'N/A'}</td>
                          <td className="px-2 py-2 text-sm font-medium text-red-600 border border-gray-300">{c.total_tours}</td>
                          <td className="px-2 py-2 text-sm text-gray-500 print:table-cell hidden fill-in-box"></td>
                          <td className="px-2 py-2 text-sm text-gray-500 print:table-cell hidden fill-in-box"></td>
                          <td className="relative py-2 pl-2 pr-2 text-right text-sm font-medium no-print border border-gray-300">
                            <button
                              onClick={() => openTourModal(c)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Log Tours
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-print"><td colSpan={6} className="p-4 text-center text-gray-500 border border-gray-300">No cadets currently on tour.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- Log Tours Modal (No Changes) --- */}
      {modalOpen && selectedCadet && (
        <div className="relative z-10 no-print" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                    Log Served Tours for: {selectedCadet.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">Current Balance: {selectedCadet.total_tours} tours</p>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="tours" className="block text-sm font-medium text-gray-700">Tours Served</label>
                      <input
                        id="tours"
                        type="number"
                        value={toursToLog}
                        onChange={e => setToursToLog(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                      <input
                        id="comment"
                        type="text"
                        placeholder="e.g., 'Good behavior'"
                        value={logComment}
                        onChange={e => setLogComment(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" disabled={isLoggingTours} onClick={handleLogTours}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">
                    {isLoggingTours ? 'Logging...' : 'Log Tours'}
                  </button>
                  <button type="button" onClick={closeModal}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}