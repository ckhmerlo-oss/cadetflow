'use client'

import React, { useState, useEffect, useActionState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useFormStatus } from 'react-dom'
import { adminResetPassword } from '../actions'
import { setupSchoolYearTerms, archiveSchoolYear } from '@/app/oversight/actions'

const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>)
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.548 0A48.108 48.108 0 0 1 6.75 5.397m10.5-2.572V3.375c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v2.25" /></svg>)

type AcademicTerm = {
  id: string
  term_name: string
  start_date: string
  end_date: string
  school_year: string
  term_number: number
  archived: boolean
}
type UploadResult = { successes: string[]; failures: { email: string; reason: string }[]; }

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-4 mb-6">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ResetButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
      {pending ? 'Resetting...' : 'Set New Password'}
    </button>
  )
}

const defaultTermDates = () => {
  const base = new Date()
  return [0, 1, 2, 3, 4].map((i) => {
    const start = new Date(base)
    start.setDate(start.getDate() + i * 30)
    const end = new Date(start)
    end.setDate(end.getDate() + 29)
    return {
      name: `Term ${i + 1}`,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    }
  })
}

export default function GeneralSettingsTab() {
  const supabase = createClient()
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [schoolYear, setSchoolYear] = useState('2025-2026')
  const [yearTerms, setYearTerms] = useState(defaultTermDates())

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [resetState, resetFormAction] = useActionState(adminResetPassword, { error: null, success: false })

  useEffect(() => { fetchAdminData() }, [])

  async function fetchAdminData() {
    setIsLoadingData(true)
    const { data, error } = await supabase.rpc('get_all_academic_terms')
    if (error) setDataError(error.message)
    else setTerms(data as AcademicTerm[])
    setIsLoadingData(false)
  }

  const handleSetupSchoolYear = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingData(true)
    setDataError(null)
    const { error } = await setupSchoolYearTerms(schoolYear, yearTerms)
    if (error) setDataError(error)
    else fetchAdminData()
    setIsLoadingData(false)
  }

  const handleArchiveYear = async (year: string) => {
    if (!window.confirm(`Archive school year ${year}? This clears active class schedules for that year.`)) return
    setIsLoadingData(true)
    const { error } = await archiveSchoolYear(year)
    if (error) setDataError(error)
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

  const inputClass = "rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary w-full";

  const activeYears = [...new Set(terms.filter(t => !t.archived).map(t => t.school_year))]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {dataError && <div className="p-4 text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{dataError}</div>}

      <AdminSection title="School Year Setup (5 Terms)">
        <p className="text-sm text-muted-foreground">
          Configure all 5 terms for a school year at once. Terms must not overlap. Archive a year when it ends.
        </p>
        <form onSubmit={handleSetupSchoolYear} className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div>
            <label className="text-sm font-medium">School Year</label>
            <input type="text" value={schoolYear} onChange={e => setSchoolYear(e.target.value)} className={inputClass} placeholder="2025-2026" required />
          </div>
          {yearTerms.map((t, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" value={t.name} onChange={e => {
                const next = [...yearTerms]; next[i] = { ...next[i], name: e.target.value }; setYearTerms(next)
              }} className={inputClass} required />
              <input type="date" value={t.start} onChange={e => {
                const next = [...yearTerms]; next[i] = { ...next[i], start: e.target.value }; setYearTerms(next)
              }} className={inputClass} required />
              <input type="date" value={t.end} onChange={e => {
                const next = [...yearTerms]; next[i] = { ...next[i], end: e.target.value }; setYearTerms(next)
              }} className={inputClass} required />
              <span className="text-sm text-muted-foreground self-center">Term {i + 1}</span>
            </div>
          ))}
          <button type="submit" disabled={isLoadingData} className="py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">
            Save School Year Terms
          </button>
        </form>

        {activeYears.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeYears.map(y => (
              <button key={y} onClick={() => handleArchiveYear(y)} className="text-sm px-3 py-1 border border-destructive/30 text-destructive rounded hover:bg-destructive/10">
                Archive {y}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 overflow-x-auto border border-border rounded-lg">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Term</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Start</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">End</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {terms.map(t => (
                        <tr key={t.id}>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{t.school_year}</td>
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{t.term_name} (#{t.term_number})</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{t.start_date}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{t.end_date}</td>
                            <td className="px-6 py-4 text-sm">{t.archived ? 'Archived' : 'Active'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </AdminSection>

      <AdminSection title="Bulk User Upload">
        <p className="text-sm text-muted-foreground">CSV Columns: `email`, `first_name`, `last_name`, `password` (optional).</p>
        <form className="mt-4 p-6 border border-border rounded-lg" onSubmit={handleBulkAddSubmit}>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="text-muted-foreground"><UploadIcon /></div>
                  <p className="mb-2 text-sm text-muted-foreground">{csvFile ? csvFile.name : "Click to upload .csv"}</p>
                </div>
                <input type="file" className="hidden" accept=".csv" onChange={e => e.target.files && setCsvFile(e.target.files[0])} />
            </label>
            <button type="submit" disabled={isUploading || !csvFile} className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">{isUploading ? 'Uploading...' : 'Upload'}</button>
        </form>
        {uploadError && <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded">{uploadError}</div>}
        {uploadResult && <div className="mt-4 p-4 bg-muted text-foreground rounded"><p className="font-bold text-green-600">Success: {uploadResult.successes.length}</p></div>}
      </AdminSection>

      <AdminSection title="Manual Password Reset">
        <form action={resetFormAction} className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground">User ID</label><input name="userId" required className={`mt-1 block w-full ${inputClass}`} /></div>
            <div><label className="block text-sm font-medium text-foreground">New Password</label><input name="newPassword" type="password" required className={`mt-1 block w-full ${inputClass}`} /></div>
            <ResetButton />
            {resetState.error && <p className="text-destructive text-sm">{resetState.error}</p>}
            {resetState.success && <p className="text-green-600 text-sm">Password reset successful!</p>}
        </form>
      </AdminSection>
    </div>
  )
}
