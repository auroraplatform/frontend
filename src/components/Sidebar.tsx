'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Database, 
  Search, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  })
  const pathname = usePathname()
  const [animate, setAnimate] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  const toggleCollapse = () => {
    console.log('toggleCollapse called, current state:', isCollapsed)
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
    console.log('Sidebar collapsed state updated to:', newState)
  }

  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme)
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    
    // Apply theme to HTML element
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
    console.log('Theme updated to:', newTheme, 'and applied to HTML element')
  }

  const navItems = [
    {
      href: '/connect',
      icon: Database,
      label: 'Connect',
      description: 'Manage connections'
    },
    {
      href: '/query',
      icon: Search,
      label: 'Query',
      description: 'Natural language queries'
    },
    {
      href: '/visualize',
      icon: BarChart3,
      label: 'Visualize',
      description: 'Data visualization'
    }
  ]

  return (
    <div className={`relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 ${animate ? 'transition-all duration-500 ease-out' : ''} ${isCollapsed ? 'w-20' : 'w-72'} ${className}`}>      {/* Header */}
      <div className="p-4 border-b border-slate-700/30">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-white">Aurora</h1>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
              } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              <div className={`p-2 rounded-lg ${
                isActive 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white'
              } transition-all duration-200`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.description}</div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-slate-700/30">
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-full p-3 rounded-xl transition-all duration-300 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 hover:scale-105`}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            {mounted
                ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)
                : <span className="w-4 h-4" />}
          </div>
          {!isCollapsed && (
            <span className="text-slate-300 font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
