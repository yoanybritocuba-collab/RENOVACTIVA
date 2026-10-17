'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

function pickText(field: any, lang: 'es' | 'ca', fallback = ''): string {
  if (!field) return fallback
  if (typeof field === 'string') return field
  return field[lang] || field.es || field.ca || fallback
}

function Thumb({ url }: { url: string }) {
  return (
    <div className="relative w-[160px] h-[180px] lg:w-[180px] lg:h-[180px] overflow-hidden rounded-lg">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90 lg:opacity-0 lg:scale-110 transition-all duration-700 lg:group-hover:opacity-100 lg:group-hover:scale-100"
        style={{ backgroundImage: `url(${url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 to-transparent lg:hidden" />
      <div className="absolute inset-0 rounded-lg border border-[#10B77F]/40 lg:border-transparent transition-all duration-500 lg:group-hover:border-[#10B77F]/60" />
    </div>
  )
}

type ServiceRowProps = {
  service: any
  index: number
  ca: boolean
}

export function ServiceRow({ service, index, ca }: ServiceRowProps) {
  const lang = ca ? 'ca' : 'es'
  const imageUrl = service.images?.[0] || service.image || ''
  const title = pickText(service.title, lang, '')
  const copy = pickText(service.copy, lang, '')
  const area2 = service.area2 || {}
  const area2Image = area2.image || ''
  const hasArea2 = area2Image && (area2.title?.es || area2.title?.ca)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={service.href || '#'}
        className="service-row group relative block border-t border-white/10 py-8 lg:py-12 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_40px_-5px_rgba(16,183,127,0.4)]"
      >
        <div
          className={`grid grid-cols-1 gap-4 lg:gap-8 items-center ${
            hasArea2 ? 'lg:grid-cols-[120px_1fr_1.2fr_420px]' : 'lg:grid-cols-[120px_1fr_1.4fr_200px]'
          }`}
        >
          <div className="flex lg:justify-start">
            <span className="service-number font-serif text-6xl lg:text-8xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77] group-hover:scale-105 origin-left">
              {service.number}
            </span>
          </div>
          <div className="lg:pr-4">
            <h3 className="service-title font-serif text-2xl lg:text-3xl leading-tight transition-colors duration-500 group-hover:text-[#d7bd77]">
              {title}
            </h3>
          </div>
          <div className="lg:pr-8">
            <p className="text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/95 max-w-md">
              {copy}
            </p>
          </div>

          {!hasArea2 && (
            <>
              <div className="hidden lg:block relative h-[180px] overflow-hidden rounded-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-0 scale-110 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
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
            <>
              <div className="flex gap-4 justify-start lg:justify-end">
                <Thumb url={imageUrl} />
                <Thumb url={area2Image} />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex items-center gap-2 text-[#10B77F] group-hover:text-[#d7bd77]">
                <ArrowUpRight className="size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-0 h-px w-0 bg-[#10B77F] transition-all duration-700 group-hover:w-full group-hover:bg-[#d7bd77]" />
      </Link>
    </motion.div>
  )
}
