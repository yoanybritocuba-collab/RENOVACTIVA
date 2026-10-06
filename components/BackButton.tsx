'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getPreviousRoute } from '@/lib/usePreviousRoute'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const backPressesRef = useRef(0)
  const lastPressTimeRef = useRef(0)

  useEffect(() => {
    setShow(window.history.length > 1)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname !== '/') {
      backPressesRef.current = 0
      return
    }

    window.history.pushState({ trap: true }, '', window.location.href)

    function handlePopState() {
      if (typeof window === 'undefined') return
      window.history.pushState({ trap: true }, '', window.location.href)
      registerBackPress()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function registerBackPress() {
    const now = Date.now()
    const elapsed = now - lastPressTimeRef.current
    if (elapsed > 2000) backPressesRef.current = 0
    lastPressTimeRef.current = now
    backPressesRef.current += 1

    if (backPressesRef.current >= 3) {
      backPressesRef.current = 0
      if (typeof window !== 'undefined') window.history.go(-3)
      return
    }
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
      z-index: 9999;
      box-shadow: 0 0 25px rgba(16,183,127,0.5);
      animation: fadeInOut 2s ease;
      font-family: Arial, Helvetica, sans-serif;
      pointer-events: none;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }

  function handleBack() {
    if (typeof window === 'undefined') return

    if (pathname === '/') {
      registerBackPress()
      return
    }

    const prev = getPreviousRoute()

    if (prev && prev !== pathname && prev !== '/') {
      router.push(prev)
    } else if (pathname.startsWith('/metodo/')) {
      router.push('/metodo')
    } else if (pathname.startsWith('/reformas-')) {
      router.push('/servicios')
    } else if (prev === '/') {
      router.push('/')
    } else {
      router.push('/')
    }
  }

  if (!show) return null

  return (
    <button
      onClick={handleBack}
      className="fixed bottom-6 right-6 z-50 bg-[#d7bd77] text-[#11110f] p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
      aria-label="Volver atrás"
    >
      <ArrowLeft className="size-5" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
        Volver
      </span>
    </button>
  )
}