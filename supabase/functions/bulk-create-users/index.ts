// in supabase/functions/bulk-create-users/index.ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.224.0/csv/mod.ts' // Deno's standard CSV parser

// --- START: CORS Configuration ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const handleOptions = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
}
// --- END: CORS Configuration ---


interface UserRecord {
  email: string
  password?: string
  first_name: string
  last_name: string
}

function generatePassword() {
  const length = 12
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let pass = ''
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  if (!/\d/.test(pass) || !/[A-Z]/.test(pass)) {
    return generatePassword()
  }
  return pass
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req)
  if (optionsResponse) return optionsResponse

  // 1. Check for valid authorization
  const authHeader = req.headers.get('Authorization')!
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 2. Check if the authenticated user is a Site Admin
  const { data: isAdmin, error: rpcError } = await userClient.rpc('is_site_admin')
  
  if (rpcError || !isAdmin) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 3. User is an Admin. Initialize the Admin Client.
  // *** START OF FIX ***
  // We make the adminClient's auth explicit to avoid any conflicts
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  // *** END OF FIX ***

  // 4. Process the CSV
  try {
    const csvText = await req.text()

    const cleanCsvText = csvText.startsWith('\uFEFF')
      ? csvText.substring(1).trim()
      : csvText.trim();
    
    const records = parse(cleanCsvText, {
      skipFirstRow: true,
      columns: ['email', 'first_name', 'last_name', 'password'],
    }) as UserRecord[]

    const successes: string[] = []
    const failures: { email: string, reason: string }[] = []

    for (const record of records) {
      if (!record.email || !record.first_name || !record.last_name) {
        failures.push({ email: record.email || 'Unknown', reason: 'Missing email, first_name, or last_name.' })
        continue
      }

      const { data, error } = await adminClient.auth.admin.createUser({
        email: record.email,
        password: record.password || generatePassword(),
        email_confirm: true,
        user_metadata: {
          first_name: record.first_name,
          last_name: record.last_name,
        },
      })

      if (error) {
        failures.push({ email: record.email, reason: error.message })
      } else {
        successes.push(data.user.email!)
      }
    }

    return new Response(JSON.stringify({ successes, failures }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})