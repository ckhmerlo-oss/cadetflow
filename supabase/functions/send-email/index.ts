import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  type: 'greensheet' | 'alert';
  recipients: string[];
  subject: string;
  htmlContent: string;
}

serve(async (req) => {
  // 1. Handle CORS (Required for calls from the browser/client)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse and Validate Request
    const { type, recipients, subject, htmlContent }: EmailPayload = await req.json()

    if (!recipients || recipients.length === 0) {
        throw new Error("No recipients defined.")
    }
    
    if (!RESEND_API_KEY) {
        throw new Error("Server misconfiguration: Missing RESEND_API_KEY")
    }

    // 3. Send to Resend
    // Note: For testing, use 'onboarding@resend.dev' as the 'from' address 
    // until you verify your own domain in the Resend dashboard.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CadetFlow <greensheet@cadetflow.com>', // Use any name @ your verified domain
        to: recipients,
        subject: subject,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})