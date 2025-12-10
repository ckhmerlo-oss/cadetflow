'use client'

import { useState, useEffect } from 'react'
import { 
    SportDetail, 
    claimHeadCoach, 
    addAssistantCoach, 
    removeCoach, 
    addToRoster, 
    removeFromRoster, 
    addEvent, 
    removeEvent,
    searchCadets,
    searchFaculty
} from '../actions'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'

export default function SportClient({ 
    sport, 
    currentUserId, 
    permissions 
}: { 
    sport: SportDetail, 
    currentUserId: string, 
    permissions: { isCoach: boolean, isFaculty: boolean } 
}) {
    const [activeTab, setActiveTab] = useState<'roster' | 'schedule' | 'staff'>('roster')
    const [loading, setLoading] = useState(false)
    
    const [cadetOptions, setCadetOptions] = useState<SelectOption[]>([])
    const [facultyOptions, setFacultyOptions] = useState<SelectOption[]>([])

    const [isAddCadetOpen, setIsAddCadetOpen] = useState(false)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [isAddCoachOpen, setIsAddCoachOpen] = useState(false)

    const [selectedCadetId, setSelectedCadetId] = useState('')
    const [selectedCoachId, setSelectedCoachId] = useState('')
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', notes: '', is_home: true })

    useEffect(() => {
        if (permissions.isCoach) {
            searchCadets('').then(setCadetOptions)
            searchFaculty('').then(setFacultyOptions)
        }
    }, [permissions.isCoach])

    // --- HANDLERS ---
    const handleClaimCoach = async () => {
        if (!confirm(`Are you sure you want to claim the Head Coach position for ${sport.name}?`)) return;
        setLoading(true)
        const { error } = await claimHeadCoach(sport.id)
        setLoading(false)
        if (error) alert(error)
    }

    const handleAddCoach = async () => {
        setLoading(true)
        const { error } = await addAssistantCoach(sport.id, selectedCoachId)
        setLoading(false)
        if (error) alert(error)
        else { setIsAddCoachOpen(false); setSelectedCoachId(''); }
    }

    const handleAddCadet = async () => {
        setLoading(true)
        const { error } = await addToRoster(selectedCadetId, sport.name, sport.season)
        setLoading(false)
        if (error) alert(error)
        else { setIsAddCadetOpen(false); setSelectedCadetId(''); }
    }

    const handleAddEvent = async () => {
        setLoading(true)
        
        // *** FIX: Timezone ***
        // Convert the local datetime-local string to a UTC ISO string before sending.
        // If user selects 6pm (18:00) locally, this becomes ~23:00 UTC (depending on TZ).
        // This ensures it is saved as an absolute instant.
        const isoDate = new Date(newEvent.date).toISOString();

        const { error } = await addEvent(sport.id, {
            ...newEvent,
            event_date: isoDate 
        })
        setLoading(false)
        if (error) alert(error)
        else { setIsAddEventOpen(false); setNewEvent({ title: '', date: '', location: '', notes: '', is_home: true }); }
    }

    const formatDate = (d: string) => new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{sport.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            sport.season === 'Fall' ? 'bg-orange-100 text-orange-800' :
                            sport.season === 'Winter' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                        }`}>
                            {sport.season}
                        </span>
                        <span className="text-sm text-gray-500">{sport.roster.length} Athletes • {sport.coaches.length} Coaches</span>
                    </div>
                </div>
                {!permissions.isCoach && permissions.isFaculty && sport.coaches.length === 0 && (
                    <button onClick={handleClaimCoach} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50">
                        {loading ? 'Claiming...' : 'Claim Head Coach Position'}
                    </button>
                )}
                {permissions.isCoach && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                        You are a Coach
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {['roster', 'schedule', 'staff'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'}`}>{tab}</button>
                    ))}
                </nav>
            </div>

            {/* --- CONTENT: ROSTER (Removed Demerits, Fixed Tours) --- */}
            {activeTab === 'roster' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Active Roster</h3>
                        {permissions.isCoach && (
                            <button onClick={() => setIsAddCadetOpen(true)} className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-600">+ Add Athlete</button>
                        )}
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadet</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tours</th>
                                {permissions.isCoach && <th className="px-6 py-3 text-right"></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sport.roster.length > 0 ? sport.roster.map(c => (
                                <tr key={c.id} className={c.current_tours > 0 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{c.last_name}, {c.first_name}</div>
                                        <div className="text-xs text-gray-500">{c.rank}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.grade_level}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.company || '-'}</td>
                                    
                                    {/* TOURS COLUMN */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {c.current_tours > 0 ? (
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                {c.current_tours}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {permissions.isCoach && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => { if(confirm('Remove from roster?')) removeFromRoster(c.id, sport.season) }} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Remove</button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No athletes assigned.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- CONTENT: SCHEDULE --- */}
            {activeTab === 'schedule' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">Upcoming Events</h3>
                        {permissions.isCoach && (
                            <button onClick={() => setIsAddEventOpen(true)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700">+ New Event</button>
                        )}
                    </div>
                    <div className="grid gap-4">
                        {sport.events.length > 0 ? sport.events.map(e => (
                            <div key={e.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{e.title}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${e.is_home ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {e.is_home ? 'Home' : 'Away'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            {formatDate(e.date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {e.location || 'TBD'}
                                        </span>
                                    </div>
                                    {e.notes && <p className="text-sm text-gray-500 mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">{e.notes}</p>}
                                </div>
                                {permissions.isCoach && (
                                    <button onClick={() => { if(confirm('Delete event?')) removeEvent(e.id, sport.id) }} className="text-red-500 hover:text-red-700 text-sm">&times;</button>
                                )}
                            </div>
                        )) : (
                            <p className="text-gray-500 italic">No events scheduled.</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* --- CONTENT: STAFF --- */}
            {activeTab === 'staff' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Coaching Staff</h3>
                        {permissions.isCoach && (
                            <button onClick={() => setIsAddCoachOpen(true)} className="text-sm text-indigo-600 hover:underline">+ Add Assistant</button>
                        )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {sport.coaches.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {c.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-gray-500 uppercase">{c.role}</p>
                                    </div>
                                </div>
                                {permissions.isCoach && c.user_id !== currentUserId && (
                                    <button onClick={() => { if(confirm('Remove Coach?')) removeCoach(c.id, sport.id) }} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- EVENT MODAL --- */}
            {isAddEventOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="text-lg font-bold dark:text-white">Create Event</h3>
                        <input type="text" placeholder="Title" className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                        <div className="flex gap-2">
                            <input type="datetime-local" className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                            <label className="flex items-center gap-2 border px-3 rounded dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input type="checkbox" checked={newEvent.is_home} onChange={e => setNewEvent({...newEvent, is_home: e.target.checked})} />
                                <span className="text-sm dark:text-white whitespace-nowrap">Home Game</span>
                            </label>
                        </div>
                        <input type="text" placeholder="Location" className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                        <textarea placeholder="Notes..." className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-600" rows={2} value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAddEventOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                            <button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date || loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Create</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ... Other modals (Cadet/Coach) remain the same ... */}
            
            {isAddCadetOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Add Athlete to Roster</h3>
                        <SearchableSelect label="Select Cadet" options={cadetOptions} value={selectedCadetId} onChange={setSelectedCadetId} placeholder="Search last name..." />
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsAddCadetOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                            <button onClick={handleAddCadet} disabled={!selectedCadetId || loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Add</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isAddCoachOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Add Assistant Coach</h3>
                        <SearchableSelect label="Select Faculty Member" options={facultyOptions} value={selectedCoachId} onChange={setSelectedCoachId} placeholder="Search faculty..." />
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsAddCoachOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                            <button onClick={handleAddCoach} disabled={!selectedCoachId || loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Add Coach</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}