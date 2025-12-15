'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sport, GlobalEvent } from './actions'

export default function SportsDashboardClient({ 
    sports, 
    upcomingEvents, 
    unassignedCadets, 
    currentSeason 
}: { 
    sports: Sport[], 
    upcomingEvents: GlobalEvent[], 
    unassignedCadets: any[], 
    currentSeason: string 
}) {
    const [activeTab, setActiveTab] = useState<'current' | 'all' | 'unassigned'>('current')

    const currentSeasonSports = sports.filter(s => s.season === currentSeason)

    return (
        <div>
            {/* HERO */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary">⚡</span> Upcoming Action
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingEvents.length > 0 ? upcomingEvents.map(evt => (
                        <div key={evt.id} className="bg-primary text-primary-foreground rounded-xl p-5 shadow-lg relative overflow-hidden border border-primary/20">
                            <div className="absolute top-0 right-0 p-3 opacity-20 text-6xl font-black">{evt.sport_name[0]}</div>
                            <div className="relative z-10">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${evt.is_home ? 'bg-background text-foreground' : 'bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30'}`}>
                                    {evt.is_home ? 'Home' : 'Away'}
                                </span>
                                <h3 className="text-lg font-bold mt-2 leading-tight">{evt.title}</h3>
                                <p className="text-primary-foreground/80 text-sm mt-1">{new Date(evt.date).toLocaleDateString([], {weekday: 'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                                <p className="text-xs text-primary-foreground/60 uppercase tracking-widest mt-4 font-bold">{evt.sport_name}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-3 p-8 bg-muted/20 rounded-xl border border-dashed border-border text-center text-muted-foreground">
                            No upcoming games scheduled.
                        </div>
                    )}
                </div>
            </div>

            {/* TABS */}
            <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button 
                        onClick={() => setActiveTab('current')} 
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Current Season ({currentSeason})
                    </button>
                    <button 
                        onClick={() => setActiveTab('all')} 
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        All Sports
                    </button>
                    <button 
                        onClick={() => setActiveTab('unassigned')} 
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'unassigned' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Unassigned Cadets <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{unassignedCadets.length}</span>
                    </button>
                </nav>
            </div>

            {/* CONTENT: CURRENT */}
            {activeTab === 'current' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentSeasonSports.map(s => (
                        <Link key={s.id} href={`/sports/${s.id}`} className="group bg-card p-5 rounded-lg border border-border hover:border-primary transition-all shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-full">Active</span>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                Manage Roster & Schedule &rarr;
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* CONTENT: ALL */}
            {activeTab === 'all' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sports.map(s => (
                        <Link key={s.id} href={`/sports/${s.id}`} className={`block p-4 rounded-lg border transition-colors ${s.season === currentSeason ? 'bg-card border-primary/50 shadow-sm' : 'bg-muted/20 border-border opacity-75 hover:opacity-100 hover:bg-card'}`}>
                            <div className="flex justify-between">
                                <h3 className="font-bold text-foreground">{s.name}</h3>
                                <span className="text-xs font-medium text-muted-foreground uppercase">{s.season}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* CONTENT: UNASSIGNED */}
            {activeTab === 'unassigned' && (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="p-4 bg-muted/30 border-b border-border">
                        <h3 className="font-bold text-muted-foreground text-sm uppercase">Cadets not in {currentSeason} Sports</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0 p-4">
                        {unassignedCadets.length > 0 ? unassignedCadets.map(c => (
                            <div key={c.id} className="p-3 border-b border-border flex justify-between items-center hover:bg-accent transition-colors">
                                <div>
                                    <div className="text-sm font-medium text-foreground">{c.last_name}, {c.first_name}</div>
                                    <div className="text-xs text-muted-foreground">{c.company?.company_name || 'No Co'}</div>
                                </div>
                                <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">{c.cadet_rank}</span>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-muted-foreground text-sm italic col-span-full">All cadets assigned!</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}