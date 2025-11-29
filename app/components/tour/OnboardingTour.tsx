'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { TOUR_STEPS, UserPermissions } from './TourConfig'

export default function OnboardingTour(permissions: UserPermissions & { show: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  
  // --- NEW: Mobile Detection State ---
  const [isMobile, setIsMobile] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // 1. Filter and Process steps
  const activeSteps = useMemo(() => {
    return TOUR_STEPS
      .filter(step => step.shouldShow(permissions))
      .map(step => ({
        ...step,
        path: step.path.replace('::userId::', permissions.userId)
      }))
  }, [permissions.roleLevel, permissions.canManage, permissions.isSiteAdmin, permissions.showDailyReports, permissions.userId])

  const currentStep = activeSteps[currentStepIndex]

  // 2. Start Tour logic
  useEffect(() => {
    if (permissions.show && activeSteps.length > 0) {
        setTimeout(() => setIsOpen(true), 1500)
    }
  }, [permissions.show, activeSteps.length])

  // --- NEW: Handle Mobile Resize ---
  useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 3. Navigation & Positioning Engine
  useEffect(() => {
    if (!isOpen || !currentStep) return

    if (pathname !== currentStep.path) {
      router.push(currentStep.path)
      return 
    }

    const findAndHighlight = () => {
      const element = document.getElementById(currentStep.targetId)
      if (element) {
        const r = element.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) {
          setRect(r)
          // Only auto-scroll if NOT disabled AND NOT on mobile
          if (!currentStep.disableScroll && !isMobile) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        } else {
            setRect({ top: window.innerHeight/2, left: window.innerWidth/2, width: 0, height: 0 } as DOMRect)
        }
      } else {
        setTimeout(findAndHighlight, 500)
      }
    }

    const timer = setTimeout(findAndHighlight, 500)
    window.addEventListener('resize', findAndHighlight)
    return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', findAndHighlight)
    }
  }, [currentStepIndex, currentStep, isOpen, pathname, router, isMobile])

  const handleNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleFinish = async () => {
    // 1. Optimistic Close: Remove UI immediately so mobile users don't feel stuck
    setIsOpen(false)
    setRect(null)

    // 2. Persist in background
    try {
        await supabase.rpc('complete_onboarding_tour') 
        router.refresh()
    } catch (err) {
        console.error("Failed to save tour completion", err)
    }
  }

  if (!isOpen || !currentStep) return null

  // --- Helper for popover styles ---
  const getPopoverStyle = () => {
    // MOBILE OVERRIDE: Force Center
    if (isMobile) {
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed',
            width: '90vw',
            maxWidth: '320px',
            zIndex: 10002
        } as React.CSSProperties
    }

    // DESKTOP LOGIC
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    
    const gap = 15
    const width = 320
    
    switch (currentStep.placement) {
      case 'right': return { top: rect.top, left: rect.right + gap, width }
      case 'left': return { top: rect.top, left: rect.left - width - gap, width }
      case 'top': return { top: rect.top - gap - 200, left: rect.left, width } 
      case 'bottom': default: return { top: rect.bottom + gap, left: rect.left, width }
    }
  }

  const style = getPopoverStyle()

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      
      {/* Backdrop */}
      <div 
        className="absolute transition-all duration-500 ease-in-out rounded-md pointer-events-auto bg-transparent"
        style={{
          top: rect ? rect.top - 5 : '50%',
          left: rect ? rect.left - 5 : '50%',
          width: rect ? rect.width + 10 : 0,
          height: rect ? rect.height + 10 : 0,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)', 
        }}
      />

      {/* Popover Card */}
      <div 
        className="absolute pointer-events-auto transition-all duration-500 ease-out flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={style}
      >
        <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
          <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
            Step {currentStepIndex + 1} of {activeSteps.length}
          </span>
          <button onClick={handleFinish} className="text-indigo-200 hover:text-white text-xs font-semibold">
            Skip
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            {currentStepIndex === activeSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}