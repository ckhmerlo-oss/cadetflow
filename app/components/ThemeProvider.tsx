"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

// 1. Create a Context for the Snow State
type SnowContextType = {
  snowEnabled: boolean
  setSnowEnabled: (enabled: boolean) => void
  toggleSnow: () => void
}

const SnowContext = React.createContext<SnowContextType | undefined>(undefined)

// 2. Create the Provider Component
function SnowProvider({ children }: { children: React.ReactNode }) {
  const [snowEnabled, setSnowEnabled] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Persist preference to local storage
    const stored = localStorage.getItem("snow-enabled")
    if (stored !== null) {
      setSnowEnabled(stored === "true")
    }
  }, [])

  const handleSetSnow = (val: boolean) => {
    setSnowEnabled(val)
    localStorage.setItem("snow-enabled", String(val))
  }

  const toggleSnow = () => handleSetSnow(!snowEnabled)

  return (
    <SnowContext.Provider value={{ snowEnabled, setSnowEnabled: handleSetSnow, toggleSnow }}>
      {children}
    </SnowContext.Provider>
  )
}

// 3. Main Provider Wrapper
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      themes={['light', 'dark', 'christmas', 'christmas-dark']}
    >
      <SnowProvider>
        {children}
      </SnowProvider>
    </NextThemesProvider>
  )
}

// 4. Custom Hook that merges standard theme props with our snow props
export const useTheme = () => {
  const themeContext = useNextTheme()
  const snowContext = React.useContext(SnowContext)
  
  if (!snowContext) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return {
    ...themeContext,
    ...snowContext
  }
}