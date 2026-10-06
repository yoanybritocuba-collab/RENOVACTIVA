'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function PasoPage() {
  const params = useParams()
  const slug = String(params?.slug || '')
  const { language } = useLanguage()
  const ca = language === 'ca'

  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<any>(null)
  const [nextStep, setNextStep] = useState<any>(null)
  const [prevStep, setPrevStep] = useState<any>(null)

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
          const steps = result[0]?.content?.steps || []
          const idx = steps.findIndex((s: any) => s.slug === slug)
          if (idx !== -1) {
            setStep(steps[idx])
            setPrevStep(idx > 0 ? steps[idx - 1] : null)
            setNextStep(idx < steps.length - 1 ? steps[idx + 1] : null)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] flex items-center justify-center text-white/50">
        Cargando...
      </main>
    )
  }

  if (!step) {
    return (
      <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">
        <TopNav variant="dark" />
        <section className="pt-40 pb-20 px-6 text-center">
          <h1 className="font-serif text-4xl mb-6">Paso no encontrado</h1>
          <Link
            href="/metodo"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors"
          >
            <ArrowLeft className="size-4" />
            {ca ? 'Tornar al mètode' : 'Volver al método'}
          </Link>
        </section>
      </main>
    )
  }

  const stepTitle = ca ? step.title?.ca || step.title?.es : step.title?.es
  const stepSubtitle = ca ? step.subtitle?.ca || step.subtitle?.es : step.subtitle?.es
  const shortDesc = ca ? step.shortDescription?.ca || step.shortDescription?.es : step.shortDescription?.es
  const longDesc = ca ? step.longDescription?.ca || step.longDescription?.es : step.longDescription?.es
  const bullets = ca ? step.bullets?.ca || step.bullets?.es || [] : step.bullets?.es || []
  const gallery = Array.isArray(step.gallery) ? step.gallery.filter((g: string) => g && g.trim()) : []
  const nextTitle = nextStep ? (ca ? nextStep.title?.ca || nextStep.title?.es : nextStep.title?.es) : null
  const prevTitle = prevStep ? (ca ? prevStep.title?.ca || prevStep.title?.es : prevStep.title?.es) : null

  return (
    <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">
      <TopNav variant="dark" />

      <section className="pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <div className="mx-auto max-w-[1380px]">
          <Link
            href="/metodo"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-12"
          >
            <ArrowLeft className="size-4" />
            {ca ? 'Tornar al mètode' : 'Volver al método'}
          </Link>

          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#10B77F]/30">
                {step.image ? (
                  <img
                    src={step.image}
                    alt={stepTitle || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                    Sin imagen
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-6 left-6">
                  <span className="font-serif text-7xl lg:text-8xl leading-none text-[#10B77F] drop-shadow-[0_0_20px_rgba(16,183,127,0.6)]">
                    {step.number}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block text-[10px] uppercase tracking-[0.32em] text-[#d7bd77] font-medium mb-4">
                {ca ? 'Pas' : 'Paso'} {step.number}
              </span>

              {stepSubtitle && (
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#10B77F] mb-3">
                  {stepSubtitle}
                </p>
              )}

              <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl leading-[0.95] tracking-[-0.02em] text-white mb-6">
                {stepTitle}
              </h1>

              {shortDesc && (
                <p className="text-lg text-white/80 leading-relaxed mb-6">{shortDesc}</p>
              )}

              {longDesc && (
                <p className="text-base text-white/60 leading-relaxed mb-8">{longDesc}</p>
              )}

              {bullets.length > 0 && (
                <ul className="space-y-3 mb-10">
                  {bullets.map((bullet: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                      className="flex items-start gap-3 text-base text-white/75"
                    >
                      <span className="flex-shrink-0 mt-2 size-1.5 rounded-full bg-[#10B77F]" />
                      <span className="leading-relaxed">{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              )}

              <div className="h-px w-16 bg-[#10B77F]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALERÍA DE FOTOS */}
      {gallery.length > 0 && (
        <section className="border-t border-white/10 bg-[#0A0A0A] px-6 lg:px-10 py-16 lg:py-20">
          <div className="mx-auto max-w-[1380px]">
            <h2 className="text-[10px] uppercase tracking-[0.32em] text-[#d7bd77] mb-8">
              {ca ? 'Galeria' : 'Galería'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {gallery.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 hover:border-[#10B77F]/50 transition-colors"
                >
                  <img
                    src={img}
                    alt={`${stepTitle} ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PREV / NEXT */}
      {(prevStep || nextStep) && (
        <section className="border-t border-white/10 bg-[#0D0D0D] px-6 lg:px-10 py-10">
          <div className="mx-auto max-w-[1380px] grid grid-cols-2 gap-4">
            <div>
              {prevStep && (
                <Link
                  href={`/metodo/${prevStep.slug}`}
                  className="group flex items-center gap-4 text-left"
                >
                  <ArrowLeft className="size-5 text-[#d7bd77] transition-transform group-hover:-translate-x-1" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-1">
                      {ca ? 'Anterior' : 'Anterior'}
                    </p>
                    <p className="font-serif text-lg lg:text-2xl text-white group-hover:text-[#d7bd77] transition-colors">
                      {prevTitle}
                    </p>
                  </div>
                </Link>
              )}
            </div>
            <div className="text-right">
              {nextStep && (
                <Link
                  href={`/metodo/${nextStep.slug}`}
                  className="group inline-flex items-center gap-4"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-1">
                      {ca ? 'Següent' : 'Siguiente'}
                    </p>
                    <p className="font-serif text-lg lg:text-2xl text-white group-hover:text-[#d7bd77] transition-colors">
                      {nextTitle}
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-[#d7bd77] transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="relative border-t border-white/10 bg-[#080808] px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1380px] text-center">
          <h3 className="font-serif text-4xl lg:text-6xl text-white mb-6">
            {ca ? 'Comencem el teu projecte?' : '¿Empezamos tu proyecto?'}
          </h3>
          <Link
            href="/contacto"
            className="group inline-flex items-center gap-4 bg-[#d7bd77] px-8 py-5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] rounded-lg transition-all duration-500 hover:bg-[#10B77F] hover:scale-105"
          >
            {ca ? 'Parlem del teu projecte' : 'Hablemos de tu proyecto'}
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </section>
    </main>
  )
}