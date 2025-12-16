'use client'

import { useState, useEffect } from 'react'
import { searchCadetCandidates, setBandMembership } from '../actions'

type Candidate = {
  id: string
  name: string
  rank: string | null
  company: string | null
}

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function AddCadetModal({ onClose, onSuccess }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true)
        const candidates = await searchCadetCandidates(query)
        setResults(candidates)
        setLoading(false)
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleAdd = async (candidateId: string) => {
    setAddingId(candidateId)
    const res = await setBandMembership(candidateId, true)
    if (res.success) {
      onSuccess() // Refresh parent
      // Don't close immediately so they can add multiple if desired? 
      // Usually closing is better feedback.
      onClose() 
    } else {
      alert('Error adding cadet')
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Add Cadet to Band</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full p-3 rounded-md border border-input bg-background text-foreground text-lg focus:ring-2 focus:ring-primary mb-4"
          />

          <div className="min-h-[200px] max-h-[300px] overflow-y-auto border border-border rounded-md bg-muted/10">
            {loading ? (
                <div className="p-4 text-center text-muted-foreground">Searching...</div>
            ) : results.length > 0 ? (
                <ul className="divide-y divide-border">
                    {results.map(c => (
                        <li key={c.id} className="flex items-center justify-between p-3 hover:bg-card transition-colors">
                            <div>
                                <p className="font-bold text-foreground">{c.name}</p>
                                <p className="text-xs text-muted-foreground">{c.rank || 'Cadet'} • {c.company || 'No Co.'}</p>
                            </div>
                            <button 
                                onClick={() => handleAdd(c.id)}
                                disabled={addingId === c.id}
                                className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 disabled:opacity-50"
                            >
                                {addingId === c.id ? 'Adding...' : 'Add'}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : query.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">No matching cadets found (outside of band).</div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">Type at least 2 characters to search.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}