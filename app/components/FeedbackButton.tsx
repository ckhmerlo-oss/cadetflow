'use client'

import { createClient } from '@/utils/supabase/client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type FeedbackButtonProps = {
  variant?: 'icon' | 'text'
}

export default function FeedbackButton({ variant = 'icon' }: FeedbackButtonProps) {
  const supabase = createClient()
  const pathname = usePathname()

  const [modalOpen, setModalOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState('bug')
  const [content, setContent] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleOpen = () => {
    //setError(null); setSuccess(false); setContent(''); setFeedbackType('bug'); setModalOpen(true)
  }

  const handleClose = () => { setModalOpen(false) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsSubmitting(true); setError(null); setSuccess(false)
    const { error } = await supabase.from('feedback').insert({ feedback_type: feedbackType, page_url: pathname, content: content })
    setIsSubmitting(false)
    if (error) { setError(error.message) } 
    else { setSuccess(true); setContent(''); setTimeout(() => { setModalOpen(false) }, 2000) }
  }

  return (
    <>
      <button
        id="nav-feedback"
        onClick={handleOpen}
        className={variant === 'icon' 
          ? "text-muted-foreground hover:text-primary p-2 rounded-full transition-colors"
          : "block w-full text-left text-base font-medium text-foreground hover:bg-muted"
        }
        title="Send Feedback"
      >
        {variant === 'icon' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        ) : ( "Feedback" )}
      </button>

      {modalOpen && (
        <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-card border border-border text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium leading-6 text-foreground" id="modal-title">
                      Submit Feedback
                    </h3>
                    <div className="mt-4 space-y-4">
                      <fieldset>
                        <legend className="text-sm font-medium text-muted-foreground">Feedback Type</legend>
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-4 flex-wrap"> 
                            {['bug', 'feature request', 'comment/complaint'].map(type => (
                                <label key={type} className="flex items-center cursor-pointer">
                                  <input type="radio" name="feedback-type" value={type} checked={feedbackType === type} onChange={() => setFeedbackType(type)} className="h-4 w-4 text-primary border-input focus:ring-primary" />
                                  <span className="ml-2 text-sm text-foreground capitalize">{type}</span>
                                </label>
                            ))}
                          </div>
                        </div>
                      </fieldset>
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-foreground">Details</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary p-2 placeholder:text-muted-foreground" placeholder="Please provide specific details..." />
                      </div>
                    </div>
                  </div>
                  {success && <div className="px-6 py-2"><p className="text-sm text-green-600 dark:text-green-400">Thank you! Submitting feedback...</p></div>}
                  {error && <div className="px-6 py-2"><p className="text-sm text-destructive">Error: {error}</p></div>}
                  <div className="bg-muted/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border">
                    <button type="submit" disabled={isSubmitting || success} className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</button>
                    <button type="button" onClick={handleClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-muted sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}