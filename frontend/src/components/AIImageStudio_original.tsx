'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import FileUpload from './sections/FileUpload'
import ProcessingOptions from './ProcessingOptions'
import ProcessingInterface from './ProcessingInterface'

type ViewMode = 'upload' | 'options' | 'processing'

export function AIImageStudio() {
  const [currentView, setCurrentView] = useState<ViewMode>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setCurrentView('options')
  }

  const handleOperationSelect = (operation: string, model?: string) => {
    setSelectedOperation(operation)
    setSelectedModel(model || '')
    setCurrentView('processing')
  }

  const handleBackToUpload = () => {
    setCurrentView('upload')
    setUploadedFile(null)
    setSelectedOperation('')
    setSelectedModel('')
  }

  const handleBackToOptions = () => {
    setCurrentView('options')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Image Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your images with cutting-edge AI technology. Remove backgrounds, upscale, enhance quality, and generate stunning visuals.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <FileUpload onFileUpload={handleFileUpload} />
            </motion.div>
          )}

          {currentView === 'options' && uploadedFile && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <ProcessingOptions
                uploadedFile={uploadedFile}
                onSelectOperation={handleOperationSelect}
                onBackToUpload={handleBackToUpload}
              />
            </motion.div>
          )}

          {currentView === 'processing' && uploadedFile && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <ProcessingInterface
                uploadedFile={uploadedFile}
                operation={selectedOperation}
                model={selectedModel}
                onBack={handleBackToOptions}
                onBackToUpload={handleBackToUpload}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}