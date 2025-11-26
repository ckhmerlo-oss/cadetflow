'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CompletedReport } from './page'

type SortKey = 'created_at' | 'subject' | 'offense' | 'status';

export default function ReportHistoryClient({ initialReports }: { initialReports: CompletedReport[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterAppeal, setFilterAppeal] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' })

  const processedReports = useMemo(() => {
    let result = [...initialReports];

    // 1. Filter by Search
    if (search) {
        const s = search.toLowerCase();
        result = result.filter(r => 
          r.subject?.last_name.toLowerCase().includes(s) ||
          r.subject?.first_name.toLowerCase().includes(s) ||
          r.offense_type?.offense_name.toLowerCase().includes(s)
        );
    }

    // 2. Filter by Appeal
    if (filterAppeal !== 'all') {
        if (filterAppeal === 'appealed') result = result.filter(r => !!r.appeal_status);
        if (filterAppeal === 'granted') result = result.filter(r => r.appeal_status === 'approved');
        if (filterAppeal === 'denied') result = result.filter(r => r.appeal_status === 'rejected_final');
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
                aValue = a.appeal_status || a.status || '';
                bValue = b.appeal_status || b.status || '';
                break;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return result;
  }, [initialReports, search, filterAppeal, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' }) => {
      if (!active) return <span className="ml-1 text-gray-400">↕</span>;
      return <span className="ml-1 text-indigo-600 dark:text-indigo-400">{direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatName = (p: { first_name: string, last_name: string } | null) => p ? `${p.last_name}, ${p.first_name}` : 'N/A'
  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  const getAppealBadge = (status: string | null) => {
      if (!status) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">No Appeal</span>
      if (status === 'approved') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Appeal Granted</span>
      if (status === 'rejected_final') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Appeal Denied</span>
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Appeal Active</span>
  }

  return (
    <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
                <input
                    type="text"
                    placeholder="Search archive..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                />
            </div>
            <div className="w-full md:w-64">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Appeal</label>
                <select
                    value={filterAppeal}
                    onChange={(e) => setFilterAppeal(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                    <option value="all">All Reports</option>
                    <option value="appeals">Any Appeal History</option>
                    <option value="granted">Appeal Granted</option>
                    <option value="denied">Appeal Denied</option>
                </select>
            </div>
        </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('created_at')}>
                    Date <SortIcon active={sortConfig.key === 'created_at'} direction={sortConfig.direction} />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('subject')}>
                    Subject <SortIcon active={sortConfig.key === 'subject'} direction={sortConfig.direction} />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Infraction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => requestSort('status')}>
                    Status <SortIcon active={sortConfig.key === 'status'} direction={sortConfig.direction} />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                   Submitted By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processedReports.length > 0 ? processedReports.map((report) => (
                <tr key={report.id} onClick={() => router.push(`/report/${report.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(report.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{formatName(report.subject)}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{report.offense_type?.offense_name}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">{getAppealBadge(report.appeal_status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatName(report.submitter)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No archived reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-500 dark:text-gray-400">
          Showing {processedReports.length} records
        </div>
      </div>
    </div>
  )
}