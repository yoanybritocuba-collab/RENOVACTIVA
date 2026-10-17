'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const lastActivityRef = useRef(Date.now())

  // Efecto de inactividad
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
      {/* RELOJ FIJO ARRIBA A LA DERECHA */}
      {showClock && (
        <div className="fixed top-4 right-4 z-[9998] flex items-center gap-2 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#d7bd77]/40 px-4 py-2 rounded-xl shadow-lg">
          <Clock className={`size-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#d7bd77]'}`} />
          <span className={`font-mono text-lg font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-[#d7bd77]'}`}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {children}

      {/* CUENTA ATRÁS GIGANTE (Solo cuando quedan 10s) */}
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