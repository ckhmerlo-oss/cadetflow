// in app/login/page.tsx
'use client' // This tells Next.js to run this page in the browser

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function LoginPage() {
  // Get the Supabase client
  const supabase = createClient()

  // This one component does everything!
  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]} // You can add ['google', 'github'] here later
        redirectTo="/"
      />
    </div>
  )
}