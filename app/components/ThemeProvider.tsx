// in app/components/ThemeProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'dark', // Your default
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  // 1. Initialize state *only* with the default theme.
  // This ensures the server and client initial render are identical.
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    // 2. On client mount, check local storage and update state if it exists.
    // This runs *after* hydration, avoiding the mismatch.
    const storedTheme = window.localStorage.getItem('theme') as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // 3. This effect syncs any theme change (from mount or toggle)
    // back to the <html> tag and local storage.
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Save the choice to local storage
    window.localStorage.setItem('theme', theme)
  }, [theme]) // Runs whenever the theme state changes

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Custom hook to easily use the theme
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}