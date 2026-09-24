'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { WhatsAppButton } from './WhatsAppButton'

export function FloatingNav() {
  const router = useRouter()

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  function goHome() {
    router.push('/')
  }

  return (
    <div className="fixed bottom-5 left-5 z-[90] flex flex-col gap-2.5 items-start">
      {/* Botón Volver (arriba) */}
      <button
        onClick={goBack}
        aria-label="Volver atrás"
        title="Volver"
        className="group flex items-center justify-center size-10 rounded-full border border-[#10B77F]/40 bg-black/70 backdrop-blur-md text-white/80 hover:text-white hover:border-[#10B77F] hover:bg-[#10B77F]/20 hover:shadow-[0_0_20px_rgba(16,183,127,0.5)] transition-all duration-300 shadow-lg"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>

      {/* Botón Home (medio) */}
      <button
        onClick={goHome}
        aria-label="Ir al inicio"
        title="Inicio"
        className="group flex items-center justify-center size-10 rounded-full border border-[#d7bd77]/40 bg-black/70 backdrop-blur-md text-white/80 hover:text-white hover:border-[#d7bd77] hover:bg-[#d7bd77]/20 hover:shadow-[0_0_20px_rgba(215,189,119,0.5)] transition-all duration-300 shadow-lg"
      >
        <Home className="size-4 transition-transform duration-300 group-hover:scale-110" />
      </button>

      {/* Botón WhatsApp (abajo) con efecto radar */}
      <WhatsAppButton />
    </div>
  )
}