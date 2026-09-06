'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BackButton() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(window.history.length > 1)
  }, [])

  if (!show) return null

  return (
    <button
      onClick={() => router.back()}
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