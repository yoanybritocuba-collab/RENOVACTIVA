'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Image as ImageIcon, FolderOpen, Trash2 } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function TrabajosPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.projects&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        setProjects(result[0].content?.items || [])
      }
    } catch (err) { 
      setError('Error: ' + (err as Error).message) 
    } finally { 
      setLoading(false) 
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">
        Cargando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#11110f]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#d7bd77]">📁 Trabajos</h1>
              <p className="text-white/40 text-xs sm:text-sm">
                Álbum de proyectos ({projects.length})
              </p>
            </div>
          </div>
          <Link
            href="/admin/trabajos/nuevo"
            className="flex items-center gap-2 bg-[#d7bd77] px-4 py-2 text-[#11110f] rounded-lg hover:bg-white transition-colors text-sm font-medium"
          >
            <Plus className="size-4" />
            Añadir trabajo
          </Link>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {projects.length === 0 ? (
          <div className="border border-white/10 bg-white/[.02] rounded-xl p-12 text-center">
            <FolderOpen className="size-12 mx-auto text-white/20 mb-4" />
            <p className="text-white/60 mb-2">No hay trabajos todavía</p>
            <p className="text-white/30 text-sm mb-6">
              Añade tu primer proyecto al portafolio
            </p>
            <Link
              href="/admin/trabajos/nuevo"
              className="inline-flex items-center gap-2 bg-[#d7bd77] px-6 py-3 text-[#11110f] rounded-lg hover:bg-white transition-colors font-medium"
            >
              <Plus className="size-4" />
              Crear primer trabajo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <Link
                key={index}
                href={`/admin/trabajos/${index}`}
                className="group border border-white/10 bg-white/[.02] rounded-xl overflow-hidden hover:border-[#d7bd77]/50 transition-colors"
              >
                <div className="aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
                  {project.image ? (
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="size-10 text-white/20" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] mb-1">
                    {project.type || 'Sin categoría'}
                  </p>
                  <h3 className="font-serif text-lg text-white mb-2">
                    {project.title || 'Sin título'}
                  </h3>
                  {project.description && (
                    <p className="text-white/40 text-xs line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}