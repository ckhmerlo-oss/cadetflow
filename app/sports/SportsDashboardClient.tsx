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
    // *** FIX: Added 'unassigned' to tab options
    const [activeTab, setActiveTab] = useState<'current' | 'all' | 'unassigned'>('current')

    const currentSeasonSports = sports.filter(s => s.season === currentSeason)

    return (
        <div>
            {/* HERO */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-indigo-600">⚡</span> Upcoming Action
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingEvents.length > 0 ? upcomingEvents.map(evt => (
                        <div key={evt.id} className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-20 text-6xl font-black">{evt.sport_name[0]}</div>
                            <div className="relative z-10">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${evt.is_home ? 'bg-white text-indigo-800' : 'bg-indigo-900 text-white border border-indigo-400'}`}>
                                    {evt.is_home ? 'Home' : 'Away'}
                                </span>
                                <h3 className="text-lg font-bold mt-2 leading-tight">{evt.title}</h3>
                                <p className="text-indigo-200 text-sm mt-1">{new Date(evt.date).toLocaleDateString([], {weekday: 'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                                <p className="text-xs text-indigo-300 uppercase tracking-widest mt-4 font-bold">{evt.sport_name}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-3 p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500">
                            No upcoming games scheduled.
                        </div>
                    )}
                </div>
            </div>

            {/* TABS */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('current')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        Current Season ({currentSeason})
                    </button>
                    <button onClick={() => setActiveTab('all')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        All Sports
                    </button>
                    {/* *** FIX: Moved Unassigned here *** */}
                    <button onClick={() => setActiveTab('unassigned')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'unassigned' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        Unassigned Cadets <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{unassignedCadets.length}</span>
                    </button>
                </nav>
            </div>

            {/* CONTENT: CURRENT */}
            {activeTab === 'current' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentSeasonSports.map(s => (
                        <Link key={s.id} href={`/sports/${s.id}`} className="group bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Active</span>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                        <Link key={s.id} href={`/sports/${s.id}`} className={`block p-4 rounded-lg border transition-colors ${s.season === currentSeason ? 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-900 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100'}`}>
                            <div className="flex justify-between">
                                <h3 className="font-bold text-gray-900 dark:text-white">{s.name}</h3>
                                <span className="text-xs font-medium text-gray-500 uppercase">{s.season}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* CONTENT: UNASSIGNED (Moved from Side-Panel) */}
            {activeTab === 'unassigned' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase">Cadets not in {currentSeason} Sports</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0 p-4">
                        {unassignedCadets.length > 0 ? unassignedCadets.map(c => (
                            <div key={c.id} className="p-3 border-b dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{c.last_name}, {c.first_name}</div>
                                    <div className="text-xs text-gray-500">{c.company?.company_name || 'No Co'}</div>
                                </div>
                                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{c.cadet_rank}</span>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-gray-500 text-sm italic col-span-full">All cadets assigned!</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}