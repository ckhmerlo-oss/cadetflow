'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IncidentReport, resolveAsHandled, convertToDemerit } from '../actions'
import SearchableSelect from '@/app/components/SearchableSelect'
import Link from 'next/link'

export default function IncidentDetailsClient({ 
  incident, 
  userRoleLevel,
  facultyList,
  offenseTypes
}: { 
  incident: IncidentReport, 
  userRoleLevel: number,
  facultyList: {id: string, label: string}[],
  offenseTypes: {id: string, label: string, demerits: number, group: string}[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'view' | 'resolve' | 'convert'>('view')
  
  // Form State
  const [notes, setNotes] = useState('')
  const [handledBy, setHandledBy] = useState('') // Default to reporter
  const [offenseId, setOffenseId] = useState('')

  const handleResolve = async () => {
      setLoading(true)
      const { error } = await resolveAsHandled(incident.id, notes, handledBy)
      if (error) alert(error)
      else router.refresh()
      setLoading(false)
  }

  const handleConvert = async () => {
      setLoading(true)
      const { error } = await convertToDemerit(incident.id, offenseId, notes)
      if (error) alert(error)
      else router.push('/incidents') // Redirect to list as this page might change/vanish or show converted state
      setLoading(false)
  }

  // Format offense options
  const formattedOffenses = offenseTypes.map(o => ({...o, label: `${o.label} (${o.demerits} Dem)`}))

  // Helper for Status Badge Colors
  const getStatusBadge = (status: string) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    if (status === 'handled') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    return 'bg-destructive/10 text-destructive';
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/incidents" className="text-muted-foreground hover:text-primary mb-4 inline-block text-sm transition-colors">&larr; Back to Incidents</Link>
      
      {/* HEADER */}
      <div className="bg-card shadow-sm rounded-lg overflow-hidden mb-6 border border-border">
          <div className="p-6 border-b border-border flex justify-between items-start">
             <div>
                <h1 className="text-2xl font-bold text-foreground">Incident Report</h1>
                <p className="text-sm text-muted-foreground mt-1">Submitted on {new Date(incident.created_at).toLocaleDateString()}</p>
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(incident.status)}`}>
                 {incident.status}
             </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                 <h3 className="text-xs font-bold text-muted-foreground uppercase">Subject</h3>
                 <p className="text-lg font-medium text-foreground">{incident.subject.last_name}, {incident.subject.first_name}</p>
                 <p className="text-sm text-muted-foreground">{incident.subject.company?.company_name}</p>
             </div>
             <div>
                 <h3 className="text-xs font-bold text-muted-foreground uppercase">Reporter</h3>
                 <p className="text-lg font-medium text-foreground">{incident.reporter.last_name}, {incident.reporter.first_name}</p>
             </div>
             <div>
                 <h3 className="text-xs font-bold text-muted-foreground uppercase">Time & Location</h3>
                 <p className="text-foreground">{new Date(incident.incident_time).toLocaleString()}</p>
                 <p className="text-muted-foreground">{incident.location}</p>
             </div>
          </div>

          <div className="p-6 border-t border-border bg-muted/30">
             <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Description of Event</h3>
             <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                 {incident.description}
             </div>
          </div>

          {incident.action_taken && (
              <div className="p-6 border-t border-border bg-muted/30">
                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Immediate Action Taken</h3>
                <p className="text-foreground text-sm italic">{incident.action_taken}</p>
              </div>
          )}
      </div>

      {/* RESOLUTION HISTORY */}
      {incident.status !== 'pending' && (
          <div className="bg-card shadow-sm rounded-lg p-6 border border-border mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Resolution Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div><dt className="text-muted-foreground">Resolved By</dt><dd className="font-medium text-foreground">{incident.resolver?.last_name || 'System'}</dd></div>
                  <div><dt className="text-muted-foreground">Date</dt><dd className="font-medium text-foreground">{new Date(incident.resolved_at!).toLocaleString()}</dd></div>
                  {incident.handler && <div><dt className="text-muted-foreground">Handled By</dt><dd className="font-medium text-foreground">{incident.handler.last_name}, {incident.handler.first_name}</dd></div>}
                  <div className="col-span-2"><dt className="text-muted-foreground">Notes</dt><dd className="text-foreground">{incident.resolution_notes}</dd></div>
              </dl>
          </div>
      )}

      {/* ACTIONS (TAC Only) */}
      {incident.status === 'pending' && userRoleLevel >= 65 && (
          <div className="bg-card shadow-sm rounded-lg p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Process Incident</h2>
              
              {mode === 'view' && (
                  <div className="flex gap-4">
                      <button 
                        onClick={() => setMode('resolve')} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow transition-colors"
                      >
                          Mark as Handled
                      </button>
                      <button 
                        onClick={() => setMode('convert')} 
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground py-3 rounded-lg font-bold shadow transition-colors"
                      >
                          Convert to Demerits
                      </button>
                  </div>
              )}

              {mode === 'resolve' && (
                  <div className="space-y-4 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-bottom-2">
                      <h3 className="font-bold text-green-800 dark:text-green-300">Resolve: No Further Action</h3>
                      <SearchableSelect label="Handled By" options={facultyList} value={handledBy} onChange={setHandledBy} />
                      <textarea 
                        placeholder="Resolution notes..." 
                        className="w-full border border-input rounded p-2 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
                        rows={3} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setMode('view')} className="text-muted-foreground hover:text-foreground px-4 transition-colors">Cancel</button>
                          <button onClick={handleResolve} disabled={loading || !notes} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 disabled:opacity-50">Confirm</button>
                      </div>
                  </div>
              )}

              {mode === 'convert' && (
                  <div className="space-y-4 bg-destructive/5 p-4 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-bottom-2">
                      <h3 className="font-bold text-destructive">Escalate: Create Demerit Report</h3>
                      <div className="text-xs bg-background p-2 rounded text-destructive border border-destructive/20">
                         <strong>Note:</strong> You must select an infraction and write a formal description. Original details will be linked but not copied.
                      </div>
                      <SearchableSelect label="Infraction" options={formattedOffenses} value={offenseId} onChange={setOffenseId} />
                      <textarea 
                        placeholder="Official report description..." 
                        className="w-full border border-input rounded p-2 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
                        rows={4} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setMode('view')} className="text-muted-foreground hover:text-foreground px-4 transition-colors">Cancel</button>
                          <button onClick={handleConvert} disabled={loading || !notes || !offenseId} className="bg-destructive text-destructive-foreground px-4 py-2 rounded font-bold hover:bg-destructive/90 disabled:opacity-50">Create Report</button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  )
}