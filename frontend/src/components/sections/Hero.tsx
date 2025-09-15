'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import ProcessingOptions from '@/components/ProcessingOptions'
import ProcessingInterface from '@/components/ProcessingInterface'

export default function Hero() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentView, setCurrentView] = useState<'upload' | 'options' | 'processing'>('upload')
  const [selectedOperation, setSelectedOperation] = useState<{operation: string, model: string} | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      handleFileUpload(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('File too large. Please upload an image under 10MB.')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a PNG, JPG, or WebP image.')
      } else {
        toast.error('File upload failed. Please try again.')
      }
    }
  })

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      
      // Send to backend API
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed:', response.status, errorText)
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      toast.success('Image uploaded successfully!')
      setCurrentView('options')
      
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      toast.error(errorMessage)
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonUpload = () => {
    // Trigger the hidden file input
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setUploadedFile(file)
        handleFileUpload(file)
      }
    }
    fileInput.click()
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setCurrentView('upload')
    setSelectedOperation(null)
  }

  const handleProcessingSelect = (operation: string, model?: string) => {
    setSelectedOperation({ operation, model: model || 'default' })
    setCurrentView('processing')
  }

  const handleBackToOptions = () => {
    setCurrentView('options')
    setSelectedOperation(null)
  }

  // Render different views based on current state
  if (currentView === 'options' && uploadedFile) {
    return (
      <ProcessingOptions
        uploadedFile={uploadedFile}
        onBackToUpload={resetUpload}
        onSelectOperation={handleProcessingSelect}
      />
    )
  }

  if (currentView === 'processing' && uploadedFile && selectedOperation) {
    return (
      <ProcessingInterface
        uploadedFile={uploadedFile}
        operation={selectedOperation.operation}
        model={selectedOperation.model}
        onBack={handleBackToOptions}
        onBackToUpload={resetUpload}
      />
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-secondary-400/30 to-accent-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-float delay-100"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-5"></div>

      <div className="relative z-10 container-responsive text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 mb-8 glass rounded-full"
          >
            <SparklesIcon className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Better than Pixelcut.ai - Faster, Smarter, More Beautiful
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            AI Image Studio{' '}
            <br />
            <span className="text-gradient">Next-Gen Editing</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of image editing with our next-generation AI platform. 
            Superior design, faster processing, and more powerful features than any competitor.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              variant="gradient"
              size="xl"
              onClick={handleButtonUpload}
              isLoading={isUploading}
              leftIcon={<SparklesIcon className="w-5 h-5" />}
              className="min-w-[200px]"
            >
              {isUploading ? 'Processing...' : 'Start Creating Free'}
            </Button>
            
            <Button
              variant="ghost"
              size="xl"
              rightIcon={<ArrowRightIcon className="w-5 h-5" />}
              className="min-w-[200px]"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Upload area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mx-auto max-w-2xl"
          >
            <div 
              {...getRootProps()} 
              className={`upload-area p-12 text-center cursor-pointer group transition-all duration-300 ${
                isDragActive ? 'upload-area-active' : 'hover:upload-area-active'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isDragActive ? 'Drop your image here' : uploadedFile ? uploadedFile.name : 'Drop your image here'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isDragActive ? 'Release to upload' : 'Or click to browse • PNG, JPG, WebP up to 10MB'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Featured in leading publications and trusted by creators worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-70">
              {/* Styled brand logo placeholders */}
              <div className="flex items-center justify-center px-4 py-2 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-200/20 dark:border-gray-700/20 hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">TechCrunch</span>
              </div>
              <div className="flex items-center justify-center px-4 py-2 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-200/20 dark:border-gray-700/20 hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Forbes</span>
              </div>
              <div className="flex items-center justify-center px-4 py-2 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-200/20 dark:border-gray-700/20 hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Wired</span>
              </div>
              <div className="flex items-center justify-center px-4 py-2 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-200/20 dark:border-gray-700/20 hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Verge</span>
              </div>
              <div className="flex items-center justify-center px-4 py-2 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-200/20 dark:border-gray-700/20 hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mashable</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}