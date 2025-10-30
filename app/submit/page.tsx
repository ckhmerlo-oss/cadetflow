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
    <form onSubmit={handleSubmit} style={{ padding: '2em' }}>
      <h2>Submit New Report</h2>
      <div style={{ marginBottom: '1em' }}>
        <label htmlFor="title">Title:</label><br />
        <input 
          id="title" 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ width: '300px' }}
        />
      </div>

      <div style={{ marginBottom: '1em' }}>
        <label htmlFor="cadet">Subject Cadet:</label><br />
        <select 
          id="cadet"
          value={subjectCadetId} 
          onChange={(e) => setSubjectCadetId(e.target.value)} 
          required
          style={{ width: '300px' }}
        >
          <option value="">Select a cadet</option>
          {cadets.map((cadet) => (
            <option key={cadet.id} value={cadet.id}>
              {cadet.full_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1em' }}>
        <label htmlFor="content">Report Details:</label><br />
        <textarea 
          id="content"
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          style={{ width: '300px', minHeight: '100px' }}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}