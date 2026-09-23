'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { WhatsAppButton } from './WhatsAppButton'

export function FloatingNav() {
  const router = useRouter()
  const pathname = usePathname()
  const backPressesRef = useRef(0)

  // Sistema anti-salida: en el home, atrapar el botón "atrás" 3 veces
  useEffect(() => {
    const isHome = pathname === '/'

    if (!isHome) {
      backPressesRef.current = 0
      return
    }

    if (typeof window !== 'undefined') {
      window.history.pushState({ trap: true }, '', window.location.href)
    }

    function handlePopState() {
      if (typeof window !== 'undefined') {
        window.history.pushState({ trap: true }, '', window.location.href)
      }

      backPressesRef.current += 1

      if (backPressesRef.current < 3) {
        showWarning()
      } else {
        backPressesRef.current = 0
        if (typeof window !== 'undefined') {
          window.history.back()
          window.history.back()
          window.history.back()
        }
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname])

  function showWarning() {
    const existing = document.getElementById('leave-warning')
    if (existing) existing.remove()

    const el = document.createElement('div')
    el.id = 'leave-warning'
    el.textContent = 'Pulsa atrás de nuevo para salir (3 veces)'
    el.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      color: #f3f0e9;
      padding: 12px 20px;
      border-radius: 10px;
      border: 1px solid rgba(16,183,127,0.5);
      font-size: 12px;
      letter-spacing: 0.05em;
      z-index: 9999;
      box-shadow: 0 0 20px rgba(16,183,127,0.4);
      animation: fadeInOut 2s ease;
    `

    if (!document.getElementById('leave-warning-style')) {
      const style = document.createElement('style')
      style.id = 'leave-warning-style'
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }

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