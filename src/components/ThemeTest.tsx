'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading theme...</div>
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">Theme Debug</h3>
      <p>Theme: {theme}</p>
      <p>Resolved: {resolvedTheme}</p>
      <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
      <button 
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Toggle Theme
      </button>
    </div>
  )
}
