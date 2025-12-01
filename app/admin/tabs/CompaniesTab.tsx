'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { createCompanyAction, deleteCompanyAction } from '../actions'

type Company = {
  id: string;
  company_name: string;
}

// Icons
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.548 0A48.108 48.108 0 0 1 6.75 5.397m10.5-2.572V3.375c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v2.25" /></svg>)

export default function CompaniesTab() {
  const supabase = createClient()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    setLoading(true)
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('company_name', { ascending: true })
    
    if (!error && data) setCompanies(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', newName)
    
    const result = await createCompanyAction(formData)
    
    if (result?.error) {
      alert(result.error)
    } else {
      setNewName('')
      fetchCompanies()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return
    
    // Optimistic UI update could go here, but we'll wait for safety
    const result = await deleteCompanyAction(id)
    
    if (result?.error) {
      alert(result.error)
    } else {
      fetchCompanies()
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading companies...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company Units</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LIST */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {companies.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">No companies found.</li>
                ) : (
                    companies.map(c => (
                        <li key={c.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <span className="font-medium text-gray-900 dark:text-white">{c.company_name}</span>
                            <button 
                                onClick={() => handleDelete(c.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Company"
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>

        {/* CREATE FORM */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-800 h-fit">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4">Add New Unit</h3>
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">Company Name</label>
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Charlie Company"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !newName.trim()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
                >
                    {isSubmitting ? 'Creating...' : 'Create Company'}
                </button>
            </form>
        </div>

      </div>
    </div>
  )
}