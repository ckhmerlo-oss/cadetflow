'use client'

import React, { useState, useEffect, useActionState } from 'react' // <--- Updated Import
import { createClient } from '@/utils/supabase/client'
import { useFormStatus } from 'react-dom'
import { adminResetPassword } from '../actions'

// Icons (Reused)
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>)
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.548 0A48.108 48.108 0 0 1 6.75 5.397m10.5-2.572V3.375c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v2.25" /></svg>)

type AcademicTerm = { id: string; term_name: string; start_date: string; end_date: string; }
type UploadResult = { successes: string[]; failures: { email: string; reason: string }[]; }

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4 mb-6">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ResetButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
      {pending ? 'Resetting...' : 'Set New Password'}
    </button>
  )
}

export default function GeneralSettingsTab() {
  const supabase = createClient()
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Form States
  const [newTermName, setNewTermName] = useState('')
  const [newTermStart, setNewTermStart] = useState('')
  const [newTermEnd, setNewTermEnd] = useState('')
  
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // *** FIX IS HERE: Switched to useActionState ***
  const [resetState, resetFormAction] = useActionState(adminResetPassword, { error: null, success: false })

  useEffect(() => { fetchAdminData() }, [])

  async function fetchAdminData() {
    setIsLoadingData(true)
    const { data, error } = await supabase.rpc('get_all_academic_terms')
    if (error) setDataError(error.message)
    else setTerms(data as AcademicTerm[])
    setIsLoadingData(false)
  }

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTermName || !newTermStart || !newTermEnd) return
    setIsLoadingData(true)
    const { error } = await supabase.rpc('create_academic_term', { p_term_name: newTermName, p_start_date: newTermStart, p_end_date: newTermEnd })
    if (error) setDataError(error.message)
    else { setNewTermName(''); setNewTermStart(''); setNewTermEnd(''); fetchAdminData(); }
    setIsLoadingData(false)
  }

  const handleDeleteTerm = async (termId: string) => {
    if (!window.confirm('Delete this term?')) return
    setIsLoadingData(true)
    const { error } = await supabase.rpc('delete_academic_term', { p_term_id: termId })
    if (error) setDataError(error.message)
    else fetchAdminData()
    setIsLoadingData(false)
  }

  const handleBulkAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!csvFile) return;
    setIsUploading(true); setUploadError(null); setUploadResult(null);
    try {
      const fileText = await csvFile.text();
      const { data, error } = await supabase.functions.invoke('bulk-create-users', { body: fileText });
      if (error) {
         let detailedError = error.message;
         if (error.context) { try { const b = await error.context.json(); if(b?.error) detailedError = b.error; } catch {} }
         throw new Error(detailedError);
      }
      if (data.error) throw new Error(data.error);
      setUploadResult(data as UploadResult);
    } catch (err: any) { setUploadError(`Upload failed: ${err.message}`); }
    setIsUploading(false);
  };

  return (
    <div className="space-y-8">
      {dataError && <div className="p-4 text-red-700 bg-red-100 rounded-md">{dataError}</div>}

      <AdminSection title="Manage Academic Terms">
        <form onSubmit={handleCreateTerm} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
          <input type="text" placeholder="Name (e.g. Fall 2025)" value={newTermName} onChange={e=>setNewTermName(e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
          <input type="date" value={newTermStart} onChange={e=>setNewTermStart(e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
          <input type="date" value={newTermEnd} onChange={e=>setNewTermEnd(e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
          <button type="submit" disabled={isLoadingData} className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400">Add Term</button>
        </form>
        <div className="mt-4 overflow-x-auto border rounded-lg dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Term</th><th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Start</th><th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">End</th><th className="px-6 py-3"></th></tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                    {terms.map(t => (
                        <tr key={t.id}>
                            <td className="px-6 py-4 text-sm font-medium dark:text-white">{t.term_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{t.start_date}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{t.end_date}</td>
                            <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteTerm(t.id)} className="text-red-600 hover:text-red-900"><TrashIcon /></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </AdminSection>

      <AdminSection title="Bulk User Upload">
        <p className="text-sm text-gray-600 dark:text-gray-400">CSV Columns: `email`, `first_name`, `last_name`, `password` (optional).</p>
        <form className="mt-4 p-6 border dark:border-gray-700 rounded-lg" onSubmit={handleBulkAddSubmit}>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadIcon /><p className="mb-2 text-sm text-gray-500">{csvFile ? csvFile.name : "Click to upload .csv"}</p></div>
                <input type="file" className="hidden" accept=".csv" onChange={e => e.target.files && setCsvFile(e.target.files[0])} />
            </label>
            <button type="submit" disabled={isUploading || !csvFile} className="mt-4 w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400">{isUploading ? 'Uploading...' : 'Upload'}</button>
        </form>
        {uploadError && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{uploadError}</div>}
        {uploadResult && <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded"><p className="font-bold text-green-600">Success: {uploadResult.successes.length}</p></div>}
      </AdminSection>

      <AdminSection title="Manual Password Reset">
        <form action={resetFormAction} className="space-y-4">
            <div><label className="block text-sm font-medium dark:text-gray-300">User ID</label><input name="userId" required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white" /></div>
            <div><label className="block text-sm font-medium dark:text-gray-300">New Password</label><input name="newPassword" type="password" required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white" /></div>
            <ResetButton />
            {resetState.error && <p className="text-red-600 text-sm">{resetState.error}</p>}
            {resetState.success && <p className="text-green-600 text-sm">Password reset successful!</p>}
        </form>
      </AdminSection>
    </div>
  )
}