'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  XMarkIcon,
  DocumentIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  className?: string
  disabled?: boolean
}

export function AdvancedFileUpload({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.tiff']
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
  disabled = false
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): boolean => {
    // Size validation
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }

    // Type validation  
    const acceptedTypes = Object.values(accept).flat()
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!acceptedTypes.includes(fileExtension)) {
      toast.error(`Unsupported file type. Accepted: ${acceptedTypes.join(', ')}`)
      return false
    }

    // Additional image validation
    if (file.type.startsWith('image/')) {
      return validateImageFile(file)
    }

    return true
  }, [accept, maxSize])

  const validateImageFile = useCallback((file: File): boolean => {
    return new Promise<boolean>((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        
        // Check dimensions
        if (img.width > 8192 || img.height > 8192) {
          toast.error('Image too large. Maximum dimensions: 8192x8192px')
          resolve(false)
          return
        }
        
        if (img.width < 50 || img.height < 50) {
          toast.error('Image too small. Minimum dimensions: 50x50px')
          resolve(false)
          return
        }
        
        resolve(true)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        toast.error('Invalid image file')
        resolve(false)
      }
      
      img.src = url
    }) as unknown as boolean
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return
    
    setIsProcessing(true)
    setUploadProgress(0)

    // Create preview
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 20
      })
    }, 200)

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUploadProgress(100)
      onFileSelect(file)
      toast.success('File uploaded successfully!')
      
    } catch (error) {
      toast.error('Upload failed. Please try again.')
      setPreview(null)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [validateFile, onFileSelect])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name}: File too large`)
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name}: Invalid file type`)
          } else {
            toast.error(`${file.name}: ${error.message}`)
          }
        })
      })
    }

    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0])
    }
  }, [handleFile])

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || isProcessing,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const clearPreview = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }, [preview])

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
          "hover:border-blue-400 hover:bg-blue-50/50 hover:scale-[1.02]",
          "active:scale-[0.98]",
          dropzoneActive || isDragActive ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300",
          disabled || isProcessing ? "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100" : "",
          preview ? "border-green-400 bg-green-50/30" : ""
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg shadow-md"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearPreview()
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
              
              <p className="text-sm text-green-600 text-center font-medium">
                ✓ Ready for processing
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <motion.div
                  animate={isDragActive ? { scale: 1.1, rotate: 5 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isDragActive ? (
                    <CloudArrowUpIcon className="w-16 h-16 text-blue-500" />
                  ) : (
                    <PhotoIcon className="w-16 h-16 text-gray-400" />
                  )}
                </motion.div>
              </div>
              
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  {isDragActive ? 'Drop your image here' : 'Upload your image'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop, or click to browse
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                <span>Supports: PNG, JPG, WEBP</span>
                <span>•</span>
                <span>Max: {Math.round(maxSize / 1024 / 1024)}MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
              <span className="font-medium">Processing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Format Info */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-4 p-3 bg-gray-50 rounded-lg"
      >
        <div className="flex items-start space-x-2">
          <DocumentIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1 text-sm text-gray-600">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• <strong>PNG:</strong> Best for images with transparency</li>
              <li>• <strong>JPG/JPEG:</strong> Good for photos and complex images</li>
              <li>• <strong>WEBP:</strong> Modern format with excellent compression</li>
              <li>• <strong>TIFF:</strong> High-quality format for professional use</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Performance Tips */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ delay: 0.2 }}
        className="mt-3 p-3 bg-blue-50 rounded-lg"
      >
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="flex-1 text-sm text-blue-700">
            <p className="font-medium mb-1">For best results:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• Use high-resolution source images</li>
              <li>• Avoid heavily compressed images</li>
              <li>• Ensure good lighting and focus</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}