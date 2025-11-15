// in app/action-items/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ActionItemsClient from './ActionItemsClient'

// *** UPDATED TYPE DEFINITION ***
export type ActionItem = {
  id: string;
  created_at: string;
  status: string;
  subject: { first_name: string, last_name: string };
  submitter: { first_name: string, last_name: string };
  company: { company_name: string | null };
  offense_type: { offense_name: string; demerits: number }; // Added demerits
  notes: string | null; // Added notes
  logs: { // Added logs array
    actor_name: string;
    action: string;
    date: string;
    comment: string;
  }[];
}

async function getActionItems() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data, error } = await supabase.rpc('get_my_action_items')

  if (error) {
    console.error('Error fetching action items:', error.message)
    return []
  }
  return data as ActionItem[]
}

export default async function ActionItemsPage() {
  const items = await getActionItems()

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Action Items
      </h1>
      <ActionItemsClient items={items} />
    </div>
  )
}