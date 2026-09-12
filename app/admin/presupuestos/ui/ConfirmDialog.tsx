'use client'

import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

const VARIANTS = {
  danger: { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-400', icon: 'text-red-400' },
  warning: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-400', icon: 'text-amber-400' },
  info: { bg: 'bg-[#10B981]', hover: 'hover:bg-[#10B981]/80', text: 'text-[#10B981]', icon: 'text-[#10B981]' },
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  const v = VARIANTS[variant]

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`size-14 rounded-full bg-white/5 flex items-center justify-center mb-4`}>
          <AlertTriangle className={`size-7 ${v.icon}`} />
        </div>
        <h3 className="font-serif text-xl text-white mb-2">{title}</h3>
        {description && <p className="text-white/50 text-sm mb-6 max-w-sm">{description}</p>}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl ${v.bg} ${v.hover} text-white transition-colors text-sm font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}