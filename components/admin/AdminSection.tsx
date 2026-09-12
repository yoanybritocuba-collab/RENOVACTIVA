'use client'

import Link from 'next/link'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AdminSectionProps {
  title: string
  description: string
  children: React.ReactNode
  onSave?: () => void
  saving?: boolean
  error?: string
  notice?: string
  previewUrl?: string
  lastUpdated?: string
}

export default function AdminSection({ 
  title, 
  description, 
  children, 
  onSave, 
  saving = false,
  error = '',
  notice = '',
  previewUrl = '/',
  lastUpdated
}: AdminSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      <header className="sticky top-0 z-50 bg-[#11110f]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/40 hover:text-white transition-colors p-1.5 -ml-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-lg sm:text-2xl text-[#d7bd77] truncate">{title}</h1>
              <p className="text-white/40 text-xs sm:text-sm truncate">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdated && (
              <span className="text-white/30 text-[10px] hidden sm:inline">
                Última actualización: {lastUpdated}
              </span>
            )}
            <Link href={previewUrl} target="_blank" className="flex items-center gap-1.5 border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-white/60 hover:bg-white/5 transition-colors rounded-lg">
              <Eye className="size-3.5" /> Ver en web
            </Link>
            {onSave && (
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#d7bd77] px-4 py-1.5 text-[#11110f] rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium"
              >
                <Save className="size-4" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {notice}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8 pt-2">
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}