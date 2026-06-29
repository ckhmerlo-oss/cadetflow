'use server'

import { createClient } from '@/utils/supabase/server'

type FeedbackData = {
  feedbackType: string
  pageUrl: string
  content: string
}

export async function submitFeedback(data: FeedbackData) {
  const supabase = await createClient()

  // 1. Save to Database
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
  try {
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

    // --- UPDATED: Use supabase.functions.invoke ---
    const { error: funcError } = await supabase.functions.invoke('send-email', {
      body: emailPayload,
    })

    if (funcError) {
      console.error('Feedback Email Invocation Error:', funcError)
      // We don't fail the request here because the DB insert succeeded,
      // but you will now see this error in your Next.js Server Terminal.
    }

  } catch (err) {
    console.error('Unexpected Feedback Error:', err)
  }

  return { success: true }
}