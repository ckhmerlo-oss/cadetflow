'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'
import { submitReport } from './actions' // Import the server action

type CadetProfile = {
  id: string;
  first_name: string;
  last_name: string;
}

type OffenseType = {
  id: string;
  offense_name: string;
  demerits: number;
  policy_category: number;
  offense_group: string;
  offense_code: string;
}

const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function SubmitReport() {
  const supabase = createClient()
  const router = useRouter()
  
  const [subjectCadetIds, setSubjectCadetIds] = useState<string[]>(['']) 
  
  const [offenseTypeId, setOffenseTypeId] = useState('')
  
  // NEW: State for the two different note fields
  const [greenSheetNotes, setGreenSheetNotes] = useState('') 
  const [reportExplanation, setReportExplanation] = useState('') 

  const [dateOfOffense, setDateOfOffense] = useState(getLocalDate())
  const [timeOfOffense, setTimeOfOffense] = useState(new Date().toTimeString().slice(0, 5)) 
  const [cadets, setCadets] = useState<CadetProfile[]>([])
  const [offenses, setOffenses] = useState<OffenseType[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getFormData() {
      // 1. CHECK PERMISSIONS
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role:role_id(default_role_level)')
            .eq('id', user.id)
            .eq('archived', false)
            .single()
          
          const roleLevel = (profile?.role as any)?.default_role_level || 0;
          
          if (roleLevel < 15) {
              router.replace(`/ledger/${user.id}`)
              return
          }

          if (roleLevel >= 50 && roleLevel < 65) {
              router.replace('/incidents/create')
              return
          }
      }

      const { data: cadetsData } = await supabase.rpc('get_subordinates')
      if (cadetsData) {
        cadetsData.sort((a: CadetProfile, b: CadetProfile) => a.last_name.localeCompare(b.last_name))
        .eq('archived', false)
        setCadets(cadetsData)
      }

      const { data: offensesData } = await supabase
        .from('offense_types')
        .select('*')
        .order('policy_category', { ascending: true })
        .order('offense_group', { ascending: true })
        .order('offense_code', { ascending: true })
      if (offensesData) setOffenses(offensesData)
    }
    getFormData()
  }, [supabase, router]) 

  const cadetOptions: SelectOption[] = useMemo(() => {
    return cadets.map(c => ({
        id: c.id,
        label: `${c.last_name}, ${c.first_name}`
    }))
  }, [cadets])

  const offenseOptions: SelectOption[] = useMemo(() => {
    return offenses.map(o => ({
        id: o.id,
        label: `[${o.offense_code}] ${o.offense_name} (${o.demerits})`,
        group: o.offense_group
    }))
  }, [offenses])

  const handleCadetChange = (index: number, value: string) => {
      const newIds = [...subjectCadetIds];
      newIds[index] = value;
      setSubjectCadetIds(newIds);
  }

  const addCadetSlot = () => {
      setSubjectCadetIds([...subjectCadetIds, '']);
  }

  const removeCadetSlot = (index: number) => {
      if (subjectCadetIds.length === 1) {
          setSubjectCadetIds(['']);
          return;
      }
      const newIds = subjectCadetIds.filter((_, i) => i !== index);
      setSubjectCadetIds(newIds);
  }

  // ... inside app/submit/page.tsx

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    
    const validCadetIds = subjectCadetIds.filter(id => id.trim() !== '');

    if (validCadetIds.length === 0 || !offenseTypeId) {
        setError("Please select at least one cadet and an infraction.");
        return;
    }
    
    setLoading(true)
    setError(null)

    try {
        const promises = validCadetIds.map(cadetId => 
            submitReport({
                cadetId,
                offenseTypeId,
                dateOfOffense, 
                timeOfOffense, // <--- ADD THIS PARAMETER
                notes: greenSheetNotes,          
                explanation: reportExplanation   
            })
        );

        const results = await Promise.all(promises);
        
        const firstError = results.find(r => !r.success)?.error;
        if (firstError) throw new Error(firstError);

        router.push('/') 
        router.refresh()

    } catch (err: any) {
        setLoading(false);
        setError('Error submitting report(s): ' + err.message);
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div id="tour-submit-form" className="bg-card p-6 rounded-lg shadow-md border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-semibold text-foreground">Submit New Report</h2>
             <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                 {subjectCadetIds.filter(id => id).length} Report(s)
             </span>
          </div>

          {/* 1. CADET SELECTOR */}
          <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Subject Cadet(s)</label>
              {subjectCadetIds.map((id, index) => (
                  <div key={index} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex-1">
                        <SearchableSelect
                            label="" 
                            options={cadetOptions}
                            value={id}
                            onChange={(val) => handleCadetChange(index, val)}
                            placeholder={`Select cadet #${index + 1}...`}
                            required={index === 0} 
                        />
                      </div>
                      {subjectCadetIds.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeCadetSlot(index)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Remove this cadet"
                          >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      )}
                  </div>
              ))}
              <button 
                type="button"
                onClick={addCadetSlot}
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1 transition-colors"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add another cadet
              </button>
          </div>

          {/* 2. DATE & TIME */}
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input 
                id="date" type="date" value={dateOfOffense} onChange={(e) => setDateOfOffense(e.target.value)} required 
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-foreground mb-1">Time (approx)</label>
              <input 
                id="time" type="time" value={timeOfOffense} onChange={(e) => setTimeOfOffense(e.target.value)} required 
                className="input-base"
              />
            </div>
          </div>
          
          {/* 3. OFFENSE SELECTOR */}
          <SearchableSelect
            label="Infraction"
            options={offenseOptions}
            value={offenseTypeId}
            onChange={setOffenseTypeId}
            placeholder="Search for an infraction..."
            required
          />

          {/* 5. GREEN SHEET SUMMARY (PUBLIC) - UPDATED */}
          <div>
            <label htmlFor="notes" className="block text-sm font-bold text-foreground mb-1">
                Report Summary
            </label>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 font-medium">
                ⚠️ This text will appear on the Green Sheet. Keep it brief.
            </p>
            <input 
              type="text"
              id="notes"
              value={greenSheetNotes} 
              onChange={(e) => setGreenSheetNotes(e.target.value)} 
              maxLength={100}
              className="input-base"
              placeholder="Ex: Late to formation; Unshaven; Disrespect"
            />
          </div>

          {/* 4. REPORT EXPLANATION (FULL NARRATIVE) - NEW */}
          <div className="border-t border-border pt-4">
            <label htmlFor="explanation" className="block text-sm font-bold text-foreground mb-1">
                Report Details
            </label>
            <p className="text-xs text-muted-foreground mb-2">
                Detailed account of the event, if not fully captured in the summary. Visible to Staff, Faculty, Approvers, and the Subject Cadet.
            </p>
            <textarea 
              id="explanation"
              value={reportExplanation} 
              onChange={(e) => setReportExplanation(e.target.value)} 
              rows={5}
              className="input-base"
              placeholder="Describe the who, what, where, and when..."
            />
          </div>


          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">{error}</p>}
        </form>
        </div>
      </div>
  )
}