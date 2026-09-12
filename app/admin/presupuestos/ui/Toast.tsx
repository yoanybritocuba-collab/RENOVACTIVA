'use client'

import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose?: () => void
}

const CONFIG = {
  success: { icon: CheckCircle2, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
}

export default function Toast({ type, message, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)
  const config = CONFIG[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border} backdrop-blur-md shadow-2xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Icon className={`size-5 ${config.color} flex-shrink-0`} />
      <span className={`text-sm ${config.color}`}>{message}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onClose?.(), 300)
        }}
        className="p-1 text-white/30 hover:text-white transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}