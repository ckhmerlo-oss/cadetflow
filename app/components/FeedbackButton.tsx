'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' 
import { submitFeedback } from './actions' 

type FeedbackButtonProps = {
  variant?: 'icon' | 'text'
}

export default function FeedbackButton({ variant = 'icon' }: FeedbackButtonProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false) // Required for Portal safety
  
  const [modalOpen, setModalOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState('bug')
  const [content, setContent] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Wait until client-side mount to enable Portals
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpen = () => {
    setError(null); setSuccess(false); setContent(''); setFeedbackType('bug'); setModalOpen(true)
  }

  const handleClose = () => { setModalOpen(false) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsSubmitting(true); 
    setError(null); 
    setSuccess(false);

    // Call the Server Action
    const result = await submitFeedback({
        feedbackType,
        pageUrl: pathname,
        content
    });

    setIsSubmitting(false)
    
    if (!result.success) { 
        setError(result.error || "An unknown error occurred") 
    } else { 
        setSuccess(true); 
        setContent(''); 
        // Close automatically after 2 seconds
        setTimeout(() => { setModalOpen(false) }, 2000) 
    }
  }

  // The Modal Component (rendered via Portal)
  const modalContent = modalOpen ? (
    <div className="relative z-[9999]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
      
      {/* Modal Panel */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-card border border-border text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-foreground" id="modal-title">
                  Submit Feedback
                </h3>
                
                <div className="mt-4 space-y-4">
                  {/* Feedback Type Selector */}
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

                  {/* Details Textarea */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-foreground">Details</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary p-2 placeholder:text-muted-foreground" placeholder="Please provide specific details..." />
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {success && <div className="px-6 py-2"><p className="text-sm text-green-600 font-bold">Feedback sent successfully!</p></div>}
              {error && <div className="px-6 py-2"><p className="text-sm text-destructive font-bold">Error: {error}</p></div>}

              {/* Footer Buttons */}
              <div className="bg-muted/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border">
                <button type="submit" disabled={isSubmitting || success} className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</button>
                <button type="button" onClick={handleClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-muted sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : null;

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

      {/* Render Portal safely only after mount */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}