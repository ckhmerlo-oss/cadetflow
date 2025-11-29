'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'

// ... Types ...
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
  
  // ... state ...
  const [subjectCadetId, setSubjectCadetId] = useState('')
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
              // Redirect unauthorized cadets back to ledger
              router.replace(`/ledger/${user.id}`)
              return
          }
      }

      // Fetch cadets
      const { data: cadetsData, error: cadetsError } = await supabase.rpc('get_subordinates')
      if (cadetsError) {
        setError('Could not fetch cadets: ' + cadetsError.message)
      } else if (cadetsData) {
        cadetsData.sort((a: CadetProfile, b: CadetProfile) => a.last_name.localeCompare(b.last_name))
        setCadets(cadetsData)
      }

      // Fetch offenses
      const { data: offensesData, error: offensesError } = await supabase
        .from('offense_types')
        .select('*')
        .order('policy_category', { ascending: true })
        .order('offense_group', { ascending: true })
        .order('offense_code', { ascending: true })
        
      if (offensesError) {
        setError('Could not fetch offense types: ' + offensesError.message)
      } else if (offensesData) {
        setOffenses(offensesData)
      }
    }
    getFormData()
  }, [supabase, router]) 

  // ... rest of component ...
  // Transform for SearchableSelect
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


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    
    if (!subjectCadetId || !offenseTypeId) {
        setError("Please select both a cadet and an infraction.");
        return;
    }
    
    setLoading(true)
    setError(null)

    const localDateTime = new Date(`${dateOfOffense}T${timeOfOffense}:00`);
    const fullTimestamp = localDateTime.toISOString();

    const { error: rpcError } = await supabase.rpc('create_new_report', {
      p_subject_cadet_id: subjectCadetId,
      p_offense_type_id: offenseTypeId,
      p_notes: notes,
      p_offense_timestamp: fullTimestamp 
    })

    setLoading(false)

    if (rpcError) {
      setError('Error submitting report: ' + rpcError.message)
    } else {
      router.push('/') 
      router.refresh() 
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">

      <div id="tour-submit-form" className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          New Disciplinary Report
        </h2>
      
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Submit New Report
          </h2>

          <SearchableSelect
            label="Subject Cadet"
            options={cadetOptions}
            value={subjectCadetId}
            onChange={setSubjectCadetId}
            placeholder="Search for a cadet..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input 
                id="date" type="date" value={dateOfOffense} onChange={(e) => setDateOfOffense(e.target.value)} required 
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time (approx) <span className="text-red-500">*</span>
              </label>
              <input 
                id="time" type="time" value={timeOfOffense} onChange={(e) => setTimeOfOffense(e.target.value)} required 
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea 
              id="notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              placeholder="Provide specific details of the incident..."
            />
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
        </div>
      </div>
    </div>
  )
}