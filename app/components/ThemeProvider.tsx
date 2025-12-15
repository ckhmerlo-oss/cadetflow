"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
// FIX: Import the props directly from the main package
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      // Explicitly define our custom themes to prevent the "sticky theme" bug
      themes={['light', 'dark', 'christmas', 'christmas-dark']}
    >
      {children}
    </NextThemesProvider>
  )
}

// Re-export useTheme so other components can import it from here
export { useTheme }