'use client'

import { useState, useEffect, useRef } from 'react'
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
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A7.501 7.501 0 014.501 20.118z" />
  </svg>
)

export default function HeaderMenu({ isLoggedIn, canManage, showDailyReports, isSiteAdmin, roleLevel }: HeaderMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/login';

  // Close menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  // Click outside handler for User Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Login Page View: Only Theme Toggle
  if (isLoginPage) {
      return (
        <div className="flex items-center justify-end space-x-3">
            <ThemeToggleButton />
        </div>
      )
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

        {/* Removed: Submit Report, Report History, Action Items (Available on Home) */}

        {showDailyReports && (
             <Link href="/reports/daily" id="nav-daily" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Green Sheet
            </Link>
        )}

        {/* NEW: Sports Button */}
        {isLoggedIn && (
             <Link href="/sports" id="nav-sports" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Sports
            </Link>
        )}

        {/* NEW: Incidents Button (Faculty & Staff) */}
        {roleLevel >= 50 && (
             <Link href="/incidents" id="nav-incidents" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Incidents
            </Link>
        )}

        {(canManage || roleLevel >= 50) && (
            <Link href="/manage" id="nav-roster" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Roster
            </Link>
        )}

        {isSiteAdmin && (
            <Link href="/admin" id="nav-admin" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 rounded-md text-sm font-bold transition-colors border border-red-100 dark:border-red-900">
                Admin
            </Link>
        )}

        {isLoggedIn ? (
          <div className="flex items-center gap-2 ml-3">
             <FeedbackButton variant="icon" />
             
             {/* USER MENU DROPDOWN */}
             <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <UserIcon />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 animate-in fade-in zoom-in duration-200">
                    <Link href="/preferences" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Preferences
                    </Link>
                    
                    <div className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="text-sm text-gray-700 dark:text-gray-200">Theme</span>
                      <ThemeToggleButton />
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    
                    <button 
                      onClick={handleSignOut} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
             </div>
          </div>
        ) : (
             <Link href="/login" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">Login</Link>
        )}
      </div>

      {/* --- MOBILE MENU --- */}
      <div className="-mr-2 flex md:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ml-2">
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {roleLevel >= 15 && ( <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Dashboard</Link> )}
            
            {showDailyReports && ( <Link href="/reports/daily" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Green Sheet</Link> )}
            
            {isLoggedIn && (
                <Link href="/sports" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Sports</Link>
            )}

            {/* NEW: Incidents Button (Mobile) */}
            {roleLevel >= 50 && ( 
                <Link href="/incidents" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Incidents
                </Link> 
            )}

            {(canManage || roleLevel >= 50) && (
                <Link href="/manage" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Roster</Link>
            )}

            {isSiteAdmin && ( <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Admin</Link> )}
          </div>

          {isLoggedIn ? (
            <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 space-y-1">
                <Link href="/preferences" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Preferences</Link>
                
                <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-200">Theme</span>
                    <ThemeToggleButton />
                </div>

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