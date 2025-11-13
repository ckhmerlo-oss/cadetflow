// in app/components/HeaderMenu.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ThemeToggleButton from './ThemeToggleButton'

// --- Types ---
type HeaderMenuProps = {
  canManage: boolean
  showDailyReports: boolean
  isLoggedIn: boolean
  isSiteAdmin: boolean // <-- *** ADD NEW PROP ***
}

// --- Icons ---
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

// --- Main Component ---
export default function HeaderMenu({ canManage, showDailyReports, isLoggedIn, isSiteAdmin }: HeaderMenuProps) { // <-- *** ADD isSiteAdmin ***
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  // --- Feedback Modal State ---
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState('bug')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fbError, setFbError] = useState<string | null>(null)
  const [fbSuccess, setFbSuccess] = useState(false)

  // --- Close menu if clicking outside ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuRef])

  // --- Close menu on navigation ---
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // --- Sign Out Logic ---
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // --- Feedback Logic ---
  const handleOpenFeedback = () => {
    setFeedbackOpen(true)
    setFbError(null)
    setFbSuccess(false)
    setFeedbackContent('')
    setFeedbackType('bug')
    setIsOpen(false) // Close main menu
  }

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFbError(null)
    setFbSuccess(false)

    const { error } = await supabase.from('feedback').insert({
      feedback_type: feedbackType,
      page_url: pathname,
      content: feedbackContent,
    })

    setIsSubmitting(false)
    if (error) setFbError(error.message)
    else {
      setFbSuccess(true)
      setTimeout(() => setFeedbackOpen(false), 2000)
    }
  }

  // --- Render ---
  if (!isLoggedIn) {
    // Show only theme toggle if not logged in
    return <ThemeToggleButton />
  }

  return (
    <>
      {/* 1. The Hamburger Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Open menu"
        >
          {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        {/* 2. The Collapsible Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              

              {/* Main Links */}
              {showDailyReports && (
                <Link href="/reports/daily" className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                  Daily Reports
                </Link>
              )}
              {canManage && (
                <Link href="/manage" className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                  Manage Roster
                </Link>
              )}
              
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

              {/* Feedback Button */}
              <button onClick={handleOpenFeedback} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                Feedback
              </button>

              {/* Theme Toggle */}
              <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                <span>Theme</span>
                <ThemeToggleButton />
              </div>

            {/* *** NEW ADMIN LINK *** */}
            {isSiteAdmin && (
              <Link href="/admin" className="block w-full text-left px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                Site Settings
              </Link>
            )}
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

              {/* Sign Out Button */}
              <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. The Feedback Modal (lives here now) */}
      {feedbackOpen && (
         <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={() => setFeedbackOpen(false)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleFeedbackSubmit}>
                  {/* ... (Modal content) ... */}
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Submit Feedback</h3>
                    <div className="mt-4 space-y-4">
                      <fieldset>
                         <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</legend>
                         <div className="mt-2 flex gap-4">
                           <label className="flex items-center"><input type="radio" value="bug" checked={feedbackType === 'bug'} onChange={() => setFeedbackType('bug')} className="h-4 w-4" /> <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Bug</span></label>
                           <label className="flex items-center"><input type="radio" value="feature request" checked={feedbackType === 'feature request'} onChange={() => setFeedbackType('feature request')} className="h-4 w-4" /> <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Feature Request</span></label>
                           <label className="flex items-center"><input type="radio" value="comment/complaint" checked={feedbackType === 'comment/complaint'} onChange={() => setFeedbackType('comment/complaint')} className="h-4 w-4" /> <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Comment</span></label>
                         </div>
                      </fieldset>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                        <textarea value={feedbackContent} onChange={e => setFeedbackContent(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm" />
                      </div>
                    </div>
                  </div>
                  {fbSuccess && <p className="px-6 pb-2 text-sm text-green-600 dark:text-green-400">Feedback submitted. Thank you!</p>}
                  {fbError && <p className="px-6 pb-2 text-sm text-red-600 dark:text-red-400">Error: {fbError}</p>}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" disabled={isSubmitting || fbSuccess} className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">Submit</button>
                    <button type="button" onClick={() => setFeedbackOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm text-gray-700 dark:text-gray-300">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}