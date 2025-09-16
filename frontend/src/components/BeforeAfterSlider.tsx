'use client'

import React, { useState, useRef, useEffect } from 'react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeDimensions?: { width: number; height: number }
  afterDimensions?: { width: number; height: number }
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeDimensions,
  afterDimensions,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = ''
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = (x / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, percentage)))
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.body.style.cursor = 'ew-resize'
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.body.style.cursor = 'auto'
    }
  }, [isDragging])

  return (
    <div className={`relative select-none ${className}`}>
      {/* Container */}
      <div
        ref={containerRef}
        className="relative w-full h-64 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-ew-resize"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-contain"
            draggable={false}
          />
          {/* After Label */}
          <div className="absolute top-2 right-2 bg-green-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded font-medium">
            {afterLabel}
            {afterDimensions && (
              <div className="text-[10px] opacity-90">
                {afterDimensions.width} × {afterDimensions.height}
              </div>
            )}
          </div>
        </div>

        {/* Before Image (Foreground with clip-path) */}
        <div
          className="absolute inset-0 transition-all duration-100 ease-out"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-contain"
            draggable={false}
          />
          {/* Before Label */}
          <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded font-medium">
            {beforeLabel}
            {beforeDimensions && (
              <div className="text-[10px] opacity-90">
                {beforeDimensions.width} × {beforeDimensions.height}
              </div>
            )}
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 transition-all duration-100 ease-out"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider Handle */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full cursor-ew-resize shadow-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
          >
            <svg
              className="w-3 h-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quality Improvement Indicator */}
      {beforeDimensions && afterDimensions && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="text-blue-600 dark:text-blue-400">
              📏 Original: {beforeDimensions.width} × {beforeDimensions.height}
            </div>
            <div className="text-green-600 dark:text-green-400">
              ✨ Enhanced: {afterDimensions.width} × {afterDimensions.height}
            </div>
          </div>
          <div className="text-purple-600 dark:text-purple-400 font-medium">
            {Math.round((afterDimensions.width / beforeDimensions.width) * 100) / 100}× larger
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Drag the slider to compare before and after • Click and hold to drag
        </p>
      </div>
    </div>
  )
}