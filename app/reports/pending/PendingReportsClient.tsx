'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ReportWithNames } from './page'

type SortKey = 'created_at' | 'subject' | 'offense' | 'submitter' | 'group';

export default function PendingReportsClient({ initialReports }: { initialReports: ReportWithNames[] }) {
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' })

  // Extract unique groups for the filter dropdown
  const uniqueGroups = useMemo(() => {
      const groups = new Set(initialReports.map(r => r.group?.group_name || 'Unknown'));
      return Array.from(groups).sort();
  }, [initialReports]);

  // Main Logic: Filter -> Sort
  const processedReports = useMemo(() => {
    let result = [...initialReports];

    // 1. Filter by Search Text
    if (search) {
        const s = search.toLowerCase();
        result = result.filter(r => 
          r.subject?.last_name.toLowerCase().includes(s) ||
          r.subject?.first_name.toLowerCase().includes(s) ||
          r.offense_type?.offense_name.toLowerCase().includes(s)
        );
    }

    // 2. Filter by Approval Group
    if (filterGroup !== 'all') {
        result = result.filter(r => (r.group?.group_name || 'Unknown') === filterGroup);
    }

    // 3. Sort
    result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortConfig.key) {
            case 'created_at':
                return sortConfig.direction === 'asc' 
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'subject':
                aValue = a.subject?.last_name || '';
                bValue = b.subject?.last_name || '';
                break;
            case 'offense':
                aValue = a.offense_type?.offense_name || '';
                bValue = b.offense_type?.offense_name || '';
                break;
            case 'submitter':
                aValue = a.submitter?.last_name || '';
                bValue = b.submitter?.last_name || '';
                break;
            case 'group':
                aValue = a.group?.group_name || '';
                bValue = b.group?.group_name || '';
                break;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return result;
  }, [initialReports, search, filterGroup, sortConfig]);

  // Sort Handler
  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' }) => {
      if (!active) return <span className="ml-1 text-gray-400">↕</span>;
      return <span className="ml-1 text-indigo-600 dark:text-indigo-400">{direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatName = (p: { first_name: string, last_name: string } | null) => p ? `${p.last_name}, ${p.first_name}` : 'N/A'
  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  return (
    <div className="space-y-4">
        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
                <input
                    type="text"
                    placeholder="Search cadet or infraction..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                />
            </div>
            <div className="w-full md:w-64">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Stage</label>
                <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                    <option value="all">All Groups</option>
                    {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
        </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('created_at')}
                >
                    Date <SortIcon active={sortConfig.key === 'created_at'} direction={sortConfig.direction} />
                </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('subject')}
                >
                    Subject <SortIcon active={sortConfig.key === 'subject'} direction={sortConfig.direction} />
                </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('offense')}
                >
                    Infraction <SortIcon active={sortConfig.key === 'offense'} direction={sortConfig.direction} />
                </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('submitter')}
                >
                    Submitter <SortIcon active={sortConfig.key === 'submitter'} direction={sortConfig.direction} />
                </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => requestSort('group')}
                >
                    Waiting For <SortIcon active={sortConfig.key === 'group'} direction={sortConfig.direction} />
                </th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedReports.length > 0 ? processedReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{formatName(report.subject)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{report.offense_type?.offense_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatName(report.submitter)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {report.group?.group_name || 'Processing...'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/report/${report.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                      View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-500 dark:text-gray-400">
          Showing {processedReports.length} reports
        </div>
      </div>
    </div>
  )
}