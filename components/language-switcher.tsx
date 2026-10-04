'use client'

import { useLanguage } from '@/components/language-provider'

type LanguageSwitcherProps = {
  // 'dark'  = para fondos oscuros (letras blancas) — es el comportamiento de siempre
  // 'light' = para fondos blancos (letras oscuras) — lo usa la cabecera blanca
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()
  const light = variant === 'light'

  const borderClass = light ? 'border-black/20' : 'border-white/15'
  const inactiveClass = light
    ? 'text-[#141310]/60 hover:text-[#141310]'
    : 'text-white/55 hover:text-white'

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
            ? 'bg-[#d7bd77] text-[#141310]'
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
            ? 'bg-[#d7bd77] text-[#141310]'
            : inactiveClass
        }`}
      >
        CA
      </button>
    </div>
  )
}
