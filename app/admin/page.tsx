// in app/admin/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSettingsClient } from './AdminClientComponent';

export default async function AdminPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // *** UPDATE THIS CHECK ***
  // Server-side check for admin privileges
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_site_admin') // <-- Check the new column
    .eq('id', user.id)
    .single();

  const isSiteAdmin = profile?.is_site_admin || false; // <-- Use the new column's value

  // If not a site admin, redirect to the dashboard.
  if (!isSiteAdmin) {
    return redirect('/');
  }

  // Pass the user to the client component
  return <AdminSettingsClient user={user} />;
}