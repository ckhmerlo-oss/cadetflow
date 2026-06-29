'use client'

import { useState } from 'react'
import DemoDocumentationModal from './DemoDocumentationModal'

type DemoHelpButtonProps = {
  variant?: 'icon' | 'text'
  highlighted?: boolean
}

const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
    />
  </svg>
)

export default function DemoHelpButton({ variant = 'icon', highlighted = false }: DemoHelpButtonProps) {
  const [open, setOpen] = useState(false)

  const iconButtonClass = [
    'p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
    highlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <button
        type="button"
        id="nav-demo-help"
        onClick={() => setOpen(true)}
        className={
          variant === 'icon'
            ? iconButtonClass
            : 'block w-full text-left text-base font-medium text-foreground hover:bg-muted/50 rounded-md px-3 py-2'
        }
        title="Demo documentation"
        aria-label="Open demo documentation"
      >
        {variant === 'icon' ? <HelpIcon /> : 'Demo guide'}
      </button>

      <DemoDocumentationModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
