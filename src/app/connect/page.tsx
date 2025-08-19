'use client'

import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Upload, Database, X, Zap, Shield, Globe } from 'lucide-react'

interface Connection {
  id: string
  name: string
  broker: string
  username: string
  status: 'connected' | 'disconnected' | 'error'
}

export default function ConnectPage() {
  const [formData, setFormData] = useState({
    name: '',
    broker: '',
    username: '',
    password: ''
  })
  const [caCertificate, setCaCertificate] = useState<File | null>(null)
  const [activeConnections] = useState<Connection[]>([
    {
      id: '1',
      name: 'Production Database',
      broker: 'broker.example.com:9092',
      username: 'admin',
      status: 'connected'
    },
    {
      id: '2',
      name: 'Development Database',
      broker: 'dev-broker.example.com:9092',
      username: 'dev_user',
      status: 'disconnected'
    }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCaCertificate(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
    console.log('CA Certificate:', caCertificate)
  }

  const removeFile = () => {
    setCaCertificate(null)
  }

  const getStatusColor = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
      case 'disconnected':
        return 'bg-gradient-to-r from-slate-500 to-gray-600 text-white'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
      default:
        return 'bg-gradient-to-r from-slate-500 to-gray-600 text-white'
    }
  }

  const getStatusText = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200">
            Connect
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Manage your database connections and configurations with enterprise-grade security
          </p>
        </div>

        {/* Connection Form */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              New Connection
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Name your connection
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="e.g., Production Database"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="broker" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Broker
                </label>
                <input
                  type="text"
                  id="broker"
                  name="broker"
                  value={formData.broker}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="broker.example.com:9092"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="your_username"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="your_password"
                  required
                />
              </div>
            </div>

            {/* CA Certificate Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Upload CA Certificate
                </label>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25">
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                  <input
                    type="file"
                    accept=".crt,.pem,.cer"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {caCertificate && (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
                    <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {caCertificate.name}
                    </span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Connect
            </button>
          </form>
        </div>

        {/* Active Connections */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Active Connections
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeConnections.map((connection) => (
              <div
                key={connection.id}
                className="group p-6 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-xl border-slate-300/50 dark:border-gray-600/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {connection.broker} • {connection.username}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(connection.status)} shadow-lg`}>
                    {getStatusText(connection.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
