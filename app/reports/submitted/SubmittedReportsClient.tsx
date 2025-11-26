'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SubmittedReport } from './page'

type SortKey = 'created_at' | 'subject' | 'offense' | 'status';

export default function SubmittedReportsClient({ initialReports }: { initialReports: SubmittedReport[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' })

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

    // 2. Filter by Status
    if (filterStatus !== 'all') {
        result = result.filter(r => r.status === filterStatus);
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
            case 'status':
                aValue = a.status || '';
                bValue = b.status || '';
                break;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return result;
  }, [initialReports, search, filterStatus, sortConfig]);

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
  
  const getStatusBadge = (status: string) => {
      const styles: Record<string, string> = {
          'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
          'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
          'pending_approval': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
          'needs_revision': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
          'pulled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
      };
      const displayStatus = status === 'pulled' ? 'Pulled' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
              {displayStatus}
          </span>
      )
  }

  const getAppealBadge = (appeals: { status: string }[]) => {
      if (!appeals || appeals.length === 0) return null;
      
      const status = appeals[0].status; 

      if (status === 'approved') {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Appeal Granted</span>
      } else if (status === 'rejected_final') {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Appeal Denied</span>
      } else if (['rejected_by_issuer', 'rejected_by_chain'].includes(status)) {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Appeal Rejected</span>
      } else {
           return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Appeal In Progress</span>
      }
  }

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
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Status</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="needs_revision">Needs Revision</option>
                    <option value="completed">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pulled">Pulled</option>
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
                    onClick={() => requestSort('status')}
                >
                    Status <SortIcon active={sortConfig.key === 'status'} direction={sortConfig.direction} />
                </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                    Appeal
                </th>
                {/* Removed Details and View Headers */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedReports.length > 0 ? processedReports.map((report) => (
                <tr 
                    key={report.id} 
                    onClick={() => router.push(`/report/${report.id}`)} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{formatName(report.subject)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{report.offense_type?.offense_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getAppealBadge(report.appeals)}
                  </td>
                  {/* Removed Details and View Cells */}
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No reports found.
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