'use client'

import Link from 'next/link'
import { ArrowLeft, Camera } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function ProyectosPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?select=*&order=orden.asc`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          setProjects(data.map((t: any) => ({
            title: t.titulo,
            type: t.tipo,
            image: t.imagenes?.[0] || '',
            images: t.imagenes || [],
          })))
        }
      } catch (err) {
        console.error('Error cargando proyectos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

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
              {ca ? 'Una selecció' : 'Una selección'}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl">
              {ca ? 'El resultat' : 'El resultado'}
              <br />
              <i className="text-[#10B77F]">{ca ? 'parla per si sol.' : 'habla por sí solo.'}</i>
            </h1>
          </motion.div>

          {loading ? (
            <div className="text-white/50 text-center py-20">Cargando proyectos...</div>
          ) : projects.length === 0 ? (
            <div className="text-white/50 text-center py-20">
              {ca ? 'Pròximament...' : 'Próximamente...'}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {projects.map((project, index) => {
                const isWide = index % 4 === 0 || index % 4 === 3
                const photoCount = project.images?.length || 1
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative overflow-hidden rounded-lg min-h-[400px] border border-[#10B77F]/30 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.55)] ${
                      isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 rounded-full px-3 py-1.5">
                      <Camera className="size-3 text-[#10B77F]" />
                      <span className="text-[10px] font-medium text-[#10B77F]">{photoCount}</span>
                    </div>

                    <div className="relative flex h-full min-h-[400px] flex-col justify-end p-7">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="block w-8 h-px bg-[#10B77F]" />
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-medium">
                          {project.type}
                        </p>
                      </div>
                      <h3 className="font-serif text-3xl text-white group-hover:text-[#d7bd77] transition-colors duration-500">
                        {project.title}
                      </h3>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}