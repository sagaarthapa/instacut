'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import BeforeAfterSlider from './BeforeAfterSlider'

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
  const [processingProgress, setProcessingProgress] = useState(0)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [processedPreview, setProcessedPreview] = useState<string>('')
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null)
  const [processedDimensions, setProcessedDimensions] = useState<{width: number, height: number} | null>(null)

  useEffect(() => {
    // Create preview of original image
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalPreview(imageUrl)
      
      // Get original image dimensions
      const img = new Image()
      img.onload = () => {
        setOriginalDimensions({
          width: img.width,
          height: img.height
        })
      }
      img.src = imageUrl
    }
    reader.readAsDataURL(uploadedFile)
  }, [uploadedFile])

  const operationTitles: { [key: string]: string } = {
    'background_removal': 'Background Removal',
    'upscale': 'Image Upscaling',
    'enhancement': 'Quality Enhancement',
    'generation': 'AI Generation'
  }

  const handleProcess = async () => {
    console.log('🚀 Starting processing...')
    setIsProcessing(true)
    setProcessingProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('operation', operation)
      formData.append('model', model)

      console.log('📤 Sending processing request...')
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) return 95 // Hard cap at 95% until real completion
          const increment = Math.random() * 10 // Smaller increments (0-10%)
          return Math.min(prev + increment, 95) // Ensure never exceeds 95%
        })
      }, 2000) // Update every 2 seconds
      
      // Create AbortController for timeout - increased to 5 minutes for complex upscaling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Request timeout - aborting after 5 minutes')
        clearInterval(progressInterval)
        controller.abort()
      }, 300000) // 5 minute timeout for complex upscaling

      console.log('📡 Making fetch request to API...')
      console.log('📋 Request details:', {
        url: 'http://localhost:8000/api/v1/process',
        method: 'POST',
        operation,
        model,
        fileType: uploadedFile.type,
        fileSize: uploadedFile.size
      })
      
      const response = await fetch('http://localhost:8000/api/v1/process', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      console.log('📨 Response received:', response.status, response.statusText)

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
            
            // Get processed image dimensions
            const img = new Image()
            img.onload = () => {
              setProcessedDimensions({
                width: img.width,
                height: img.height
              })
            }
            img.src = previewUrl
            
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
      setProcessingProgress(100)
      toast.success('Image processed successfully!')
      
    } catch (error) {
      console.error('❌ Processing error:', error)
      
      // Handle different error types
      let errorMessage: string
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Processing timed out after 5 minutes. Please try with a smaller image or different settings.'
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check if the server is running and try again.'
        } else {
          errorMessage = error.message
        }
      } else {
        errorMessage = 'Processing failed. Please try again.'
      }
      
      toast.error(errorMessage)
    } finally {
      console.log('🔄 Setting isProcessing to false in finally block')
      setIsProcessing(false)
      setProcessingProgress(0)
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
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Processing with Real-ESRGAN AI...</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      High-quality upscaling in progress. This may take up to 5 minutes for complex images.
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
              className="grid gap-6"
            >
              {/* Before/After Slider when both images are available */}
              {originalPreview && processedPreview && (
                <div className="card p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Compare Results - Before vs After
                  </h4>
                  <BeforeAfterSlider
                    beforeImage={originalPreview}
                    afterImage={processedPreview}
                    beforeDimensions={originalDimensions || undefined}
                    afterDimensions={processedDimensions || undefined}
                    beforeLabel="Original"
                    afterLabel="Enhanced"
                  />
                </div>
              )}

              {/* Individual images when only one is available */}
              {(!processedPreview || !originalPreview) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  {originalPreview && (
                    <div className="card p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Original
                      </h4>
                      {originalDimensions && (
                        <p className="text-sm text-gray-500 mb-4">
                          {originalDimensions.width} × {originalDimensions.height} pixels
                        </p>
                      )}
                      <div className="relative">
                        <img
                          src={originalPreview}
                          alt="Original image"
                          className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
                        />
                        {originalDimensions && (
                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {originalDimensions.width} × {originalDimensions.height}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Processed Image or Processing Status */}
                  <div className="card p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {processedPreview ? 'Processed' : (isProcessing ? 'Processing...' : 'Ready')}
                    </h4>
                    {processedDimensions && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          {processedDimensions.width} × {processedDimensions.height} pixels
                        </p>
                        {originalDimensions && operation === 'upscaling' && (
                          <p className="text-sm text-green-600 font-medium">
                            {Math.round((processedDimensions.width / originalDimensions.width) * 100) / 100}× larger
                          </p>
                        )}
                      </div>
                    )}
                    {processedPreview ? (
                      <div className="relative">
                        <img
                          src={processedPreview}
                          alt="Processed image"
                          className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
                        />
                        {processedDimensions && (
                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {processedDimensions.width} × {processedDimensions.height}
                          </div>
                        )}
                      </div>
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
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}