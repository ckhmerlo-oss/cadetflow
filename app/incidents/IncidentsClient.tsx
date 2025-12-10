'use client'

import { useState, useEffect, useMemo } from 'react'
import { IncidentReport, resolveAsHandled, convertToDemerit, getFacultyList } from './actions'
import SearchableSelect from '@/app/components/SearchableSelect'

type OffenseOption = { id: string, label: string, group: string, demerits: number }

export default function IncidentsClient({ 
    incidents, 
    roleLevel, 
    offenseTypes 
}: { 
    incidents: IncidentReport[], 
    roleLevel: number,
    offenseTypes: OffenseOption[] 
}) {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')
  const [loading, setLoading] = useState(false)
  
  // Data
  const [faculty, setFaculty] = useState<{id: string, label: string}[]>([])

  // Modal State
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'resolve' | 'convert'>('view')
  
  // Form State
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [selectedOffenseId, setSelectedOffenseId] = useState('')
  const [handledById, setHandledById] = useState('')

  useEffect(() => {
      // Load faculty list for "Handled By" dropdown
      getFacultyList().then(setFaculty)
  }, [])

  // Auto-set "Handled By" to the reporter when opening resolve modal
  useEffect(() => {
      if (modalMode === 'resolve' && selectedIncident) {
          setHandledById('')
      }
  }, [modalMode, selectedIncident])

  const filteredIncidents = incidents.filter(i => {
      if (activeTab === 'pending') return i.status === 'pending'
      return ['handled', 'converted'].includes(i.status)
  })

  // Format Offense Options to show Demerits
  const richOffenseOptions = useMemo(() => {
      return offenseTypes.map(o => ({
          ...o,
          label: `${o.label} (${o.demerits} Dem)`
      }))
  }, [offenseTypes])

  // --- ACTIONS ---

  const handleResolve = async () => {
      if (!selectedIncident || !handledById) return
      setLoading(true)
      const { error } = await resolveAsHandled(selectedIncident.id, resolutionNotes, handledById)
      setLoading(false)
      if (error) alert(error)
      else { setSelectedIncident(null); setResolutionNotes(''); }
  }

  const handleConvert = async () => {
      if (!selectedIncident || !selectedOffenseId) return
      setLoading(true)
      const { error } = await convertToDemerit(selectedIncident.id, selectedOffenseId, resolutionNotes)
      setLoading(false)
      if (error) alert(error)
      else { setSelectedIncident(null); setResolutionNotes(''); setSelectedOffenseId(''); }
  }

  return (
    <div className="space-y-6">
        
        {/* TABS */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}>Pending Review</button>
            <button onClick={() => setActiveTab('resolved')} className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'resolved' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'}`}>Resolved History</button>
        </div>

        {/* LIST */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                        <th className="px-6 py-3 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredIncidents.length > 0 ? filteredIncidents.map(inc => (
                        <tr key={inc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => { setSelectedIncident(inc); setModalMode('view'); }}>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(inc.incident_time).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{inc.subject.last_name}, {inc.subject.first_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{inc.reporter.last_name}, {inc.reporter.first_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">{inc.description}</td>
                            <td className="px-6 py-4 text-right text-sm">
                                {inc.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">New</span>}
                                {inc.status === 'handled' && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Handled</span>}
                                {inc.status === 'converted' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Converted</span>}
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No incidents found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* --- DETAILS MODAL --- */}
        {selectedIncident && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Incident Report</h2>
                            <p className="text-sm text-gray-500">{new Date(selectedIncident.incident_time).toLocaleString()} • {selectedIncident.location}</p>
                        </div>
                        <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    {/* Original Report */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded border dark:border-gray-700 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="font-bold text-gray-500">Subject:</span> {selectedIncident.subject.last_name}, {selectedIncident.subject.first_name}</div>
                            <div><span className="font-bold text-gray-500">Reported By:</span> {selectedIncident.reporter.last_name}, {selectedIncident.reporter.first_name}</div>
                        </div>
                        <div>
                            <span className="font-bold text-gray-500 block mb-1">Description:</span>
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selectedIncident.description}</p>
                        </div>
                        {selectedIncident.action_taken && (
                            <div>
                                <span className="font-bold text-gray-500 block mb-1">Immediate Action Taken:</span>
                                <p className="text-gray-800 dark:text-gray-200 italic">{selectedIncident.action_taken}</p>
                            </div>
                        )}
                    </div>

                    {/* --- ACTIONS AREA --- */}
                    {selectedIncident.status === 'pending' && roleLevel >= 65 && (
                        <div className="pt-4 border-t dark:border-gray-700">
                            {modalMode === 'view' && (
                                <div className="flex gap-4">
                                    <button onClick={() => setModalMode('resolve')} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium">
                                        Mark as Handled
                                    </button>
                                    <button onClick={() => setModalMode('convert')} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium">
                                        Convert to Demerit Report
                                    </button>
                                </div>
                            )}

                            {/* RESOLVE FORM (Updated with Handled By) */}
                            {modalMode === 'resolve' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-green-700">Resolution: Handled Locally</h3>
                                    <SearchableSelect 
                                        label="Handled By (Faculty)" 
                                        options={faculty} 
                                        value={handledById} 
                                        onChange={setHandledById} 
                                        placeholder="Select who corrected the cadet..."
                                    />
                                    <textarea placeholder="Notes on how this was resolved..." className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white" rows={3} value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setModalMode('view')} className="text-gray-500 px-3">Back</button>
                                        <button onClick={handleResolve} disabled={loading || !resolutionNotes || !handledById} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">Confirm Resolution</button>
                                    </div>
                                </div>
                            )}

                            {/* CONVERT FORM (Updated with Warnings) */}
                            {modalMode === 'convert' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-red-700">Escalate: Issue Demerits</h3>
                                    
                                    <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded border border-amber-200">
                                        <strong>Notice:</strong> Original incident notes will NOT be copied to the official report. 
                                        Please write a fresh, professional summary below suitable for the cadet's permanent record.
                                    </div>

                                    <SearchableSelect label="Select Infraction" options={richOffenseOptions} value={selectedOffenseId} onChange={setSelectedOffenseId} placeholder="Search offense..." />
                                    
                                    <textarea placeholder="Write the official report description here..." className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white" rows={4} value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} />
                                    
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setModalMode('view')} className="text-gray-500 px-3">Back</button>
                                        <button onClick={handleConvert} disabled={loading || !selectedOffenseId || !resolutionNotes} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">Create Demerit Report</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* HISTORY VIEW */}
                    {selectedIncident.status !== 'pending' && (
                        <div className="pt-4 border-t dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-900/30 p-3 rounded">
                            <p><span className="font-bold">Status:</span> <span className="uppercase">{selectedIncident.status}</span></p>
                            {selectedIncident.handler && <p><span className="font-bold">Handled By:</span> {selectedIncident.handler.last_name}, {selectedIncident.handler.first_name}</p>}
                            <p><span className="font-bold">Processed By:</span> {selectedIncident.resolver?.last_name || 'System'}</p>
                            <p><span className="font-bold">Notes:</span> {selectedIncident.resolution_notes}</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  )
}