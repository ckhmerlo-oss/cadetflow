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

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/incidents" className="text-gray-500 hover:text-indigo-600 mb-4 inline-block text-sm">&larr; Back to Incidents</Link>
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Report</h1>
                <p className="text-sm text-gray-500 mt-1">Submitted on {new Date(incident.created_at).toLocaleDateString()}</p>
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                 incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                 incident.status === 'handled' ? 'bg-green-100 text-green-800' :
                 'bg-red-100 text-red-800'
             }`}>
                 {incident.status}
             </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Subject</h3>
                 <p className="text-lg font-medium text-gray-900 dark:text-white">{incident.subject.last_name}, {incident.subject.first_name}</p>
                 <p className="text-sm text-gray-500">{incident.subject.company?.company_name}</p>
             </div>
             <div>
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Reporter</h3>
                 <p className="text-lg font-medium text-gray-900 dark:text-white">{incident.reporter.last_name}, {incident.reporter.first_name}</p>
             </div>
             <div>
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Time & Location</h3>
                 <p className="text-gray-900 dark:text-white">{new Date(incident.incident_time).toLocaleString()}</p>
                 <p className="text-gray-500">{incident.location}</p>
             </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
             <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Description of Event</h3>
             <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                 {incident.description}
             </div>
          </div>

          {incident.action_taken && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Immediate Action Taken</h3>
                <p className="text-gray-800 dark:text-gray-200 text-sm italic">{incident.action_taken}</p>
              </div>
          )}
      </div>

      {/* RESOLUTION HISTORY */}
      {incident.status !== 'pending' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resolution Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div><dt className="text-gray-500">Resolved By</dt><dd className="font-medium dark:text-white">{incident.resolver?.last_name || 'System'}</dd></div>
                  <div><dt className="text-gray-500">Date</dt><dd className="font-medium dark:text-white">{new Date(incident.resolved_at!).toLocaleString()}</dd></div>
                  {incident.handler && <div><dt className="text-gray-500">Handled By</dt><dd className="font-medium dark:text-white">{incident.handler.last_name}, {incident.handler.first_name}</dd></div>}
                  <div className="col-span-2"><dt className="text-gray-500">Notes</dt><dd className="dark:text-white">{incident.resolution_notes}</dd></div>
              </dl>
          </div>
      )}

      {/* ACTIONS (TAC Only) */}
      {incident.status === 'pending' && userRoleLevel >= 65 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Process Incident</h2>
              
              {mode === 'view' && (
                  <div className="flex gap-4">
                      <button onClick={() => setMode('resolve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow transition-colors">
                          Mark as Handled
                      </button>
                      <button onClick={() => setMode('convert')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow transition-colors">
                          Convert to Demerits
                      </button>
                  </div>
              )}

              {mode === 'resolve' && (
                  <div className="space-y-4 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="font-bold text-green-800 dark:text-green-300">Resolve: No Further Action</h3>
                      <SearchableSelect label="Handled By" options={facultyList} value={handledBy} onChange={setHandledBy} />
                      <textarea placeholder="Resolution notes..." className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setMode('view')} className="text-gray-600 px-4">Cancel</button>
                          <button onClick={handleResolve} disabled={loading || !notes} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 disabled:opacity-50">Confirm</button>
                      </div>
                  </div>
              )}

              {mode === 'convert' && (
                  <div className="space-y-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <h3 className="font-bold text-red-800 dark:text-red-300">Escalate: Create Demerit Report</h3>
                      <div className="text-xs bg-white dark:bg-black/20 p-2 rounded text-red-600">
                         <strong>Note:</strong> You must select an infraction and write a formal description. Original details will be linked but not copied.
                      </div>
                      <SearchableSelect label="Infraction" options={formattedOffenses} value={offenseId} onChange={setOffenseId} />
                      <textarea placeholder="Official report description..." className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white" rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setMode('view')} className="text-gray-600 px-4">Cancel</button>
                          <button onClick={handleConvert} disabled={loading || !notes || !offenseId} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50">Create Report</button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  )
}