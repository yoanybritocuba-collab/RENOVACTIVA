'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { WhatsAppButton } from './WhatsAppButton'

export function FloatingNav() {
  const router = useRouter()
  const pathname = usePathname()
  const backPressesRef = useRef(0)
  const lastPressTimeRef = useRef(0)

  // ============================================================
  // Sistema anti-salida: 3 pulsaciones para salir (con reset)
  // ============================================================
  useEffect(() => {
    const isHome = pathname === '/'
    if (!isHome) {
      backPressesRef.current = 0
      return
    }

    // Interceptar el botón "atrás" del navegador / móvil
    if (typeof window !== 'undefined') {
      window.history.pushState({ trap: true }, '', window.location.href)
    }

    function handlePopState() {
      // Volvemos a empujar estado para que no salga
      if (typeof window !== 'undefined') {
        window.history.pushState({ trap: true }, '', window.location.href)
      }

      handleBackPress()
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ============================================================
  // Lógica central del contador
  // ============================================================
  function handleBackPress() {
    const now = Date.now()
    const elapsed = now - lastPressTimeRef.current

    // Si han pasado más de 2 segundos, resetear contador
    if (elapsed > 2000) {
      backPressesRef.current = 0
    }

    lastPressTimeRef.current = now
    backPressesRef.current += 1

    // Si llegamos a 3 pulsaciones → salir de verdad
    if (backPressesRef.current >= 3) {
      backPressesRef.current = 0
      // Salir de la web (volver al histórico real)
      if (typeof window !== 'undefined') {
        window.history.go(-3)
      }
      return
    }

    // Si no, mostrar aviso
    showWarning(backPressesRef.current)
  }

  function showWarning(count: number) {
    const existing = document.getElementById('leave-warning')
    if (existing) existing.remove()

    const remaining = 3 - count
    const el = document.createElement('div')
    el.id = 'leave-warning'
    el.textContent = remaining === 1
      ? 'Pulsa una vez más para salir'
      : `Pulsa atrás ${remaining} veces más para salir`
    el.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(10px);
      color: #f3f0e9;
      padding: 14px 22px;
      border-radius: 10px;
      border: 1px solid rgba(16,183,127,0.6);
      font-size: 13px;
      letter-spacing: 0.03em;
      z-index: 9999;
      box-shadow: 0 0 25px rgba(16,183,127,0.5);
      animation: fadeInOut 2s ease;
      font-family: Arial, Helvetica, sans-serif;
      pointer-events: none;
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

  // ============================================================
  // Botón Volver (flotante)
  // ============================================================
  function goBack() {
    // Si NO estamos en la home → comportamiento normal (volver)
    if (pathname !== '/') {
      router.back()
      return
    }

    // Si estamos en la home → aplicar lógica de 3 pulsaciones
    handleBackPress()
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