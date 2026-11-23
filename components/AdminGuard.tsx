'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldAlert, CheckCircle2, GripHorizontal } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const lastActivityRef = useRef(Date.now())

  // --- LÓGICA DE ARRASTRE DEL RELOJ ---
  const [clockPos, setClockPos] = useState<{x: number | null, y: number | null}>({ x: null, y: null })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const clockRef = useRef<HTMLDivElement>(null)

  // Recuperar posición guardada al cargar
  useEffect(() => {
    const savedPos = localStorage.getItem('adminClockPos')
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos)
        if (parsed.x !== undefined && parsed.y !== undefined) {
          setClockPos(parsed)
        }
      } catch (e) {}
    }
  }, [])

  const startDrag = (clientX: number, clientY: number) => {
    if (!clockRef.current) return
    const rect = clockRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
    setIsDragging(true)
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !clockRef.current) return

    let newX = clientX - dragOffset.current.x
    let newY = clientY - dragOffset.current.y

    // Evitar que se salga de la pantalla
    const rect = clockRef.current.getBoundingClientRect()
    newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width))
    newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height))

    setClockPos({ x: newX, y: newY })
  }

  const endDrag = () => {
    if (isDragging && clockPos.x !== null && clockPos.y !== null) {
      localStorage.setItem('adminClockPos', JSON.stringify(clockPos))
    }
    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
    const onMouseUp = () => endDrag()

    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
      moveDrag(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onTouchEnd = () => endDrag()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging, clockPos])
  // --- FIN DE LA LÓGICA DE ARRASTRE ---

  // Efecto de inactividad (INTACTO)
  useEffect(() => {
    // Solo activo si estamos en el admin (y no en login o seguridad)
    if (pathname === '/admin' || pathname === '/admin/seguridad') {
      setCountdown(null)
      setTimeLeft(0)
      return
    }

    if (typeof window === 'undefined' || localStorage.getItem('adminAuth') !== 'true') {
      setCountdown(null)
      setTimeLeft(0)
      return
    }

    let totalSecs = 900
    let interval: NodeJS.Timeout

    async function startTimer() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.settings&select=content`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          const secs = data[0]?.content?.inactivity_seconds
          if (typeof secs === 'number' && secs > 0) totalSecs = secs
        }
      } catch (e) {}

      // Al entrar, reiniciamos el reloj
      lastActivityRef.current = Date.now()

      const onActivity = () => {
        lastActivityRef.current = Date.now()
        setCountdown(null)
      }
      window.addEventListener('mousemove', onActivity)
      window.addEventListener('keydown', onActivity)
      window.addEventListener('click', onActivity)
      window.addEventListener('scroll', onActivity)

      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000)
        const remaining = totalSecs - elapsed
        setTimeLeft(remaining)

        if (remaining <= 0) {
          localStorage.removeItem('adminAuth')
          setCountdown(null)
          clearInterval(interval)
          router.push('/admin')
        } else if (remaining <= 10) {
          setCountdown(remaining)
        } else {
          setCountdown(null)
        }
      }, 1000)

      return () => {
        window.removeEventListener('mousemove', onActivity)
        window.removeEventListener('keydown', onActivity)
        window.removeEventListener('click', onActivity)
        window.removeEventListener('scroll', onActivity)
      }
    }

    startTimer()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pathname, router])

  // Si no estamos logueados o estamos en login/seguridad, no mostramos el reloj
  const showClock = pathname !== '/admin' && pathname !== '/admin/seguridad' && timeLeft > 0

  return (
    <>
      {/* RELOJ ARRASTRABLE (Abajo y pequeño por defecto) */}
      {showClock && (
        <div
          ref={clockRef}
          style={{
            left: clockPos.x !== null ? clockPos.x : undefined,
            top: clockPos.y !== null ? clockPos.y : undefined,
            touchAction: 'none',
          }}
          className={`fixed z-[9998] flex items-center bg-[#0A0A0A]/90 backdrop-blur-md border border-[#d7bd77]/40 rounded-xl shadow-lg select-none ${
            clockPos.x === null ? 'bottom-3 left-1/2 -translate-x-1/2' : ''
          } ${isDragging ? 'cursor-grabbing shadow-2xl ring-2 ring-[#d7bd77]/50' : 'cursor-grab hover:border-[#d7bd77]'}`}
        >
          {/* ASA DE ARRASTRE */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="absolute inset-0 z-10 rounded-xl"
          />
          
          <div className="pl-2 pr-1 text-[#d7bd77]/50 pointer-events-none">
            <GripHorizontal className="size-4" />
          </div>

          <div className="flex items-center gap-1.5 pr-3 py-1.5 pointer-events-none">
            <Clock className={`size-3.5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#d7bd77]'}`} />
            <span className={`font-mono text-sm font-bold tracking-wider ${timeLeft <= 10 ? 'text-red-500' : 'text-[#d7bd77]'}`}>
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {children}

      {/* CUENTA ATRÁS GIGANTE (Solo cuando quedan 10s) - INTACTA */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center">
            <motion.div key={countdown} initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 1.5 }} className="text-red-500 font-black text-[150px] md:text-[250px] leading-none mb-8">
              {countdown}
            </motion.div>
            <div className="bg-[#111] border border-red-500/50 rounded-2xl p-8 max-w-md w-[90%] text-center">
              <ShieldAlert className="size-12 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">Sesión por cerrarse</h2>
              <p className="text-white/60 mb-8">Cerraremos el panel si no realizas ninguna acción.</p>
              <button onClick={() => { lastActivityRef.current = Date.now(); setCountdown(null) }} className="w-full flex items-center justify-center gap-2 bg-[#10B77F] text-black px-6 py-4 rounded-xl font-bold text-lg">
                <CheckCircle2 className="size-6" /> Permanecer aquí
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}