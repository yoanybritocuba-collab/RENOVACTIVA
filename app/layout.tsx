import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/components/language-provider'
import { FloatingNav } from '@/components/FloatingNav'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.renovactiva.com'),
  // ✅ TÍTULO NUEVO (es lo que aparece en Google y en la pestaña del navegador)
  title: 'Renovactiva SL | Rehabilitación integral y construcción',
  description: 'Reformas de alto nivel para viviendas, locales comerciales y oficinas en Barcelona.',
  generator: 'Renovactiva',
  applicationName: 'Renovactiva',
  authors: [{ name: 'Renovactiva SL' }],
  keywords: ['reformas', 'Barcelona', 'arquitectura', 'interiorismo', 'rehabilitación', 'obras', 'construcción'],

  // ============================================================
  // 🖼️ ICONOS — ✅ ahora usan el logo de Renovactiva (public/logo.png)
  // El "?v=2" obliga a los navegadores a descargar el icono nuevo.
  // Si cambias el logo en el futuro, sube el número (v=3, v=4...).
  // ============================================================
  icons: {
    icon: [{ url: '/logo.png?v=2', type: 'image/png' }],
    apple: [{ url: '/logo.png?v=2', type: 'image/png' }],
    shortcut: '/logo.png?v=2',
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
    description: 'Reformas de alto nivel para viviendas, locales comerciales y oficinas en Barcelona.',
  },

  // ============================================================
  // 🐦 TWITTER / X
  // ============================================================
  twitter: {
    card: 'summary_large_image',
    title: 'Renovactiva SL | Rehabilitación integral y construcción',
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
