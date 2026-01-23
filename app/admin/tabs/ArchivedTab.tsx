'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import SearchableSelect from '@/app/components/SearchableSelect'
import { toggleUserArchiveStatus } from '../actions'

// Simple Types for this view
type UserProfile = {
  id: string
  first_name: string
  last_name: string
  email: string
  company_name?: string
  role_name?: string
}

export default function ArchivedTab() {
  const supabase = createClient()
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([])
  const [archivedUsers, setArchivedUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search State
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    // 1. Fetch Active Users (for the dropdown)
    // We join companies/roles to show helpful info in the search
    const { data: active } = await supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, email,
        company:companies(company_name),
        role:roles(role_name)
      `)
      .eq('archived', false)
      .order('last_name')

    // 2. Fetch Archived Users (for the list)
    const { data: archived } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('archived', true)
      .order('last_name')

    if (active) {
      setActiveUsers(active.map((p: any) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        company_name: p.company?.company_name,
        role_name: p.role?.role_name
      })))
    }

    if (archived) {
      setArchivedUsers(archived as UserProfile[])
    }

    setLoading(false)
  }

  // Convert active users to SearchableSelect options
  const searchOptions = useMemo(() => {
    return activeUsers.map(u => ({
      id: u.id,
      label: `${u.last_name}, ${u.first_name} (${u.company_name || 'No Co.'})`
    }))
  }, [activeUsers])

  const handleArchive = async () => {
    if (!selectedUserId) return
    const user = activeUsers.find(u => u.id === selectedUserId)
    if (!user) return

    const confirmMsg = `ARCHIVE ${user.last_name}, ${user.first_name}?\n\n` +
      `• They will be hidden from all rosters.\n` +
      `• They will be UNASSIGNED from their Company and Role.\n` +
      `• Their historical reports remain intact.`

    if (!confirm(confirmMsg)) return

    setIsProcessing(true)
    const res = await toggleUserArchiveStatus(selectedUserId, true) // true = archive
    setIsProcessing(false)

    if (res.error) {
      alert(res.error)
    } else {
      setSelectedUserId('') // Clear selection
      fetchData() // Refresh lists
    }
  }

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`RESTORE ${name}?\n\nThey will be moved to the 'Unassigned' list.`)) return

    setIsProcessing(true)
    const res = await toggleUserArchiveStatus(id, false) // false = restore
    setIsProcessing(false)

    if (res.error) {
      alert(res.error)
    } else {
      fetchData()
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading users...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ARCHIVE TOOL */}
      <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Archive User</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <SearchableSelect 
              label="Select Active User"
              options={searchOptions}
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Search by name..."
            />
          </div>
          <button 
            onClick={handleArchive}
            disabled={isProcessing || !selectedUserId}
            className="w-full md:w-auto px-6 py-2 bg-destructive text-destructive-foreground font-medium rounded-md hover:bg-destructive/90 disabled:opacity-50 h-[42px] mb-[1px]"
          >
            {isProcessing ? 'Processing...' : 'Archive User'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Archiving removes the user from active duty (rosters, dropdowns) but preserves their data history.
        </p>
      </section>

      {/* 2. ARCHIVED LIST */}
      <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold text-foreground">Archived Personnel ({archivedUsers.length})</h2>
        </div>
        
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Email</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {archivedUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground italic">
                  No archived users found.
                </td>
              </tr>
            ) : (
              archivedUsers.map(u => (
                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {u.last_name}, {u.first_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleRestore(u.id, `${u.last_name}, ${u.first_name}`)}
                      className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

    </div>
  )
}