'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  className?: string
}

export default function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const validateFile = useCallback((file: File): boolean => {
    // Size validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Please upload an image under 10MB.')
      return false
    }

    // Type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PNG, JPG, or WebP image.')
      return false
    }

    return true
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false)
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (validateFile(file)) {
        onFileUpload(file)
        toast.success('File uploaded successfully!')
      }
    }
  }, [onFileUpload, validateFile])

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${className || ''}`}
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50/50 scale-105' 
            : isDragReject 
            ? 'border-red-400 bg-red-50/50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center space-y-4"
        >
          {isDragActive ? (
            <CloudArrowUpIcon className="w-16 h-16 text-blue-500" />
          ) : (
            <PhotoIcon className="w-16 h-16 text-gray-400" />
          )}
          
          <div>
            <p className="text-xl font-medium text-gray-900">
              {isDragActive ? 'Drop your image here' : 'Upload your image'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Drag and drop an image, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports PNG, JPG, WebP (max 10MB)
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}