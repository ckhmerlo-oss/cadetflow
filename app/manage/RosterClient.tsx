'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'

// --- Type Definitions ---
type RecentReport = {
  id: string;
  offense_name: string;
  status: string;
  created_at: string;
  appeal_status: string | null;
}

export type RosterCadet = {
  id: string;
  first_name: string;
  last_name: string;
  cadet_rank: string | null;
  company_name: string | null;
  role_name: string | null;
  // These may be null/0 for Faculty
  grade_level?: string | null;
  room_number?: string | null; 
  term_demerits?: number;
  year_demerits?: number;
  current_tour_balance?: number;
  has_star_tours?: boolean;
  conduct_status?: string;
  recent_reports?: RecentReport[] | null;
  email?: string; 
  role_level?: number; // Added for Admin check
}

type Company = { id: string; company_name: string }
type SortKey = keyof RosterCadet;
type SortDirection = 'ascending' | 'descending';

type RosterClientProps = {
  initialData: RosterCadet[]
  canEditProfiles: boolean
  companies: Company[] 
  onReassign: (cadetId: string) => void
  variant?: 'cadet' | 'faculty'
}

const CONDUCT_ORDER = ['Exemplary', 'Commendable', 'Satisfactory', 'Deficient', 'Unsatisfactory'];

