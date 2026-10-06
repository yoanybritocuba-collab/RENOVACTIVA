import type { Metadata } from 'next'
import { LanguageProvider } from '@/components/language-provider'
import { FloatingNav } from '@/components/FloatingNav'
import { RouteTracker } from '@/components/RouteTracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'Renovactiva SL — Reformas en Barcelona',
  description: 'Reformas de alto nivel en Barcelona. Viviendas, locales, oficinas y fincas. Diseño, calidad y confianza.',
  metadataBase: new URL('https://www.renovactiva.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Renovactiva SL — Reformas en Barcelona',
    description: 'Reformas de alto nivel en Barcelona. Viviendas, locales, oficinas y fincas.',
    url: 'https://www.renovactiva.com',
    siteName: 'Renovactiva SL',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <LanguageProvider>
          <RouteTracker />
          {children}
          <FloatingNav />
        </LanguageProvider>
      </body>
    </html>
  )
}