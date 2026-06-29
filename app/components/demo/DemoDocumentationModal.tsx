'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  DEMO_DOC_CATEGORIES,
  DEFAULT_DOC_TOPIC_ID,
  type DocTopic,
} from '@/app/demo/docs/demoDocumentation'

type DemoDocumentationModalProps = {
  open: boolean
  onClose: () => void
}

function TopicBadges({ topic }: { topic: DocTopic }) {
  if (!topic.isNew && !topic.comingSoon) return null
  return (
    <div className="flex flex-wrap gap-2">
      {topic.isNew && (
        <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
          New
        </span>
      )}
      {topic.comingSoon && (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Coming soon
        </span>
      )}
    </div>
  )
}

export default function DemoDocumentationModal({ open, onClose }: DemoDocumentationModalProps) {
  const pathname = usePathname()
  const [selectedTopicId, setSelectedTopicId] = useState(DEFAULT_DOC_TOPIC_ID)
  const [activeCategoryId, setActiveCategoryId] = useState(DEMO_DOC_CATEGORIES[0].id)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const prevPathnameRef = useRef(pathname)

  const selectedTopic =
    DEMO_DOC_CATEGORIES.flatMap((c) => c.topics).find((t) => t.id === selectedTopicId) ??
    DEMO_DOC_CATEGORIES[0].topics[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      if (open) onClose()
    }
  }, [pathname, open, onClose])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const selectTopic = useCallback((categoryId: string, topicId: string) => {
    setActiveCategoryId(categoryId)
    setSelectedTopicId(topicId)
  }, [])

  if (!open || !mounted) return null

  const modalContent = (
    <div
      className="relative z-[9999]"
      aria-labelledby="demo-docs-title"
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-10 flex items-end justify-center p-2 sm:items-center sm:p-4">
        <div
          className="relative flex w-full max-h-[92vh] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl sm:max-w-6xl sm:min-h-[70vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
            <h2 id="demo-docs-title" className="text-lg font-semibold text-foreground">
              CadetFlow Demo Guide
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close documentation"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile: category tabs */}
          <div className="flex overflow-x-auto border-b border-border md:hidden">
            {DEMO_DOC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setActiveCategoryId(category.id)
                  const first = category.topics[0]
                  if (first) setSelectedTopicId(first.id)
                }}
                className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors ${
                  activeCategoryId === category.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="hidden w-60 shrink-0 border-r border-border md:block">
              <nav className="h-full overflow-y-auto p-3" aria-label="Documentation topics">
                {DEMO_DOC_CATEGORIES.map((category) => (
                  <div key={category.id} className="mb-4 last:mb-0">
                    <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {category.title}
                    </p>
                    <ul className="space-y-0.5">
                      {category.topics.map((topic) => (
                        <li key={topic.id}>
                          <button
                            type="button"
                            onClick={() => selectTopic(category.id, topic.id)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                              selectedTopicId === topic.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <span className="truncate">{topic.title}</span>
                            {topic.isNew && (
                              <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                New
                              </span>
                            )}
                            {topic.comingSoon && (
                              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Soon
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Mobile topic picker */}
            <div className="border-b border-border p-2 md:hidden">
              <label htmlFor="demo-docs-topic-select" className="sr-only">Select topic</label>
              <select
                id="demo-docs-topic-select"
                value={selectedTopicId}
                onChange={(e) => {
                  const topicId = e.target.value
                  const category = DEMO_DOC_CATEGORIES.find((c) =>
                    c.topics.some((t) => t.id === topicId),
                  )
                  if (category) selectTopic(category.id, topicId)
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                {DEMO_DOC_CATEGORIES
                  .filter((c) => c.id === activeCategoryId)
                  .flatMap((c) =>
                    c.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                        {topic.isNew ? ' (New)' : ''}
                        {topic.comingSoon ? ' (Coming soon)' : ''}
                      </option>
                    )),
                  )}
              </select>
            </div>

            {/* Detail panel */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">{selectedTopic.title}</h3>
                    <TopicBadges topic={selectedTopic} />
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTopic.summary}</p>
                </div>

                <div className="space-y-6">
                  {selectedTopic.sections.map((section) => (
                    <section key={section.id} className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">
                        {section.title}
                      </h4>
                      <ul className="space-y-2 text-sm text-foreground leading-relaxed list-disc pl-5">
                        {section.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                {selectedTopic.relatedRoutes && selectedTopic.relatedRoutes.length > 0 && !selectedTopic.comingSoon && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Go there in the app</h4>
                    <ul className="flex flex-wrap gap-2">
                      {selectedTopic.relatedRoutes.map((route) => (
                        <li key={route}>
                          <Link
                            href={route}
                            onClick={onClose}
                            className="inline-flex rounded-md border border-border bg-muted/30 px-3 py-1 text-sm text-primary hover:bg-muted/50 transition-colors"
                          >
                            {route}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
