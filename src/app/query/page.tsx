'use client'

import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { QueryResultTable } from '@/components/QueryResultTable'
import { Search, Send, MessageSquare, Sparkles } from 'lucide-react'

// Helpers to interpolate SQL parameters for display only
const sqlEscapeString = (s: string) => s.replace(/'/g, "''")
const formatSqlValue = (val: unknown): string => {
  if (val === null || val === undefined) return 'NULL'
  if (Array.isArray(val)) return '(' + val.map(v => formatSqlValue(v)).join(', ') + ')'
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`
  switch (typeof val) {
    case 'string': return `'${sqlEscapeString(val)}'`
    case 'number': return Number.isFinite(val) ? String(val) : 'NULL'
    case 'boolean': return val ? '1' : '0'
    default: return `'${sqlEscapeString(String(val))}'`
  }
}
const interpolateSql = (sql?: string, params?: Record<string, unknown>): string => {
  if (!sql) return ''
  if (!params) return sql
  // Match {name} or {name:Type}
  return sql.replace(/\{(\w+)(?::[^}]+)?\}/g, (m, name) => {
    return Object.prototype.hasOwnProperty.call(params, name) ? formatSqlValue(params[name]) : m
  })
}

interface QueryResult {
  success: boolean
  sql: string
  parameters?: Record<string, unknown>
  execution?: {
    success: boolean
    data: (string | number | boolean | null | undefined)[][]
    columns: string[]
    error?: string
    security_error?: boolean
  }
}

export default function QueryPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QueryResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
      const apiUrl = base ? `${base}/api/smart-query` : '/api/smart-query'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail.user_message || `Request failed with ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (exampleQuery: string) => {
    const cleanQuery = exampleQuery.replace(/[""]/g, '')
    setQuery(cleanQuery)

    const queryForm = document.getElementById('query-form')
    if (queryForm) {
      queryForm.scrollIntoView({ behavior: 'smooth', block: 'start'})
    }

    setTimeout(() => {
      const textArea = document.getElementById('query')
      if (textArea) {
        textArea.focus()
      }
    }, 500)
  }

  const displaySql = interpolateSql(result?.sql, result?.parameters)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent dark:from-white dark:via-emerald-200 dark:to-teal-200">
            Query
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Ask questions about your data using natural language and AI-powered insights
          </p>
        </div>

        {/* Query Form */}
        <div id="query-form" className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Natural Language Query
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="query" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Natural language query
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-emerald-500" />
                <textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={6}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 backdrop-blur-sm resize-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  placeholder="e.g., Show me all users who signed up in the last 30 days and their engagement metrics..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center px-8 py-4 
                         bg-gradient-to-r from-emerald-600 to-teal-600 
                         enabled:hover:from-emerald-700 enabled:hover:to-teal-700 
                         text-white font-semibold rounded-xl 
                         transition-all duration-200 
                         enabled:hover:scale-105 shadow-lg 
                         shadow-emerald-500/25 focus:ring-2 
                         focus:ring-emerald-500/50 focus:ring-offset-2 
                         dark:focus:ring-offset-gray-900 
                         disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Send className="w-5 h-5 mr-2" />
              {loading ? 'Submitting...' : 'Submit Query'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
            <div className="mt-6 p-4 rounded-xl border border-red-200/50 dark:border-red-800/50 bg-red-50/60 dark:bg-red-900/20 text-red-800 dark:text-red-200">
              <h4 className="font-semibold mb-2">Error</h4>
              <p>{error}</p>
            </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-900/20">
            <h4 className="font-semibold mb-2 text-emerald-900 dark:text-emerald-100">Generated SQL</h4>
            {/* <pre className="overflow-auto text-sm p-3 rounded bg-white/60 dark:bg-gray-800/60">{result.sql ?? '—'}</pre> */}
            <div className="bg-slate-50/60 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <code className="text-sm text-slate-800 dark:text-slate-200 break-all">
                {displaySql || 'No SQL generated'}
              </code>
            </div>

            {/* Query Results Table */}
            {result.execution && (
              <>
                <h4 className="font-semibold mt-4 mb-2 text-emerald-900 dark:text-emerald-100">Execution Result</h4>
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-800/20 p-6">
                  <QueryResultTable 
                    execution={result.execution}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Query Examples */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Example Queries
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => handleExampleClick("What are the top 10 products by sales volume this month?")}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Sales Analytics</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                &ldquo;What are the top 10 products by sales volume this month?&rdquo;
              </p>
            </div>
            
            <div 
              className="group p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => handleExampleClick("Show me user engagement metrics for the last quarter")}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">User Engagement</h4>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                &ldquo;Show me user engagement metrics for the last quarter&rdquo;
              </p>
            </div>
            
            <div 
              className="group p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/30 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => handleExampleClick("Find all transactions above $1000 from yesterday")}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Transaction Analysis</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                &ldquo;Find all transactions above $1000 from yesterday&rdquo;
              </p>
            </div>
            
            <div 
              className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => handleExampleClick("Compare revenue growth between Q1 and Q2 this year")}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Growth Comparison</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                &ldquo;Compare revenue growth between Q1 and Q2 this year&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
