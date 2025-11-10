// in app/components/SearchableSelect.tsx
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

export type SelectOption = {
  id: string
  label: string
  group?: string // <-- NEW: Optional grouping
}

type Props = {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: boolean | string | null
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  error = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedItem = options.find(opt => opt.id === value)

  useEffect(() => {
    if (selectedItem) {
      setSearch(selectedItem.label)
    } else {
        setSearch('')
    }
  }, [selectedItem])

  const filteredOptions = useMemo(() => {
      return options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        (opt.group && opt.group.toLowerCase().includes(search.toLowerCase()))
      )
  }, [options, search])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (selectedItem) setSearch(selectedItem.label)
        else setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedItem])

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          className={`block w-full rounded-md border bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white ${
             error ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
          } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          value={search}
          onChange={e => {
              setSearch(e.target.value)
              if (!isOpen) setIsOpen(true)
              if (e.target.value === '') onChange('')
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        // FIX: Changed dark:bg-gray-800 to dark:bg-gray-700 for better contrast against the form
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 ? (
            <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500 dark:text-gray-300">
              No results found.
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              // Determine if we need a group header
              const showGroupHeader = option.group && (index === 0 || option.group !== filteredOptions[index - 1].group);
              
              return (
                <div key={option.id}>
                  {/* Group Header */}
                  {showGroupHeader && (
                    <li className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 py-1 pl-2 pr-9 text-xs font-bold text-gray-500 dark:text-gray-400">
                      {option.group}
                    </li>
                  )}
                  {/* Option Item */}
                  <li
                    className={`relative cursor-pointer select-none py-2 pr-9 text-gray-900 dark:text-white hover:bg-indigo-600 hover:text-white ${
                        option.id === value ? 'bg-indigo-600 text-white' : ''
                    } ${option.group ? 'pl-5' : 'pl-3' /* Indent if in a group */}`}
                    onClick={() => {
                      onChange(option.id)
                      setSearch(option.label)
                      setIsOpen(false)
                    }}
                  >
                    <span className={`block truncate ${option.id === value ? 'font-semibold' : 'font-normal'}`}>
                      {option.label}
                    </span>
                     {option.id === value && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                  </li>
                </div>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}