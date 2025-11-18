// app/manage/roles/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChainVisualizer from './components/ChainVisualizer'

export default async function RolesConfigurationPage() {
  const supabase = createClient()

  // 1. Security Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch Companies for the Dropdown
  const { data: companies } = await supabase
    .from('companies')
    .select('id, company_name')
    .order('company_name')

  return (
    <div className="max-w-[95vw] mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chain of Command Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visualize and edit the approval hierarchy. Drag and drop functionality is not yet implemented; use the "Insert" and "Delete" actions to modify the chain.
        </p>
      </div>

      {/* Pass companies to the client visualizer */}
      <ChainVisualizer initialCompanies={companies || []} />
    </div>
  )
}