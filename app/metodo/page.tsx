'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

export default function MetodoPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'

  const pasos = [
    {
      number: '01',
      title: ca ? 'Escoltem' : 'Escuchamos',
      description: ca
        ? 'Entenem la teva visió, les teves necessitats i la forma en què vols viure.'
        : 'Entendemos tu visión, tus necesidades y la forma en que quieres vivir.',
    },
    {
      number: '02',
      title: ca ? 'Dissenyem' : 'Diseñamos',
      description: ca
        ? 'Convertim les idees en un projecte clar, bell i possible.'
        : 'Convertimos las ideas en un proyecto claro, bello y posible.',
    },
    {
      number: '03',
      title: ca ? 'Construïm' : 'Construimos',
      description: ca
        ? 'Coordinem cada ofici i cuidem cada acabat.'
        : 'Coordinamos cada gremio y cuidamos cada acabado.',
    },
    {
      number: '04',
      title: ca ? 'Lliurem' : 'Entregamos',
      description: ca
        ? 'Et lliurem un espai a punt per començar una nova etapa.'
        : 'Te entregamos un espacio listo para empezar una nueva etapa.',
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
              {ca ? 'El nostre mètode' : 'Nuestro método'}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl">
              {ca ? 'L\'excel·lència' : 'La excelencia'}
              <br />
              <i className="text-[#10B77F]">{ca ? 'és un procés.' : 'es un proceso.'}</i>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-white/60 leading-relaxed">
              {ca
                ? 'Cada projecte és únic. Per això treballem amb un mètode clar, transparent i professional que garanteix resultats d\'excel·lència.'
                : 'Cada proyecto es único. Por eso trabajamos con un método claro, transparente y profesional que garantiza resultados de excelencia.'}
            </p>
          </motion.div>

          <div className="space-y-0">
            {pasos.map((paso, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="method-row group relative py-10 lg:py-14 px-2 border-t border-white/10">
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[120px_1fr_1.4fr] gap-4 lg:gap-8 items-center">
                    <div>
                      <span className="font-serif text-6xl lg:text-8xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77] origin-left">
                        {paso.number}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl lg:text-4xl text-white transition-colors duration-500 group-hover:text-[#d7bd77]">
                        {paso.title}
                      </h3>
                    </div>
                    <div>
                      <p className="text-sm lg:text-base leading-relaxed text-white/65 transition-colors duration-500 group-hover:text-white/95">
                        {paso.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}