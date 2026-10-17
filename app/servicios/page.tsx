'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'
import { ServiceRow } from '@/components/ServiceRow'

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
            {items.slice(0, 4).map((service: any, index: number) => (
              <ServiceRow key={index} service={service} index={index} ca={ca} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