export default function RosterClient({ initialData, canEditProfiles, companies, onReassign, variant = 'cadet' }: RosterClientProps) {
  const [openCadetId, setOpenCadetId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterConduct, setFilterConduct] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: SortDirection }>({ 
    key: 'last_name', 
    direction: 'ascending' 
  });
  
  const handleRowClick = (cadetId: string) => {
    setOpenCadetId(prevId => (prevId === cadetId ? null : cadetId))
  }

  const filteredAndSortedCadets = useMemo(() => {
    let filteredData = [...initialData];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.first_name.toLowerCase().includes(lowerSearch) ||
        item.last_name.toLowerCase().includes(lowerSearch) ||
        (item.cadet_rank && item.cadet_rank.toLowerCase().includes(lowerSearch)) ||
        (item.role_name && item.role_name.toLowerCase().includes(lowerSearch)) ||
        (item.email && item.email.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterCompany !== 'all') {
      filteredData = filteredData.filter(c => c.company_name === filterCompany);
    }
    // Only apply these filters for cadets
    if (variant === 'cadet') {
      if (filterGrade !== 'all') filteredData = filteredData.filter(c => c.grade_level === filterGrade);
      if (filterConduct !== 'all') filteredData = filteredData.filter(c => c.conduct_status === filterConduct);
    }

    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      return aValue < bValue 
        ? (sortConfig.direction === 'ascending' ? -1 : 1) 
        : (aValue > bValue ? (sortConfig.direction === 'ascending' ? 1 : -1) : 0);
    });

    return filteredData;
  }, [initialData, searchTerm, filterCompany, filterGrade, filterConduct, sortConfig, variant]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortKey) => (sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : null);

  const getConductColor = (status?: string) => {
      if (!status) return 'bg-gray-100 text-gray-800';
      if (status === 'Exemplary') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      if (status === 'Commendable') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (status === 'Satisfactory') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      if (status === 'Deficient') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  const getAppealBadge = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'approved': return <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Granted</span>;
      case 'rejected_final': return <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Denied</span>;
      case 'pending_issuer':
      case 'pending_chain':
      case 'pending_commandant': return <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Pending</span>;
      default: return null;
    }
  }

  const getRecentReportStatus = (report: RecentReport) => {
    const status = report.status;
    if (status === 'pulled') return <span className="text-xs text-gray-500 dark:text-gray-400">Pulled</span>
    if (status === 'rejected') return <span className="text-xs text-red-600 dark:text-red-400">Rejected</span>
    if (status === 'completed') return <span className="text-xs text-green-600 dark:text-green-400">Approved</span>
    return <span className="text-xs text-yellow-600 dark:text-yellow-400">{status.replace('_', ' ')}</span>
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  }

  const uniqueCompanies = useMemo(() => [...new Set(initialData.map(c => c.company_name).filter(Boolean).sort())], [initialData]);
  const uniqueGrades = useMemo(() => [...new Set(initialData.map(c => c.grade_level).filter(Boolean).sort())], [initialData]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      
      {/* Filters */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-200 dark:border-gray-700 no-print">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={variant === 'cadet' ? "Search by name, role, room..." : "Search by name, role, email..."} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white" />
        <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white">
          <option value="all">All Companies</option>
          {uniqueCompanies.map(co => <option key={String(co)} value={String(co)}>{String(co)}</option>)}
        </select>
        
        {variant === 'cadet' && (
          <>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white">
              <option value="all">All Grades</option>
              {uniqueGrades.map(g => <option key={String(g)} value={String(g)}>{String(g)}</option>)}
            </select>
            <select value={filterConduct} onChange={(e) => setFilterConduct(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white">
              <option value="all">All Conduct</option>
              {CONDUCT_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </>
        )}
      </div>

      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 printable-table">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            {variant === 'cadet' ? (
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('cadet_rank')}>Rank {getSortIndicator('cadet_rank')}</th>
            ) : (
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('email')}>Email {getSortIndicator('email')}</th>
            )}
            
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('last_name')}>Name {getSortIndicator('last_name')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('company_name')}>Company {getSortIndicator('company_name')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('role_name')}>Role {getSortIndicator('role_name')}</th>
            
            {variant === 'cadet' && (
              <>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('grade_level')}>Grade {getSortIndicator('grade_level')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('room_number')}>Room # {getSortIndicator('room_number')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('conduct_status')}>Conduct {getSortIndicator('conduct_status')}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAndSortedCadets.map((person) => {
            // Visual identifier for admins in Faculty view
            const isAdmin = variant === 'faculty' && (person.role_level || 0) >= 90;
            
            return (
            <React.Fragment key={person.id}>
              <tr 
                onClick={() => handleRowClick(person.id)} 
                className={`
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors
                    ${isAdmin ? 'bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-400' : ''}
                `}
              >
                {/* Column 1: Rank (Cadet) or Email (Faculty) */}
                {variant === 'cadet' ? (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{person.cadet_rank || '-'}</td>
                ) : (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">{person.email || '-'}</td>
                )}

                {/* Name Column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {person.last_name}, {person.first_name}
                    {isAdmin && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wide">
                            Admin
                        </span>
                    )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{person.company_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{person.role_name}</td>
                
                {variant === 'cadet' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{person.grade_level || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{person.room_number || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getConductColor(person.conduct_status)}`}>{person.conduct_status}</span></td>
                  </>
                )}
              </tr>
              {openCadetId === person.id && (
                <tr className="bg-gray-50 dark:bg-gray-700/30 print-hide">
                  <td colSpan={variant === 'cadet' ? 7 : 4} className="px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      
                      {/* Left Info Block */}
                      <div className="flex-grow space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {variant === 'cadet' ? 'Academic & Disciplinary' : 'Faculty Details'}
                        </h4>
                        {variant === 'cadet' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-center"><span className="block text-xs text-gray-500 uppercase">Demerits (Term)</span><span className="text-lg font-bold">{person.term_demerits}</span></div>
                            <div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-center"><span className="block text-xs text-gray-500 uppercase">Demerits (Year)</span><span className="text-lg font-bold">{person.year_demerits}</span></div>
                            <div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-center"><span className="block text-xs text-gray-500 uppercase">Tour Balance</span><span className={`text-lg font-bold ${person.has_star_tours ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{person.has_star_tours ? '*' : person.current_tour_balance}</span></div>
                          </div>
                        ) : (
                          <div className="p-4 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-200"><strong>Email:</strong> {person.email || 'No email'}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-200 mt-1"><strong>System ID:</strong> <span className="font-mono text-xs text-gray-500">{person.id}</span></p>
                            {isAdmin && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold">System Administrator (Level {person.role_level})</p>}
                          </div>
                        )}
                      </div>

                      {/* Right Actions Block */}
                      <div className="flex-shrink-0 md:w-48 space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Link href={`/profile/${person.id}`} className="w-full text-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">View Profile</Link>
                          {variant === 'cadet' && (
                            <Link href={`/ledger/${person.id}`} className="w-full text-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">View Ledger</Link>
                          )}
                          {canEditProfiles && (
                            <button onClick={() => onReassign(person.id)} className="w-full text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-md shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                              Re-Assign
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
          })}
        </tbody>
      </table>
    </div>
  )
}