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
    setError(null)
    setSuccess(false)
    setContent('')
    setFeedbackType('bug')
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase.from('feedback').insert({
      feedback_type: feedbackType,
      page_url: pathname,
      content: content,
    })

    setIsSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setContent('')
      setTimeout(() => {
        setModalOpen(false)
      }, 2000)
    }
  }

  return (
    <>
      <button
        id="nav-feedback" // Added for Tour
        onClick={handleOpen}
        className={variant === 'icon' 
          ? "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white p-2 rounded-full transition-colors"
          : "block w-full text-left text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" // Mobile styling matches menu items
        }
        title="Send Feedback"
      >
        {variant === 'icon' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        ) : (
          "Feedback"
        )}
      </button>

      {modalOpen && (
        <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={handleClose}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                      Submit Feedback
                    </h3>
                    <div className="mt-4 space-y-4">
                      <fieldset>
                        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback Type</legend>
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-4 flex-wrap"> 
                            <label className="flex items-center">
                              <input type="radio" name="feedback-type" value="bug" checked={feedbackType === 'bug'} onChange={() => setFeedbackType('bug')} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600" />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Bug Report</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="feedback-type" value="feature request" checked={feedbackType === 'feature request'} onChange={() => setFeedbackType('feature request')} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600" />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Feature Request</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="feedback-type" value="comment/complaint" checked={feedbackType === 'comment/complaint'} onChange={() => setFeedbackType('comment/complaint')} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600" />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Comment / Complaint</span>
                            </label>
                          </div>
                        </div>
                      </fieldset>
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-2" placeholder="Please provide specific details..." />
                      </div>
                    </div>
                  </div>
                  {success && <div className="px-6 py-2"><p className="text-sm text-green-600 dark:text-green-400">Thank you! Submitting feedback...</p></div>}
                  {error && <div className="px-6 py-2"><p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p></div>}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" disabled={isSubmitting || success} className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</button>
                    <button type="button" onClick={handleClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
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