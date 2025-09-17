'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  CpuChipIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
  estimatedTime?: number
  processedUrl?: string
  originalUrl?: string
  taskId?: string
  metrics?: {
    processingTime: number
    enhancement: string
    resolution: string
    fileSize: string
  }
}

interface AdvancedProcessingProps {
  file: File | null
  onProcessingComplete?: (result: { url: string; metadata: any }) => void
  onReset?: () => void
  processingConfig?: {
    enhancement: 'x2' | 'x4' | 'anime' | 'general'
    faceEnhance: boolean
    denoise: number
    outscale: number
  }
}

export function AdvancedProcessing({
  file,
  onProcessingComplete,
  onReset,
  processingConfig = {
    enhancement: 'x4',
    faceEnhance: true,
    denoise: 1,
    outscale: 4
  }
}: AdvancedProcessingProps) {
  const [status, setStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to process'
  })
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [previewMode, setPreviewMode] = useState<'split' | 'before' | 'after'>('split')
  const wsRef = useRef<WebSocket | null>(null)
  const processingTimeRef = useRef<number>(0)

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (status.status === 'processing' && status.taskId) {
      const websocket = new WebSocket(`ws://localhost:8000/ws/${status.taskId}`)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        setWs(websocket)
        wsRef.current = websocket
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        setStatus(prev => ({
          ...prev,
          progress: data.progress || prev.progress,
          message: data.message || prev.message,
          estimatedTime: data.estimated_time,
          status: data.status || prev.status
        }))

        if (data.status === 'completed') {
          setStatus(prev => ({
            ...prev,
            status: 'completed',
            processedUrl: data.result_url,
            metrics: data.metrics,
            progress: 100
          }))
          
          if (onProcessingComplete) {
            onProcessingComplete({
              url: data.result_url,
              metadata: data.metadata
            })
          }
          
          toast.success('Image processing completed!')
        }

        if (data.status === 'error') {
          setStatus(prev => ({
            ...prev,
            status: 'error',
            message: data.error || 'Processing failed'
          }))
          toast.error('Processing failed: ' + (data.error || 'Unknown error'))
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast.error('Connection error. Please try again.')
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        setWs(null)
        wsRef.current = null
      }

      return () => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.close()
        }
      }
    }
  }, [status.taskId, status.status, onProcessingComplete])

  const startProcessing = useCallback(async () => {
    if (!file) {
      toast.error('No file selected')
      return
    }

    setStatus({
      status: 'uploading',
      progress: 0,
      message: 'Uploading image...'
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('enhancement', processingConfig.enhancement)
    formData.append('face_enhance', processingConfig.faceEnhance.toString())
    formData.append('denoise', processingConfig.denoise.toString())
    formData.append('outscale', processingConfig.outscale.toString())

    try {
      processingTimeRef.current = Date.now()
      
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      setStatus({
        status: 'processing',
        progress: 0,
        message: 'Processing started...',
        taskId: data.task_id,
        originalUrl: data.original_url
      })

    } catch (error) {
      console.error('Processing error:', error)
      setStatus({
        status: 'error',
        progress: 0,
        message: 'Failed to start processing'
      })
      toast.error('Failed to start processing')
    }
  }, [file, processingConfig])

  const downloadResult = useCallback(async () => {
    if (!status.processedUrl) return

    try {
      const response = await fetch(status.processedUrl)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enhanced_${file?.name || 'image.png'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Image downloaded!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download image')
    }
  }, [status.processedUrl, file?.name])

  const resetProcessing = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
    
    setStatus({
      status: 'idle',
      progress: 0,
      message: 'Ready to process'
    })
    
    if (onReset) {
      onReset()
    }
  }, [ws, onReset])

  const getStatusIcon = () => {
    switch (status.status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      case 'processing':
        return <CpuChipIcon className="w-8 h-8 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
      default:
        return <PhotoIcon className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const isProcessingActive = status.status === 'uploading' || status.status === 'processing'
  const isCompleted = status.status === 'completed'
  const hasError = status.status === 'error'

  return (
    <div className="w-full space-y-6">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-6 rounded-xl border-2 transition-all duration-300",
          isCompleted ? "border-green-200 bg-green-50" : 
          hasError ? "border-red-200 bg-red-50" :
          isProcessingActive ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-lg capitalize">
                {status.status === 'idle' ? 'Ready' : status.status}
              </h3>
              <p className="text-sm text-gray-600">{status.message}</p>
            </div>
          </div>
          
          {status.estimatedTime && isProcessingActive && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span>~{formatTime(status.estimatedTime)} remaining</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isProcessingActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(status.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full ${getStatusColor()} transition-all duration-300`}
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!isProcessingActive && !isCompleted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startProcessing}
              disabled={!file}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all",
                file 
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Start Enhancement</span>
            </motion.button>
          )}

          {isCompleted && status.processedUrl && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadResult}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Download Enhanced</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetProcessing}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                <span>Process Another</span>
              </motion.button>
            </>
          )}

          {hasError && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetProcessing}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
            >
              <span>Try Again</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Preview Section */}
      {isCompleted && status.originalUrl && status.processedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Preview Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <EyeIcon className="w-5 h-5" />
              <span>Results Preview</span>
            </h3>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['split', 'before', 'after'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-all capitalize",
                    previewMode === mode
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden border bg-gray-50">
            {previewMode === 'split' && (
              <div className="grid grid-cols-2 gap-0">
                <div className="relative">
                  <img
                    src={status.originalUrl}
                    alt="Original"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Original
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={status.processedUrl}
                    alt="Enhanced"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Enhanced
                  </div>
                </div>
              </div>
            )}
            
            {previewMode === 'before' && (
              <div className="relative">
                <img
                  src={status.originalUrl}
                  alt="Original"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                  Original Image
                </div>
              </div>
            )}
            
            {previewMode === 'after' && (
              <div className="relative">
                <img
                  src={status.processedUrl}
                  alt="Enhanced"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                  Enhanced Image
                </div>
              </div>
            )}
          </div>

          {/* Processing Metrics */}
          {status.metrics && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {status.metrics.processingTime}s
                </div>
                <div className="text-sm text-gray-500">Processing Time</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {status.metrics.enhancement}
                </div>
                <div className="text-sm text-gray-500">Enhancement</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {status.metrics.resolution}
                </div>
                <div className="text-sm text-gray-500">Resolution</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {status.metrics.fileSize}
                </div>
                <div className="text-sm text-gray-500">File Size</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}