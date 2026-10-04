import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/components/language-provider'
import { FloatingNav } from '@/components/FloatingNav'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.renovactiva.com'),
  // ✅ TÍTULO (lo que aparece en Google y en la pestaña del navegador)
  title: 'Renovactiva SL | Rehabilitación integral y construcción',
  description: 'Empresa de rehabilitación integral y construcción en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',
  generator: 'Renovactiva',
  applicationName: 'Renovactiva',
  authors: [{ name: 'Renovactiva SL' }],
  keywords: ['reformas', 'Barcelona', 'rehabilitación', 'construcción', 'obras', 'reformas integrales', 'interiorismo'],

  // ============================================================
  // 🖼️ ICONOS — ✅ Forzado a v=3 para que los navegadores y Google
  // descarguen el favicon nuevo (logo de Renovactiva).
  // Si cambias el logo en el futuro, sube el número (v=4, v=5...).
  // ============================================================
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
      { url: '/logo.png?v=3', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
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
    title: 'Renovactiva SL | Rehabilitación integral y construcción',
    description: 'Empresa de rehabilitación integral y construcción en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Renovactiva SL',
      },
    ],
  },

  // ============================================================
  // 🐦 TWITTER / X
  // ============================================================
  twitter: {
    card: 'summary_large_image',
    title: 'Renovactiva SL | Rehabilitación integral y construcción',
    description: 'Empresa de rehabilitación integral y construcción en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',
    images: ['/logo.png'],
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
        {/* ✅ FAVICON FORZADO (para que el navegador lo lea primero) */}
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
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