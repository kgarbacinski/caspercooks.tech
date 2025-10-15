'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'developer' | 'founder'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('developer')

  useEffect(() => {
    // Apply theme class to body
    if (theme === 'founder') {
      document.body.classList.add('founder-mode')
    } else {
      document.body.classList.remove('founder-mode')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'developer' ? 'founder' : 'developer')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
