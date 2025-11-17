'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createNewRole } from './actions'
import { useEffect, useRef } from 'react'

// Get Company/Group types from the parent page
type Company = { id: string; company_name: string }
type Group = { id: string, group_name: string }

type CreateRoleFormProps = {
  companies: Company[]
  groups: Group[]
}

const initialState = {
  success: false,
  message: '',
}

// Submit button that shows loading state
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-400"
    >
      {pending ? 'Creating Role...' : 'Create Role'}
    </button>
  )
}

export default function CreateRoleForm({ companies, groups }: CreateRoleFormProps) {
  const [state, formAction] = useFormState(createNewRole, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // Reset the form on successful submission
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Role</h2>
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Name */}
          <div>
            <label htmlFor="role_name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role_name"
              id="role_name"
              required
              className="block w-full rounded-md border-0 p-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700"
            />
          </div>

          {/* Role Level */}
          <div>
            <label htmlFor="default_role_level" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">
              Role Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="default_role_level"
              id="default_role_level"
              required
              className="block w-full rounded-md border-0 p-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700"
            />
          </div>

          {/* Company Dropdown */}
          <div>
            <label htmlFor="company_id" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">
              Company
            </label>
            <select
              id="company_id"
              name="company_id"
              className="block w-full rounded-md border-0 p-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700"
            >
              <option value="null">N/A</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>

          {/* Approval Group Dropdown */}
          <div>
            <label htmlFor="approval_group_id" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">
              Approval Group
            </label>
            <select
              id="approval_group_id"
              name="approval_group_id"
              className="block w-full rounded-md border-0 p-2 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700"
            >
              <option value="null">N/A</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.group_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center space-x-6 pt-2">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="can_manage_all_rosters"
                name="can_manage_all_rosters"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="can_manage_all_rosters" className="font-medium text-gray-900 dark:text-gray-300">
                Can Manage All Rosters
              </label>
            </div>
          </div>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="can_manage_own_company_roster"
                name="can_manage_own_company_roster"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="can_manage_own_company_roster" className="font-medium text-gray-900 dark:text-gray-300">
                Can Manage Own Company
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button & Messages */}
        <div className="pt-2">
          <SubmitButton />
          {state.message && (
            <p className={`mt-3 text-sm ${state.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}