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
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">{sport.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        {/* Replaced hardcoded season colors with generic badges */}
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-muted text-muted-foreground border border-border">
                            {sport.season}
                        </span>
                        <span className="text-sm text-muted-foreground">{sport.roster.length} Athletes • {sport.coaches.length} Coaches</span>
                    </div>
                </div>
                {!permissions.isCoach && permissions.isFaculty && sport.coaches.length === 0 && (
                    <button onClick={handleClaimCoach} disabled={loading} className="btn-primary disabled:opacity-50">
                        {loading ? 'Claiming...' : 'Claim Head Coach Position'}
                    </button>
                )}
                {permissions.isCoach && (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-bold border border-primary/20">
                        You are a Coach
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-8">
                    {['roster', 'schedule', 'staff'].map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as any)} 
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                                activeTab === tab 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* --- CONTENT: ROSTER --- */}
            {activeTab === 'roster' && (
                <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                        <h3 className="font-bold text-foreground">Active Roster</h3>
                        {permissions.isCoach && (
                            <button onClick={() => setIsAddCadetOpen(true)} className="text-sm bg-background border border-input px-3 py-1.5 rounded hover:bg-accent text-foreground transition-colors">+ Add Athlete</button>
                        )}
                    </div>
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cadet</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Company</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Tours</th>
                                {permissions.isCoach && <th className="px-6 py-3 text-right"></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {sport.roster.length > 0 ? sport.roster.map(c => (
                                // FIX: Replaced bg-amber-50 with bg-destructive/10 for semantic highlighting
                                <tr key={c.id} className={c.current_tours > 0 ? 'bg-destructive/10' : 'hover:bg-accent transition-colors'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-foreground">{c.last_name}, {c.first_name}</div>
                                        <div className="text-xs text-muted-foreground">{c.rank}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{c.grade_level}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{c.company || '-'}</td>
                                    
                                    {/* TOURS COLUMN */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {c.current_tours > 0 ? (
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-destructive text-destructive-foreground">
                                                {c.current_tours}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>

                                    {permissions.isCoach && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => { if(confirm('Remove from roster?')) removeFromRoster(c.id, sport.season) }} className="text-destructive hover:text-destructive/80">Remove</button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No athletes assigned.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- CONTENT: SCHEDULE --- */}
            {activeTab === 'schedule' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-foreground">Upcoming Events</h3>
                        {permissions.isCoach && (
                            <button onClick={() => setIsAddEventOpen(true)} className="btn-primary px-3 py-1.5 text-sm">+ New Event</button>
                        )}
                    </div>
                    <div className="grid gap-4">
                        {sport.events.length > 0 ? sport.events.map(e => (
                            <div key={e.id} className="bg-card p-4 rounded-lg border border-border shadow-sm flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-lg text-foreground">{e.title}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${e.is_home ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {e.is_home ? 'Home' : 'Away'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            {formatDate(e.date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {e.location || 'TBD'}
                                        </span>
                                    </div>
                                    {e.notes && <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded">{e.notes}</p>}
                                </div>
                                {permissions.isCoach && (
                                    <button onClick={() => { if(confirm('Delete event?')) removeEvent(e.id, sport.id) }} className="text-destructive hover:text-destructive/80 text-sm">&times;</button>
                                )}
                            </div>
                        )) : (
                            <p className="text-muted-foreground italic">No events scheduled.</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* --- CONTENT: STAFF --- */}
            {activeTab === 'staff' && (
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-foreground">Coaching Staff</h3>
                        {permissions.isCoach && (
                            <button onClick={() => setIsAddCoachOpen(true)} className="text-sm text-primary hover:underline">+ Add Assistant</button>
                        )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {sport.coaches.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {c.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{c.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase">{c.role}</p>
                                    </div>
                                </div>
                                {permissions.isCoach && c.user_id !== currentUserId && (
                                    <button onClick={() => { if(confirm('Remove Coach?')) removeCoach(c.id, sport.id) }} className="text-destructive hover:text-destructive/80 text-xs">Remove</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- EVENT MODAL --- */}
            {isAddEventOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-4 border border-border shadow-lg">
                        <h3 className="text-lg font-bold text-foreground">Create Event</h3>
                        <input type="text" placeholder="Title" className="input-base" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                        <div className="flex gap-2">
                            <input type="datetime-local" className="input-base" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                            <label className="flex items-center gap-2 border border-input px-3 rounded cursor-pointer hover:bg-accent">
                                <input type="checkbox" checked={newEvent.is_home} onChange={e => setNewEvent({...newEvent, is_home: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                                <span className="text-sm text-foreground whitespace-nowrap">Home Game</span>
                            </label>
                        </div>
                        <input type="text" placeholder="Location" className="input-base" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                        <textarea placeholder="Notes..." className="input-base" rows={2} value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAddEventOpen(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">Cancel</button>
                            <button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date || loading} className="btn-primary">Create</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isAddCadetOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-foreground">Add Athlete to Roster</h3>
                        <SearchableSelect label="Select Cadet" options={cadetOptions} value={selectedCadetId} onChange={setSelectedCadetId} placeholder="Search last name..." />
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsAddCadetOpen(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">Cancel</button>
                            <button onClick={handleAddCadet} disabled={!selectedCadetId || loading} className="btn-primary">Add</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isAddCoachOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-foreground">Add Assistant Coach</h3>
                        <SearchableSelect label="Select Faculty Member" options={facultyOptions} value={selectedCoachId} onChange={setSelectedCoachId} placeholder="Search faculty..." />
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsAddCoachOpen(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">Cancel</button>
                            <button onClick={handleAddCoach} disabled={!selectedCoachId || loading} className="btn-primary">Add Coach</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}