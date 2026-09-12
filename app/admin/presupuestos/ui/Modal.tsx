'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full ${SIZES[size]} bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10">
            <div>
              {title && <h2 className="font-serif text-xl text-white">{title}</h2>}
              {description && <p className="text-white/40 text-sm mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}