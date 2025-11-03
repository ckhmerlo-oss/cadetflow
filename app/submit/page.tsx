// in app/submit/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// *** UPDATED TYPE ***
type CadetProfile = {
  id: string;
  first_name: string;
  last_name: string;
}

export default function SubmitReport() {
  const supabase = createClient()
  const router = useRouter()
  
  // State for your form fields
  const [title, setTitle] = useState('')
  const [subjectCadetId, setSubjectCadetId] = useState('')
  const [dateOfOffense, setDateOfOffense] = useState(new Date().toISOString().split('T')[0]) // Default to today
  const [category, setCategory] = useState('')
  const [demeritCount, setDemeritCount] = useState(1)
  const [notes, setNotes] = useState('')

  const [cadets, setCadets] = useState<CadetProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch cadets for the dropdown
  useEffect(() => {
    async function getCadets() {
      // *** UPDATED: Call the get_subordinates function ***
      const { data, error } = await supabase.rpc('get_subordinates')
      
      if (error) {
        setError('Could not fetch cadets: ' + error.message)
      } else if (data) {
        // Sort by last name
        data.sort((a, b) => a.last_name.localeCompare(b.last_name))
        setCadets(data)
      }
    }
    getCadets()
  }, [supabase]) 

  // 2. Handle the form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    setLoading(true)
    setError(null)

    // 3. Call your 'create_new_report' SQL function
    const { error: rpcError } = await supabase.rpc('create_new_report', {
      p_title: title,
      p_subject_cadet_id: subjectCadetId,
      p_date_of_offense: dateOfOffense,
      p_content: { // Match the JSON structure
        category: category, 
        demerit_count: demeritCount,
        notes: notes 
      } 
    })

    setLoading(false)

    if (rpcError) {
      setError('Error submitting report: ' + rpcError.message)
    } else {
      router.push('/') 
      router.refresh() 
    }
  }

  // --- Form Categories ---
  const reportCategories = [
    "Uniform", "Barracks", "Discipline", "Punctuality", "Knowledge", "Other"
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Submit New Report
          </h2>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input 
              id="title" 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., 'Uniform Infraction in Formation'"
            />
          </div>

          {/* Subject Cadet Field */}
          <div>
            <label htmlFor="cadet" className="block text-sm font-medium text-gray-700">
              Subject Cadet
            </label>
            <select 
              id="cadet"
              value={subjectCadetId} 
              onChange={(e) => setSubjectCadetId(e.target.value)} 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a cadet...</option>
              {cadets.map((cadet) => (
                // *** UPDATED: Format as "Last, First" ***
                <option key={cadet.id} value={cadet.id}>
                  {cadet.last_name}, {cadet.first_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Offense */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date of Offense
            </label>
            <input 
              id="date"
              type="date"
              value={dateOfOffense} 
              onChange={(e) => setDateOfOffense(e.target.value)} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select 
                id="category"
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a category...</option>
                {reportCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {/* Demerit Count */}
            <div>
              <label htmlFor="demerits" className="block text-sm font-medium text-gray-700">
                Demerit Count
              </label>
              <input 
                id="demerits"
                type="number"
                value={demeritCount} 
                onChange={(e) => setDemeritCount(parseInt(e.target.value))} 
                required 
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea 
              id="notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              required 
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Provide a detailed description of the incident..."
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

