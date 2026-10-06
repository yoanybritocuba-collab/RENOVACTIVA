'use client'

import { useTrackRoute } from '@/lib/usePreviousRoute'

export function RouteTracker() {
  useTrackRoute()
  return null
}