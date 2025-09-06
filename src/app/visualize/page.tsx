'use client'

import { Layout } from '@/components/Layout'
import { BarChart3, ExternalLink, TrendingUp, PieChart, Activity } from 'lucide-react'
import { useState } from 'react'

export default function VisualizePage() {
  const [grafanaUrl, setGrafanaUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGrafanaConnect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // If we already have the URL, open it directly
      if (grafanaUrl) {
        window.open(grafanaUrl, '_blank')
        return
      }

      // Fetch Grafana URL from backend
      const response = await fetch('/api/grafana-url')
      const data = await response.json()
      
      if (data.success && data.grafana_url) {
        setGrafanaUrl(data.grafana_url)
        window.open(data.grafana_url, '_blank')
      } else {
        setError('Failed to retrieve Grafana URL')
      }
    } catch (err) {
      setError('Failed to connect to Grafana')
      console.error('Grafana connection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-pink-800 bg-clip-text text-transparent dark:from-white dark:via-purple-200 dark:to-pink-200">
            Visualize
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Create beautiful visualizations and dashboards for your data
          </p>
        </div>

        {/* Grafana Connection */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Connect to Grafana
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                This will securely connect you to Grafana dashboard, ready for custom visualizations of your data.
              </p>

               {/* Error message */}
               {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              
              {/* Success message */}
              {grafanaUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-700 dark:text-green-300">
                    Grafana URL: <span className="font-mono text-sm">{grafanaUrl}</span>
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleGrafanaConnect}
              disabled={isLoading}
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 shadow-2xl shadow-purple-500/25 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5 mr-3" />
                  Connect to Grafana
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-800/20 p-8 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Interactive Dashboards
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Create interactive dashboards with real-time data updates, customizable widgets, and responsive design that works on any device.
            </p>
          </div>

          <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-800/20 p-8 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Advanced Analytics
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Leverage powerful analytics tools for deep insights into your data patterns, trends, and predictive modeling capabilities.
            </p>
          </div>

          <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-800/20 p-8 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Custom Visualizations
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Build custom charts, graphs, and visualizations tailored to your specific data needs with drag-and-drop simplicity.
            </p>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border border-blue-200/50 dark:border-blue-700/30 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                Real-time Monitoring
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
              Monitor your data in real-time with live updates, alerts, and notifications to keep you informed of important changes.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-200/50 dark:border-emerald-700/30 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                Collaborative Workspaces
              </h3>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
              Share dashboards and collaborate with your team in real-time, with role-based access control and version management.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
