'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface ProcessingInterfaceProps {
  uploadedFile: File
  operation: string
  model: string
  onBack: () => void
  onBackToUpload: () => void
}

export default function ProcessingInterface({ 
  uploadedFile, 
  operation, 
  model, 
  onBack, 
  onBackToUpload 
}: ProcessingInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResult, setProcessedResult] = useState<any>(null)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [processedPreview, setProcessedPreview] = useState<string>('')

  useEffect(() => {
    // Create preview of original image
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string)
    }
    reader.readAsDataURL(uploadedFile)
  }, [uploadedFile])

  const operationTitles: { [key: string]: string } = {
    'background_removal': 'Background Removal',
    'upscaling': 'Image Upscaling',
    'enhancement': 'Quality Enhancement',
    'generation': 'AI Generation'
  }

  const handleProcess = async () => {
    console.log('🚀 Starting processing...')
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('operation', operation)
      formData.append('model', model)

      console.log('📤 Sending processing request...')
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch('http://localhost:8000/api/v1/process', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Processing failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('📋 Processing result:', result); // Debug log
      
      // Check if the result indicates an error
      if (result.status === 'error') {
        throw new Error(result.error || 'Processing failed on server');
      }
      
      console.log('✅ Setting processed result...')
      setProcessedResult(result)
      
      // If there's a processed image path, try to create preview (optional)
      if (result.result?.output_path) {
        try {
          console.log('🖼️ Attempting to load image preview...')
          // Fetch the processed image for preview
          const imageResponse = await fetch(`http://localhost:8000/api/v1/download/${result.result.output_filename}`)
          if (imageResponse.ok) {
            const blob = await imageResponse.blob()
            const previewUrl = URL.createObjectURL(blob)
            setProcessedPreview(previewUrl)
            console.log('✅ Image preview loaded successfully')
          } else {
            console.warn('⚠️ Failed to load image preview, but processing was successful')
          }
        } catch (previewError) {
          console.warn('⚠️ Failed to load image preview:', previewError)
          // Don't let preview failure affect the main processing success
        }
      }
      
      console.log('🎉 Processing completed successfully!')
      toast.success('Image processed successfully!')
      
    } catch (error) {
      console.error('❌ Processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Processing failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      console.log('🔄 Setting isProcessing to false in finally block')
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    console.log('🔽 Download requested')
    console.log('ProcessedResult:', processedResult)
    
    if (!processedResult?.result?.output_path) {
      console.error('❌ No output_path in processedResult.result')
      toast.error('No processed file available for download')
      return
    }
    
    if (!processedResult?.result?.output_filename) {
      console.error('❌ No output_filename in processedResult.result')
      toast.error('No filename available for download')
      return
    }
    
    try {
      const downloadUrl = `http://localhost:8000/api/v1/download/${processedResult.result.output_filename}`
      console.log('📥 Downloading from:', downloadUrl)
      
      const response = await fetch(downloadUrl)
      console.log('📡 Download response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Download failed:', response.status, errorText)
        throw new Error(`Download failed: ${response.status} - ${errorText}`)
      }
      
      const blob = await response.blob()
      console.log('📦 Blob size:', blob.size, 'bytes')
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Use the backend's output_filename instead of original filename
      a.download = processedResult.result.output_filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('✅ Download completed successfully')
      toast.success('Download completed!')
      
    } catch (error) {
      console.error('❌ Download error:', error)
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-secondary-400/30 to-accent-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-200"></div>
      </div>

      <div className="relative z-10 container-responsive">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 flex gap-4"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back to Options
            </Button>
            <Button
              variant="ghost"
              onClick={onBackToUpload}
              className="text-gray-500"
            >
              New Image
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {operationTitles[operation]}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              File: <span className="font-medium">{uploadedFile.name}</span>
            </p>
          </motion.div>

          {/* Processing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="glass rounded-2xl p-8 mb-8"
          >
            {!processedResult || isProcessing ? (
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ready to process your image
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Using {model} model for optimal results
                </p>
                
                <Button
                  variant="gradient"
                  size="xl"
                  onClick={handleProcess}
                  isLoading={isProcessing}
                  className="min-w-[200px]"
                >
                  {isProcessing ? 'Processing...' : 'Start Processing'}
                </Button>
                
                {isProcessing && (
                  <div className="mt-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">
                      Processing with AI... This may take up to 60 seconds for high-quality results.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please don't close this tab while processing.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Processing Complete!
                </h3>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="gradient"
                    onClick={handleDownload}
                    leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
                  >
                    Download Result
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onBack}
                  >
                    Try Another Effect
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Preview Section */}
          {(originalPreview || processedPreview) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Original Image */}
              <div className="card p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Original
                </h4>
                {originalPreview && (
                  <img
                    src={originalPreview}
                    alt="Original image"
                    className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
                  />
                )}
              </div>

              {/* Processed Image */}
              <div className="card p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {processedPreview ? 'Processed' : (isProcessing ? 'Processing...' : 'Ready')}
                </h4>
                {processedPreview ? (
                  <img
                    src={processedPreview}
                    alt="Processed image"
                    className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Processing...</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Click "Start Processing" to begin</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}