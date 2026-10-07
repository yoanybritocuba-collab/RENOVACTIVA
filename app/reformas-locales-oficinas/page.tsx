'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

// 🖼️ IMAGEN DEL HERO (sala moderna sin personas, nunca se corta)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90'

function pickText(field: any, lang: 'es' | 'ca', fallback = ''): string {
  if (!field) return fallback
  if (typeof field === 'string') return field
  return field[lang] || field.es || field.ca || fallback
}

type Area = {
  title: string
  copy: string
  image: string
}

export default function ReformasLocalesOficinasPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'

  const [loading, setLoading] = useState(true)
  const [area1, setArea1] = useState<Area | null>(null)
  const [area2, setArea2] = useState<Area | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.services&select=content`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store',
        })
        if (res.ok) {
          const result = await res.json()
          const items = result[0]?.content?.items || []
          const svc = items.find((s: any) => s.href === '/reformas-locales-oficinas') || items[2]
          if (svc) {
            setArea1({
              title: pickText(svc.title, ca ? 'ca' : 'es', ca ? 'Locals comercials' : 'Locales comerciales'),
              copy: pickText(svc.copy, ca ? 'ca' : 'es', ''),
              image: svc.images?.[0] || svc.image || '',
            })
            if (svc.area2 && (svc.area2.image || svc.area2.title?.es)) {
              setArea2({
                title: pickText(svc.area2.title, ca ? 'ca' : 'es', ca ? 'Oficines' : 'Oficinas'),
                copy: pickText(svc.area2.copy, ca ? 'ca' : 'es', ''),
                image: svc.area2.image || '',
              })
            }
          }
        }
      } catch {}
      finally { setLoading(false) }
    }
    loadData()
  }, [ca])

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

      {/* HERO con imagen fija de sala moderna */}
      <section className="relative min-h-[520px] lg:min-h-[620px] overflow-hidden flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/70 to-black/40" />

        <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 lg:px-10 pb-14 lg:pb-20 pt-32 lg:pt-40">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-8"
            >
              <ArrowLeft className="size-4" />
              {ca ? 'Tornar als serveis' : 'Volver a servicios'}
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[10px] uppercase tracking-[0.32em] text-[#d7bd77] mb-4"
          >
            {ca ? 'Serveis · 03' : 'Servicios · 03'}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl max-w-4xl"
          >
            {ca ? 'Reformes de' : 'Reformas de'}
            <br />
            <i className="text-[#10B77F]">
              {ca ? 'locals i oficines.' : 'locales y oficinas.'}
            </i>
          </motion.h1>
        </div>
      </section>

      {/* BLOQUE 1: LOCALES — texto izq, foto dcha */}
      {area1 && (
        <section className="bg-[#080808] border-t border-white/10 px-6 lg:px-10 py-20 lg:py-28">
          <div className="mx-auto max-w-[1380px] grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#d7bd77] mb-4">
                {ca ? '01 · Locals comercials' : '01 · Locales comerciales'}
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl leading-[0.95] tracking-[-0.02em] text-white mb-6">
                {area1.title}
              </h2>
              {area1.copy && (
                <p className="text-base lg:text-lg leading-relaxed text-white/70 max-w-xl">
                  {area1.copy}
                </p>
              )}
              <div className="h-px w-16 bg-[#10B77F] mt-8" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#10B77F]/30">
                {area1.image && (
                  <img
                    src={area1.image}
                    alt={area1.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* BLOQUE 2: OFICINAS — foto izq, texto dcha */}
      {area2 && (
        <section className="bg-[#080808] border-t border-white/10 px-6 lg:px-10 py-20 lg:py-28">
          <div className="mx-auto max-w-[1380px] grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:order-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#10B77F]/30">
                {area2.image && (
                  <img
                    src={area2.image}
                    alt={area2.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:order-1"
            >
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#d7bd77] mb-4">
                {ca ? '02 · Oficines' : '02 · Oficinas'}
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl leading-[0.95] tracking-[-0.02em] text-white mb-6">
                {area2.title}
              </h2>
              {area2.copy && (
                <p className="text-base lg:text-lg leading-relaxed text-white/70 max-w-xl">
                  {area2.copy}
                </p>
              )}
              <div className="h-px w-16 bg-[#10B77F] mt-8" />
            </motion.div>
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