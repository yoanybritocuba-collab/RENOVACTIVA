'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const KEY = 'renovactiva_prev_route'

export function useTrackRoute() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const prev = sessionStorage.getItem(KEY)
    const current = prev || '/'
    if (current !== pathname) {
      sessionStorage.setItem(KEY, current)
    }
  }, [pathname])
}

export function getPreviousRoute(): string {
  if (typeof window === 'undefined') return '/'
  return sessionStorage.getItem(KEY) || '/'
}

export function clearPreviousRoute() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}