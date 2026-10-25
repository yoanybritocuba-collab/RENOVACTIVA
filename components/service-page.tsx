'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

type ServicePageProps = {
  number: string
  title: { es: string; ca: string }
  accent: { es: string; ca: string }
  heading: { es: React.ReactNode; ca: React.ReactNode }
  copy: { es: string; ca: string }
  image: string
}

export function ServicePage({ number, title, accent, heading, copy, image }: ServicePageProps) {
  const { language } = useLanguage()
  const ca = language === 'ca'
  
  return (
    <main className="min-h-screen bg-[#10100f] text-[#f3f0e9]">
      <div className="relative min-h-[580px] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
        <div className="absolute inset-0 bg-black/65" />
        <TopNav variant="dark" />
        
        <div className="relative mx-auto flex min-h-[580px] max-w-[1380px] flex-col justify-end px-6 py-7 lg:px-10">
          <div className="pt-32">
            
            {/* 👇 AQUÍ ESTÁ EL BOTÓN AÑADIDO 👇 */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Link
                href="/servicios"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-8"
              >
                <ArrowLeft className="size-4" />
                {ca ? 'Tornar als serveis' : 'Volver a servicios'}
              </Link>
            </motion.div>
            {/* 👆 FIN DEL BOTÓN AÑADIDO 👆 */}

            <p className="eyebrow">{ca ? `Serveis · ${number}` : `Servicios · ${number}`}</p>
            <h1 className="font-serif text-6xl leading-none sm:text-8xl">
              {ca ? title.ca : title.es}
              <br />
              <i className="text-[#d7bd77]">{ca ? accent.ca : accent.es}</i>
            </h1>
          </div>
        </div>
      </div>
      <section className="mx-auto grid max-w-[1380px] gap-14 px-6 py-24 lg:grid-cols-[.65fr_1.35fr] lg:px-10">
        <div>
          <p className="eyebrow">{ca ? 'La nostra mirada' : 'Nuestra mirada'}</p>
          <h2 className="section-title">{heading[language]}</h2>
          <Link href="/contacto" className="mt-8 inline-flex items-center gap-3 border-b border-[#d7bd77] pb-2 text-[11px] uppercase tracking-[.2em] text-[#d7bd77]">
            {ca ? 'Demanar pressupost' : 'Solicitar presupuesto'} <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <p className="max-w-3xl text-xl leading-[1.8] text-white/65">{copy[language]}</p>
      </section>
    </main>
  )
}