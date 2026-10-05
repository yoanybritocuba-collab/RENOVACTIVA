import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/components/language-provider'
import { FloatingNav } from '@/components/FloatingNav'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.renovactiva.com'),

  // ✅ TÍTULO — Aparece en la pestaña del navegador
  // Formato: "Empresa de Construcción y Rehabilitación Integral | Renovactiva"
  title: 'Empresa de Construcción y Rehabilitación Integral | Renovactiva',

  description: 'Empresa de construcción y rehabilitación integral en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',

  generator: 'Renovactiva',
  applicationName: 'Renovactiva',
  authors: [{ name: 'Renovactiva SL' }],
  keywords: [
    'construcción',
    'rehabilitación integral',
    'reformas Barcelona',
    'rehabilitación',
    'construcción',
    'obras',
    'reformas integrales',
    'interiorismo',
    'empresa de construcción',
  ],

  // ============================================================
  // 🖼️ ICONOS — Forzado a v=3 para que los navegadores y Google
  // descarguen el favicon nuevo (logo de Renovactiva).
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
  // 🌐 OPEN GRAPH (WhatsApp, Facebook, LinkedIn, Telegram...)
  // ============================================================
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['ca_ES'],
    url: 'https://www.renovactiva.com',
    siteName: 'Empresa de Construcción y Rehabilitación Integral',
    title: 'Empresa de Construcción y Rehabilitación Integral | Renovactiva',
    description: 'Empresa de construcción y rehabilitación integral en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Renovactiva — Empresa de Construcción y Rehabilitación Integral',
      },
    ],
  },

  // ============================================================
  // 🐦 TWITTER / X
  // ============================================================
  twitter: {
    card: 'summary_large_image',
    title: 'Empresa de Construcción y Rehabilitación Integral | Renovactiva',
    description: 'Empresa de construcción y rehabilitación integral en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',
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

  // ============================================================
  // 🏢 INFORMACIÓN DE LA EMPRESA (Google Business / Schema)
  // ============================================================
  category: 'Construction Company',
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
        {/* ✅ FAVICON FORZADO */}
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />

        {/* ============================================================
            ✅ DATOS ESTRUCTURADOS JSON-LD
            Esto le dice a Google:
            - El nombre de tu web: "Empresa de Construcción y Rehabilitación Integral"
            - El logo oficial
            - Los datos de la empresa
            Google usará esto para mostrar la información correcta.
            ============================================================ */}

        {/* WebSite — Nombre que aparece en Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Empresa de Construcción y Rehabilitación Integral',
              alternateName: 'Renovactiva',
              url: 'https://www.renovactiva.com',
              inLanguage: ['es-ES', 'ca-ES'],
              publisher: {
                '@type': 'Organization',
                name: 'Renovactiva SL',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.renovactiva.com/logo.png',
                },
              },
            }),
          }}
        />

        {/* Organization — Datos oficiales de la empresa */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Empresa de Construcción y Rehabilitación Integral',
              legalName: 'Renovactiva SL',
              alternateName: 'Renovactiva',
              url: 'https://www.renovactiva.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.renovactiva.com/logo.png',
                width: 1200,
                height: 630,
              },
              image: 'https://www.renovactiva.com/logo.png',
              description:
                'Empresa de construcción y rehabilitación integral en Barcelona. Reformas de alto nivel para viviendas, locales comerciales, oficinas y fincas.',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'ES',
                addressLocality: 'Barcelona',
                addressRegion: 'Cataluña',
                postalCode: '08001',
                streetAddress: 'Carrer Exemple 123',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+34 722 454 020',
                email: 'info@renovactiva.com',
                contactType: 'customer service',
                availableLanguage: ['Spanish', 'Catalan'],
                areaServed: 'ES',
              },
              sameAs: ['https://www.renovactiva.com'],
            }),
          }}
        />
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