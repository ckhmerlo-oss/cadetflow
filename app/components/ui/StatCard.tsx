import React from 'react'

export function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}