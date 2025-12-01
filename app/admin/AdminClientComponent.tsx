'use client'

import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import React, { useState } from 'react'
import GeneralSettingsTab from './tabs/GeneralSettingsTab'
import InfractionsTab from './tabs/InfractionsTab'
import RolesTab from './tabs/RolesTab'
import CompaniesTab from './tabs/CompaniesTab' // <--- IMPORTED

// Lock Icon Helper
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>)

export function AdminSettingsClient({ user }: { user: User }) {
  const supabase = createClient()
  const [isVerified, setIsVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // UPDATED Tab State
  const [activeTab, setActiveTab] = useState<'general' | 'infractions' | 'roles' | 'companies'>('general')

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: user.email!, password })
    if (error) setAuthError('Incorrect password.')
    else setIsVerified(true)
    setIsLoading(false)
  }

  if (!isVerified) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <div className="flex flex-col items-center">
            <LockIcon />
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Verify password to continue.</p>
          </div>
          <form className="space-y-6" onSubmit={handleVerifyPassword}>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white shadow-sm" /></div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">{isLoading ? 'Verifying...' : 'Unlock'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 md:min-h-screen flex-shrink-0">
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          <p className="text-xs text-gray-500 mt-1">System Configuration</p>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('infractions')}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'infractions' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Infractions & Demerits
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'roles' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Roles & Hierarchy
          </button>
          {/* NEW TAB BUTTON */}
          <button 
            onClick={() => setActiveTab('companies')}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'companies' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Companies & Units
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'general' && <GeneralSettingsTab />}
          {activeTab === 'infractions' && <InfractionsTab />}
          {activeTab === 'roles' && <RolesTab />}
          {activeTab === 'companies' && <CompaniesTab />} 
        </div>
      </main>

    </div>
  )
}