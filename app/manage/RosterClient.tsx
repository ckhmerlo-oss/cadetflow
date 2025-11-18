'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { GRADE_LEVELS } from '@/app/profile/constants' // Import grades for filter

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
  grade_level: string | null;
  room_number: string | null; 
  term_demerits: number;
  year_demerits: number;
  current_tour_balance: number;
  has_star_tours: boolean;
  conduct_status: string;
  recent_reports: RecentReport[] | null;
}

export type ApprovalGroup = {
  id: string;
  group_name: string;
  next_approver_group_id: string | null;
  company_id: string | null; // New
  is_final_authority: boolean; // New
};

type Company = { id: string; company_name: string }
type SortKey = keyof RosterCadet;
type SortDirection = 'ascending' | 'descending';

type RosterClientProps = {
  initialData: RosterCadet[]
  canEditProfiles: boolean
  companies: Company[] 
}
// --- End Type Definitions ---

const CONDUCT_ORDER = [
  'Exemplary',
  'Commendable',
  'Satisfactory',
  'Deficient',
  'Unsatisfactory'
];

export default function RosterClient({ initialData, canEditProfiles, companies }: RosterClientProps) {
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
      filteredData = filteredData.filter(cadet =>
        cadet.first_name.toLowerCase().includes(lowerSearch) ||
        cadet.last_name.toLowerCase().includes(lowerSearch) ||
        (cadet.cadet_rank && cadet.cadet_rank.toLowerCase().includes(lowerSearch)) ||
        (cadet.room_number && cadet.room_number.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterCompany !== 'all') {
      filteredData = filteredData.filter(cadet => cadet.company_name === filterCompany);
    }
    if (filterGrade !== 'all') {
      filteredData = filteredData.filter(cadet => cadet.grade_level === filterGrade);
    }
    if (filterConduct !== 'all') {
      filteredData = filteredData.filter(cadet => cadet.conduct_status === filterConduct);
    }

    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return filteredData;
  }, [initialData, searchTerm, filterCompany, filterGrade, filterConduct, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const getConductColor = (status: string) => {
      if (status === 'Exemplary') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      if (status === 'Commendable') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (status === 'Satisfactory') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      if (status === 'Deficient') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  const getAppealBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'approved':
        return <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Granted</span>;
      case 'rejected_final':
        return <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Denied</span>;
      case 'pending_issuer':
      case 'pending_chain':
      case 'pending_commandant':
        return <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Pending</span>;
      default:
        return null;
    }
  }

  // <<< NEW: Helper for recent report status >>>
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

  const uniqueCompanies = useMemo(() => 
    [...new Set(initialData.map(c => c.company_name).filter((c): c is string => !!c).sort())], 
  [initialData]);
  
  const uniqueGrades = useMemo(() => 
    [...new Set(initialData.map(c => c.grade_level).filter((g): g is string => !!g).sort())], 
  [initialData]);
  
  const uniqueConducts = useMemo(() => {
    const presentStatuses = new Set(initialData.map(c => c.conduct_status));
    return CONDUCT_ORDER.filter(status => presentStatuses.has(status));
  }, [initialData]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-200 dark:border-gray-700 no-print">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, rank, room..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
        />
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Companies</option>
          {uniqueCompanies.map(co => <option key={co} value={co}>{co}</option>)}
        </select>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Grades</option>
          {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={filterConduct}
          onChange={(e) => setFilterConduct(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Conduct</option>
          {uniqueConducts.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 printable-table">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('cadet_rank')}>
              Rank {getSortIndicator('cadet_rank')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('last_name')}>
              Name {getSortIndicator('last_name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('company_name')}>
              Company {getSortIndicator('company_name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('grade_level')}>
              Grade {getSortIndicator('grade_level')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('room_number')}>
              Room # {getSortIndicator('room_number')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('conduct_status')}>
              Conduct {getSortIndicator('conduct_status')}
            </th>
            <th scope="col" className="relative px-6 py-3 print-hide"><span className="sr-only">Expand</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAndSortedCadets.map((cadet) => (
            <React.Fragment key={cadet.id}>
              <tr 
                onClick={() => handleRowClick(cadet.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{cadet.cadet_rank || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{cadet.last_name}, {cadet.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{cadet.company_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{cadet.grade_level || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{cadet.room_number || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getConductColor(cadet.conduct_status)}`}>
                    {cadet.conduct_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print-hide">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {openCadetId === cadet.id ? 'Hide' : 'Details'}
                  </span>
                </td>
              </tr>
              {/* Accordion Dropdown Content */}
              {openCadetId === cadet.id && (
                <tr key={`${cadet.id}-dropdown`} className="bg-gray-50 dark:bg-gray-700/30 print-hide">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Key Metrics */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Key Metrics</h4>
                        <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Term Demerits</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{cadet.term_demerits}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Year Demerits</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{cadet.year_demerits}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tour Balance</span>
                          <span className={`text-sm font-bold ${cadet.has_star_tours || cadet.current_tour_balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {cadet.has_star_tours ? '*' : cadet.current_tour_balance}
                          </span>
                        </div>
                      </div>

                      {/* Recent Items */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Recent Reports</h4>
                        {cadet.recent_reports && cadet.recent_reports.length > 0 ? (
                          <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
                            {cadet.recent_reports.map((report: RecentReport) => (
                              <div key={report.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <p className={`font-medium text-gray-800 dark:text-gray-200 flex items-center ${report.status === 'pulled' ? 'line-through' : ''}`}>
                                    {report.offense_name || 'Report'}
                                    {/* <<< RENDER APPEAL BADGE >>> */}
                                    {getAppealBadge(report.appeal_status)}
                                  </p>
                                  {/* <<< RENDER STATUS PILL >>> */}
                                  <p>{getRecentReportStatus(report)}</p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(report.created_at)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No recent reports found.</p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Link href={`/profile/${cadet.id}`} className="w-full text-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            View Full Profile
                          </Link>
                          <Link href={`/ledger/${cadet.id}`} className="w-full text-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            View Full Ledger
                          </Link>
                          {canEditProfiles && (
                            <Link href={`/profile/${cadet.id}`} className="w-full text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-md shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                              Edit Profile
                            </Link>
                          )}
                        </div>
                      </div>

                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}