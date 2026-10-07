'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

function pickText(field: any, lang: 'es' | 'ca', fallback = ''): string {
  if (!field) return fallback
  if (typeof field === 'string') return field
  return field[lang] || field.es || field.ca || fallback
}

export default function ServiciosPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.services&select=content`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store',
        })
        if (res.ok) {
          const result = await res.json()
          if (result[0]?.content?.items?.length > 0) {
            setData(result[0].content)
          }
        }
      } catch {}
      finally { setLoading(false) }
    }
    loadData()
  }, [])

  if (loading) {
    return <main className="min-h-screen bg-[#080808] flex items-center justify-center text-white/50">Cargando...</main>
  }

  const content = data || {}
  const items = content.items || []

  const eyebrow = pickText(content.eyebrow, ca ? 'ca' : 'es', ca ? 'El que fem' : 'Lo que hacemos')
  const title = pickText(content.title, ca ? 'ca' : 'es', ca ? 'Una visió' : 'Una visión')
  const titleItalic = pickText(content.titleItalic, ca ? 'ca' : 'es', ca ? 'sense límits.' : 'sin límites.')

  return (
    <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">
      <TopNav variant="dark" />

      <section className="relative overflow-hidden pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <div className="relative mx-auto max-w-[1380px]">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-10">
              <ArrowLeft className="size-4" />
              {ca ? 'Tornar a l\'inici' : 'Volver al inicio'}
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mb-14 lg:mb-20">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl">
              {title}
              <br />
              <i className="text-[#10B77F]">{titleItalic}</i>
            </h1>
          </motion.div>

          <div className="space-y-0">
            {items.slice(0, 4).map((service: any, index: number) => {
              const imageUrl = service.images?.[0] || service.image || ''
              const svcTitle = pickText(service.title, ca ? 'ca' : 'es', '')
              const svcCopy = pickText(service.copy, ca ? 'ca' : 'es', '')
              const area2 = service.area2 || {}
              const area2Image = area2.image || ''
              const hasArea2 = area2Image && (area2.title?.es || area2.title?.ca)

              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={service.href || '#'} className="service-row group relative block border-t border-white/10 py-8 lg:py-12 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_40px_-5px_rgba(16,183,127,0.4)]">
                    <div className={`grid grid-cols-1 gap-4 lg:gap-8 items-center ${hasArea2 ? 'lg:grid-cols-[120px_1fr_1.2fr_420px]' : 'lg:grid-cols-[120px_1fr_1.4fr_200px]'}`}>
                      <div className="flex lg:justify-start">
                        <span className="service-number font-serif text-6xl lg:text-8xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77] group-hover:scale-105 origin-left">{service.number}</span>
                      </div>
                      <div className="lg:pr-4">
                        <h3 className="service-title font-serif text-2xl lg:text-3xl leading-tight transition-colors duration-500 group-hover:text-[#d7bd77]">{svcTitle}</h3>
                      </div>
                      <div className="lg:pr-8">
                        <p className="text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/95 max-w-md">{svcCopy}</p>
                      </div>

                      {!hasArea2 && (
                        <>
                          <div className="hidden lg:block relative h-[180px] overflow-hidden rounded-lg">
                            <div className="absolute inset-0 bg-cover bg-center opacity-0 scale-110 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100" style={{ backgroundImage: `url(${imageUrl})` }} />
                            <div className="absolute inset-0 border border-transparent rounded-lg transition-all duration-500 group-hover:border-[#10B77F]/60" />
                          </div>
                          <div className="lg:hidden relative h-[200px] overflow-hidden rounded-lg mt-4">
                            <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${imageUrl})` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 to-transparent" />
                            <div className="absolute inset-0 border border-[#10B77F]/40 rounded-lg" />
                          </div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex items-center gap-2 text-[#10B77F] group-hover:text-[#d7bd77]">
                            <ArrowUpRight className="size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </div>
                        </>
                      )}

                      {hasArea2 && (
                        <div className="flex gap-4 justify-start lg:justify-end">
                          <div className="relative w-[160px] h-[180px] lg:w-[180px] lg:h-[180px] overflow-hidden rounded-lg border border-[#10B77F]/30 group-hover:border-[#10B77F] transition-all duration-500">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${imageUrl})` }} />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/70 backdrop-blur-sm">
                              <p className="text-[9px] uppercase tracking-[0.14em] text-center text-white/90 font-medium">{ca ? 'Locals' : 'Locales'}</p>
                            </div>
                          </div>
                          <div className="relative w-[160px] h-[180px] lg:w-[180px] lg:h-[180px] overflow-hidden rounded-lg border border-[#10B77F]/30 group-hover:border-[#10B77F] transition-all duration-500">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${area2Image})` }} />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/70 backdrop-blur-sm">
                              <p className="text-[9px] uppercase tracking-[0.14em] text-center text-white/90 font-medium">{ca ? 'Oficines' : 'Oficinas'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-[#10B77F] transition-all duration-700 group-hover:w-full group-hover:bg-[#d7bd77]" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}