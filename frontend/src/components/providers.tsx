'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
          },
          success: {
            style: {
              background: 'rgba(34, 197, 94, 0.9)',
              color: 'white',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}