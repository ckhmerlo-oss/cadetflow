'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'

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
  const [notes, setNotes] = useState('')
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
            .single()
          
          const roleLevel = (profile?.role as any)?.default_role_level || 0;
          
          if (roleLevel < 15) {
              router.replace(`/ledger/${user.id}`)
              return
          }

          // *** NEW: Redirect Faculty to Incidents ***
          if (roleLevel >= 50 && roleLevel < 65) {
              router.replace('/incidents/create')
              return
          }
      }

      const { data: cadetsData } = await supabase.rpc('get_subordinates')
      if (cadetsData) {
        cadetsData.sort((a: CadetProfile, b: CadetProfile) => a.last_name.localeCompare(b.last_name))
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    
    const validCadetIds = subjectCadetIds.filter(id => id.trim() !== '');

    if (validCadetIds.length === 0 || !offenseTypeId) {
        setError("Please select at least one cadet and an infraction.");
        return;
    }
    
    setLoading(true)
    setError(null)

    const localDateTime = new Date(`${dateOfOffense}T${timeOfOffense}:00`);
    const fullTimestamp = localDateTime.toISOString();

    try {
        const promises = validCadetIds.map(cadetId => 
            supabase.rpc('create_new_report', {
                p_subject_cadet_id: cadetId,
                p_offense_type_id: offenseTypeId,
                p_notes: notes,
                p_offense_timestamp: fullTimestamp 
            })
        );

        const results = await Promise.all(promises);
        
        const firstError = results.find(r => r.error)?.error;
        if (firstError) throw firstError;

        router.push('/') 
        router.refresh()

    } catch (err: any) {
        setLoading(false);
        setError('Error submitting report(s): ' + err.message);
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div id="tour-submit-form" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Submit New Report</h2>
             <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded dark:bg-indigo-900/30 dark:text-indigo-300">
                 {subjectCadetIds.filter(id => id).length} Report(s)
             </span>
          </div>

          <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject Cadet(s)</label>
              {subjectCadetIds.map((id, index) => (
                  // *** FIX: Changed items-start to items-center for better alignment ***
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
                            // *** FIX: Removed mt-1 since items-center handles vertical centering now ***
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add another cadet
              </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input 
                id="date" type="date" value={dateOfOffense} onChange={(e) => setDateOfOffense(e.target.value)} required 
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm py-2 px-3"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time (approx)</label>
              <input 
                id="time" type="time" value={timeOfOffense} onChange={(e) => setTimeOfOffense(e.target.value)} required 
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm py-2 px-3"
              />
            </div>
          </div>
          
          <SearchableSelect
            label="Infraction"
            options={offenseOptions}
            value={offenseTypeId}
            onChange={setOffenseTypeId}
            placeholder="Search for an infraction..."
            required
          />

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
            <textarea 
              id="notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm py-2 px-3"
              placeholder="Provide specific details of the incident..."
            />
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}
        </form>
        </div>
      </div>
  )
}