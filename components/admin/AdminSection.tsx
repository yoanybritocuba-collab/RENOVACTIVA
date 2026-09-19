'use client'

import Link from 'next/link'
import { ArrowLeft, Save, Languages } from 'lucide-react'

interface AdminSectionProps {
  title: string
  description: string
  children: React.ReactNode
  onSave?: () => void
  saving?: boolean
  error?: string
  notice?: string
}

export default function AdminSection({ 
  title, 
  description, 
  children, 
  onSave, 
  saving = false,
  error = '',
  notice = ''
}: AdminSectionProps) {
  return (
    <div className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      <header className="sticky top-0 z-[100] bg-[#11110f]/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link 
              href="/admin" 
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0"
              aria-label="Volver"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-lg sm:text-xl lg:text-2xl text-[#d7bd77] truncate">{title}</h1>
              <p className="text-white/40 text-xs sm:text-sm truncate">{description}</p>
            </div>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm font-medium shadow-lg ${
                notice
                  ? 'bg-green-500 text-white hover:bg-green-600 scale-105'
                  : 'bg-[#d7bd77] text-[#11110f] hover:bg-white hover:scale-105'
              }`}
            >
              <Save className="size-4" />
              <Languages className="size-4 hidden sm:inline" />
              <span className="hidden sm:inline">
                {saving ? 'Guardando...' : notice ? 'Guardado' : 'Guardar y traducir'}
              </span>
              <span className="sm:hidden">
                {saving ? '...' : notice ? 'OK' : 'Guardar'}
              </span>
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">{error}</div>
        </div>
      )}
      {notice && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2.5 rounded-lg text-sm">{notice}</div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}