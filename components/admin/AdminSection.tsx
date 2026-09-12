'use client'

import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

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
      <header className="sticky top-0 z-50 bg-[#11110f]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#d7bd77]">{title}</h1>
              <p className="text-white/40 text-xs sm:text-sm">{description}</p>
            </div>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#d7bd77] px-4 py-2 text-[#11110f] rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Save className="size-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </header>

      {error && <div className="max-w-5xl mx-auto px-4 pt-4"><div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">{error}</div></div>}
      {notice && <div className="max-w-5xl mx-auto px-4 pt-4"><div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2.5 rounded-lg text-sm">{notice}</div></div>}

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}