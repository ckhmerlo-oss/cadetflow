import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
// Import the Deno standard library for CSV parsing
import { parse } from 'https://deno.land/std@0.224.0/csv/parse.ts'

// --- Get these from your project's environment variables ---
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY')!

Deno.serve(async (req) => {
  // 1. Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Create an admin client
    const supabaseAdmin = createClient("https://ejzvpknayvkggswejgkm.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqenZwa25heXZrZ2dzd2VqZ2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzc1ODMsImV4cCI6MjA3NzQxMzU4M30.Bmf6dl5raXm1Y4Mrdctz6d8kfFOKkiCFmrm85YgKoJ8")

    // 3. Get the raw CSV text from the request body
    const csvContent = await req.text()

    if (!csvContent) {
      throw new Error("No CSV data provided in the request body.")
    }

    // 4. Parse the CSV content
    // Assumes:
    // - Header row (email,first_name,last_name) which we skip.
    // - Columns are in that exact order.
    const records = parse(csvContent, {
      skipFirstRow: true,
      columns: ['email', 'first_name', 'last_name'],
    })

    const results = []

    // 5. Loop over each parsed user and create them
    for (const user of records) {
      // Ensure the row is valid
      if (!user.email || !user.first_name || !user.last_name) {
        results.push({ email: user.email || 'unknown', status: 'error', reason: 'Missing data in CSV row.' })
        continue
      }
      
      // Your custom password logic
      const password = `${user.last_name}${user.first_name[0]}`.toLowerCase() // Added lowercase for consistency

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true, // Mark as confirmed
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      })

      if (error) {
        console.error(`Error creating ${user.email}:`, error.message)
        results.push({ email: user.email, status: 'error', reason: error.message })
      } else {
        console.log(`Successfully created ${user.email}`)
        results.push({ email: user.email, status: 'success' })
      }
    }

    // 6. Return the results
    return new Response(
      JSON.stringify({ message: "Bulk user creation complete.", results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})