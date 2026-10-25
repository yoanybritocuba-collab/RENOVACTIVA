'use client'

import Link from 'next/link'
import { ArrowLeft, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function ProyectosPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para la galería
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

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

  // Lógica de teclado y scroll
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedProject) return
      if (e.key === 'Escape') { setSelectedProject(null) }
      else if (e.key === 'ArrowLeft') { prevPhoto() }
      else if (e.key === 'ArrowRight') { nextPhoto() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProject])

  useEffect(() => {
    if (selectedProject) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [selectedProject])

  const nextPhoto = () => { if (!selectedProject) return; const total = selectedProject.images?.length || 1; setCurrentPhotoIndex(prev => prev < total - 1 ? prev + 1 : 0) }
  const prevPhoto = () => { if (!selectedProject) return; const total = selectedProject.images?.length || 1; setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : total - 1) }

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
                    onClick={() => { setSelectedProject(project); setCurrentPhotoIndex(0) }}
                    className={`group relative overflow-hidden rounded-lg min-h-[400px] border border-[#10B77F]/30 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.55)] cursor-pointer ${
                      isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                    }`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
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

      {/* MODAL GALERÍA */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={() => setSelectedProject(null)}>
            <motion.div className="relative w-full h-full sm:max-w-6xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#10B77F]/30 shadow-[0_0_80px_20px_rgba(16,183,127,0.3)] flex flex-col" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}>
              <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-black/50 backdrop-blur-sm z-20">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-medium truncate">{selectedProject.type}</p>
                  <h3 className="font-serif text-lg sm:text-2xl text-white truncate">{selectedProject.title}</h3>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-[#d7bd77]">
                    <Camera className="size-4" />
                    <span className="text-sm font-medium">{currentPhotoIndex + 1} / {selectedProject.images?.length || 1}</span>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="flex items-center justify-center size-9 sm:size-10 rounded-full border border-white/20 hover:border-[#10B77F] hover:bg-[#10B77F]/20 text-white/80 hover:text-white transition-all duration-300" aria-label="Cerrar galería">
                    <X className="size-5" />
                  </button>
                </div>
              </div>
              <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black select-none">
                <AnimatePresence mode="wait">
                  <motion.img key={currentPhotoIndex} src={selectedProject.images?.[currentPhotoIndex] || selectedProject.image || ''} alt={`${selectedProject.title} - ${currentPhotoIndex + 1}`} className="max-w-full max-h-full object-contain" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset }) => { const swipe = offset.x; if (swipe < -50) nextPhoto(); else if (swipe > 50) prevPhoto() }} />
                </AnimatePresence>
                {/* FLECHAS: Ocultas en móvil (hidden), visibles desde sm en adelante (sm:flex) */}
                {(selectedProject.images?.length || 1) > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); prevPhoto() }} className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 items-center justify-center size-11 sm:size-14 rounded-full bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 hover:border-[#10B77F] hover:bg-[#10B77F]/30 text-white transition-all duration-300 group z-10" aria-label="Foto anterior">
                    <ChevronLeft className="size-6 sm:size-7 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  </button>
                )}
                {(selectedProject.images?.length || 1) > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); nextPhoto() }} className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 items-center justify-center size-11 sm:size-14 rounded-full bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 hover:border-[#10B77F] hover:bg-[#10B77F]/30 text-white transition-all duration-300 group z-10" aria-label="Foto siguiente">
                    <ChevronRight className="size-6 sm:size-7 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
              {(selectedProject.images?.length || 1) > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-4 bg-black/50 backdrop-blur-sm overflow-x-auto">
                  {selectedProject.images?.map((_: string, i: number) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i) }} className={`flex-shrink-0 rounded-full transition-all duration-300 ${i === currentPhotoIndex ? 'w-6 sm:w-8 h-2 bg-[#10B77F]' : 'w-2 h-2 bg-white/30 hover:bg-[#d7bd77]/70'}`} aria-label={`Ir a foto ${i + 1}`} />
                  ))}
                </div>
              )}
              <div className="sm:hidden flex items-center justify-center gap-2 py-2 text-[#d7bd77] text-xs border-t border-white/10 bg-black/50">
                <Camera className="size-3" />
                <span>{currentPhotoIndex + 1} / {selectedProject.images?.length || 1}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}