// in app/submit/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type CadetProfile = {
  id: string;
  first_name: string;
  last_name: string;
}

// *** NEW: Type for the offense_types table ***
type OffenseType = {
  id: string;
  offense_group: string;
  offense_name: string;
  demerits: number;
}

export default function SubmitReport() {
  const supabase = createClient()
  const router = useRouter()
  
  // State for your form fields
  const [subjectCadetId, setSubjectCadetId] = useState('')
  const [offenseTypeId, setOffenseTypeId] = useState('') // *** NEW ***
  const [notes, setNotes] = useState('') // *** NEW ***
  const [dateOfOffense, setDateOfOffense] = useState(new Date().toISOString().split('T')[0])

  // Data for dropdowns
  const [cadets, setCadets] = useState<CadetProfile[]>([])
  const [offenses, setOffenses] = useState<OffenseType[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch cadets AND offense types for the dropdowns
  useEffect(() => {
    async function getFormData() {
      // Fetch cadets
      const { data: cadetsData, error: cadetsError } = await supabase.rpc('get_subordinates')
      if (cadetsError) {
        setError('Could not fetch cadets: ' + cadetsError.message)
      } else if (cadetsData) {
        cadetsData.sort((a: CadetProfile, b: CadetProfile) => a.last_name.localeCompare(b.last_name))
        setCadets(cadetsData)
      }

      // Fetch all offense types
      const { data: offensesData, error: offensesError } = await supabase
        .from('offense_types')
        .select('id, offense_group, offense_name, demerits')
        .order('offense_group')
        .order('offense_name')
        
      if (offensesError) {
        setError('Could not fetch offense types: ' + offensesError.message)
      } else if (offensesData) {
        setOffenses(offensesData)
      }
    }
    getFormData()
  }, [supabase]) 

  // 2. Handle the form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    setLoading(true)
    setError(null)

    // 3. Call your REFACTORED 'create_new_report' SQL function
    const { error: rpcError } = await supabase.rpc('create_new_report', {
      p_subject_cadet_id: subjectCadetId,
      p_offense_type_id: offenseTypeId, // *** CHANGED ***
      p_notes: notes, // *** CHANGED ***
      p_date_of_offense: dateOfOffense
    })

    setLoading(false)

    if (rpcError) {
      setError('Error submitting report: ' + rpcError.message)
    } else {
      router.push('/') 
      router.refresh() 
    }
  }
  
  // Group offenses by their 'offense_group' for the <optgroup>
  const groupedOffenses = offenses.reduce((acc, offense) => {
    const group = offense.offense_group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(offense);
    return acc;
  }, {} as Record<string, OffenseType[]>);

  return (
    <div className="relative max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Submit New Report
          </h2>

          {/* Subject Cadet Field */}
          <div>
            <label htmlFor="cadet" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Subject Cadet
            </label>
            <select 
              id="cadet"
              value={subjectCadetId} 
              onChange={(e) => setSubjectCadetId(e.target.value)} 
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a cadet...</option>
              {cadets.map((cadet) => (
                <option key={cadet.id} value={cadet.id}>
                  {cadet.last_name}, {cadet.first_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Offense */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Date of Offense
            </label>
            <input 
              id="date"
              type="date"
              value={dateOfOffense} 
              onChange={(e) => setDateOfOffense(e.target.value)} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          {/* *** NEW: Offense Type Dropdown *** */}
          <div>
            <label htmlFor="offense_type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Offense
            </label>
            <select 
              id="offense_type"
              value={offenseTypeId} 
              onChange={(e) => setOffenseTypeId(e.target.value)} 
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select an offense...</option>
              {Object.entries(groupedOffenses).map(([groupName, groupOffenses]) => (
                <optgroup label={groupName} key={groupName}>
                  {groupOffenses.map((offense) => (
                    <option key={offense.id} value={offense.id}>
                      ({offense.demerits} demerits) {offense.offense_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Notes (Optional)
            </label>
            <textarea 
              id="notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Provide specific details of the incident..."
            />
          </div>

          {/* Submit Button */}
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  )
}