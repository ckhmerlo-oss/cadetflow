'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ThemeToggleButton from './ThemeToggleButton'
import FeedbackButton from './FeedbackButton'

type HeaderMenuProps = {
  canManage: boolean
  showDailyReports: boolean
  isLoggedIn: boolean
  isSiteAdmin: boolean
  roleLevel: number 
}

// Icons
const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
)
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function HeaderMenu({ isLoggedIn, canManage, showDailyReports, isSiteAdmin, roleLevel }: HeaderMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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

  return (
    <>
      {/* --- DESKTOP MENU --- */}
      <div className="hidden md:flex items-center justify-end space-x-3">
        {roleLevel >= 15 && (
            <Link href="/" id="nav-dashboard" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
            </Link>
        )}
        
        {isLoggedIn && roleLevel >= 15 && (
            <Link href="/submit" id="nav-submit" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Submit Report
            </Link>
        )}

        {isLoggedIn && roleLevel >= 50 && (
            <Link href="/reports/history" id="nav-reports" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Report History
            </Link>
        )}

        {showDailyReports && (
             <Link href="/reports/daily" id="nav-daily" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Green Sheet
            </Link>
        )}

        {canManage && (
            <>
             {/* UPDATED LINK */}
             <Link href="/action-items" id="nav-approval" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Action Items
            </Link>
            <Link href="/manage" id="nav-roster" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Roster
            </Link>
            </>
        )}

        {isSiteAdmin && (
            <Link href="/admin" id="nav-admin" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 rounded-md text-sm font-bold transition-colors border border-red-100 dark:border-red-900">
                Admin
            </Link>
        )}

        <ThemeToggleButton />

        {isLoggedIn ? (
          <div className="flex items-center gap-2 ml-3">
             <FeedbackButton variant="icon" />
             <button id="nav-signout" onClick={handleSignOut} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
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
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ml-2">
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {roleLevel >= 15 && ( <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Dashboard</Link> )}
            {isLoggedIn && roleLevel >= 15 && ( <Link href="/submit" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Submit Report</Link> )}
            {isLoggedIn && roleLevel >= 50 && ( <Link href="/reports/history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Report History</Link> )}
            {showDailyReports && ( <Link href="/reports/daily" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Green Sheet</Link> )}
            {canManage && (
                <>
                {/* UPDATED LINK */}
                <Link href="/action-items" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Action Items</Link>
                <Link href="/manage" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Roster</Link>
                </>
            )}
            {isSiteAdmin && ( <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Admin</Link> )}
          </div>

          {isLoggedIn ? (
            <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 space-y-1">
                <div className="px-3 py-2">
                    <FeedbackButton variant="text" />
                </div>
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
    </>
  )
}