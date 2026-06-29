'use client'

import { useState, useEffect, useMemo } from 'react'
import { IncidentReport, resolveAsHandled, convertToDemerit, getFacultyList } from './actions'
import SearchableSelect from '@/app/components/SearchableSelect'

type OffenseOption = { id: string, label: string, group: string, demerits: number }

type FilterType = 'all' | 'date_range' | 'subject' | 'status'

const formatName = (person: { first_name: string; last_name: string } | null | undefined) => {
  if (!person?.last_name) return 'Unknown'
  return `${person.last_name}, ${person.first_name}`
}

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
  
  const [faculty, setFaculty] = useState<{id: string, label: string}[]>([])

  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'resolve' | 'convert'>('view')
  
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [selectedOffenseId, setSelectedOffenseId] = useState('')
  const [handledById, setHandledById] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterValue, setFilterValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
      getFacultyList().then(setFaculty)
  }, [])

  useEffect(() => {
      if (modalMode === 'resolve' && selectedIncident) {
          setHandledById('')
      }
  }, [modalMode, selectedIncident])

  const tabIncidents = useMemo(() => {
    if (activeTab === 'pending') {
      return incidents.filter((i) => i.status === 'pending')
    }
    return incidents.filter(
      (i) =>
        ['handled', 'converted'].includes(i.status) &&
        !i.event_id
    )
  }, [incidents, activeTab])

  const uniqueSubjects = useMemo(
    () => [...new Set(tabIncidents.map((i) => formatName(i.subject)))].sort(),
    [tabIncidents]
  )

  const filteredIncidents = useMemo(() => {
    let rows = tabIncidents

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      rows = rows.filter(
        (i) =>
          formatName(i.subject).toLowerCase().includes(q) ||
          formatName(i.reporter).toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q)
      )
    }

    if (filterType === 'subject' && filterValue) {
      rows = rows.filter((i) => formatName(i.subject) === filterValue)
    }

    if (filterType === 'status' && filterValue) {
      rows = rows.filter((i) => i.status === filterValue)
    }

    if (filterType === 'date_range') {
      if (startDate) {
        const start = new Date(startDate).getTime()
        rows = rows.filter((i) => {
          const d = activeTab === 'resolved' ? i.resolved_at ?? i.created_at : i.incident_time
          return new Date(d).getTime() >= start
        })
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 86400000
        rows = rows.filter((i) => {
          const d = activeTab === 'resolved' ? i.resolved_at ?? i.created_at : i.incident_time
          return new Date(d).getTime() < end
        })
      }
    }

    return rows
  }, [tabIncidents, searchTerm, filterType, filterValue, startDate, endDate, activeTab])

  const richOffenseOptions = useMemo(() => {
      return offenseTypes.map(o => ({
          ...o,
          label: `${o.label} (${o.demerits} Dem)`
      }))
  }, [offenseTypes])

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
        
        <div className="flex border-b border-border">
            <button 
                onClick={() => setActiveTab('pending')} 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'pending' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
                Pending Review
            </button>
            <button 
                onClick={() => setActiveTab('resolved')} 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'resolved' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
                Resolved (no event)
            </button>
        </div>

        {activeTab === 'resolved' && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <input
              type="search"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base text-sm w-full"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as FilterType)
                  setFilterValue('')
                  setStartDate('')
                  setEndDate('')
                }}
                className="input-base text-sm"
              >
                <option value="all">All filters</option>
                <option value="subject">Subject</option>
                <option value="status">Status</option>
                <option value="date_range">Date range</option>
              </select>
              {filterType === 'subject' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="input-base text-sm"
                >
                  <option value="">All subjects</option>
                  {uniqueSubjects.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
              {filterType === 'status' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="input-base text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="handled">Handled</option>
                  <option value="converted">Converted</option>
                </select>
              )}
              {filterType === 'date_range' && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-base text-sm" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-base text-sm" />
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredIncidents.length} resolved incident{filteredIncidents.length === 1 ? '' : 's'} not filed under an event
            </p>
          </div>
        )}

        <div className="bg-card border border-border shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cadet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Reporter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Summary</th>
                        <th className="px-6 py-3 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                    {filteredIncidents.length > 0 ? filteredIncidents.map(inc => (
                        <tr 
                            key={inc.id} 
                            className="hover:bg-muted/50 cursor-pointer transition-colors" 
                            onClick={() => { setSelectedIncident(inc); setModalMode('view'); }}
                        >
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(activeTab === 'resolved' ? (inc.resolved_at ?? inc.incident_time) : inc.incident_time).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{inc.subject.last_name}, {inc.subject.first_name}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{inc.reporter.last_name}, {inc.reporter.first_name}</td>
                            <td className="px-6 py-4 text-sm text-foreground truncate max-w-xs">{inc.description}</td>
                            <td className="px-6 py-4 text-right text-sm">
                                {inc.status === 'pending' && (
                                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs px-2 py-1 rounded">
                                        New
                                    </span>
                                )}
                                {inc.status === 'handled' && (
                                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs px-2 py-1 rounded">
                                        Handled
                                    </span>
                                )}
                                {inc.status === 'converted' && (
                                    <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded">
                                        Converted
                                    </span>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">No incidents found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {selectedIncident && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Incident Report</h2>
                            <p className="text-sm text-muted-foreground">{new Date(selectedIncident.incident_time).toLocaleString()} • {selectedIncident.location}</p>
                        </div>
                        <button onClick={() => setSelectedIncident(null)} className="text-muted-foreground hover:text-foreground text-2xl transition-colors">&times;</button>
                    </div>

                    <div className="bg-muted/30 p-4 rounded border border-border space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="font-bold text-muted-foreground">Subject:</span> <span className="text-foreground">{selectedIncident.subject.last_name}, {selectedIncident.subject.first_name}</span></div>
                            <div><span className="font-bold text-muted-foreground">Reported By:</span> <span className="text-foreground">{selectedIncident.reporter.last_name}, {selectedIncident.reporter.first_name}</span></div>
                        </div>
                        <div>
                            <span className="font-bold text-muted-foreground block mb-1">Description:</span>
                            <p className="text-foreground whitespace-pre-wrap">{selectedIncident.description}</p>
                        </div>
                        {selectedIncident.action_taken && (
                            <div>
                                <span className="font-bold text-muted-foreground block mb-1">Immediate Action Taken:</span>
                                <p className="text-foreground italic">{selectedIncident.action_taken}</p>
                            </div>
                        )}
                    </div>

                    {selectedIncident.status === 'pending' && roleLevel >= 65 && (
                        <div className="pt-4 border-t border-border">
                            {modalMode === 'view' && (
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setModalMode('resolve')} 
                                        className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-medium shadow-sm transition-colors"
                                    >
                                        Mark as Handled
                                    </button>
                                    <button 
                                        onClick={() => setModalMode('convert')} 
                                        className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-md hover:bg-destructive/90 font-medium shadow-sm transition-colors"
                                    >
                                        Convert to Demerit Report
                                    </button>
                                </div>
                            )}

                            {modalMode === 'resolve' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-green-600 dark:text-green-500">Resolution: Handled Locally</h3>
                                    <SearchableSelect 
                                        label="Handled By (Faculty)" 
                                        options={faculty} 
                                        value={handledById} 
                                        onChange={setHandledById} 
                                        placeholder="Select who corrected the cadet..."
                                    />
                                    <textarea 
                                        placeholder="Notes on how this was resolved..." 
                                        className="w-full border border-input rounded-md p-2 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
                                        rows={3} 
                                        value={resolutionNotes} 
                                        onChange={e => setResolutionNotes(e.target.value)} 
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setModalMode('view')} className="text-muted-foreground hover:text-foreground px-3 transition-colors">Back</button>
                                        <button onClick={handleResolve} disabled={loading || !resolutionNotes || !handledById} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">Confirm Resolution</button>
                                    </div>
                                </div>
                            )}

                            {modalMode === 'convert' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-destructive">Escalate: Issue Demerits</h3>
                                    
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs p-3 rounded border border-yellow-200 dark:border-yellow-900/50">
                                        <strong>Notice:</strong> Original incident notes will NOT be copied to the official report. 
                                        Please write a fresh, professional summary below suitable for the cadet&apos;s permanent record.
                                    </div>

                                    <SearchableSelect label="Select Infraction" options={richOffenseOptions} value={selectedOffenseId} onChange={setSelectedOffenseId} placeholder="Search offense..." />
                                    
                                    <textarea 
                                        placeholder="Write the official report description here..." 
                                        className="w-full border border-input rounded-md p-2 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
                                        rows={4} 
                                        value={resolutionNotes} 
                                        onChange={e => setResolutionNotes(e.target.value)} 
                                    />
                                    
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setModalMode('view')} className="text-muted-foreground hover:text-foreground px-3 transition-colors">Back</button>
                                        <button onClick={handleConvert} disabled={loading || !selectedOffenseId || !resolutionNotes} className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 disabled:opacity-50 transition-colors">Create Demerit Report</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedIncident.status !== 'pending' && (
                        <div className="pt-4 border-t border-border text-sm bg-muted/30 p-3 rounded">
                            <p><span className="font-bold text-muted-foreground">Status:</span> <span className="uppercase font-medium text-foreground">{selectedIncident.status}</span></p>
                            {selectedIncident.handler && <p><span className="font-bold text-muted-foreground">Handled By:</span> <span className="text-foreground">{selectedIncident.handler.last_name}, {selectedIncident.handler.first_name}</span></p>}
                            <p><span className="font-bold text-muted-foreground">Processed By:</span> <span className="text-foreground">{selectedIncident.resolver?.last_name || 'System'}</span></p>
                            <p><span className="font-bold text-muted-foreground">Notes:</span> <span className="text-foreground">{selectedIncident.resolution_notes}</span></p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  )
}
