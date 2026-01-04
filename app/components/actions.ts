'use server'

import { createClient } from '@/utils/supabase/server'

type FeedbackData = {
  feedbackType: string
  pageUrl: string
  content: string
}

export async function submitFeedback(data: FeedbackData) {
  const supabase = createClient()

  // 1. Save to Database
  // We insert the raw feedback first to ensure we capture it even if email fails.
  const { error: dbError } = await supabase
    .from('feedback')
    .insert({
      feedback_type: data.feedbackType,
      page_url: data.pageUrl,
      content: data.content,
    })

  if (dbError) {
    console.error('Feedback DB Error:', dbError)
    return { success: false, error: 'Failed to save feedback to database.' }
  }

  // 2. Trigger Email Notification via Supabase Edge Function
  // We use the existing 'send_email' function you uploaded in index.ts
  try {
    const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_email`
    
    const emailPayload = {
      type: 'alert',
      recipients: ['merlock@fuma.org'], // <--- REPLACE WITH YOUR EMAIL
      subject: `[CadetFlow Feedback] ${data.feedbackType.toUpperCase()}`,
      htmlContent: `
        <h2>New Feedback Received</h2>
        <p><strong>Type:</strong> ${data.feedbackType}</p>
        <p><strong>Page:</strong> ${data.pageUrl}</p>
        <hr />
        <h3>Message:</h3>
        <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
            ${data.content.replace(/\n/g, '<br/>')}
        </blockquote>
      `
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We use the ANON key here because the Edge Function handles its own CORS and logic,
        // but typically you authorize function calls with the Anon or Service key.
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    })

    if (!response.ok) {
        const resJson = await response.json()
        console.error('Feedback Email Error:', resJson)
        // We do NOT return false here, because the DB save was successful.
        // We just log the email failure.
    }

  } catch (emailError) {
    console.error('Feedback Email Fetch Error:', emailError)
  }

  return { success: true }
}