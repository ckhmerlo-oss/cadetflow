'use client'

import { useTheme } from './ThemeProvider' // Import from our custom provider
import { useState, useEffect } from 'react'

export default function ThemeToggleButton() {
  const { theme, setTheme, snowEnabled, toggleSnow } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" /> 
  }

  // Helper to determine icon
  const getIcon = () => {
    switch (theme) {
      case 'christmas':
        return <span className="text-xl" role="img" aria-label="Christmas Light">🎄</span>
      case 'christmas-dark':
        return <span className="text-xl" role="img" aria-label="Christmas Dark">🎅</span>
      case 'dark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.671 0 5.117-.991 6.992-2.61a.75.75 0 0 1 .01-1.06Z" />
          </svg>
        )
      default: // light or system
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        )
    }
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none"
        aria-label="Toggle theme"
      >
        {getIcon()}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
        <div className="py-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Classic
          </div>
          <button onClick={() => setTheme('light')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${theme === 'light' ? 'bg-accent/50 font-medium' : ''}`}>
             ☀️ Light
          </button>
          <button onClick={() => setTheme('dark')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${theme === 'dark' ? 'bg-accent/50 font-medium' : ''}`}>
             🌙 Dark
          </button>
          
          {/* { Christmas Themes! }
          <div className="border-t border-border my-1"></div>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Seasonal
          </div>
          <button onClick={() => setTheme('christmas')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${theme === 'christmas' ? 'bg-accent/50 font-medium' : ''}`}>
            🎄 Christmas Light
          </button>
          <button onClick={() => setTheme('christmas-dark')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${theme === 'christmas-dark' ? 'bg-accent/50 font-medium' : ''}`}>
            🎅 Christmas Dark
          </button>

          <div className="border-t border-border my-1"></div>
          
          {/* Effects Toggle */} {/*
          
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Effects
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent menu close logic if any
              toggleSnow();
            }} 
            className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-accent cursor-pointer"
          >
            <span>❄️ Snowfall</span>
            <div className={`w-9 h-5 rounded-full relative transition-colors ${snowEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow transition-transform ${snowEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
          */}
        </div>
      </div>
    </div>
  )
}