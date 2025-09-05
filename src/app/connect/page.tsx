'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { Upload, Database, X, Zap, Shield, Unplug, DatabaseZap } from 'lucide-react'

interface Connection {
  id: string
  name: string
  awsName: string
  broker: string
  username: string
  status: 'connected' | 'disconnected'
}

export default function ConnectPage() {
  const [formData, setFormData] = useState({
    name: '',
    broker: '',
    topic: '',
    username: '',
    password: ''
  })
  const [caCertificate, setCaCertificate] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeConnections, setActiveConnections] = useState<Connection[]>([])
  const [nameError, setNameError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const connectedConnections = useMemo(() => 
    activeConnections.filter(conn => conn.status === 'connected'), 
    [activeConnections]
  )
  
  const disconnectedConnections = useMemo(() => 
    activeConnections.filter(conn => conn.status === 'disconnected'), 
    [activeConnections]
  )

  useEffect(() => {
    const savedConnections = localStorage.getItem('activeConnections')
    if (savedConnections) {
      try {
        setActiveConnections(JSON.parse(savedConnections))
      } catch (error) {
        console.error('Error parsing saved connections:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('activeConnections', JSON.stringify(activeConnections))
  }, [activeConnections])

  // Auto-dismiss upload message after 3 seconds
  useEffect(() => {
    if (uploadStatus === 'success' || uploadStatus === 'error') {
      const timer = setTimeout(() => {
        setUploadMessage('')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [uploadStatus])

  // Auto-dismiss connection message after 3 seconds
  useEffect(() => {
    if (connectionStatus === 'success' || connectionStatus === 'error') {
      const timer = setTimeout(() => {
        setConnectionMessage('')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [connectionStatus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'name') {
      setNameError(null)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCaCertificate(file)
      setIsUploading(true)
      setUploadStatus('uploading')
      setUploadMessage('Uploading certificate...')

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload-ca-cert', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const error = await res.json()
          console.log(error.detail.debug_error)
          throw new Error(error.detail.user_message || 'Upload failed')
        }

        const result = await res.json()
        setUploadStatus('success')
        setUploadMessage('Certificate uploaded successfully!')
        console.log('Upload successful:', result.message)
      } catch (error) {
        console.error('Upload failed:', error)
        setUploadStatus('error')
        setUploadMessage(error instanceof Error ? error.message : 'Upload failed')
        setCaCertificate(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadStatus !== 'success') {
      setUploadMessage('Please upload a CA certificate first')
      return
    }

    const connectName = formData.name.trim()
    const validationResult = validateName(connectName)

    if (!validationResult.isValid) {
      setNameError(validationResult.errorMessage)
      return
    }

    const awsConnectName = convertName(connectName)

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/connect-kafka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: awsConnectName,
          broker: formData.broker,
          topic: formData.topic,
          username: formData.username,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail?.user_message || 'Connection failed')
      }

      const result = await response.json()
      console.log('Connection established:', result.message)

      const newConnection = createNewConnection(
        connectName,
        formData.broker,
        formData.topic,
        formData.username
      )
      setActiveConnections(prev => [...prev, newConnection])
      
      setConnectionStatus('success')
      setConnectionMessage('Connection established successfully!')
      
      // Reset form
      setFormData({ name: '', broker: '', topic: '', username: '', password: '' })
      removeFile()

    } catch (error) {
      console.error('Connection failed:', error)
      setConnectionStatus('error')
      setConnectionMessage(error instanceof Error ? error.message : 'Connection failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    const connection = activeConnections.find(conn => conn.id === connectionId)
    if (!connection) return

    setIsDisconnecting(true)

    try {
      const response = await fetch('/api/disconnect-kafka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connection.awsName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail.user_message || 'Disconnect failed')
      }

      const result = await response.json()
      console.log('Connection disconnected:', result.message)

      // Update connection status to disconnected
      setActiveConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: 'disconnected' as const }
            : conn
        )
      )

      setShowDisconnectConfirm(null)

    } catch (error) {
      console.error('Disconnect failed:', error)
      setConnectionStatus('error')
      setConnectionMessage(error instanceof Error ? error.message : 'Disconnect failed')
      setShowDisconnectConfirm(null)
    } finally {
      setIsDisconnecting(false)
    }
  }


  const validateName = (name: string): {isValid: boolean, errorMessage: string | null} => {
    if (name.length > 32) {
      return {isValid: false, errorMessage: 'Connection name must be 32 characters max'}
    }
    
    if (name.length < 1) {
      return {isValid: false, errorMessage: 'Connection name is required'}
    }
    
    const regex = /^[A-Za-z0-9 -]+$/
    if (!regex.test(name)) {
      return {isValid: false, errorMessage: 'Invalid name. Connection name can only contain letters, numbers, spaces, hyphens.'}
    }
    
    return {isValid: true, errorMessage: null}
  }

  const convertName = (name: string): string => {
    return name.replace(/\s+/g, "-").toLowerCase()
  }

  const removeFile = () => {
    setCaCertificate(null)
    setUploadStatus('idle')
    setUploadMessage('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Check if form can be submitted
  const canSubmit = uploadStatus === 'success' && 
                    formData.name && 
                    formData.broker && 
                    formData.username && 
                    formData.password &&
                    !isSubmitting


  const getStatusColor = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
      case 'disconnected':
        return 'bg-gradient-to-r from-slate-500 to-gray-600 text-white'
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
      default:
        return 'Unknown'
    }
  }

  const createNewConnection = (name: string, broker: string, topic: string, username: string): Connection => {
    return {
      id: Date.now().toString(), // Simple ID generation
      name,
      awsName: convertName(name),
      broker,
      username,
      status: 'connected' as const
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
            Manage your database connections and configurations
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
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm ${
                    nameError 
                      ? 'border-red-500/50 dark:border-red-500/50' 
                      : 'border-slate-200/50 dark:border-gray-700/50'
                  }`}
                  placeholder="e.g., Production Database"
                  required
                />
                {nameError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {nameError}
                  </p>
                )}
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
                  placeholder="bootstrap server"
                  required
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="topic" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Kafka topic name"
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
                  placeholder="username"
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
                  placeholder="password"
                  required
                />
              </div>
            </div>

            {/* CA Certificate Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Upload CA Certificate
                </label>
              </div>
                <div className="flex items-center space-x-4">
                <label className={`flex items-center px-6 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isUploading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg shadow-blue-500/25'
                } text-white font-semibold`}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Browse Files'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".crt,.pem,.cer"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
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
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Status Message */}
              {uploadMessage && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  uploadStatus === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                    : uploadStatus === 'error'
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-700'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                }`}>
                  {uploadMessage}
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full md:w-auto px-8 py-4 font-semibold rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                canSubmit
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg shadow-blue-500/25 text-white'
                  : 'bg-gray-400 cursor-not-allowed text-gray-600'
              }`}
            >
              <Zap className="w-5 h-5 inline mr-2" />
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </button>

            {/* Connection Status Message */}
            {connectionMessage && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
                connectionStatus === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                  : connectionStatus === 'error'
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-700'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
              }`}>
                {connectionMessage}
              </div>
            )}
          </form>
        </div>

        {/* Active Connections */}
        {connectedConnections.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <DatabaseZap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Active Connections
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connectedConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="group p-6 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-2xl hover:shadow-xl border-slate-300/50 dark:border-gray-600/50"
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
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(connection.status)} shadow-lg`}>
                        {getStatusText(connection.status)}
                      </span>
                      
                      <button
                        onClick={() => setShowDisconnectConfirm(connection.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title="Disconnect"
                      >
                        <Unplug className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Disconnect Confirmation Modal */}
                  {showDisconnectConfirm === connection.id && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <Unplug className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Disconnect Pipeline
                          </h3>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                          Are you sure you want to disconnect the &quot;{connection.name}&quot; pipeline? 
                          This will stop the data flow, but your ClickHouse table and historical data will remain available for querying.
                        </p>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowDisconnectConfirm(null)}
                            className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            disabled={isDisconnecting}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDisconnect(connection.id)}
                            disabled={isDisconnecting}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

         {/* Inactive Connections */}
         {disconnectedConnections.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Inactive Connections
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {disconnectedConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="group p-6 bg-white/50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/50 rounded-2xl opacity-75"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                          {connection.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          {connection.broker} • {connection.username}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(connection.status)} shadow-lg`}>
                      {getStatusText(connection.status)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p>Historical data remains available for querying in ClickHouse.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
