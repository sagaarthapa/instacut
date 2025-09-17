'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { 
  ScissorsIcon, 
  ArrowsPointingOutIcon, 
  SparklesIcon,
  PhotoIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface ProcessingOptionsProps {
  uploadedFile: File
  onSelectOperation: (operation: string, model?: string) => void
  onBackToUpload: () => void
}

export default function ProcessingOptions({ 
  uploadedFile, 
  onSelectOperation, 
  onBackToUpload 
}: ProcessingOptionsProps) {

  const operations = [
    {
      id: 'background_removal',
      title: 'Remove Background',
      description: 'Remove background from your image with AI precision',
      icon: <ScissorsIcon className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500',
      model: 'rembg'
    },
    {
      id: 'upscaling',
      title: 'Upscale Image',
      description: 'Enhance image resolution up to 4x with AI',
      icon: <ArrowsPointingOutIcon className="w-8 h-8" />,
      gradient: 'from-green-500 to-emerald-500',
      model: 'realesrgan_4x'
    },
    {
      id: 'enhancement',
      title: 'Enhance Quality',
      description: 'Improve image quality and restore details',
      icon: <SparklesIcon className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      model: 'gfpgan'
    },
    {
      id: 'generation',
      title: 'AI Generate',
      description: 'Create variations using AI generation',
      icon: <PhotoIcon className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500',
      model: 'stable_diffusion'
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-secondary-400/30 to-accent-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-200"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-5"></div>

      <div className="relative z-10 container-responsive text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 flex justify-start"
          >
            <Button
              variant="ghost"
              onClick={onBackToUpload}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Upload Different Image
            </Button>
          </motion.div>

          {/* File info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Image Uploaded Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">{uploadedFile.name}</span> • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            What would you like to do?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto"
          >
            Choose from our powerful AI-driven image processing options
          </motion.p>

          {/* Processing options grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {operations.map((operation, index) => (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="card p-6 text-center cursor-pointer group hover:card-hover transition-all duration-300"
                onClick={() => onSelectOperation(operation.id, operation.model)}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${operation.gradient} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                  {operation.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {operation.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {operation.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Advanced options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Need more options? Advanced settings available after selection
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}