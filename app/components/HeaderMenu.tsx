'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ThemeToggleButton from './ThemeToggleButton'

type HeaderMenuProps = {
  canManage: boolean
  showDailyReports: boolean
  isLoggedIn: boolean
  isSiteAdmin: boolean
  roleLevel: number // Added
}

// Icons
const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
)
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function HeaderMenu({ isLoggedIn, canManage, showDailyReports, isSiteAdmin, roleLevel }: HeaderMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fbSuccess, setFbSuccess] = useState(false)
  const [fbError, setFbError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFbError(null)
    
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) {
        setFbError('You must be logged in.')
        setIsSubmitting(false)
        return
    }

    const { error } = await supabase.functions.invoke('send-feedback', {
        body: { content: feedbackContent, user_id: user.id }
    })

    if (error) {
        setFbError(error.message)
    } else {
        setFbSuccess(true)
        setTimeout(() => {
            setFeedbackOpen(false)
            setFeedbackContent('')
            setFbSuccess(false)
        }, 2000)
    }
    setIsSubmitting(false)
  }

  return (
    <>
      {/* --- DESKTOP MENU --- */}
      <div className="hidden md:flex items-center space-x-4">
        
        {/* Only show Dashboard if Level 15+ (Cadet Leaders and up) */}
        {roleLevel >= 15 && (
            <Link 
                href="/" 
                id="nav-dashboard" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Dashboard
            </Link>
        )}
        
        {isLoggedIn && roleLevel >= 15 && (
            <Link 
                href="/submit" 
                id="nav-submit" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Submit Report
            </Link>
        )}

        {/* Only show Report History (Archive) to Faculty (50+) */}
        {isLoggedIn && roleLevel >= 50 && (
            <Link 
                href="/reports/history" 
                id="nav-reports" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Report History
            </Link>
        )}

        {showDailyReports && (
             <Link 
                href="/reports/daily" 
                id="nav-daily" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Green Sheet
            </Link>
        )}

        {canManage && (
            <>
             <Link 
                href="/reports/pending" 
                id="nav-approval" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Action Items
            </Link>
            <Link 
                href="/manage" 
                id="nav-roster" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Roster
            </Link>
            </>
        )}

        {isSiteAdmin && (
            <Link 
                href="/admin" 
                id="nav-admin" 
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 rounded-md text-sm font-bold transition-colors border border-red-100 dark:border-red-900"
            >
                Admin
            </Link>
        )}

        <ThemeToggleButton />

        {/* DIRECT ACTIONS */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 ml-3">
             <button 
               onClick={() => setFeedbackOpen(true)} 
               className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white p-2 rounded-full transition-colors"
               title="Send Feedback"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
             </button>

             <button
                id="nav-signout"
                onClick={handleSignOut}
                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
             >
                Sign Out
             </button>
          </div>
        ) : (
             <Link href="/login" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">Login</Link>
        )}
      </div>

      {/* --- MOBILE MENU --- */}
      <div className="-mr-2 flex md:hidden">
         <ThemeToggleButton />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          className="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ml-2"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {roleLevel >= 15 && (
                <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Dashboard</Link>
            )}
            {isLoggedIn && roleLevel >= 15 && (
                <Link href="/submit" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Submit Report</Link>
            )}
            {isLoggedIn && roleLevel >= 50 && (
                <Link href="/reports/history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Report History</Link>
            )}
            {showDailyReports && (
                 <Link href="/reports/daily" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Green Sheet</Link>
            )}
            {canManage && (
                <>
                <Link href="/reports/pending" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Action Items</Link>
                <Link href="/manage" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Roster</Link>
                </>
            )}
            {isSiteAdmin && (
                <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Admin</Link>
            )}
          </div>

          {isLoggedIn ? (
            <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 space-y-1">
                <button onClick={() => setFeedbackOpen(true)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Feedback</button>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700">Sign out</button>
              </div>
            </div>
          ) : (
             <div className="px-5 pb-4">
                 <Link href="/login" className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">Login</Link>
             </div>
          )}
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setFeedbackOpen(false)}></div>
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Submit Feedback</h3>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                        <textarea value={feedbackContent} onChange={e => setFeedbackContent(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-2" />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="button" onClick={handleFeedbackSubmit} disabled={isSubmitting || fbSuccess} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{isSubmitting ? 'Sending...' : 'Submit'}</button>
                    <button type="button" onClick={() => setFeedbackOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Close</button>
                  </div>
                </div>
            </div>
        </div>
      )}
    </>
  )
}