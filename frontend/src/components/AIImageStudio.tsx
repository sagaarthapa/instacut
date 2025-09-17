'use client'

import { Toaster } from 'react-hot-toast'
import Hero from './sections/Hero'

export default function AIImageStudio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Toaster position="top-right" />
      <Hero />
    </div>
  )
}
