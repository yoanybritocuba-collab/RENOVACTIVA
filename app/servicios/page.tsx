'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

export default function ServiciosPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'

  const servicios = [
    {
      number: '01',
      title: ca ? 'Reformes d\'habitatges' : 'Reformas de viviendas',
      copy: ca
        ? 'Transformem el teu habitatge en la llar que sempre has imaginat.'
        : 'Transformamos tu vivienda en el hogar que siempre has imaginado.',
      href: '/reformas-viviendas',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
    },
    {
      number: '02',
      title: ca ? 'Reformes de locals i oficines' : 'Reformas de locales y oficinas',
      copy: ca
        ? 'Creem espais que parlen del teu negoci.'
        : 'Creamos espacios que hablan de tu negocio.',
      href: '/reformas-locales-oficinas',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85',
    },
    {
      number: '03',
      title: ca ? 'Reformes de finques' : 'Reformas de fincas',
      copy: ca
        ? 'Retornem l\'ànima als edificis amb història.'
        : 'Devolvemos el alma a los edificios con historia.',
      href: '/reformas-fincas',
      image: 'https://izvllvunpjryeowponti.supabase.co/storage/v1/object/public/renovactiva-images/services/04/1789254347730-captura-de-pantalla-2026-09-12-225158.png',
    },
  ]

  return (
    <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">
      <TopNav variant="dark" />

      <section className="relative overflow-hidden pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <motion.div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#10B77F]/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#d7bd77]/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative mx-auto max-w-[1380px]">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-10"
            >
              <ArrowLeft className="size-4" />
              {ca ? 'Tornar a l\'inici' : 'Volver al inicio'}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-14 lg:mb-20"
          >
            <p className="eyebrow">
              {ca ? 'El que fem' : 'Lo que hacemos'}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl">
              {ca ? 'Una visió' : 'Una visión'}
              <br />
              <i className="text-[#10B77F]">{ca ? 'sense límits.' : 'sin límites.'}</i>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/60 leading-relaxed">
              {ca
                ? 'Oferim serveis de reforma integrals adaptats a cada tipus de projecte. Tria el que millor s\'adapti a les teves necessitats.'
                : 'Ofrecemos servicios de reforma integrales adaptados a cada tipo de proyecto. Elige el que mejor se adapte a tus necesidades.'}
            </p>
          </motion.div>

          <div className="space-y-0">
            {servicios.map((servicio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={servicio.href}
                  className="service-row group relative block border-t border-white/10 py-8 lg:py-12 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_40px_-5px_rgba(16,183,127,0.4)]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1.4fr_200px] gap-4 lg:gap-8 items-center">
                    <div className="flex lg:justify-start">
                      <span className="service-number font-serif text-6xl lg:text-8xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77] group-hover:scale-105 origin-left">
                        {servicio.number}
                      </span>
                    </div>
                    <div className="lg:pr-4">
                      <h3 className="service-title font-serif text-2xl lg:text-3xl leading-tight transition-colors duration-500 group-hover:text-[#d7bd77]">
                        {servicio.title}
                      </h3>
                    </div>
                    <div className="lg:pr-8">
                      <p className="text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/95 max-w-md">
                        {servicio.copy}
                      </p>
                    </div>
                    <div className="hidden lg:block relative h-[180px] overflow-hidden rounded-lg">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-0 scale-110 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
                        style={{ backgroundImage: `url(${servicio.image})` }}
                      />
                      <div className="absolute inset-0 border border-transparent rounded-lg transition-all duration-500 group-hover:border-[#10B77F]/60" />
                    </div>
                    <div className="lg:hidden relative h-[200px] overflow-hidden rounded-lg mt-4">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-90"
                        style={{ backgroundImage: `url(${servicio.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 to-transparent" />
                      <div className="absolute inset-0 border border-[#10B77F]/40 rounded-lg" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex items-center gap-2 text-[#10B77F] group-hover:text-[#d7bd77]">
                      <ArrowUpRight className="size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-[#10B77F] transition-all duration-700 group-hover:w-full group-hover:bg-[#d7bd77]" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}