'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

function truncate(text: string, max = 120) {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '...'
}

const FALLBACK_STEPS = [
  { id: 'step-01', slug: 'escuchamos', number: '01', title: { es: 'Escuchamos', ca: 'Escoltem' }, shortDescription: { es: 'Entendemos tu visión, tus necesidades y la forma en que quieres vivir.', ca: 'Entenem la teva visió, les teves necessitats i la forma en què vols viure.' } },
  { id: 'step-02', slug: 'disenamos', number: '02', title: { es: 'Diseñamos', ca: 'Dissenyem' }, shortDescription: { es: 'Convertimos las ideas en un proyecto claro, bello y posible.', ca: 'Convertim les idees en un projecte clar, bonic i possible.' } },
  { id: 'step-03', slug: 'construimos', number: '03', title: { es: 'Construimos', ca: 'Construïm' }, shortDescription: { es: 'Coordinamos cada gremio y cuidamos cada acabado.', ca: 'Coordinem cada gremi i cuidem cada acabat.' } },
  { id: 'step-04', slug: 'entregamos', number: '04', title: { es: 'Entregamos', ca: 'Lliurem' }, shortDescription: { es: 'Te entregamos un espacio listo para empezar una nueva etapa.', ca: 'Et lliurem un espai a punt per començar una nova etapa.' } },
]

const FALLBACK_CONTENT = {
  eyebrow: { es: 'Nuestro método', ca: 'El nostre mètode' },
  title: { es: 'La excelencia', ca: "L'excel·lència" },
  titleItalic: { es: 'es un proceso.', ca: 'és un procés.' },
  intro: { es: '', ca: '' },
  steps: FALLBACK_STEPS,
}

export default function MetodoPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/site_content?section=eq.metodo&select=content`,
          {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
            cache: 'no-store',
          }
        )
        if (res.ok) {
          const result = await res.json()
          if (result[0]?.content && result[0].content.steps?.length > 0) {
            setData(result[0].content)
          } else {
            setData(FALLBACK_CONTENT)
          }
        } else {
          setData(FALLBACK_CONTENT)
        }
      } catch {
        setData(FALLBACK_CONTENT)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const content = data || FALLBACK_CONTENT
  const steps = content.steps?.length > 0 ? content.steps : FALLBACK_STEPS

  const eyebrow = ca ? content.eyebrow?.ca || content.eyebrow?.es : content.eyebrow?.es
  const title = ca ? content.title?.ca || content.title?.es : content.title?.es
  const titleItalic = ca ? content.titleItalic?.ca || content.titleItalic?.es : content.titleItalic?.es
  const intro = ca ? content.intro?.ca || content.intro?.es : content.intro?.es

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] flex items-center justify-center text-white/50">
        Cargando...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">
      <TopNav variant="dark" />

      <section className="relative overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-24 px-6 lg:px-10">
        <div className="relative mx-auto max-w-[1380px]">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-10"
            >
              <ArrowLeft className="size-4" />
              {ca ? "Tornar a l'inici" : 'Volver al inicio'}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#d7bd77] mb-6">{eyebrow}</p>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl">
              {title}
              <br />
              <i className="text-[#10B77F]">{titleItalic}</i>
            </h1>
            {intro && (
              <p className="mt-6 max-w-2xl text-base text-white/60 leading-relaxed">{intro}</p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-[1380px] px-6 lg:px-10">
          <div className="border-t border-white/10">
            {steps.map((step: any, index: number) => {
              const stepTitle = ca ? step.title?.ca || step.title?.es : step.title?.es
              const rawDesc = ca ? step.shortDescription?.ca || step.shortDescription?.es : step.shortDescription?.es
              const stepDesc = truncate(rawDesc, 120)
              const stepNumber = step.number || String(index + 1).padStart(2, '0')

              return (
                <motion.div
                  key={step.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    href={`/metodo/${step.slug}`}
                    className="group grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 lg:gap-16 items-center py-10 lg:py-14 border-b border-white/10 hover:border-[#d7bd77]/40 transition-colors"
                  >
                    <div className="relative">
                      <span
                        className="absolute -top-6 lg:-top-12 -left-2 font-serif text-[120px] lg:text-[180px] leading-none text-white/[0.04] select-none pointer-events-none"
                        aria-hidden
                      >
                        {stepNumber}
                      </span>
                      <h2 className="relative font-serif text-3xl lg:text-5xl xl:text-6xl text-white group-hover:text-[#d7bd77] transition-colors duration-500 flex items-center gap-4">
                        {stepTitle}
                        <ArrowUpRight className="size-6 lg:size-8 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-[#d7bd77]" />
                      </h2>
                    </div>
                    <p className="text-sm lg:text-base text-white/60 leading-relaxed lg:pl-8 lg:border-l lg:border-[#10B77F]/40">
                      {stepDesc}
                    </p>
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