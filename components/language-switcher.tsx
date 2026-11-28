'use client'

import { useLanguage } from '@/components/language-provider'

type LanguageSwitcherProps = {
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()
  const light = variant === 'light'

  const borderClass = light ? 'border-black/20' : 'border-white/20'
  const inactiveClass = light
    ? 'text-[#141310]/60 hover:text-[#141310]'
    : 'text-white hover:text-[#F5B041]' // <-- CAMBIO: Blanco puro para que se vea bien

  return (
    <div
      className={`flex items-center gap-1 border ${borderClass} p-1 text-[10px] uppercase tracking-[0.16em] rounded`}
      aria-label="Selector de idioma"
    >
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`px-2 py-1 transition-colors rounded ${
          language === 'es'
            ? 'bg-[#F5B041] text-[#07132A]' // <-- CAMBIO: Usamos el nuevo amarillo y texto oscuro
            : inactiveClass
        }`}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ca')}
        className={`px-2 py-1 transition-colors rounded ${
          language === 'ca'
            ? 'bg-[#F5B041] text-[#07132A]' // <-- CAMBIO: Usamos el nuevo amarillo y texto oscuro
            : inactiveClass
        }`}
      >
        CA
      </button>
    </div>
  )
}