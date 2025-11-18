'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import RosterClient from './RosterClient' 
import { RosterCadet } from './RosterClient' 
import { EDIT_AUTHORIZED_ROLES } from '@/app/profile/constants' 

// --- Simplified Types ---
type Company = { id: string; company_name: string }
type UnassignedUser = {
  user_id: string;
  first_name: string;
  last_name: string;
}

export default function ManagePage() {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'roster' | 'unassigned'>('roster')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [companies, setCompanies] = useState<Company[]>([])
  const [unassigned, setUnassigned] = useState<UnassignedUser[]>([]) 
  const [rosterData, setRosterData] = useState<RosterCadet[]>([])
  const [canEditProfiles, setCanEditProfiles] = useState(false)

  useEffect(() => {
    async function getInitialData() {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setError("You must be logged in.")
        return
      }

      // Check Permissions
      const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('role:role_id (role_name, default_role_level)')
        .eq('id', user.id)
        .single()
      
      const roleName = (viewerProfile?.role as any)?.role_name || ''
      const isAdmin = roleName === 'Admin'
      
      setCanEditProfiles(EDIT_AUTHORIZED_ROLES.includes(roleName) || roleName.includes('TAC') || isAdmin)

      // Fetch Data (Only Roster & Unassigned now)
      const [companiesRes, unassignedRes, fullRosterRes] = await Promise.all([
        supabase.from('companies').select('*').order('company_name'),
        supabase.rpc('get_unassigned_users'), 
        supabase.rpc('get_full_roster') 
      ])
      
      if (companiesRes.data) setCompanies(companiesRes.data)
      
      if (fullRosterRes.error) {
        console.error("Error fetching roster:", fullRosterRes.error.message)
        setError(fullRosterRes.error.message)
      } else {
        setRosterData(fullRosterRes.data as RosterCadet[])
      }

      if (unassignedRes.error) {
         console.error("Error fetching unassigned:", unassignedRes.error.message)
      } else {
        setUnassigned(unassignedRes.data as UnassignedUser[])
      }

      setLoading(false)
    }

    getInitialData()
  }, [supabase])


  const handlePrintRoster = () => {
    window.print()
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-gray-500">Loading roster data...</div>
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          header, .no-print, div[aria-label="Tabs"] { display: none !important; }
          #printable-roster { display: block !important; visibility: visible !important; }
          body > div, body > main { display: block !important; visibility: visible !important; }
        }
      `}</style>
    
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* --- HEADER & NAV --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roster Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Assign cadets to roles.</p>
          </div>

          {/* Navigation to the New Configuration Page */}
          <Link 
            href="/manage/roles"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Configure Chain of Command
          </Link>
        </div>
        
        {/* --- TABS --- */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('roster')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roster'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Cadet Roster
            </button>
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unassigned'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Unassigned Cadets 
              <span className="ml-1.5 inline-block py-0.5 px-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {unassigned.length}
              </span>
            </button>
          </nav>
        </div>
        
        {error && (
          <div className="mb-6 p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
            Error: {error}
          </div>
        )}

        {/* --- TAB 1: ROSTER --- */}
        <div id="printable-roster" className={activeTab === 'roster' ? '' : 'hidden'}>
          <div className="flex justify-end mb-4 no-print">
            <button onClick={handlePrintRoster} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
              Print Roster
            </button>
          </div>
          {/* RosterClient handles the table, searching, and assignment modal */}
          <RosterClient 
            initialData={rosterData} 
            canEditProfiles={canEditProfiles} 
            companies={companies}
          />
        </div>

        {/* --- TAB 2: UNASSIGNED --- */}
        <div className={`no-print ${activeTab === 'unassigned' ? '' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Unassigned Cadets</h2>
              <p className="text-sm text-gray-500 mt-1">These users have accounts but no role. Click to assign them.</p>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {unassigned.length > 0 ? unassigned.map(u => (
                <li key={u.user_id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">{u.last_name}, {u.first_name}</span>
                  <Link 
                    href={`/profile/${u.user_id}`} 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                  >
                    Assign Role &rarr;
                  </Link>
                </li>
              )) : (
                <li className="p-8 text-center text-gray-500 dark:text-gray-400 italic">No unassigned cadets found.</li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </>
  )
}