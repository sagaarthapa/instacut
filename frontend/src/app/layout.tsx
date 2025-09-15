import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Image Studio - Next-Generation Image Editing',
  description: 'Professional AI-powered image editing that surpasses Pixelcut with superior UI, faster processing, and advanced features.',
  keywords: ['AI image editing', 'background removal', 'image upscaling', 'photo editing', 'Pixelcut alternative'],
  authors: [{ name: 'AI Image Studio Team' }],
  creator: 'AI Image Studio',
  publisher: 'AI Image Studio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-image-studio.com',
    title: 'AI Image Studio - Next-Generation Image Editing',
    description: 'Professional AI-powered image editing that surpasses Pixelcut with superior UI, faster processing, and advanced features.',
    siteName: 'AI Image Studio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Image Studio - Next-Generation Image Editing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Studio - Next-Generation Image Editing',
    description: 'Professional AI-powered image editing that surpasses Pixelcut with superior UI, faster processing, and advanced features.',
    images: ['/og-image.jpg'],
    creator: '@aiImageStudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}