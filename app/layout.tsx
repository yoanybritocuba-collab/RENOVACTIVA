import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/components/language-provider'
import { FloatingNav } from '@/components/FloatingNav'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.renovactiva.com'),
  title: 'Renovactiva SL | Arquitectura, interiorismo y construcción',
  description: 'Reformas de alto nivel para viviendas, locales comerciales y oficinas en Barcelona.',
  generator: 'Renovactiva',
  applicationName: 'Renovactiva',
  authors: [{ name: 'Renovactiva SL' }],
  keywords: ['reformas', 'Barcelona', 'arquitectura', 'interiorismo', 'rehabilitación', 'obras', 'construcción'],

  // ============================================================
  // 🖼️ ICONOS (favicon de la pestaña + apple + android)
  // ============================================================
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-light-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: light)', type: 'image/png' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: dark)', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },

  // ============================================================
  // 🌐 OPEN GRAPH (WhatsApp, Facebook, LinkedIn...)
  // ============================================================
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['ca_ES'],
    url: 'https://www.renovactiva.com',
    siteName: 'Renovactiva SL',
    title: 'Renovactiva SL | Arquitectura, interiorismo y construcción',
    description: 'Reformas de alto nivel para viviendas, locales comerciales y oficinas en Barcelona.',
  },

  // ============================================================
  // 🐦 TWITTER / X
  // ============================================================
  twitter: {
    card: 'summary_large_image',
    title: 'Renovactiva SL | Arquitectura, interiorismo y construcción',
    description: 'Reformas de alto nivel para viviendas, locales comerciales y oficinas en Barcelona.',
  },

  // ============================================================
  // 🤖 ROBOTS
  // ============================================================
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#080808' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* ============================================================
            FAVICON FORZADO (para que los navegadores lo lean primero)
            ============================================================ */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          {children}
          <FloatingNav />
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}