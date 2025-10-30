// in app/submit/page.tsx
'use client' // This is an interactive form, so it runs in the browser

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Define a type for our cadet profile
type CadetProfile = {
  id: string;
  full_name: string;
}

export default function SubmitReport() {
  const supabase = createClient()
  const router = useRouter()
  
  // State for your form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subjectCadetId, setSubjectCadetId] = useState('')

  // State for your dropdown
  const [cadets, setCadets] = useState<CadetProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch all cadets for the dropdown when the page loads
  useEffect(() => {
    async function getCadets() {
      // Your RLS policy allows any 'authenticated' user to read profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name') // Only get what we need
      
      if (error) {
        setError('Could not fetch cadets: ' + error.message)
      } else if (data) {
        setCadets(data)
      }
    }
    getCadets()
  }, [supabase]) // The empty array means this runs once on load

  // 2. Handle the form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() // Stop the page from refreshing
    setLoading(true)
    setError(null)

    // 3. Call your 'create_new_report' SQL function
    const { error: rpcError } = await supabase.rpc('create_new_report', {
      title: title,
      subject_cadet_id: subjectCadetId,
      // Make sure your jsonb structure matches what you want.
      // For example, if you just have one text field:
      content: { "details": content } 
    })

    setLoading(false)

    if (rpcError) {
      setError('Error submitting report: ' + rpcError.message)
    } else {
      alert('Report submitted successfully!')
      router.push('/') // Redirect to the dashboard
      router.refresh() // Tell the dashboard to reload its data
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow">
        
        {/* This is your existing form. It fits right inside the card. */}
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
              <option value="">Select a cadet</option>
              {cadets.map((cadet) => (
                <option key={cadet.id} value={cadet.id}>
                  {cadet.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Report Details
            </label>
            <textarea 
              id="content"
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required 
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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