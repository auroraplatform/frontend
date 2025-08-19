'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto relative">
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-gray-950 dark:via-slate-900/50 dark:to-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.1)_1px,transparent_0)] bg-[size:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.05)_1px,transparent_0)]" />
        
        {/* Content */}
        <div className="relative z-10 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
