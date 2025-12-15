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
  grade_level?: string | null;
  room_number?: string | null; 
  term_demerits?: number;
  year_demerits?: number;
  current_tour_balance?: number;
  has_star_tours?: boolean;
  conduct_status?: string;
  recent_reports?: RecentReport[] | null;
  email?: string; 
  role_level?: number;
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
  canManage: boolean 
}

const CONDUCT_ORDER = ['Exemplary', 'Commendable', 'Satisfactory', 'Deficient', 'Unsatisfactory'];

export default function RosterClient({ initialData, canEditProfiles, companies, onReassign, variant = 'cadet', canManage }: RosterClientProps) {
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

  // --- Helpers ---
  const getCompanyAbbr = (name: string | null) => {
      if (!name) return '-';
      if (name === 'Battalion Staff') return 'BN';
      return name.charAt(0);
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
      if (!status) return 'bg-muted text-muted-foreground';
      if (status === 'Exemplary') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      if (status === 'Commendable') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (status === 'Satisfactory') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      if (status === 'Deficient') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      return 'bg-destructive/10 text-destructive';
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  }

  const uniqueCompanies = useMemo(() => [...new Set(initialData.map(c => c.company_name).filter(Boolean).sort())], [initialData]);
  const uniqueGrades = useMemo(() => [...new Set(initialData.map(c => c.grade_level).filter(Boolean).sort())], [initialData]);

  return (
    <div className="bg-card shadow-sm border border-border rounded-lg overflow-hidden">
      
      {/* Filters */}
      <div id="roster-controls" className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-border no-print">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={variant === 'cadet' ? "Search..." : "Search email..."} className="w-full p-2 border border-input rounded-md bg-background text-foreground" />
        <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full p-2 border border-input rounded-md bg-background text-foreground">
          <option value="all">All Companies</option>
          {uniqueCompanies.map(co => <option key={String(co)} value={String(co)}>{String(co)}</option>)}
        </select>
        
        {variant === 'cadet' && (
          <>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="w-full p-2 border border-input rounded-md bg-background text-foreground">
              <option value="all">All Grades</option>
              {uniqueGrades.map(g => <option key={String(g)} value={String(g)}>{String(g)}</option>)}
            </select>
            <select value={filterConduct} onChange={(e) => setFilterConduct(e.target.value)} className="w-full p-2 border border-input rounded-md bg-background text-foreground">
              <option value="all">All Conduct</option>
              {CONDUCT_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </>
        )}
      </div>

      <table id="roster-table-content" className="min-w-full divide-y divide-border printable-table">
        <thead className="bg-muted/50">
          <tr>
            {/* Rank: Hidden on Mobile */}
            {variant === 'cadet' ? (
                <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('cadet_rank')}>Rank {getSortIndicator('cadet_rank')}</th>
            ) : (
                <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('email')}>Email {getSortIndicator('email')}</th>
            )}
            
            {/* Name: Visible Always */}
            <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('last_name')}>Name {getSortIndicator('last_name')}</th>
            
            {/* Company: Visible Always (Abbreviated on Mobile) */}
            <th scope="col" className="px-2 md:px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('company_name')}>
                <span className="md:hidden">Co</span>
                <span className="hidden md:inline">Company</span>
                {getSortIndicator('company_name')}
            </th>
            
            {/* Grade: Visible Always (Short header on Mobile) */}
            {variant === 'cadet' && (
              <th scope="col" className="px-2 md:px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('grade_level')}>
                <span className="md:hidden">Gr</span>
                <span className="hidden md:inline">Grade</span>
                {getSortIndicator('grade_level')}
              </th>
            )}
            
            {/* Role: Hidden on Mobile */}
            <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('role_name')}>Role {getSortIndicator('role_name')}</th>
            
            {variant === 'cadet' && (
              <>
                {/* Room: Hidden on Mobile */}
                <th scope="col" className="hidden xl:table-cell px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('room_number')}>Room {getSortIndicator('room_number')}</th>
                
                {/* Conduct: Hidden on Mobile */}
                <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground" onClick={() => requestSort('conduct_status')}>Conduct {getSortIndicator('conduct_status')}</th>
              </>
            )}
            
            {/* Expand Arrow */}
            <th scope="col" className="relative px-4 md:px-6 py-3"><span className="sr-only">Expand</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredAndSortedCadets.map((person) => {
            const isAdmin = variant === 'faculty' && (person.role_level || 0) >= 90;
            
            return (
            <React.Fragment key={person.id}>
              <tr 
                onClick={() => handleRowClick(person.id)} 
                className={`
                    hover:bg-accent cursor-pointer transition-colors
                    ${isAdmin ? 'bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-400' : ''}
                    ${openCadetId === person.id ? 'bg-muted/50' : ''}
                `}
              >
                {/* RANK / EMAIL */}
                {variant === 'cadet' ? (
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{person.cadet_rank || '-'}</td>
                ) : (
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{person.email || '-'}</td>
                )}

                {/* NAME */}
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {person.last_name}, {person.first_name}
                    {isAdmin && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wide">Admin</span>}
                </td>

                {/* COMPANY (Abbr on Mobile) */}
                <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <span className="md:hidden font-bold">{getCompanyAbbr(person.company_name)}</span>
                    <span className="hidden md:inline">{person.company_name || '-'}</span>
                </td>
                
                {variant === 'cadet' && (
                  <>
                    {/* GRADE */}
                    <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{person.grade_level || '-'}</td>
                  </>
                )}

                {/* ROLE (Hidden Mobile) */}
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{person.role_name}</td>

                {variant === 'cadet' && (
                  <>
                    {/* ROOM (Hidden Mobile) */}
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{person.room_number || '-'}</td>
                    
                    {/* CONDUCT (Hidden Mobile) */}
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getConductColor(person.conduct_status)}`}>{person.conduct_status}</span></td>
                  </>
                )}
                
                {/* ARROW */}
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <span className="text-muted-foreground">
                     {openCadetId === person.id ? '▲' : '▼'}
                   </span>
                </td>
              </tr>
              
              {/* EXPANDED VIEW */}
              {openCadetId === person.id && (
                <tr className="bg-muted/30 print-hide">
                  <td colSpan={variant === 'cadet' ? 8 : 5} className="px-3 md:px-6 py-4 md:py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      
                      {/* COL 1: Metrics (Compact Grid on Mobile) */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {variant === 'cadet' ? 'Key Metrics' : 'Faculty Info'}
                        </h4>
                        {variant === 'cadet' ? (
                          <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                            <div className="p-2 bg-card rounded border border-border text-center md:text-left md:flex md:justify-between md:items-center">
                              <span className="block md:inline text-[10px] md:text-sm text-muted-foreground uppercase md:normal-case">Term</span>
                              <span className="block md:inline text-sm md:text-base font-bold text-foreground">{person.term_demerits}</span>
                            </div>
                            <div className="p-2 bg-card rounded border border-border text-center md:text-left md:flex md:justify-between md:items-center">
                              <span className="block md:inline text-[10px] md:text-sm text-muted-foreground uppercase md:normal-case">Year</span>
                              <span className="block md:inline text-sm md:text-base font-bold text-foreground">{person.year_demerits}</span>
                            </div>
                            <div className="p-2 bg-card rounded border border-border text-center md:text-left md:flex md:justify-between md:items-center">
                              <span className="block md:inline text-[10px] md:text-sm text-muted-foreground uppercase md:normal-case">Tours</span>
                              <span className={`block md:inline text-sm md:text-base font-bold ${person.has_star_tours || (person.current_tour_balance || 0) > 0 ? 'text-destructive' : 'text-foreground'}`}>
                                {person.has_star_tours ? '*' : person.current_tour_balance}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-card rounded border border-border text-sm">
                            <p className="truncate text-foreground"><strong>Email:</strong> {person.email}</p>
                          </div>
                        )}
                      </div>

                      {/* COL 2: Activity (Compact List) */}
                      <div className="space-y-2">
                        {variant === 'cadet' && (
                            <>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</h4>
                            {person.recent_reports && person.recent_reports.length > 0 ? (
                              <div className="bg-card rounded border border-border divide-y divide-border">
                                {person.recent_reports.map(report => (
                                  <div key={report.id} className="p-2 flex justify-between items-center text-xs">
                                    <div className="truncate pr-2">
                                      <span className="font-medium text-foreground">{report.offense_name}</span>
                                      <span className="ml-2 text-muted-foreground uppercase text-[10px]">{report.status.replace('_', ' ')}</span>
                                    </div>
                                    <span className="text-muted-foreground whitespace-nowrap">{formatTimeAgo(report.created_at)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 bg-card rounded border border-border text-center text-xs text-muted-foreground italic">
                                No recent reports.
                              </div>
                            )}
                            </>
                        )}
                      </div>

                      {/* COL 3: Actions (Compact Buttons) */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Link href={`/profile/${person.id}`} className="block w-full text-center py-2 bg-card border border-border text-foreground text-sm font-medium rounded shadow-sm hover:bg-accent">
                            View Profile
                          </Link>
                          {variant === 'cadet' && (
                            <Link href={`/ledger/${person.id}`} className="block w-full text-center py-2 bg-card border border-border text-foreground text-sm font-medium rounded shadow-sm hover:bg-accent">
                              View Ledger
                            </Link>
                          )}
                          {(canManage || canEditProfiles) && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onReassign(person.id); }} 
                                className="block w-full text-center py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium rounded shadow-sm hover:bg-primary/20"
                            >
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