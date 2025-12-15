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

  // Helper class for consistent nav links
  const navLinkClass = "text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
  
  return (
    <>
      {/* --- DESKTOP MENU --- */}
      <div className="hidden md:flex items-center justify-end space-x-3">
        {roleLevel >= 15 && (
            <Link href="/" id="nav-dashboard" className={navLinkClass}>
                Dashboard
            </Link>
        )}

        {showDailyReports && (
             <Link href="/reports/daily" id="nav-daily" className={navLinkClass}>
                Green Sheet
            </Link>
        )}

        {isLoggedIn && (
             <Link href="/sports" id="nav-sports" className={navLinkClass}>
                Sports
            </Link>
        )}

        {roleLevel >= 50 && (
             <Link href="/incidents" id="nav-incidents" className={navLinkClass}>
                Incidents
            </Link>
        )}

        {(canManage || roleLevel >= 50) && (
            <Link href="/manage" id="nav-roster" className={navLinkClass}>
                Roster
            </Link>
        )}

        {isSiteAdmin && (
            <Link href="/admin" id="nav-admin" className="text-destructive hover:text-destructive/80 px-3 py-2 rounded-md text-sm font-bold transition-colors border border-destructive/20 hover:border-destructive/40">
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
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <UserIcon />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
                    <Link href="/preferences" className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50">
                      Preferences
                    </Link>
                    
                    <div className="px-4 py-2 flex items-center justify-between hover:bg-muted/50">
                      <span className="text-sm text-foreground">Theme</span>
                      <ThemeToggleButton />
                    </div>
                    
                    <div className="border-t border-border my-1"></div>
                    
                    <button 
                      onClick={handleSignOut} 
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
             </div>
          </div>
        ) : (
             <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Login</Link>
        )}
      </div>

      {/* --- MOBILE MENU --- */}
      <div className="-mr-2 flex md:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-background inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 focus:outline-none ml-2">
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-popover border-b border-border shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {roleLevel >= 15 && ( <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted/50 hover:text-primary">Dashboard</Link> )}
            
            {showDailyReports && ( <Link href="/reports/daily" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted/50 hover:text-primary">Green Sheet</Link> )}
            
            {isLoggedIn && (
                <Link href="/sports" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted/50 hover:text-primary">Sports</Link>
            )}

            {roleLevel >= 50 && ( 
                <Link href="/incidents" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted/50 hover:text-primary">
                    Incidents
                </Link> 
            )}

            {(canManage || roleLevel >= 50) && (
                <Link href="/manage" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted/50 hover:text-primary">Roster</Link>
            )}

            {isSiteAdmin && ( <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10">Admin</Link> )}
          </div>

          {isLoggedIn ? (
            <div className="pt-4 pb-4 border-t border-border">
              <div className="px-2 space-y-1">
                <Link href="/preferences" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted/50">Preferences</Link>
                
                <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50">
                    <span className="text-base font-medium text-foreground">Theme</span>
                    <ThemeToggleButton />
                </div>

                <div className="px-3 py-2">
                    <FeedbackButton variant="text" />
                </div>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-muted/50">Sign out</button>
              </div>
            </div>
          ) : (
             <div className="px-5 pb-4">
                 <Link href="/login" className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90">Login</Link>
             </div>
          )}
        </div>
      )}
    </>
  )
}